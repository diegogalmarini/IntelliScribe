import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import twilio from 'twilio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local
try {
    const envPath = path.join(__dirname, '.env.local');
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, 'utf8');
        envConfig.split(/\r?\n/).forEach(line => {
            const [key, val] = line.split('=');
            if (key && val) {
                process.env[key.trim()] = val.trim();
            }
        });
        console.log('Loaded .env.local');
    }
} catch (e) {
    console.error('Error loading .env.local', e);
}

const PORT = 3001;

const server = http.createServer(async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    if (req.url === '/api/twilio-token' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', async () => {
            try {
                const { userId } = JSON.parse(body);

                const accountSid = process.env.TWILIO_ACCOUNT_SID;
                const apiKey = process.env.TWILIO_API_KEY_SID;
                const apiSecret = process.env.TWILIO_API_KEY_SECRET;
                const twimlAppSid = process.env.TWILIO_TWIML_APP_SID;

                if (!accountSid || !apiKey || !apiSecret || !twimlAppSid) {
                    throw new Error('Missing Twilio credentials in .env.local');
                }

                const AccessToken = twilio.jwt.AccessToken;
                const VoiceGrant = AccessToken.VoiceGrant;

                const voiceGrant = new VoiceGrant({
                    outgoingApplicationSid: twimlAppSid,
                    incomingAllow: true,
                });

                const token = new AccessToken(accountSid, apiKey, apiSecret, {
                    identity: userId || 'unknown',
                });

                token.addGrant(voiceGrant);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ token: token.toJwt() }));
                console.log(`Token generated for user: ${userId}`);

            } catch (err) {
                console.error('Token generation error:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message }));
            }
        });
    } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Not found' }));
    }
});

server.listen(PORT, () => {
    console.log(`Local API Server running on http://localhost:${PORT}`);
});
