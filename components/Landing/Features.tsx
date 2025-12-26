import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';

export const Features: React.FC = () => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<'sales' | 'medical' | 'meeting'>('sales');

    const features = {
        sales: {
            title: t('templateSales'),
            desc: t('testim2Body'), // Reusing for context
            points: ["BANT Analysis", "CRM Sync", "Objection Handling"],
            icon: "attach_money",
            color: "text-green-500",
            bg: "bg-green-500/10"
        },
        medical: {
            title: t('templateMedical'),
            desc: t('testim1Body'),
            points: ["SOAP Notes", "Patient Privacy", "EHR Ready"],
            icon: "medical_services",
            color: "text-blue-500",
            bg: "bg-blue-500/10"
        },
        meeting: {
            title: "General Meetings",
            desc: t('feat3Desc'),
            points: ["Action Items", "Summary", "Multi-speaker"],
            icon: "groups",
            color: "text-purple-500",
            bg: "bg-purple-500/10"
        }
    };

    return (
        <section id="features" className="py-24 bg-white dark:bg-background-dark overflow-hidden">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3">{t('navFeatures')}</h2>
                    <h3 className="text-3xl md:text-4xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
                        Built for Every Workflow
                    </h3>
                </div>

                {/* Tabs */}
                <div className="flex justify-center gap-4 mb-16 flex-wrap">
                    {(Object.keys(features) as Array<keyof typeof features>).map((key) => (
                        <button
                            key={key}
                            onClick={() => setActiveTab(key)}
                            className={`px-6 py-3 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${activeTab === key
                                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-lg scale-105'
                                    : 'bg-slate-100 dark:bg-white/5 text-slate-500 hover:bg-slate-200 dark:hover:bg-white/10'
                                }`}
                        >
                            <span className="material-symbols-outlined text-lg">{features[key].icon}</span>
                            {features[key].title}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="relative min-h-[400px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
                        >
                            {/* Text Side */}
                            <div>
                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-6 ${features[activeTab].bg} ${features[activeTab].color}`}>
                                    <span className="material-symbols-outlined text-sm">{features[activeTab].icon}</span>
                                    {activeTab.toUpperCase()} MODE
                                </div>
                                <h3 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-6">
                                    {features[activeTab].title}
                                </h3>
                                <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed font-medium">
                                    {features[activeTab].desc}
                                </p>
                                <ul className="space-y-4">
                                    {features[activeTab].points.map((point, i) => (
                                        <li key={i} className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-bold">
                                            <span className={`material-symbols-outlined ${features[activeTab].color}`}>check_circle</span>
                                            {point}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Visual Side */}
                            <div className="relative">
                                <div className={`absolute -inset-4 bg-gradient-to-tr from-primary/20 to-purple-500/20 blur-3xl rounded-[2rem] opacity-50`}></div>
                                <div className="relative bg-slate-900 rounded-3xl p-8 border border-white/10 shadow-2xl overflow-hidden aspect-video flex items-center justify-center">
                                    {/* Abstract representation of UI */}
                                    <div className="text-center">
                                        <div className={`size-20 rounded-2xl ${features[activeTab].bg} ${features[activeTab].color} flex items-center justify-center mx-auto mb-6`}>
                                            <span className="material-symbols-outlined text-5xl">{features[activeTab].icon}</span>
                                        </div>
                                        <div className="h-4 bg-white/10 rounded-full w-48 mx-auto mb-3"></div>
                                        <div className="h-4 bg-white/5 rounded-full w-32 mx-auto"></div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
};
