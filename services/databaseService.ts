
import { supabase } from '../lib/supabase';
import { Recording, Folder, NoteItem, MediaItem } from '../types';

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

    async getFolders(): Promise<Folder[]> {
        const { data, error } = await supabase
            .from('folders')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching folders:', error);
            return [];
        }

        return data.map((f: DBFolder) => ({
            id: f.id,
            name: f.name,
            type: f.type,
            icon: f.icon
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
            console.error('Error creating folder:', error);
            return null;
        }

        return {
            id: data.id,
            name: data.name,
            type: data.type,
            icon: data.icon
        };
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

    async getRecordings(): Promise<Recording[]> {
        // Notes and media are stored as JSONB columns in recordings table
        // No need for JOINs with separate tables

        const { data: recordingsData, error } = await supabase
            .from('recordings')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching recordings:', error);
            return [];
        }

        return recordingsData.map((r: any) => ({
            id: r.id,
            title: r.title,
            description: r.description || '',
            date: r.date ? new Date(r.date).toLocaleString() : new Date(r.created_at).toLocaleString(),
            duration: r.duration || '00:00:00',
            durationSeconds: r.duration_seconds || 0,
            status: r.status as any,
            tags: r.tags || [],
            participants: r.participants || 1,
            audioUrl: r.audio_url || undefined,
            summary: r.summary || undefined,
            segments: r.segments || [], // JSONB column
            folderId: r.folder_id || undefined,
            // Use JSONB columns directly
            notes: r.notes || [],
            media: r.media || []
        }));
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
                media: rec.media || []
            })
            .select()
            .single();

        if (error || !data) {
            console.error('Error creating recording:', error);
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
    }
};
