
import { supabase } from '../lib/supabase';

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

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
        .from('recordings')
        .getPublicUrl(fileName);

    return publicUrl;
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
