import React from 'react';
import { motion } from 'framer-motion';
import { LegalLayout } from '../../layouts/LegalLayout';

export const Terms: React.FC = () => {
    return (
        <LegalLayout title="Términos de Servicio" lastUpdated="05 de Enero de 2026">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-12 text-slate-600 dark:text-slate-300 leading-relaxed font-medium"
            >
                <section>
                    <p>
                        Por favor, lea estos Términos de Servicio ("Términos", "Acuerdo") cuidadosamente antes de utilizar la plataforma Diktalo, la extensión de navegador "Diktalo Ghostwire" y cualquier servicio relacionado (colectivamente, el "Servicio") operado por Diktalo ("nosotros", "nos" o "nuestro").
                    </p>
                    <p className="mt-4">
                        Al acceder o utilizar el Servicio, usted acepta estar sujeto a estos Términos. Si no está de acuerdo con alguna parte de los términos, no podrá acceder al Servicio.
                    </p>
                </section>

                <section>
                    <h2>1. Uso del Servicio y Legalidad de Grabación</h2>

                    <h3 className="font-bold text-slate-900 dark:text-white mt-6 mb-2">1.1 Cumplimiento de Leyes de Grabación</h3>
                    <p className="mb-3">
                        Diktalo proporciona herramientas para la grabación y transcripción de audio y llamadas. <strong>Usted reconoce y acepta que es su exclusiva responsabilidad cumplir con todas las leyes aplicables relativas a la grabación de conversaciones.</strong>
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>En muchas jurisdicciones, se requiere el consentimiento de una o todas las partes antes de grabar una llamada o conversación.</li>
                        <li>Usted garantiza que obtendrá todos los consentimientos necesarios antes de grabar a cualquier persona o entidad utilizando nuestros Servicios (incluyendo el Dialer y la Extensión de Chrome).</li>
                        <li><strong>Diktalo no se hace responsable</strong> de ninguna grabación ilegal realizada por usted.</li>
                    </ul>

                    <h3 className="font-bold text-slate-900 dark:text-white mt-6 mb-2">1.2 Licencia de Uso</h3>
                    <p>
                        Le otorgamos una licencia limitada, no exclusiva e intransferible para utilizar nuestro Servicio para sus fines personales o comerciales internos, sujeta a estos Términos.
                    </p>
                </section>

                <section>
                    <h2>2. Cuentas y Seguridad</h2>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li><strong>Registro:</strong> Debe proporcionar información precisa y completa al crear una cuenta.</li>
                        <li><strong>Seguridad:</strong> Usted es responsable de salvaguardar la contraseña que utiliza para acceder al Servicio y de cualquier actividad o acción bajo su contraseña.</li>
                        <li><strong>Notificación:</strong> Debe notificarnos inmediatamente sobre cualquier violación de seguridad o uso no autorizado de su cuenta.</li>
                    </ul>
                </section>

                <section>
                    <h2>3. Contenido del Usuario y Propiedad</h2>

                    <h3 className="font-bold text-slate-900 dark:text-white mt-6 mb-2">3.1 Su Propiedad</h3>
                    <p>
                        Usted conserva todos los derechos y la propiedad de las grabaciones de audio, transcripciones, textos y otros datos que suba o genere a través de Diktalo ("Contenido del Usuario"). <strong>Nosotros no reclamamos la propiedad de sus datos.</strong>
                    </p>

                    <h3 className="font-bold text-slate-900 dark:text-white mt-6 mb-2">3.2 Licencia para Procesamiento</h3>
                    <p>
                        Para proporcionarle el Servicio (como transcribir audio, generar resúmenes con IA o permitirle chatear con sus datos), usted otorga a Diktalo una licencia mundial, libre de regalías y sublicenciable para usar, copiar, modificar, crear trabajos derivados, distribuir y procesar su Contenido del Usuario <strong>exclusivamente con el propósito de operar y mejorar el Servicio para usted.</strong>
                    </p>
                </section>

                <section>
                    <h2>4. Pagos y Suscripciones</h2>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li><strong>4.1 Planes de Pago:</strong> Algunas partes del Servicio se facturan mediante suscripción ("Planes Pro", "Business"). Se le facturará por adelantado de forma recurrente y periódica (mensual o anual).</li>
                        <li><strong>4.2 Cancelación:</strong> Puede cancelar su suscripción en cualquier momento desde el panel de control de su cuenta. Su acceso a las funciones premium continuará hasta el final del ciclo de facturación actual.</li>
                        <li><strong>4.3 Cambios de Precio:</strong> Diktalo se reserva el derecho de ajustar los precios de nuestros Servicios. Cualquier cambio de precio se notificará con antelación y no afectará a los períodos ya pagados.</li>
                        <li><strong>4.4 Reembolsos:</strong> Salvo que la ley exija lo contrario, las tarifas de suscripción pagadas no son reembolsables.</li>
                    </ul>
                </section>

                <section className="p-8 bg-amber-50 dark:bg-amber-900/10 rounded-[2rem] border border-amber-200 dark:border-amber-700/30">
                    <h2 className="text-xl font-display font-black text-amber-600 dark:text-amber-400 mb-4 uppercase tracking-wider italic !mt-0">5. Descargos de Responsabilidad de IA (Disclaimer)</h2>

                    <h3 className="font-bold text-slate-900 dark:text-white mt-2 mb-2">5.1 Precisión</h3>
                    <p>
                        Nuestro Servicio utiliza tecnologías de Inteligencia Artificial (IA) para la transcripción y el análisis. <strong>La IA puede cometer errores.</strong> Diktalo no garantiza la precisión, integridad o fiabilidad del 100% de las transcripciones, resúmenes o respuestas generadas por "Ask Diktalo".
                    </p>
                    <p className="mt-2 text-sm italic">
                        * Usted debe verificar cualquier información crítica generada por el Servicio antes de tomar decisiones basadas en ella.
                    </p>

                    <h3 className="font-bold text-slate-900 dark:text-white mt-4 mb-2">5.2 No Asesoramiento Profesional</h3>
                    <p>
                        El Servicio no sustituye el asesoramiento profesional (legal, médico, financiero, etc.).
                    </p>
                </section>

                <section>
                    <h2>6. Política de Uso Aceptable</h2>
                    <p className="mb-3">Usted acepta no utilizar el Servicio para:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>Grabar a personas sin su consentimiento en violación de la ley.</li>
                        <li>Subir contenido que sea ilegal, difamatorio, obsceno o que infrinja la propiedad intelectual de terceros.</li>
                        <li>Intentar realizar ingeniería inversa, descompilar o piratear cualquier parte del Servicio.</li>
                        <li>Utilizar el Servicio para entrenar modelos de IA competidores.</li>
                        <li>Realizar llamadas automáticas (robocalls) o spam utilizando nuestro Dialer.</li>
                    </ul>
                </section>

                <section>
                    <h2>7. Limitación de Responsabilidad</h2>
                    <p>
                        En la medida máxima permitida por la ley, en ningún caso Diktalo, ni sus directores, empleados, socios o proveedores, serán responsables de ningún daño indirecto, incidental, especial, consecuente o punitivo, incluyendo sin limitación, pérdida de beneficios, datos, uso o buena voluntad, resultantes de su uso o incapacidad de usar el Servicio.
                    </p>
                </section>

                <section>
                    <h2>8. Terminación</h2>
                    <p>
                        Podemos terminar o suspender su cuenta inmediatamente, sin previo aviso ni responsabilidad, por cualquier motivo, incluyendo, entre otros, si usted incumple los Términos. Tras la terminación, su derecho a utilizar el Servicio cesará inmediatamente.
                    </p>
                </section>

                <section>
                    <h2>9. Ley Aplicable</h2>
                    <p>
                        Estos Términos se regirán e interpretarán de acuerdo con las leyes de España (o la jurisdicción que corresponda), sin tener en cuenta sus disposiciones sobre conflictos de leyes.
                    </p>
                </section>

                <section>
                    <h2>10. Cambios</h2>
                    <p>
                        Nos reservamos el derecho, a nuestra sola discreción, de modificar o reemplazar estos Términos en cualquier momento. Si una revisión es material, intentaremos proporcionar un aviso de al menos 30 días antes de que entren en vigor los nuevos términos.
                    </p>
                </section>

                <section>
                    <h2>11. Contacto</h2>
                    <p>
                        Si tiene alguna pregunta sobre estos Términos, por favor contáctenos en:<br /><br />
                        <strong>Diktalo Legal Team</strong><br />
                        Correo electrónico: <a href="mailto:legal@diktalo.com" className="text-primary hover:underline">legal@diktalo.com</a>
                    </p>
                </section>
            </motion.div>
        </LegalLayout>
    );
};

export default Terms;
