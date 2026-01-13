import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';

export const Testimonials: React.FC = () => {
    const { t } = useLanguage();

    const testimonials = [
        {
            name: t('testim1Name'),
            role: t('testim1Role'),
            body: t('testim1Body'),
            image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200&h=200"
        },
        {
            name: t('testim2Name'),
            role: t('testim2Role'),
            body: t('testim2Body'),
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200"
        },
        {
            name: t('testim3Name'),
            role: t('testim3Role'),
            body: t('testim3Body'),
            image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200"
        }
    ];

    return (
        <section className="py-24 bg-slate-50 dark:bg-slate-900/50">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-16">
                    <p className="text-xs font-bold text-slate-500 mb-3">Testimonios</p>
                    <h2 className="h2 home text-slate-900 dark:text-white">
                        {t('heroReview')}
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white dark:bg-background-dark p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 flex flex-col h-full"
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <img src={item.image} alt={item.name} className="size-12 rounded-full object-cover ring-2 ring-primary/20" />
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{item.name}</h4>
                                    <p className="text-xs text-slate-500 font-medium">{item.role}</p>
                                </div>
                            </div>
                            <div className="flex gap-1 text-amber-400 mb-4 text-sm">
                                {[1, 2, 3, 4, 5].map(s => <span key={s} className="material-symbols-outlined fill-current">star</span>)}
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm font-medium flex-1">
                                "{item.body}"
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
