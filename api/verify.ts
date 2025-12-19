import { VercelRequest, VercelResponse } from '@vercel/node';

// VERSIÓN DE PRUEBA MÍNIMA - Sin Twilio para debuggear
export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        // CORS más permisivo posible
        const origin = req.headers.origin || 'https://diktalo.com';
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.setHeader('Content-Type', 'application/json');

        // OPTIONS
        if (req.method === 'OPTIONS') {
            return res.status(200).end();
        }

        // Solo POST
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        console.log('📥 Request received:', {
            method: req.method,
            action: req.body?.action,
            phone: req.body?.phoneNumber?.substring(0, 5) + '...',
            origin: req.headers.origin
        });

        const { action, phoneNumber, code } = req.body || {};

        // PRUEBA 1: Solo devolvemos éxito sin llamar a Twilio
        if (action === 'send') {
            console.log('✅ TEST: Returning fake success for send');
            return res.status(200).json({
                status: 'pending',
                message: 'TEST MODE: No SMS sent, but API works!'
            });
        }

        if (action === 'check') {
            // Aceptamos cualquier código por ahora
            console.log('✅ TEST: Returning fake approval');
            return res.status(200).json({
                status: 'approved',
                message: 'TEST MODE: Any code works!'
            });
        }

        return res.status(400).json({ error: 'Invalid action' });

    } catch (error: any) {
        console.error('❌ ERROR:', error.message);
        res.setHeader('Content-Type', 'application/json');
        return res.status(500).json({
            error: 'Server Error',
            message: error.message,
            debug: 'Check Vercel Function Logs'
        });
    }
}
