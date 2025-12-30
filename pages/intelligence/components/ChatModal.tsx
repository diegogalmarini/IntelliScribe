import React, { useState } from 'react';
import { Recording } from '../../../types';
import { X, Send } from 'lucide-react';

interface ChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    recording: Recording;
}

export const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose, recording }) => {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([]);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSend = async () => {
        if (!message.trim() || loading) return;

        const userMessage = message.trim();
        setMessage('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setLoading(true);

        try {
            // TODO: Implement actual AI chat API call
            // For now, just show a placeholder response
            setTimeout(() => {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: 'Esta funcionalidad estará disponible próximamente. Por ahora puedes revisar la transcripción y el resumen IA de tu grabación.'
                }]);
                setLoading(false);
            }, 1000);
        } catch (error) {
            console.error('Error sending message:', error);
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-2xl mx-4 bg-white dark:bg-[#2a2a2a] rounded-2xl shadow-2xl flex flex-col max-h-[80vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-black/[0.05] dark:border-white/[0.05]">
                    <div>
                        <h2 className="text-lg font-semibold text-[#0d0d0d] dark:text-white">
                            Preguntar a Diktalo
                        </h2>
                        <p className="text-[12px] text-[#8e8e8e] mt-1">
                            {recording.title}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X size={20} className="text-[#8e8e8e]" />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-[13px] text-[#8e8e8e]">
                                Pregúntame cualquier cosa sobre esta grabación
                            </p>
                        </div>
                    ) : (
                        messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] px-4 py-3 rounded-2xl text-[13px] ${msg.role === 'user'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-[#f7f7f8] dark:bg-[#33343d] text-[#0d0d0d] dark:text-[#ececec]'
                                        }`}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))
                    )}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-[#f7f7f8] dark:bg-[#33343d] px-4 py-3 rounded-2xl">
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 bg-[#8e8e8e] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-2 h-2 bg-[#8e8e8e] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="w-2 h-2 bg-[#8e8e8e] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input */}
                <div className="p-6 border-t border-black/[0.05] dark:border-white/[0.05]">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Escribe tu pregunta..."
                            className="flex-1 px-4 py-3 bg-[#f7f7f8] dark:bg-[#33343d] border-0 rounded-xl text-[13px] text-[#0d0d0d] dark:text-[#ececec] placeholder-[#8e8e8e] focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!message.trim() || loading}
                            className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
