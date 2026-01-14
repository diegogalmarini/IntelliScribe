import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Personality, PERSONALITIES } from '../../utils/supportPersonalities';
import { useLanguage } from '../../contexts/LanguageContext';
import { Recording, UserProfile } from '../../types';

interface SupportBotProps {
    position?: 'left' | 'right';
    recordings?: Recording[];
    user?: UserProfile;
    onAction?: (action: string, payload: any) => void;
}

export const SupportBot: React.FC<SupportBotProps> = ({
    position = 'right',
    recordings = [],
    user,
    onAction
}) => {
    const { t, language = 'es' } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);

    // Select personality once on mount
    const [agent] = useState<Personality>(() => {
        const random = PERSONALITIES[Math.floor(Math.random() * PERSONALITIES.length)];
        return random;
    });

    const [messages, setMessages] = useState<{ role: 'user' | 'bot'; content: string }[]>([]);

    // Initialize greeting
    useEffect(() => {
        const time = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        const day = new Date().toLocaleDateString('es-ES', { weekday: 'long' });
        const greeting = language === 'en' ? agent.greeting.en(time, day) : agent.greeting.es(time, day);
        setMessages([{ role: 'bot', content: greeting }]);
    }, [agent, language]);

    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!input.trim() || isTyping) return;

        const userMsg = input.trim();
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setInput('');
        setIsTyping(true);

        try {
            const { supportChat } = await import('../../services/geminiService');

            // Construct dynamic system prompt for this agent
            const langKey = language === 'en' ? 'en' : 'es';
            const bio = agent.bio[langKey];
            const tone = agent.tone[langKey];
            const relations = agent.relations[langKey];

            // Context: Recordings and User Profile
            const recordingsList = recordings.slice(0, 10).map(r => `- ID: ${r.id}, Título: ${r.title}`).join('\n');
            const userContext = user ? `USUARIO: ${user.firstName}, PLAN: ${user.subscription?.planId || 'free'}` : 'USUARIO: No autenticado';

            const systemPromptOverride = langKey === 'es'
                ? `PERSONALIDAD Y BIO:
    - Eres ${agent.name}, ${agent.age} años, vives en ${agent.city}.
    - ROL: ${agent.role} en Diktalo.
    - BIO: ${bio}
    - ESTILO/TONO: ${tone}
    - RESPUESTAS: Sé concreto, directo y amigable.
    - TUS CAPACIDADES: Puedes buscar en los audios del usuario, decirles su plan actual, y ayudarles a navegar por la app.
    - ACCIONES (SOLO SI EL USUARIO LO PIDE):
        1. Abrir audio: [[ACTION:OPEN_RECORDING:ID_DEL_AUDIO:TITULO_DEL_AUDIO]]
        2. Navegar a sección: [[ACTION:NAVIGATE:SETTINGS]] (usar para Ajustes, Idioma, Perfil) o [[ACTION:NAVIGATE:PLANS]] (para precios/upgrades).
    - PLANTILLAS: Si el usuario pide un resumen, sugiere plantillas (Médico, Legal, Negocios, etc.).
    - SOPORTE TÉCNICO: Si hay un error persistente, derivar a support@diktalo.com.
    - CONTEXTO: 
      ${userContext}
      GRABACIONES RECIENTES:
      ${recordingsList || 'Sin grabaciones aún.'}
    - RELACIONES: ${relations}. Nati Pol es nuestra Directora Creativa y jefa.
    
    REGLAS:
    1. Usa tu personalidad. CERO negritas (**).
    2. Si el usuario pregunta "¿Cuál es mi plan?", díselo (${user?.subscription?.planId}) y ofrece ayuda para cambiarlo si quiere.
    3. Si pregunta cómo cambiar el idioma o ir a ajustes, dile cómo y ponle el botón: [[ACTION:NAVIGATE:SETTINGS]].`
                : `PERSONALITY & BIO:
    - You are ${agent.name}, ${agent.age} years old, living in ${agent.city}.
    - ROLE: ${agent.role} at Diktalo.
    - BIO: ${bio}
    - TONE/STYLE: ${tone}
    - RESPONSES: Be concrete and friendly.
    - CAPABILITIES: You can search recordings, tell users their current plan, and help navigate the app.
    - ACTIONS (ONLY IF REQUESTED):
        1. Open audio: [[ACTION:OPEN_RECORDING:RECORDING_ID:RECORDING_TITLE]]
        2. Navigate: [[ACTION:NAVIGATE:SETTINGS]] or [[ACTION:NAVIGATE:PLANS]].
    - CONTEXT: 
      ${userContext}
      RECENT RECORDINGS:
      ${recordingsList || 'No recordings yet.'}
    - RELATIONS: ${relations}. Nati Pol is our Creative Director and boss.
    
    RULES:
    1. Use your uniquely personality. NO bolding (**).
    2. If user asks "What is my plan?", tell them (${user?.subscription?.planId}) and offer help.
    3. If they ask about language or settings, use [[ACTION:NAVIGATE:SETTINGS]].`;

            const response = await supportChat(userMsg, messages, language, systemPromptOverride);

            // Simulation of natural typing delay
            const delayBase = 1000;
            const delayPerChar = 15;
            const totalDelay = Math.min(Math.max(delayBase, response.length * delayPerChar), 4000);

            await new Promise(resolve => setTimeout(resolve, totalDelay));

            setMessages(prev => [...prev, { role: 'bot', content: response }]);
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

    const sideClasses = position === 'left' ? 'left-6 items-start' : 'right-6 items-end';

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
                            onClick={() => onAction?.(type, { id, title })}
                            className="mt-3 w-full py-2.5 px-4 bg-primary text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md shadow-primary/20"
                        >
                            <span className="material-symbols-outlined text-sm">play_circle</span>
                            Abrir "{title}"
                        </button>
                    );
                } else if (type === 'NAVIGATE') {
                    const target = actionData[1];
                    const label = target === 'SETTINGS' ? 'Ir a Ajustes' : (target === 'PLANS' ? 'Ver Planes' : `Ir a ${target}`);
                    const icon = target === 'SETTINGS' ? 'settings' : 'payments';

                    elements.push(
                        <button
                            key={`action-${i}`}
                            onClick={() => onAction?.(type, { target })}
                            className="mt-3 w-full py-2.5 px-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                            <span className="material-symbols-outlined text-sm">{icon}</span>
                            {label}
                        </button>
                    );
                }
            }
        }
        return elements;
    };

    return (
        <motion.div
            drag
            dragMomentum={false}
            // Better constraints: allow full screen but keep it visible
            dragConstraints={{
                left: position === 'right' ? -window.innerWidth + 400 : -20,
                right: position === 'left' ? window.innerWidth - 400 : 20,
                top: -window.innerHeight + 600,
                bottom: 20
            }}
            // CRITICAL: Remove transition-all as it conflicts with drag transforms
            className={`fixed bottom-6 z-[9999] flex flex-col ${sideClasses}`}
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
                                    <h3 className="font-bold text-sm">{agent.name} - {t('support') || 'Support'}</h3>
                                    <p className="text-[10px] opacity-70">En línea (Asistente Diktalo)</p>
                                </div>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsOpen(false);
                                }}
                                className="hover:rotate-90 transition-transform p-1 rounded-full hover:bg-white/10"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50 dark:bg-transparent">
                            {messages.map((m, i) => (
                                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] p-4 rounded-2xl text-[13px] leading-relaxed ${m.role === 'user'
                                        ? 'bg-primary text-white rounded-tr-none shadow-lg shadow-primary/20'
                                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-sm border border-slate-100 dark:border-white/5 rounded-tl-none'
                                        }`}>
                                        {m.role === 'bot' ? renderMessageContent(m.content) : <p>{m.content}</p>}
                                    </div>
                                </div>
                            ))}
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
                                    placeholder="Escribe tu pregunta..."
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
                                {agent.name} usa inteligencia artificial para ayudarte.
                            </p>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bubble Toggle */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`h-16 w-16 rounded-full shadow-2xl flex items-center justify-center text-white transition-all transform pointer-events-auto cursor-grab active:cursor-grabbing ${isOpen ? 'bg-slate-900 rotate-90' : 'bg-primary'
                    }`}
            >
                <span className="material-symbols-outlined text-3xl">
                    {isOpen ? 'close' : 'chat_bubble'}
                </span>
            </motion.button>
        </motion.div>
    );
};
