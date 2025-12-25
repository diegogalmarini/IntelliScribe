import React from 'react';
import { motion } from 'framer-motion';

export const Demo: React.FC = () => {
    return (
        <section className="py-32 bg-white dark:bg-background-dark transition-colors duration-200 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex flex-col lg:flex-row items-center gap-16">
                    <div className="flex-1 text-left">
                        <motion.h2
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="text-3xl md:text-4xl font-display font-black text-slate-900 dark:text-white mb-8 tracking-tight leading-tight uppercase"
                        >
                            Powerful <span className="text-brand-green">Insights</span> from Every Word
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-base md:text-lg text-slate-500 dark:text-slate-400 mb-8 leading-relaxed font-medium"
                        >
                            Our wave-analysis engine processes audio in real-time, identifying speakers, sentiment, and key topics. See Diktalo in action.
                        </motion.p>

                        <div className="space-y-6">
                            {[
                                { icon: "lyrics", text: "High-fidelity transcription" },
                                { icon: "history_edu", text: "AI-generated executive summaries" },
                                { icon: "inventory_2", text: "Instant cloud archiving" }
                            ].map((item, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.2 + idx * 0.1 }}
                                    className="flex items-center gap-4 text-slate-700 dark:text-slate-200 font-bold italic"
                                >
                                    <span className="material-symbols-outlined text-brand-green">{item.icon}</span>
                                    {item.text}
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 w-full relative">
                        {/* Mock App Interface */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, rotateY: 20 }}
                            whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
                            viewport={{ once: true }}
                            className="relative bg-slate-900 rounded-[2rem] p-4 shadow-2xl border border-white/10"
                        >
                            <div className="bg-background-dark rounded-2xl overflow-hidden border border-white/5 aspect-video flex flex-col p-6">
                                <div className="flex justify-between items-center mb-8">
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                    </div>
                                    <div className="px-3 py-1 bg-white/5 rounded-lg text-[10px] text-white/50 font-mono">REC-50239-X</div>
                                </div>

                                <div className="flex-1 flex flex-col justify-center">
                                    {/* Waveform Visualization */}
                                    <div className="flex items-center justify-center gap-1.5 h-16 mb-8">
                                        {[20, 40, 60, 80, 50, 90, 40, 30, 70, 40, 20, 50, 80, 60, 40].map((h, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ height: 4 }}
                                                animate={{ height: [`${h}%`, `${h * 0.5}%`, `${h}%`] }}
                                                transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.1 }}
                                                className="w-2 rounded-full bg-gradient-to-t from-primary to-brand-green opacity-80"
                                            ></motion.div>
                                        ))}
                                    </div>

                                    <div className="space-y-3">
                                        <div className="w-3/4 h-2 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                whileInView={{ width: '85%' }}
                                                viewport={{ once: true }}
                                                className="h-full bg-primary"
                                            ></motion.div>
                                        </div>
                                        <div className="w-full h-2 bg-white/5 rounded-full"></div>
                                        <div className="w-1/2 h-2 bg-white/5 rounded-full"></div>
                                    </div>
                                </div>

                                <div className="mt-auto flex justify-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                        <span className="material-symbols-outlined">pause</span>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white">
                                        <span className="material-symbols-outlined">stop</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Floating elements */}
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 4 }}
                            className="absolute -top-6 -right-6 bg-brand-violet p-4 rounded-2xl shadow-xl text-white font-bold text-xs"
                        >
                            AI Analysis: Active
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};
