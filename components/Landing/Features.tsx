import React from 'react';
import { motion } from 'framer-motion';

const features = [
    {
        title: "Voice Intelligence",
        description: "Capture every detail of your calls and meetings with cristal clear recordings and high-accuracy transcripts.",
        icon: "mic_none",
        color: "brand-blue"
    },
    {
        title: "57+ Languages",
        description: "Speak your language. Our AI understands and transcribes in over 57 languages with perfect context awareness.",
        icon: "language",
        color: "brand-violet"
    },
    {
        title: "AI Summaries",
        description: "Transform 1-hour meetings into actionable 3-minute summaries. Never miss a point or follow-up task again.",
        icon: "auto_awesome",
        color: "brand-green"
    },
    {
        title: "VoIP Integration",
        description: "Call worldwide from Zone 1. Verification of IDs and seamless cloud calling directly from your dashboard.",
        icon: "call",
        color: "brand-blue"
    },
    {
        title: "Secure Storage",
        description: "Your recordings are encrypted and stored safely. Access them anytime, from any device, with full privacy.",
        icon: "lock",
        color: "brand-violet"
    },
    {
        title: "Easy Export",
        description: "Export your notes, transcripts, and summaries to PDF or plain text with one click. Share with your team instantly.",
        icon: "ios_share",
        color: "brand-green"
    }
];

export const Features: React.FC = () => {
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    return (
        <section id="features" className="py-24 bg-white dark:bg-background-dark transition-colors duration-200">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-20">
                    <h2 className="text-4xl md:text-5xl font-display font-black text-slate-900 dark:text-white mb-6 tracking-tight">
                        Powering Your <span className="text-primary">Communication</span>
                    </h2>
                    <p className="text-slate-500 dark:text-text-secondary max-w-2xl mx-auto text-lg">
                        Everything you need to automate your note-taking and focus on what really matters: your business.
                    </p>
                </div>

                <motion.div
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {features.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            variants={item}
                            whileHover={{ y: -5 }}
                            className="bg-background-light dark:bg-surface-dark p-8 rounded-3xl border border-slate-200 dark:border-border-dark hover:border-primary/30 transition-all duration-300"
                        >
                            <div className={`w-14 h-14 rounded-2xl bg-${feature.color}/10 flex items-center justify-center mb-6`}>
                                <span className={`material-symbols-outlined text-3xl text-${feature.color}`}>
                                    {feature.icon}
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 italic">
                                {feature.title}
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};
