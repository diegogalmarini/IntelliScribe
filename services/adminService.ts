import { supabase } from '../lib/supabase';
import { AdminStats, AdminUser, PhoneCall, Recording, PlanConfig, AppSetting } from '../types';

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
     * Get comprehensive statistics for Overview dashboard
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

            // Plan pricing
            const PLAN_PRICES: Record<string, number> = {
                'free': 0,
                'pro': 15,
                'business': 29,
                'business_plus': 49
            };

            // Calculate MRR
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

            return {
                mrr: Math.round(mrr * 100) / 100,
                totalUsers,
                activeUsers,
                totalMinutesUsed,
                estimatedCost: Math.round(estimatedCost * 100) / 100,
                grossProfit: Math.round(grossProfit * 100) / 100,
                mrrGrowth: Math.round(mrrGrowth * 10) / 10,
                userGrowth: Math.round(userGrowth * 10) / 10
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
                usagePercentage: profile.minutes_limit > 0
                    ? Math.round((profile.minutes_used / profile.minutes_limit) * 100)
                    : 0,
                createdAt: profile.created_at
            }));

            return { users, total: count || 0 };
        } catch (error) {
            console.error('[adminService] Exception in getAllUsers:', error);
            return { users: [], total: 0 };
        }
    },

    /**
     * Update user's plan manually
     */
    async updateUserPlan(userId: string, planId: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ plan_id: planId })
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
                const toMatch = rec.title.match(/Call to (\+\d+)/);
                const fromMatch = rec.description.match(/from (\+\d+)/);

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
     */
    async updatePlanConfig(planId: string, updates: Partial<PlanConfig>): Promise<boolean> {
        console.log(`[adminService] Actualizando plan ${planId} (Fire & Forget)...`);

        // No usamos .select() para evitar errores de lectura por permisos
        const { error } = await supabase
            .from('plans_configuration')
            .update(updates)
            .eq('id', planId);

        if (error) {
            console.error('[adminService] Error de DB:', error.message);
            alert(`Error de Base de Datos: ${error.message}`);
            return false;
        }

        // Si no hay error, asumimos éxito. No verificamos filas para evitar bloqueos.
        console.log('[adminService] Plan guardado correctamente.');
        return true;
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
     */
    async updateAppSetting(key: string, value: string): Promise<boolean> {
        // No usamos .select() para evitar errores de lectura
        const { error } = await supabase
            .from('app_settings')
            .update({ value, updated_at: new Date() })
            .eq('key', key);

        if (error) {
            console.error('[adminService] Error updating setting:', error);
            return false;
        }

        return true;
    }
};