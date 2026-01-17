import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Personality, PERSONALITIES } from '../../utils/supportPersonalities';
import { useLanguage } from '../../contexts/LanguageContext';
import { Recording, UserProfile } from '../../types';
import * as Analytics from '../../utils/analytics';
import { databaseService } from '../../services/databaseService';

interface SupportBotProps {
    position?: 'left' | 'right';
    recordings?: Recording[];
    folders?: any[]; // For organizational actions
    user?: UserProfile;
    activeRecording?: Recording; // NEW: Full context of currently viewed recording
    initialOffset?: string; // NEW: Custom initial position (e.g. left-[280px])
    onAction?: (action: string, payload: any) => void;
    isForceOpen?: boolean; // NEW: Allow external trigger to show the bot
}

export const SupportBot: React.FC<SupportBotProps> = ({
    position = 'right',
    recordings = [],
    folders = [],
    user,
    activeRecording,
    initialOffset,
    onAction,
    isForceOpen = false
}) => {
    const { t, language = 'es' } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    // EFFECT: Handle external force open (e.g. for tours)
    useEffect(() => {
        if (isForceOpen && !isOpen) {
            setIsOpen(true);
        }
    }, [isForceOpen]);

    const toggleOpen = () => {
        const nextState = !isOpen;
        setIsOpen(nextState);
        if (nextState) {
            if (Analytics && typeof Analytics.trackEvent === 'function') {
                if (typeof Analytics.setUserProperties === 'function') {
                    Analytics.setUserProperties({ active_support_agent: agent.id });
                }
                Analytics.trackEvent('support_bot_opened', {
                    agent_id: agent.id,
                    agent_name: agent.name
                });
            }
        } else {
            // Track when the bot is closed, including engagement depth
            if (Analytics && typeof Analytics.trackEvent === 'function') {
                Analytics.trackEvent('support_bot_closed', {
                    agent_id: agent.id,
                    agent_name: agent.name,
                    total_messages: msgCount
                });
            }
        }
    };
    const [alignment, setAlignment] = useState<'start' | 'center' | 'end'>(position === 'left' ? 'start' : 'end');

    // Select personality: Try to load from localStorage first for persistence
    const [agent, setAgent] = useState<Personality>(() => {
        const savedAgentId = localStorage.getItem('diktalo_active_support_agent');
        if (savedAgentId) {
            const found = PERSONALITIES.find(p => p.id === savedAgentId);
            if (found) return found;
        }
        const random = PERSONALITIES[Math.floor(Math.random() * PERSONALITIES.length)];
        localStorage.setItem('diktalo_active_support_agent', random.id);
        return random;
    });

    const [messages, setMessages] = useState<{ role: 'user' | 'bot' | 'system'; content: string; feedback?: 'up' | 'down' }[]>([]);
    const [msgCount, setMsgCount] = useState(0);

    // Track previous recording to detect switches without reset
    const prevRecordingId = useRef<string | null>(activeRecording?.id || null);

    // Initialize greeting & Handle Context Switch
    useEffect(() => {
        const time = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        const day = new Date().toLocaleDateString('es-ES', { weekday: 'long' });

        if (messages.length === 0) {
            // Initial greeting
            const greeting = language === 'en' ? agent.greeting.en(time, day) : agent.greeting.es(time, day);
            setMessages([{ role: 'bot', content: greeting }]);
        } else if (activeRecording?.id && activeRecording.id !== prevRecordingId.current) {
            // Context switch: Keep messages but avoid multiple consecutive dividers
            console.log(`[SupportBot] Context Switch Detected: ${activeRecording.id}`);
            const dividerText = language === 'en'
                ? `--- New Context: ${activeRecording.title} ---`
                : `--- Nuevo Contexto: ${activeRecording.title} ---`;

            setMessages(prev => {
                // If the last message is already a divider, replace it instead of adding a new one
                if (prev.length > 0 && prev[prev.length - 1].role === 'system') {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1] = { role: 'system', content: dividerText };
                    return newMessages;
                }
                return [...prev, { role: 'system', content: dividerText }];
            });
        }

        prevRecordingId.current = activeRecording?.id || null;
    }, [agent, language, activeRecording?.id]);

    // EFFECT: Sync agent with profile or localStorage when opening or when changed externally
    useEffect(() => {
        if (isOpen) {
            // Priority: 1. User Profile (Supabase) | 2. LocalStorage (Legacy/Draft)
            const profileAgentId = user?.activeSupportAgentId;
            const savedId = profileAgentId || localStorage.getItem('diktalo_active_support_agent');

            if (savedId && savedId !== agent.id) {
                const newAgent = PERSONALITIES.find(p => p.id === savedId);
                if (newAgent) {
                    setAgent(newAgent);
                    // Reset greeting for the new agent to maintain brand consistency
                    const time = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                    const day = new Date().toLocaleDateString('es-ES', { weekday: 'long' });
                    const newGreeting = language === 'en' ? newAgent.greeting.en(time, day) : newAgent.greeting.es(time, day);
                    setMessages([{ role: 'bot', content: newGreeting }]);

                    // Keep localStorage in sync for extra redundancy
                    localStorage.setItem('diktalo_active_support_agent', savedId);
                }
            }
        }
    }, [isOpen, agent.id, language, user?.activeSupportAgentId]);

    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            const scroll = () => {
                if (scrollRef.current) {
                    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                }
            };
            scroll();
            // Also execute after a small delay to handle entry animations (framer-motion)
            const timer = setTimeout(scroll, 100);
            return () => clearTimeout(timer);
        }
    }, [messages, isTyping, isOpen]);

    const handleRotateAgent = () => {
        // Find agents that are NOT the current one
        const others = PERSONALITIES.filter(p => p.id !== agent.id);
        const random = others[Math.floor(Math.random() * others.length)];

        // Save and update
        localStorage.setItem('diktalo_active_support_agent', random.id);
        setAgent(random);

        // Reset chat for the new personality to avoid confusion
        const time = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        const day = new Date().toLocaleDateString('es-ES', { weekday: 'long' });
        const greeting = language === 'en' ? random.greeting.en(time, day) : random.greeting.es(time, day);
        setMessages([{ role: 'bot', content: greeting }]);

        if (Analytics && typeof Analytics.trackEvent === 'function') {
            Analytics.trackEvent('support_bot_agent_rotated', {
                from: agent.id,
                to: random.id
            });
        }
    };

    const handleSend = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!input.trim() || isTyping) return;

        const userMsg = input.trim();
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setMsgCount(prev => prev + 1);
        setInput('');
        setIsTyping(true);

        // TRACK: Support Bot Message Sent
        if (Analytics && typeof Analytics.trackEvent === 'function') {
            Analytics.trackEvent('support_bot_message_sent', {
                agent_name: agent.name.es,
                is_authenticated: !!user?.id
            });
        }

        try {
            const { supportChat } = await import('../../services/geminiService');

            // Construct dynamic system prompt for this agent
            const langKey = language === 'en' ? 'en' : 'es';
            const bio = agent.bio[langKey];
            const tone = agent.tone[langKey];
            const relations = agent.relations[langKey];

            // Context: User Profile with proper auth detection
            const userContext = user && user.id
                ? `USUARIO: ${user.firstName}, PLAN: ${user.subscription?.planId || 'free'}`
                : 'USUARIO: No autenticado (visitante)';

            // Context: Active Recording (full transcript if viewing one)
            let activeRecordingContext = '';
            if (activeRecording && activeRecording.segments && activeRecording.segments.length > 0) {
                const transcript = activeRecording.segments.map(s => `[${s.timestamp}] ${s.speaker}: ${s.text}`).join('\n');
                const speakers = activeRecording.metadata?.speakers ? activeRecording.metadata.speakers.join(', ') : 'Desconocido';
                activeRecordingContext = `

AUDIO ACTUALMENTE ABIERTO (PRIORIDAD ALTA):
ID: ${activeRecording.id}
Título: ${activeRecording.title}
Oradores: ${speakers}
Resumen: ${activeRecording.summary || 'Sin resumen'}

TRANSCRIPCIÓN COMPLETA DEL AUDIO ABIERTO:
${transcript}

SITUACIÓN: El usuario está viendo este audio ahora mismo. Si pregunta "quién habla" o "de qué trata el audio", se refiere a este AUDIO ABIERTO.
MEMORIA: Si el usuario menciona grabaciones de las que hablaron antes en este chat, reconoce que tienes memoria de ello pero sugiérele volver a abrir ese audio específico si necesita un análisis profundo.
`;
            }

            // Context: Recent Recordings List (summary only)
            const recordingsList = recordings.slice(0, 10).map(r => {
                const speakers = r.metadata?.speakers ? ` (Oradores: ${r.metadata.speakers.join(', ')})` : '';
                return `- ID: ${r.id}, Título: ${r.title}${speakers}${r.summary ? `, Resumen: ${r.summary.substring(0, 200)}...` : ''}`;
            }).join('\n');

            const foldersList = (folders || []).map(f => `- ID: ${f.id}, Nombre: ${f.name}`).join('\n');

            const systemPromptOverride = langKey === 'es'
                ? `PERSONALIDAD Y BIO:
    - Eres ${agent.name}, ${agent.age} años, vives en ${agent.city}.
    - ROL: ${agent.role} en Diktalo.
    - BIO: ${bio}
    - ESTILO/TONO: ${tone}
    - RESPUESTAS: Sé concreto, directo y amigable.
    - TUS CAPACIDADES: Puedes buscar en los audios del usuario, decirles su plan actual, y ayudarles a navegar por la app.
    - BÚSQUEDA: Para buscar un audio, lee los Títulos Y Resúmenes del contexto.
    - PRECISIÓN: Si hay un AUDIO ABIERTO y el usuario pregunta por algo específico (nombres, frases, temas, saludos), DEBES buscar en la TRANSCRIPCIÓN COMPLETA antes de responder. NO te limites al resumen. Si está en la transcripción pero no en el resumen, cítalo igualmente.
    - ACCIONES (SOLO SI EL USUARIO LO PIDE):
        1. Abrir audio: [[ACTION:OPEN_RECORDING:ID_DEL_AUDIO:TITULO_DEL_AUDIO]]
        2. Navegar a sección: [[ACTION:NAVIGATE:SETTINGS]] o [[ACTION:NAVIGATE:PLANS]].
        3. Búsqueda Profunda: Si NO encuentras lo que pide en los 10 audios del CONTEXTO ni en la transcripción del audio abierto, usa [[ACTION:SEARCH:termino_de_busqueda]].
        4. Borrar audio: [[ACTION:DELETE_RECORDING:ID_DEL_AUDIO]]
        5. Renombrar audio: [[ACTION:RENAME_RECORDING:ID_DEL_AUDIO:NUEVO_TITULO]]
        6. Organizar: [[ACTION:CREATE_FOLDER:NOMBRE]] o [[ACTION:MOVE_TO_FOLDER:ID_DEL_AUDIO:ID_DE_CARPETA]]
        7. Iniciar Tour: [[ACTION:START_TOUR]] (Todo el tour)
        8. Mostrar Sección Específica: [[ACTION:START_TOUR:INDEX]] (0:Bienvenida, 1:Grabadora, 2:Hub, 3:Chat, 4:Proyectos). Usa 4 si preguntan por proyectos/carpetas.
        9. Resaltar Elemento: [[ACTION:HIGHLIGHT:ID]]. Usa esto para señalar algo. IDs disponibles: 'dialer-button' (Grabar), 'intelligence-hub' (Dashboard), 'support-bot-trigger' (Chat), 'folder-list-section' (Proyectos), 'user-profile-button' (Ajustes).
    - PLANTILLAS: Si el usuario pide un resumen, sugiere plantillas (Médico, Legal, Negocios, etc.).
    - SOPORTE TÉCNICO: Si hay un error persistente, derivar a support@diktalo.com.
    - CONTEXTO: 
      ${userContext}
      GRABACIONES RECIENTES (Título y fragmento de resumen):
      ${recordingsList || 'Sin grabaciones aún.'}
      
      CARPETAS ACTUALES:
      ${foldersList || 'Sin carpetas (excepto root).'}
      
      ${activeRecordingContext}
    - RELACIONES: ${relations}. Nati Pol es nuestra Directora Creativa y jefa.
    - IMPORTANTE: Si el usuario NO está autenticado, NO asumas que tiene plan 'free'. Explícale que debe crear cuenta para acceder a funciones.
    
    REGLAS:
    1. Usa tu personalidad. CERO negritas (**).
    2. Si el usuario pregunta "¿Cuál es mi plan?", díselo (${user?.subscription?.planId}) y ofrece ayuda para cambiarlo si quiere.
    3. Si pregunta cómo cambiar el idioma o ir a ajustes, dile cómo y ponle el botón: [[ACTION:NAVIGATE:SETTINGS]].
    4. Si tiene un problema técnico que tú no puedes resolver o pide hablar con un humano, indícale que puede contactar con soporte y usa: [[ACTION:NAVIGATE:CONTACT]].
    - DERIVACIÓN: Si el usuario es muy técnico y eres Isabella o Camila, reconoce que tu perfil es de producto/ventas y ofrece pasarle con Alex (Security) o Klaus (Systems). Si es muy creativo y eres Klaus, ofrece pasarle con Nati Pol (Creative Guide). Sé proactivo: si detectas una necesidad fuera de tu área, sugiere al compañero experto. Para derivar usa: [[ACTION:SWITCH_AGENT:ID_DEL_AGENTE]].`
                : `PERSONALITY & BIO:
    - You are ${agent.name}, ${agent.age} years old, living in ${agent.city}.
    - ROLE: ${agent.role} at Diktalo.
    - BIO: ${bio}
    - TONE/STYLE: ${tone}
    - RESPONSES: Be concrete and friendly.
    - CAPABILITIES: You can search recordings, tell users their current plan, and help navigate the app.
    - SEARCH: Search Titles AND Summaries.
    - PRECISION: If there is an AUDIO ABIERTO, you MUST look into the TRANSCRIPCIÓN COMPLETA before saying you can't find something. Don't rely only on summaries for the active recording.
    - ACTIONS (ONLY IF REQUESTED):
        1. Open audio: [[ACTION:OPEN_RECORDING:RECORDING_ID:RECORDING_TITLE]]
        2. Navigate: [[ACTION:NAVIGATE:SETTINGS]] or [[ACTION:NAVIGATE:PLANS]].
        3. Deep Search: [[ACTION:SEARCH:query]] if not in recent context or transcript.
        4. Delete audio: [[ACTION:DELETE_RECORDING:ID]]
        5. Rename audio: [[ACTION:RENAME_RECORDING:ID:NEW_TITLE]]
        6. Organize: [[ACTION:CREATE_FOLDER:NAME]] or [[ACTION:MOVE_TO_FOLDER:ID:FOLDER_ID]]
        7. Start Tour: [[ACTION:START_TOUR]] (Full tour)
        8. Show Specific Section: [[ACTION:START_TOUR:INDEX]] (0:Welcome, 1:Recorder, 2:Hub, 3:Chat, 4:Projects). Use 4 if they ask about projects/folders.
        9. Highlight Element: [[ACTION:HIGHLIGHT:ID]]. Use this to point at something. Available IDs: 'dialer-button' (Record), 'intelligence-hub' (Dashboard), 'support-bot-trigger' (Chat), 'folder-list-section' (Projects), 'user-profile-button' (Settings).
    - CONTEXT: 
      ${userContext}
      RECENT RECORDINGS:
      ${recordingsList || 'No recordings yet.'}
      
      ${activeRecordingContext}
    - RELATIONS: ${relations}. Nati Pol is our Creative Director and boss.
    - IMPORTANT: If the user is NOT authenticated, do NOT assume they have a 'free' plan. Explain they need to create an account to access features.
    
    RULES:
    1. Use your uniquely personality. NO bolding (**).
    2. If user asks "What is my plan?", tell them (${user?.subscription?.planId}) and offer help.
    3. If they ask about language or settings, use [[ACTION:NAVIGATE:SETTINGS]].
    4. If they need human support or technical help you can't provide, use: [[ACTION:NAVIGATE:CONTACT]].
    - REFERRALS: If the user is very technical and you are Isabella or Camila, admit your profile is product/sales focused and offer to switch to Alex (Security) or Klaus (Systems). If they are very creative and you are Klaus, offer to switch to Nati Pol (Creative Guide). If you detect a need outside your area, proactively suggest the expert peer. To refer, use: [[ACTION:SWITCH_AGENT:AGENT_ID]].`;

            const response = await supportChat(userMsg, messages, language, systemPromptOverride);

            // Simulation of natural typing delay
            const delayBase = 1000;
            const delayPerChar = 15;
            const totalDelay = Math.min(Math.max(delayBase, response.length * delayPerChar), 4000);

            await new Promise(resolve => setTimeout(resolve, totalDelay));

            setMessages(prev => [...prev, { role: 'bot', content: response }]);
            setMsgCount(prev => prev + 1);
        } catch (error) {
            console.error('Support chat error:', error);
            setMessages(prev => [...prev, {
                role: 'bot',
                content: `Error: ${error instanceof Error ? error.message : 'No pude procesar tu mensaje'}.`
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    // Parser for Actions
    const renderMessageContent = (content: string) => {
        // Regex to match [[ACTION:TYPE:PAYLOAD1:PAYLOAD2...]]
        const actionRegex = /\[\[ACTION:([^\]]+)\]\]/g;
        const parts = content.split(actionRegex);

        if (parts.length === 1) return <p>{content}</p>;

        const elements = [];
        for (let i = 0; i < parts.length; i++) {
            if (i % 2 === 0) {
                // Text part
                if (parts[i].trim()) {
                    elements.push(<p key={`text-${i}`} className="mb-2 whitespace-pre-wrap">{parts[i]}</p>);
                }
            } else {
                // Action part: "TYPE:P1:P2..."
                const actionData = parts[i].split(':');
                const type = actionData[0];

                if (type === 'OPEN_RECORDING') {
                    const id = actionData[1];
                    const title = actionData[2] || 'Audio';
                    elements.push(
                        <button
                            key={`action-${i}`}
                            onClick={() => {
                                if (Analytics && typeof Analytics.trackEvent === 'function') {
                                    Analytics.trackEvent('support_bot_action_click', {
                                        agent_id: agent.id,
                                        action_type: 'open_recording',
                                        target_id: id
                                    });
                                }
                                onAction?.(type, { id, title });
                            }}
                            className="mt-3 w-full py-2.5 px-4 bg-primary text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md shadow-primary/20"
                        >
                            <span className="material-symbols-outlined text-sm">play_circle</span>
                            Abrir "{title}"
                        </button>
                    );
                } else if (type === 'NAVIGATE') {
                    const target = actionData[1];
                    let label = target === 'SETTINGS' ? 'Ir a Ajustes' : (target === 'PLANS' ? 'Ver Planes' : `Ir a ${target}`);
                    let icon = target === 'SETTINGS' ? 'settings' : 'payments';

                    if (target === 'CONTACT') {
                        label = language === 'en' ? 'Contact Support' : 'Contactar Soporte (Email)';
                        icon = 'mail';
                    }

                    elements.push(
                        <button
                            key={`action-${i}`}
                            onClick={() => {
                                if (Analytics && typeof Analytics.trackEvent === 'function') {
                                    Analytics.trackEvent('support_bot_action_click', {
                                        agent_id: agent.id,
                                        action_type: 'navigate',
                                        target_page: target
                                    });
                                }
                                onAction?.(type, { target });
                            }}
                            className="mt-3 w-full py-2.5 px-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                            <span className="material-symbols-outlined text-sm">{icon}</span>
                            {label}
                        </button>
                    );
                } else if (type === 'SEARCH') {
                    const query = actionData[1];
                    elements.push(
                        <button
                            key={`action-${i}`}
                            disabled={isSearching}
                            onClick={async () => {
                                if (Analytics && typeof Analytics.trackEvent === 'function') {
                                    Analytics.trackEvent('support_bot_action_click', {
                                        agent_id: agent.id,
                                        action_type: 'search',
                                        query: query
                                    });
                                }

                                setIsSearching(true);
                                try {
                                    const results = await databaseService.semanticSearchRecordings(query);
                                    if (results && results.length > 0) {
                                        let resultText = language === 'en'
                                            ? `I found ${results.length} related recordings in your history:`
                                            : `He encontrado ${results.length} audios relacionados en tu historial:`;

                                        // Generate search result message with action buttons
                                        let content = resultText + '\n\n';
                                        results.forEach((res: any) => {
                                            content += `[[ACTION:OPEN_RECORDING:${res.recording_id}:${res.content.substring(0, 50)}...]]\n`;
                                        });

                                        setMessages(prev => [...prev, { role: 'bot', content }]);
                                    } else {
                                        const noResults = language === 'en'
                                            ? "I couldn't find anything related in your deep history either."
                                            : "No he podido encontrar nada relacionado en tu historial profundo tampoco.";
                                        setMessages(prev => [...prev, { role: 'bot', content: noResults }]);
                                    }
                                } catch (err) {
                                    console.error("Deep search failed:", err);
                                } finally {
                                    setIsSearching(false);
                                }
                            }}
                            className={`mt-3 w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${isSearching
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 shadow-sm'
                                }`}
                        >
                            <span className={`material-symbols-outlined text-sm ${isSearching ? 'animate-spin' : ''}`}>
                                {isSearching ? 'progress_activity' : 'search'}
                            </span>
                            {isSearching ? t('deepSearchStatus') : t('deepSearchAction')}
                        </button>
                    );
                } else if (type === 'SWITCH_AGENT') {
                    const nextId = actionData[1];
                    const nextAgent = PERSONALITIES.find(p => p.id === nextId);
                    if (nextAgent) {
                        elements.push(
                            <button
                                key={`action-${i}`}
                                onClick={() => {
                                    if (Analytics && typeof Analytics.trackEvent === 'function') {
                                        Analytics.trackEvent('support_bot_agent_switch', {
                                            from_agent: agent.id,
                                            to_agent: nextId
                                        });
                                    }
                                    localStorage.setItem('diktalo_active_support_agent', nextId);
                                    setAgent(nextAgent);
                                    // Add switch message
                                    const time = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                                    const day = new Date().toLocaleDateString('es-ES', { weekday: 'long' });
                                    const greeting = language === 'en' ? nextAgent.greeting.en(time, day) : nextAgent.greeting.es(time, day);
                                    setMessages(prev => [...prev, { role: 'bot', content: greeting }]);
                                }}
                                className="mt-3 w-full py-2.5 px-4 bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition-all border border-slate-200 dark:border-white/10"
                            >
                                <span className="material-symbols-outlined text-sm">person_add</span>
                                {t('talkToAgent').replace('{name}', nextAgent.name)}
                            </button>
                        );
                    }
                } else if (type === 'START_TOUR') {
                    elements.push(
                        <button
                            key={`action-${i}`}
                            onClick={() => {
                                if (Analytics && typeof Analytics.trackEvent === 'function') {
                                    Analytics.trackEvent('support_bot_action_click', {
                                        agent_id: agent.id,
                                        action_type: 'start_tour'
                                    });
                                }
                                const tourIdx = parseInt(actionData[1]) || 0;
                                onAction?.('START_TOUR', { stepIndex: tourIdx });
                            }}
                            className="mt-3 w-full py-2.5 px-4 bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
                        >
                            <span className="material-symbols-outlined text-sm">auto_awesome</span>
                            {t('startGuidedTourAction')}
                        </button>
                    );
                } else if (type === 'HIGHLIGHT') {
                    const id = actionData[1];
                    elements.push(
                        <button
                            key={`action-${i}`}
                            onClick={() => {
                                if (Analytics && typeof Analytics.trackEvent === 'function') {
                                    Analytics.trackEvent('support_bot_action_click', { action_type: 'highlight', target_id: id });
                                }
                                onAction?.('HIGHLIGHT', { id });
                            }}
                            className="mt-3 w-full py-2.5 px-4 bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20"
                        >
                            <span className="material-symbols-outlined text-sm">visibility</span>
                            {t('showMeWhere')}
                        </button>
                    );
                } else if (type === 'DELETE_RECORDING') {
                    const id = actionData[1];
                    const rec = recordings.find(r => r.id === id);
                    if (rec) {
                        elements.push(
                            <button
                                key={`action-${i}`}
                                onClick={() => {
                                    if (Analytics && typeof Analytics.trackEvent === 'function') {
                                        Analytics.trackEvent('support_bot_action_click', { action_type: 'delete_recording', recording_id: id });
                                    }
                                    onAction?.('DELETE_RECORDING', { id });
                                }}
                                className="mt-3 w-full py-2.5 px-4 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-red-200 transition-all border border-red-200 dark:border-red-900/30"
                            >
                                <span className="material-symbols-outlined text-sm">delete</span>
                                {t('confirmDeleteRecording').replace('{title}', rec.title)}
                            </button>
                        );
                    }
                } else if (type === 'RENAME_RECORDING') {
                    const id = actionData[1];
                    const newTitle = actionData[2];
                    const rec = recordings.find(r => r.id === id);
                    if (rec) {
                        elements.push(
                            <button
                                key={`action-${i}`}
                                onClick={() => {
                                    if (Analytics && typeof Analytics.trackEvent === 'function') {
                                        Analytics.trackEvent('support_bot_action_click', { action_type: 'rename_recording', recording_id: id, new_title: newTitle });
                                    }
                                    onAction?.('RENAME_RECORDING', { id, title: newTitle });
                                }}
                                className="mt-3 w-full py-2.5 px-4 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-blue-200 transition-all border border-blue-200 dark:border-blue-900/30"
                            >
                                <span className="material-symbols-outlined text-sm">edit</span>
                                {t('confirmRenameRecording').replace('{title}', newTitle)}
                            </button>
                        );
                    }
                } else if (type === 'CREATE_FOLDER' || type === 'CREATE_PROJECT') {
                    const name = actionData[1];
                    elements.push(
                        <button
                            key={`action-${i}`}
                            onClick={() => {
                                if (Analytics && typeof Analytics.trackEvent === 'function') {
                                    Analytics.trackEvent('support_bot_action_click', { action_type: 'create_folder', folder_name: name });
                                }
                                onAction?.('CREATE_FOLDER', { name });
                            }}
                            className="mt-3 w-full py-2.5 px-4 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-emerald-200 transition-all border border-emerald-200 dark:border-emerald-900/30"
                        >
                            <span className="material-symbols-outlined text-sm">create_new_folder</span>
                            {t('confirmCreateFolder').replace('{title}', name)}
                        </button>
                    );
                } else if (type === 'MOVE_TO_FOLDER' || type === 'MOVE_TO_PROJECT') {
                    const recId = actionData[1];
                    const folderId = actionData[2];
                    const rec = recordings.find(r => r.id === recId);

                    elements.push(
                        <button
                            key={`action-${i}`}
                            onClick={() => {
                                if (Analytics && typeof Analytics.trackEvent === 'function') {
                                    Analytics.trackEvent('support_bot_action_click', { action_type: 'move_to_folder', recording_id: recId, folder_id: folderId });
                                }
                                onAction?.('MOVE_TO_FOLDER', { recordingId: recId, folderId });
                            }}
                            className="mt-3 w-full py-2.5 px-4 bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-amber-200 transition-all border border-amber-200 dark:border-amber-900/30"
                        >
                            <span className="material-symbols-outlined text-sm">drive_file_move</span>
                            {rec ? t('confirmDeleteRecording').replace('Delete', 'Move').replace('Borrar', 'Mover').replace('{title}', rec.title) : t('moveToFolderAction')}
                        </button>
                    );
                }
            }
        }
        return elements;
    };

    const renderSystemMessage = (content: string) => {
        return (
            <div className="flex justify-center my-4">
                <div className="px-4 py-1.5 bg-slate-200 dark:bg-white/10 rounded-full text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider backdrop-blur-sm">
                    {content}
                </div>
            </div>
        );
    };

    return (
        <motion.div
            drag
            dragMomentum={false}
            // Better constraints: allow full screen but keep it visible
            dragConstraints={{
                left: -400,
                right: window.innerWidth - 80,
                top: -window.innerHeight + 100,
                bottom: 20
            }}
            onDragStart={() => {
                isDragging.current = true;
            }}
            onDrag={(e, info) => {
                // Determine alignment based on screen percentage
                const x = info.point.x;
                const width = window.innerWidth;
                const ratio = x / width;

                if (ratio < 0.33) {
                    setAlignment('start');
                } else if (ratio < 0.66) {
                    setAlignment('center');
                } else {
                    setAlignment('end');
                }
            }}
            onDragEnd={() => {
                // Short timeout to prevent the immediate click from triggering
                setTimeout(() => {
                    isDragging.current = false;
                }, 100);
            }}
            // ABOVE EVERYTHING
            className={`fixed bottom-6 z-[2147483647] flex flex-col items-${alignment} ${initialOffset || (position === 'left' ? 'left-6' : 'right-6')}`}
        >
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="w-[350px] md:w-[400px] h-[550px] bg-white dark:bg-slate-900 shadow-2xl rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10 flex flex-col mb-4 pointer-events-auto"
                    >
                        {/* Header - Drag Handle */}
                        <div className="bg-primary p-6 text-white flex items-center justify-between cursor-grab active:cursor-grabbing select-none">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-white/30 flex items-center justify-center backdrop-blur-sm">
                                    <img
                                        src={agent.avatar}
                                        alt={agent.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">{agent.name} - {t('support')}</h3>
                                    <p className="text-[10px] opacity-70">
                                        {t('onlineAssistant')}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsOpen(false);
                                }}
                                className="hover:rotate-90 transition-transform p-1.5 rounded-full hover:bg-white/10"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50 dark:bg-transparent">
                            {messages.map((m, i) => {
                                if (m.role === 'system') return <React.Fragment key={i}>{renderSystemMessage(m.content)}</React.Fragment>;

                                return (
                                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} group`}>
                                        <div className={`max-w-[85%] p-4 rounded-2xl text-[13px] leading-relaxed ${m.role === 'user'
                                            ? 'bg-primary text-white rounded-tr-none shadow-lg shadow-primary/20'
                                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-sm border border-slate-100 dark:border-white/5 rounded-tl-none'
                                            }`}>
                                            {m.role === 'bot' ? renderMessageContent(m.content) : <p>{m.content}</p>}

                                            {/* Feedback Icons for bot messages */}
                                            {m.role === 'bot' && (
                                                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span className="text-[10px] text-slate-400">
                                                        {t('wasThisHelpful')}
                                                    </span>
                                                    <div className="flex gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                if (m.feedback) return;
                                                                setMessages(prev => prev.map((msg, idx) => idx === i ? { ...msg, feedback: 'up' } : msg));
                                                                if (Analytics && typeof Analytics.trackEvent === 'function') {
                                                                    Analytics.trackEvent('support_bot_feedback', {
                                                                        agent_id: agent.id,
                                                                        type: 'helpful',
                                                                        message_index: i
                                                                    });
                                                                }
                                                            }}
                                                            className={`p-1 rounded-md transition-colors ${m.feedback === 'up' ? 'text-green-500 bg-green-50 dark:bg-green-900/20' : 'text-slate-400 hover:text-green-500 hover:bg-green-50'}`}
                                                        >
                                                            <span className="material-symbols-outlined text-sm">thumb_up</span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                if (m.feedback) return;
                                                                setMessages(prev => prev.map((msg, idx) => idx === i ? { ...msg, feedback: 'down' } : msg));
                                                                if (Analytics && typeof Analytics.trackEvent === 'function') {
                                                                    Analytics.trackEvent('support_bot_feedback', {
                                                                        agent_id: agent.id,
                                                                        type: 'unhelpful',
                                                                        message_index: i
                                                                    });
                                                                }
                                                            }}
                                                            className={`p-1 rounded-md transition-colors ${m.feedback === 'down' ? 'text-red-500 bg-red-50 dark:bg-red-900/20' : 'text-slate-400 hover:text-red-500 hover:bg-red-50'}`}
                                                        >
                                                            <span className="material-symbols-outlined text-sm">thumb_down</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 rounded-tl-none">
                                        <div className="flex gap-1">
                                            <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></span>
                                            <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                            <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSend} className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-white/5">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder={t('typeQuestionPlaceholder')}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onPointerDown={(e) => e.stopPropagation()} // Prevent drag while typing/focusing
                                    className="w-full pl-4 pr-12 py-3 bg-slate-100 dark:bg-white/5 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary transition-all dark:text-white"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isTyping}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-primary rounded-lg text-white flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-50 transition-all font-bold"
                                >
                                    <span className="material-symbols-outlined text-lg">arrow_upward</span>
                                </button>
                            </div>
                            <p className="text-[10px] text-center text-slate-400 mt-2">
                                {t('usesAiToHelp').replace('{name}', agent.name)}
                            </p>
                        </form>
                    </motion.div>
                )
                }
            </AnimatePresence >

            {/* Bubble Toggle */}
            <motion.button
                id="support-bot-trigger"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                    if (!isDragging.current) {
                        toggleOpen();
                    }
                }}
                className={`h-16 w-16 rounded-full shadow-2xl flex items-center justify-center text-white transition-all transform pointer-events-auto cursor-grab active:cursor-grabbing ${isOpen ? 'bg-slate-900 rotate-90' : 'bg-primary'
                    }`}
            >
                <span className="material-symbols-outlined text-3xl">
                    {isOpen ? 'close' : 'chat_bubble'}
                </span>
            </motion.button >
        </motion.div >
    );
};
