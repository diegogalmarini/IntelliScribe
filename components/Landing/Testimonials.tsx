import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { testimonialsData, Testimonial } from '../../utils/testimonialsData';

// Utility to shuffle array
const shuffleArray = (array: any[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

export const Testimonials: React.FC = () => {
    const { t } = useLanguage();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [shuffledPool, setShuffledPool] = useState<Testimonial[]>([]);

    // Initialize shuffled pool once on mount
    useEffect(() => {
        setShuffledPool(shuffleArray(testimonialsData));
    }, []);

    // Rotation logic (every 15s)
    useEffect(() => {
        if (shuffledPool.length === 0) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => {
                const next = prev + 3;
                // If we reach the end, reshuffle and start over
                if (next >= shuffledPool.length) {
                    setShuffledPool(shuffleArray(testimonialsData));
                    return 0;
                }
                return next;
            });
        }, 15000); // 15 seconds

        return () => clearInterval(interval);
    }, [shuffledPool]);

    // Current batch of 3
    const currentBatch = useMemo(() => {
        if (shuffledPool.length === 0) return [];
        return shuffledPool.slice(currentIndex, currentIndex + 3);
    }, [shuffledPool, currentIndex]);

    if (currentBatch.length === 0) return null;

    return (
        <section className="py-24 bg-slate-50 dark:bg-slate-900/50 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-16">
                    <p className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-widest">Testimonios</p>
                    <h2 className="h2 home text-slate-900 dark:text-white">
                        {t('heroReview')}
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 min-h-[400px]">
                    <AnimatePresence mode="wait">
                        {currentBatch.map((item, idx) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                transition={{
                                    duration: 0.8,
                                    delay: idx * 0.15,
                                    ease: "easeInOut"
                                }}
                                className="bg-white dark:bg-background-dark p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 flex flex-col h-full relative"
                            >
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="relative">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="size-12 rounded-full object-cover ring-2 ring-primary/20"
                                        />
                                        <div className="absolute -bottom-1 -right-1 bg-green-500 size-3 rounded-full border-2 border-white dark:border-background-dark" title="Usuario Verificado" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">{item.name}</h4>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{item.role}</p>
                                    </div>
                                </div>
                                <div className="flex gap-0.5 text-amber-400 mb-4 text-xs">
                                    {Array.from({ length: 5 }).map((_, s) => (
                                        <span
                                            key={s}
                                            className={`material-symbols-outlined text-[18px] ${s < item.stars ? 'fill-current' : 'opacity-30'}`}
                                        >
                                            star
                                        </span>
                                    ))}
                                </div>
                                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm font-medium italic italic-quote flex-1">
                                    "{item.body}"
                                </p>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Progress Indicator */}
                <div className="mt-12 flex justify-center gap-2">
                    {Array.from({ length: Math.ceil(shuffledPool.length / 3) }).map((_, i) => (
                        <div
                            key={i}
                            className={`h-1 rounded-full transition-all duration-500 ${Math.floor(currentIndex / 3) === i
                                    ? 'w-8 bg-primary'
                                    : 'w-2 bg-slate-300 dark:bg-slate-700'
                                }`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};
