import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    featureName: string;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, featureName }) => {
    const navigate = useNavigate();

    const handleUpgrade = () => {
        navigate('/subscription');
        onClose();
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
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999]"
                        onClick={onClose}
                    />

                    {/* Modal Wrapper */}
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="pointer-events-auto w-full max-w-md max-h-[90vh] overflow-y-auto bg-white dark:bg-[#1f1f1f] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-8 scrollbar-hide"
                        >
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <X size={20} className="text-slate-400" />
                            </button>

                            {/* Icon */}
                            <div className="flex justify-center mb-4">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-xl opacity-30 animate-pulse" />
                                    <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-full">
                                        <Lock size={32} className="text-white" />
                                    </div>
                                </div>
                            </div>

                            {/* Title */}
                            <h3 className="text-xl font-bold text-center text-slate-900 dark:text-white mb-2">
                                Función Premium
                            </h3>

                            {/* Description */}
                            <p className="text-center text-slate-600 dark:text-slate-400 mb-6 px-2">
                                La función <span className="font-semibold text-slate-900 dark:text-white">{featureName}</span> requiere un plan superior.
                            </p>

                            {/* Benefits */}
                            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-xl p-4 mb-6 border border-blue-100 dark:border-blue-900/50">
                                <div className="flex items-start gap-3 mb-2">
                                    <Sparkles size={18} className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-slate-700 dark:text-slate-300">
                                        Desbloquea <strong>todas las funciones</strong> de IA, exportación, análisis y más
                                    </p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Sparkles size={18} className="text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-slate-700 dark:text-slate-300">
                                        Desde <strong>9€/mes</strong> (o 108€/año)
                                    </p>
                                </div>
                            </div>

                            {/* CTA Button */}
                            <button
                                onClick={handleUpgrade}
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30"
                            >
                                Ver Planes y Precios
                            </button>

                            {/* Footer */}
                            <p className="text-center text-xs text-slate-500 dark:text-slate-500 mt-4">
                                Cancela cuando quieras • Sin compromisos
                            </p>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};
