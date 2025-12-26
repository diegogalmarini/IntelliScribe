import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { LanguageSelector } from '../components/LanguageSelector';

export const Manual: React.FC = () => {
    const { t } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');

    const helpCards = [
        { id: 'intro', title: t('man_intro_title'), desc: t('man_intro_body'), icon: 'rocket_launch', category: 'basics' },
        { id: 'recording', title: t('man_rec_title'), desc: t('man_rec_body'), icon: 'mic', category: 'recording' },
        { id: 'editor', title: t('man_edit_title'), desc: t('man_edit_body'), icon: 'edit_note', category: 'editing' },
        { id: 'integrations', title: t('man_int_title'), desc: t('man_int_body'), icon: 'hub', category: 'integrations' },
    ];

    const quickActions = [
        { title: t('manCardCalendar'), icon: 'calendar_month', action: () => alert('Coming Soon: Calendar Sync') },
        { title: t('manCardVerify'), icon: 'verified', action: () => window.location.href = '/settings' },
        { title: t('manCardExport'), icon: 'ios_share', action: () => alert('Export available in Editor') },
        { title: t('manCardPrivacy'), icon: 'lock', action: () => window.location.href = '/privacy' },
    ];

    const filteredCards = helpCards.filter(card =>
        (activeCategory === 'all' || card.category === activeCategory) &&
        (card.title.toLowerCase().includes(searchTerm.toLowerCase()) || card.desc.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const renderMarkdown = (text: string) => {
        // Simplified markdown renderer for short descriptions
        return text.split('\n').map((line, i) => {
            if (!line.trim()) return <div key={i} className="h-2"></div>;
            if (line.startsWith('**')) return <strong key={i} className="block text-slate-900 dark:text-white mt-2">{line.replace(/\*\*/g, '')}</strong>;
            if (line.startsWith('* ')) return <li key={i} className="ml-4 list-disc text-slate-600 dark:text-slate-400">{line.replace('* ', '')}</li>;
            return <p key={i} className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{line}</p>;
        });
    };

    return (
        <div className="flex flex-col h-screen bg-slate-50 dark:bg-background-dark transition-colors duration-200">
            {/* Header */}
            <header className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 bg-white dark:bg-background-dark px-6 py-4 sticky top-0 z-30">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg text-primary">
                        <span className="material-symbols-outlined">support_agent</span>
                    </div>
                    <h2 className="text-slate-900 dark:text-white text-lg font-bold">{t('help')}</h2>
                </div>
                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    <LanguageSelector />
                </div>
            </header>

            <div className="flex-1 overflow-y-auto">
                <div className="max-w-5xl mx-auto px-6 py-12">
                    {/* Hero Search */}
                    <div className="text-center mb-12">
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
                            {t('manSearchPlaceholder')}
                        </h1>
                        <div className="relative max-w-2xl mx-auto">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                            <input
                                type="text"
                                placeholder={t('searchPlaceholder')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white shadow-lg focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="mb-16">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-6">{t('manQuickActions')}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {quickActions.map((action, idx) => (
                                <button
                                    key={idx}
                                    onClick={action.action}
                                    className="flex flex-col items-center justify-center gap-3 p-6 bg-white dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5 hover:border-primary/50 hover:shadow-lg transition-all group"
                                >
                                    <div className="size-10 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                                        <span className="material-symbols-outlined">{action.icon}</span>
                                    </div>
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{action.title}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Knowledge Base Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredCards.map((card) => (
                            <div key={card.id} className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-8 hover:shadow-xl transition-all">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="size-12 rounded-xl bg-gradient-to-br from-primary/10 to-purple-500/10 flex items-center justify-center text-primary">
                                        <span className="material-symbols-outlined text-2xl">{card.icon}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{card.title}</h3>
                                </div>
                                <div className="prose prose-sm dark:prose-invert">
                                    {renderMarkdown(card.desc)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};