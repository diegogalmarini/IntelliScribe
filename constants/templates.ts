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
    Phone,
    ClipboardList,
    TrendingUp,
    Shield,
    FlaskConical,
    Dna,
    Activity,
    Stethoscope as MedicalIcon,
    Scale as LegalIcon,
    PieChart,
    Search,
    Clock,
    Target,
    UserCheck,
    MessageCircle,
    Presentation,
    Zap,
    Microscope,
    Radio,
    Star as StarIcon,
    Heart as HeartIcon,
    Building2,
    Languages,
    CheckCircle,
    Map,
    Mic2,
    PhoneCall,
    ClipboardCheck,
    Newspaper,
    FileCheck,
    LogOut,
    Eye
} from 'lucide-react';
import { AI_TEMPLATE_PROMPTS } from './aiPrompts';

export interface AITemplate {
    id: string;
    category: 'General' | 'Business' | 'Medical' | 'Education' | 'Legal' | 'HR' | 'Product' | 'Personal' | 'Speech' | 'Call' | 'Consulting' | 'Periodismo' | 'Research';
    /**
     * Marca las plantillas que funcionan bien sobre video: charlas, webinars,
     * tutoriales, podcasts.
     *
     * Es una bandera y no una categoria porque `category` es unica: convertir
     * "Resumen Adaptativo" en categoria Video lo sacaria de General. Asi el
     * filtro de Video cruza las categorias existentes en vez de competir con
     * ellas, y una plantilla puede estar en las dos.
     */
    videoReady?: boolean;
    title: {
        es: string;
        en: string;
    };
    description: {
        es: string;
        en: string;
    };
    icon: any;
    color: string;
    outline: {
        es: string[];
        en: string[];
    };
    systemPrompt: {
        es: string;
        en: string;
    };
}

export const AI_TEMPLATES: AITemplate[] = [
    // --- GENERAL / SMART ---
    {
        id: 'adaptive',
        videoReady: true,
        category: 'General',
        title: {
            es: 'Resumen Adaptativo (Autopilot)',
            en: 'Adaptive Summary (Autopilot)'
        },
        description: {
            es: 'Ideal para reuniones, entrevistas y clases. La IA adapta la estructura al tipo de contenido automáticamente.',
            en: 'Ideal for meetings, interviews, and classes. AI automatically adapts the structure to the content type.'
        },
        icon: Sparkles,
        color: 'text-violet-600 bg-violet-100 dark:text-violet-400 dark:bg-violet-900/30',
        outline: {
            es: ['Estructura Adaptativa', 'Insights Clave', 'Resumen General'],
            en: ['Adaptive Structure', 'Key Insights', 'General Summary']
        },
        systemPrompt: AI_TEMPLATE_PROMPTS['adaptive']
    },
    {
        id: 'reasoning',
        category: 'General',
        title: {
            es: 'Resumen de Razonamiento',
            en: 'Reasoning Summary'
        },
        description: {
            es: 'Optimizado para notas transcritas. Utiliza inferencia lógica para crear un flujo coherente y claro.',
            en: 'Optimized for transcribed notes. Uses logical inference to create a coherent and clear flow.'
        },
        icon: BrainCircuit,
        color: 'text-indigo-600 bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-900/30',
        outline: {
            es: ['Flujo Lógico', 'Deducciones IA', 'Conclusiones'],
            en: ['Logical Flow', 'AI Deductions', 'Conclusions']
        },
        systemPrompt: AI_TEMPLATE_PROMPTS['reasoning']
    },
    {
        id: 'detailed',
        videoReady: true,
        category: 'General',
        title: {
            es: 'Detallado y Estructurado',
            en: 'Detailed and Structured'
        },
        description: {
            es: 'Análisis profundo con enfoque en tareas, nombres y fechas. Formato listo para Notion/Documentos.',
            en: 'In-depth analysis focused on tasks, names, and dates. Format ready for Notion/Documents.'
        },
        icon: ListChecks,
        color: 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30',
        outline: {
            es: ['Sumario de Conversación', 'Tareas y Acciones', 'Seguimientos', 'Datos Extraídos'],
            en: ['Conversation Summary', 'Tasks and Actions', 'Follow-ups', 'Extracted Data']
        },
        systemPrompt: AI_TEMPLATE_PROMPTS['detailed']
    },
    {
        id: 'verbatim',
        category: 'General',
        title: {
            es: 'Transcripción Literal (Limpia)',
            en: 'Clean Verbatim Transcript'
        },
        description: {
            es: 'Corrige errores gramaticales de la transcripción sin resumir nada. Ideal para actas literales.',
            en: 'Corrects grammatical errors without summarizing. Ideal for verbatim minutes.'
        },
        icon: FileText,
        color: 'text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-800',
        outline: {
            es: ['Corrección Gramatical', 'Formato de Diálogo', 'Sin Resumen'],
            en: ['Grammar Correction', 'Dialogue Formatting', 'No Summary']
        },
        systemPrompt: AI_TEMPLATE_PROMPTS['verbatim']
    },
    {
        id: 'brief',
        videoReady: true,
        category: 'General',
        title: {
            es: 'Resumen Ejecutivo (Brief)',
            en: 'Executive Summary (Brief)'
        },
        description: {
            es: 'Versión ultra-corta con los 3 puntos más importantes. Para leer en 30 segundos.',
            en: 'Ultra-short version with the 3 most important points. Read in 30 seconds.'
        },
        icon: Zap,
        color: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30',
        outline: {
            es: ['Idea Central', 'Top 3 Insights', 'Acción Inmediata'],
            en: ['Main Idea', 'Top 3 Insights', 'Immediate Action']
        },
        systemPrompt: AI_TEMPLATE_PROMPTS['brief']
    },
    {
        id: 'mind_map_structure',
        videoReady: true,
        category: 'General',
        title: {
            es: 'Estructura de Mapa Mental',
            en: 'Mind Map Structure'
        },
        description: {
            es: 'Organiza la información mediante nodos jerárquicos. Ideal para brainstorming.',
            en: 'Organize information through hierarchical nodes. Ideal for brainstorming.'
        },
        icon: BrainCircuit,
        color: 'text-pink-600 bg-pink-100 dark:text-pink-400 dark:bg-pink-900/30',
        outline: {
            es: ['Concepto Central', 'Ramas Principales', 'Sub-nodos de Detalle'],
            en: ['Central Concept', 'Main Branches', 'Detail Sub-nodes']
        },
        systemPrompt: AI_TEMPLATE_PROMPTS['mind_map_structure']
    },

    // --- BUSINESS / MEETINGS ---
    {
        id: 'discussion_meeting',
        category: 'Business',
        title: {
            es: 'Discusión de Equipo',
            en: 'Team Discussion'
        },
        description: {
            es: 'Estructura temas, conclusiones y pasos a seguir. Ideal para reuniones de trabajo.',
            en: 'Structure topics, conclusions, and next steps. Ideal for work meetings.'
        },
        icon: Users,
        color: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30',
        outline: {
            es: ['Tópicos Discutidos', 'Acuerdos Alcanzados', 'Pasos a Seguir'],
            en: ['Topics Discussed', 'Agreements Reached', 'Next Steps']
        },
        systemPrompt: AI_TEMPLATE_PROMPTS['discussion_meeting']
    },
    {
        id: 'meeting_note',
        category: 'Business',
        title: {
            es: 'Minuta de Reunión',
            en: 'Meeting Minutes'
        },
        description: {
            es: 'Formato clásico de minuta: Información, notas por tema y próximos acuerdos.',
            en: 'Classic minutes format: Information, notes by topic, and next agreements.'
        },
        icon: ClipboardList,
        color: 'text-cyan-600 bg-cyan-100 dark:text-cyan-400 dark:bg-cyan-900/30',
        outline: {
            es: ['Información de Reunión', 'Notas Detalladas', 'Planificación Futura'],
            en: ['Meeting Information', 'Detailed Notes', 'Future Planning']
        },
        systemPrompt: AI_TEMPLATE_PROMPTS['meeting_note']
    },
    {
        id: 'sales_bant',
        category: 'Business',
        title: {
            es: 'Cualificación BANT',
            en: 'BANT Qualification'
        },
        description: {
            es: 'Metodología de ventas: Presupuesto, Autoridad, Necesidad y Tiempos.',
            en: 'Sales methodology: Budget, Authority, Need, and Timing.'
        },
        icon: Target,
        color: 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30',
        outline: {
            es: ['Budget', 'Authority', 'Need', 'Timing', 'Próximos Pasos'],
            en: ['Budget', 'Authority', 'Need', 'Timing', 'Next Steps']
        },
        systemPrompt: AI_TEMPLATE_PROMPTS['sales_bant']
    },
    {
        id: 'project_kickoff',
        category: 'Business',
        title: {
            es: 'Kickoff de Proyecto',
            en: 'Project Kickoff'
        },
        description: {
            es: 'Enfocado en objetivos, stakeholders y hitos principales del proyecto.',
            en: 'Focused on objectives, stakeholders, and main project milestones.'
        },
        icon: Target,
        color: 'text-cyan-600 bg-cyan-100 dark:text-cyan-400 dark:bg-cyan-900/30',
        outline: {
            es: ['Visión del Proyecto', 'Stakeholders', 'Hitos y Timeline'],
            en: ['Project Vision', 'Stakeholders', 'Milestones and Timeline']
        },
        systemPrompt: AI_TEMPLATE_PROMPTS['project_kickoff']
    },
    {
        id: 'board_meeting',
        category: 'Business',
        title: {
            es: 'Reunión de Directorio',
            en: 'Board Meeting'
        },
        description: {
            es: 'Resumen ejecutivo formal de decisiones críticas y votaciones.',
            en: 'Formal executive summary of critical decisions and votes.'
        },
        icon: Building2,
        color: 'text-slate-700 bg-slate-100 dark:text-slate-300 dark:bg-slate-900/30',
        outline: {
            es: ['Orden del Día', 'Resoluciones', 'Acciones Formales'],
            en: ['Agenda', 'Resolutions', 'Formal Actions']
        },
        systemPrompt: AI_TEMPLATE_PROMPTS['board_meeting']
    },
    {
        id: 'scrum_daily',
        category: 'Business',
        title: {
            es: 'Daily Scrum',
            en: 'Scrum Daily'
        },
        description: {
            es: 'Sincronización ágil: Qué se hizo, qué se hará y bloqueadores.',
            en: 'Agile synchronization: What was done, what will be done, and blockers.'
        },
        icon: Clock,
        color: 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30',
        outline: {
            es: ['Progreso Ayer', 'Objetivos Hoy', 'Bloqueadores'],
            en: ['Yesterday Progress', 'Today Objectives', 'Blockers']
        },
        systemPrompt: AI_TEMPLATE_PROMPTS['scrum_daily']
    },

    // --- MEDICAL / HEALTH ---
    {
        id: 'medical_soap',
        category: 'Medical',
        title: {
            es: 'Nota Médica SOAP',
            en: 'Medical SOAP Note'
        },
        description: {
            es: 'Estándar clínico: Subjetivo, Objetivo, Evaluación y Plan.',
            en: 'Clinical standard: Subjective, Objective, Assessment, and Plan.'
        },
        icon: Stethoscope,
        color: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30',
        outline: {
            es: ['Subjective (S)', 'Objective (O)', 'Assessment (A)', 'Plan (P)'],
            en: ['Subjective (S)', 'Objective (O)', 'Assessment (A)', 'Plan (P)']
        },
        systemPrompt: AI_TEMPLATE_PROMPTS['medical_soap']
    },
    {
        id: 'patient_consultation',
        category: 'Medical',
        title: {
            es: 'Consulta de Paciente',
            en: 'Patient Consultation'
        },
        description: {
            es: 'Resumen amigable para el paciente sobre su visita y recomendaciones.',
            en: 'Patient-friendly summary of their visit and recommendations.'
        },
        icon: MessageCircle,
        color: 'text-rose-600 bg-rose-100 dark:text-rose-400 dark:bg-rose-900/30',
        outline: {
            es: ['Motivo de Consulta', 'Diagnóstico Simple', 'Plan de Tratamiento'],
            en: ['Reason for Visit', 'Simple Diagnosis', 'Treatment Plan']
        },
        systemPrompt: AI_TEMPLATE_PROMPTS['patient_consultation']
    },
    {
        id: 'clinical_results',
        category: 'Medical',
        title: {
            es: 'Análisis de Resultados',
            en: 'Results Analysis'
        },
        description: {
            es: 'Para médicos. Extrae valores críticos y tendencias de las pruebas discutidas.',
            en: 'For doctors. Extract critical values and trends from the discussed tests.'
        },
        icon: Activity,
        color: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30',
        outline: {
            es: ['Valores Laboratorio', 'Hallazgos Clave', 'Tendencias'],
            en: ['Laboratory Values', 'Key Findings', 'Trends']
        },
        systemPrompt: AI_TEMPLATE_PROMPTS['clinical_results']
    },
    {
        id: 'discharge_summary',
        category: 'Medical',
        title: {
            es: 'Resumen de Epicrisis',
            en: 'Discharge Summary'
        },
        description: {
            es: 'Resumen de alta hospitalaria con antecedentes y plan de seguimiento.',
            en: 'Hospital discharge summary with background and follow-up plan.'
        },
        icon: FileText,
        color: 'text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-900/30',
        outline: {
            es: ['Resumen de Estadía', 'Diagnósticos de Alta', 'Plan de Medicación'],
            en: ['Stay Summary', 'Discharge Diagnoses', 'Medication Plan']
        },
        systemPrompt: AI_TEMPLATE_PROMPTS['discharge_summary']
    },
    {
        id: 'clinical_trial_note',
        category: 'Medical',
        title: {
            es: 'Nota de Ensayo Clínico',
            en: 'Clinical Trial Note'
        },
        description: {
            es: 'Captura datos específicos para investigación y cumplimiento normativo.',
            en: 'Capture specific data for research and regulatory compliance.'
        },
        icon: Microscope,
        color: 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30',
        outline: {
            es: ['Protocolo Aplicado', 'Observaciones Sujeto', 'Eventos Adversos'],
            en: ['Protocol Applied', 'Subject Observations', 'Adverse Events']
        },
        systemPrompt: AI_TEMPLATE_PROMPTS['clinical_trial_note']
    },
    {
        id: 'radiology_report_draft',
        category: 'Medical',
        title: {
            es: 'Resumen Radiológico',
            en: 'Radiology Summary'
        },
        description: {
            es: 'Estructura para actas de radiología, ecografía o resonancia.',
            en: 'Structure for radiology, ultrasound, or resonance records.'
        },
        icon: Activity,
        color: 'text-indigo-600 bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-900/30',
        outline: {
            es: ['Hallazgos por Órgano', 'Impresión Diagnóstica', 'Recomendaciones'],
            en: ['Findings by Organ', 'Diagnostic Impression', 'Recommendations']
        },
        systemPrompt: AI_TEMPLATE_PROMPTS['radiology_report_draft']
    },

    // --- EDUCATION ---
    {
        id: 'university_lecture',
        category: 'Education',
        title: {
            es: 'Lección Universitaria',
            en: 'University Lecture'
        },
        description: {
            es: 'Transforma la clase en un capítulo de manual claro y profundo.',
            en: 'Transform the class into a clear and in-depth textbook chapter.'
        },
        icon: GraduationCap,
        color: 'text-violet-600 bg-violet-100 dark:text-violet-400 dark:bg-violet-900/30',
        outline: {
            es: ['Secciones Lógicas', 'Explicación de Conceptos', 'Ejemplos y Analogías', 'Esquema Riassuntivo'],
            en: ['Logical Sections', 'Concept Explanation', 'Examples and Analogies', 'Summary Outline']
        },
        systemPrompt: AI_TEMPLATE_PROMPTS['university_lecture']
    },
    {
        id: 'class_note',
        category: 'Education',
        title: {
            es: 'Apuntes de Clase',
            en: 'Class Notes'
        },
        description: {
            es: 'Resumen estructurado: Keywords, Key Learnings, Ejemplos y Tareas.',
            en: 'Structured summary: Keywords, Key Learnings, Examples, and Assignments.'
        },
        icon: PenTool,
        color: 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30',
        outline: {
            es: ['Class Info', 'Keywords', 'Key Learnings', 'Explanations', 'Assignments'],
            en: ['Class Info', 'Keywords', 'Key Learnings', 'Explanations', 'Assignments']
        },
        systemPrompt: AI_TEMPLATE_PROMPTS['class_note']
    },
    {
        id: 'study_guide',
        videoReady: true,
        category: 'Education',
        title: {
            es: 'Guía de Estudio',
            en: 'Study Guide'
        },
        description: {
            es: 'Condensa el contenido en preguntas y respuestas para preparación de exámenes.',
            en: 'Condense content into questions and answers for exam preparation.'
        },
        icon: BookOpen,
        color: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30',
        outline: {
            es: ['Conceptos Fundamentales', 'Cuestionario Q&A', 'Puntos a Memorizar'],
            en: ['Fundamental Concepts', 'Q&A Questionnaire', 'Points to Memorize']
        },
        systemPrompt: AI_TEMPLATE_PROMPTS['study_guide']
    },
    {
        id: 'thesis_brainstorm',
        category: 'Education',
        title: {
            es: 'Lluvia de Ideas - Tesis',
            en: 'Thesis Brainstorm'
        },
        description: {
            es: 'Para tutorías. Organiza ideas de investigación, bibliografía y metodología sugerida.',
            en: 'For tutorials. Organize research ideas, bibliography, and suggested methodology.'
        },
        icon: Lightbulb,
        color: 'text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30',
        outline: {
            es: ['Hipótesis Planteadas', 'Enfoque Metodológico', 'Fuentes Citadas'],
            en: ['Proposed Hypotheses', 'Methodological Focus', 'Cited Sources']
        },
        systemPrompt: AI_TEMPLATE_PROMPTS['thesis_brainstorm']
    },
    {
        id: 'language_lesson',
        category: 'Education',
        title: {
            es: 'Lección de Idiomas',
            en: 'Language Lesson'
        },
        description: {
            es: 'Extrae vocabulario nuevo, reglas gramaticales y ejercicios practicados.',
            en: 'Extract new vocabulary, grammar rules, and practiced exercises.'
        },
        icon: Languages,
        color: 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30',
        outline: {
            es: ['Vocabulario del Día', 'Puntos Gramaticales', 'Frases Útiles'],
            en: ['Vocabulary of the Day', 'Grammar Points', 'Useful Phrases']
        },
        systemPrompt: AI_TEMPLATE_PROMPTS['language_lesson']
    },
    {
        id: 'workshop_summary',
        videoReady: true,
        category: 'Education',
        title: {
            es: 'Resumen de Taller',
            en: 'Workshop Summary'
        },
        description: {
            es: 'Enfocado en la parte práctica: Pasos seguidos, herramientas usadas y resultado final.',
            en: 'Focused on the practical part: Steps followed, tools used, and final result.'
        },
        icon: Presentation,
        color: 'text-pink-600 bg-pink-100 dark:text-pink-400 dark:bg-pink-900/30',
        outline: {
            es: ['Objetivo Práctico', 'Workflow Paso a Paso', 'Conclusiones del Taller'],
            en: ['Practical Objective', 'Step-by-Step Workflow', 'Workshop Conclusions']
        },
        systemPrompt: AI_TEMPLATE_PROMPTS['workshop_summary']
    },

    // --- LEGAL ---
    {
        id: 'legal_consultation',
        category: 'Legal',
        title: {
            es: 'Consulta Legal',
            en: 'Legal Consultation'
        },
        description: {
            es: 'Resumen de hechos, puntos de derecho y estrategia procesal sugerida.',
            en: 'Summary of facts, legal points, and suggested procedural strategy.'
        },
        icon: Scale,
        color: 'text-slate-800 bg-slate-100 dark:text-slate-200 dark:bg-slate-900/30',
        outline: {
            es: ['Relato de Hechos', 'Fundamentos Legales', 'Estrategia/Siguientes Pasos'],
            en: ['Statement of Facts', 'Legal Grounds', 'Strategy/Next Steps']
        },
        systemPrompt: AI_TEMPLATE_PROMPTS['legal_consultation']
    },
    {
        id: 'contract_review',
        category: 'Legal',
        title: {
            es: 'Revisión de Contrato',
            en: 'Contract Review'
        },
        description: {
            es: 'Identifica cláusulas críticas, riesgos y posibles puntos de negociación.',
            en: 'Identify critical clauses, risks, and possible negotiation points.'
        },
        icon: FileText,
        color: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30',
        outline: {
            es: ['Cláusulas Principales', 'Riesgos Detectados', 'Propuestas de Cambio'],
            en: ['Main Clauses', 'Detected Risks', 'Change Proposals']
        },
        systemPrompt: AI_TEMPLATE_PROMPTS['contract_review']
    },
    {
        id: 'deposition_summary',
        category: 'Legal',
        title: {
            es: 'Resumen de Declaración',
            en: 'Deposition Summary'
        },
        description: {
            es: 'Sintetiza testimonios clave y contradicciones detectadas durante la declaración.',
            en: 'Synthesize key testimonies and contradictions detected during the deposition.'
        },
        icon: UserCheck,
        color: 'text-indigo-600 bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-900/30',
        outline: {
            es: ['Testimonio Clave', 'Hechos Admitidos', 'Inconsistencias'],
            en: ['Key Testimony', 'Admitted Facts', 'Inconsistencies']
        },
        systemPrompt: AI_TEMPLATE_PROMPTS['deposition_summary']
    },
    {
        id: 'compliance_audit',
        category: 'Legal',
        title: {
            es: 'Auditoría de Cumplimiento',
            en: 'Compliance Audit'
        },
        description: {
            es: 'Verifica la adherencia a normativas específicas discutidas en la reunión.',
            en: 'Verify adherence to specific regulations discussed in the meeting.'
        },
        icon: Shield,
        color: 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30',
        outline: {
            es: ['Normativa Referenciada', 'Estado de Cumplimiento', 'Acciones Correctivas'],
            en: ['Referenced Regulation', 'Compliance Status', 'Corrective Actions']
        },
        systemPrompt: AI_TEMPLATE_PROMPTS['compliance_audit']
    },
    {
        id: 'court_hearing',
        category: 'Legal',
        title: {
            es: 'Audiencia Judicial',
            en: 'Court Hearing'
        },
        description: {
            es: 'Resumen de argumentos, decisiones del juez y plazos procesales dictados.',
            en: 'Summary of arguments, judge decisions, and dictated procedural deadlines.'
        },
        icon: Scale,
        color: 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30',
        outline: {
            es: ['Argumentos de Partes', 'Resolución Judicial', 'Calendario Procesal'],
            en: ['Parties Arguments', 'Judicial Resolution', 'Procedural Calendar']
        },
        systemPrompt: AI_TEMPLATE_PROMPTS['court_hearing']
    },
    {
        id: 'legal_research_brainstorm',
        category: 'Legal',
        title: {
            es: 'Investigación Jurídica',
            en: 'Legal Research'
        },
        description: {
            es: 'Organiza la búsqueda de jurisprudencia y doctrina discutida en el equipo.',
            en: 'Organize the search for jurisprudence and doctrine discussed in the team.'
        },
        icon: Search,
        color: 'text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30',
        outline: {
            es: ['Temas de Investigación', 'Precedentes Citados', 'Búsquedas Pendientes'],
            en: ['Research Topics', 'Cited Precedents', 'Pending Searches']
        },
        systemPrompt: AI_TEMPLATE_PROMPTS['legal_research_brainstorm']
    },

    // --- HR & RECRUITING ---
    {
        id: 'candidate_interview',
        category: 'HR',
        title: {
            es: 'Entrevista de Candidato',
            en: 'Candidate Interview'
        },
        description: {
            es: 'Evaluación de habilidades, experiencia y fit cultural del postulante.',
            en: 'Evaluation of skills, experience, and cultural fit of the applicant.'
        },
        icon: UserPlus,
        color: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30',
        outline: {
            es: ['Perfil del Candidato', 'Hard/Soft Skills', 'Fit Cultural', 'Recomendación'],
            en: ['Candidate Profile', 'Hard/Soft Skills', 'Cultural Fit', 'Recommendation']
        },
        systemPrompt: AI_TEMPLATE_PROMPTS['candidate_interview']
    },
    {
        id: 'performance_review',
        category: 'HR',
        title: {
            es: 'Revisión de Desempeño',
            en: 'Performance Review'
        },
        description: {
            es: 'Resumen de objetivos alcanzados, áreas de mejora y plan de carrera.',
            en: 'Summary of goals achieved, areas for improvement, and career plan.'
        },
        icon: TrendingUp,
        color: 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30',
        outline: {
            es: ['Logros del Periodo', 'Feedback de Mejora', 'Objetivos Próximo Año'],
            en: ['Period Achievements', 'Improvement Feedback', 'Next Year Objectives']
        },
        systemPrompt: AI_TEMPLATE_PROMPTS['performance_review']
    },
    {
        id: 'onboarding_session',
        category: 'HR',
        title: {
            es: 'Sesión de Onboarding',
            en: 'Onboarding Session'
        },
        description: {
            es: 'Puntos clave para el nuevo empleado: Cultura, herramientas y primeros pasos.',
            en: 'Key points for the new employee: Culture, tools, and first steps.'
        },
        icon: Lightbulb,
        color: 'text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30',
        outline: {
            es: ['Cultura Empresa', 'Setup de Herramientas', 'Checklist Semana 1'],
            en: ['Company Culture', 'Tools Setup', 'Week 1 Checklist']
        },
        systemPrompt: AI_TEMPLATE_PROMPTS['onboarding_session']
    },
    {
        id: 'exit_interview',
        category: 'HR',
        title: {
            es: 'Entrevista de Salida',
            en: 'Exit Interview'
        },
        description: {
            es: 'Recopila motivos de partida y feedback sobre la experiencia del empleado.',
            en: 'Collect reasons for leaving and feedback on the employee experience.'
        },
        icon: LogOut,
        color: 'text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-900/30',
        outline: {
            es: ['Motivos de Salida', 'Feedback Empresa', 'Áreas de Mejora HR'],
            en: ['Reasons for Leaving', 'Company Feedback', 'HR Improvement Areas']
        },
        systemPrompt: AI_TEMPLATE_PROMPTS['exit_interview']
    },
    {
        id: 'training_feedback',
        category: 'HR',
        title: {
            es: 'Feedback de Capacitación',
            en: 'Training Feedback'
        },
        description: {
            es: 'Evalúa la efectividad de los cursos o talleres internos realizados.',
            en: 'Evaluate the effectiveness of internal courses or workshops conducted.'
        },
        icon: StarIcon,
        color: 'text-violet-600 bg-violet-100 dark:text-violet-400 dark:bg-violet-900/30',
        outline: {
            es: ['Utilidad Contenido', 'Desempeño Instructor', 'Conceptos Aprendidos'],
            en: ['Content Usefulness', 'Instructor Performance', 'Learned Concepts']
        },
        systemPrompt: AI_TEMPLATE_PROMPTS['training_feedback']
    },
    {
        id: 'conflict_resolution',
        category: 'HR',
        title: {
            es: 'Resolución de Conflictos',
            en: 'Conflict Resolution'
        },
        description: {
            es: 'Documenta la mediación entre partes, acuerdos y seguimiento necesario.',
            en: 'Document mediation between parties, agreements, and necessary follow-up.'
        },
        icon: UserPlus,
        color: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30',
        outline: {
            es: ['Versiones de Partes', 'Puntos de Acuerdo', 'Plan de Convivencia'],
            en: ['Parties Versions', 'Agreement Points', 'Coexistence Plan']
        },
        systemPrompt: AI_TEMPLATE_PROMPTS['conflict_resolution']
    },

    // --- PRODUCT & UX ---
    {
        id: 'ux_user_testing',
        category: 'Product',
        title: {
            es: 'Test de Usuario UX',
            en: 'UX User Test'
        },
        description: {
            es: 'Identifica fricciones, hallazgos y oportunidades de mejora en el producto.',
            en: 'Identify frictions, findings, and improvement opportunities in the product.'
        },
        icon: Eye,
        color: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30',
        outline: {
            es: ['Tasks Realizadas', 'Problemas Detectados', 'Insights de Usuario'],
            en: ['Tasks Performed', 'Detected Problems', 'User Insights']
        },
        systemPrompt: AI_TEMPLATE_PROMPTS['ux_user_testing']
    },
    {
        id: 'product_roadmap',
        category: 'Product',
        title: {
            es: 'Sesión de Roadmap',
            en: 'Roadmap Session'
        },
        description: {
            es: 'Priorización de features, timeline y visión estratégica del producto.',
            en: 'Feature prioritization, timeline, and strategic product vision.'
        },
        icon: Microscope,
        color: 'text-violet-600 bg-violet-100 dark:text-violet-400 dark:bg-violet-900/30',
        outline: {
            es: ['Visión Producto', 'Features Priorizadas', 'Timeline Sugerido'],
            en: ['Product Vision', 'Prioritized Features', 'Suggested Timeline']
        },
        systemPrompt: AI_TEMPLATE_PROMPTS['product_roadmap']
    },
    {
        id: 'feature_discovery',
        category: 'Product',
        title: {
            es: 'Descubrimiento de Feature',
            en: 'Feature Discovery'
        },
        description: {
            es: 'Define el "qué" y el "por qué" de una nueva funcionalidad antes de diseñar.',
            en: 'Define the "what" and "why" of a new functionality before designing.'
        },
        icon: Sparkles,
        color: 'text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30',
        outline: {
            es: ['Problema a Resolver', 'User Persona', 'Definición de Solución'],
            en: ['Problem to Solve', 'User Persona', 'Solution Definition']
        },
        systemPrompt: AI_TEMPLATE_PROMPTS['feature_discovery']
    },
    {
        id: 'design_critique',
        category: 'Product',
        title: {
            es: 'Crítica de Diseño',
            en: 'Design Critique'
        },
        description: {
            es: 'Recopila feedback sobre interfaces, flujos y componentes visuales.',
            en: 'Collect feedback on interfaces, flows, and visual components.'
        },
        icon: PenTool,
        color: 'text-pink-600 bg-pink-100 dark:text-pink-400 dark:bg-pink-900/30',
        outline: {
            es: ['Pantallas Revisadas', 'Puntos a Mejorar', 'Acuerdos Visuales'],
            en: ['Reviewed Screens', 'Points to Improve', 'Visual Agreements']
        },
        systemPrompt: AI_TEMPLATE_PROMPTS['design_critique']
    },
    {
        id: 'agile_retrospective',
        category: 'Product',
        title: {
            es: 'Retrospectiva Ágil',
            en: 'Agile Retrospective'
        },
        description: {
            es: 'Enfoque en equipo: Qué salió bien, qué no y plan de acción para el próximo sprint.',
            en: 'Team focus: What went well, what didn\'t, and action plan for the next sprint.'
        },
        icon: Clock,
        color: 'text-indigo-600 bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-900/30',
        outline: {
            es: ['Salio Bien', 'A Mejorar', 'Action Items para Sprint'],
            en: ['Went Well', 'To Improve', 'Action Items for Sprint']
        },
        systemPrompt: AI_TEMPLATE_PROMPTS['agile_retrospective']
    },
    {
        id: 'qa_bug_report',
        category: 'Product',
        title: {
            es: 'Reporte de Bugs/QA',
            en: 'Bug/QA Report'
        },
        description: {
            es: 'Sintetiza la sesión de pruebas con lista de errores y pasos para reproducir.',
            en: 'Synthesize the testing session with error list and steps to reproduce.'
        },
        icon: Shield,
        color: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30',
        outline: {
            es: ['Errores Críticos', 'Bugs Menores', 'Pasos para Reproducir'],
            en: ['Critical Errors', 'Minor Bugs', 'Steps to Reproduce']
        },
        systemPrompt: AI_TEMPLATE_PROMPTS['qa_bug_report']
    },

    // --- PERIODISMO ---
    {
        id: 'journalist_interview',
        category: 'Periodismo',
        title: {
            es: 'Nota de Entrevista',
            en: 'Interview Note'
        },
        description: {
            es: 'Extrae las mejores cuñas/quotes y el ángulo noticioso de la charla.',
            en: 'Extract the best soundbites/quotes and news angle of the talk.'
        },
        icon: Newspaper,
        color: 'text-slate-700 bg-slate-100 dark:text-slate-200 dark:bg-slate-900/30',
        outline: {
            es: ['Citas Clave', 'Contexto de la Noticia', 'Titulares Sugeridos'],
            en: ['Key Quotes', 'News Context', 'Suggested Headlines']
        },
        systemPrompt: AI_TEMPLATE_PROMPTS['journalist_interview']
    },
    {
        id: 'press_conference_news',
        category: 'Periodismo',
        title: {
            es: 'Conferencia de Prensa',
            en: 'Press Conference'
        },
        description: {
            es: 'Resumen de los anuncios principales y la ronda de preguntas/respuestas.',
            en: 'Summary of main announcements and the Q&A round.'
        },
        icon: Mic2,
        color: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30',
        outline: {
            es: ['Anuncio Oficial', 'Respuestas Críticas', 'Ambiente / Reacción'],
            en: ['Official Announcement', 'Critical Answers', 'Atmosphere / Reaction']
        },
        systemPrompt: AI_TEMPLATE_PROMPTS['press_conference_news']
    },
    {
        id: 'investigative_journalism',
        category: 'Periodismo',
        title: {
            es: 'Investigación Periodística',
            en: 'Investigative Journalism'
        },
        description: {
            es: 'Extrae pistas, datos duros y posibles fuentes de una entrevista o reunión.',
            en: 'Extract tracks, hard data, and possible sources from an interview or meeting.'
        },
        icon: Search,
        color: 'text-slate-800 bg-slate-200 dark:text-slate-100 dark:bg-slate-700',
        outline: {
            es: ['Hecho Central', 'Dato Revelador', 'Fuentes a Contrastar', 'Líneas de Investigación'],
            en: ['Central Fact', 'Revealing Data', 'Sources to Contrast', 'Research Lines']
        },
        systemPrompt: AI_TEMPLATE_PROMPTS['investigative_journalism']
    },
    {
        id: 'profile_piece',
        category: 'Periodismo',
        title: {
            es: 'Perfil de Personaje',
            en: 'Character Profile'
        },
        description: {
            es: 'Captura la esencia, anécdotas y citas clave para redactar un perfil o semblanza.',
            en: 'Capture essence, anecdotes, and key quotes to write a profile or likeness.'
        },
        icon: UserCheck,
        color: 'text-pink-700 bg-pink-100 dark:text-pink-300 dark:bg-pink-900/30',
        outline: {
            es: ['Personalidad', 'Hitos de Vida', 'Mejores Citas Literal', 'Ambiente'],
            en: ['Personality', 'Life Milestones', 'Best Literal Quotes', 'Atmosphere']
        },
        systemPrompt: AI_TEMPLATE_PROMPTS['profile_piece']
    },

    // --- RESEARCH ---
    {
        id: 'research_findings',
        category: 'Research',
        title: {
            es: 'Hallazgos de Investigación',
            en: 'Research Findings'
        },
        description: {
            es: 'Sintetiza descubrimientos, datos validados y literatura referenciada.',
            en: 'Synthesize discoveries, validated data, and referenced literature.'
        },
        icon: Microscope,
        color: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30',
        outline: {
            es: ['Metodología Aplicada', 'Hallazgos de Datos', 'Discusión / Conclusión'],
            en: ['Applied Methodology', 'Data Findings', 'Discussion / Conclusion']
        },
        systemPrompt: AI_TEMPLATE_PROMPTS['research_findings']
    },
    {
        id: 'peer_review_notes',
        category: 'Research',
        title: {
            es: 'Notas de Revisión por Pares',
            en: 'Peer Review Notes'
        },
        description: {
            es: 'Recopila correcciones, críticas y sugerencias para mejorar el trabajo científico.',
            en: 'Collect corrections, criticisms, and suggestions to improve scientific work.'
        },
        icon: FileCheck,
        color: 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30',
        outline: {
            es: ['Críticas Metodológicas', 'Sugerencias de Datos', 'Corrección de Tesis'],
            en: ['Methodological Criticisms', 'Data Suggestions', 'Thesis Correction']
        },
        systemPrompt: AI_TEMPLATE_PROMPTS['peer_review_notes']
    },
    {
        id: 'methodology_design',
        category: 'Research',
        title: {
            es: 'Diseño Metodológico',
            en: 'Methodological Design'
        },
        description: {
            es: 'Define cómo se llevará a cabo la investigación (población, herramientas, sesgos).',
            en: 'Define how research will be carried out (population, tools, bias).'
        },
        icon: Search,
        color: 'text-violet-600 bg-violet-100 dark:text-violet-400 dark:bg-violet-900/30',
        outline: {
            es: ['Enfoque (Cuan/Cual)', 'Población y Muestra', 'Instrumentos', 'Manejo de Sesgos'],
            en: ['Focus (Quan/Qual)', 'Population and Sample', 'Instruments', 'Bias Management']
        },
        systemPrompt: AI_TEMPLATE_PROMPTS['methodology_design']
    },

    // --- CONSULTING ---
    {
        id: 'consulting_diagnostic',
        category: 'Consulting',
        title: {
            es: 'Diagnóstico de Consultoría',
            en: 'Consulting Diagnostic'
        },
        description: {
            es: 'Mapeo de problemas actuales, causas raíz y visión del consultor.',
            en: 'Mapping of current problems, root causes, and consultant vision.'
        },
        icon: ClipboardCheck,
        color: 'text-indigo-600 bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-900/30',
        outline: {
            es: ['Situación Actual', 'Análisis de Brechas', 'Prioridades de Intervención'],
            en: ['Current Situation', 'Gap Analysis', 'Intervention Priorities']
        },
        systemPrompt: AI_TEMPLATE_PROMPTS['consulting_diagnostic']
    },
    {
        id: 'strategy_workshop',
        category: 'Consulting',
        title: {
            es: 'Taller de Estrategia',
            en: 'Strategy Workshop'
        },
        description: {
            es: 'Define el rumbo a largo plazo: FODA, objetivos estratégicos y KPIs.',
            en: 'Define the long-term course: SWOT, strategic objectives, and KPIs.'
        },
        icon: Presentation,
        color: 'text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30',
        outline: {
            es: ['Análisis de Entorno', 'Objetivos Core', 'Métricas de Éxito'],
            en: ['Environment Analysis', 'Core Objectives', 'Success Metrics']
        },
        systemPrompt: AI_TEMPLATE_PROMPTS['strategy_workshop']
    },

    // --- PERSONAL ---
    {
        id: 'journaling',
        category: 'Personal',
        title: {
            es: 'Diario Personal / Reflexión',
            en: 'Personal Journal / Reflection'
        },
        description: {
            es: 'Convierte pensamientos hablados en una entrada de diario estructurada.',
            en: 'Convert spoken thoughts into a structured journal entry.'
        },
        icon: PenTool,
        color: 'text-rose-500 bg-rose-100 dark:text-rose-400 dark:bg-rose-900/30',
        outline: {
            es: ['Sentimiento del Día', 'Hechos Relevantes', 'Reflexión Profunda'],
            en: ['Feeling of the Day', 'Relevant Facts', 'Deep Reflection']
        },
        systemPrompt: AI_TEMPLATE_PROMPTS['journaling']
    },
    {
        id: 'language_practice',
        category: 'Personal',
        title: {
            es: 'Práctica de Idiomas',
            en: 'Language Practice'
        },
        description: {
            es: 'Analiza tu fluidez, errores gramaticales y vocabulario sugerido.',
            en: 'Analyze your fluency, grammar errors, and suggested vocabulary.'
        },
        icon: Languages,
        color: 'text-indigo-600 bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-900/30',
        outline: {
            es: ['Feedback de Fluidez', 'Correcciones Gramaticales', 'Nuevas Palabras'],
            en: ['Fluency Feedback', 'Grammar Corrections', 'New Words']
        },
        systemPrompt: AI_TEMPLATE_PROMPTS['language_practice']
    },

    // --- SPEECH & PRESENTATIONS ---
    {
        id: 'speech_feedback',
        category: 'Speech',
        title: {
            es: 'Feedback de Discurso',
            en: 'Speech Feedback'
        },
        description: {
            es: 'Mejora tu oratoria: Muletillas, tono, claridad y fuerza de los argumentos.',
            en: 'Improve your public speaking: Fillers, tone, clarity, and argument strength.'
        },
        icon: Mic2,
        color: 'text-violet-600 bg-violet-100 dark:text-violet-400 dark:bg-violet-900/30',
        outline: {
            es: ['Análisis de Retórica', 'Uso de Muletillas', 'Puntos a Enfatizar'],
            en: ['Rhetoric Analysis', 'Filler Use', 'Points to Emphasize']
        },
        systemPrompt: AI_TEMPLATE_PROMPTS['speech_feedback']
    },

    // --- SALES / CALLS ---
    {
        id: 'sales_call_summary',
        category: 'Call',
        title: {
            es: 'Resumen de Llamada de Venta',
            en: 'Sales Call Summary'
        },
        description: {
            es: 'Foco en objeciones, necesidades del cliente y probabilidad de cierre.',
            en: 'Focus on objections, client needs, and closing probability.'
        },
        icon: PhoneCall,
        color: 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30',
        outline: {
            es: ['Pain Points Cliente', 'Objeciones Planteadas', 'Compromisos de Seguimiento', 'Sentiment Analysis'],
            en: ['Client Pain Points', 'Raised Objections', 'Follow-up Commitments', 'Sentiment Analysis']
        },
        systemPrompt: AI_TEMPLATE_PROMPTS['sales_call_summary']
    }
];
