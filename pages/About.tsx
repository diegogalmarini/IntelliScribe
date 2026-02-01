import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { Navbar } from '../components/Landing/Navbar';
import { Footer } from '../components/Footer';
import { UserProfile } from '../types';
import { PERSONALITIES } from '../utils/supportPersonalities';

export const About: React.FC<{ user?: UserProfile }> = ({ user }) => {
    const { t, language } = useLanguage();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const coreTeam = [
        {
            name: "Nati Pol",
            role: t('about_nati_role'),
            bio: t('about_nati_bio'),
            image: "/images/avatars/nati-pol.webp",
            skills: ["Human Centric", "Experience", "UX Architecture"]
        },
        {
            name: "Leo Costa",
            role: t('about_partner_role'),
            bio: t('about_partner_bio'),
            image: "/images/avatars/leo-costa.webp",
            skills: ["AI Engineering", "Architecture", "Strategic Intelligence"]
        },
        {
            name: "Anya Desai",
            role: "ARQUITECTA DE SISTEMAS ESTRATÉGICOS",
            bio: "Ingeniera de software de alto impacto con sede en San Francisco. Especialista en sistemas globales de alta fidelidad y optimización de la experiencia del usuario. Anya es la arquitecta detrás de la fluidez de Diktalo, asegurando que cada interacción se procese con precisión inmediata. En su tiempo libre, es una apasionada de la robótica y el senderismo por los parques nacionales de California.",
            image: "/images/avatars/anya-desai.webp",
            skills: ["Sistemas Globales", "Experiencia de Usuario", "Dinámica de Voz"]
        },
        {
            name: "Rohan Patel",
            role: "LÍDER DE ESTRATEGIA TÉCNICA",
            bio: "Experto en integridad de información y sistemas de alta disponibilidad radicado en Silicon Valley. Con más de una década gestionando entornos críticos para organizaciones de crecimiento explosivo, Rohan garantiza que la base de Diktalo sea sólida y respetuosa con la privacidad. Especialista en seguridad de grado bancario y soberanía de datos. Fuera de su labor profesional, Rohan es un entusiasta del ajedrez estratégico y la música ambiental.",
            image: "/images/avatars/rohan-patel.webp",
            skills: ["Topología Segura", "Soberanía de Datos", "Alta Disponibilidad"]
        }
    ];

    const supportTeam = [
        {
            id: 'elena_v',
            name: "Elena Valderrama",
            role: "CUSTOMER SUCCESS",
            avatar: "/images/avatars/elena.webp",
            city: "MADRID",
            languages: ["Español", "Inglés"],
            bio: {
                es: "Especialista en Éxito del Cliente comprometida con un onboarding fluido y personalizado. Mi misión es que cada usuario domine Diktalo desde el primer minuto. Ofrezco soporte bilingüe experto en español e inglés.",
                en: "Customer Success specialist committed to seamless and personalized onboarding. My mission is for every user to master Diktalo from the first minute. I offer expert bilingual support in Spanish and English."
            }
        },
        {
            id: 'sophie_l',
            name: "Sophie Lefebvre",
            role: "AI ETHICS & COMPLIANCE",
            avatar: "/images/avatars/sophie.webp",
            city: "PARIS",
            languages: ["Francés", "Inglés", "Español"],
            bio: {
                es: "Experta en ética empresarial y cumplimiento estricto de la privacidad de datos. Superviso que cada interacción en Diktalo respete los más altos estándares de seguridad. Especialista multilingüe enfocada en el impacto positivo de la tecnología.",
                en: "Expert in business ethics and strict data privacy compliance. I oversee that every interaction in Diktalo respects the highest security standards. Multilingual specialist focused on the positive impact of technology."
            }
        },
        {
            id: 'klaus_m',
            name: "Klaus Müller",
            role: "SYSTEMS ARCHITECT",
            avatar: "/images/avatars/klaus.webp",
            city: "ZURICH",
            languages: ["Alemán", "Inglés", "Español"],
            bio: {
                es: "Arquitecto de Sistemas senior con un enfoque láser en el rendimiento y la fiabilidad de la plataforma. Trabajo para que la infraestructura de Diktalo sea invisible pero invencible. Aporto precisión de ingeniería suiza al proyecto.",
                en: "Senior Systems Architect with a laser focus on platform performance and reliability. I work so that Diktalo's infrastructure is invisible yet invincible. I bring Swiss engineering precision to the project."
            }
        },
        {
            id: 'isabella_r',
            name: "Isabella Ricci",
            role: "ENTERPRISE STRATEGY",
            avatar: "/images/avatars/isabella.webp",
            city: "ROME",
            languages: ["Italiano", "Inglés", "Español"],
            bio: {
                es: "Especialista en relaciones corporativas internacionales, impulsando alianzas estratégicas globales para Diktalo. Facilito la expansión de nuestra red empresarial con un enfoque humano y táctico en mercados europeos.",
                en: "International enterprise relations specialist, driving global strategic partnerships for Diktalo. I facilitate the expansion of our business network with a human and tactical focus in European markets."
            }
        },
        {
            id: 'victoria_w',
            name: "Victoria Wright",
            role: "OPERATIONS HEAD",
            avatar: "/images/avatars/victoria.webp",
            city: "LONDON",
            languages: ["Inglés", "Español"],
            bio: {
                es: "Líder de operaciones centrada en la optimización del flujo de trabajo empresarial y la eficiencia operativa. Mi objetivo es que Diktalo se integre perfectamente en la rutina de cualquier profesional moderno con soporte técnico avanzado.",
                en: "Operations lead focused on optimizing business workflow and operational efficiency. My goal is for Diktalo to integrate perfectly into any modern professional's routine with advanced technical support."
            }
        },
        {
            id: 'alexander_p',
            name: "Alexander Pfeiffer",
            role: "PROTECCIÓN DE DATOS",
            avatar: "/images/avatars/alexander.webp",
            city: "BERLIN",
            languages: ["Alemán", "Español", "Inglés"],
            bio: {
                es: "Especialista en seguridad de la información, encargado de proteger cada detalle de la comunicación capturada. Mi prioridad absoluta es la integridad de tus datos y la soberanía de tu información confidencial.",
                en: "Information security specialist, responsible for protecting every detail of the captured communication. My absolute priority is data integrity and information sovereignty of your confidential information."
            }
        },
        {
            id: 'camila_s',
            name: "Camila Soler",
            role: "PRODUCT SPECIALIST",
            avatar: "/images/avatars/camila.webp",
            city: "BUENOS AIRES",
            languages: ["Español", "Inglés", "Portugués"],
            bio: {
                es: "Especialista de producto uniendo las necesidades operativas del usuario con las fronteras de la inteligencia artificial. Diseño soluciones que transforman la voz en progreso real y sostenible para el usuario final.",
                en: "Product specialist bridging operational user needs with the frontiers of artificial intelligence. I design solutions that transform voice into real and sustainable progress for the end user."
            }
        }
    ];

    return (
        <div className="landing-page bg-white dark:bg-[#0b0f17] min-h-screen font-sans transition-colors duration-300 overflow-x-hidden">
            <Navbar user={user} />

            <main className="pt-32 pb-40">
                {/* 1. Deep Narrative Section */}
                <section className="max-w-4xl mx-auto px-6 mb-32">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="text-primary font-black text-[0.7rem] uppercase tracking-[0.4em] block mb-8">
                            {t('about_story_label')}
                        </span>
                        <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white mb-12 tracking-tighter leading-[0.9]">
                            {t('about_story_title')}
                        </h1>
                        <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 leading-relaxed font-medium mb-16 max-w-4xl">
                            {t('about_story_desc')}
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mt-20">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                        >
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
                                {t('about_vision_title')}
                            </h2>
                            <p className="text-base md:text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
                                {t('about_vision_desc')}
                            </p>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 }}
                        >
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
                                {t('about_philosophy_title')}
                            </h2>
                            <p className="text-base md:text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
                                {t('about_philosophy_desc')}
                            </p>
                        </motion.div>
                    </div>
                </section>

                <section className="max-w-7xl mx-auto px-6 mb-32">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative aspect-video max-w-5xl mx-auto bg-slate-50 dark:bg-white/[0.02] rounded-[3rem] overflow-hidden border border-slate-100 dark:border-white/5 grayscale hover:grayscale-0 transition-all duration-1000 shadow-2xl"
                    >
                        <img
                            src="/images/avatars/team.webp"
                            alt="Diktalo Team"
                            className="w-full h-full object-cover"
                        />
                    </motion.div>
                </section>

                {/* 3. Team Title & Core Architects */}
                <section className="max-w-6xl mx-auto px-6 mb-32">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-4 italic">
                            Arquitectos de tu Memoria Digital<span className="text-primary truncate">.</span>
                        </h2>
                        <div className="h-[2px] w-24 bg-primary mx-auto opacity-20"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {coreTeam.map((member, idx) => (
                            <motion.div
                                key={member.name}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.2 }}
                                className="group"
                            >
                                <div className="bg-slate-50 dark:bg-white/[0.02] rounded-[3rem] p-10 md:p-14 border border-slate-100 dark:border-white/5 h-full transition-all duration-500 hover:bg-white dark:hover:bg-[#161b26] hover:shadow-2xl">
                                    <div className="w-40 h-40 rounded-[2rem] overflow-hidden mb-10 grayscale group-hover:grayscale-0 transition-all duration-700 shadow-xl mx-auto lg:mx-0">
                                        <img src={member.image} alt={member.name} className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-1000" />
                                    </div>
                                    <div className="space-y-4">
                                        <div className="text-center lg:text-left pt-1.5">
                                            <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-1">{member.name}</h3>
                                            <p className="text-[0.65rem] text-primary font-black uppercase tracking-[0.25em]">{member.role}</p>
                                        </div>
                                        <div className="h-px w-full bg-slate-100 dark:bg-white/5 !mt-6 !mb-6"></div>
                                        <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                                            {member.bio}
                                        </p>
                                        <div className="flex flex-wrap gap-2 pt-6 justify-center lg:justify-start">
                                            {member.skills.map(skill => (
                                                <span key={skill} className="px-4 py-2 bg-white dark:bg-white/5 text-[0.65rem] font-black uppercase tracking-widest text-slate-400 rounded-full border border-slate-100 dark:border-white/10 shadow-sm">
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

                {/* 4. Global Support (The Specialists) */}
                <section className="max-w-7xl mx-auto px-6 mb-32">
                    <div className="text-center mb-16">
                        <h3 className="text-[0.8rem] font-black text-slate-400 uppercase tracking-[0.4em] mb-4">
                            SOPORTE GLOBAL Y ESPECIALIZADO
                        </h3>
                        <div className="h-px w-12 bg-slate-200 mx-auto opacity-50"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {supportTeam.map((persona, idx) => {
                            const bioContent = persona.bio;
                            return (
                                <motion.div
                                    key={persona.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="group"
                                >
                                    <div className="bg-slate-50 dark:bg-white/[0.02] p-10 rounded-[2.5rem] border border-slate-100 dark:border-white/5 hover:bg-white dark:hover:bg-[#161b26] hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                                        <div className="w-32 h-32 rounded-[1.5rem] overflow-hidden mb-8 grayscale group-hover:grayscale-0 transition-all duration-700 shadow-lg mx-auto">
                                            <img src={persona.avatar} alt={persona.name} className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-1000" />
                                        </div>

                                        <div className="text-center pt-1.5 mb-6">
                                            <h4 className="font-black text-slate-900 dark:text-white text-xl tracking-tight mb-1">{(persona as any).name_full || persona.name}</h4>
                                            <p className="text-[0.65rem] text-primary font-black uppercase tracking-[0.2em] leading-tight opacity-90">{persona.role}</p>
                                        </div>

                                        <div className="h-px w-full bg-slate-200 dark:bg-white/5 mb-6"></div>

                                        <p className="text-[0.85rem] text-slate-600 dark:text-slate-400 leading-relaxed font-medium mb-8 flex-grow">
                                            {language === 'es' ? (bioContent as any).es : (bioContent as any).en}
                                        </p>

                                        <div className="pt-6 border-t border-slate-200 dark:border-white/5">
                                            <div className="flex flex-wrap gap-2 justify-center mb-4">
                                                {persona.languages.map(lang => (
                                                    <span key={lang} className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest bg-white dark:bg-white/5 px-3 py-1.5 rounded-full border border-slate-100 dark:border-white/10 shadow-sm">
                                                        {lang}
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="flex items-center justify-center gap-2 text-slate-400">
                                                <span className="material-symbols-outlined text-[1rem]">location_on</span>
                                                <span className="text-[0.6rem] font-black uppercase tracking-widest">{persona.city}</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </section>

                {/* 5. AEO Mission (Spacious final emphasis) */}
                <section className="max-w-5xl mx-auto px-6 mb-32">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="bg-slate-900 dark:bg-white/[0.03] border border-slate-800 dark:border-white/5 rounded-[4rem] p-16 md:p-24 text-center shadow-3xl relative overflow-hidden"
                    >
                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary via-transparent to-transparent"></div>
                        <div className="relative z-10">
                            <h2 className="text-4xl md:text-5xl font-black text-white mb-10 tracking-tighter leading-none italic text-glow-primary">
                                {t('about_aeo_title')}<span className="text-primary truncate">.</span>
                            </h2>
                            <p className="text-xl md:text-2xl text-slate-400 leading-relaxed font-medium max-w-3xl mx-auto">
                                {t('about_aeo_desc')}
                            </p>
                        </div>
                    </motion.div>
                </section>

                {/* 6. Roadmap 2026 */}
                <section className="max-w-7xl mx-auto px-6 mb-32">
                    <div className="text-center mb-16">
                        <h2 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter mb-6 italic">
                            {t('roadmap_title')}
                        </h2>
                        <div className="h-[2px] w-32 bg-primary mx-auto opacity-20 mb-6"></div>
                        <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
                            {t('roadmap_subtitle')}
                        </p>
                    </div>

                    <div className="max-w-5xl mx-auto relative mt-16">
                        {/* Central Line */}
                        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-200 dark:bg-white/10 hidden md:block" />

                        <div className="space-y-12 md:space-y-16">
                            {[
                                {
                                    q: t('roadmap_q1_date'),
                                    title: t('roadmap_q1_title'),
                                    desc: t('roadmap_q1_desc'),
                                    status: t('roadmap_status_progress'),
                                    color: 'bg-blue-500',
                                    active: true
                                },
                                {
                                    q: t('roadmap_q2_date'),
                                    title: t('roadmap_q2_title'),
                                    desc: t('roadmap_q2_desc'),
                                    status: t('roadmap_status_upcoming'),
                                    color: 'bg-slate-400',
                                    active: false
                                },
                                {
                                    q: t('roadmap_q3_date'),
                                    title: t('roadmap_q3_title'),
                                    desc: t('roadmap_q3_desc'),
                                    status: t('roadmap_status_upcoming'),
                                    color: 'bg-slate-400',
                                    active: false
                                },
                                {
                                    q: t('roadmap_q4_date'),
                                    title: t('roadmap_q4_title'),
                                    desc: t('roadmap_q4_desc'),
                                    status: t('roadmap_status_upcoming'),
                                    color: 'bg-slate-400',
                                    active: false
                                },
                            ].map((item, idx) => (
                                <motion.div
                                    key={item.q}
                                    initial={{ opacity: 0, x: idx % 2 === 0 ? -40 : 40 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 0.7, ease: "easeOut" }}
                                    className={`relative flex flex-col md:flex-row items-center gap-8 ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                                        }`}
                                >
                                    {/* Content Card */}
                                    <div className={`w-full md:w-1/2 ${idx % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                                        <div className={`p-8 rounded-[2.5rem] border transition-all duration-700 group hover:shadow-2xl ${item.active
                                            ? 'bg-white dark:bg-white/[0.04] border-slate-100 dark:border-white/10'
                                            : 'bg-slate-50/50 dark:bg-white/[0.01] border-slate-50 dark:border-white/5 opacity-60'
                                            }`}>
                                            <div className={`flex items-center gap-4 mb-4 ${idx % 2 === 0 ? 'md:flex-row-reverse' : 'md:flex-row'}`}>
                                                <div className="px-4 py-1 bg-slate-100 dark:bg-white/10 rounded-full border border-slate-200/50 dark:border-white/10">
                                                    <span className="text-[0.65rem] font-black uppercase tracking-[0.25em] text-primary">
                                                        {item.q}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 dark:bg-black/20 rounded-full border border-slate-100 dark:border-white/5">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${item.color} ${item.status === t('roadmap_status_progress') ? 'animate-pulse' : ''}`}></div>
                                                    <span className="text-[0.55rem] font-black uppercase tracking-widest text-slate-400">
                                                        {item.status}
                                                    </span>
                                                </div>
                                            </div>

                                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter group-hover:text-primary transition-colors">
                                                {item.title}
                                            </h3>

                                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                                                {item.desc}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Center Node */}
                                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center justify-center z-10">
                                        <div className={`w-6 h-6 rounded-full bg-white dark:bg-[#0b0f17] border-4 transition-colors duration-500 ${item.active ? 'border-primary' : 'border-slate-300 dark:border-white/10'
                                            }`} />
                                        {item.status === t('roadmap_status_progress') && (
                                            <div className="absolute w-12 h-12 bg-primary/20 rounded-full blur-md animate-pulse" />
                                        )}
                                    </div>

                                    {/* Spacer for empty side */}
                                    <div className="hidden md:block md:w-1/2" />
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mt-40 p-12 md:p-16 bg-slate-50 dark:bg-white/[0.02] rounded-[4rem] border border-dashed border-slate-200 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-12"
                    >
                        <div className="text-center md:text-left max-w-2xl">
                            <h4 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight italic">{t('roadmap_suggest_title')}</h4>
                            <p className="text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{t('roadmap_suggest_desc')}</p>
                        </div>
                        <button className="whitespace-nowrap px-10 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[0.8rem] font-black uppercase tracking-[0.3em] rounded-[2rem] hover:scale-105 transition-transform active:scale-95 shadow-2xl shadow-primary/10">
                            {t('roadmap_suggest_cta')}
                        </button>
                    </motion.div>
                </section>
            </main>

            <Footer />
        </div>
    );
};
