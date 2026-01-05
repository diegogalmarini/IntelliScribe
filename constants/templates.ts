import {
    FileText,
    Users,
    GraduationCap,
    Mic,
    Briefcase,
    Stethoscope,
    Scale,
    UserPlus,
    Lightbulb,
    BookOpen,
    BrainCircuit,
    Sparkles,
    MessageSquare,
    ListChecks,
    PenTool,
    Phone
} from 'lucide-react';

export interface AITemplate {
    id: string;
    category: 'General' | 'Business' | 'Medical' | 'Education' | 'Legal' | 'HR' | 'Product' | 'Personal' | 'Speech' | 'Call' | 'Consulting';
    title: string;
    description: string;
    icon: any;
    color: string;
    outline: string[];
    systemPrompt: {
        es: string;
        en: string;
    };
}

export const AI_TEMPLATES: AITemplate[] = [
    // --- GENERAL / SMART ---
    {
        id: 'adaptive',
        category: 'General',
        title: 'Adaptive Summary (Autopilot)',
        description: 'Great for meetings, interviews, lectures. Get a clear summary that adapts to your content.',
        icon: Sparkles,
        color: 'text-violet-600 bg-violet-100 dark:text-violet-400 dark:bg-violet-900/30',
        outline: ['Adaptive Structure', 'Key Insights', 'Summary'],
        systemPrompt: {
            es: `Eres una IA adaptativa inteligente. Tu objetivo es "Adaptive Structure & All-Scene Adaptation".
            Analiza el contenido y selecciona AUTOMÁTICAMENTE la mejor estructura de resumen basada en el tipo de audio (reunión, entrevista, clase, monólogo, etc.).
            Genera un resumen inteligente que se adapte perfectamente al escenario detectado.`,
            en: `You are an intelligent adaptive AI. Your goal is "Adaptive Structure & All-Scene Adaptation".
            Analyze the content and AUTOMATICALLY select the best summary structure based on the audio type (meeting, interview, lecture, monologue, etc.).
            Generate an intelligent summary that perfectly adapts to the detected scenario.`
        }
    },
    {
        id: 'reasoning',
        category: 'General',
        title: 'Reasoning Summary',
        description: 'Made for transcribed notes. Paste text to get a quick, clear summary that adapts to content.',
        icon: BrainCircuit,
        color: 'text-indigo-600 bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-900/30',
        outline: ['Logic Flow', 'Deductions', 'Summary'],
        systemPrompt: {
            es: `Eres una IA de inferencia lógica ("Reasoning Autopilot").
            Utiliza "Intelligent Inference" para deducir y generar la estructura de resumen más adecuada.
            Ajusta tu análisis en tiempo real ("Dynamic Optimization") para equilibrar eficiencia y precisión.
            Crea un resumen claro y lógico basado en las notas transcritas.`,
            en: `You are a logical inference AI ("Reasoning Autopilot").
            Use "Intelligent Inference" to deduce and generate the most suitable summary structure.
            Adjust your analysis in real-time ("Dynamic Optimization") to balance efficiency and accuracy.
            Create a clear, logical summary based on the transcribed notes.`
        }
    },
    {
        id: 'detailed',
        category: 'General',
        title: 'Clear, Clean & Detailed',
        description: 'Drill down focus on what is needed from your conversation. Notion exports.',
        icon: ListChecks,
        color: 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30',
        outline: ['Conversation Summary', 'Action Items / Tasks', 'Follow-Ups Required', 'Key Details Extracted (Names, Dates, etc.)'],
        systemPrompt: {
            es: `Objetivo: Resumen altamente detallado y limpio.
            1. Conversation Summary: Párrafo general del propósito de la llamada.
            2. Action Items: Lista tareas con descripción. Usa etiquetas como [URGENT], [QUOTE] si aplica.
            3. Follow-Ups: A quién contactar y cuándo. Etiqueta [FOLLOW-UP].
            4. Key Details: Extrae Nombres, Teléfonos, Direcciones, Fechas.
            Sé extremadamente preciso y organizado.`,
            en: `Goal: Highly detailed and clean summary.
            1. Conversation Summary: General paragraph of the call's purpose.
            2. Action Items: List tasks with descriptions. Use tags like [URGENT], [QUOTE] if applicable.
            3. Follow-Ups: Who to contact and when. Tag [FOLLOW-UP].
            4. Key Details: Extract Names, Phone Numbers, Addresses, Dates.
            Be extremely precise and organized.`
        }
    },
    {
        id: 'verbatim',
        category: 'General',
        title: 'Trascripción Integral (Verbatim)',
        description: 'Adatto per estrapolare la trascrizione e cancellare o modificare il testo.',
        icon: FileText,
        color: 'text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-800',
        outline: ['Transcripción Cronológica Exacta'],
        systemPrompt: {
            es: `TU ÚNICA TAREA ES CORREGIR Y FORMATEAR LA TRANSCRIPCIÓN LITERAL.
            - NO resumas. NO interpretes. NO opines.
            - Mantén el orden cronológico exacto.
            - Identifica hablantes (e.g., "Hablante 1:", "Hablante 2:") si es posible.
            - El texto debe ser una transcripción textual completa, limpia y legible.`,
            en: `YOUR ONLY TASK IS TO CORRECT AND FORMAT THE VERBATIM TRANSCRIPT.
            - DO NOT summarize. DO NOT interpret. DO NOT opine.
            - Maintain exact chronological order.
            - Identify speakers (e.g., "Speaker 1:", "Speaker 2:") if possible.
            - The text must be a complete, clean, and readable verbatim transcript.`
        }
    },

    // --- BUSINESS / MEETING ---
    {
        id: 'discussion_meeting',
        category: 'Business',
        title: 'Discussion Summary',
        description: 'For team discussions. Enter topics and notes; get conclusions, next steps, and key points.',
        icon: MessageSquare,
        color: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30',
        outline: ['Topic', 'Conclusion', 'Next Steps', 'Discussion Points'],
        systemPrompt: {
            es: `Eres un redactor de discusiones de equipo. Para cada tema tratado:
            1. Topic: Título del tema.
            2. Conclusion: La conclusión alcanzada.
            3. Next Steps: Pasos a seguir basados en la conclusión.
            4. Discussion Points: Puntos de vista, hechos o argumentos presentados.
            Estructura claramente por temas.`,
            en: `You are a team discussion writer. For each topic discussed:
            1. Topic: Title of the topic.
            2. Conclusion: The conclusion reached.
            3. Next Steps: Action items based on the conclusion.
            4. Discussion Points: Viewpoints, facts, or arguments presented.
            Structure clearly by topics.`
        }
    },
    {
        id: 'meeting_note',
        category: 'Business',
        title: 'Meeting Note (Plaud Style)',
        description: 'For teams. Input meeting info and topics to get structured notes, conclusions, and actions.',
        icon: Users,
        color: 'text-cyan-600 bg-cyan-100 dark:text-cyan-400 dark:bg-cyan-900/30',
        outline: ['Meeting Information', 'Meeting Notes (Subtopics & Conclusions)', 'Next Arrangements / Action Items'],
        systemPrompt: {
            es: `Genera una Nota de Reunión estructurada:
            ⏰ Meeting Information: Extrae fecha, hora, lugar y asistentes si se mencionan.
            📝 Meeting Notes: Desglosa por Tópicos y Subtópicos. Para cada uno da una descripción breve y Conclusiones.
            📅 Next Arrangements: Lista clara de Action Items.`,
            en: `Generate a structured Meeting Note:
            ⏰ Meeting Information: Extract date, time, location, and attendees if mentioned.
            📝 Meeting Notes: Break down by Topics and Subtopics. For each, give a brief description and Conclusions.
            📅 Next Arrangements: Clear list of Action Items.`
        }
    },
    {
        id: 'call_discussion',
        category: 'Call',
        title: 'Call Discussion',
        description: 'For calls and meetings. Enter key points; get structured topics, conclusions, reasons, and to-dos.',
        icon: Phone,
        color: 'text-sky-600 bg-sky-100 dark:text-sky-400 dark:bg-sky-900/30',
        outline: ['Topic Description', 'Conclusions', 'Reasons / Support', 'To-Dos'],
        systemPrompt: {
            es: `Analiza esta llamada ("Discussion CALL"). Para cada punto discutido:
            1. Description: Descripción detallada.
            2. Conclusions: Conclusiones y to-dos.
            3. Reasons: Razones que apoyan la conclusión.
            Formato estructurado y lógico.`,
            en: `Analyze this call ("Discussion CALL"). For each discussion point:
            1. Description: Detailed description.
            2. Conclusions: Conclusions and action items (to-dos).
            3. Reasons: Reasons supporting the conclusion.
            Structured and logical format.`
        }
    },
    {
        id: 'sales_bant',
        category: 'Business', // Or Sales
        title: 'Ventas (BANT)',
        description: 'Análisis de cualificación de leads usando la metodología BANT.',
        icon: Briefcase,
        color: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
        outline: ['Budget', 'Authority', 'Need', 'Timing', 'Next Steps'],
        systemPrompt: {
            es: `Eres un consultor de ventas experto. Analiza usando BANT. Identifica: Budget, Authority, Need, Timing. Sugiere próximos pasos.`,
            en: `You are an expert sales consultant. Analyze using BANT. Identify: Budget, Authority, Need, Timing. Suggest next steps.`
        }
    },

    // --- EDUCATION ---
    {
        id: 'university_lecture',
        category: 'Education',
        title: 'Lezioni Universitarie (Lecture)',
        description: 'Trasforma ogni lezione in un capitolo chiaro, approfondito e pronto per lo studio.',
        icon: BookOpen,
        color: 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30',
        outline: ['Capítulo de Manual', 'Conceptos Profundos', 'Relaciones Interdisciplinarias', 'Schema Riassuntivo'],
        systemPrompt: {
            es: `Transforma la lección en un capítulo de manual universitario claro y profundo.
            - Organiza en secciones lógicas con títulos.
            - Explica cada concepto con tono didáctico y fluido.
            - Añade ejemplos prácticos y analogías.
            - Relaciona con otros temas (curiosidades científicas/históricas).
            - Al final: Schema Riassuntivo con palabras clave.`,
            en: `Transform the lecture into a clear, in-depth useriversity textbook chapter.
            - Organize into logical sections with titles.
            - Explain each concept with a didactic and fluid tone.
            - Add practical examples and analogies.
            - Relate to other topics (scientific/historical curiosities).
            - At the end: Summary Schema with key words.`
        }
    },
    {
        id: 'class_note',
        category: 'Education', // Or Speech
        title: 'Class Note',
        description: 'Helps students log class info, keywords, key points. Outputs clear notes with examples and tasks.',
        icon: GraduationCap,
        color: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30',
        outline: ['Class Info', 'Keywords', 'Key Learnings', 'Explanations & Examples', 'Assignments'],
        systemPrompt: {
            es: `Genera notas de clase ("Class Note"):
            - Class Info (Materia, Fecha, etc).
            - Keywords (Palabras clave).
            - Key Learnings (Puntos de conocimiento).
            - Explanations: Detalle, análisis, derivación de fórmulas.
            - Examples: Descripción de ejemplos dados.
            - Assignments: Tareas asignadas.`,
            en: `Generate Class Notes:
            - Class Info (Course, Date, etc).
            - Keywords.
            - Key Learnings.
            - Explanations: Detail, analysis, derivation.
            - Examples: Description of examples provided.
            - Assignments.`
        }
    },

    // --- SPECIALIZED ---
    {
        id: 'medical_soap',
        category: 'Medical',
        title: 'Médico (SOAP)',
        description: 'Nota clínica estructurada para profesionales de la salud.',
        icon: Stethoscope,
        color: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30',
        outline: ['Subjective', 'Objective', 'Assessment', 'Plan'],
        systemPrompt: {
            es: `Genera nota SOAP (Subjetivo, Objetivo, Evaluación, Plan). Tono clínico profesional.`,
            en: `Generate SOAP note (Subjective, Objective, Assessment, Plan). Professional clinical tone.`
        }
    },
    {
        id: 'legal',
        category: 'Legal',
        title: 'Legal & Jurídico',
        description: 'Resumen de hechos, riesgos y estrategia legal.',
        icon: Scale,
        color: 'text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-800',
        outline: ['Hechos', 'Riesgos', 'Estrategia'],
        systemPrompt: {
            es: `Abogado senior. Extrae: hechos relevantes, riesgos legales, estrategia/próximos pasos. Lenguaje jurídico.`,
            en: `Senior attorney. Extract: relevant facts, legal risks, strategy/next steps. Legal terminology.`
        }
    },
    {
        id: 'hr_interview',
        category: 'HR',
        title: 'HR / Entrevista',
        description: 'Evaluación de candidatos y ajuste cultural.',
        icon: UserPlus,
        color: 'text-pink-600 bg-pink-100 dark:text-pink-400 dark:bg-pink-900/30',
        outline: ['Perfil', 'Competencias', 'Culture Fit', 'Recomendación'],
        systemPrompt: {
            es: `Recrutador experto. Analiza: Perfil, Competencias, Ajuste Cultural, Recomendación.`,
            en: `Expert recruiter. Analyze: Profile, Competencies, Culture Fit, Recommendation.`
        }
    },
    {
        id: 'product_ux',
        category: 'Product',
        title: 'Producto & UX',
        description: 'Feedback de usuarios, puntos de dolor y mejoras.',
        icon: Lightbulb,
        color: 'text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30',
        outline: ['User Feedback', 'Pain Points', 'Feature Requests', 'Sentiment'],
        systemPrompt: {
            es: `Product Manager. Analiza: Citas clave, Pain Points, Feature Requests, Sentimiento General.`,
            en: `Product Manager. Analyze: Key Quotes, Pain Points, Feature Requests, General Sentiment.`
        }
    },
    {
        id: 'journalism',
        category: 'General',
        title: 'Periodismo / Entrevista',
        description: 'Citas textuales y narrativa para artículos.',
        icon: Mic,
        color: 'text-cyan-600 bg-cyan-100 dark:text-cyan-400 dark:bg-cyan-900/30',
        outline: ['Titulares', 'Citas Verbatim', 'Narrativa'],
        systemPrompt: {
            es: `Periodista de investigación. Extrae: Titulares, Citas textuales (verbatim), Narrativa de hechos.`,
            en: `Investigative journalist. Extract: Headlines, Verbatim quotes, Facts narrative.`
        }
    },
    {
        id: 'research',
        category: 'Education',
        title: 'Research Académico',
        description: 'Síntesis para tesis o investigaciones.',
        icon: PenTool,
        color: 'text-stone-600 bg-stone-100 dark:text-stone-400 dark:bg-stone-900/30',
        outline: ['Hipótesis', 'Metodología', 'Hallazgos', 'Gaps'],
        systemPrompt: {
            es: `Investigador académico. Sintetiza: Hipótesis, Metodología, Hallazgos, Research Gaps.`,
            en: `Academic researcher. Synthesize: Hypotheses, Methodology, Findings, Research Gaps.`
        }
    }
];
