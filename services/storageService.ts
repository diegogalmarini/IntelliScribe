
import { supabase } from '../lib/supabase';

export const getSignedAudioUrl = async (path: string): Promise<string | null> => {
    try {
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

        // Generate Signed URL (valid for 1 hour)
        const { data, error } = await supabase.storage
            .from('recordings')
            .createSignedUrl(relativePath, 3600);

        if (error) {
            console.error('Error signing URL:', error);
            return null;
        }

        return data.signedUrl;
    } catch (err) {
        console.error('Unexpected error in getSignedAudioUrl:', err);
        return null;
    }
};

export const uploadAudio = async (blob: Blob, userId: string): Promise<string | null> => {
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
