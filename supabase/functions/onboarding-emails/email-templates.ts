export interface EmailContent {
    subject: string;
    html: string;
}

const base = (content: string) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
            line-height: 1.6;
            color: #1e293b;
            background-color: #f8fafc;
            padding: 40px 20px;
        }
        .container {
            max-width: 560px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
        }
        .content { padding: 48px 40px; }
        .logo { font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 32px; letter-spacing: -0.5px; }
        h1 { font-size: 26px; font-weight: 700; color: #0f172a; margin-bottom: 20px; line-height: 1.2; letter-spacing: -0.5px; }
        p { font-size: 16px; color: #475569; margin-bottom: 16px; }
        .list { list-style: none; margin: 20px 0; padding: 0; }
        .list li { padding: 6px 0; color: #475569; font-size: 15px; padding-left: 20px; position: relative; }
        .list li:before { content: "→"; position: absolute; left: 0; color: #0f172a; font-weight: 700; }
        .button {
            display: inline-block;
            background: #0f172a;
            color: white !important;
            padding: 14px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 15px;
            margin: 24px 0;
        }
        .highlight { background: #f1f5f9; padding: 20px 24px; border-radius: 8px; margin: 20px 0; }
        .footer { padding: 28px 40px; background: #f8fafc; border-top: 1px solid #e2e8f0; }
        .footer p { font-size: 13px; color: #94a3b8; margin: 0; }
        .footer a { color: #64748b; text-decoration: none; }
        .sig { margin-top: 32px; font-size: 15px; color: #475569; }
        .sig strong { color: #0f172a; }
    </style>
</head>
<body>
    <div class="container">
        ${content}
    </div>
</body>
</html>`;

export function getOnboardingEmail(
    step: number,
    userName: string,
    language: 'es' | 'en' = 'es'
): EmailContent {
    const templates: Record<number, Record<'es' | 'en', EmailContent>> = {
        1: {
            es: {
                subject: 'Tu primer paso con Diktalo',
                html: base(`
                <div class="content">
                    <div class="logo">Diktalo</div>
                    <h1>Hola ${userName}</h1>
                    <p>Ya tienes tu cuenta. Ahora falta un paso para que Diktalo funcione de verdad.</p>
                    <p><strong>Instala la extensión de Chrome.</strong></p>
                    <p>Es lo que hace que Diktalo capture automáticamente tus reuniones de Google Meet, Zoom o Teams — sin que nadie vea un bot en la sala, sin subir archivos después.</p>
                    <center>
                        <a href="https://chromewebstore.google.com/detail/gamgfdgjlmnohikeicknbdplagigoeml" class="button">Instalar la extensión →</a>
                    </center>
                    <p>Si tienes una reunión hoy, instálala ahora y ya estará lista cuando empiece.</p>
                    <p class="sig">— <strong>Diego</strong>, fundador de Diktalo</p>
                </div>
                <div class="footer"><p>© 2026 Diktalo · <a href="https://www.diktalo.com">diktalo.com</a></p></div>`)
            },
            en: {
                subject: 'Your first step with Diktalo',
                html: base(`
                <div class="content">
                    <div class="logo">Diktalo</div>
                    <h1>Hi ${userName}</h1>
                    <p>Your account is ready. Now there's one step left to make Diktalo work for real.</p>
                    <p><strong>Install the Chrome extension.</strong></p>
                    <p>That's what lets Diktalo automatically capture your Google Meet, Zoom or Teams meetings — without anyone seeing a bot in the room, no file uploads needed.</p>
                    <center>
                        <a href="https://chromewebstore.google.com/detail/gamgfdgjlmnohikeicknbdplagigoeml" class="button">Install the extension →</a>
                    </center>
                    <p>If you have a meeting today, install it now and it'll be ready when it starts.</p>
                    <p class="sig">— <strong>Diego</strong>, founder of Diktalo</p>
                </div>
                <div class="footer"><p>© 2026 Diktalo · <a href="https://www.diktalo.com">diktalo.com</a></p></div>`)
            }
        },
        2: {
            es: {
                subject: '¿Por qué no usar ChatGPT para esto?',
                html: base(`
                <div class="content">
                    <div class="logo">Diktalo</div>
                    <h1>Es la pregunta que más me hacen.</h1>
                    <p>Hola ${userName},</p>
                    <p>ChatGPT transcribe audio. Es verdad.</p>
                    <p>Pero hay tres cosas que no puede hacer:</p>
                    <ul class="list">
                        <li><strong>Estar en tu reunión sin que nadie lo vea.</strong> La extensión de Chrome captura el audio del sistema directamente. No hay bot que se una a la llamada.</li>
                        <li><strong>Grabar llamadas de teléfono reales.</strong> Diktalo graba también llamadas. ChatGPT no puede estar en tu móvil.</li>
                        <li><strong>Responder preguntas sobre reuniones de hace 3 meses.</strong> "¿Qué objeciones planteó ese cliente en enero?" Con Diktalo puedes preguntarlo. Con ChatGPT tendrías que haber guardado la transcripción manualmente.</li>
                    </ul>
                    <p>La diferencia no es la IA. Es la captura.</p>
                    <center>
                        <a href="https://chromewebstore.google.com/detail/gamgfdgjlmnohikeicknbdplagigoeml" class="button">Instalar la extensión Chrome →</a>
                    </center>
                    <p class="sig">— <strong>Diego</strong></p>
                </div>
                <div class="footer"><p>© 2026 Diktalo · <a href="https://www.diktalo.com">diktalo.com</a></p></div>`)
            },
            en: {
                subject: 'Why not just use ChatGPT for this?',
                html: base(`
                <div class="content">
                    <div class="logo">Diktalo</div>
                    <h1>It's the question I get most.</h1>
                    <p>Hi ${userName},</p>
                    <p>ChatGPT transcribes audio. That's true.</p>
                    <p>But there are three things it can't do:</p>
                    <ul class="list">
                        <li><strong>Be in your meeting without anyone seeing it.</strong> The Chrome extension captures system audio directly. No bot joins the call.</li>
                        <li><strong>Record real phone calls.</strong> Diktalo records calls too. ChatGPT can't be on your phone.</li>
                        <li><strong>Answer questions about meetings from 3 months ago.</strong> "What objections did that client raise in January?" You can ask Diktalo that. With ChatGPT you'd have had to save the transcript manually.</li>
                    </ul>
                    <p>The difference isn't the AI. It's the capture.</p>
                    <center>
                        <a href="https://chromewebstore.google.com/detail/gamgfdgjlmnohikeicknbdplagigoeml" class="button">Install Chrome extension →</a>
                    </center>
                    <p class="sig">— <strong>Diego</strong></p>
                </div>
                <div class="footer"><p>© 2026 Diktalo · <a href="https://www.diktalo.com">diktalo.com</a></p></div>`)
            }
        },
        3: {
            es: {
                subject: 'Prueba Diktalo en 2 minutos (sin instalar nada)',
                html: base(`
                <div class="content">
                    <div class="logo">Diktalo</div>
                    <h1>Sin extensión. Sin configuración.</h1>
                    <p>Hola ${userName},</p>
                    <p>Si todavía no has instalado la extensión, hay otra forma de ver Diktalo en acción ahora mismo.</p>
                    <p><strong>Sube una grabación que ya tengas.</strong></p>
                    <div class="highlight">
                        <p style="margin:0; color:#0f172a;">Una llamada guardada en el móvil, una reunión de Zoom descargada, un audio de WhatsApp. Cualquier cosa.</p>
                    </div>
                    <p>En menos de 2 minutos verás:</p>
                    <ul class="list">
                        <li>La transcripción completa con quién habló cuándo</li>
                        <li>El resumen con los puntos clave</li>
                        <li>La posibilidad de hacerle preguntas en lenguaje natural</li>
                    </ul>
                    <center>
                        <a href="https://www.diktalo.com/dashboard" class="button">Subir una grabación →</a>
                    </center>
                    <p>Cuando veas el resultado, entenderás para qué sirve la extensión.</p>
                    <p class="sig">— <strong>Diego</strong></p>
                </div>
                <div class="footer"><p>© 2026 Diktalo · <a href="https://www.diktalo.com">diktalo.com</a></p></div>`)
            },
            en: {
                subject: 'Try Diktalo in 2 minutes (no install needed)',
                html: base(`
                <div class="content">
                    <div class="logo">Diktalo</div>
                    <h1>No extension. No setup.</h1>
                    <p>Hi ${userName},</p>
                    <p>If you haven't installed the extension yet, there's another way to see Diktalo in action right now.</p>
                    <p><strong>Upload a recording you already have.</strong></p>
                    <div class="highlight">
                        <p style="margin:0; color:#0f172a;">A saved phone call, a downloaded Zoom meeting, a WhatsApp voice note. Anything works.</p>
                    </div>
                    <p>In under 2 minutes you'll see:</p>
                    <ul class="list">
                        <li>Full transcript with who spoke when</li>
                        <li>Summary with the key points</li>
                        <li>The ability to ask questions in natural language</li>
                    </ul>
                    <center>
                        <a href="https://www.diktalo.com/dashboard" class="button">Upload a recording →</a>
                    </center>
                    <p>Once you see the result, you'll understand what the extension is for.</p>
                    <p class="sig">— <strong>Diego</strong></p>
                </div>
                <div class="footer"><p>© 2026 Diktalo · <a href="https://www.diktalo.com">diktalo.com</a></p></div>`)
            }
        },
        4: {
            es: {
                subject: '"¿Qué dijo exactamente el cliente el martes pasado?"',
                html: base(`
                <div class="content">
                    <div class="logo">Diktalo</div>
                    <h1>Esa pregunta aparece en casi todas las reuniones de seguimiento.</h1>
                    <p>Hola ${userName},</p>
                    <p>Con Diktalo escribes literalmente eso y te responde con la cita exacta, con timestamp.</p>
                    <p>Sirve para:</p>
                    <ul class="list">
                        <li>Preparar una reunión de seguimiento con lo que se dijo antes</li>
                        <li>Recuperar un número o compromiso que no anotaste</li>
                        <li>Revisar las objeciones de un cliente sin escuchar la llamada entera</li>
                    </ul>
                    <p>No es magia. Es que la grabación queda indexada y puedes buscar en ella como si fuera un documento.</p>
                    <p>Tienes 24 minutos gratis al mes para probarlo.</p>
                    <center>
                        <a href="https://www.diktalo.com/dashboard" class="button">Hacer mi primera grabación →</a>
                    </center>
                    <p class="sig">— <strong>Diego</strong></p>
                </div>
                <div class="footer"><p>© 2026 Diktalo · <a href="https://www.diktalo.com">diktalo.com</a></p></div>`)
            },
            en: {
                subject: '"What did the client say exactly last Tuesday?"',
                html: base(`
                <div class="content">
                    <div class="logo">Diktalo</div>
                    <h1>That question comes up in almost every follow-up meeting.</h1>
                    <p>Hi ${userName},</p>
                    <p>With Diktalo you literally type that and it answers with the exact quote, with a timestamp.</p>
                    <p>Useful for:</p>
                    <ul class="list">
                        <li>Preparing a follow-up meeting with what was said before</li>
                        <li>Recovering a number or commitment you didn't write down</li>
                        <li>Reviewing a client's objections without re-listening to the whole call</li>
                    </ul>
                    <p>It's not magic. The recording gets indexed so you can search it like a document.</p>
                    <p>You have 24 free minutes per month to try it.</p>
                    <center>
                        <a href="https://www.diktalo.com/dashboard" class="button">Make my first recording →</a>
                    </center>
                    <p class="sig">— <strong>Diego</strong></p>
                </div>
                <div class="footer"><p>© 2026 Diktalo · <a href="https://www.diktalo.com">diktalo.com</a></p></div>`)
            }
        },
        5: {
            es: {
                subject: `${userName}, ¿hubo algún problema?`,
                html: base(`
                <div class="content">
                    <div class="logo">Diktalo</div>
                    <h1>Te escribo directamente.</h1>
                    <p>Hola ${userName},</p>
                    <p>Llevas una semana registrado y todavía no has hecho tu primera grabación.</p>
                    <p>Puede ser que la extensión no funcionó, que no tuviste reuniones esta semana, o simplemente que no llegaste a probarlo.</p>
                    <p>Si hubo algún problema técnico, responde este email. Lo resuelvo yo.</p>
                    <p>Si quieres empezar ahora, el camino más rápido es este:</p>
                    <center>
                        <a href="https://chromewebstore.google.com/detail/gamgfdgjlmnohikeicknbdplagigoeml" class="button">Instalar la extensión Chrome →</a>
                    </center>
                    <p>Dos minutos de configuración. La próxima reunión ya capturada.</p>
                    <p class="sig">— <strong>Diego Galmarini</strong><br><span style="font-size:14px; color:#94a3b8;">Fundador de Diktalo · <a href="mailto:diego@diktalo.com" style="color:#64748b;">diego@diktalo.com</a></span></p>
                </div>
                <div class="footer"><p>© 2026 Diktalo · <a href="https://www.diktalo.com">diktalo.com</a></p></div>`)
            },
            en: {
                subject: `${userName}, was there a problem?`,
                html: base(`
                <div class="content">
                    <div class="logo">Diktalo</div>
                    <h1>I'm writing to you directly.</h1>
                    <p>Hi ${userName},</p>
                    <p>You've been registered for a week and haven't made your first recording yet.</p>
                    <p>Maybe the extension didn't work, maybe you didn't have meetings this week, or you just didn't get around to trying it.</p>
                    <p>If there was a technical problem, reply to this email. I'll sort it out myself.</p>
                    <p>If you want to start now, the fastest path is this:</p>
                    <center>
                        <a href="https://chromewebstore.google.com/detail/gamgfdgjlmnohikeicknbdplagigoeml" class="button">Install Chrome extension →</a>
                    </center>
                    <p>Two minutes of setup. Your next meeting already captured.</p>
                    <p class="sig">— <strong>Diego Galmarini</strong><br><span style="font-size:14px; color:#94a3b8;">Founder of Diktalo · <a href="mailto:diego@diktalo.com" style="color:#64748b;">diego@diktalo.com</a></span></p>
                </div>
                <div class="footer"><p>© 2026 Diktalo · <a href="https://www.diktalo.com">diktalo.com</a></p></div>`)
            }
        }
    };

    return templates[step]?.[language] ?? templates[1][language];
}
