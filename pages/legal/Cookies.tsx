import React from 'react';
import { motion } from 'framer-motion';

export const Cookies: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-background-dark py-24 px-4 transition-colors duration-200">
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-4xl mx-auto bg-white dark:bg-slate-900 p-8 md:p-16 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-white/5"
            >
                <div className="mb-12 border-b border-slate-100 dark:border-white/5 pb-8">
                    <h1 className="text-4xl md:text-5xl font-display font-black text-slate-900 dark:text-white mb-4 tracking-tight uppercase">
                        Política de Cookies
                    </h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Última actualización: 05 de Enero de 2026</p>
                </div>

                <div className="space-y-12 text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    <section>
                        <p>
                            Esta Política de Cookies explica qué son las cookies, cómo las utilizamos en Diktalo ("nosotros", "nos" o "nuestro") y qué opciones tiene usted para controlarlas. Esta política se aplica a nuestro sitio web, aplicación web y cualquier servicio relacionado (incluida nuestra Extensión de Chrome).
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-display font-black text-slate-900 dark:text-white mb-4 uppercase tracking-wider italic">1. ¿Qué son las Cookies?</h2>
                        <p>
                            Las cookies son pequeños archivos de texto que se almacenan en su dispositivo (ordenador, tableta o móvil) cuando visita un sitio web. Son ampliamente utilizadas para hacer que los sitios web funcionen de manera más eficiente, así como para proporcionar información a los propietarios del sitio.
                        </p>
                        <p className="mt-4">
                            Además de las cookies, utilizamos tecnologías similares como "Local Storage" (almacenamiento local del navegador) para guardar sus preferencias y tokens de sesión de forma segura.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-display font-black text-slate-900 dark:text-white mb-4 uppercase tracking-wider italic">2. ¿Por qué utilizamos Cookies?</h2>
                        <p className="mb-3">Utilizamos cookies por varias razones fundamentales:</p>
                        <ol className="list-decimal list-inside space-y-2 ml-4">
                            <li><strong>Autenticación:</strong> Para saber si ha iniciado sesión y mantener su sesión activa mientras navega.</li>
                            <li><strong>Seguridad:</strong> Para proteger su cuenta y prevenir el uso fraudulento de credenciales.</li>
                            <li><strong>Preferencias:</strong> Para recordar su idioma (Español/Inglés) y su tema preferido (Claro/Oscuro).</li>
                            <li><strong>Análisis:</strong> Para entender cómo los usuarios interactúan con Diktalo y mejorar nuestra plataforma.</li>
                        </ol>
                    </section>

                    <section>
                        <h2 className="text-xl font-display font-black text-slate-900 dark:text-white mb-4 uppercase tracking-wider italic">3. Tipos de Cookies que Utilizamos</h2>

                        <h3 className="font-bold text-slate-900 dark:text-white mt-6 mb-2">3.1 Cookies Estrictamente Necesarias (Esenciales)</h3>
                        <p className="mb-3">
                            Estas cookies son vitales para que pueda navegar por el sitio web y utilizar sus funciones. Sin ellas, no podemos proporcionarle los servicios básicos como el inicio de sesión o el procesamiento de pagos.
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li><strong>Supabase Auth:</strong> Gestiona su sesión de usuario y token de seguridad (JWT).</li>
                            <li><strong>Seguridad:</strong> Ayudan a prevenir ataques tipo CSRF (Cross-Site Request Forgery).</li>
                            <li><strong>Stripe:</strong> Necesarias para procesar sus suscripciones y pagos de forma segura y detectar fraudes.</li>
                        </ul>

                        <h3 className="font-bold text-slate-900 dark:text-white mt-6 mb-2">3.2 Cookies de Funcionalidad</h3>
                        <p className="mb-3">
                            Permiten que el sitio web recuerde las elecciones que usted hace para ofrecerle una experiencia más personalizada.
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li><strong>Tema UI:</strong> Recuerda si prefiere el "Modo Oscuro" o "Modo Claro".</li>
                            <li><strong>Idioma:</strong> Mantiene su selección de idioma a través de las sesiones.</li>
                            <li><strong>Configuración del Dialer:</strong> Preferencias locales sobre el dispositivo de entrada de audio.</li>
                        </ul>

                        <h3 className="font-bold text-slate-900 dark:text-white mt-6 mb-2">3.3 Cookies de Rendimiento y Análisis</h3>
                        <p className="mb-3">
                            Recopilan información sobre cómo utiliza nuestro sitio web (por ejemplo, qué páginas visita más a menudo o si recibe mensajes de error). Esta información es anónima y se utiliza únicamente para mejorar el funcionamiento del sitio.
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li><strong>Google Analytics 4 (GA4):</strong> Nos ayuda a medir métricas de tráfico y uso para optimizar la experiencia de usuario.</li>
                            <li><strong>Vercel Analytics:</strong> Monitorea el rendimiento técnico y la velocidad de carga de la aplicación.</li>
                        </ul>

                        <h3 className="font-bold text-slate-900 dark:text-white mt-6 mb-2">3.4 Cookies de Terceros y Servicios Integrados</h3>
                        <p className="mb-3">
                            Nuestro sitio utiliza servicios de terceros que pueden establecer sus propias cookies:
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li><strong>Crisp Chat:</strong> Nuestro widget de soporte al cliente utiliza cookies para restaurar su historial de chat y mantener la conversación activa.</li>
                            <li><strong>Twilio:</strong> Utilizado para la funcionalidad de llamadas (Dialer), puede usar almacenamiento local para gestionar la conexión de voz.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-display font-black text-slate-900 dark:text-white mb-4 uppercase tracking-wider italic">4. Gestión de Cookies</h2>

                        <h3 className="font-bold text-slate-900 dark:text-white mt-6 mb-2">4.1 Su Consentimiento</h3>
                        <p>
                            Al visitar nuestro sitio web por primera vez, le mostraremos un banner de cookies. Puede aceptar todas las cookies o gestionar sus preferencias. Las cookies estrictamente necesarias se instalarán por defecto ya que son requeridas para el funcionamiento del sitio.
                        </p>

                        <h3 className="font-bold text-slate-900 dark:text-white mt-6 mb-2">4.2 Control del Navegador</h3>
                        <p className="mb-3">
                            La mayoría de los navegadores web le permiten controlar las cookies a través de sus ajustes de configuración. Puede configurar su navegador para rechazar todas las cookies o para indicar cuándo se envía una cookie. Sin embargo, si deshabilita las cookies, es posible que algunas partes de Diktalo (como el inicio de sesión) no funcionen correctamente.
                        </p>
                        <p className="mb-2">Para más información sobre cómo gestionar las cookies en navegadores populares:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Chrome</a></li>
                            <li><a href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Mozilla Firefox</a></li>
                            <li><a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Apple Safari</a></li>
                            <li><a href="https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Microsoft Edge</a></li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-display font-black text-slate-900 dark:text-white mb-4 uppercase tracking-wider italic">5. Cambios en la Política de Cookies</h2>
                        <p>
                            Podemos actualizar esta Política de Cookies de vez en cuando para reflejar, por ejemplo, cambios en las cookies que utilizamos o por otras razones operativas, legales o reglamentarias. Por favor, vuelva a visitar esta Política de Cookies regularmente para mantenerse informado sobre nuestro uso de las cookies y tecnologías relacionadas.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-display font-black text-slate-900 dark:text-white mb-4 uppercase tracking-wider italic">6. Contacto</h2>
                        <p>
                            Si tiene alguna pregunta sobre nuestro uso de cookies u otras tecnologías, envíenos un correo electrónico a:<br /><br />
                            <strong>Diktalo Legal Team</strong><br />
                            Email: <a href="mailto:legal@diktalo.com" className="text-primary hover:underline">legal@diktalo.com</a>
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
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Diktalo AI. Transparent Tracking.</p>
                </div>
            </motion.div>
        </div>
    );
};

export default Cookies;
