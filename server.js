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
    } else if (req.url === '/api/ai' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', async () => {
            try {
                // geminiService sends: { action, payload, language }
                const { action, payload, language } = JSON.parse(body);
                console.log('AI Request:', action);

                if (!process.env.GEMINI_API_KEY) {
                    throw new Error('Missing GEMINI_API_KEY');
                }

                // Dynamically import GoogleGenAI (new SDK)
                const { GoogleGenAI } = await import('@google/genai');
                const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

                let resultData = null;

                if (action === 'summary') {
                    const { transcript, template = 'general' } = payload || {};
                    let prompt = "";

                    // Template logic
                    switch (template) {
                        case 'meeting':
                            prompt = `Analiza la siguiente transcripción de una reunión. Genera un resumen estructurado que incluya:
                              1. **Objetivos de la reunión**: ¿Para qué se reunieron?
                              2. **Decisiones clave**: ¿Qué se acordó?
                              3. **Tareas pendientes (Action Items)**: ¿Quién hace qué y para cuándo?
                              4. **Conclusiones**: Resumen general.
                              
                              Transcripción:
                              ${transcript}`;
                            break;
                        case 'class':
                            prompt = `Actúa como un estudiante de honor. Analiza esta transcripción de clase/conferencia y genera:
                              1. **Conceptos Principales**: Definiciones y temas clave.
                              2. **Puntos Importantes para el Examen**: Qué es probable que pregunten.
                              3. **Resumen Cronológico**: Flujo de la clase.
                              4. **Bibliografía/Referencias**: Si se mencionaron libros o autores.
                              
                              Transcripción:
                              ${transcript}`;
                            break;
                        case 'interview':
                            prompt = `Analiza esta transcripción de entrevista. Genera un perfil que incluya:
                              1. **Resumen del Candidato/Entrevistado**: Perfil general.
                              2. **Preguntas Clave y Respuestas**: Los momentos más relevantes.
                              3. **Fortalezas y Debilidades**: Análisis de soft y hard skills detectadas.
                              4. **Evaluación General**: Conclusión sobre el desempeño.
                              
                              Transcripción:
                              ${transcript}`;
                            break;
                        case 'sales':
                            prompt = `Analiza esta llamada de ventas. Extrae:
                              1. **Necesidades del Cliente**: ¿Qué problema tienen?
                              2. **Objeciones**: ¿Qué dudas o problemas plantearon?
                              3. **Puntos de Dolor (Pain Points)**: Problemas críticos mencionados.
                              4. **Próximos Pasos**: Acuerdos de seguimiento.
                              5. **Sentimiento**: ¿El cliente está interesado? (Positivo/Neutral/Negativo).
                              
                              Transcripción:
                              ${transcript}`;
                            break;
                        default: // 'general'
                            prompt = `Genera un resumen conciso y estructurado de la siguiente transcripción. Identifica los puntos clave, temas principales y cualquier conclusión relevante. Utiliza formato Markdown para mejorar la legibilidad.
                              
                              Transcripción:
                              ${transcript}`;
                    }

                    const response = await genAI.models.generateContent({
                        model: 'gemini-2.0-flash-exp',
                        contents: prompt,
                        config: { temperature: 0.3 }
                    });

                    resultData = response.text || "No summary generated.";
                } else {
                    throw new Error(`Invalid action: ${action}`);
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                // geminiService expects: { data: result }
                res.end(JSON.stringify({ data: resultData }));

            } catch (err) {
                console.error('AI API Error:', err);
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
