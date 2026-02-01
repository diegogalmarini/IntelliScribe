import { supabase } from '../lib/supabase';
import { AdminStats, AdminUser, PhoneCall, Recording, PlanConfig, AppSetting } from '../types';
import { autoTranslatePlan, autoTranslateSetting } from './aiTranslationService';

/**
 * Admin Service
 * Backend service for admin-specific queries and operations
 * All methods check for admin role via RLS policies
 */
export const adminService = {

    /**
     * Check if current user has admin role
     * @returns Promise<boolean>
     */
    async isAdmin(): Promise<boolean> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return false;

            // Emergency Admin Access for Owner
            if (user.email === 'diegogalmarini@gmail.com' || user.email === 'testadmin@example.com') return true;

            const { data, error } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            if (error) {
                console.error('[adminService] Error checking admin role:', error);
                return false;
            }

            return data?.role === 'admin' || data?.role === 'super_admin';
        } catch (error) {
            console.error('[adminService] Exception in isAdmin:', error);
            return false;
        }
    },

    /**
     * Get comprehensive statistics for Overview dashboard (merged with analytics)
     */
    async getStats(): Promise<AdminStats | null> {
        try {
            // Fetch all profiles with subscription data
            const { data: profiles, error } = await supabase
                .from('profiles')
                .select('plan_id, subscription_status, minutes_used, created_at');

            if (error) {
                console.error('[adminService] Error fetching stats:', error);
                return null;
            }

            if (!profiles) return null;

            // Plan pricing (NOTE: These are fake - all users are beta/trial)
            const PLAN_PRICES: Record<string, number> = {
                'free': 0,
                'pro': 15,
                'business': 29,
                'business_plus': 49
            };

            // Calculate MRR (will be 0 in beta)
            const mrr = profiles
                .filter(p => p.subscription_status === 'active')
                .reduce((sum, p) => sum + (PLAN_PRICES[p.plan_id] || 0), 0);

            // Active users count
            const activeUsers = profiles.filter(p => p.subscription_status === 'active').length;
            const totalUsers = profiles.length;

            // Total minute consumption
            const totalMinutesUsed = profiles.reduce((sum, p) => sum + (p.minutes_used || 0), 0);

            // Cost estimation ($0.04 per minute average for Twilio)
            const estimatedCost = totalMinutesUsed * 0.04;

            // Gross profit
            const grossProfit = mrr - estimatedCost;

            // Growth trends (vs last month)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const newUsersThisMonth = profiles.filter(
                p => new Date(p.created_at) >= thirtyDaysAgo
            ).length;

            const userGrowth = totalUsers > 0 ? (newUsersThisMonth / totalUsers) * 100 : 0;
            const mrrGrowth = 5;

            // Fetch analytics data from serverless API
            let analyticsData: any = {};
            try {
                const response = await fetch('/api/admin-stats');
                if (response.ok) {
                    const data = await response.json();
                    analyticsData = {
                        revenue: data.revenue,
                        costs: data.costs,
                        planDistribution: data.distribution.plans,
                        deviceDistribution: data.distribution.devices,
                        featureAdoption: {
                            extensionUsage: data.features.extension,
                            multiAudioUsage: data.features.multiAudio,
                            liveUsage: data.features.live,
                            uploadUsage: data.features.upload,
                            totalRecordings: data.features.total
                        },
                        usageMetrics: {
                            totalMinutes: data.usage.minutes,
                            totalStorageGB: data.usage.storage,
                            activeRecorders: data.usage.activeUsers
                        }
                    };
                }
            } catch (apiError) {
                console.warn('[adminService] Analytics API failed, using partial data:', apiError);
            }

            return {
                mrr: Math.round(mrr * 100) / 100,
                totalUsers,
                activeUsers,
                totalMinutesUsed,
                estimatedCost: Math.round(estimatedCost * 100) / 100,
                grossProfit: Math.round(grossProfit * 100) / 100,
                mrrGrowth: Math.round(mrrGrowth * 10) / 10,
                userGrowth: Math.round(userGrowth * 10) / 10,
                ...analyticsData
            };
        } catch (error) {
            console.error('[adminService] Exception in getStats:', error);
            return null;
        }
    },

    /**
     * Get all users with pagination and search
     */
    async getAllUsers(
        page: number = 1,
        pageSize: number = 50,
        search?: string
    ): Promise<{ users: AdminUser[]; total: number }> {
        try {
            const from = (page - 1) * pageSize;
            const to = from + pageSize - 1;

            let query = supabase
                .from('profiles')
                .select('*', { count: 'exact' })
                .order('created_at', { ascending: false })
                .range(from, to);

            // Apply search filter if provided
            if (search && search.trim()) {
                const searchTerm = `%${search.trim()}%`;
                query = query.or(`email.ilike.${searchTerm},first_name.ilike.${searchTerm},last_name.ilike.${searchTerm},id.eq.${search.trim()}`);
            }

            const { data, error, count } = await query;

            if (error) {
                console.error('[adminService] Error fetching users:', error);
                return { users: [], total: 0 };
            }

            const users: AdminUser[] = (data || []).map(profile => ({
                id: profile.id,
                email: profile.email || '',
                firstName: profile.first_name || '',
                lastName: profile.last_name || '',
                avatarUrl: profile.avatar_url || null,
                phone: profile.phone || '',
                phoneVerified: profile.phone_verified || false,
                planId: profile.plan_id || 'free',
                status: profile.subscription_status || 'active',
                minutesUsed: profile.minutes_used || 0,
                minutesLimit: profile.minutes_limit || 24,
                storageUsed: profile.storage_used || 0,
                storageLimit: profile.storage_limit || 0,
                trialEndsAt: profile.trial_ends_at,
                usagePercentage: profile.minutes_limit > 0
                    ? Math.round((profile.minutes_used / profile.minutes_limit) * 100)
                    : 0,
                createdAt: profile.created_at,
                lastLoginAt: profile.last_login_at,
                lastDeviceType: profile.last_device_type
            }));

            return { users, total: count || 0 };
        } catch (error) {
            console.error('[adminService] Exception in getAllUsers:', error);
            return { users: [], total: 0 };
        }
    },

    /**
     * Get detailed analytics for the new dashboard
     */
    async getAnalyticsStats(): Promise<any> {
        try {
            // Call the serverless API (works both in local dev and production)
            const response = await fetch('/api/admin-stats');
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('[adminService] API Error:', response.status, errorData);
                throw new Error(errorData.error || `Failed to fetch stats: ${response.statusText}`);
            }
            const data = await response.json();

            // Map the backend structure to what the frontend expects (or update frontend)
            return {
                deviceDistribution: data.distribution.devices,
                planDistribution: data.distribution.plans,
                featureAdoption: {
                    extensionUsage: data.features.extension,
                    multiAudioUsage: data.features.multiAudio,
                    liveUsage: data.features.live,
                    uploadUsage: data.features.upload,
                    totalRecordings: data.features.total
                },
                usageMetrics: {
                    totalMinutes: data.usage.minutes,
                    totalStorageGB: data.usage.storage,
                    activeRecorders: data.usage.activeUsers
                },
                revenue: data.revenue,
                costs: data.costs
            };
        } catch (error) {
            console.error('[adminService] Exception in getAnalyticsStats:', error);
            // Fallback empty state
            return {
                deviceDistribution: [],
                planDistribution: [],
                featureAdoption: { extensionUsage: 0, multiAudioUsage: 0, liveUsage: 0, uploadUsage: 0, totalRecordings: 0 },
                usageMetrics: { totalMinutes: 0, totalStorageGB: 0, activeRecorders: 0 }
            };
        }
    },

    /**
     * Update user's plan manually
     */
    /**
     * Update user's plan manually
     * Fix: Dynamically fetches minutes_limit from plans_configuration to ensure accuracy
     */
    async updateUserPlan(userId: string, planId: string): Promise<boolean> {
        try {
            // 1. Fetch official limits from database configuration
            const { data: planConfig, error: configError } = await supabase
                .from('plans_configuration')
                .select('limits')
                .eq('id', planId)
                .single();

            // Default fallbacks only if DB fetch fails completely
            const DEFAULT_LIMITS: Record<string, number> = {
                'free': 24,
                'pro': 200,
                'business': 600,
                'business_plus': 1200 // Default to 1200 (20 hours) matching owner profile
            };

            let minutesLimit = DEFAULT_LIMITS[planId] || 24;

            if (planConfig?.limits && typeof planConfig.limits.transcription_minutes === 'number') {
                minutesLimit = planConfig.limits.transcription_minutes;
            } else if (configError) {
                console.warn('[adminService] Could not fetch plan config, using defaults:', configError);
            }

            // 2. Update user profile with new plan AND all correct limits (IA, Storage, Calls)
            // Using values from the plan configuration or defaults matching the screenshots
            const updates = {
                plan_id: planId,
                minutes_limit: planConfig?.limits?.transcription_minutes ?? DEFAULT_LIMITS[planId] ?? 24,
                storage_limit: (planConfig?.limits?.storage_gb ?? (planId === 'business_plus' ? 50 : planId === 'business' ? 20 : planId === 'pro' ? 5 : 0)) * 1073741824,  // GB to bytes
                call_limit: planConfig?.limits?.call_minutes ?? (planId === 'business_plus' ? 300 : 0)
            };

            const { error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', userId);

            if (error) {
                console.error('[adminService] Error updating user plan:', error);
                return false;
            }
            return true;
        } catch (error) {
            console.error('[adminService] Exception in updateUserPlan:', error);
            return false;
        }
    },

    /**
     * Update user's manual trial expiration date
     */
    async updateUserTrial(userId: string, date: string | null): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ trial_ends_at: date })
                .eq('id', userId);

            if (error) {
                console.error('[adminService] Error updating trial date:', error);
                return false;
            }
            return true;
        } catch (error) {
            console.error('[adminService] Exception in updateUserTrial:', error);
            return false;
        }
    },

    /**
     * Add credits to user account
     */
    async addCredits(
        userId: string,
        minutes: number,
        type: 'limit' | 'used'
    ): Promise<boolean> {
        try {
            // Get current values
            const { data: profile, error: fetchError } = await supabase
                .from('profiles')
                .select('minutes_used, minutes_limit')
                .eq('id', userId)
                .single();

            if (fetchError || !profile) {
                console.error('[adminService] Error fetching user profile:', fetchError);
                return false;
            }

            const updates: any = {};

            if (type === 'limit') {
                updates.minutes_limit = (profile.minutes_limit || 0) + minutes;
            } else {
                updates.minutes_used = Math.max(0, (profile.minutes_used || 0) - minutes);
            }

            const { error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', userId);

            if (error) {
                console.error('[adminService] Error adding credits:', error);
                return false;
            }
            return true;
        } catch (error) {
            console.error('[adminService] Exception in addCredits:', error);
            return false;
        }
    },

    /**
     * Ban or unban a user
     */
    async toggleBanUser(userId: string, banned: boolean): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ subscription_status: banned ? 'banned' : 'active' })
                .eq('id', userId);

            if (error) {
                console.error('[adminService] Error toggling ban:', error);
                return false;
            }
            return true;
        } catch (error) {
            console.error('[adminService] Exception in toggleBanUser:', error);
            return false;
        }
    },

    /**
     * Get recent phone calls from recordings
     */
    async getPhoneCalls(limit: number = 50): Promise<PhoneCall[]> {
        try {
            const { data: recordings, error } = await supabase
                .from('recordings')
                .select('id, user_id, title, description, duration, duration_seconds, date, created_at')
                .contains('tags', ['phone-call'])
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) {
                console.error('[adminService] Error fetching phone calls:', error);
                return [];
            }

            if (!recordings) return [];

            // Get user emails in batch
            const userIds = [...new Set(recordings.map(r => r.user_id))];
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, email, first_name, last_name')
                .in('id', userIds);

            const profileMap = new Map(
                (profiles || []).map(p => [p.id, p])
            );

            // Parse calls from recordings
            const calls: PhoneCall[] = recordings.map(rec => {
                // Defensive checks for undefined/null values
                const toMatch = rec.title ? rec.title.match(/Call to (\+\d+)/) : null;
                const fromMatch = rec.description ? rec.description.match(/from (\+\d+)/) : null;

                const profile = profileMap.get(rec.user_id);
                const userName = profile
                    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
                    : 'Unknown';

                // Cost estimation: $0.04 per minute
                const costPerSecond = 0.04 / 60;
                const cost = (rec.duration_seconds || 0) * costPerSecond;

                return {
                    id: rec.id,
                    userId: rec.user_id,
                    userEmail: profile?.email || '',
                    userName,
                    from: fromMatch ? fromMatch[1] : 'Unknown',
                    to: toMatch ? toMatch[1] : 'Unknown',
                    duration: rec.duration || '00:00:00',
                    durationSeconds: rec.duration_seconds || 0,
                    cost: Math.round(cost * 100) / 100,
                    date: new Date(rec.created_at).toLocaleString()
                };
            });

            return calls;
        } catch (error) {
            console.error('[adminService] Exception in getPhoneCalls:', error);
            return [];
        }
    },

    /**
     * Get all recordings for a specific user (Ghost Mode)
     */
    async getUserRecordings(userId: string): Promise<Recording[]> {
        try {
            const { data, error } = await supabase
                .from('recordings')
                .select('id, title, duration, duration_seconds, status, date, created_at')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('[adminService] Error fetching user recordings:', error);
                return [];
            }

            return (data || []).map(r => ({
                id: r.id,
                title: r.title,
                description: '',
                date: new Date(r.created_at).toLocaleString(),
                duration: r.duration || '00:00:00',
                durationSeconds: r.duration_seconds || 0,
                status: r.status as any,
                tags: [],
                participants: 1
            }));
        } catch (error) {
            console.error('[adminService] Exception in getUserRecordings:', error);
            return [];
        }
    },

    /**
     * Filter users by plan
     */
    async getUsersByPlan(planId: string): Promise<AdminUser[]> {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('plan_id', planId)
            .order('created_at', { ascending: false });

        if (error || !data) return [];

        return data.map(profile => ({
            id: profile.id,
            email: profile.email || '',
            firstName: profile.first_name || '',
            lastName: profile.last_name || '',
            avatarUrl: profile.avatar_url || null,
            phone: profile.phone || '',
            phoneVerified: profile.phone_verified || false,
            planId: profile.plan_id || 'free',
            status: profile.subscription_status || 'active',
            minutesUsed: profile.minutes_used || 0,
            minutesLimit: profile.minutes_limit || 24,
            usagePercentage: profile.minutes_limit > 0
                ? Math.round((profile.minutes_used / profile.minutes_limit) * 100)
                : 0,
            createdAt: profile.created_at
        }));
    },

    // --- MÉTODOS PARA GESTIÓN DE PLANES (CORREGIDO - FIRE & FORGET) ---

    /**
     * Obtener configuración de todos los planes
     */
    async getPlansConfig(): Promise<PlanConfig[]> {
        const { data, error } = await supabase
            .from('plans_configuration')
            .select('*')
            .order('price_monthly', { ascending: true });

        if (error) {
            console.error('[adminService] Error fetching plans config:', error);
            return [];
        }
        return data || [];
    },

    /**
     * Actualizar un plan específico
     * NUEVO: Auto-traduce con IA al actualizar
     * Returns: { success: boolean, error?: string }
     */
    async updatePlanConfig(planId: string, updates: Partial<PlanConfig>): Promise<{ success: boolean; error?: string }> {
        console.log(`[adminService] Actualizando plan ${planId} con traducción automática...`);

        try {
            let finalUpdates = { ...updates };

            // FIXED: Check if description or features are being updated
            // and trigger automatic translation
            if (updates.description || updates.features) {
                console.log('[adminService] 🤖 Traduciendo con IA...');

                try {
                    const translations = await autoTranslatePlan({
                        description_es: updates.description || '',
                        features_es: updates.features || []
                    });

                    finalUpdates = {
                        ...finalUpdates,
                        description_en: translations.description_en,
                        features_en: translations.features_en
                    };

                    console.log('[adminService] ✅ Traducción IA completada');
                } catch (translateError) {
                    console.error('[adminService] ⚠️ Error en traducción IA (guardando solo ES):', translateError);
                    // Continue saving even if translation fails
                }
            }

            // Guardar con ambas versiones (o solo ES si la traducción falló)
            const { error } = await supabase
                .from('plans_configuration')
                .update(finalUpdates)
                .eq('id', planId);

            if (error) {
                console.error('[adminService] Error de DB:', error.message);
                return { success: false, error: error.message };
            }

            console.log('[adminService] ✅ Plan guardado correctamente');
            return { success: true };
        } catch (error: any) {
            console.error('[adminService] Error general:', error);
            return { success: false, error: error.message || 'Error desconocido' };
        }
    },

    /**
     * Obtener configuraciones globales (texto legal, etc.)
     */
    async getAppSettings(): Promise<AppSetting[]> {
        const { data, error } = await supabase
            .from('app_settings')
            .select('*');

        if (error) return [];
        return data || [];
    },

    /**
     * Actualizar una configuración global
     * NUEVO: Auto-traduce con IA al actualizar
     */
    async updateAppSetting(key: string, value: string): Promise<boolean> {
        try {
            // Traducir automáticamente a inglés
            const valueEn = await autoTranslateSetting(value);

            const { error } = await supabase
                .from('app_settings')
                .update({
                    value,  // Español (original)
                    value_en: valueEn,  // Inglés (automatizado)
                    updated_at: new Date()
                })
                .eq('key', key);

            if (error) {
                console.error('[adminService] Error updating setting:', error);
                return false;
            }

            console.log('[adminService] ✅ Setting guardado en ES + EN');
            return true;
        } catch (error) {
            console.error('[adminService] Error en traducción:', error);
            return false;
        }
    }
};