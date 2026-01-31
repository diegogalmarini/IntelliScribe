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
            image: "/images/nati-pol.webp",
            skills: ["Human Centric", "Experience", "Strategy"]
        },
        {
            name: "Leo Costa",
            role: t('about_partner_role'),
            bio: t('about_partner_bio'),
            image: "/images/partner.png",
            skills: ["AI Engineering", "Architecture", "Vision"]
        }
    ];

    return (
        <div className="landing-page bg-white dark:bg-[#0b0f17] min-h-screen font-sans transition-colors duration-300 overflow-x-hidden">
            <Navbar user={user} />

            <main className="pt-32 pb-24">
                {/* Hero Section */}
                <section className="max-w-7xl mx-auto px-4 mb-40">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="max-w-4xl"
                    >
                        <h1 className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white mb-10 tracking-tighter leading-[0.9]">
                            {t('about_hero_title')}
                            <span className="text-primary">.</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed font-medium">
                            {t('about_hero_desc')}
                        </p>
                    </motion.div>
                </section>

                {/* Story Section */}
                <section className="max-w-7xl mx-auto px-4 mb-40">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            <div className="absolute -inset-4 bg-gradient-brand blur-3xl opacity-10 rounded-full"></div>
                            <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-8 relative">
                                {t('about_story_title')}
                            </h2>
                            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                                {t('about_story_desc')}
                            </p>
                        </motion.div>
                        <div className="h-px bg-slate-200 dark:bg-white/10 w-full hidden md:block"></div>
                    </div>
                </section>

                {/* Why Choose Section (Refined) */}
                <section className="max-w-7xl mx-auto px-4 mb-40">
                    <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-[4rem] p-12 md:p-24 relative overflow-hidden">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
                            <div>
                                <h2 className="text-5xl font-black text-slate-900 dark:text-white mb-12 tracking-tight">
                                    {t('why_title')}
                                </h2>
                                <div className="space-y-8">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="flex items-start gap-6">
                                            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-white/5 flex items-center justify-center text-primary shadow-sm border border-slate-100 dark:border-white/10 flex-shrink-0">
                                                <span className="material-symbols-outlined font-black">arrow_forward</span>
                                            </div>
                                            <p className="text-xl font-bold text-slate-800 dark:text-slate-200 pt-2 leading-tight">
                                                {t(`why_item${i}` as any)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-gradient-brand p-12 rounded-[3rem] shadow-2xl text-white relative group overflow-hidden">
                                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="relative z-10">
                                    <div className="inline-block px-4 py-1.5 rounded-full bg-white/20 text-[0.7rem] font-black uppercase tracking-[0.2em] mb-6">Founder's Choice</div>
                                    <h3 className="text-4xl font-black mb-6 leading-tight italic">
                                        {t('early_title')}
                                    </h3>
                                    <p className="text-blue-100 text-lg font-medium mb-10 leading-relaxed">
                                        {t('early_desc')}
                                    </p>
                                    <div className="p-8 bg-white/10 rounded-[2rem] border border-white/20">
                                        <p className="text-sm font-bold mb-6 flex items-center gap-3">
                                            <span className="material-symbols-outlined">rocket_launch</span>
                                            {t('early_action')}
                                        </p>
                                        <button className="w-full py-5 bg-white text-primary font-black rounded-2xl text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-xl">
                                            {t('early_cta')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Team Section (Minds behind the Logic) */}
                <section className="max-w-7xl mx-auto px-4 mb-40">
                    <h2 className="text-sm font-black text-primary uppercase tracking-[0.4em] text-center mb-16">
                        {t('about_team_title')}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                        {team.map((member, idx) => (
                            <motion.div
                                key={member.name}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.2 }}
                                className="group bg-white dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 rounded-[3rem] p-10 hover:border-primary/30 transition-all duration-500"
                            >
                                <div className="flex flex-col md:flex-row gap-10 items-center md:items-start text-center md:text-left">
                                    <div className="w-40 h-40 rounded-[2.5rem] overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700 shadow-2xl flex-shrink-0">
                                        <img
                                            src={member.image}
                                            alt={member.name}
                                            className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-700"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1 tracking-tight">{member.name}</h3>
                                        <p className="text-primary font-black text-[0.6rem] uppercase tracking-[0.2em] mb-4">{member.role}</p>
                                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6 font-medium">
                                            {member.bio}
                                        </p>
                                        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                            {member.skills.map(skill => (
                                                <span key={skill} className="px-3 py-1 bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-white/10 rounded-full text-[0.65rem] font-black uppercase tracking-widest">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Philosophy Section (Pure Typography) */}
                <section className="max-w-7xl mx-auto px-4">
                    <div className="bg-slate-900 dark:bg-white/[0.02] rounded-[4rem] p-16 md:p-32 text-center relative overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]">
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-secondary/10 opacity-30"></div>
                        <div className="relative z-10">
                            <h2 className="text-sm font-black text-primary-light uppercase tracking-[0.5em] mb-12">
                                {t('about_philosophy_title')}
                            </h2>
                            <p className="text-3xl md:text-5xl font-bold text-white max-w-4xl mx-auto leading-[1.1] mb-20 tracking-tighter">
                                {t('about_philosophy_desc')}
                            </p>
                            <div className="flex flex-wrap justify-center gap-12 md:gap-24">
                                <div className="group">
                                    <div className="text-4xl font-black text-white/20 group-hover:text-white transition-colors duration-500 mb-2 tracking-tighter">DIRECTO</div>
                                    <div className="h-0.5 w-0 group-hover:w-full bg-primary transition-all duration-500 mx-auto"></div>
                                </div>
                                <div className="group">
                                    <div className="text-4xl font-black text-white/20 group-hover:text-white transition-colors duration-500 mb-2 tracking-tighter">CONCISO</div>
                                    <div className="h-0.5 w-0 group-hover:w-full bg-secondary transition-all duration-500 mx-auto"></div>
                                </div>
                                <div className="group">
                                    <div className="text-4xl font-black text-white/20 group-hover:text-white transition-colors duration-500 mb-2 tracking-tighter">HUMANO</div>
                                    <div className="h-0.5 w-0 group-hover:w-full bg-primary-light transition-all duration-500 mx-auto"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};
