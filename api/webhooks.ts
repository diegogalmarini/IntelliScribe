// Webhooks handled via Supabase Edge Functions for Lemon Squeezy integration.
// This file is a placeholder to prevent routing errors in the legacy Vercel configuration.

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.status(200).json({ status: 'active', provider: 'lemonsqueezy' });
}
