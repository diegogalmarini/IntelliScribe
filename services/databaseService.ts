
import { supabase } from '../lib/supabase';
import { Recording, Folder, NoteItem, MediaItem } from '../types';
import { logger } from './loggingService';

// --- DB TYPES (Matching SQL Schema) ---
interface DBRecording {
    id: string;
    user_id: string;
    folder_id: string | null;
    title: string;
    description: string;
    date: string;
    duration: string;
    duration_seconds: number;
    status: string;
    tags: string[];
    participants: number;
    audio_url: string | null;
    summary: string | null;
    segments: any; // JSONB
    notes: any; // JSONB
    media: any; // JSONB
    created_at: string;
}

interface DBFolder {
    id: string;
    user_id: string;
    name: string;
    type: 'system' | 'user';
    icon: string;
    created_at: string;
}

interface DBNote {
    id: string;
    recording_id: string;
    timestamp: string;
    content: string;
    created_at: string;
}

interface DBMedia {
    id: string;
    recording_id: string;
    timestamp: string;
    url: string;
    name: string;
    created_at: string;
}

// --- SERVICE ---

export const databaseService = {

    // --- FOLDERS ---

    async getFolders(userId: string): Promise<Folder[]> {
        const { data, error } = await supabase
            .from('folders')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: true });

        if (error) {
            logger.error('Error fetching folders', { error, userId });
            return [];
        }

        return data.map((f: DBFolder) => ({
            id: f.id,
            name: f.name,
            type: f.type, // Map from DB
            icon: f.icon,
            color: '#3b82f6',
            createdAt: f.created_at,
            updatedAt: f.created_at
        }));
    },

    async createFolder(name: string): Promise<Folder | null> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data, error } = await supabase
            .from('folders')
            .insert({
                user_id: user.id,
                name: name,
                type: 'user',
                icon: 'folder'
            })
            .select()
            .single();

        if (error) {
            logger.error('Error creating folder', { error, name }, user.id);
            return null;
        }

        return {
            id: data.id,
            name: data.name,
            type: 'user',
            icon: data.icon,
            color: '#3b82f6',
            createdAt: data.created_at,
            updatedAt: data.created_at
        };
    },

    async renameFolder(id: string, name: string): Promise<{ success: boolean; error?: any }> {
        const { error } = await supabase
            .from('folders')
            .update({ name }) // Removed updated_at to fix schema error
            .eq('id', id);

        if (error) {
            console.error('Error renaming folder:', error);
            return { success: false, error };
        }
        return { success: true };
    },

    async deleteFolder(id: string): Promise<boolean> {
        const { error } = await supabase
            .from('folders')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting folder:', error);
            return false;
        }
        return true;
    },

    // --- RECORDINGS ---

    async getRecordings(userId: string, page: number = 1, pageSize: number = 50): Promise<Recording[]> {
        // FULL QUERY - Índices confirmados en Supabase ✅
        // STRICT COLUMN SELECTION: Exclude heavy JSONB fields (Lazy Load) - Added metadata and summary
        const columns = 'id, title, date, duration, duration_seconds, status, tags, participants, folder_id, created_at, metadata, summary, audio_url';

        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        const { data: recordingsData, error } = await supabase
            .from('recordings')
            .select(columns)
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .range(from, to);

        if (error) {
            logger.error('Error fetching full recordings', { error, userId });
            logger.warn('[databaseService] ⚠️ Falling back to EMERGENCY MODE (minimal data)');

            // Fallback: Try minimal query
            const { data: minimalData, error: minimalError } = await supabase
                .from('recordings')
                .select('id, title, created_at, status')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(10);

            if (minimalError) {
                logger.error('CRITICAL: Even minimal query failed', { minimalError, userId });
                return [];
            }

            logger.warn(`[databaseService] ✅ Loaded ${minimalData?.length || 0} recordings in EMERGENCY MODE`);
            return (minimalData || []).map((r: any) => ({
                id: r.id,
                title: r.title,
                description: '',
                date: r.created_at, // Use raw ISO string
                duration: '00:00:00',
                durationSeconds: 0,
                status: r.status,
                tags: [],
                participants: 1,
                audioUrl: undefined,
                folderId: undefined,
                segments: [],
                notes: [],
                media: [],
                summary: undefined,
                created_at: r.created_at,
                metadata: undefined // Fallback has no metadata
            }));
        }

        logger.info(`[databaseService] ✅ Loaded ${recordingsData?.length || 0} recordings successfully (Full Mode - Lightweight)`);
        return (recordingsData || []).map((r: any) => ({
            id: r.id,
            title: r.title,
            description: r.description || '',
            date: r.date || r.created_at, // Use raw ISO string
            duration: r.duration || '00:00:00',
            durationSeconds: r.duration_seconds || 0,
            status: r.status as any,
            tags: r.tags || [],
            participants: r.participants || 1,
            audioUrl: undefined, // Lazy load this
            folderId: r.folder_id || undefined,
            // Heavy fields are omitted for performance in the list view
            segments: [],
            notes: [],
            media: [],
            summary: r.summary || undefined,
            metadata: r.metadata // Pass through metadata
        }));
    },

    async getRecordingsSegments(ids: string[]): Promise<Map<string, any[]>> {
        if (!ids.length) return new Map();

        const { data, error } = await supabase
            .from('recordings')
            .select('id, segments')
            .in('id', ids);

        if (error) {
            logger.error('Error fetching segments:', { error, ids });
            return new Map();
        }

        const map = new Map();
        data?.forEach((r: any) => {
            map.set(r.id, r.segments || []);
        });
        return map;
    },

    async searchRecordings(userId: string, searchQuery: string, page: number = 1, pageSize: number = 50): Promise<Recording[]> {
        if (!searchQuery || !searchQuery.trim()) {
            return this.getRecordings(userId, page, pageSize);
        }

        const normalizedQuery = searchQuery
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, ''); // Remove accents

        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        logger.info(`[databaseService] Searching for "${searchQuery}" (normalized: "${normalizedQuery}") for user ${userId}`);

        // For Supabase/PostgreSQL, we'll use the textSearch operator or ilike for partial matching
        // Since we need to search inside JSONB (segments), we'll fetch full data and do filtering
        // Note: For production, consider creating a dedicated search_text column with GIN index

        const { data: recordingsData, error } = await supabase
            .from('recordings')
            .select('id, title, description, date, duration, duration_seconds, status, tags, participants, folder_id, summary, segments, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .range(from, to);

        if (error) {
            logger.error('Error searching recordings', { error, userId, searchQuery });
            return [];
        }

        // Client-side filtering for now (segments JSONB search)
        // TODO: Optimize with PostgreSQL full-text search or search_text column
        const filtered = (recordingsData || []).filter((r: any) => {
            // Normalize and search in title
            const titleMatch = r.title &&
                r.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(normalizedQuery);

            // Normalize and search in summary
            const summaryMatch = r.summary &&
                r.summary.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(normalizedQuery);

            // Search in segments
            const segmentsMatch = r.segments && Array.isArray(r.segments) &&
                r.segments.some((segment: any) =>
                    segment.text &&
                    segment.text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(normalizedQuery)
                );

            return titleMatch || summaryMatch || segmentsMatch;
        });

        logger.info(`[databaseService] Found ${filtered.length} matching recordings`);

        return filtered.map((r: any) => ({
            id: r.id,
            title: r.title,
            description: r.description || '',
            date: r.date || r.created_at, // Use raw ISO string
            duration: r.duration || '00:00:00',
            durationSeconds: r.duration_seconds || 0,
            status: r.status as any,
            tags: r.tags || [],
            participants: r.participants || 1,
            audioUrl: undefined, // Lazy load
            folderId: r.folder_id || undefined,
            summary: r.summary || undefined,
            segments: r.segments || [], // Include segments in search results
            notes: [],
            media: []
        }));
    },

    async getRecordingDetails(id: string): Promise<Recording | null> {
        const { data: r, error } = await supabase
            .from('recordings')
            .select('id, title, description, date, duration, duration_seconds, status, tags, participants, audio_url, summary, segments, folder_id, notes, media, created_at, metadata')
            .eq('id', id)
            .single();

        if (error) {
            // PGRST116: JSON object requested, multiple (or no) rows returned
            // 406 Not Acceptable: No rows found for .single()
            if (error.code === 'PGRST116' || error.message?.includes('406')) {
                console.warn('[databaseService] Recording not found (406/PGRST116)', id);
                return null;
            }
            logger.error('Error fetching recording details', { error, id });
            return null;
        }

        if (!r) return null;

        return {
            id: r.id,
            title: r.title,
            description: r.description || '',
            date: r.date || r.created_at, // Use raw ISO string
            duration: r.duration || '00:00:00',
            durationSeconds: r.duration_seconds || 0,
            status: r.status as any,
            tags: r.tags || [],
            participants: r.participants || 1,
            audioUrl: r.audio_url || undefined,
            summary: r.summary || undefined,
            segments: r.segments || [],
            folderId: r.folder_id || undefined,
            notes: r.notes || [],
            media: r.media || [],
            metadata: r.metadata // Pass through metadata
        };
    },

    async createRecording(rec: Recording): Promise<Recording | null> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        // 1. Insert Recording
        const { data, error } = await supabase
            .from('recordings')
            .insert({
                user_id: user.id,
                folder_id: rec.folderId || null,
                title: rec.title,
                description: rec.description,
                date: rec.date,
                duration: rec.duration,
                duration_seconds: rec.durationSeconds,
                status: rec.status,
                tags: rec.tags,
                participants: rec.participants,
                audio_url: rec.audioUrl,
                summary: rec.summary,
                segments: rec.segments,
                notes: rec.notes || [],
                media: rec.media || [],
                metadata: rec.metadata || {} // Store metadata (includes audioFileSize)
            })
            .select()
            .single();

        if (error || !data) {
            logger.error('Error creating recording', { error, title: rec.title }, user.id);
            return null;
        }

        const newId = data.id;

        // Increment storage if audio file size is known
        if (rec.metadata?.audioFileSize) {
            await this.incrementStorage(user.id, rec.metadata.audioFileSize);
        }

        // Notes and Media are now stored as JSONB in the recordings table
        // No need for separate inserts

        // Return the confirmed object (re-using input structure but with real ID)
        return {
            ...rec,
            id: newId
        };
    },

    async updateRecording(id: string, updates: Partial<Recording>): Promise<boolean> {
        // Map frontend fields to DB fields
        const dbUpdates: any = {};
        if (updates.title !== undefined) dbUpdates.title = updates.title;
        if (updates.description !== undefined) dbUpdates.description = updates.description;
        if (updates.folderId !== undefined) dbUpdates.folder_id = updates.folderId;
        if (updates.status !== undefined) dbUpdates.status = updates.status;
        if (updates.segments !== undefined) {
            dbUpdates.segments = updates.segments;
            // Auto-extract unique speakers and store in metadata for SupportBot context
            const speakers = Array.from(new Set((updates.segments as any[]).map(s => s.speaker).filter(Boolean)));
            if (speakers.length > 0) {
                dbUpdates.metadata = {
                    ...(updates.metadata || {}),
                    speakers
                };
            }
        }
        if (updates.summary !== undefined) dbUpdates.summary = updates.summary;
        if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
        if (updates.duration !== undefined) dbUpdates.duration = updates.duration;
        if (updates.durationSeconds !== undefined) dbUpdates.duration_seconds = updates.durationSeconds;
        if (updates.metadata !== undefined && !dbUpdates.metadata) dbUpdates.metadata = updates.metadata;
        else if (updates.metadata !== undefined && dbUpdates.metadata) {
            dbUpdates.metadata = { ...updates.metadata, ...dbUpdates.metadata };
        }

        // Note: Updating notes/media is more complex (diffing), usually handled separately.
        // For simple renames/moves, this is enough. 
        // If the editor saves notes, we typically delete all and re-insert or strict CRUD.
        // For MVP Phase 2, let's assume notes/media are static AFTER creation or we implement specific methods.

        const { error } = await supabase
            .from('recordings')
            .update(dbUpdates)
            .eq('id', id);

        if (error) {
            console.error('Error updating recording:', error);
            return false;
        }
        return true;
    },

    async saveTransription(id: string, segments: any[], summary?: string): Promise<boolean> {
        const metadata: any = {};
        const speakers = Array.from(new Set(segments.map(s => s.speaker).filter(Boolean)));
        if (speakers.length > 0) {
            metadata.speakers = speakers;
        }

        const updates: any = { segments };
        if (summary) updates.summary = summary;
        if (speakers.length > 0) updates.metadata = metadata;

        const { error } = await supabase
            .from('recordings')
            .update(updates)
            .eq('id', id);

        if (error) {
            console.error('Error saving transcription:', error);
            return false;
        }
        return true;
    },

    async deleteRecording(id: string): Promise<boolean> {
        // Get recording metadata to retrieve file size before deleting
        const { data: recording } = await supabase
            .from('recordings')
            .select('user_id, metadata')
            .eq('id', id)
            .single();

        const { error } = await supabase
            .from('recordings')
            .delete()
            .eq('id', id); // Cascade deletes notes/media

        if (error) {
            console.error('Error deleting recording:', error);
            return false;
        }

        // Decrement storage if file size was tracked
        if (recording?.metadata?.audioFileSize && recording.user_id) {
            await this.decrementStorage(recording.user_id, recording.metadata.audioFileSize);
        }

        return true;
    },

    async moveRecording(id: string, folderId: string | null): Promise<boolean> {
        const { error } = await supabase
            .from('recordings')
            .update({ folder_id: folderId })
            .eq('id', id);

        if (error) {
            console.error('Error moving recording:', error);
            return false;
        }
        return true;
    },

    // --- USAGE & LIMITS ---

    async checkUsageLimit(userId: string): Promise<{ allowed: boolean; message?: string }> {
        const { data, error } = await supabase
            .from('profiles')
            .select('minutes_used, minutes_limit, subscription_status, trial_ends_at')
            .eq('id', userId)
            .single();

        if (error || !data) {
            console.error('Error checking limits:', error);
            return { allowed: false, message: 'Error verifying account limits.' };
        }

        // Check if account is paused/banned
        // If there's an active manual trial, it overrides the subscription_status for access
        const isTrialActive = data.trial_ends_at && new Date(data.trial_ends_at) > new Date();

        if (data.subscription_status !== 'active' && !isTrialActive) {
            return { allowed: false, message: 'Your account is paused. Please update your payment method.' };
        }

        if ((data.minutes_used || 0) >= (data.minutes_limit || 0)) {
            return { allowed: false, message: 'You have reached your monthly limit. Please upgrade your plan.' };
        }

        return { allowed: true };
    },

    /**
     * Check if user has storage quota available
     * @param userId - User ID
     * @param fileSize - Size of file to upload in bytes
     * @returns allowed boolean and optional message
     */
    async checkStorageLimit(userId: string, fileSize: number): Promise<{ allowed: boolean; message?: string }> {
        const { data, error } = await supabase
            .from('profiles')
            .select('storage_used, storage_limit, plan_id')
            .eq('id', userId)
            .single();

        if (error || !data) {
            console.error('Error checking storage limits:', error);
            return { allowed: false, message: 'Error verifying storage limits.' };
        }

        // Free plan doesn't have storage limit (uses 7-day retention)
        if (data.plan_id === 'free') {
            return { allowed: true };
        }

        const currentUsage = data.storage_used || 0;
        const limit = data.storage_limit || 0;

        if (limit === 0) {
            return { allowed: true }; // No limit set
        }

        const wouldExceed = (currentUsage + fileSize) > limit;

        if (wouldExceed) {
            const usedGB = (currentUsage / 1073741824).toFixed(2);
            const limitGB = (limit / 1073741824).toFixed(2);
            return {
                allowed: false,
                message: `Storage limit reached (${usedGB}/${limitGB} GB). Please delete old recordings or upgrade your plan.`
            };
        }

        return { allowed: true };
    },

    async incrementUsage(userId: string, seconds: number): Promise<boolean> {
        // Round up to the nearest minute to protect margin (minimum 1 minute charge)
        const minutes = Math.max(1, Math.ceil(seconds / 60));

        // 1. Get current usage
        const { data: profile } = await supabase
            .from('profiles')
            .select('minutes_used')
            .eq('id', userId)
            .single();

        if (!profile) return false;

        const newUsage = (profile.minutes_used || 0) + minutes;

        // 2. Update usage
        const { error } = await supabase
            .from('profiles')
            .update({ minutes_used: newUsage })
            .eq('id', userId);

        if (error) {
            console.error('Error updating usage:', error);
            return false;
        }
        return true;
    },

    /**
     * Decrement user's minutes_used when deleting recording
     * Ensures value never goes below 0
     */
    async decrementUsage(userId: string, seconds: number): Promise<boolean> {
        // Round up to the nearest minute (same rounding as increment)
        const minutes = Math.max(1, Math.ceil(seconds / 60));

        // 1. Get current usage
        const { data: profile } = await supabase
            .from('profiles')
            .select('minutes_used')
            .eq('id', userId)
            .single();

        if (!profile) return false;

        // 2. Decrement usage (never below 0)
        const newUsage = Math.max(0, (profile.minutes_used || 0) - minutes);

        const { error } = await supabase
            .from('profiles')
            .update({ minutes_used: newUsage })
            .eq('id', userId);

        if (error) {
            logger.error('Error decrementing usage', { userId, minutes, error: error.message });
            return false;
        }

        return true;
    },

    /**
     * Increment user's storage_used when uploading audio
     * Storage is cumulative and does NOT reset monthly
     */
    async incrementStorage(userId: string, fileSize: number): Promise<boolean> {
        const { data: profile } = await supabase
            .from('profiles')
            .select('storage_used')
            .eq('id', userId)
            .single();

        if (!profile) return false;

        const newStorage = (profile.storage_used || 0) + fileSize;

        const { error } = await supabase
            .from('profiles')
            .update({ storage_used: newStorage })
            .eq('id', userId);

        if (error) {
            console.error('Error incrementing storage:', error);
            return false;
        }

        return true;
    },

    /**
     * Decrement user's storage_used when deleting recording
     * Frees up storage space for new uploads
     */
    async decrementStorage(userId: string, fileSize: number): Promise<boolean> {
        const { data: profile } = await supabase
            .from('profiles')
            .select('storage_used')
            .eq('id', userId)
            .single();

        if (!profile) return false;

        // Never go below 0
        const newStorage = Math.max(0, (profile.storage_used || 0) - fileSize);

        const { error } = await supabase
            .from('profiles')
            .update({ storage_used: newStorage })
            .eq('id', userId);

        if (error) {
            console.error('Error decrementing storage:', error);
            return false;
        }

        return true;
    },

    /**
     * Calculate total size of all Base64 attachments for a user
     */
    async calculateAttachmentsUsage(userId: string): Promise<number> {
        const { data, error } = await supabase
            .from('recordings')
            .select('media')
            .eq('user_id', userId);

        if (error || !data) return 0;

        let totalSize = 0;
        data.forEach(rec => {
            const media = rec.media as any[];
            if (media && Array.isArray(media)) {
                media.forEach(item => {
                    if (item.size) {
                        totalSize += item.size;
                    } else if (item.url && item.url.startsWith('data:')) {
                        // Rough estimate for Base64: length * 0.75
                        totalSize += Math.round(item.url.length * 0.75);
                    }
                });
            }
        });

        return totalSize;
    },

    /**
     * Audit and Sync total storage usage (Bucket Files + DB Attachments)
     */
    async syncStorageUsage(userId: string): Promise<number> {
        try {
            console.log(`[Database] Starting storage sync for user ${userId}...`);

            // 1. Get size from attachments in DB
            const dbSize = await this.calculateAttachmentsUsage(userId);

            // 2. Get size from files in Supabase Storage
            const { getUserBucketUsage } = await import('./storageService');
            const bucketSize = await getUserBucketUsage(userId);

            const totalSize = dbSize + bucketSize;

            // 3. Update profile
            const { error } = await supabase
                .from('profiles')
                .update({ storage_used: totalSize })
                .eq('id', userId);

            if (error) throw error;

            console.log(`[Database] Storage sync complete: ${totalSize} bytes`);
            return totalSize;
        } catch (err) {
            console.error('[Database] Failed to sync storage:', err);
            return 0;
        }
    },

    // --- USER PROFILE ---

    async updateUserProfile(userId: string, updates: Partial<import('../types').UserProfile>): Promise<boolean> {
        const dbUpdates: any = {};

        if (updates.firstName !== undefined) dbUpdates.first_name = updates.firstName;
        if (updates.lastName !== undefined) dbUpdates.last_name = updates.lastName;
        if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
        if (updates.phoneVerified !== undefined) dbUpdates.phone_verified = updates.phoneVerified;
        if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl;
        if (updates.timezone !== undefined) dbUpdates.timezone = updates.timezone;
        if (updates.language !== undefined) dbUpdates.language = updates.language; // Display language persistence
        if (updates.transcriptionLanguage !== undefined) dbUpdates.transcription_language = updates.transcriptionLanguage;
        if (updates.notificationSettings !== undefined) dbUpdates.notification_settings = updates.notificationSettings;
        if (updates.activeSupportAgentId !== undefined) dbUpdates.active_agent_id = updates.activeSupportAgentId;
        if (updates.hasCompletedTour !== undefined) dbUpdates.has_completed_tour = updates.hasCompletedTour;
        if (updates.subscription?.planId !== undefined) dbUpdates.plan_id = updates.subscription.planId;

        if (Object.keys(dbUpdates).length === 0) return true;

        console.log(`[Database] Updating user profile for ${userId}:`, dbUpdates);

        const { error } = await supabase
            .from('profiles')
            .update(dbUpdates)
            .eq('id', userId);

        if (error) {
            console.error('Error updating user profile:', error);
            return false;
        }
        console.log(`[Database] User profile updated successfully for ${userId}`);
        return true;
    },

    // --- SEMANTIC SEARCH (Phase 4) ---

    /**
     * Generates and saves an embedding for a recording to enable semantic search
     */
    async syncRecordingEmbedding(recordingId: string): Promise<boolean> {
        try {
            const { generateTextEmbedding } = await import('./geminiService');

            // 1. Get recording details
            const recording = await this.getRecordingDetails(recordingId);
            if (!recording) return false;

            // 2. Prepare text for embedding (priority: summary > transcript)
            const textToEmbed = recording.summary ||
                recording.segments?.map(s => s.text).join(' ').substring(0, 5000) ||
                recording.title;

            if (!textToEmbed) return false;

            // 3. Generate embedding
            const embedding = await generateTextEmbedding(textToEmbed);
            if (!embedding || embedding.length === 0) return false;

            // 4. Save to recording_embeddings
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return false;

            // Check if recording belongs to user (Security)
            const { data: ownerCheck } = await supabase
                .from('recordings')
                .select('user_id')
                .eq('id', recordingId)
                .single();

            if (ownerCheck?.user_id !== user.id) {
                logger.error('Attempted to sync embedding for recording not owned by user', { recordingId, userId: user.id });
                return false;
            }

            const { error } = await supabase
                .from('recording_embeddings')
                .upsert({
                    recording_id: recordingId,
                    user_id: user.id,
                    content: textToEmbed.substring(0, 2000), // Snippet for debugging
                    embedding: embedding
                }, { onConflict: 'recording_id' });

            if (error) {
                logger.error('Error saving embedding to database', { error, recordingId });
                return false;
            }

            console.log(`[Database] Semantic embedding synced for recording ${recordingId}`);
            return true;
        } catch (err) {
            logger.error('Critical failure in syncRecordingEmbedding', { err, recordingId });
            return false;
        }
    },

    /**
     * Triggers the backend RAG synchronization for a recording.
     * This splits the transcript into chunks and generates embeddings.
     */
    async syncRAG(recordingId: string, transcript: string): Promise<boolean> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return false;

            const response = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'sync-rag',
                    payload: {
                        recordingId,
                        transcript,
                        userId: user.id
                    }
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('[Database] RAG Sync failed:', errorData.error);
                return false;
            }

            console.log(`[Database] RAG synchronized for recording ${recordingId}`);
            return true;
        } catch (error) {
            console.error('[Database] RAG Sync error:', error);
            return false;
        }
    },

    /**
     * Performs a semantic search across the entire user library.
     * Searches within recording chunks (RAG) to find conceptual matches.
     */
    async semanticLibrarySearch(query: string, matchThreshold: number = 0.3, matchCount: number = 10): Promise<any[]> {
        try {
            const { generateTextEmbedding } = await import('./geminiService');
            const queryEmbedding = await generateTextEmbedding(query);
            if (!queryEmbedding || queryEmbedding.length === 0) return [];

            // Call match_recording_chunks RPC
            const { data, error } = await supabase.rpc('match_recording_chunks', {
                query_embedding: queryEmbedding,
                match_threshold: matchThreshold,
                match_count: matchCount
                // filter_recording_ids is null by default, searching all
            });

            if (error) {
                console.error('[Database] Semantic library search failed:', error);
                return [];
            }

            // Group by recording_id and take best match per recording for dashboard view
            const uniqueResults = data.reduce((acc: any[], current: any) => {
                const x = acc.find(item => item.recording_id === current.recording_id);
                if (!x) return acc.concat([current]);
                return acc;
            }, []);

            return uniqueResults;
        } catch (error) {
            console.error('[Database] Semantic search error:', error);
            return [];
        }
    },

    /**
     * Performs semantic search using pgvector similarity
     */
    async semanticSearchRecordings(query: string, matchThreshold: number = 0.4, matchCount: number = 5): Promise<any[]> {
        try {
            const { generateTextEmbedding } = await import('./geminiService');

            // 1. Generate embedding for query
            const queryEmbedding = await generateTextEmbedding(query);
            if (!queryEmbedding || queryEmbedding.length === 0) return [];

            // 2. Get current user
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return [];

            // 3. Call match_recordings RPC in Supabase
            const { data, error } = await supabase.rpc('match_recordings', {
                query_embedding: queryEmbedding,
                match_threshold: matchThreshold,
                match_count: matchCount,
                p_user_id: user.id
            });

            if (error) {
                logger.error('Error in match_recordings RPC execution', { error, query });
                return [];
            }

            logger.info(`[Database] Semantic search found ${data?.length || 0} matches for: "${query}"`);
            return data || [];
        } catch (err) {
            logger.error('Critical failure in semanticSearchRecordings', { err, query });
            return [];
        }
    }
};
