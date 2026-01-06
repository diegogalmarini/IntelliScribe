import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

export type AlertType = 'success' | 'error' | 'info' | 'warning';

interface AlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    type?: AlertType;
}

export const AlertModal: React.FC<AlertModalProps> = ({
    isOpen,
    onClose,
    title,
    message,
    type = 'info'
}) => {
    // Determine icon and color based on type
    const getIcon = () => {
        switch (type) {
            case 'error': return <AlertCircle className="w-10 h-10 text-red-500" />;
            case 'success': return <CheckCircle className="w-10 h-10 text-green-500" />;
            case 'warning': return <AlertCircle className="w-10 h-10 text-amber-500" />;
            default: return <Info className="w-10 h-10 text-blue-500" />;
        }
    };

    const getButtonColor = () => {
        switch (type) {
            case 'error': return 'bg-red-600 hover:bg-red-700 focus:ring-red-500';
            case 'success': return 'bg-green-600 hover:bg-green-700 focus:ring-green-500';
            case 'warning': return 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500';
            default: return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500';
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
                    >
                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-white/10"
                        >
                            <div className="p-6 flex flex-col items-center text-center">
                                <div className="mb-4 bg-slate-50 dark:bg-white/5 p-3 rounded-full">
                                    {getIcon()}
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                                    {title}
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                                    {message}
                                </p>
                                <button
                                    onClick={onClose}
                                    className={`w-full py-2.5 px-4 rounded-xl text-white font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-[#1e1e1e] ${getButtonColor()}`}
                                >
                                    Entendido
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
