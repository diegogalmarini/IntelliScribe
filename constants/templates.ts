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

export interface AITemplate {
    id: string;
    category: 'General' | 'Business' | 'Medical' | 'Education' | 'Legal' | 'HR' | 'Product' | 'Personal' | 'Speech' | 'Call' | 'Consulting' | 'Periodismo' | 'Research';
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
        systemPrompt: {
            es: `Eres una IA adaptativa inteligente. Selecciona automáticamente la mejor estructura para este contenido (reunión, clase, entrevista). Genera un resumen que se adapte perfectamente al escenario detectado.`,
            en: `You are an intelligent adaptive AI. Automatically select the best structure for this content. Generate a summary that perfectly adapts to the detected scenario.`
        }
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
        systemPrompt: {
            es: `Eres una IA de inferencia lógica. Deduce y genera la estructura más adecuada ajustando el análisis en tiempo real para equilibrar eficiencia y precisión.`,
            en: `You are a logical inference AI. Deduce and generate the most suitable structure by adjusting the analysis in real-time.`
        }
    },
    {
        id: 'detailed',
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
        systemPrompt: {
            es: `Objetivo: Resumen altamente detallado. Extrae Tareas [URGENT], Seguimientos [FOLLOW-UP] y Datos Clave (Nombres, Fechas, etc.).`,
            en: `Goal: Highly detailed summary. Extract Tasks [URGENT], Follow-ups [FOLLOW-UP], and Key Details (Names, Dates, etc.).`
        }
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
        systemPrompt: {
            es: `Tu única tarea es corregir y formatear la transcripción literal. NO resumas. Mantén el orden cronológico exacto e identifica hablantes.`,
            en: `YOUR ONLY TASK IS TO CORRECT AND FORMAT THE VERBATIM TRANSCRIPT. Do not summarize. Maintain chronological order.`
        }
    },
    {
        id: 'brief',
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
        systemPrompt: {
            es: `Genera un resumen ultra-conciso. Enfócate solo en lo esencial (máximo 3 bullets).`,
            en: `Generate an ultra-concise summary. Focus only on the essentials (max 3 bullets).`
        }
    },
    {
        id: 'mind_map_structure',
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
        systemPrompt: {
            es: `Organiza la información en una jerarquía de niveles para facilitar la creación de un mapa mental.`,
            en: `Organize the information in a level hierarchy to facilitate the creation of a mind map.`
        }
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
        systemPrompt: {
            es: `Eres un redactor de discusiones de equipo. Estructura claramente por temas, conclusiones y next steps.`,
            en: `You are a team discussion writer. Structure clearly by topics, conclusions, and next steps.`
        }
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
        systemPrompt: {
            es: `Genera una Minuta de Reunión estructurada (Meeting Info, Notes, Arrangements).`,
            en: `Generate a structured Meeting Minute (Meeting Info, Notes, Arrangements).`
        }
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
        systemPrompt: {
            es: `Eres un consultor de ventas. Analiza usando BANT y sugiere pasos para cerrar.`,
            en: `You are a sales consultant. Analyze using BANT and suggest closing steps.`
        }
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
        systemPrompt: {
            es: `Extrae la visión del proyecto, roles clave y el calendario de entregables.`,
            en: `Extract project vision, key roles, and deliverables schedule.`
        }
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
        systemPrompt: {
            es: `Genera un resumen formal para junta directiva, destacando resoluciones aprobadas.`,
            en: `Generate a formal board summary, highlighting approved resolutions.`
        }
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
        systemPrompt: {
            es: `Extrae el estado de cada tarea y los impedimentos mencionados en la reunión.`,
            en: `Extract the status of each task and the impediments mentioned in the meeting.`
        }
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
        systemPrompt: {
            es: `Genera una nota médica SOAP profesional y precisa a partir de la transcripción clínica.`,
            en: `Generate a professional and precise medical SOAP note from the clinical transcript.`
        }
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
        systemPrompt: {
            es: `Traduce la consulta a un lenguaje sencillo para el paciente, destacando medicación y siguientes pasos.`,
            en: `Translate the consultation into simple language for the patient, highlighting medication and next steps.`
        }
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
        systemPrompt: {
            es: `Identifica y lista valores fuera de rango y conclusiones de exámenes médicos citados.`,
            en: `Identify and list out-of-range values and conclusions from cited medical exams.`
        }
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
        systemPrompt: {
            es: `Crea un resumen de alta detallado basado en la discusión del equipo médico.`,
            en: `Create a detailed discharge summary based on the medical team's discussion.`
        }
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
        systemPrompt: {
            es: `Enfócate en el cumplimiento del protocolo y la recolección de métricas de investigación.`,
            en: `Focus on protocol compliance and research metric collection.`
        }
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
        systemPrompt: {
            es: `Sintetiza los hallazgos visuales descritos por el especialista en el informe.`,
            en: `Synthesize the visual findings described by the specialist in the report.`
        }
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
        systemPrompt: {
            es: `Transforma la lección en un capítulo de manual universitario profundo. Organiza en secciones con títulos.`,
            en: `Transform the lecture into an in-depth university textbook chapter. Organize into sections with titles.`
        }
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
        systemPrompt: {
            es: `Genera notas de clase estructuradas con foco en conceptos clave y tareas asignadas.`,
            en: `Generate structured class notes focusing on key concepts and assigned tasks.`
        }
    },
    {
        id: 'study_guide',
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
        systemPrompt: {
            es: `Crea una guía de estudio formativa con preguntas de autoevaluación basadas en el contenido.`,
            en: `Create a formative study guide with self-assessment questions based on the content.`
        }
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
        systemPrompt: {
            es: `Estructura las ideas sueltas de la sesión en un borrador de propuesta de investigación.`,
            en: `Structure loose ideas from the session into a draft research proposal.`
        }
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
        systemPrompt: {
            es: `Identifica términos clave en el idioma estudiado y explica su uso según la clase.`,
            en: `Identify key terms in the studied language and explain their use according to the class.`
        }
    },
    {
        id: 'workshop_summary',
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
        systemPrompt: {
            es: `Resume las actividades prácticas realizadas, enfatizando el "cómo se hizo".`,
            en: `Summarize the practical activities performed, emphasizing the "how-to".`
        }
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
        systemPrompt: {
            es: `Extrae los hechos relevantes y las implicaciones legales discutidas. Tono formal y analítico.`,
            en: `Extract relevant facts and discussed legal implications. Formal and analytical tone.`
        }
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
        systemPrompt: {
            es: `Analiza la discusión sobre el contrato. Lista los puntos de conflicto y lo que requiere revisión.`,
            en: `Analyze the contract discussion. List conflict points and what requires review.`
        }
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
        systemPrompt: {
            es: `Resume la declaración enfocándote en los puntos que afectan la teoría del caso.`,
            en: `Summarize the deposition focusing on points that affect the case theory.`
        }
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
        systemPrompt: {
            es: `Identifica brechas de cumplimiento basándote en los estándares citados en la sesión.`,
            en: `Identify compliance gaps based on standards cited in the session.`
        }
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
        systemPrompt: {
            es: `Resume la audiencia destacando lo que el juez resolvió y cuándo vence el próximo plazo.`,
            en: `Summarize the hearing highlighting what the judge ruled and when the next deadline is.`
        }
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
        systemPrompt: {
            es: `Estructura los puntos que requieren mayor investigación legal basándote en la consulta inicial.`,
            en: `Structure the points that require further legal research based on the initial consultation.`
        }
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
        systemPrompt: {
            es: `Sintetiza la entrevista. Evalúa fortalezas, debilidades y si el candidato encaja en la posición.`,
            en: `Synthesize the interview. Evaluate strengths, weaknesses, and if the candidate fits the position.`
        }
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
        systemPrompt: {
            es: `Captura el feedback constructivo y los nuevos compromisos acordados durante la evaluación.`,
            en: `Capture constructive feedback and new commitments agreed upon during the evaluation.`
        }
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
        systemPrompt: {
            es: `Crea una guía de bienvenida personalizada basada en la conversación de inducción.`,
            en: `Create a personalized welcome guide based on the induction conversation.`
        }
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
        systemPrompt: {
            es: `Extrae de forma neutral las razones de la renuncia y sugerencias para mejorar el clima laboral.`,
            en: `Extract neutrally the reasons for resignation and suggestions to improve the work environment.`
        }
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
        systemPrompt: {
            es: `Resume qué fue lo más valioso del entrenamiento y qué podría mejorarse.`,
            en: `Summarize what was most valuable of the training and what could be improved.`
        }
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
        systemPrompt: {
            es: `Resume de forma imparcial el conflicto y los pasos acordados para su resolución.`,
            en: `Summarize impartially the conflict and agreed steps for its resolution.`
        }
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
        systemPrompt: {
            es: `Analiza la sesión de testing. ¿Qué le costó al usuario? ¿Qué le gustó? Extrae insights claros.`,
            en: `Analyze the testing session. What was difficult for the user? What did they like? Extract clear insights.`
        }
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
        systemPrompt: {
            es: `Organiza la discusión en un plan de lanzamientos basado en las prioridades acordadas.`,
            en: `Organize the discussion into a release plan based on agreed priorities.`
        }
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
        systemPrompt: {
            es: `Resume los requerimientos del producto. Enfócate en el valor para el usuario y limitantes.`,
            en: `Summarize product requirements. Focus on user value and constraints.`
        }
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
        systemPrompt: {
            es: `Lista los cambios de diseño acordados. Sé específico con el feedback sobre UI/UX.`,
            en: `List agreed design changes. Be specific with UI/UX feedback.`
        }
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
        systemPrompt: {
            es: `Resume la retro. Clasifica en positivo, negativo y compromisos de mejora.`,
            en: `Summarize the retro. Classify into positive, negative, and improvement commitments.`
        }
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
        systemPrompt: {
            es: `Extrae todos los fallos reportados durante la sesión de QA con su contexto.`,
            en: `Extract all reported failures during the QA session with their context.`
        }
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
        systemPrompt: {
            es: `Identifica las declaraciones más impactantes. Proporciona contexto para una nota de prensa.`,
            en: `Identify the most impactful statements. Provide context for a press release.`
        }
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
        systemPrompt: {
            es: `Resume los puntos informativos clave. Separa el anuncio oficial de las aclaraciones posteriores.`,
            en: `Summarize key information points. Separate official announcement from subsequent clarifications.`
        }
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
        systemPrompt: {
            es: `Eres un periodista de investigación. Busca el "hook" de la historia y los datos que necesitan verificación.`,
            en: `You are an investigative journalist. Look for the "hook" of the story and data that needs verification.`
        }
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
        systemPrompt: {
            es: `Extrae lo más humano de la entrevista. Citas literales potentes y anécdotas que definan al personaje.`,
            en: `Extract the most human part of the interview. Powerful literal quotes and anecdotes that define the character.`
        }
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
        systemPrompt: {
            es: `Lleva la conversación a un formato de paper académico. Enfócate en rigor y evidencia.`,
            en: `Take the conversation into an academic paper format. Focus on rigor and evidence.`
        }
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
        systemPrompt: {
            es: `Lista los puntos de mejora solicitados para que el trabajo sea aceptado.`,
            en: `List requested points of improvement for the work to be accepted.`
        }
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
        systemPrompt: {
            es: `Estructura la metodología de investigación discutida. Asegura que el proceso sea reproducible y sólido.`,
            en: `Structure the discussed research methodology. Ensure the process is reproducible and solid.`
        }
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
        systemPrompt: {
            es: `Como consultor experto, resume los desafíos detectados y propón una ruta de mejora estratégica.`,
            en: `As an expert consultant, summarize detected challenges and propose a strategic improvement route.`
        }
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
        systemPrompt: {
            es: `Estructura los acuerdos de nivel C. Diferencia entre visión, tácticas y responsables.`,
            en: `Structure C-level agreements. Differentiate between vision, tactics, and responsible parties.`
        }
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
        systemPrompt: {
            es: `Estructura los pensamientos del usuario como un diario. Sé empático y destaca momentos de gratitud o aprendizaje.`,
            en: `Structure the user's thoughts as a journal. Be empathetic and highlight moments of gratitude or learning.`
        }
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
        systemPrompt: {
            es: `Analiza la práctica del idioma. Corrige errores y sugiere formas más naturales de expresarse.`,
            en: `Analyze the language practice. Correct errors and suggest more natural ways of expressing oneself.`
        }
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
        systemPrompt: {
            es: `Analiza el discurso. Identifica dónde se pierde el ritmo y cómo mejorar el impacto del mensaje.`,
            en: `Analyze the speech. Identify where the rhythm is lost and how to improve the message impact.`
        }
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
        systemPrompt: {
            es: `Resume la llamada comercial. Identifica el presupuesto, la autoridad del interlocutor y los bloqueadores.`,
            en: `Summarize the business call. Identify budget, authority of the interlocutor, and blockers.`
        }
    }
];
