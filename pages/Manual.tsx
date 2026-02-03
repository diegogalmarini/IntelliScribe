import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from '../components/Landing/Navbar';
import { Footer } from '../components/Footer';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { motion, AnimatePresence } from 'framer-motion';
import './Manual.css';
import { SupportBot } from '../components/SupportBot/SupportBot';
import { useLanguage } from '../contexts/LanguageContext';

interface ManualSection {
    id: string;
    translationKeyTitle: string;
    translationKeyDesc: string;
    translationKeyCategory: string;
    path: string; // Base filename only, lang prefix added dynamically
    icon: string;
}

// Static definition of structure, content is dynamic
const SECTION_DEFINITIONS: ManualSection[] = [
    {
        id: 'crear-cuenta',
        translationKeyTitle: 'manual_create_account_title',
        translationKeyDesc: 'manual_create_account_desc',
        translationKeyCategory: 'cat_getting_started',
        path: '01_primeros_pasos/crear_cuenta.md',
        icon: 'account_circle',
    },
    {
        id: 'grabadora-audio',
        translationKeyTitle: 'manual_audio_recorder_title',
        translationKeyDesc: 'manual_audio_recorder_desc',
        translationKeyCategory: 'cat_recording',
        path: '02_metodos_grabacion/grabadora_audio.md',
        icon: 'mic',
    },
    {
        id: 'grabadora-web',
        translationKeyTitle: 'manual_web_recorder_title',
        translationKeyDesc: 'manual_web_recorder_desc',
        translationKeyCategory: 'cat_recording',
        path: '02_metodos_grabacion/grabadora_web.md',
        icon: 'extension',
    },
    {
        id: 'subir-archivos',
        translationKeyTitle: 'manual_upload_files_title',
        translationKeyDesc: 'manual_upload_files_desc',
        translationKeyCategory: 'cat_recording',
        path: '02_metodos_grabacion/subir_archivos.md',
        icon: 'upload_file',
    },
    {
        id: 'multi-audio',
        translationKeyTitle: 'manual_multi_audio_title',
        translationKeyDesc: 'manual_multi_audio_desc',
        translationKeyCategory: 'cat_recording',
        path: '02_metodos_grabacion/multi_audio.md',
        icon: 'group_work',
    },
    {
        id: 'grabadora-llamada',
        translationKeyTitle: 'manual_call_recorder_title',
        translationKeyDesc: 'manual_call_recorder_desc',
        translationKeyCategory: 'cat_recording',
        path: '02_metodos_grabacion/grabadora_llamada.md',
        icon: 'call',
    },
    {
        id: 'ask-diktalo',
        translationKeyTitle: 'manual_ask_diktalo_title',
        translationKeyDesc: 'manual_ask_diktalo_desc',
        translationKeyCategory: 'cat_ai',
        path: '03_inteligencia_ia/ask_diktalo.md',
        icon: 'psychology',
    },
    {
        id: 'resumenes-plantillas',
        translationKeyTitle: 'manual_templates_title',
        translationKeyDesc: 'manual_templates_desc',
        translationKeyCategory: 'cat_ai',
        path: '03_inteligencia_ia/resumenes_plantillas.md',
        icon: 'description',
    },
    {
        id: 'exportar',
        translationKeyTitle: 'manual_export_title',
        translationKeyDesc: 'manual_export_desc',
        translationKeyCategory: 'cat_productivity',
        path: '03_inteligencia_ia/exportar.md',
        icon: 'download',
    },
    {
        id: 'configuracion',
        translationKeyTitle: 'manual_config_title',
        translationKeyDesc: 'manual_config_desc',
        translationKeyCategory: 'cat_settings',
        path: '05_ajustes/configuracion.md',
        icon: 'settings',
    },
    {
        id: 'packs-minutos',
        translationKeyTitle: 'manual_minute_packs_title',
        translationKeyDesc: 'manual_minute_packs_desc',
        translationKeyCategory: 'cat_plans',
        path: '06_planes/packs_minutos.md',
        icon: 'payments',
    }
];

const CATEGORIES = [
    { id: 'cat_getting_started' },
    { id: 'cat_recording' },
    { id: 'cat_ai' },
    { id: 'cat_productivity' },
    { id: 'cat_settings' },
    { id: 'cat_plans' }
];

export const Manual: React.FC = () => {
    const { t, language } = useLanguage();
    const [view, setView] = useState<'hub' | 'article'>('hub');
    const [selectedSectionId, setSelectedSectionId] = useState<string>('');
    const [content, setContent] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Dynamic Sections based on Language
    const manualSections = useMemo(() => {
        return SECTION_DEFINITIONS.map(def => ({
            ...def,
            title: t(def.translationKeyTitle as any),
            description: t(def.translationKeyDesc as any),
            category: t(def.translationKeyCategory as any),
            fullPath: `/docs/manual/${language}/${def.path}` // Dynamic path
        }));
    }, [t, language]);

    const handleSelectSection = (id: string) => {
        setSelectedSectionId(id);
        setView('article');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        const newUrl = `${window.location.pathname}?id=${id}`;
        window.history.pushState({ path: newUrl }, '', newUrl);
    };

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');
        if (id && manualSections.some(s => s.id === id)) {
            setSelectedSectionId(id);
            setView('article');
        }
    }, [manualSections]); // Added dep

    useEffect(() => {
        if (view === 'article' && selectedSectionId) {
            const loadContent = async () => {
                setIsLoading(true);
                const section = manualSections.find(s => s.id === selectedSectionId);
                if (!section) return;

                try {
                    console.log(`Loading manual from: ${section.fullPath}`);
                    const response = await fetch(`${section.fullPath}?t=${Date.now()}`);

                    if (!response.ok) throw new Error('File not found');

                    const contentType = response.headers.get('content-type');
                    if (contentType && contentType.includes('text/html')) {
                        throw new Error('Received HTML instead of Markdown (File not found)');
                    }

                    const text = await response.text();
                    if (!text.trim()) throw new Error('Empty file');

                    // Only strip frontmatter if it actually exists at the start
                    const cleanText = text.startsWith('---')
                        ? text.replace(/^---[\s\S]*?---\n/, '')
                        : text;

                    setContent(cleanText);
                } catch (error) {
                    console.error('Error loading manual section:', error);
                    setContent(`# ${t('manualError')}\n\n${language === 'en' ? 'The content for this section is not yet available.' : 'No se pudo cargar esta sección. Asegúrate de que el archivo existe.'}\n\n> Debug: ${section.fullPath} (${error})`);
                } finally {
                    setIsLoading(false);
                    setTimeout(() => window.scrollTo({ top: 0 }), 100);
                }
            };
            loadContent();
        }
    }, [view, selectedSectionId, language, manualSections, t]); // Reliably reload on lang change

    const currentSection = manualSections.find(s => s.id === selectedSectionId);

    const filteredSections = useMemo(() => {
        if (!searchQuery) return [];
        return manualSections.filter(s =>
            s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.category.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, manualSections]);

    const groupedSections = useMemo(() => {
        return CATEGORIES.map(cat => ({
            id: t(cat.id as any),
            originalId: cat.id,
            sections: manualSections.filter(s => s.translationKeyCategory === cat.id)
        }));
    }, [manualSections, t]);

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col font-sans text-slate-900 dark:text-white">
            <Navbar />

            <div className="flex-grow pt-32 pb-24">
                {view === 'hub' ? (
                    <div className="max-w-[1400px] mx-auto px-6">
                        {/* Header */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 pb-8 border-b border-slate-100 dark:border-slate-800">
                            <div>
                                <h1 className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">{t('manualTitle')}</h1>
                            </div>

                            <div className="relative w-full md:w-80">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-slate-400 text-[18px]">search</span>
                                </span>
                                <input
                                    type="text"
                                    placeholder={t('manualSearch')}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm placeholder:text-slate-400 focus:ring-1 focus:ring-slate-900 dark:focus:ring-white focus:border-slate-900 dark:focus:border-white transition-all shadow-sm hover:shadow-md"
                                />
                                {searchQuery && (
                                    <div className="absolute top-full right-0 left-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 max-h-80 overflow-y-auto">
                                        {filteredSections.length > 0 ? (
                                            filteredSections.map(s => (
                                                <button
                                                    key={s.id}
                                                    onClick={() => handleSelectSection(s.id)}
                                                    className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 flex flex-col"
                                                >
                                                    <span className="text-sm font-bold text-slate-900 dark:text-white">{s.title}</span>
                                                    <span className="text-xs text-slate-500">{s.category}</span>
                                                </button>
                                            ))
                                        ) : (
                                            <div className="p-4 text-center text-sm text-slate-500">{t('manualNoResults')}</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Directory Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
                            {groupedSections.map((cat) => (
                                <div key={cat.originalId} className="flex flex-col">
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                        {cat.id}
                                    </h2>
                                    <div className="flex flex-col gap-3">
                                        {cat.sections.map(section => (
                                            <button
                                                key={section.id}
                                                onClick={() => handleSelectSection(section.id)}
                                                className="text-left text-[15px] text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors py-1"
                                            >
                                                {section.title}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    /* ARTICLE VIEW */
                    <div className="max-w-[1400px] mx-auto px-6">
                        <nav className="md:hidden flex items-center gap-2 text-[13px] text-slate-500 mb-8 overflow-x-auto whitespace-nowrap">
                            <button onClick={() => setView('hub')} className="hover:text-slate-900 dark:hover:text-white transition-colors">Manual</button>
                            <span className="text-slate-300">/</span>
                            <span className="text-slate-900 dark:text-white font-medium">{currentSection?.title}</span>
                        </nav>

                        <div className="flex flex-col md:flex-row gap-16">
                            <aside className="hidden md:block w-64 shrink-0">
                                <div className="sticky top-32">
                                    <nav className="flex flex-wrap items-center gap-2 text-[13px] text-slate-500 mb-8">
                                        <button onClick={() => setView('hub')} className="hover:text-slate-900 dark:hover:text-white transition-colors">Manual</button>
                                        <span className="text-slate-300">/</span>
                                        <span className="text-slate-900 dark:text-white font-medium">{currentSection?.title}</span>
                                    </nav>

                                    <h3 className="font-bold text-slate-900 dark:text-white mb-4 text-sm">{currentSection?.category}</h3>
                                    <div className="flex flex-col border-l border-slate-200 dark:border-slate-800">
                                        {groupedSections.find(g => g.id === currentSection?.category)?.sections.map(s => (
                                            <button
                                                key={s.id}
                                                onClick={() => setSelectedSectionId(s.id)}
                                                className={`text-left px-4 py-2 text-sm border-l -ml-px transition-colors ${selectedSectionId === s.id
                                                    ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white font-medium'
                                                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                                                    }`}
                                            >
                                                {s.title}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </aside>

                            <main className="flex-1 min-w-0">
                                {isLoading ? (
                                    <div className="py-12 text-center text-sm text-slate-400">{t('manualLoading')}</div>
                                ) : (
                                    <article className="manual-article prose-slate dark:prose-invert">
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            rehypePlugins={[rehypeRaw]}
                                            components={{
                                                img: ({ node, ...props }) => (
                                                    <img {...props} className="rounded-xl my-8" style={{ maxHeight: '500px' }} />
                                                ),
                                                a: ({ node, ...props }) => (
                                                    <a {...props} className="text-slate-900 dark:text-white underline decoration-slate-300 hover:decoration-slate-900 dark:hover:decoration-white underline-offset-4 font-medium" />
                                                )
                                            }}
                                        >
                                            {content}
                                        </ReactMarkdown>
                                    </article>
                                )}
                            </main>
                        </div>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default Manual;