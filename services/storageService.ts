
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
