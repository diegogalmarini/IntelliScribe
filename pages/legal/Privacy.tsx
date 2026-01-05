import React from 'react';
import { motion } from 'framer-motion';

export const Privacy: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-background-dark py-24 px-4 transition-colors duration-200">
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-4xl mx-auto bg-white dark:bg-slate-900 p-8 md:p-16 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-white/5"
            >
                <div className="mb-12 border-b border-slate-100 dark:border-white/5 pb-8">
                    <h1 className="text-4xl md:text-5xl font-display font-black text-slate-900 dark:text-white mb-4 tracking-tight uppercase">
                        Política de Privacidad
                    </h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Última actualización: 05 de Enero de 2026</p>
                </div>

                <div className="space-y-12 text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    <section>
                        <p>
                            Bienvenido a Diktalo ("nosotros", "nos" o "nuestro"). Diktalo proporciona una plataforma de inteligencia de voz impulsada por IA, que incluye nuestra aplicación web, la extensión de navegador "Diktalo Ghostwire" y otros servicios relacionados (colectivamente, el "Servicio").
                        </p>
                        <p className="mt-4">
                            Nos tomamos muy en serio su privacidad y la seguridad de sus datos de voz. Esta Política de Privacidad explica cómo recopilamos, usamos, compartimos y protegemos su información personal.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-display font-black text-slate-900 dark:text-white mb-4 uppercase tracking-wider italic">1. Información que Recopilamos</h2>
                        <p className="mb-3">Recopilamos información para proporcionar, mejorar y proteger nuestros Servicios.</p>

                        <h3 className="font-bold text-slate-900 dark:text-white mt-6 mb-2">1.1 Información que usted nos proporciona</h3>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li><strong>Información de la cuenta:</strong> Cuando se registra, recopilamos su nombre, dirección de correo electrónico, contraseña (encriptada) y, opcionalmente, su número de teléfono y foto de perfil.</li>
                            <li><strong>Contenido de Usuario (Datos de Voz y Texto):</strong> Esto incluye:
                                <ul className="list-disc list-inside ml-8 mt-2 space-y-1 text-sm">
                                    <li>Grabaciones de audio que usted crea usando el micrófono, sube manualmente o graba a través de nuestra Extensión de Chrome.</li>
                                    <li>Llamadas telefónicas realizadas o recibidas a través de nuestro Dialer integrado.</li>
                                    <li>Transcripciones, resúmenes, notas y chats generados por nuestra IA a partir de sus grabaciones.</li>
                                    <li>Vocabulario personalizado que usted añade para mejorar la precisión de la transcripción.</li>
                                </ul>
                            </li>
                            <li><strong>Información de Pago:</strong> Los pagos son procesados por nuestro proveedor externo (Stripe). Diktalo no almacena los números completos de su tarjeta de crédito, solo recibimos confirmación de la transacción y estado de la suscripción.</li>
                            <li><strong>Comunicaciones:</strong> Información que nos envía a través de soporte, feedback o formularios de contacto.</li>
                        </ul>

                        <h3 className="font-bold text-slate-900 dark:text-white mt-6 mb-2">1.2 Información recopilada automáticamente</h3>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li><strong>Datos de Uso:</strong> Recopilamos información sobre cómo interactúa con el Servicio, como las funciones que utiliza, la duración de las grabaciones y la frecuencia de uso.</li>
                            <li><strong>Información del Dispositivo:</strong> Dirección IP, tipo de navegador, sistema operativo y tipo de dispositivo.</li>
                            <li><strong>Datos de la Extensión de Chrome:</strong> Cuando utiliza nuestra extensión, procesamos el audio de la pestaña activa que usted elige grabar explícitamente. No capturamos ni almacenamos su historial de navegación ni el contenido de pestañas que no esté grabando activamente.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-display font-black text-slate-900 dark:text-white mb-4 uppercase tracking-wider italic">2. Cómo Usamos su Información</h2>
                        <p className="mb-3">Utilizamos su información para los siguientes fines legítimos:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li><strong>Prestación del Servicio:</strong> Para grabar, almacenar, transcribir y resumir su audio; para gestionar su cuenta y autenticar su identidad.</li>
                            <li><strong>Funcionalidad de IA:</strong> Utilizamos procesadores de IA de terceros (como Google Gemini y AssemblyAI) para generar transcripciones y resúmenes. <strong>Sus datos se envían a estos procesadores únicamente con el fin de devolverle el resultado a usted.</strong></li>
                            <li><strong>Mejora del Servicio:</strong> Para analizar tendencias de uso, corregir errores y mejorar la precisión de nuestros sistemas.</li>
                            <li><strong>Seguridad:</strong> Para prevenir fraudes, abusos y garantizar la integridad técnica de nuestra plataforma.</li>
                            <li><strong>Comunicaciones:</strong> Para enviarle actualizaciones del servicio, facturas y, si ha dado su consentimiento, novedades sobre productos (puede darse de baja en cualquier momento).</li>
                        </ul>
                    </section>

                    <section className="p-8 bg-brand-violet/5 dark:bg-brand-violet/10 rounded-[2rem] border border-primary/20">
                        <h2 className="text-xl font-display font-black text-primary mb-4 uppercase tracking-wider italic">Cláusula de Entrenamiento de IA</h2>
                        <p className="text-slate-900 dark:text-slate-100 font-bold">
                            Diktalo <strong>NO</strong> vende sus datos de voz ni los utiliza para entrenar nuestros modelos de IA fundamentales de manera que sus datos privados queden expuestos a otros usuarios. Sus grabaciones son confidenciales.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-display font-black text-slate-900 dark:text-white mb-4 uppercase tracking-wider italic">3. Cómo Compartimos su Información</h2>
                        <p className="mb-4">No vendemos su información personal. Solo compartimos datos con terceros en las siguientes circunstancias:</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
                                <h4 className="font-black text-slate-900 dark:text-white text-xs uppercase mb-2">Supabase</h4>
                                <p className="text-xs">Infraestructura y Base de Datos segura.</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
                                <h4 className="font-black text-slate-900 dark:text-white text-xs uppercase mb-2">Google Cloud (Vertex AI) / AssemblyAI</h4>
                                <p className="text-xs">Procesamiento de IA para transcripciones.</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
                                <h4 className="font-black text-slate-900 dark:text-white text-xs uppercase mb-2">Stripe</h4>
                                <p className="text-xs">Procesamiento seguro de pagos.</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
                                <h4 className="font-black text-slate-900 dark:text-white text-xs uppercase mb-2">Twilio</h4>
                                <p className="text-xs">Servicios de telefonía y SMS.</p>
                            </div>
                        </div>

                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li><strong>Requisitos Legales:</strong> Podemos divulgar su información si así lo exige la ley, una orden judicial o para proteger los derechos y la seguridad de Diktalo o de nuestros usuarios.</li>
                            <li><strong>Transferencia de Negocio:</strong> En caso de fusión, adquisición o venta de activos, sus datos podrían ser transferidos como parte de la operación, notificándole previamente.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-display font-black text-slate-900 dark:text-white mb-4 uppercase tracking-wider italic">4. Seguridad de los Datos</h2>
                        <p className="mb-3">Implementamos medidas de seguridad robustas de nivel empresarial para proteger sus datos:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li><strong>Encriptación:</strong> Los datos se encriptan en tránsito (TLS/SSL) y en reposo (AES-256) en nuestros servidores de almacenamiento.</li>
                            <li><strong>Control de Acceso:</strong> Utilizamos Row Level Security (RLS) para asegurar que solo usted (y las personas con las que comparta explícitamente) puedan acceder a sus grabaciones y transcripciones.</li>
                            <li><strong>Autenticación:</strong> Gestión segura de sesiones mediante tokens y protección contra accesos no autorizados.</li>
                        </ul>
                        <p className="mt-4 text-sm italic">Sin embargo, ningún sistema es 100% impenetrable. Si detectamos una brecha de seguridad, le notificaremos de acuerdo con las leyes aplicables.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-display font-black text-slate-900 dark:text-white mb-4 uppercase tracking-wider italic">5. Retención de Datos</h2>
                        <p className="mb-3">Conservamos su información personal y contenido de usuario mientras su cuenta esté activa o sea necesario para prestarle el Servicio.</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>Si elimina una grabación específica, esta se elimina de nuestros sistemas de almacenamiento inmediatamente (o tras un breve periodo de respaldo técnico).</li>
                            <li>Si elimina su cuenta, borraremos todos sus datos personales y contenido asociado en un plazo de 30 días, salvo que la ley exija lo contrario.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-display font-black text-slate-900 dark:text-white mb-4 uppercase tracking-wider italic">6. Sus Derechos y Opciones</h2>
                        <p className="mb-3">Dependiendo de su ubicación (incluyendo GDPR en Europa o CCPA en California), usted tiene derechos sobre sus datos:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li><strong>Acceso y Portabilidad:</strong> Puede acceder a sus grabaciones y descargarlas en formatos estándar (MP3, PDF, TXT) desde el panel de control.</li>
                            <li><strong>Rectificación:</strong> Puede editar sus datos de perfil y corregir las transcripciones generadas.</li>
                            <li><strong>Eliminación (Derecho al Olvido):</strong> Puede solicitar la eliminación de su cuenta y todos sus datos.</li>
                            <li><strong>Oposición y Limitación:</strong> Puede oponerse a ciertos procesamientos de sus datos.</li>
                        </ul>
                        <p className="mt-4 text-sm font-bold">
                            Para ejercer estos derechos, contáctenos en: <a href="mailto:privacy@diktalo.com" className="text-primary hover:underline">privacy@diktalo.com</a>
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-display font-black text-slate-900 dark:text-white mb-4 uppercase tracking-wider italic">7. Privacidad de los Menores</h2>
                        <p>
                            El Servicio no está dirigido a menores de 18 años (o la edad de mayoría legal en su jurisdicción). No recopilamos conscientemente información personal de menores. Si descubrimos que hemos recopilado datos de un menor sin consentimiento parental, tomaremos medidas para eliminarlos.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-display font-black text-slate-900 dark:text-white mb-4 uppercase tracking-wider italic">8. Cookies y Tecnologías de Rastreo</h2>
                        <p>
                            Utilizamos cookies esenciales para mantener su sesión iniciada y cookies analíticas para entender cómo se usa nuestro sitio. Puede gestionar sus preferencias de cookies a través de la configuración de su navegador o nuestro banner de consentimiento. Para más detalles, consulte nuestra <a href="/legal/cookies" className="text-primary hover:underline">Política de Cookies</a>.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-display font-black text-slate-900 dark:text-white mb-4 uppercase tracking-wider italic">9. Cambios en esta Política</h2>
                        <p>
                            Podemos actualizar esta Política de Privacidad ocasionalmente. Le notificaremos sobre cambios significativos enviándole un correo electrónico o mostrando un aviso destacado en nuestro Servicio antes de que los cambios entren en vigor.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-display font-black text-slate-900 dark:text-white mb-4 uppercase tracking-wider italic">10. Contacto</h2>
                        <p>
                            Si tiene preguntas sobre esta Política de Privacidad o sobre cómo manejamos sus datos, contáctenos:<br /><br />
                            <strong>Diktalo Legal Team</strong><br />
                            Correo electrónico: <a href="mailto:legal@diktalo.com" className="text-primary hover:underline">legal@diktalo.com</a>
                        </p>
                    </section>
                </div>

                <div className="mt-16 pt-8 border-t border-slate-100 dark:border-white/5 flex justify-between items-center">
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs hover:gap-3 transition-all"
                    >
                        <span className="material-symbols-outlined">west</span>
                        Volver
                    </button>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Privacy First. Diktalo AI.</p>
                </div>
            </motion.div>
        </div>
    );
};

export default Privacy;
