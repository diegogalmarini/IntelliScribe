import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { initGA } from '../utils/analytics';

// Extend Window interface for Analytics
declare global {
    interface Window {
        dataLayer: any[];
    }
}

export const CookieConsentBanner: React.FC = () => {
    const { t } = useLanguage();
    const [isVisible, setIsVisible] = useState(false);
    // Explicit types for consent state
    const [consent, setConsent] = useState<{
        necessary: boolean;
        analytics: boolean;
        functional: boolean;
    } | null>(null);

    // Initial Check Effect
    useEffect(() => {
        // Safe check for window
        if (typeof window !== 'undefined') {
            // @ts-ignore
            window.dataLayer = window.dataLayer || [];
        }

        const savedConsent = localStorage.getItem('diktalo_cookie_consent');
        if (savedConsent) {
            try {
                const parsedConsent = JSON.parse(savedConsent);
                setConsent(parsedConsent);
                // If consent exists, apply it immediately
                applyConsent(parsedConsent);
            } catch (e) {
                console.error("Error parsing cookie consent", e);
            }
        } else {
            // Show banner if no consent stored
            // Small delay for better UX entrance
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const applyConsent = (settings: { necessary: boolean; analytics: boolean; functional: boolean }) => {
        // 1. Analytics (Google Analytics via GTM/gtag)
        if (settings.analytics) {
            initGA();
        } else {
            console.log("🍪 [Cookies] Analytics blocked by user.");
        }

        // 2. Functional (Crisp Chat, etc.)
        if (settings.functional) {
            console.log("🍪 [Cookies] Enabling Functional Scripts (Crisp)...");
            // Dispatch a custom event that CrispWidget can listen to
            window.dispatchEvent(new Event('diktalo-consent-functional-granted'));
        }
    };

    const handleAcceptAll = () => {
        const fullConsent = { necessary: true, analytics: true, functional: true };
        saveAndApply(fullConsent);
    };

    const handleRejectNonEssential = () => {
        const minimalConsent = { necessary: true, analytics: false, functional: false };
        saveAndApply(minimalConsent);
    };

    const saveAndApply = (settings: { necessary: boolean; analytics: boolean; functional: boolean }) => {
        localStorage.setItem('diktalo_cookie_consent', JSON.stringify(settings));
        setConsent(settings);
        setIsVisible(false);
        applyConsent(settings);
    };

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-4 left-4 right-4 md:left-8 md:right-auto md:max-w-md z-50"
                >
                    <div className="bg-white/90 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl p-6">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-primary/10 rounded-xl">
                                <span className="material-symbols-outlined text-primary text-2xl">cookie</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-slate-900 dark:text-white mb-2">
                                    Valoramos su privacidad
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed mb-4">
                                    Utilizamos cookies para mejorar su experiencia, analizar el tráfico y personalizar el contenido.
                                    Puede aceptar todas las cookies o gestionar sus preferencias. Lea nuestra <a href="/cookies" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Política de Cookies</a>.
                                </p>

                                <div className="flex flex-col gap-2">
                                    <button
                                        onClick={handleAcceptAll}
                                        className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-lg shadow-primary/20"
                                    >
                                        Aceptar Todo
                                    </button>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleRejectNonEssential}
                                            className="flex-1 py-2.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
                                        >
                                            Solo Esenciales
                                        </button>
                                        {/** Future: Add a 'Manage' button for granular control modal */}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
