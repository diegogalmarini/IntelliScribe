
// Minimal Debug Handler
// Returns 200 OK to verify function execution capabilities
export default async function handler(req, res) {
    try {
        console.log(`[Debug] Request received: ${req.method}`);

        const envOverview = {
            stripeKeyLength: process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.length : 0,
            hasSupabase: !!process.env.VITE_SUPABASE_URL,
        };

        if (req.method === 'POST') {
            // Mock success for quick verification if needed, or just acknowledge
            return res.status(200).json({ status: "Alive", method: "POST", env: envOverview });
        }

        return res.status(200).json({ status: "Alive", method: req.method, env: envOverview });
    } catch (error: any) {
        return res.status(500).json({ error: "Safety Net Catch", details: error.message });
    }
}
