import { supabase } from '../lib/supabase';

/**
 * Detects device type based on user agent
 */
export const getDeviceType = (): string => {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
        return 'Tablet';
    }
    if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
        return 'Mobile';
    }
    return 'Desktop';
};

/**
 * Updates user profile with last login timestamp and device type
 */
export const trackLogin = async (userId: string) => {
    try {
        const device = getDeviceType();
        const { error } = await supabase
            .from('profiles')
            .update({
                last_login_at: new Date().toISOString(),
                last_device_type: device
            })
            .eq('id', userId);

        if (error) {
            console.error('[AuthTracking] Error updating last login:', error);
        }
    } catch (err) {
        console.error('[AuthTracking] Exception in trackLogin:', err);
    }
};
