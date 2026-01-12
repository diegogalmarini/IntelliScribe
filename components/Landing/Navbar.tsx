import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { LanguageSelector } from '../LanguageSelector';
import { ThemeToggle } from '../ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { UserProfile } from '../../types';

export const Navbar: React.FC<{ user?: UserProfile }> = ({ user }) => {
    const { t } = useLanguage();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const isLanding = location.pathname === '/';
    const isAuthenticated = user && user.id && user.id !== '';

    const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('light');

    // Sync effective theme with DOM class to avoid hydration/CSS mismatch
    React.useEffect(() => {
        const updateTheme = () => {
            const isDark = document.documentElement.classList.contains('dark');
            setEffectiveTheme(isDark ? 'dark' : 'light');
        };

        // Initial check
        updateTheme();

        // Observer to catch system/manual changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    updateTheme();
                }
            });
        });

        observer.observe(document.documentElement, { attributes: true });
        return () => observer.disconnect();
    }, []);

    const handleNavClick = (sectionId: string) => {
        setIsMenuOpen(false);
        if (isLanding) {
            const element = document.getElementById(sectionId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            navigate('/#' + sectionId);
            window.location.href = '/#' + sectionId;
        }
    };

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 h-20 transition-all">
                <div className="max-w-[1400px] mx-auto px-6 h-full flex justify-between items-center">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                        {effectiveTheme === 'dark' ? (
                            <img src="/logo-diktalo-b.svg" alt="Diktalo Logo" className="h-8 w-auto transition-all" />
                        ) : (
                            <img src="/logo-diktalo.svg" alt="Diktalo Logo" className="h-8 w-auto transition-all" />
                        )}
                    </div>

                    {/* Desktop Nav */}
                    <div className="hidden lg:flex items-center gap-12">
                        <nav className="flex items-center gap-10">
                            <button onClick={() => handleNavClick('solutions')} className="text-[13px] font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">{t('nav_solutions')}</button>
                            <button onClick={() => handleNavClick('pricing')} className="text-[13px] font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">{t('nav_plans')}</button>
                            <button onClick={() => handleNavClick('faq')} className="text-[13px] font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">FAQ</button>
                            <button onClick={() => handleNavClick('blog')} className="text-[13px] font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">Blog</button>
                            <a href="mailto:hello@diktalo.com" className="text-[13px] font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">{t('nav_contact')}</a>
                        </nav>

                        <div className="flex items-center gap-6 border-l border-slate-200 dark:border-white/10 pl-10">
                            {isAuthenticated ? (
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="flex items-center gap-3 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-all group"
                                    title="Go to Dashboard"
                                >
                                    <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-brand flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-primary/20 overflow-hidden ring-2 ring-transparent group-hover:ring-primary/30 transition-all">
                                        {user.avatarUrl ? (
                                            <img
                                                src={user.avatarUrl}
                                                alt="User"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span>{user.firstName[0]}{user.lastName[0]}</span>
                                        )}
                                    </div>
                                    <div className="flex flex-col items-start pr-2">
                                        <p className="text-[12px] font-bold text-slate-900 dark:text-white leading-none mb-1">{user.firstName} {user.lastName}</p>
                                        <p className="text-[10px] text-primary font-bold uppercase tracking-wider leading-none">Dashboard</p>
                                    </div>
                                </button>
                            ) : (
                                <>
                                    <a href="/login" className="text-[13px] font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                                        Login
                                    </a>
                                    <a href="/login" className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-[13px] font-semibold rounded-lg hover:shadow-lg dark:hover:bg-slate-200 transition-all active:scale-95 btn-owner">
                                        {t('navCtaFree')}
                                    </a>
                                </>
                            )}
                            <div className="flex items-center gap-3 pl-2">
                                <LanguageSelector />
                                <ThemeToggle />
                            </div>
                        </div>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <div className="lg:hidden flex items-center gap-4">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors"
                        >
                            <span className="material-symbols-outlined">{isMenuOpen ? 'close' : 'menu'}</span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-0 z-40 bg-white dark:bg-background-dark pt-24 px-6 lg:hidden"
                    >
                        <div className="flex flex-col gap-6 text-center">
                            <button onClick={() => handleNavClick('solutions')} className="text-xl font-bold text-slate-900 dark:text-white py-2">{t('solSectionTag')}</button>
                            <button onClick={() => handleNavClick('pricing')} className="text-xl font-bold text-slate-900 dark:text-white py-2">{t('nav_plans')}</button>
                            <button onClick={() => handleNavClick('faq')} className="text-xl font-bold text-slate-900 dark:text-white py-2">FAQ</button>

                            {isAuthenticated ? (
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="flex flex-col items-center gap-3 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10"
                                >
                                    <div className="h-16 w-16 rounded-full bg-gradient-brand flex items-center justify-center text-white font-bold text-xl shadow-xl overflow-hidden">
                                        {user.avatarUrl ? (
                                            <img src={user.avatarUrl} alt="User" className="w-full h-full object-cover" />
                                        ) : (
                                            <span>{user.firstName[0]}{user.lastName[0]}</span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-white">{user.firstName} {user.lastName}</p>
                                        <p className="text-sm text-primary font-bold">Ir al Dashboard</p>
                                    </div>
                                </button>
                            ) : (
                                <>
                                    <a href="/login" className="text-xl font-bold text-slate-900 dark:text-white py-2">Login</a>
                                    <a href="/login" className="px-6 py-4 bg-primary dark:bg-white text-white dark:text-slate-950 text-sm font-semibold rounded-xl mt-4">
                                        {t('navCtaFree')}
                                    </a>
                                </>
                            )}

                            <div className="flex justify-center gap-6 mt-8">
                                <LanguageSelector />
                                <ThemeToggle />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
