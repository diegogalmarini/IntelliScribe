import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { Navbar } from '../components/Landing/Navbar';
import { Footer } from '../components/Footer';
import { UserProfile } from '../types';

export const About: React.FC<{ user?: UserProfile }> = ({ user }) => {
    const { t } = useLanguage();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const team = [
        {
            name: "Nati Pol",
            role: t('about_nati_role'),
            bio: t('about_nati_bio'),
            image: "/images/nati-pol.png",
            skills: ["BANT Analysis", "CRM Integration", "Nordic Hiking"]
        },
        {
            name: "Partner",
            role: t('about_partner_role'),
            bio: t('about_partner_bio'),
            image: "/images/partner.png",
            skills: ["AI Logic", "Performance", "Architecture"]
        }
    ];

    return (
        <div className="landing-page bg-background-light dark:bg-background-dark min-h-screen font-sans transition-colors duration-300">
            <Navbar user={user} />

            <main className="pt-32 pb-24">
                {/* Hero Section */}
                <section className="max-w-7xl mx-auto px-4 mb-32">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center"
                    >
                        <h1 className="h1 home text-slate-900 dark:text-white mb-6 uppercase">
                            {t('about_hero_title')}
                        </h1>
                        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
                            {t('about_hero_desc')}
                        </p>
                    </motion.div>
                </section>

                {/* Team Section */}
                <section className="max-w-7xl mx-auto px-4 mb-32">
                    <h2 className="h2 home text-slate-900 dark:text-white text-center mb-16 underline decoration-primary/30 decoration-4 underline-offset-8">
                        {t('about_team_title')}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
                        {team.map((member, idx) => (
                            <motion.div
                                key={member.name}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.2 }}
                                className="group bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 backdrop-blur-xl"
                            >
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-40 h-40 rounded-3xl overflow-hidden mb-6 shadow-xl ring-4 ring-primary/10 group-hover:ring-primary/20 transition-all">
                                        <img
                                            src={member.image}
                                            alt={member.name}
                                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                        />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{member.name}</h3>
                                    <p className="text-secondary font-bold text-sm mb-4 uppercase tracking-widest">{member.role}</p>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6 font-medium italic">
                                        "{member.bio}"
                                    </p>
                                    <div className="flex flex-wrap justify-center gap-2">
                                        {member.skills.map(skill => (
                                            <span key={skill} className="px-3 py-1 bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 rounded-full text-xs font-bold uppercase tracking-tighter">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Roadmap Section */}
                <section className="max-w-7xl mx-auto px-4 mb-32">
                    <div className="bg-slate-50 dark:bg-white/5 rounded-[3rem] p-12 md:p-20 border border-slate-200 dark:border-white/10">
                        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
                            <div className="max-w-xl">
                                <h2 className="h2 home text-slate-900 dark:text-white mb-6">
                                    {t('roadmap_title')}
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400 font-medium">
                                    {t('roadmap_subtitle')}
                                </p>
                            </div>
                            <a href="/roadmap" className="px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg hover:shadow-primary/20 transition-all">
                                Ver Detalles
                            </a>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5">
                                <div className="text-primary font-black mb-2">Q1</div>
                                <div className="text-slate-900 dark:text-white font-bold mb-2">Beta Pública ✅</div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">{t('roadmap_q1_title')}</div>
                            </div>
                            <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5">
                                <div className="text-primary font-black mb-2">Q2</div>
                                <div className="text-slate-900 dark:text-white font-bold mb-2">SOC 2 Type II 🔄</div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">{t('roadmap_q2_title')}</div>
                            </div>
                            <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5">
                                <div className="text-primary font-black mb-2">Q3</div>
                                <div className="text-slate-900 dark:text-white font-bold mb-2">Developer API ⏳</div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">{t('roadmap_q3_title')}</div>
                            </div>
                            <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5">
                                <div className="text-primary font-black mb-2">Q4</div>
                                <div className="text-slate-900 dark:text-white font-bold mb-2">Integraciones ⏳</div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">{t('roadmap_q4_title')}</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Philosophy Section */}
                <section className="max-w-5xl mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="bg-slate-900 dark:bg-primary-900 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full -mr-32 -mt-32"></div>
                        <div className="relative z-10">
                            <h2 className="h2 home text-white mb-8">{t('about_philosophy_title')}</h2>
                            <p className="text-slate-300 max-w-2xl mx-auto text-lg leading-relaxed mb-10">
                                {t('about_philosophy_desc')}
                            </p>
                            <div className="flex flex-wrap justify-center gap-8 md:gap-16">
                                <div className="text-center">
                                    <div className="text-3xl font-black text-white mb-2 underline decoration-primary decoration-4">DIRECTO</div>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Sin rodeos</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-black text-white mb-2 underline decoration-secondary decoration-4">CONCISO</div>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Al grano</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-black text-white mb-2 underline decoration-primary-light decoration-4">REAL</div>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Human Centric</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </section>
            </main>

            <Footer />
        </div>
    );
};
