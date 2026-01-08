
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
        // STRICT COLUMN SELECTION: Exclude heavy JSONB fields AND audio_url (Lazy Load) - Added metadata for temporal features
        const columns = 'id, title, date, duration, duration_seconds, status, tags, participants, folder_id, created_at, metadata'; // Removed audio_url

        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        console.log(`[databaseService] Loading metadata for user ${userId} (Page ${page}, Limit ${pageSize})`);

        const { data: recordingsData, error } = await supabase
            .from('recordings')
            .select(columns)
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .range(from, to);

        if (error) {
            logger.error('Error fetching full recordings', { error, userId });
            console.log('[databaseService] ⚠️ Falling back to EMERGENCY MODE (minimal data)');

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

            console.log(`[databaseService] ✅ Loaded ${minimalData?.length || 0} recordings in EMERGENCY MODE`);
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

        console.log(`[databaseService] ✅ Loaded ${recordingsData?.length || 0} recordings successfully (Full Mode - Lightweight)`);
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
            summary: undefined,
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
            console.error('Error fetching segments:', error);
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

        console.log(`[databaseService] Searching for "${searchQuery}" (normalized: "${normalizedQuery}") for user ${userId}`);

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

        console.log(`[databaseService] Found ${filtered.length} matching recordings`);

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
                metadata: rec.metadata || {} // Store metadata
            })
            .select()
            .single();

        if (error || !data) {
            logger.error('Error creating recording', { error, title: rec.title }, user.id);
            return null;
        }

        const newId = data.id;

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
        if (updates.segments !== undefined) dbUpdates.segments = updates.segments;
        if (updates.summary !== undefined) dbUpdates.summary = updates.summary;
        if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
        if (updates.duration !== undefined) dbUpdates.duration = updates.duration;
        if (updates.durationSeconds !== undefined) dbUpdates.duration_seconds = updates.durationSeconds;
        if (updates.metadata !== undefined) dbUpdates.metadata = updates.metadata;

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
        const updates: any = { segments };
        if (summary) updates.summary = summary;

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
        const { error } = await supabase
            .from('recordings')
            .delete()
            .eq('id', id); // Cascade deletes notes/media

        if (error) {
            console.error('Error deleting recording:', error);
            return false;
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
            .select('minutes_used, minutes_limit')
            .eq('id', userId)
            .single();

        if (error || !data) {
            console.error('Error checking limits:', error);
            return { allowed: false, message: 'Error verifying account limits.' };
        }

        if ((data.minutes_used || 0) >= (data.minutes_limit || 0)) {
            return { allowed: false, message: 'You have reached your monthly limit. Please upgrade your plan.' };
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

    // --- USER PROFILE ---

    async updateUserProfile(userId: string, updates: Partial<import('../types').UserProfile>): Promise<boolean> {
        const dbUpdates: any = {};

        if (updates.firstName !== undefined) dbUpdates.first_name = updates.firstName;
        if (updates.lastName !== undefined) dbUpdates.last_name = updates.lastName;
        if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
        if (updates.phoneVerified !== undefined) dbUpdates.phone_verified = updates.phoneVerified;
        if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl;
        if (updates.timezone !== undefined) dbUpdates.timezone = updates.timezone;
        if (updates.transcriptionLanguage !== undefined) dbUpdates.transcription_language = updates.transcriptionLanguage;
        if (updates.notificationSettings !== undefined) dbUpdates.notification_settings = updates.notificationSettings;
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
    }
};
