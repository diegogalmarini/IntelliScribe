import React from 'react';
import { IntegrationState } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSelector } from '../components/LanguageSelector';
import { ThemeToggle } from '../components/ThemeToggle';

interface IntegrationsProps {
    integrations?: IntegrationState[];
    onToggle?: (id: string) => void;
}

export const Integrations: React.FC<IntegrationsProps> = ({ integrations = [], onToggle }) => {
    const { t } = useLanguage();

    return (
        <div className="flex flex-1 flex-col h-full overflow-hidden bg-background-light dark:bg-background-dark relative transition-colors duration-200">
            <header className="flex items-center justify-between border-b border-slate-200 dark:border-border-dark bg-white/80 dark:bg-[#111722]/80 backdrop-blur-md px-4 md:px-8 py-4 sticky top-0 z-20 transition-colors duration-200">
                <h2 className="text-slate-900 dark:text-white text-lg font-bold tracking-tight">{t('connectionCenter')}</h2>
                <div className="flex items-center gap-3">
                    <ThemeToggle />
                    <LanguageSelector />
                    <div className="relative group hidden sm:block">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-text-secondary">search</span>
                        <input className="bg-white dark:bg-card-dark border border-slate-300 dark:border-border-dark text-slate-900 dark:text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-48 md:w-64 pl-10 p-2.5 placeholder-slate-500 dark:placeholder-text-secondary transition-all" placeholder={t('searchPlaceholder')} type="text" />
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                <div className="mx-auto max-w-[1600px] flex flex-col gap-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div className="flex flex-col gap-2 max-w-2xl">
                            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">{t('integrations')} & AutoFlow</h1>
                            <p className="text-slate-500 dark:text-text-secondary text-sm md:text-base">{t('manageConnections')}</p>
                        </div>
                        <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-medium px-5 py-2.5 rounded-lg shadow-lg shadow-primary/20 transition-all active:scale-95">
                            <span className="material-symbols-outlined text-[20px]">add</span>
                            {t('newAutoFlow')}
                        </button>
                    </div>

                    {/* Integration Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {integrations.map((item, i) => (
                            <div key={i} className="group flex flex-col p-5 rounded-xl bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-3">
                                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full border ${item.connected ? 'bg-green-500/10 border-green-500/20' : 'bg-slate-200 dark:bg-gray-700/50 border-slate-300 dark:border-gray-600/30'}`}>
                                        <div className={`size-1.5 rounded-full ${item.connected ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                        <span className={`text-[10px] font-bold uppercase tracking-wide ${item.connected ? 'text-green-500' : 'text-gray-400'}`}>{item.connected ? t('connected') : t('disconnected')}</span>
                                    </div>
                                </div>
                                <div className="mb-4 size-12 rounded-lg bg-slate-100 dark:bg-white flex items-center justify-center p-2 text-black" style={{ backgroundColor: item.color === '#4A154B' ? '#4A154B' : 'white' }}>
                                    <span className={`material-symbols-outlined text-3xl ${item.color === '#4A154B' ? 'text-white' : 'text-black'}`}>{item.icon}</span>
                                </div>
                                <h4 className="text-slate-900 dark:text-white font-bold text-lg">{item.name}</h4>
                                <p className="text-slate-500 dark:text-text-secondary text-sm mt-1 mb-6 line-clamp-2">{item.description}</p>
                                <div className="mt-auto pt-4 border-t border-slate-200 dark:border-border-dark flex items-center justify-between">
                                    <button className="text-sm font-medium text-slate-500 dark:text-text-secondary hover:text-slate-900 dark:hover:text-white transition-colors">{item.connected ? t('configure') : t('connectAccount')}</button>
                                    <div className="form-control">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={item.connected}
                                                onChange={() => onToggle && onToggle(item.id)}
                                            />
                                            <div className="w-11 h-6 bg-slate-300 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};