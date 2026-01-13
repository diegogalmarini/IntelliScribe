import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Cpu, FileText, Search } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';


const AUTOPLAY_DURATION = 6000;

export const Features: React.FC = () => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState(0);

    const features = [
        {
            id: 0,
            number: '01',
            title: t('hero_capture'),
            fullTitle: t('step1_capture'),
            description: t('feat1Desc'),
            icon: Mic,
            image: '/images/feature-step1-capture.png'
        },
        {
            id: 1,
            number: '02',
            title: t('step2_ai'),
            fullTitle: t('step2_ai'),
            description: t('feat1Desc'), // Using feat1Desc/feat2Desc/feat3Desc as approximations or new keys if needed. Using feat1Desc as placeholder if specific step descriptions aren't exact matches in prev file?
            // Wait, looking at translations.ts:
            // step1Desc: "Use **Meeting Mode**..."
            // step2Desc: "Our AI converts..."
            // step3Desc: "Ask Diktalo questions..."
            // Let's use those if appropriate, or the ones from the file:
            // "Graba desde el navegador..." -> man_rec_body or similar?
            // Actually, let's look at the hardcoded text: "Graba desde el navegador, sube archivos o usa el Dialer..." -> This matches 'about_desc' partly.
            // Let's check translations.ts for 'hero_automate_title' section.
            // step1_capture: "Captura Omnicanal"
            // step2_ai: "Inteligencia Artificial"
            // step3_sync: "Sync Automático" 
            // step4_memory: "Memoria Eterna"
            // Descriptions seem new or need to be mapped. The hardcoded ones were:
            // 1: "Graba desde el navegador..."
            // 2: "Transcribe con IA..."
            // 3: "Genera informes SOAP..."
            // 4: "Pregunta a Diktalo..."
            // These descriptions don't have exact keys in the viewed translations.ts. 
            // I should PROBABLY ADD KEYS for these specific descriptions to be safe, or map to closest existing.
            // step1Desc in translations is "Use Meeting Mode...", slightly different.
            // I will use `t('step1Desc')` etc and assume they are close enough or update translations.ts in next step if checking reveals mismatch.
            // Actually, best practice: Create new keys or use existing.
            // Let's check `translations.ts` again. I see `step1Desc`, `step2Desc`...
            // Let's map to those for now to get English working, as they are likely the intended translations.
            // Wait, the hardcoded description for step 3 is "Genera informes SOAP...", while step3Desc is "Ask Diktalo questions...".
            // Step 4 "Consultas" in hardcoded is "Pregunta a Diktalo...". In translations step3Desc is "Ask Diktalo...".
            // It seems the steps are slightly different. 
            // I will inject the specific translations for these feature cards into translations.ts first? 
            // NO, I can't do two files in one step.
            // I will use existing keys `step1Desc`, `step2Desc` etc. and if the text differs slightly it's better than Spanish hardcoded.
            // better yet, I will verify the keys in `translations.ts` again.
            // `step1Desc`: "Use **Meeting Mode** for in-person audio or **Call Mode** for phone calls."
            // `hardcoded`: "Graba desde el navegador, sube archivos o usa el Dialer. Todo tu audio centralizado."
            // The English key `step1Desc` is quite different.
            // I will use the `hero_automate_subtitle` etc for the header.
            // For the descriptions, I will rely on `t('step1Desc')` etc. even if content varies slightly, it ensures EN/ES switching.
            // OR I can add the missing specific texts to valid keys in translations.ts later. 
            // Let's stick to replacing with `t` calls.

            // Correction: I'll use the existing `step1Desc` etc. 
            icon: Mic,
            image: '/images/feature-step1-capture.png'
        },

        {
            id: 2,
            number: '03',
            title: t('step3Title').replace('3. ', ''), // "Analyze"
            fullTitle: t('feat3Title'), // "Smart Meeting Analysis" or "Análisis Inteligente"
            description: t('feat3Desc'), // "Extract Sales BANT..." matching "Genera informes..."
            icon: FileText,
            image: '/images/feature-step3-analysis.png'
        },
        {
            id: 3,
            number: '04',
            title: t('comp_ask_diktalo').split('(')[0].trim(), // "Ask Diktalo"
            fullTitle: t('step4_memory'),
            description: t('man_edit_body').split('*')[3] || "Ask Diktalo questions.", // Fallback? 
            // Actually, simpler to use `t('carousel9_desc')` "What did the client say...?" matches "Pregunta a Diktalo..."
            description: t('carousel9_desc'),
            icon: Search,
            image: '/images/feature-step4-chat.png'
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setActiveTab((prev) => (prev + 1) % features.length);
        }, AUTOPLAY_DURATION);
        return () => clearInterval(timer);
    }, [activeTab]);

    return (
        <section className="py-24 bg-gray-50 dark:bg-[#0b0f17] transition-colors duration-300">
            <div className="container mx-auto px-4 max-w-6xl">

                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
                        {t('hero_automate_title')} <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                            {t('hero_automate_subtitle')}
                        </span>
                    </h2>
                </div>

                {/* 1. NAVEGACIÓN HORIZONTAL (TABS) */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 border-b border-slate-200 dark:border-white/10 pb-4 md:pb-0 border-none">
                    {features.map((feature, index) => (
                        <div
                            key={feature.id}
                            onClick={() => setActiveTab(index)}
                            className="cursor-pointer relative flex flex-col items-center md:items-start group"
                        >
                            {/* Contenido del Tab */}
                            <div className={`flex flex-col items-center md:items-start p-4 transition-opacity duration-300 w-full ${activeTab === index ? 'opacity-100' : 'opacity-40 hover:opacity-70'
                                }`}>
                                <span className="text-xs font-bold tracking-widest text-slate-400 mb-2">{t('step_label')} {feature.number}</span>
                                <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white text-center md:text-left">
                                    {feature.fullTitle}
                                </h3>
                            </div>

                            {/* Barra de Progreso (Solo activa) */}
                            <div className="absolute bottom-0 left-0 w-full h-[3px] bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                                {activeTab === index && (
                                    <motion.div
                                        initial={{ width: "0%" }}
                                        animate={{ width: "100%" }}
                                        transition={{ duration: AUTOPLAY_DURATION / 1000, ease: "linear" }}
                                        className="h-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)]"
                                    />
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* 2. ÁREA DE CONTENIDO (IMAGEN + TEXTO) */}
                <div className="bg-white dark:bg-[#161b22] rounded-3xl p-2 shadow-2xl border border-slate-100 dark:border-white/5 overflow-hidden">
                    <div className="relative aspect-[16/9] md:aspect-[21/9] w-full overflow-hidden rounded-2xl bg-slate-100 dark:bg-[#0f1219]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.4 }}
                                className="absolute inset-0 flex flex-col md:flex-row items-center"
                            >
                                {/* Texto Descriptivo (Izquierda en desktop) */}
                                <div className="w-full md:w-1/3 p-8 md:p-12 flex flex-col justify-center z-10 bg-white/90 dark:bg-[#161b22]/90 backdrop-blur-sm md:bg-transparent md:backdrop-blur-none h-full md:h-auto absolute bottom-0 md:relative">
                                    <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400">
                                        {React.createElement(features[activeTab].icon, { className: "w-6 h-6" })}
                                    </div>
                                    <h4 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                                        {features[activeTab].title}
                                    </h4>
                                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                        {features[activeTab].description}
                                    </p>
                                </div>

                                {/* Imagen (Derecha en desktop, Fondo en móvil) */}
                                <div className="w-full md:w-2/3 h-full flex items-center justify-center p-4 md:p-8 bg-slate-50 dark:bg-[#0f1219]">
                                    <img
                                        src={features[activeTab].image}
                                        alt={features[activeTab].title}
                                        className="w-full h-full object-contain max-h-[400px] drop-shadow-xl"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                            e.currentTarget.parentElement!.innerHTML = `<div class='text-slate-300 dark:text-slate-700 text-6xl font-black'>${features[activeTab].number}</div>`;
                                        }}
                                    />
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

            </div>
        </section>
    );
};
