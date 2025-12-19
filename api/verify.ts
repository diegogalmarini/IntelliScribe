import { VercelRequest, VercelResponse } from '@vercel/node';
import twilio from 'twilio';
import { createClient } from '@supabase/supabase-js';

// Inicializar Twilio
const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_API_KEY_SECRET, // Usamos el Secret para autenticar
    { accountSid: process.env.TWILIO_ACCOUNT_SID }
);

// Inicializar Supabase (para actualizar el estado del usuario)
const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_ANON_KEY! // Ojo: Idealmente usar SERVICE_ROLE_KEY para operaciones de admin
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { action, phoneNumber, code, userId, channel } = req.body;
    const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

    if (!serviceSid) return res.status(500).json({ error: 'Server misconfiguration: Missing Verify SID' });

    try {
        // --- ACCIÓN 1: ENVIAR CÓDIGO (SEND) ---
        if (action === 'send') {
            if (!phoneNumber) return res.status(400).json({ error: 'Phone number required' });

            const verification = await client.verify.v2
                .services(serviceSid)
                .verifications.create({
                    to: phoneNumber,
                    channel: channel || 'sms' // 'sms', 'whatsapp' o 'call'
                });

            return res.status(200).json({ status: verification.status });
        }

        // --- ACCIÓN 2: VERIFICAR CÓDIGO (CHECK) ---
        if (action === 'check') {
            if (!phoneNumber || !code || !userId) {
                return res.status(400).json({ error: 'Phone, code and userId required' });
            }

            const verificationCheck = await client.verify.v2
                .services(serviceSid)
                .verificationChecks.create({
                    to: phoneNumber,
                    code: code
                });

            if (verificationCheck.status === 'approved') {
                // 1. Añadir como Caller ID Verificado en Twilio (Para que pueda llamar con su número)
                try {
                    // Nota: Esto a veces requiere validación extra, pero Verify lo facilita
                    await client.validationRequests.create({
                        friendlyName: `User ${userId}`,
                        phoneNumber: phoneNumber
                    });
                } catch (e) {
                    console.log('Caller ID validation note:', e);
                    // No bloqueamos si falla esto, pero es bueno intentarlo
                }

                // 2. Actualizar Supabase
                /* Aquí deberías actualizar tu tabla 'profiles' o 'users'
                   poniendo phone_verified = true y guardando el número.
                   
                   Ejemplo (pseudocódigo):
                   await supabase.from('profiles').update({ 
                       phone: phoneNumber, 
                       phone_verified: true 
                   }).eq('id', userId);
                */

                return res.status(200).json({
                    status: 'approved',
                    message: 'Phone verified successfully'
                });
            } else {
                return res.status(400).json({ status: 'rejected', error: 'Invalid code' });
            }
        }

        return res.status(400).json({ error: 'Invalid action' });

    } catch (error: any) {
        console.error('Verify Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
