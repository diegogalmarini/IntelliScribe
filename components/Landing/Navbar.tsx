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
                            <button onClick={() => navigate('/comparar-planes')} className="text-[13px] font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">{t('nav_plans')}</button>
                            <button onClick={() => handleNavClick('faq')} className="text-[13px] font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">FAQ</button>
                            <button onClick={() => navigate('/blog')} className="text-[13px] font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">Blog</button>
                            <button onClick={() => navigate('/contact')} className="text-[13px] font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">{t('nav_contact')}</button>
                        </nav>

                        <div className="flex items-center gap-6 border-l border-slate-200 dark:border-white/10 pl-10">
                            {isAuthenticated ? (
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="flex items-center gap-3 pl-1 pr-4 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-all group border border-transparent hover:border-slate-200 dark:hover:border-white/10"
                                >
                                    <div className="h-9 w-9 shrink-0 rounded-full bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-slate-900 font-bold text-xs shadow-md overflow-hidden ring-2 ring-white dark:ring-black">
                                        {user.avatarUrl ? (
                                            <img
                                                src={user.avatarUrl}
                                                alt="User"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span>{user.firstName && user.firstName !== 'User' ? user.firstName[0] : ''}{user.lastName ? user.lastName[0] : ''}</span>
                                        )}
                                    </div>
                                    <div className="flex flex-col items-start">
                                        <p className="text-[13px] font-bold text-slate-900 dark:text-white leading-none mb-0.5">
                                            {user.firstName === 'User' ? 'Mi Cuenta' : `${user.firstName} ${user.lastName}`}
                                        </p>
                                        <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                                            <span className="text-[10px] font-bold uppercase tracking-wider">Ir al Dashboard</span>
                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="transform group-hover:translate-x-0.5 transition-transform">
                                                <path d="M5 12h14"></path>
                                                <path d="M12 5l7 7-7 7"></path>
                                            </svg>
                                        </div>
                                    </div>
                                </button>
                            ) : (
                                <>
                                    <button onClick={() => navigate('/login')} className="text-[13px] font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                                        Login
                                    </button>
                                    <button onClick={() => navigate('/login')} className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-[13px] font-semibold rounded-lg hover:shadow-lg dark:hover:bg-slate-200 transition-all active:scale-95 btn-owner">
                                        {t('navCtaFree')}
                                    </button>
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
            </nav >

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {
                    isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="fixed inset-0 z-40 bg-white dark:bg-background-dark pt-24 px-6 lg:hidden"
                        >
                            <div className="flex flex-col gap-6 text-center">
                                <button onClick={() => handleNavClick('solutions')} className="text-xl font-bold text-slate-900 dark:text-white py-2">{t('solSectionTag')}</button>
                                <button onClick={() => { setIsMenuOpen(false); navigate('/comparar-planes'); }} className="text-xl font-bold text-slate-900 dark:text-white py-2">{t('nav_plans')}</button>
                                <button onClick={() => handleNavClick('faq')} className="text-xl font-bold text-slate-900 dark:text-white py-2">FAQ</button>
                                <button onClick={() => { setIsMenuOpen(false); navigate('/contact'); }} className="text-xl font-bold text-slate-900 dark:text-white py-2">{t('nav_contact')}</button>

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
                                        <button onClick={() => { setIsMenuOpen(false); navigate('/login'); }} className="text-xl font-bold text-slate-900 dark:text-white py-2">Login</button>
                                        <button onClick={() => { setIsMenuOpen(false); navigate('/login'); }} className="px-6 py-4 bg-primary dark:bg-white text-white dark:text-slate-950 text-sm font-semibold rounded-xl mt-4">
                                            {t('navCtaFree')}
                                        </button>
                                    </>
                                )}

                                <div className="flex justify-center gap-6 mt-8">
                                    <LanguageSelector />
                                    <ThemeToggle />
                                </div>
                            </div>
                        </motion.div>
                    )
                }
            </AnimatePresence >
        </>
    );
};
