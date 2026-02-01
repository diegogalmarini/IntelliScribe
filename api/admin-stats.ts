
import { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import twilio from 'twilio';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS configuration
    const allowedOrigin = req.headers.origin || '*';
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            throw new Error('Missing Supabase configuration');
        }

        // 1. Supabase Stats (Direct REST API to avoid library issues)
        const fetchSupabase = async (table: string, select: string) => {
            const response = await fetch(`${supabaseUrl}/rest/v1/${table}?select=${select}`, {
                headers: {
                    'apikey': supabaseServiceKey,
                    'Authorization': `Bearer ${supabaseServiceKey}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Supabase query failed for ${table}: ${response.status} ${errorText}`);
            }
            return await response.json();
        };

        const [profiles, recordings] = await Promise.all([
            fetchSupabase('profiles', 'id,plan_id,last_device_type,minutes_used,storage_used,created_at'),
            fetchSupabase('recordings', 'id,user_id,metadata,tags,description')
        ]);

        // 2. Stripe Stats
        let stripeStats = { balance: 0, mrr: 0, currency: 'eur' };
        if (process.env.STRIPE_SECRET_KEY) {
            const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
                apiVersion: '2023-10-16' as any,
            });

            try {
                const balance = await stripeClient.balance.retrieve();
                stripeStats.balance = balance.available[0].amount / 100;
                stripeStats.currency = balance.available[0].currency;

                const subs = await stripeClient.subscriptions.list({ status: 'active', limit: 100 });
                stripeStats.mrr = subs.data.reduce((sum, sub) => {
                    const amount = (sub as any).items.data[0].price.unit_amount || 0;
                    const interval = (sub as any).items.data[0].price.recurring.interval;
                    return sum + (interval === 'month' ? amount : amount / 12);
                }, 0) / 100;
            } catch (sErr: any) {
                console.error('[API] Stripe Fetch Error:', sErr.message);
            }
        }

        // 3. Twilio Stats
        let twilioStats = { usage: 0 };
        if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
            const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
            try {
                const usage = await twilioClient.usage.records.thisMonth.list({ limit: 1 });
                twilioStats.usage = usage[0]?.price || 0;
            } catch (tErr: any) {
                console.error('[API] Twilio Fetch Error:', tErr.message);
            }
        }

        // 4. Data Aggregation
        const devices = { Mobile: 0, Desktop: 0, Tablet: 0, Unknown: 0 };
        profiles?.forEach((p: any) => {
            const type = p.last_device_type || 'Unknown';
            if ((devices as any)[type] !== undefined) (devices as any)[type]++;
            else devices.Unknown++;
        });

        const plans = { free: 0, pro: 0, business: 0, business_plus: 0 };
        profiles?.forEach((p: any) => {
            const planId = p.plan_id || 'free';
            (plans as any)[planId] = ((plans as any)[planId] || 0) + 1;
        });

        const extensionCount = recordings?.filter((r: any) =>
            r.metadata?.source === 'chrome-extension' ||
            (typeof r.metadata === 'string' && r.metadata.includes('chrome-extension'))
        ).length || 0;

        const multiAudioCount = recordings?.filter((r: any) =>
            r.metadata?.type === 'multi-audio' || r.metadata?.segments?.length > 1
        ).length || 0;

        const liveCount = recordings?.filter((r: any) =>
            r.tags?.includes('Captura en vivo') ||
            r.tags?.includes('live') ||
            r.description === 'Sesión de captura en vivo'
        ).length || 0;

        const uploadCount = recordings?.filter((r: any) =>
            r.tags?.includes('upload') || r.tags?.includes('manual')
        ).length || 0;

        const activeUsersCount = new Set(recordings?.filter((r: any) => r.user_id).map((r: any) => r.user_id)).size;

        return res.status(200).json({
            revenue: stripeStats,
            costs: { twilio: twilioStats.usage, google: 0 },
            distribution: {
                devices: Object.entries(devices).map(([name, value]) => ({ name, value })),
                plans: Object.entries(plans).map(([name, value]) => ({
                    name,
                    value,
                    percentage: Math.round((value / (profiles?.length || 1)) * 100)
                }))
            },
            features: {
                extension: extensionCount,
                multiAudio: multiAudioCount,
                live: liveCount,
                upload: uploadCount,
                total: recordings?.length || 0
            },
            usage: {
                minutes: profiles?.reduce((sum: number, p: any) => sum + (p.minutes_used || 0), 0) || 0,
                storage: (profiles?.reduce((sum: number, p: any) => sum + (p.storage_used || 0), 0) || 0) / 1073741824,
                activeUsers: activeUsersCount
            }
        });

    } catch (err: any) {
        console.error('[API] Admin Stats Error:', err);
        return res.status(500).json({
            error: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
}
