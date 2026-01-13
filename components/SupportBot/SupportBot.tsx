import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const SupportBot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ role: 'user' | 'bot'; content: string }[]>([
        { role: 'bot', content: '¡Hola! Soy Nati Pol. Me pillas planeando mi próxima ruta de senderismo por los fiordos, pero dime, ¿en qué puedo ayudarte con Diktalo hoy?' }
    ]);
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
            // Call real Gemini AI instead of pattern matching
            const { supportChat } = await import('../../services/geminiService');
            const response = await supportChat(userMsg, messages, 'es');
            setMessages(prev => [...prev, { role: 'bot', content: response }]);
        } catch (error) {
            console.error('Support chat error:', error);
            console.error('Error details:', error instanceof Error ? error.message : String(error));
            setMessages(prev => [...prev, {
                role: 'bot',
                content: `Error: ${error instanceof Error ? error.message : 'No pude procesar tu mensaje'}. Por favor, intenta de nuevo.`
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="w-[350px] md:w-[400px] h-[550px] bg-white dark:bg-slate-900 shadow-2xl rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10 flex flex-col mb-4"
                    >
                        {/* Header */}
                        <div className="bg-primary p-6 text-white flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-white/30 flex items-center justify-center backdrop-blur-sm">
                                    <img
                                        src="/images/nati-pol.png"
                                        alt="Nati Pol"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div>
                                    <div>
                                        <h3 className="font-bold text-sm">Nati Pol - Asistente Diktalo</h3>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="hover:rotate-90 transition-transform">
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
                                        {m.content.split('\n').map((line, idx) => (
                                            <p key={idx} className={line.trim() ? 'mb-2' : 'h-2'}>{line}</p>
                                        ))}
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
                                Nati Pol usa inteligencia artificial para ayudarte.
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
                className={`h-16 w-16 rounded-full shadow-2xl flex items-center justify-center text-white transition-all transform ${isOpen ? 'bg-slate-900 rotate-90' : 'bg-primary'
                    }`}
            >
                <span className="material-symbols-outlined text-3xl">
                    {isOpen ? 'close' : 'chat_bubble'}
                </span>
            </motion.button>
        </div>
    );
};
