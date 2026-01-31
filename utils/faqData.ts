export interface FAQItemData {
    id: string;
    category: 'security' | 'pricing' | 'hardware' | 'ai' | 'extension' | 'usage' | 'integrations' | 'legal';
    priority: number; // 1-10 (10 is highest)
    en: {
        question: string;
        answer: string;
    };
    es: {
        question: string;
        answer: string;
    };
}

export const faqPool: FAQItemData[] = [
    // --- SECURITY & PRIVACY (Priority 10) ---
    {
        id: 'sec-encryption',
        category: 'security',
        priority: 10,
        en: {
            question: "Is my data and voice secure?",
            answer: "Absolutely. We use AES-256 encryption at rest and TLS 1.3 in transit. Your recordings are private by design; they are never sold to third parties or used to train public models. We are GDPR and SOC2 compliant in our infrastructure."
        },
        es: {
            question: "¿Es segura mi información y mi voz?",
            answer: "Totalmente. Utilizamos encriptación AES-256 en reposo y TLS 1.3 en tránsito. Tus grabaciones son privadas por diseño; nunca se venden a terceros ni se usan para entrenar modelos públicos. Cumplimos con estándares GDPR y SOC2 en nuestra infraestructura."
        }
    },
    {
        id: 'sec-training',
        category: 'security',
        priority: 9,
        en: {
            question: "Does the AI learn from my specific voice?",
            answer: "No. Your data is isolated and encrypted. We do not use user recordings to train our global base models. In the future, you may opt-in to 'Personal AI' features, but it will always be your private instance."
        },
        es: {
            question: "¿La IA aprende de mi voz específica?",
            answer: "No. Tus datos están aislados y encriptados. No utilizamos las grabaciones de los usuarios para entrenar nuestros modelos base globales. En el futuro, podrás activar funciones de 'IA Personal', pero será siempre tu instancia privada."
        }
    },

    // --- HARDWARE & PLATFORMS (Priority 10) ---
    {
        id: 'hw-plaud',
        category: 'hardware',
        priority: 10,
        en: {
            question: "Do I need the Plaud device or special hardware?",
            answer: "No. Diktalo is 100% software. You can record from your phone, laptop, or through our Chrome Extension. Save the $159 cost of extra hardware and use the device you already have."
        },
        es: {
            question: "¿Necesito el dispositivo Plaud o hardware especial?",
            answer: "No. Diktalo es 100% software. Puedes grabar desde tu móvil, tu laptop o mediante nuestra extensión de Chrome. Ahorra los $159 que cuesta el hardware adicional y usa el dispositivo que ya tienes."
        }
    },
    {
        id: 'hw-mobile-app',
        category: 'hardware',
        priority: 8,
        en: {
            question: "Is there a native app for iOS/Android?",
            answer: "Diktalo is a Progressive Web App (PWA). You don't need to visit the App Store. Just open Diktalo in your phone's browser and select 'Add to Home Screen' to have a full native experience."
        },
        es: {
            question: "¿Hay una app nativa para iOS/Android?",
            answer: "Diktalo es una PWA (Progressive Web App). No necesitas ir a la App Store. Simplemente abre Diktalo en el navegador de tu móvil y selecciona 'Añadir a la pantalla de inicio' para tener una experiencia nativa completa."
        }
    },

    // --- PRICING & PLANS (Priority 10) ---
    {
        id: 'prc-exceed-minutes',
        category: 'pricing',
        priority: 10,
        en: {
            question: "What happens if I exceed my monthly minutes?",
            answer: "We notify you when you reach 80% and 100% of your usage. If you need more, you can purchase 'Minute Top-ups' instantly or upgrade to a higher plan prorated."
        },
        es: {
            question: "¿Qué pasa si consumo todos mis minutos mensuales?",
            answer: "Te avisamos cuando llegas al 80% y al 100% de tu uso. Si necesitas más, puedes comprar 'Recargas de Minutos' al instante o subir de plan con un pago prorrateado."
        }
    },
    {
        id: 'prc-cancel',
        category: 'pricing',
        priority: 9,
        en: {
            question: "Can I cancel my subscription anytime?",
            answer: "Yes. There are no long-term contracts. You can cancel with a single click from your billing settings. You will retain access until the end of your prepaid period."
        },
        es: {
            question: "¿Puedo cancelar mi suscripción en cualquier momento?",
            answer: "Sí. No hay contratos de permanencia. Puedes cancelar con un solo clic desde tus ajustes de facturación. Mantendrás el acceso hasta que finalice el periodo que ya has pagado."
        }
    },

    // --- EXTENSION & DIALER (Priority 8) ---
    {
        id: 'ext-ghostwire',
        category: 'extension',
        priority: 8,
        en: {
            question: "How does the Ghostwire extension work?",
            answer: "It injects a recording trigger directly into your browser. It allows you to record Google Meet, Zoom web, or any tab audio without needing to share your screen or invite bots."
        },
        es: {
            question: "¿Cómo funciona la extensión Ghostwire?",
            answer: "Inyecta un disparador de grabación directamente en tu navegador. Permite grabar Google Meet, Zoom web o cualquier audio de pestaña sin necesidad de compartir pantalla ni invitar bots."
        }
    },
    {
        id: 'ext-system-audio',
        category: 'extension',
        priority: 7,
        en: {
            question: "Can I record desktop apps like Slack or Discord?",
            answer: "Yes. Our extension can capture System Audio on Windows and Mac (with permissions), allowing you to record meetings even if they happen outside the browser."
        },
        es: {
            question: "¿Puedo grabar apps de escritorio como Slack o Discord?",
            answer: "Sí. Nuestra extensión puede capturar el Audio del Sistema en Windows y Mac (con permisos), permitiéndote grabar reuniones aunque ocurran fuera del navegador."
        }
    },

    // --- AI & PRECISION (Priority 8) ---
    {
        id: 'ai-languages',
        category: 'ai',
        priority: 8,
        en: {
            question: "How many languages are supported?",
            answer: "Over 112 languages and dialects. The AI automatically detects the language being spoken. You can also mix languages in a single meeting and it will understand both."
        },
        es: {
            question: "¿Cuántos idiomas son soportados?",
            answer: "Más de 112 idiomas y dialectos. La IA detecta automáticamente el idioma hablado. Incluso puedes mezclar idiomas en una misma reunión y los entenderá ambos."
        }
    },
    {
        id: 'ai-diarization',
        category: 'ai',
        priority: 8,
        en: {
            question: "Does it separate different speakers?",
            answer: "Yes. We use advanced Diarization to identify when 'Speaker A' or 'Speaker B' is talking. You can later assign names to these speakers for a perfect transcript."
        },
        es: {
            question: "¿Separa a los diferentes locutores?",
            answer: "Sí. Utilizamos Diarización avanzada para identificar cuándo habla el 'Locutor A' o el 'Locutor B'. Luego puedes asignar nombres a estos locutores para una transcripción perfecta."
        }
    },
    {
        id: 'ai-noise',
        category: 'ai',
        priority: 6,
        en: {
            question: "What if there is background noise?",
            answer: "Our engine includes neural noise cancellation filter. It significantly reduces hums, fans, and street noise to focus exclusively on the human voice."
        },
        es: {
            question: "¿Qué pasa si hay ruido de fondo?",
            answer: "Nuestro motor incluye un filtro de cancelación de ruido neuronal. Reduce significativamente zumbidos, ventiladores y ruido de calle para centrarse exclusivamente en la voz humana."
        }
    },

    // --- USAGE & EXPORT (Priority 7) ---
    {
        id: 'usg-export-formats',
        category: 'usage',
        priority: 9,
        en: {
            question: "Which export formats are available?",
            answer: "You can export the AI analysis and literal transcripts to PDF, DOCX (Word), TXT and JSON. You can also download the original audio as MP3."
        },
        es: {
            question: "¿Qué formatos de exportación hay disponibles?",
            answer: "Puedes exportar el análisis IA y la transcripción literal a PDF, DOCX (Word), TXT y JSON. También puedes descargar el audio original en MP3."
        }
    },
    {
        id: 'usg-limit-per-rec',
        category: 'usage',
        priority: 6,
        en: {
            question: "Is there a limit per recording?",
            answer: "You can record sessions up to 4 hours long (or 500MB). If your meeting exceeds this, just stop and start a new one immediately."
        },
        es: {
            question: "¿Hay un límite por grabación?",
            answer: "Puedes grabar sesiones de hasta 4 horas de duración (o 500MB). Si tu reunión supera esto, simplemente detén y comienza una nueva al instante."
        }
    },

    // --- INTEGRATIONS (Priority 7) ---
    {
        id: 'int-zapier',
        category: 'integrations',
        priority: 7,
        en: {
            question: "Does it connect with CRM like Salesforce?",
            answer: "Yes, via Zapier. You can automatically send your AI summaries to Salesforce, HubSpot, Notion, or Slack as soon as the recording is processed."
        },
        es: {
            question: "¿Se conecta con CRM como Salesforce?",
            answer: "Sí, a través de Zapier. Puedes enviar tus resúmenes IA automáticamente a Salesforce, HubSpot, Notion o Slack en cuanto se procese la grabación."
        }
    },
    {
        id: 'int-calendar',
        category: 'integrations',
        priority: 6,
        en: {
            question: "Can it sync with Google Calendar?",
            answer: "Yes. By syncing your calendar, Diktalo can pre-fill meeting names, participants, and dates for your recordings automatically."
        },
        es: {
            question: "¿Puede sincronizarse con Google Calendar?",
            answer: "Sí. Al sincronizar tu calendario, Diktalo puede rellenar automáticamente nombres de reuniones, participantes y fechas para tus grabaciones."
        }
    },

    // --- LEGAL & COMPLIANCE (Priority 8) ---
    {
        id: 'leg-recording-laws',
        category: 'legal',
        priority: 8,
        en: {
            question: "Is it legal to record phone calls?",
            answer: "Recording laws vary by country. In many places, 'single-party consent' is enough if you are a participant. We recommend always informing participants as a best practice."
        },
        es: {
            question: "¿Es legal grabar llamadas telefónicas?",
            answer: "Las leyes de grabación varían según el país. En muchos sitios, el 'consentimiento de una parte' es suficiente si tú eres participante. Recomendamos informar siempre como buena práctica."
        }
    },

    // --- NEW LONG-TAIL QUESTIONS (Pool Expansion) ---
    {
        id: 'ai-jargon',
        category: 'ai',
        priority: 5,
        en: {
            question: "Does it understand medical or legal jargon?",
            answer: "Yes. Our Large Language Models are trained on professional datasets. You can also define custom vocabulary for very niche terms."
        },
        es: {
            question: "¿Entiende jerga médica o legal?",
            answer: "Sí. Nuestros modelos de lenguaje están entrenados con datasets profesionales. También puedes definir vocabulario personalizado para términos muy específicos."
        }
    },
    {
        id: 'usg-offline',
        category: 'usage',
        priority: 4,
        en: {
            question: "Can I record without internet?",
            answer: "Yes. The recording happens locally on your device. You only need internet to upload and process the transcript/analysis."
        },
        es: {
            question: "¿Puedo grabar sin internet?",
            answer: "Sí. La grabación ocurre localmente en tu dispositivo. Solo necesitas internet para subir y procesar la transcripción y el análisis."
        }
    },
    {
        id: 'ext-privacy-mode',
        category: 'extension',
        priority: 5,
        en: {
            question: "Does the extension see my passwords?",
            answer: "No. The extension only requests 'Audio Capture' permissions. It does not read your screen content or keyboard inputs."
        },
        es: {
            question: "¿La extensión ve mis contraseñas?",
            answer: "No. La extensión solo solicita permisos de 'Captura de Audio'. No lee el contenido de tu pantalla ni tus entradas de teclado."
        }
    },
    {
        id: 'hw-storage',
        category: 'usage',
        priority: 5,
        en: {
            question: "How much storage do I have?",
            answer: "Free plans have 1GB. Pro and Business plans range from 10GB to Unlimited, depending on your tier."
        },
        es: {
            question: "¿Cuánto almacenamiento tengo?",
            answer: "Los planes gratuitos tienen 1GB. Los planes Pro y Business van desde 10GB hasta Ilimitado, según tu nivel."
        }
    },
    {
        id: 'prc-refunds',
        category: 'pricing',
        priority: 3,
        en: {
            question: "Do you offer refunds?",
            answer: "We offer a 7-day money-back guarantee for initial subscriptions if you are not satisfied with the quality. Just contact support."
        },
        es: {
            question: "¿Ofrecéis reembolsos?",
            answer: "Ofrecemos una garantía de devolución de 7 días para suscripciones iniciales si no estás satisfecho con la calidad. Solo contacta con soporte."
        }
    },
    {
        id: 'ai-summaries',
        category: 'ai',
        priority: 8,
        en: {
            question: "Can I customize the AI summary format?",
            answer: "Yes. In 'Intelligence Settings' you can choose between SOAP notes, BANT analysis, Executive Summary, or create your own custom prompt."
        },
        es: {
            question: "¿Puedo personalizar el formato del resumen IA?",
            answer: "Sí. En 'Ajustes de Inteligencia' puedes elegir entre notas SOAP, análisis BANT, Resumen Ejecutivo, o crear tu propio prompt personalizado."
        }
    },
    {
        id: 'leg-data-deletion',
        category: 'legal',
        priority: 7,
        en: {
            question: "Can I delete my data permanently?",
            answer: "Yes. When you delete a recording, it is wiped from our servers immediately. When you delete your account, all associated data is purged within 30 days."
        },
        es: {
            question: "¿Puedo borrar mis datos permanentemente?",
            answer: "Sí. Al borrar una grabación, se elimina de nuestros servidores al instante. Al borrar tu cuenta, todos los datos asociados se purgan en un plazo de 30 días."
        }
    },
    {
        id: 'int-api',
        category: 'integrations',
        priority: 6,
        en: {
            question: "Do you have a public API?",
            answer: "Yes, our API is available for Business+ customers who want to integrate Diktalo recording and analysis directly into their own software."
        },
        es: {
            question: "¿Tenéis una API pública?",
            answer: "Sí, nuestra API está disponible para clientes Business+ que quieran integrar la grabación y análisis de Diktalo directamente en su propio software."
        }
    },
    {
        id: 'hw-browser-support',
        category: 'hardware',
        priority: 4,
        en: {
            question: "Which browsers are supported?",
            answer: "We officially support Chrome, Edge, Safari, and Firefox. For the extension, a Chromium-based browser (Chrome, Edge, Brave) is required."
        },
        es: {
            question: "¿Qué navegadores soportáis?",
            answer: "Soportamos oficialmente Chrome, Edge, Safari y Firefox. Para la extensión, se requiere un navegador basado en Chromium (Chrome, Edge, Brave)."
        }
    },
    // --- ADDITIONAL LONG-TAIL (Expanding to 45) ---
    {
        id: 'usg-transcription-speed',
        category: 'usage',
        priority: 7,
        en: {
            question: "How long does transcription take?",
            answer: "On average, a 1-hour recording is processed in less than 2 minutes. Our distributed cloud infrastructure handles the heavy lifting in parallel."
        },
        es: {
            question: "¿Cuánto tarda la transcripción?",
            answer: "De media, una grabación de 1 hora se procesa en menos de 2 minutos. Nuestra infraestructura en la nube distribuida hace el trabajo pesado en paralelo."
        }
    },
    {
        id: 'ai-accuracy-percent',
        category: 'ai',
        priority: 6,
        en: {
            question: "What is the accuracy rate?",
            answer: "For clear audio in supported languages, we achieve up to 98% accuracy. This is significantly higher than standard dictation tools thanks to our specialized model tuning."
        },
        es: {
            question: "¿Cuál es la tasa de precisión?",
            answer: "Con audio claro en idiomas soportados, alcanzamos hasta un 98% de precisión. Esto es significativamente mayor que las herramientas de dictado estándar gracias a nuestro ajuste de modelos especializados."
        }
    },
    {
        id: 'sec-ownership',
        category: 'security',
        priority: 10,
        en: {
            question: "Who owns the recordings?",
            answer: "You do. 100%. We are merely the custodians of your data. You can download and delete your recordings at any time; we don't hold your content hostage."
        },
        es: {
            question: "¿Quién es el dueño de las grabaciones?",
            answer: "Tú. Al 100%. Somos simplemente los custodios de tus datos. Puedes descargar y borrar tus grabaciones cuando quieras; no retenemos tu contenido."
        }
    },
    {
        id: 'int-slack-notifications',
        category: 'integrations',
        priority: 5,
        en: {
            question: "Can I get summaries in Slack?",
            answer: "Yes! Our Slack integration can post a meeting summary and key action items to a specific channel as soon as a recording is finished."
        },
        es: {
            question: "¿Puedo recibir resúmenes en Slack?",
            answer: "¡Sí! Nuestra integración con Slack puede publicar un resumen de la reunión y los puntos clave en un canal específico en cuanto termina la grabación."
        }
    },
    {
        id: 'ext-tab-capture',
        category: 'extension',
        priority: 7,
        en: {
            question: "Does the extension record other tabs?",
            answer: "Only the one you select. For privacy, we don't tap into your entire browser history—only the specific tab you decide to record."
        },
        es: {
            question: "¿La extensión graba otras pestañas?",
            answer: "Solo la que tú selecciones. Por privacidad, no accedemos a todo tu historial de navegación, solo a la pestaña específica que decidas grabar."
        }
    },
    {
        id: 'prc-billing-currency',
        category: 'pricing',
        priority: 4,
        en: {
            question: "Which currencies do you accept?",
            answer: "We primarily bill in USD, but our payment processor (Stripe) handles automatic conversion for over 135 currencies worldwide."
        },
        es: {
            question: "¿Qué monedas aceptáis?",
            answer: "Facturamos principalmente en USD, pero nuestro procesador de pagos (Stripe) gestiona la conversión automática para más de 135 monedas en todo el mundo."
        }
    },
    {
        id: 'usg-multiple-files',
        category: 'usage',
        priority: 6,
        en: {
            question: "Can I upload multiple files at once?",
            answer: "Yes. Our dashboard supports bulk uploads. You can select up to 10 files simultaneously to process an entire week's worth of meetings in one go."
        },
        es: {
            question: "¿Puedo subir varios archivos a la vez?",
            answer: "Sí. Nuestro panel soporta subidas masivas. Puedes seleccionar hasta 10 archivos simultáneamente para procesar todas las reuniones de una semana de una sola vez."
        }
    },
    {
        id: 'ai-speaker-naming',
        category: 'ai',
        priority: 5,
        en: {
            question: "Will it remember speaker names?",
            answer: "If you rename a speaker in a recurring project, Diktalo will use voice fingerprinting to suggest that same name in future recordings of that project."
        },
        es: {
            question: "¿Recordará los nombres de los locutores?",
            answer: "Si renombras a un locutor en un proyecto recurrente, Diktalo usará huella de voz para sugerir ese mismo nombre en futuras grabaciones de ese proyecto."
        }
    },
    {
        id: 'sec-offline-storage',
        category: 'security',
        priority: 6,
        en: {
            question: "Is audio stored on my hard drive?",
            answer: "Temporarily during recording for safety. Once uploaded and processed, local cache is cleared. You can also opt for 'Cloud-Only' mode in settings."
        },
        es: {
            question: "¿El audio se guarda en mi disco duro?",
            answer: "Temporalmente durante la grabación por seguridad. Una vez subido y procesado, el cache local se limpia. También puedes optar por el modo 'Solo Nube' en ajustes."
        }
    },
    {
        id: 'hw-chromebook',
        category: 'hardware',
        priority: 3,
        en: {
            question: "Does it work on Chromebooks?",
            answer: "Absolutely. Since Diktalo is web-based and our extension is Chromium-native, Chromebooks are excellent devices for using Diktalo."
        },
        es: {
            question: "¿Funciona en Chromebooks?",
            answer: "Totalmente. Dado que Diktalo es basado en web y nuestra extensión es nativa de Chromium, los Chromebooks son dispositivos excelentes para usar Diktalo."
        }
    },
    {
        id: 'usg-editing',
        category: 'usage',
        priority: 8,
        en: {
            question: "Can I edit the transcript?",
            answer: "Yes. Our Inline Editor allows you to correct any words, change speakers, or add notes. The AI summary will intelligently update if you make major changes."
        },
        es: {
            question: "¿Puedo editar la transcripción?",
            answer: "Sí. Nuestro Editor Integrado te permite corregir palabras, cambiar locutores o añadir notas. El resumen IA se actualizará de forma inteligente si haces cambios importantes."
        }
    },
    {
        id: 'prc-vat',
        category: 'pricing',
        priority: 5,
        en: {
            question: "Do you provide VAT invoices?",
            answer: "Yes. For companies in the EU or UK, you can enter your VAT ID during checkout to receive compliant tax invoices automatically."
        },
        es: {
            question: "¿Proporcionáis facturas con IVA?",
            answer: "Sí. Para empresas en la UE o el Reino Unido, puedes introducir tu NIF-IVA durante el pago para recibir facturas fiscales conformes automáticamente."
        }
    },
    {
        id: 'int-notion',
        category: 'integrations',
        priority: 7,
        en: {
            question: "Can I sync with Notion?",
            answer: "Yes. You can set up a workflow to automatically create a new page in your Notion Database for every meeting, including the summary and transcript."
        },
        es: {
            question: "¿Puedo sincronizar con Notion?",
            answer: "Sí. Puedes configurar un flujo de trabajo para crear automáticamente una nueva página en tu Base de Datos de Notion por cada reunión, incluyendo el resumen y la transcripción."
        }
    },
    {
        id: 'ai-context-awareness',
        category: 'ai',
        priority: 4,
        en: {
            question: "How does the AI know the context?",
            answer: "You can provide a 'Meeting Context' or 'Agenda' before recording. The AI will use this info to dramatically improve the accuracy of names and specialized topics."
        },
        es: {
            question: "¿Cómo sabe la IA el contexto?",
            answer: "Puedes proporcionar un 'Contexto de la Reunión' o 'Agenda' antes de grabar. La IA usará esta info para mejorar drásticamente la precisión de nombres y temas especializados."
        }
    },
    {
        id: 'sec-mfa',
        category: 'security',
        priority: 8,
        en: {
            question: "Do you support 2FA / MFA?",
            answer: "Yes. You can enable Multi-Factor Authentication via Authenticator apps or Email to add an extra layer of security to your account."
        },
        es: {
            question: "¿Soportáis 2FA / MFA?",
            answer: "Sí. Puedes activar la Autenticación de Múltiples Factores mediante apps de autenticación o Email para añadir una capa extra de seguridad a tu cuenta."
        }
    },
    {
        id: 'leg-hipaa',
        category: 'legal',
        priority: 4,
        en: {
            question: "Are you HIPAA compliant?",
            answer: "We offer HIPAA-compliant data handling for Business+ Enterprise customers. This includes BAA agreements and enhanced encryption protocols."
        },
        es: {
            question: "¿Cumplís con HIPAA?",
            answer: "Ofrecemos gestión de datos conforme a HIPAA para clientes Business+ Enterprise. Esto incluye la firma de acuerdos BAA y protocolos de encriptación mejorados."
        }
    },
    {
        id: 'usg-search',
        category: 'usage',
        priority: 7,
        en: {
            question: "Can I search through my recordings?",
            answer: "Yes. Our global search allows you to find specific keywords across all your meeting transcripts simultaneously. Find that one detail in seconds."
        },
        es: {
            question: "¿Puedo buscar entre mis grabaciones?",
            answer: "Sí. Nuestra búsqueda global te permite encontrar palabras clave específicas en todas las transcripciones de tus reuniones simultáneamente. Encuentra ese detalle en segundos."
        }
    },
    {
        id: 'prc-annual-discount',
        category: 'pricing',
        priority: 9,
        en: {
            question: "Is there an annual discount?",
            answer: "Yes. If you choose annual billing, you save up to 20% compared to monthly billing—effectively getting 2 months free per year."
        },
        es: {
            question: "¿Hay un descuento anual?",
            answer: "Sí. Si eliges facturación anual, ahorras hasta un 20% comparado con la mensual, lo que equivale a recibir 2 meses gratis al año."
        }
    },
    {
        id: 'ai-translation',
        category: 'ai',
        priority: 6,
        en: {
            question: "Can the AI translate the transcript?",
            answer: "Yes. Once a recording is processed, you can use the 'Translate' feature to get the summary and transcript in any other supported language."
        },
        es: {
            question: "¿Puede la IA traducir la transcripción?",
            answer: "Sí. Una vez procesada una grabación, puedes usar la función 'Traducir' para obtener el resumen y la transcripción en cualquier otro idioma soportado."
        }
    },
    {
        id: 'hw-battery-usage',
        category: 'usage',
        priority: 3,
        en: {
            question: "Does recording drain the battery?",
            answer: "Diktalo is highly optimized. Recording on a mobile browser or laptop uses about the same energy as playing a video on YouTube."
        },
        es: {
            question: "¿La grabación consume mucha batería?",
            answer: "Diktalo está muy optimizado. Grabar en un navegador móvil o portátil consume aproximadamente la misma energía que ver un vídeo en YouTube."
        }
    }
];
