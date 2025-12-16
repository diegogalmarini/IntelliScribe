import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { LanguageSelector } from '../components/LanguageSelector';

export const Manual: React.FC = () => {
  const { t } = useLanguage();
  const [activeSection, setActiveSection] = useState('intro');

  const sections = [
      { id: 'intro', title: t('man_intro_title'), content: t('man_intro_body'), icon: 'rocket_launch' },
      { id: 'recording', title: t('man_rec_title'), content: t('man_rec_body'), icon: 'mic' },
      { id: 'editor', title: t('man_edit_title'), content: t('man_edit_body'), icon: 'edit_note' },
      { id: 'integrations', title: t('man_int_title'), content: t('man_int_body'), icon: 'hub' },
  ];

  const renderContent = (text: string) => {
      // Improved Markdown-ish renderer
      return text.split('\n').map((line, i) => {
          if (line.startsWith('**')) {
              // Bold Headers inline: "**Header:** Content"
              const parts = line.split('**');
              if (parts.length >= 3) {
                  return (
                      <p key={i} className="mb-3 text-slate-700 dark:text-slate-200">
                          <strong className="text-slate-900 dark:text-white font-bold text-lg block mb-1">{parts[1]}</strong>
                          <span className="leading-relaxed">{parts[2]}</span>
                      </p>
                  );
              }
          }
          if (line.trim().startsWith('* ')) {
              // Bullet points
              return (
                  <div key={i} className="flex gap-3 mb-2 ml-2 items-start">
                      <div className="size-1.5 rounded-full bg-primary mt-2 shrink-0"></div>
                      <span className="text-slate-600 dark:text-slate-300 leading-relaxed">{line.replace('* ', '')}</span>
                  </div>
              );
          }
          if (!line.trim()) return <div key={i} className="h-4"></div>;
          
          return <p key={i} className="mb-3 text-slate-600 dark:text-slate-300 leading-relaxed">{line}</p>;
      });
  };

  const scrollToSection = (id: string) => {
      setActiveSection(id);
      const element = document.getElementById(id);
      if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-background-light dark:bg-background-dark overflow-hidden transition-colors duration-200">
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-border-dark bg-white dark:bg-[#111722] px-4 md:px-10 py-3 transition-colors duration-200 sticky top-0 z-30">
            <div className="flex items-center gap-3">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg text-purple-600 dark:text-purple-400">
                    <span className="material-symbols-outlined">library_books</span>
                </div>
                <h2 className="text-slate-900 dark:text-white text-lg font-bold">{t('help')}</h2>
            </div>
            <div className="flex items-center gap-4">
                <ThemeToggle />
                <LanguageSelector />
            </div>
        </header>

        <div className="flex-1 overflow-hidden flex relative">
            
            {/* Sidebar Navigation (Desktop) */}
            <aside className="hidden lg:block w-64 border-r border-slate-200 dark:border-border-dark bg-white dark:bg-[#111722] overflow-y-auto p-6 shrink-0">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">{t('manualQuickLinks')}</h3>
                <nav className="flex flex-col gap-1">
                    {sections.map(section => (
                        <button
                            key={section.id}
                            onClick={() => scrollToSection(section.id)}
                            className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-3 ${activeSection === section.id ? 'bg-primary/10 text-primary' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'}`}
                        >
                            <span className="material-symbols-outlined text-lg opacity-70">{section.icon}</span>
                            {section.title}
                        </button>
                    ))}
                </nav>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto p-6 md:p-12 scroll-smooth" id="manual-content">
                <div className="max-w-3xl mx-auto flex flex-col gap-12 pb-24">
                    
                    {/* Hero Header */}
                    <div className="text-left pb-6 border-b border-slate-200 dark:border-border-dark">
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">{t('manualTitle')}</h1>
                        <p className="text-xl text-slate-500 dark:text-text-secondary leading-relaxed">{t('manualSubtitle')}</p>
                    </div>

                    {/* Content Sections */}
                    <div className="flex flex-col gap-16">
                        {sections.map((section) => (
                            <div key={section.id} id={section.id} className="scroll-mt-24 group">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="size-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                                        <span className="material-symbols-outlined text-2xl">{section.icon}</span>
                                    </div>
                                    <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">{section.title}</h3>
                                </div>
                                
                                <div className="bg-white dark:bg-[#1e2736] border border-slate-200 dark:border-border-dark rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="prose prose-slate dark:prose-invert max-w-none">
                                        {renderContent(section.content)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer Help Box (Translated) */}
                    <div className="mt-8 bg-gradient-to-br from-[#1e2736] to-[#111722] rounded-3xl p-1 text-center border border-slate-200 dark:border-border-dark shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="bg-white dark:bg-[#161d2a] rounded-[22px] p-8 md:p-12 relative z-10 h-full flex flex-col items-center justify-center gap-4">
                            <div className="size-16 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2">
                                <span className="material-symbols-outlined text-3xl">support_agent</span>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{t('manualHelpTitle')}</h3>
                            <p className="text-slate-600 dark:text-slate-300 max-w-md mx-auto">{t('manualHelpDesc')}</p>
                            <button className="mt-4 px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all">
                                {t('contactSales')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};