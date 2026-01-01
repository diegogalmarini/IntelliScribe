import React, { useState, useRef, useEffect } from 'react';
import { Recording } from '../../../types';
import { X, Send, Bot, User, Loader2 } from 'lucide-react';
import { chatWithTranscript } from '../../../services/geminiService';
import { useLanguage } from '../../../contexts/LanguageContext';

interface ChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    recording: Recording;
}

export const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose, recording }) => {
    const { language } = useLanguage();
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([]);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    if (!isOpen) return null;

    const handleSend = async () => {
        if (!message.trim() || loading) return;

        const userMessage = message.trim();
        setMessage('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setLoading(true);

        try {
            // Construct transcript string
            const fullTranscript = recording.segments && recording.segments.length > 0
                ? recording.segments.map(s => `${s.speaker}: ${s.text}`).join('\n')
                : "No transcript available.";

            // Convert history for API (map 'assistant' -> 'model')
            const history = messages.map(m => ({
                role: m.role === 'assistant' ? 'model' : 'user' as 'model' | 'user',
                text: m.content
            }));

            // Call API
            const response = await chatWithTranscript(
                fullTranscript,
                history,
                userMessage,
                language as 'en' | 'es'
            );

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: response
            }]);
        } catch (error) {
            console.error('Error sending message:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: language === 'es' ? 'Lo siento, ocurrió un error. Por favor intenta de nuevo.' : 'Sorry, an error occurred. Please try again.'
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-2xl flex flex-col h-[80vh] overflow-hidden border border-gray-200 dark:border-gray-800">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/[0.05] bg-white dark:bg-[#1e1e1e]">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                            <Bot size={20} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                                {language === 'es' ? 'Preguntar a Diktalo' : 'Ask Diktalo'}
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-[200px] sm:max-w-md truncate">
                                {recording.title}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors text-gray-500 dark:text-gray-400"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-[#1a1a1a]">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-60">
                            <Bot size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {language === 'es'
                                    ? 'Haz preguntas sobre el contenido de esta grabación.'
                                    : 'Ask questions about the content of this recording.'}
                            </p>
                        </div>
                    ) : (
                        messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-green-600 text-white'
                                        }`}>
                                        {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                                    </div>
                                    <div
                                        className={`px-4 py-3 rounded-2xl text-[13px] leading-relaxed shadow-sm ${msg.role === 'user'
                                            ? 'bg-blue-600 text-white rounded-br-none'
                                            : 'bg-white dark:bg-[#2a2a2a] text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-800 rounded-bl-none'
                                            }`}
                                    >
                                        {msg.content}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="flex gap-3 max-w-[85%]">
                                <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center flex-shrink-0">
                                    <Bot size={14} />
                                </div>
                                <div className="bg-white dark:bg-[#2a2a2a] px-4 py-3 rounded-2xl rounded-bl-none border border-gray-100 dark:border-gray-800 shadow-sm">
                                    <div className="flex gap-1.5 items-center h-5">
                                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 bg-white dark:bg-[#1e1e1e] border-t border-gray-100 dark:border-white/[0.05]">
                    <div className="flex gap-3 items-center">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                            placeholder={language === 'es' ? "Escribe tu pregunta..." : "Type your question..."}
                            className="flex-1 px-4 py-3 bg-gray-50 dark:bg-[#252525] border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                            disabled={loading}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!message.trim() || loading}
                            className="w-11 h-11 flex items-center justify-center bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed text-white rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                        </button>
                    </div>
                    <div className="text-center mt-2">
                        <p className="text-[10px] text-gray-400">
                            {language === 'es' ? 'La IA puede cometer errores. Verifica la información importante.' : 'AI can make mistakes. Verify important info.'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
