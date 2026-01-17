import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WelcomeTourProps {
    onComplete: () => void;
    onStartBot: () => void;
    language?: 'en' | 'es';
}

interface Step {
    targetId: string;
    title: { en: string; es: string };
    description: { en: string; es: string };
    position: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

const STEPS: Step[] = [
    {
        targetId: 'tour-welcome',
        title: { en: 'Welcome to Diktalo', es: 'Bienvenido a Diktalo' },
        description: {
            en: "I'm your AI partner. I'll show you how to turn your conversations into intelligence.",
            es: "Soy tu compañero de IA. Te enseñaré cómo convertir tus conversaciones en inteligencia."
        },
        position: 'center'
    },
    {
        targetId: 'dialer-button',
        title: { en: 'Capture Everything', es: 'Captura Todo' },
        description: {
            en: "Record meetings or take voice notes here. We'll handle the rest.",
            es: "Graba reuniones o toma notas de voz aquí. Nosotros nos encargamos del resto."
        },
        position: 'top'
    },
    {
        targetId: 'intelligence-hub',
        title: { en: 'Intelligence Hub', es: 'Centro de Inteligencia' },
        description: {
            en: "All your recordings are analyzed by AI here. Get summaries, tasks, and insights instantly.",
            es: "Todos tus audios son analizados por IA aquí. Obtén resúmenes, tareas e información al instante."
        },
        position: 'right'
    },
    {
        targetId: 'support-bot-trigger',
        title: { en: 'Always by your side', es: 'Siempre a tu lado' },
        description: {
            en: "Chat with me anytime to search history, rename files, or ask about your meetings.",
            es: "Chatea conmigo cuando quieras para buscar en tu historial, renombrar archivos o preguntar sobre tus reuniones."
        },
        position: 'left'
    }
];

export const WelcomeTour: React.FC<WelcomeTourProps> = ({ onComplete, onStartBot, language = 'es' }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    const step = STEPS[currentStep];

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            setIsVisible(false);
            setTimeout(onComplete, 500);
        }
    };

    const handleSkip = () => {
        setIsVisible(false);
        setTimeout(onComplete, 500);
    };

    // Auto-open bot on last step
    useEffect(() => {
        if (currentStep === STEPS.length - 1) {
            onStartBot();
        }
    }, [currentStep, onStartBot]);

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto"
                        onClick={handleSkip}
                    />

                    {/* Step Card */}
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -20 }}
                        className="relative w-full max-w-sm mx-4 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 pointer-events-auto border border-slate-200 dark:border-slate-800"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                                <span className="material-symbols-outlined">auto_awesome</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">
                                    {language === 'en' ? 'Quick Tour' : 'Tour Rápido'}
                                </h3>
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                    {step.title[language]}
                                </h2>
                            </div>
                        </div>

                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
                            {step.description[language]}
                        </p>

                        <div className="flex items-center justify-between">
                            <div className="flex gap-1">
                                {STEPS.map((_, i) => (
                                    <div
                                        key={i}
                                        className={`h-1 rounded-full transition-all duration-300 ${i === currentStep ? 'w-4 bg-indigo-600' : 'w-1 bg-slate-200 dark:bg-slate-700'}`}
                                    />
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSkip}
                                    className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                >
                                    {language === 'en' ? 'Skip' : 'Saltar'}
                                </button>
                                <button
                                    onClick={handleNext}
                                    className="px-6 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 hover:scale-[1.05] active:scale-[0.95] transition-all"
                                >
                                    {currentStep === STEPS.length - 1
                                        ? (language === 'en' ? 'Got it!' : '¡Entendido!')
                                        : (language === 'en' ? 'Next' : 'Siguiente')}
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Target Highlighter (Optional visual cue) */}
                    <div id="tour-highlighter" className="hidden" />
                </div>
            )}
        </AnimatePresence>
    );
};
