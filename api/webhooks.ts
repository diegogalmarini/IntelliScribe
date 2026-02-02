// TEMPORARILY DISABLED - NEEDS PROPER STRIPE/SUPABASE ADMIN SETUP
// TODO: Re-enable after fixing exports in stripeService and supabaseAdmin

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.status(503).json({ error: 'Webhooks temporarily disabled for deployment fix' });
}

/* 
ORIGINAL CODE - TO BE RESTORED:

import { stripe } from '../services/stripeService';
import { supabaseAdmin } from '../lib/supabase';

... rest of original code ...
*/
