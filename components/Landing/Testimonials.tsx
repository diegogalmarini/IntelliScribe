import React, { useState, useEffect } from 'react';
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

// Independent Slot Component for "raindrop" effect
const TestimonialSlot: React.FC<{ initialIndex: number, pool: Testimonial[] }> = ({ initialIndex, pool }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [nextPoolIndex, setNextPoolIndex] = useState((initialIndex + 3) % pool.length);

    useEffect(() => {
        if (pool.length === 0) return;

        // Random interval between 4s and 8s for "raindrop" effect
        const scheduleNext = () => {
            const delay = 4000 + Math.random() * 4000;
            return setTimeout(() => {
                setCurrentIndex(nextPoolIndex);
                setNextPoolIndex(prev => (prev + 1) % pool.length);
                timer = scheduleNext();
            }, delay);
        };

        let timer = scheduleNext();
        return () => clearTimeout(timer);
    }, [pool, nextPoolIndex]);

    const testimonial = pool[currentIndex];
    if (!testimonial) return null;

    return (
        <div className="relative w-full">
            <AnimatePresence mode="wait">
                <motion.div
                    key={testimonial.id}
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.98 }}
                    transition={{
                        duration: 0.8,
                        ease: "easeInOut"
                    }}
                    className="bg-white dark:bg-background-dark p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 flex flex-col relative"
                >
                    <div className="flex items-center gap-4 mb-5">
                        <div className="relative flex-shrink-0">
                            <img
                                src={testimonial.image}
                                alt={testimonial.name}
                                className="size-12 rounded-full object-cover ring-2 ring-primary/20 bg-slate-100"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=random`;
                                }}
                            />
                        </div>
                        <div className="flex flex-col">
                            <h4 className="font-bold text-slate-900 dark:text-white text-sm leading-none">{testimonial.name}</h4>
                            <p className="text-[0.7rem] text-slate-500 font-bold uppercase tracking-tight mt-0.5">{testimonial.role}</p>
                        </div>
                    </div>

                    <div className="flex gap-0.5 mb-4 items-center">
                        <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, s) => (
                                <span
                                    key={s}
                                    className="material-symbols-outlined text-[18px]"
                                    style={{
                                        fontVariationSettings: "'FILL' 1",
                                        color: s < testimonial.stars ? '#f59e0b' : '#e2e8f0'
                                    }}
                                >
                                    star
                                </span>
                            ))}
                        </div>
                    </div>

                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm font-medium italic italic-quote">
                        "{testimonial.body}"
                    </p>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export const Testimonials: React.FC = () => {
    const { t } = useLanguage();
    const [shuffledPool, setShuffledPool] = useState<Testimonial[]>([]);

    useEffect(() => {
        setShuffledPool(shuffleArray(testimonialsData));
    }, []);

    if (shuffledPool.length === 0) return null;

    return (
        <section className="py-24 bg-slate-50 dark:bg-slate-900/50 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-16">
                    <p className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-widest">Testimonios</p>
                    <h2 className="h2 home text-slate-900 dark:text-white">
                        {t('heroReview')}
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                    <TestimonialSlot initialIndex={0} pool={shuffledPool} />
                    <TestimonialSlot initialIndex={1} pool={shuffledPool} />
                    <TestimonialSlot initialIndex={2} pool={shuffledPool} />
                </div>
            </div>
        </section>
    );
};
