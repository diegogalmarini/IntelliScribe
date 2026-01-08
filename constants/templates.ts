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
    Heart as HeartIcon
} from 'lucide-react';

export interface AITemplate {
    id: string;
    category: 'General' | 'Business' | 'Medical' | 'Education' | 'Legal' | 'HR' | 'Product' | 'Personal' | 'Speech' | 'Call' | 'Consulting' | 'Periodismo' | 'Research';
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
        title: 'Resumen Adaptativo (Autopilot)',
        description: 'Ideal para reuniones, entrevistas y clases. La IA adapta la estructura al tipo de contenido automáticamente.',
        icon: Sparkles,
        color: 'text-violet-600 bg-violet-100 dark:text-violet-400 dark:bg-violet-900/30',
        outline: ['Estructura Adaptativa', 'Insights Clave', 'Resumen General'],
        systemPrompt: {
            es: `Eres una IA adaptativa inteligente. Selecciona automáticamente la mejor estructura para este contenido (reunión, clase, entrevista). Genera un resumen que se adapte perfectamente al escenario detectado.`,
            en: `You are an intelligent adaptive AI. Automatically select the best structure for this content. Generate a summary that perfectly adapts to the detected scenario.`
        }
    },
    {
        id: 'reasoning',
        category: 'General',
        title: 'Resumen de Razonamiento',
        description: 'Optimizado para notas transcritas. Utiliza inferencia lógica para crear un flujo coherente y claro.',
        icon: BrainCircuit,
        color: 'text-indigo-600 bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-900/30',
        outline: ['Flujo Lógico', 'Deducciones IA', 'Conclusiones'],
        systemPrompt: {
            es: `Eres una IA de inferencia lógica. Deduce y genera la estructura más adecuada ajustando el análisis en tiempo real para equilibrar eficiencia y precisión.`,
            en: `You are a logical inference AI. Deduce and generate the most suitable structure by adjusting the analysis in real-time.`
        }
    },
    {
        id: 'detailed',
        category: 'General',
        title: 'Detallado y Estructurado',
        description: 'Análisis profundo con enfoque en tareas, nombres y fechas. Formato listo para Notion/Documentos.',
        icon: ListChecks,
        color: 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30',
        outline: ['Sumario de Conversación', 'Tareas y Acciones', 'Seguimientos', 'Datos Extraídos'],
        systemPrompt: {
            es: `Objetivo: Resumen altamente detallado. Extrae Tareas [URGENT], Seguimientos [FOLLOW-UP] y Datos Clave (Nombres, Fechas, etc.).`,
            en: `Goal: Highly detailed summary. Extract Tasks [URGENT], Follow-ups [FOLLOW-UP], and Key Details (Names, Dates, etc.).`
        }
    },
    {
        id: 'verbatim',
        category: 'General',
        title: 'Transcripción Literal (Limpia)',
        description: 'Corrige errores gramaticales de la transcripción sin resumir nada. Ideal para actas literales.',
        icon: FileText,
        color: 'text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-800',
        outline: ['Texto Íntegro Corregido'],
        systemPrompt: {
            es: `Tu única tarea es corregir y formatear la transcripción literal. NO resumas. Mantén el orden cronológico exacto e identifica hablantes.`,
            en: `Your only task is to correct and format the verbatim transcript. DO NOT summarize. Maintain exact chronological order.`
        }
    },
    {
        id: 'exec_brief',
        category: 'General',
        title: 'Resumen Ejecutivo (Breve)',
        description: 'Para cuando solo tienes 30 segundos. Lo más importante en una sola mirada.',
        icon: Zap,
        color: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30',
        outline: ['Idea Principal', '3 Puntos Clave', 'Acción Inmediata'],
        systemPrompt: {
            es: `Genera un resumen ultra-breve. Una frase de idea principal y máximo 3 bullet points de impacto.`,
            en: `Generate an ultra-brief summary. One main idea sentence and maximum 3 impact bullet points.`
        }
    },
    {
        id: 'storytelling',
        category: 'General',
        title: 'Resumen Narrativo',
        description: 'Transforma la conversación en una historia fluida. Ideal para entender el contexto emocional.',
        icon: BookOpen,
        color: 'text-pink-600 bg-pink-100 dark:text-pink-400 dark:bg-pink-900/30',
        outline: ['Introducción / Contexto', 'Desarrollo de Ideas', 'Resolución / Cierre'],
        systemPrompt: {
            es: `Redacta el contenido como una narrativa fluida. Enfócate en la progresión de la conversación y el "storyline" de lo discutido.`,
            en: `Write the content as a fluid narrative. Focus on the progression of the conversation and the storyline.`
        }
    },

    // --- BUSINESS ---
    {
        id: 'discussion_meeting',
        category: 'Business',
        title: 'Resumen de Discusión',
        description: 'Para reuniones de equipo. Extrae temas, conclusiones y próximos pasos por tópico.',
        icon: MessageSquare,
        color: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30',
        outline: ['Tópicos Discutidos', 'Conclusiones', 'Pasos a Seguir'],
        systemPrompt: {
            es: `Eres un redactor de discusiones. Para cada tema: Título, Conclusión y Pasos a seguir.`,
            en: `You are a discussion writer. For each topic: Title, Conclusion, and Next Steps.`
        }
    },
    {
        id: 'meeting_note',
        category: 'Business',
        title: 'Acta de Reunión (Plaud)',
        description: 'Formato corporativo con información de la sesión, notas estructuradas y acuerdos.',
        icon: Users,
        color: 'text-cyan-600 bg-cyan-100 dark:text-cyan-400 dark:bg-cyan-900/30',
        outline: ['Información de Reunión', 'Notas por Tópico', 'Action Items'],
        systemPrompt: {
            es: `Genera una nota de reunión: Info básica, Notas detalladas por tema y lista de tareas.`,
            en: `Generate meeting notes: Basic info, detailed notes per topic, and task list.`
        }
    },
    {
        id: 'bant',
        category: 'Business',
        title: 'Cualificación BANT',
        description: 'Para llamadas de ventas. Analiza Budget (Presupuesto), Authority, Need y Timing.',
        icon: Target,
        color: 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30',
        outline: ['Presupuesto', 'Autoridad', 'Necesidad', 'Tiempos', 'Siguiente Paso'],
        systemPrompt: {
            es: `Analiza la llamada usando BANT: Budget, Authority, Need, Timing. Evalúa la viabilidad del prospecto.`,
            en: `Analyze the call using BANT: Budget, Authority, Need, Timing. Evaluate prospect viability.`
        }
    },
    {
        id: 'exec_summary',
        category: 'Business',
        title: 'Sumario Ejecutivo Strategic',
        description: 'Resumen de alto nivel para directivos y stakeholders.',
        icon: TrendingUp,
        color: 'text-indigo-600 bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-900/30',
        outline: ['Visión General', 'Hitos Alcanzados', 'Riesgos Detectados', 'Decisiones Requeridas'],
        systemPrompt: {
            es: `Crea un sumario ejecutivo para gerencia. Enfócate en decisiones, riesgos y progreso estratégico.`,
            en: `Create an executive summary for management. Focus on decisions, risks, and strategic progress.`
        }
    },
    {
        id: 'interview_notes',
        category: 'Business',
        title: 'Notas de Entrevista B2B',
        description: 'Especializado en capturar requerimientos y pain points de clientes corporativos.',
        icon: UserCheck,
        color: 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30',
        outline: ['Contexto Cliente', 'Dolores (Pain Points)', 'Requerimientos Técnicos', 'Expectativas'],
        systemPrompt: {
            es: `Extrae requerimientos de la entrevista. Identifica qué le duele al cliente y qué espera de la solución.`,
            en: `Extract interview requirements. Identify customer pain points and solution expectations.`
        }
    },
    {
        id: 'strat_planning',
        category: 'Business',
        title: 'Planificación Estratégica',
        description: 'Para sesiones de brainstorming y planificación de objetivos a largo plazo.',
        icon: Clock,
        color: 'text-rose-600 bg-rose-100 dark:text-rose-400 dark:bg-rose-900/30',
        outline: ['Misión/Visión Focalizada', 'Objetivos OKR', 'Análisis de Recursos', 'Timeline'],
        systemPrompt: {
            es: `Sintetiza la sesión de planificación. Busca objetivos claros (OKRs), plazos y recursos necesarios.`,
            en: `Synthesize the planning session. Look for clear objectives (OKRs), deadlines, and resources.`
        }
    },

    // --- MEDICAL ---
    {
        id: 'medical_soap',
        category: 'Medical',
        title: 'Nota Médica SOAP',
        description: 'Estándar clínico: Subjetivo, Objetivo, Evaluación y Plan.',
        icon: MedicalIcon,
        color: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30',
        outline: ['S: Subjetivo', 'O: Objetivo', 'A: Evaluación', 'P: Plan de Tratamiento'],
        systemPrompt: {
            es: `Genera una nota médica siguiendo el formato SOAP. Tono formal, preciso y profesional.`,
            en: `Generate a medical note following the SOAP format. Formal, precise, and professional tone.`
        }
    },
    {
        id: 'patient_consult',
        category: 'Medical',
        title: 'Consulta de Paciente',
        description: 'Resumen amigable para el paciente sobre su visita y recomendaciones.',
        icon: MessageCircle,
        color: 'text-teal-600 bg-teal-100 dark:text-teal-400 dark:bg-teal-900/30',
        outline: ['Motivo de Visita', 'Resumen Doctor', 'Medicamentos', 'Próxima Cita'],
        systemPrompt: {
            es: `Crea un resumen de la consulta para el paciente. Usa lenguaje claro y no excesivamente técnico.`,
            en: `Create a summary of the consultation for the patient. Use clear, non-technical language.`
        }
    },
    {
        id: 'lab_report',
        category: 'Medical',
        title: 'Análisis de Resultados',
        description: 'Para médicos. Extrae valores críticos y tendencias de las pruebas discutidas.',
        icon: FlaskConical,
        color: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30',
        outline: ['Parámetros Analizados', 'Valores Fuera de Rango', 'Sugerencias Diagnósticas'],
        systemPrompt: {
            es: `Analiza la discusión sobre resultados de laboratorio. Resalta valores anómalos y tendencias comentadas.`,
            en: `Analyze the lab results discussion. Highlight abnormal values and commented trends.`
        }
    },
    {
        id: 'discharge_summary',
        category: 'Medical',
        title: 'Resumen de Epicrisis',
        description: 'Resumen de alta hospitalaria con antecedentes y plan de seguimiento.',
        icon: ClipboardList,
        color: 'text-sky-600 bg-sky-100 dark:text-sky-400 dark:bg-sky-900/30',
        outline: ['Antecedentes', 'Curso Hospitalario', 'Plan de Medicación', 'Cuidados en Casa'],
        systemPrompt: {
            es: `Genera un resumen de alta (epicrisis). Describe brevemente el tratamiento recibido y las instrucciones de alta.`,
            en: `Generate a discharge summary. Briefly describe the treatment received and discharge instructions.`
        }
    },
    {
        id: 'clinical_trial',
        category: 'Medical',
        title: 'Nota de Ensayo Clínico',
        description: 'Captura datos específicos para investigación y cumplimiento normativo.',
        icon: Dna,
        color: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
        outline: ['Fase del Estudio', 'Criterios de Observación', 'Eventos Adversos (si hay)', 'Cumplimiento'],
        systemPrompt: {
            es: `Extrae datos relevantes para investigación clínica. Enfócate en observación, cumplimiento y seguridad.`,
            en: `Extract relevant data for clinical research. Focus on observation, compliance, and safety.`
        }
    },
    {
        id: 'radiology_summary',
        category: 'Medical',
        title: 'Resumen Radiológico',
        description: 'Estructura para actas de radiología, ecografía o resonancia.',
        icon: Activity,
        color: 'text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-800',
        outline: ['Procedimiento', 'Hallazgos Visuales', 'Impresión Diagnóstica'],
        systemPrompt: {
            es: `Sintetiza los hallazgos radiológicos discutidos. Separa claramente la descripción técnica de la conclusión.`,
            en: `Synthesize the radiology findings discussed. Separate the technical description from the conclusion.`
        }
    },

    // --- EDUCATION ---
    {
        id: 'university_lecture',
        category: 'Education',
        title: 'Lección Universitaria',
        description: 'Transforma una clase en un capítulo de estudio con conceptos y ejemplos.',
        icon: BookOpen,
        color: 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30',
        outline: ['Temario Principal', 'Conceptos Desarrollados', 'Ejemplos Clave', 'Resumen para Examen'],
        systemPrompt: {
            es: `Transforma esta clase en material de estudio. Estructura con títulos, explica conceptos y añade ejemplos prácticos.`,
            en: `Transform this class into study material. Structure with titles, explain concepts, and add practical examples.`
        }
    },
    {
        id: 'class_note',
        category: 'Education',
        title: 'Apuntes de Clase',
        description: 'Notas rápidas y organizadas: palabras clave, aprendizajes y tareas.',
        icon: GraduationCap,
        color: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30',
        outline: ['Info de Clase', 'Keywords', 'Key Learnings', 'Tareas Asignadas'],
        systemPrompt: {
            es: `Genera apuntes de clase eficientes. Lista palabras clave, conceptos principales y cualquier tarea mencionada.`,
            en: `Generate efficient class notes. List keywords, main concepts, and any mentioned tasks.`
        }
    },
    {
        id: 'brainstorm_notes',
        category: 'Education',
        title: 'Notas de Brainstorming',
        description: 'Ideal para trabajos en grupo y sesiones creativas de estudiantes.',
        icon: Lightbulb,
        color: 'text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30',
        outline: ['Problema Planteado', 'Ideas Generadas', 'Selección de Mejores Ideas', 'Próximos Pasos'],
        systemPrompt: {
            es: `Organiza el caos del brainstorming. Clasifica las ideas, destaca las más viables y define quién hace qué.`,
            en: `Organize the brainstorming chaos. Classify ideas, highlight the most viable ones, and define who does what.`
        }
    },
    {
        id: 'thesis_outline',
        category: 'Education',
        title: 'Esquema de Tesis',
        description: 'Ayuda a estructurar la investigación para tesis o trabajos finales de grado.',
        icon: ClipboardList,
        color: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30',
        outline: ['Título Propuesto', 'Hipótesis', 'Capítulos Identificados', 'Fuentes/Referencias'],
        systemPrompt: {
            es: `Ayuda a estructurar una investigación. Identifica la hipótesis, los puntos principales de cada capítulo y la bibliografía.`,
            en: `Help structure a research project. Identify the hypothesis, main points of each chapter, and bibliography.`
        }
    },
    {
        id: 'workshop_summary',
        category: 'Education',
        title: 'Sumario de Taller',
        description: 'Captura la esencia de talleres prácticos y seminarios interactivos.',
        icon: Presentation,
        color: 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30',
        outline: ['Objetivo del Taller', 'Metodología', 'Resultados de Ejercicios', 'Feedback Recibido'],
        systemPrompt: {
            es: `Resume el desarrollo del taller. Destaca la participación, las técnicas aprendidas y los resultados prácticos.`,
            en: `Summarize the workshop's development. Highlight participation, learned techniques, and practical results.`
        }
    },
    {
        id: 'exam_prep',
        category: 'Education',
        title: 'Guía de Repaso',
        description: 'Genera preguntas y respuestas basadas en la transcripción para repasar.',
        icon: ListChecks,
        color: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
        outline: ['Tópicos Recurrentes', 'Preguntas Q&A', 'Fórmulas/Datos de Memoria'],
        systemPrompt: {
            es: `Crea una guía de repaso. Convierte los conceptos más importantes en preguntas y respuestas rápidas.`,
            en: `Create a review guide. Turn the most important concepts into quick questions and answers.`
        }
    },

    // --- LEGAL ---
    {
        id: 'case_review',
        category: 'Legal',
        title: 'Análisis de Caso',
        description: 'Resumen estructurado de hechos, alegaciones y fundamentos legales.',
        icon: LegalIcon,
        color: 'text-slate-800 bg-slate-200 dark:text-slate-200 dark:bg-slate-700',
        outline: ['Hechos Probados', 'Fundamentos de Derecho', 'Pretensiones', 'Estrategia'],
        systemPrompt: {
            es: `Analiza el caso judicial. Identifica hechos clave, leyes aplicables y la posición de cada parte.`,
            en: `Analyze the legal case. Identify key facts, applicable laws, and each party's position.`
        }
    },
    {
        id: 'legal_consult',
        category: 'Legal',
        title: 'Consulta Jurídica',
        description: 'Resumen de la reunión con el cliente: su problema y tu consejo inicial.',
        icon: Users,
        color: 'text-indigo-600 bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-900/30',
        outline: ['Planteamiento Cliente', 'Riesgos Detectados', 'Presupuesto/Honorarios', 'Hoja de Ruta'],
        systemPrompt: {
            es: `Sintetiza la consulta legal. Qué necesita el cliente, qué riesgos ves y cuál es el plan de acción propuesto.`,
            en: `Synthesize the legal consultation. What the client needs, what risks you see, and the proposed action plan.`
        }
    },
    {
        id: 'deposition_sum',
        category: 'Legal',
        title: 'Resumen de Declaración',
        description: 'Condensa horas de testimonio en una cronología de declaraciones clave.',
        icon: MessageSquare,
        color: 'text-rose-600 bg-rose-100 dark:text-rose-400 dark:bg-rose-900/30',
        outline: ['Testigo', 'Cronología de Hechos', 'Contradicciones Detectadas', 'Citas Clave'],
        systemPrompt: {
            es: `Resume la declaración o testimonio. Resalta contradicciones y afirmaciones críticas para el caso.`,
            en: `Summarize the statement or testimony. Highlight contradictions and critical statements for the case.`
        }
    },
    {
        id: 'contract_analysis',
        category: 'Legal',
        title: 'Análisis de Contrato',
        description: 'Extrae cláusulas críticas, penalizaciones y fechas de vencimiento.',
        icon: ClipboardList,
        color: 'text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/30',
        outline: ['Objeto Contrato', 'Obligaciones Principales', 'Cláusulas de Rescisión', 'Fechas Críticas'],
        systemPrompt: {
            es: `Como experto legal, extrae los puntos de riesgo de este contrato/acuerdo. Detalla obligaciones y plazos.`,
            en: `As a legal expert, extract the risk points of this contract/agreement. Detail obligations and deadlines.`
        }
    },
    {
        id: 'litigation_strat',
        category: 'Legal',
        title: 'Estrategia de Litigio',
        description: 'Sintetiza la táctica legal, posibles resultados y próximos pasos procesales.',
        icon: Shield,
        color: 'text-orange-800 bg-orange-100 dark:text-orange-200 dark:bg-orange-900/30',
        outline: ['Táctica Procesal', 'Escenarios de Resultado', 'Acciones Inmediatas'],
        systemPrompt: {
            es: `Resume la sesión de estrategia legal. Evalúa la viabilidad de las tácticas discutidas y los pasos siguientes.`,
            en: `Summarize the legal strategy session. Evaluate the viability of the discussed tactics and next steps.`
        }
    },
    {
        id: 'compliance_audit',
        category: 'Legal',
        title: 'Auditoría de Cumplimiento',
        description: 'Verifica el cumplimiento de normativas discutidas durante la sesión.',
        icon: ListChecks,
        color: 'text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-900/30',
        outline: ['Normas Aplicables', 'Gaps en Cumplimiento', 'Plan de Remediación'],
        systemPrompt: {
            es: `Identifica brechas de cumplimiento normativo mencionadas. Crea un plan de acción para remediarlas.`,
            en: `Identify mentioned regulatory compliance gaps. Create an action plan to remediate them.`
        }
    },

    // --- HR ---
    {
        id: 'hr_interview',
        category: 'HR',
        title: 'Entrevista de Selección',
        description: 'Evaluación técnica y cultural sistemática de un candidato.',
        icon: UserPlus,
        color: 'text-pink-600 bg-pink-100 dark:text-pink-400 dark:bg-pink-900/30',
        outline: ['Ficha Candidato', 'Hard Skills', 'Soft Skills / Cultura', 'Veredicto'],
        systemPrompt: {
            es: `Analiza la entrevista. Evalúa competencias técnicas, ajuste cultural y da una recomendación final.`,
            en: `Analyze the interview. Evaluate technical skills, cultural fit, and give a final recommendation.`
        }
    },
    {
        id: 'perf_review',
        category: 'HR',
        title: 'Evaluación de Desempeño',
        description: 'Resumen de logros, áreas de mejora y objetivos para el próximo periodo.',
        icon: TrendingUp,
        color: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30',
        outline: ['Logros Clave', 'Áreas de Oportunidad', 'Feedback 360', 'Nuevos OKRs'],
        systemPrompt: {
            es: `Sintetiza la sesión de evaluación. Qué se hizo bien, qué debe mejorar y qué objetivos se fijaron.`,
            en: `Synthesize the evaluation session. What went well, what needs improvement, and what goals were set.`
        }
    },
    {
        id: 'exit_interview',
        category: 'HR',
        title: 'Entrevista de Salida',
        description: 'Captura los motivos de la baja y sugerencias para mejorar la retención.',
        icon: MessageSquare,
        color: 'text-red-500 bg-red-50 dark:text-red-300 dark:bg-red-900/10',
        outline: ['Motivo Salida', 'Experiencia en Empresa', 'Puntos Críticos', 'Recomendaciones HR'],
        systemPrompt: {
            es: `Extrae la verdad sobre la salida del empleado. Identifica patrones que puedan afectar la retención.`,
            en: `Extract the truth about the employee's departure. Identify patterns that may affect retention.`
        }
    },
    {
        id: 'training_notes',
        category: 'HR',
        title: 'Formación de Personal',
        description: 'Resumen de sesiones de capacitación y onboarding para empleados.',
        icon: GraduationCap,
        color: 'text-teal-600 bg-teal-100 dark:text-teal-400 dark:bg-teal-900/30',
        outline: ['Módulos Impartidos', 'Conceptos Críticos', 'Dudas de Empleados', 'Próxima Evaluación'],
        systemPrompt: {
            es: `Resume la formación. Qué se enseñó, qué dudas surgieron y cuáles son los siguientes pasos del aprendizaje.`,
            en: `Summarize the training. What was taught, what doubts arose, and what are the next learning steps.`
        }
    },
    {
        id: 'conflict_res',
        category: 'HR',
        title: 'Resolución de Conflictos',
        description: 'Mediación estructurada: posiciones de las partes y acuerdos alcanzados.',
        icon: Shield,
        color: 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30',
        outline: ['Contexto Conflicto', 'Posturas', 'Acuerdos / Compromisos', 'Seguimiento'],
        systemPrompt: {
            es: `Resumen imparcial del conflicto y de los acuerdos. Enfócate en soluciones y compromisos mutuos.`,
            en: `Impartial summary of the conflict and agreements. Focus on solutions and mutual commitments.`
        }
    },
    {
        id: 'policy_briefing',
        category: 'HR',
        title: 'Resumen de Políticas',
        description: 'Explica cambios en normativas internas o beneficios a los empleados.',
        icon: ClipboardList,
        color: 'text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-800',
        outline: ['Nueva Política', 'Cambios vs Anterior', 'Impacto en Empleado', 'Fechas Vigencia'],
        systemPrompt: {
            es: `Sintetiza el cambio de política. Explica de forma sencilla cómo afecta al día a día del trabajador.`,
            en: `Synthesize the policy change. Explain simply how it affects the worker's day-to-day.`
        }
    },

    // --- PRODUCT ---
    {
        id: 'ux_feedback',
        category: 'Product',
        title: 'Feedback de Usuario (UX)',
        description: 'Insights de tests de usabilidad, entrevistas y quejas para mejorar el producto.',
        icon: Microscope,
        color: 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30',
        outline: ['User Persona', 'Pain Points', 'Puntos Positivos', 'Sugerencias UX'],
        systemPrompt: {
            es: `Analiza el feedback del usuario. Qué no entiende, qué le frustra y qué le gusta de la interfaz.`,
            en: `Analyze user feedback. What they don't understand, what frustrates them, and what they like about the UI.`
        }
    },
    {
        id: 'sprint_retro',
        category: 'Product',
        title: 'Sprint Retrospective',
        description: 'Qué fue bien, qué falló y qué mejoraremos en el próximo ciclo.',
        icon: Clock,
        color: 'text-blue-500 bg-blue-50 dark:text-blue-300 dark:bg-blue-900/10',
        outline: ['Lo que Funcionó', 'Lo que Falló', 'Ideas de Mejora', 'Votos de Equipo'],
        systemPrompt: {
            es: `Resumen de la retro. Enfócate en acciones concretas para el próximo sprint y cuellos de botella detectados.`,
            en: `Retrospective summary. Focus on concrete actions for the next sprint and detected bottlenecks.`
        }
    },
    {
        id: 'product_roadmap',
        category: 'Product',
        title: 'Roadmap de Producto',
        description: 'Define prioridades y lanzamientos planeados tras la sesión de producto.',
        icon: Target,
        color: 'text-rose-600 bg-rose-100 dark:text-rose-400 dark:bg-rose-900/30',
        outline: ['Visión Trimestral', 'Features Priorizadas', 'Dependencias Técnicas', 'Timeline'],
        systemPrompt: {
            es: `Sintetiza la estrategia de lanzamientos. Cuáles son las funcionalidades estrella y cuándo se esperan.`,
            en: `Synthesize the launch strategy. What are the star features and when are they expected.`
        }
    },
    {
        id: 'feature_specs',
        category: 'Product',
        title: 'Especificaciones de Feature',
        description: 'Convierte una discusión técnica en un borrador de PRD o especificación técnica.',
        icon: PenTool,
        color: 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30',
        outline: ['Funcionalidad', 'Criterios Aceptación', 'Casos de Borde', 'Notas de Diseño'],
        systemPrompt: {
            es: `Genera el borrador técnico de la funcionalidad discutida. Incluye lógica de negocio y criterios de éxito.`,
            en: `Generate the technical draft of the discussed feature. Include business logic and success criteria.`
        }
    },
    {
        id: 'user_story_gen',
        category: 'Product',
        title: 'Generador de User Stories',
        description: 'Transforma ideas vagas en historias de usuario listas para Jira.',
        icon: MessageCircle,
        color: 'text-indigo-600 bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-900/30',
        outline: ['Como [usuario]...', 'Quiero [hacer algo]...', 'Para [conseguir valor]...', 'Reglas'],
        systemPrompt: {
            es: `Crea Historias de Usuario (User Stories) a partir de la conversación. Sigue el formato estándar de agilidad.`,
            en: `Create User Stories from the conversation. Follow standard agility format.`
        }
    },
    {
        id: 'comp_analysis',
        category: 'Product',
        title: 'Análisis Competitivo',
        description: 'Compara tu solución con la competencia según lo discutido en el equipo.',
        icon: PieChart,
        color: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30',
        outline: ['Competidor X', 'Fortalezas Relativas', 'Debilidades / Gaps', 'Oportunidades'],
        systemPrompt: {
            es: `Resume la comparativa con competidores. Dónde ganamos y dónde estamos perdiendo terreno según el equipo.`,
            en: `Summarize the competitor comparison. Where we win and where we are losing ground according to the team.`
        }
    },

    // --- PERIODISMO ---
    {
        id: 'investigative',
        category: 'Periodismo',
        title: 'Investigación Periodística',
        description: 'Extrae pistas, datos duros y posibles fuentes de una entrevista o reunión.',
        icon: Search,
        color: 'text-slate-800 bg-slate-200 dark:text-slate-100 dark:bg-slate-700',
        outline: ['Hecho Central', 'Dato Revelador', 'Fuentes a Contrastar', 'Líneas de Investigación'],
        systemPrompt: {
            es: `Eres un periodista de investigación. Busca el "hook" de la historia y los datos que necesitan verificación.`,
            en: `You are an investigative journalist. Look for the "hook" of the story and data that needs verification.`
        }
    },
    {
        id: 'profile_piece',
        category: 'Periodismo',
        title: 'Perfil de Personaje',
        description: 'Captura la esencia, anécdotas y citas clave para redactar un perfil o semblanza.',
        icon: UserCheck,
        color: 'text-pink-700 bg-pink-100 dark:text-pink-300 dark:bg-pink-900/30',
        outline: ['Personalidad', 'Hitos de Vida', 'Mejores Citas Literal', 'Ambiente'],
        systemPrompt: {
            es: `Extrae lo más humano de la entrevista. Citas literales potentes y anécdotas que definan al personaje.`,
            en: `Extract the most human part of the interview. Powerful literal quotes and anecdotes that define the character.`
        }
    },
    {
        id: 'news_segment',
        category: 'Periodismo',
        title: 'Segmento de Noticiario',
        description: 'Resumen estructurado para locución de radio o televisión (entradilla + cuerpo).',
        icon: Radio,
        color: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30',
        outline: ['Titular Impacto', 'Entradilla', 'Desarrollo Rápido', 'Cierre / Call to Action'],
        systemPrompt: {
            es: `Redacta un guion corto para noticias. Lenguaje directo, frases cortas y ritmo ágil para locutores.`,
            en: `Write a short news script. Direct language, short sentences, and agile rhythm for announcers.`
        }
    },
    {
        id: 'press_conference',
        category: 'Periodismo',
        title: 'Rueda de Prensa',
        description: 'Diferencia entre declaraciones oficiales y respuestas a preguntas de los medios.',
        icon: Mic,
        color: 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30',
        outline: ['Comunicado Oficial', 'Preguntas Incómodas', 'Respuestas Clave', 'Ambiente General'],
        systemPrompt: {
            es: `Sintetiza la rueda de prensa. Qué quería decir el orador y qué acabó diciendo bajo presión.`,
            en: `Synthesize the press conference. What the speaker wanted to say and what they ended up saying under pressure.`
        }
    },
    {
        id: 'field_report',
        category: 'Periodismo',
        title: 'Crónica de Campo',
        description: 'Ideal para grabaciones in-situ: descripciones de ambiente y testimonios rápidos.',
        icon: Activity,
        color: 'text-orange-500 bg-orange-50 dark:text-orange-300 dark:bg-orange-900/10',
        outline: ['Lugar y Momento', 'La voz de la calle', 'Observaciones Visuales', 'Síntesis de Situación'],
        systemPrompt: {
            es: `Genera una crónica. Combina los testimonios recogidos con el contexto del lugar para dar una imagen completa.`,
            en: `Generate a report. Combine the collected testimonies with the location's context to give a complete picture.`
        }
    },
    {
        id: 'editorial_draft',
        category: 'Periodismo',
        title: 'Borrador de Editorial',
        description: 'Análisis de opinión basado en los hechos discutidos o grabados.',
        icon: PenTool,
        color: 'text-indigo-800 bg-indigo-100 dark:text-indigo-200 dark:bg-indigo-900/30',
        outline: ['Tesis Central', 'Argumento 1, 2, 3', 'Contrapuntos', 'Conclusión / Opinión'],
        systemPrompt: {
            es: `Crea un esquema para un artículo de opinión. Define una tesis clara basada en el contenido.`,
            en: `Create an outline for an opinion piece. Define a clear thesis based on the content.`
        }
    },

    // --- RESEARCH ---
    {
        id: 'data_analysis_sync',
        category: 'Research',
        title: 'Sincronización de Datos',
        description: 'Resumen de hallazgos cuantitativos y cualitativos tras analizar datos en equipo.',
        icon: PieChart,
        color: 'text-sky-600 bg-sky-100 dark:text-sky-400 dark:bg-sky-900/30',
        outline: ['Variables Detectadas', 'Correlaciones Sugeridas', 'Anomalías en Datos', 'Siguiente Paso Analítico'],
        systemPrompt: {
            es: `Sintetiza la discusión sobre datos. Qué números preocupan y qué patrones parece detectar el equipo.`,
            en: `Synthesize the data discussion. Which numbers are concerning and what patterns the team seems to detect.`
        }
    },
    {
        id: 'methodology_draft',
        category: 'Research',
        title: 'Diseño Metodológico',
        description: 'Define cómo se llevará a cabo la investigación (población, herramientas, sesgos).',
        icon: Search,
        color: 'text-violet-600 bg-violet-100 dark:text-violet-400 dark:bg-violet-900/30',
        outline: ['Enfoque (Cuan/Cual)', 'Población y Muestra', 'Instrumentos', 'Manejo de Sesgos'],
        systemPrompt: {
            es: `Estructura la metodología de investigación discutida. Asegura que el proceso sea reproducible y sólido.`,
            en: `Structure the discussed research methodology. Ensure the process is reproducible and solid.`
        }
    },
    {
        id: 'hypothesis_test',
        category: 'Research',
        title: 'Validación de Hipótesis',
        description: 'Enfrenta las ideas iniciales contra los hallazgos reales de la investigación.',
        icon: Lightbulb,
        color: 'text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30',
        outline: ['Hipótesis Original', 'Evidencia a Favor', 'Evidencia en Contra', '¿Se valida o refuta?'],
        systemPrompt: {
            es: `Evalúa las hipótesis iniciales. Basándote en el contenido, ¿se sostienen o hay que cambiarlas?`,
            en: `Evaluate initial hypotheses. Based on the content, do they hold or do they need to be changed?`
        }
    },
    {
        id: 'lit_review_notes',
        category: 'Research',
        title: 'Revisión de Literatura',
        description: 'Resumen de lo que dicen otros autores sobre el tema discutido.',
        icon: BookOpen,
        color: 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30',
        outline: ['Autores Mencionados', 'Consensos Científicos', 'Controversias', 'Huecos (Research Gaps)'],
        systemPrompt: {
            es: `Extrae referencias a literatura externa. Qué se sabe ya y qué falta por investigar según la sesión.`,
            en: `Extract references to external literature. What is already known and what remains to be researched according to the session.`
        }
    },
    {
        id: 'participant_interview',
        category: 'Research',
        title: 'Entrevista de Usuario (Research)',
        description: 'Captura insights de entrevistas a participantes de estudios de mercado o académicos.',
        icon: Users,
        color: 'text-indigo-600 bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-900/30',
        outline: ['Perfil Participante', 'Respuestas Críticas', 'Comportamiento Observado', 'Nuevas Hipótesis'],
        systemPrompt: {
            es: `Analiza la entrevista desde un punto de vista de investigación. Evita sesgos y resalta descubrimientos inesperados.`,
            en: `Analyze the interview from a research perspective. Avoid bias and highlight unexpected discoveries.`
        }
    },
    {
        id: 'abstract_gen',
        category: 'Research',
        title: 'Generador de Abstract',
        description: 'Crea un resumen académico (Abstract) listo para publicación o congreso.',
        icon: FileText,
        color: 'text-slate-700 bg-slate-100 dark:text-slate-300 dark:bg-slate-800',
        outline: ['Contexto', 'Metodología', 'Resultados', 'Conclusión'],
        systemPrompt: {
            es: `Genera un abstract de máximo 250 palabras. Tono académico riguroso y conciso.`,
            en: `Generate an abstract of maximum 250 words. Rigorous and concise academic tone.`
        }
    },

    // --- CONSULTING ---
    {
        id: 'client_discovery',
        category: 'Consulting',
        title: 'Client Discovery',
        description: 'Primera reunión con el cliente para entender su negocio y necesidades.',
        icon: Search,
        color: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30',
        outline: ['Visión de Negocio', 'Problemas Críticos', 'Stakeholders', 'Objetivos de Proyecto'],
        systemPrompt: {
            es: `Resume la reunión de descubrimiento. Qué quiere el cliente y qué necesita realmente el negocio.`,
            en: `Summarize the discovery meeting. What the client wants and what the business really needs.`
        }
    },
    {
        id: 'swot_analysis',
        category: 'Consulting',
        title: 'Análisis DAFO / SWOT',
        description: 'Debilidades, Amenazas, Fortalezas y Oportunidades según la grabación.',
        icon: PieChart,
        color: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30',
        outline: ['Fortalezas', 'Oportunidades', 'Debilidades', 'Amenazas'],
        systemPrompt: {
            es: `Extrae los elementos para un DAFO. Clasifica la información en fortalezas, debilidades, oportunidades y amenazas.`,
            en: `Extract elements for a SWOT analysis. Classify info into strengths, weaknesses, opportunities, and threats.`
        }
    },
    {
        id: 'growth_strategy',
        category: 'Consulting',
        title: 'Estrategia de Crecimiento',
        description: 'Hojas de ruta para escalar negocios: canales, métricas y tácticas.',
        icon: TrendingUp,
        color: 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30',
        outline: ['Canales de Ventas', 'Escalabilidad Operativa', 'Métricas Norte (North Star)', 'Palancas de Cambio'],
        systemPrompt: {
            es: `Sintetiza la estrategia de crecimiento. Cuáles son las palancas que harán que el negocio escale.`,
            en: `Synthesize the growth strategy. What are the levers that will make the business scale.`
        }
    },
    {
        id: 'op_audit',
        category: 'Consulting',
        title: 'Auditoría Operativa',
        description: 'Detecta ineficiencias en procesos y cuellos de botella.',
        icon: Clock,
        color: 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30',
        outline: ['Procesos Analizados', 'Cuellos de Botella', 'Desperdicios (Waste)', 'Recomendaciones'],
        systemPrompt: {
            es: `Como consultor experto, encuentra dónde se está perdiendo tiempo o dinero en el proceso descrito.`,
            en: `As an expert consultant, find where time or money is being lost in the described process.`
        }
    },
    {
        id: 'digital_trans',
        category: 'Consulting',
        title: 'Transformación Digital',
        description: 'Migración tecnológica y digitalización de flujos de trabajo.',
        icon: Sparkles,
        color: 'text-violet-600 bg-violet-100 dark:text-violet-400 dark:bg-violet-900/30',
        outline: ['Estado Tecnológico Actual', 'Arquitectura Objetivo', 'Barreras Culturales', 'Fases de Migración'],
        systemPrompt: {
            es: `Resume el plan de transformación. Qué tecnologías se adoptarán y cómo se gestionará el cambio.`,
            en: `Summarize the transformation plan. What technologies will be adopted and how change will be managed.`
        }
    },
    {
        id: 'post_impl',
        category: 'Consulting',
        title: 'Cierre de Implantación',
        description: 'Revisión final tras ejecutar un proyecto: resultados vs expectativas.',
        icon: ListChecks,
        color: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
        outline: ['Objetivos Cumplidos', 'Lecciones Aprendidas', 'Pendientes (Handover)', 'Satisfacción Cliente'],
        systemPrompt: {
            es: `Resume el éxito del proyecto. Compara lo prometido con lo entregado y anota los aprendizajes.`,
            en: `Summarize the project's success. Compare what was promised with what was delivered and note learnings.`
        }
    },

    // --- PERSONAL ---
    {
        id: 'daily_journal',
        category: 'Personal',
        title: 'Diario Personal',
        description: 'Reflexiones del día, estado de ánimo y gratitud.',
        icon: PenTool,
        color: 'text-rose-600 bg-rose-100 dark:text-rose-400 dark:bg-rose-900/30',
        outline: ['Qué pasó hoy', 'Sentimientos', 'Lección del día', 'Gratitud'],
        systemPrompt: {
            es: `Organiza mis pensamientos del día. Ayúdame a reflexionar sobre lo que he vivido de forma pausada.`,
            en: `Organize my thoughts of the day. Help me reflect on what I've experienced in a calm way.`
        }
    },
    {
        id: 'goal_setting_pers',
        category: 'Personal',
        title: 'Plan de Objetivos',
        description: 'Define tus sueños y los pasos pequeños para lograrlos.',
        icon: Target,
        color: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30',
        outline: ['Meta Grande', 'Miedos/Obstáculos', 'Primeros 3 Pasos', 'Por qué es importante'],
        systemPrompt: {
            es: `Ayúdame a estructurar mis objetivos personales. Convierte un sueño en un plan accionable.`,
            en: `Help me structure my personal goals. Turn a dream into an actionable plan.`
        }
    },
    {
        id: 'travel_log',
        category: 'Personal',
        title: 'Diario de Viaje',
        description: 'Lugares visitados, comidas memorables y anécdotas de ruta.',
        icon: Search,
        color: 'text-teal-600 bg-teal-100 dark:text-teal-400 dark:bg-teal-900/30',
        outline: ['Localización', 'Lo mejor de hoy', 'Gastronomía', 'Curiosidades'],
        systemPrompt: {
            es: `Sintetiza mi jornada de viaje. Resalta los descubrimientos y la atmósfera de los lugares visitados.`,
            en: `Synthesize my travel day. Highlight discoveries and the atmosphere of the places visited.`
        }
    },
    {
        id: 'life_wisdom',
        category: 'Personal',
        title: 'Sabiduría y Reflexión',
        description: 'Para grabaciones sobre filosofía de vida, consejos o notas para el futuro.',
        icon: Lightbulb,
        color: 'text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30',
        outline: ['Mensaje Central', 'Contexto Vital', 'Consejos Prácticos', 'Para mis nietos'],
        systemPrompt: {
            es: `Preserva estas reflexiones. Extrae la esencia de la sabiduría compartida en esta nota.`,
            en: `Preserve these reflections. Extract the essence of the wisdom shared in this note.`
        }
    },
    {
        id: 'recipe_note',
        category: 'Personal',
        title: 'Anotación de Receta',
        description: 'Captura instrucciones de cocina, trucos y cantidades sobre la marcha.',
        icon: ClipboardList,
        color: 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30',
        outline: ['Plato', 'Ingredientes Clave', 'Pasos Críticos', 'El Truco del Chef'],
        systemPrompt: {
            es: `Organiza esta receta grabada. Asegura que los pasos y las cantidades queden claros y ordenados.`,
            en: `Organize this recorded recipe. Ensure steps and quantities are clear and orderly.`
        }
    },
    {
        id: 'hobby_project',
        category: 'Personal',
        title: 'Hobby & Proyectos',
        description: 'Planificación de tus proyectos paralelos, manualidades o tecnología.',
        icon: Activity,
        color: 'text-indigo-600 bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-900/30',
        outline: ['Idea Principal', 'Materiales Necesarios', 'Boceto de Pasos', 'Resultado Esperado'],
        systemPrompt: {
            es: `Estructura mi proyecto personal. Haz un inventario de lo que necesito y un plan de ataque para empezar.`,
            en: `Structure my personal project. Inventory what I need and make a plan of attack to start.`
        }
    },

    // --- SPEECH ---
    {
        id: 'keynote_struct',
        category: 'Speech',
        title: 'Estructura de Keynote',
        description: 'Transforma una charla o discurso en un esquema de presentación profesional.',
        icon: Presentation,
        color: 'text-blue-700 bg-blue-100 dark:text-blue-200 dark:bg-blue-900/30',
        outline: ['Gancho (Hook)', 'Tesis Principal', '3 Pilares Argumentales', 'Call to Action'],
        systemPrompt: {
            es: `Organiza este discurso. Asegura que haya un hilo conductor fuerte y un cierre que inspire a la audiencia.`,
            en: `Organize this speech. Ensure there is a strong common thread and a closing that inspires the audience.`
        }
    },
    {
        id: 'podcast_interview',
        category: 'Speech',
        title: 'Resumen de Podcast',
        description: 'Extrae clips virales, marcas de tiempo y conclusiones de una entrevista.',
        icon: Mic,
        color: 'text-violet-600 bg-violet-100 dark:text-violet-400 dark:bg-violet-900/30',
        outline: ['Temas Tratados', 'Mejores Momentos (Quotes)', 'Conclusiones Podcast', 'Timeline Sugerido'],
        systemPrompt: {
            es: `Analiza el podcast. Busca frases con potencial viral y resume la charla para las notas del programa.`,
            en: `Analyze the podcast. Look for viral potential quotes and summarize the chat for program notes.`
        }
    },
    {
        id: 'public_speaking_eval',
        category: 'Speech',
        title: 'Evaluación de Oratoria',
        description: 'Analiza el ritmo, claridad y muletillas de quien habla.',
        icon: Activity,
        color: 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30',
        outline: ['Ritmo y Pausas', 'Riqueza de Lenguaje', 'Muletillas Detectadas', 'Puntos a Mejorar'],
        systemPrompt: {
            es: `Como coach de oratoria, analiza esta grabación. Da feedback constructivo sobre cómo mejorar la entrega.`,
            en: `As a public speaking coach, analyze this recording. Give constructive feedback on how to improve delivery.`
        }
    },
    {
        id: 'toastmasters',
        category: 'Speech',
        title: 'Evaluación Toastmasters',
        description: 'Sigue el formato clásico de evaluación de discursos de la asociación.',
        icon: StarIcon,
        color: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30',
        outline: ['Resumen Discurso', 'Excelencia en...', 'Oportunidades en...', 'Reto para el futuro'],
        systemPrompt: {
            es: `Evalúa el discurso al estilo Toastmasters. Enfócate en qué se hizo bien y qué se puede mejorar para el siguiente.`,
            en: `Evaluate the speech Toastmasters style. Focus on what was done well and what can be improved for the next one.`
        }
    },
    {
        id: 'tribute_eulogy',
        category: 'Speech',
        title: 'Homenaje / Tributo',
        description: 'Ayuda a redactar discursos emotivos y conmemorativos.',
        icon: HeartIcon,
        color: 'text-pink-600 bg-pink-100 dark:text-pink-400 dark:bg-pink-900/30',
        outline: ['Relación con Persona', 'Virtudes a Destacar', 'Anécdotas Emotivas', 'Cierre Respetuoso'],
        systemPrompt: {
            es: `Ayuda a crear un texto emotivo y respetuoso. Resalta la luz y el legado de la persona homenajeada.`,
            en: `Help create an emotional and respectful text. Highlight the light and legacy of the honored person.`
        }
    },
    {
        id: 'campaign_speech',
        category: 'Speech',
        title: 'Discurso de Campaña',
        description: 'Enfocado en movilización, promesas y visión de equipo/comunidad.',
        icon: Target,
        color: 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30',
        outline: ['Problema Actual', 'Nuestra Visión', 'Promesas de Acción', 'Llamada al Voto/Apoyo'],
        systemPrompt: {
            es: `Sintetiza la proclama de campaña. Enfócate en la conexión emocional con el votante y las soluciones propuestas.`,
            en: `Synthesize the campaign proclamation. Focus on the emotional connection with the voter and the proposed solutions.`
        }
    },

    // --- CALL ---
    {
        id: 'sales_discovery',
        category: 'Call',
        title: 'Sales Discovery Call',
        description: 'Llamada inicial de ventas para cualificar la oportunidad.',
        icon: Search,
        color: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30',
        outline: ['Pain Points', 'Situación Actual', 'Situación Deseada', 'Siguientes Pasos'],
        systemPrompt: {
            es: `Resume la sesión de descubrimiento de ventas. ¿Por qué nos necesitan y por qué ahora?`,
            en: `Summarize the sales discovery session. Why do they need us and why now?`
        }
    },
    {
        id: 'support_ticket',
        category: 'Call',
        title: 'Ticket de Soporte',
        description: 'Transforma una llamada de soporte en un ticket estructurado para el equipo técnico.',
        icon: ClipboardList,
        color: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30',
        outline: ['Descripción Problema', 'Pasos para Reproducir', 'Gravedad', 'Usuario Afectado'],
        systemPrompt: {
            es: `Crea un informe técnico de error. Resume lo que le pasa al usuario y qué ha intentado ya.`,
            en: `Create a technical error report. Summarize what is happening to the user and what they have already tried.`
        }
    },
    {
        id: 'follow_up_call',
        category: 'Call',
        title: 'Llamada de Seguimiento',
        description: 'Mantiene vivo el interés y resuelve dudas tras una propuesta.',
        icon: Clock,
        color: 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30',
        outline: ['Estado de la Propuesta', 'Objeciones Pendientes', 'Nuevas Dudas', 'Fecha de Decisión'],
        systemPrompt: {
            es: `Sintetiza la llamada de seguimiento. ¿Qué les frena para decidir y cómo podemos ayudarlos?`,
            en: `Synthesize the follow-up call. What is stopping them from deciding and how can we help?`
        }
    },
    {
        id: 'negotiation_call',
        category: 'Call',
        title: 'Llamada de Negociación',
        description: 'Cierre de condiciones, precios y plazos finales.',
        icon: Shield,
        color: 'text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30',
        outline: ['Puntos de Acuerdo', 'Puntos en Disputa', 'Concesiones Hechas', 'Acuerdo Final'],
        systemPrompt: {
            es: `Analiza la negociación. Define claramente qué se ha cedido y qué se ha ganado por ambas partes.`,
            en: `Analyze the negotiation. Clearly define what has been conceded and what has been gained by both parties.`
        }
    },
    {
        id: 'cold_call_analysis',
        category: 'Call',
        title: 'Análisis de Puerta Fría',
        description: 'Feedback sobre la apertura, manejo de objeciones y cierre de una llamada fría.',
        icon: Activity,
        color: 'text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-800',
        outline: ['El Gancho (Hook)', 'Manejo de "No"', 'Interés Generado', 'Puntuación IA'],
        systemPrompt: {
            es: `Evalúa la llamada fría. ¿Fue efectivo el inicio? ¿Cómo se trataron las objeciones?`,
            en: `Evaluate the cold call. Was the opening effective? How were the objections handled?`
        }
    },
    {
        id: 'customer_feedback_call',
        category: 'Call',
        title: 'Llamada de Feedback',
        description: 'Entrevista post-venta o tras uso del servicio para medir satisfacción.',
        icon: MessageCircle,
        color: 'text-teal-600 bg-teal-100 dark:text-teal-400 dark:bg-teal-900/30',
        outline: ['Nivel Satisfacción 1-10', 'Lo mejor del servicio', 'Lo peor del servicio', 'NPS Sugerido'],
        systemPrompt: {
            es: `Sintetiza la satisfacción del cliente. Qué les encanta y qué les hace querer irse a la competencia.`,
            en: `Synthesize customer satisfaction. What they love and what makes them want to go to a competitor.`
        }
    }
];
