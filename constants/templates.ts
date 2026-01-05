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
    BookOpen
} from 'lucide-react';

export interface AITemplate {
    id: string;
    category: 'General' | 'Business' | 'Medical' | 'Education' | 'Legal' | 'HR' | 'Product' | 'Personal';
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
    {
        id: 'general',
        category: 'General',
        title: 'General / Estándar',
        description: 'Resumen estructurado versátil para cualquier tipo de audio.',
        icon: FileText,
        color: 'text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-800',
        outline: [
            'Resumen Ejecutivo',
            'Puntos Clave (Bullet points)',
            'Conclusiones'
        ],
        systemPrompt: {
            es: `Eres un asistente experto. Analiza la transcripción y proporciona: 1. Resumen Ejecutivo, 2. Puntos Clave, 3. Conclusiones. Usa Markdown.`,
            en: `You are an expert assistant. Analyze the transcript and provide: 1. Executive Summary, 2. Key Points, 3. Conclusions. Use Markdown.`
        }
    },
    {
        id: 'meeting',
        category: 'Business',
        title: 'Reunión de Equipo',
        description: 'Acta profesional con decisiones y tareas asignadas.',
        icon: Users,
        color: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30',
        outline: [
            'Agenda y Temas Tratados',
            'Decisiones Tomadas',
            'Action Items (Tareas Pendientes) con responsables'
        ],
        systemPrompt: {
            es: `Eres un secretario profesional. Genera un acta de reunión con: 1. Agenda, 2. Decisiones, 3. Action Items (Quién, Qué, Cuándo). Usa Markdown.`,
            en: `You are a professional secretary. Generate meeting minutes with: 1. Agenda, 2. Decisions, 3. Action Items (Who, What, When). Use Markdown.`
        }
    },
    {
        id: 'sales_bant',
        category: 'Business',
        title: 'Ventas (BANT)',
        description: 'Análisis de cualificación de leads usando la metodología BANT.',
        icon: Briefcase,
        color: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
        outline: [
            'Budget (Presupuesto)',
            'Authority (Autoridad)',
            'Need (Necesidad)',
            'Timing (Tiempo)',
            'Próximos Pasos Sugeridos'
        ],
        systemPrompt: {
            es: `Eres un consultor de ventas experto. Analiza esta llamada usando BANT (Budget, Authority, Need, Timing). Identifica claramente cada uno y sugiere próximos pasos de cierre.`,
            en: `You are an expert sales consultant. Analyze this call using BANT (Budget, Authority, Need, Timing). Clearly identify each and suggest closing next steps.`
        }
    },
    {
        id: 'medical_soap',
        category: 'Medical',
        title: 'Médico (SOAP)',
        description: 'Nota clínica estructurada para profesionales de la salud.',
        icon: Stethoscope,
        color: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30',
        outline: [
            'Subjective (Subjetivo - Síntomas del paciente)',
            'Objective (Objetivo - Signos vitales/Observaciones)',
            'Assessment (Evaluación - Diagnóstico preliminar)',
            'Plan (Plan de tratamiento)'
        ],
        systemPrompt: {
            es: `Eres un médico experto. Genera una nota SOAP (Subjetivo, Objetivo, Evaluación, Plan) profesional basada en esta consulta. Mantén un tono clínico y formal.`,
            en: `You are an expert physician. Generate a professional SOAP note (Subjective, Objective, Assessment, Plan) based on this consultation. Maintain a clinical tone.`
        }
    },
    {
        id: 'legal',
        category: 'Legal',
        title: 'Legal & Jurídico',
        description: 'Resumen de hechos, riesgos y estrategia legal.',
        icon: Scale,
        color: 'text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-800',
        outline: [
            'Hechos Relevantes',
            'Análisis de Riesgos Legales',
            'Estrategia / Próximos Pasos Legales'
        ],
        systemPrompt: {
            es: `Eres un abogado senior. Analiza esta conversación y extrae: 1. Hechos fácticos relevantes, 2. Riesgos legales identificados, 3. Estrategia o pasos legales a seguir. Usa lenguaje jurídico preciso.`,
            en: `You are a senior attorney. Analyze this conversation and extract: 1. Relevant Facts, 2. Legal Risks Identified, 3. Legal Strategy/Next Steps. Use precise legal terminology.`
        }
    },
    {
        id: 'hr_interview',
        category: 'HR',
        title: 'Recursos Humanos / Entrevista',
        description: 'Evaluación de candidatos y ajuste cultural.',
        icon: UserPlus,
        color: 'text-pink-600 bg-pink-100 dark:text-pink-400 dark:bg-pink-900/30',
        outline: [
            'Perfil del Candidato',
            'Evaluación de Competencias Clave',
            'Ajuste Cultural (Culture Fit)',
            'Recomendación (Contratar/No Contratar)'
        ],
        systemPrompt: {
            es: `Eres un reclutador experto. Evalúa al candidato basándote en esta entrevista. Analiza: 1. Perfil, 2. Competencias demostradas, 3. Ajuste cultural, 4. Recomendación fundamentada.`,
            en: `You are an expert recruiter. Evaluate the candidate based on this interview. Analyze: 1. Profile, 2. Demonstrated Competencies, 3. Culture Fit, 4. Reasoned Recommendation.`
        }
    },
    {
        id: 'product_ux',
        category: 'Product',
        title: 'Producto & UX',
        description: 'Feedback de usuarios, puntos de dolor y mejoras.',
        icon: Lightbulb,
        color: 'text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30',
        outline: [
            'Feedback del Usuario (Citas clave)',
            'Puntos de Dolor (Pain Points)',
            'Sugerencias de Mejora / Feature Requests',
            'Sentimiento del Usuario'
        ],
        systemPrompt: {
            es: `Eres un Product Manager. Analiza este feedback/user interview. Extrae: 1. Citas clave del usuario, 2. Pain Points identificados, 3. Solicitudes de funcionalidades, 4. Sentimiento general.`,
            en: `You are a Product Manager. Analyze this user feedback/interview. Extract: 1. Key User Quotes, 2. Pain Points, 3. Feature Requests, 4. General Sentiment.`
        }
    },
    {
        id: 'education_lecture',
        category: 'Education',
        title: 'Clase / Conferencia',
        description: 'Notas de estudio optimizadas para aprendizaje.',
        icon: GraduationCap,
        color: 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30',
        outline: [
            'Conceptos Principales y Definiciones',
            'Puntos Clave para Examen',
            'Resumen Estructurado de la Lección',
            'Referencias/Lecturas mencionadas'
        ],
        systemPrompt: {
            es: `Eres un estudiante de honor. Genera notas de estudio de esta clase: 1. Conceptos y Definiciones (en negrita), 2. Puntos probables de examen, 3. Resumen estructurado.`,
            en: `You are an honors student. Generate study notes from this lecture: 1. Concepts & Definitions (bold), 2. Likely exam topics, 3. Structured summary.`
        }
    },
    {
        id: 'journalism',
        category: 'General',
        title: 'Periodismo / Entrevista',
        description: 'Citas textuales y narrativa para artículos.',
        icon: Mic,
        color: 'text-cyan-600 bg-cyan-100 dark:text-cyan-400 dark:bg-cyan-900/30',
        outline: [
            'Titulares Sugeridos',
            'Citas Textuales Destacadas',
            'Narrativa / Cronología de los hechos'
        ],
        systemPrompt: {
            es: `Eres un periodista de investigación. Extrae: 1. Titulares potenciales, 2. Las mejores citas textuales (verbatim), 3. Resumen narrativo de los hechos revelados.`,
            en: `You are an investigative journalist. Extract: 1. Potential Headlines, 2. Best Direct Quotes (verbatim), 3. Narrative summary of revealed facts.`
        }
    },
    {
        id: 'research',
        category: 'Education',
        title: 'Research Académico',
        description: 'Síntesis para tesis o investigaciones.',
        icon: BookOpen,
        color: 'text-indigo-600 bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-900/30',
        outline: [
            'Hipótesis Discutidas',
            'Metodología Mencionada',
            'Hallazgos Preliminares',
            'Gaps en la Investigación'
        ],
        systemPrompt: {
            es: `Eres un investigador académico. Sintetiza la discusión en: 1. Hipótesis, 2. Metodología, 3. Hallazgos, 4. Brechas (Gaps) identificadas en la investigación.`,
            en: `You are an academic researcher. Synthesize the discussion into: 1. Hypotheses, 2. Methodology, 3. Findings, 4. Research Gaps identified.`
        }
    }
];
