
import { supabase } from '../lib/supabase';

export const getSignedAudioUrl = async (path: string): Promise<string | null> => {
    try {
        // DEFENSIVE CHECK: Ensure path is defined and not empty
        if (!path || typeof path !== 'string') {
            console.error('[Storage] Invalid path provided to getSignedAudioUrl:', path);
            return null;
        }

        // SMART LEGACY HANDLER:
        // If the path looks like a full URL (contains 'http'), extract the relative path
        let relativePath = path;

        if (path.startsWith('http')) {
            // Check if it's a Supabase URL and extract the path after 'recordings/'
            // Example: https://.../storage/v1/object/public/recordings/user/file.mp3
            const match = path.match(/recordings\/(.*)$/);
            if (match && match[1]) {
                relativePath = match[1];
            } else {
                console.warn('[Storage] Could not extract relative path from legacy URL:', path);
                // Fail safe: try to sign it anyway or return as is? 
                // If bucket is private, returning as is won't work. 
                // Let's assume the regex works for standard Supabase URLs.
                // If not, we might be stuck, but better to fail signing than serve broken link.
            }
        }

        // Generate Public URL (bucket is public without RLS)
        const { data } = supabase.storage
            .from('recordings')
            .getPublicUrl(relativePath);

        return data.publicUrl;
    } catch (err) {
        console.error('Unexpected error in getSignedAudioUrl:', err);
        return null;
    }
};

/**
 * Check if user has enough storage space for new upload
 * @param userId - User ID
 * @param newFileSize - Size of new file in bytes
 * @returns Object with allowed status, current usage, and limit
 */
export const checkStorageLimit = async (
    userId: string,
    newFileSize: number
): Promise<{ allowed: boolean; currentUsage: number; limit: number; planId: string }> => {
    try {
        // Get user's storage limit and plan
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('storage_limit, plan_id')
            .eq('id', userId)
            .single();

        if (profileError || !profile) {
            console.error('Failed to fetch user profile:', profileError);
            return { allowed: false, currentUsage: 0, limit: 0, planId: 'free' };
        }

        const limit = profile.storage_limit || 0;
        const planId = profile.plan_id || 'free';

        // Free tier has no storage limit (retention-based only)
        if (planId === 'free') {
            return { allowed: true, currentUsage: 0, limit: 0, planId };
        }

        // List all files for this user in the recordings bucket
        const { data: files, error: filesError } = await supabase.storage
            .from('recordings')
            .list(userId, {
                limit: 1000,
                sortBy: { column: 'created_at', order: 'desc' }
            });

        if (filesError) {
            console.error('Failed to list user files:', filesError);
            return { allowed: false, currentUsage: 0, limit, planId };
        }

        // Calculate current usage from file metadata
        const currentUsage = (files || []).reduce((sum, file) => {
            return sum + (file.metadata?.size || 0);
        }, 0);

        const allowed = (currentUsage + newFileSize) <= limit;

        return { allowed, currentUsage, limit, planId };
    } catch (error) {
        console.error('Storage check failed:', error);
        return { allowed: false, currentUsage: 0, limit: 0, planId: 'free' };
    }
};

export const uploadAudio = async (blob: Blob, userId: string): Promise<string | null> => {
    // Check storage limit before uploading
    const storageCheck = await checkStorageLimit(userId, blob.size);

    if (!storageCheck.allowed && storageCheck.planId !== 'free') {
        const usedGB = (storageCheck.currentUsage / 1073741824).toFixed(2);
        const limitGB = (storageCheck.limit / 1073741824).toFixed(2);
        console.error(`Storage limit exceeded: ${usedGB}GB / ${limitGB}GB used`);
        throw new Error(`STORAGE_LIMIT_EXCEEDED:${usedGB}:${limitGB}`);
    }

    const fileName = `${userId}/${Date.now()}.mp3`;

    const { data, error } = await supabase.storage
        .from('recordings')
        .upload(fileName, blob, {
            contentType: 'audio/mp3',
            cacheControl: '3600',
            upsert: false
        });

    if (error) {
        console.error('Error uploading audio:', error);
        return null;
    }

    // OPTIMIZATION: Return the relative path (fileName) instead of Public URL
    // This allows us to use dynamic signing later
    return fileName;
};

export const uploadAvatar = async (file: File, userId: string): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/avatar_${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
            upsert: true
        });

    if (error) {
        console.error('Error uploading avatar:', error);
        return null;
    }

    const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

    return publicUrl;
};
