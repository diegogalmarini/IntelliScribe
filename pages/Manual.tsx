import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from '../components/Landing/Navbar';
import { Footer } from '../components/Footer';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { motion, AnimatePresence } from 'framer-motion';
import './Manual.css';

interface ManualSection {
    id: string;
    title: string;
    category: string;
    path: string;
    icon: string;
    description: string;
}

const MANUAL_SECTIONS: ManualSection[] = [
    {
        id: 'crear-cuenta',
        title: 'Crear tu Cuenta',
        category: 'Primeros Pasos',
        path: '/docs/manual/es/01_primeros_pasos/crear_cuenta.md',
        icon: 'account_circle',
        description: 'Aprende a registrarte y dar tus primeros pasos en Diktalo.'
    },
    {
        id: 'grabadora-web',
        title: 'Grabadora Web',
        category: 'Métodos de Grabación',
        path: '/docs/manual/es/02_metodos_grabacion/grabadora_web.md',
        icon: 'mic',
        description: 'Domina el uso de nuestra grabadora inteligente en el navegador.'
    },
    {
        id: 'subir-archivos',
        title: 'Subir Archivos y Multi-Audio',
        category: 'Métodos de Grabación',
        path: '/docs/manual/es/02_metodos_grabacion/subir_archivos.md',
        icon: 'upload_file',
        description: 'Cómo procesar archivos de audio existentes y usar el modo multi-voz.'
    },
    {
        id: 'ask-diktalo',
        title: 'ASK Diktalo - Los 3 Niveles',
        category: 'Inteligencia IA',
        path: '/docs/manual/es/03_inteligencia_ia/ask_diktalo.md',
        icon: 'psychology',
        description: 'Extrae el máximo valor de tus audios con nuestro chat inteligente.'
    },
    {
        id: 'resumenes-plantillas',
        title: 'Plantillas de Resumen',
        category: 'Inteligencia IA',
        path: '/docs/manual/es/03_inteligencia_ia/resumenes_plantillas.md',
        icon: 'description',
        description: 'Ahorra tiempo usando nuestras plantillas preconfiguradas y avanzadas.'
    },
    {
        id: 'exportar',
        title: 'Exportar (PDF, DOC, TXT, JSON)',
        category: 'Productividad',
        path: '/docs/manual/es/03_inteligencia_ia/exportar.md',
        icon: 'download',
        description: 'Lleva tus transcripciones y análisis a donde necesites.'
    },
    {
        id: 'configuracion',
        title: 'Configuración y Ajustes',
        category: 'Ajustes',
        path: '/docs/manual/es/05_ajustes/configuracion.md',
        icon: 'settings',
        description: 'Personaliza tu experiencia, perfil y preferencias de IA.'
    }
];

const CATEGORIES = [
    { id: 'Primeros Pasos', icon: 'auto_awesome', color: 'blue' },
    { id: 'Métodos de Grabación', icon: 'graphic_eq', color: 'purple' },
    { id: 'Inteligencia IA', icon: 'bolt', color: 'amber' },
    { id: 'Productividad', icon: 'task_alt', color: 'green' },
    { id: 'Ajustes', icon: 'manage_accounts', color: 'slate' }
];

export const Manual: React.FC = () => {
    const [view, setView] = useState<'hub' | 'article'>('hub');
    const [selectedSectionId, setSelectedSectionId] = useState<string>('');
    const [content, setContent] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Handle section selection
    const handleSelectSection = (id: string) => {
        setSelectedSectionId(id);
        setView('article');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Load markdown content
    useEffect(() => {
        if (view === 'article' && selectedSectionId) {
            const loadContent = async () => {
                setIsLoading(true);
                const section = MANUAL_SECTIONS.find(s => s.id === selectedSectionId);
                if (!section) return;

                try {
                    const response = await fetch(section.path);
                    const text = await response.text();
                    setContent(text);
                } catch (error) {
                    console.error('Error loading manual section:', error);
                    setContent('# Error\n\nNo se pudo cargar esta sección del manual.');
                } finally {
                    setIsLoading(false);
                    // Wait a bit for ReactMarkdown to render, then scroll to top
                    setTimeout(() => window.scrollTo({ top: 0 }), 100);
                }
            };

            loadContent();
        }
    }, [view, selectedSectionId]);

    const currentSection = MANUAL_SECTIONS.find(s => s.id === selectedSectionId);

    const filteredSections = useMemo(() => {
        if (!searchQuery) return [];
        return MANUAL_SECTIONS.filter(s =>
            s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.category.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery]);

    const groupedSections = useMemo(() => {
        return CATEGORIES.map(cat => ({
            ...cat,
            sections: MANUAL_SECTIONS.filter(s => s.category === cat.id)
        }));
    }, []);

    return (
        <div className="min-h-screen bg-[#F9FAFB] dark:bg-background-dark flex flex-col font-sans transition-colors duration-300">
            <Navbar />

            <div className="flex-grow pt-32 pb-24">
                {view === 'hub' ? (
                    /* HUB VIEW */
                    <div className="max-w-5xl mx-auto px-6">
                        <div className="text-center mb-16">
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
                                ¿En qué podemos ayudarte?
                            </h1>
                            <div className="max-w-2xl mx-auto relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors">search</span>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Busca manuales, funciones, planes..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="block w-full pl-14 pr-5 py-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-slate-900 dark:text-white placeholder-slate-400"
                                />

                                {/* Instant Search Results */}
                                {searchQuery && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl z-50 overflow-hidden max-h-96 overflow-y-auto">
                                        {filteredSections.length > 0 ? (
                                            filteredSections.map(s => (
                                                <button
                                                    key={s.id}
                                                    onClick={() => handleSelectSection(s.id)}
                                                    className="w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-white/5 border-b border-slate-100 dark:border-white/5 last:border-0 flex items-center gap-4 group"
                                                >
                                                    <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 group-hover:bg-primary group-hover:text-white transition-all">
                                                        <span className="material-symbols-outlined text-xl">{s.icon}</span>
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900 dark:text-white text-sm">{s.title}</p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">{s.category}</p>
                                                    </div>
                                                </button>
                                            ))
                                        ) : (
                                            <div className="p-8 text-center text-slate-500">No hay resultados para "{searchQuery}"</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Categories Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {groupedSections.map((cat) => (
                                <div key={cat.id} className="category-card bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-3xl p-8 flex flex-col h-full">
                                    <div className={`h-14 w-14 rounded-2xl bg-${cat.color}-500/10 flex items-center justify-center text-${cat.color}-500 mb-6`}>
                                        <span className="material-symbols-outlined text-3xl">{cat.icon}</span>
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{cat.id}</h2>
                                    <div className="space-y-3 flex-grow">
                                        {cat.sections.map(section => (
                                            <button
                                                key={section.id}
                                                onClick={() => handleSelectSection(section.id)}
                                                className="w-full text-left text-sm text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-white transition-colors flex items-center gap-2 group"
                                            >
                                                <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600 group-hover:bg-primary group-hover:scale-150 transition-all"></span>
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
                        <div className="flex flex-col md:flex-row gap-12">
                            {/* Sidebar Hierarchy */}
                            <aside className="hidden md:block w-72 shrink-0">
                                <div className="sticky top-28 space-y-10">
                                    <button
                                        onClick={() => setView('hub')}
                                        className="flex items-center gap-2 text-sm font-bold text-primary hover:gap-3 transition-all"
                                    >
                                        <span className="material-symbols-outlined text-base">arrow_back</span>
                                        Volver al inicio
                                    </button>

                                    <nav className="space-y-8">
                                        {groupedSections.map(cat => (
                                            currentSection?.category === cat.id && (
                                                <div key={cat.id} className="space-y-4">
                                                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 pl-4 border-l-2 border-slate-100 dark:border-white/5">
                                                        {cat.id}
                                                    </h3>
                                                    <div className="space-y-1">
                                                        {cat.sections.map(section => (
                                                            <button
                                                                key={section.id}
                                                                onClick={() => setSelectedSectionId(section.id)}
                                                                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${selectedSectionId === section.id
                                                                        ? 'bg-primary/10 text-primary'
                                                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5'
                                                                    }`}
                                                            >
                                                                {section.title}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )
                                        ))}

                                        {/* Other Categories Mini List */}
                                        <div className="pt-8 border-t border-slate-100 dark:border-white/5">
                                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 pl-4">Más categorías</h3>
                                            <div className="space-y-2">
                                                {CATEGORIES.filter(c => c.id !== currentSection?.category).map(cat => (
                                                    <button
                                                        key={cat.id}
                                                        onClick={() => {
                                                            const firstSection = MANUAL_SECTIONS.find(s => s.category === cat.id);
                                                            if (firstSection) handleSelectSection(firstSection.id);
                                                        }}
                                                        className="w-full text-left px-4 py-2 text-[13px] text-slate-400 hover:text-primary transition-colors flex items-center gap-2"
                                                    >
                                                        <span className="material-symbols-outlined text-base">{cat.icon}</span>
                                                        {cat.id}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </nav>
                                </div>
                            </aside>

                            {/* Main Article Content */}
                            <main className="flex-1 min-w-0">
                                {/* Breadcrumbs */}
                                <nav className="flex items-center gap-2 mb-8 text-[12px] font-bold text-slate-400 uppercase tracking-widest">
                                    <button onClick={() => setView('hub')} className="hover:text-primary transition-colors">Manual</button>
                                    <span className="material-symbols-outlined text-xs">chevron_right</span>
                                    <span className="text-slate-300 dark:text-slate-600">{currentSection?.category}</span>
                                    <span className="material-symbols-outlined text-xs">chevron_right</span>
                                    <span className="text-primary">{currentSection?.title}</span>
                                </nav>

                                <div className="bg-white dark:bg-slate-800/30 border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-8 md:p-12 lg:p-16">
                                    {isLoading ? (
                                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                                            <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                            <p className="text-sm font-bold text-slate-400">Cargando contenido...</p>
                                        </div>
                                    ) : (
                                        <article className="manual-article">
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                rehypePlugins={[rehypeRaw]}
                                                components={{
                                                    img: ({ node, ...props }) => (
                                                        <div className="relative group">
                                                            <img
                                                                {...props}
                                                                className="cursor-zoom-in group-hover:opacity-90 transition-opacity"
                                                                onClick={() => window.open(props.src, '_blank')}
                                                                alt={props.alt || 'Diktalo Guide'}
                                                            />
                                                        </div>
                                                    ),
                                                    a: ({ node, ...props }) => (
                                                        <a
                                                            {...props}
                                                            className="text-primary font-bold hover:underline"
                                                            target={props.href?.startsWith('http') ? '_blank' : undefined}
                                                            rel={props.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                                                        />
                                                    ),
                                                }}
                                            >
                                                {content}
                                            </ReactMarkdown>
                                        </article>
                                    )}

                                    {/* Article Footer / Feedback */}
                                    <div className="mt-24 pt-12 border-t border-slate-100 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
                                        <div className="flex items-center gap-4">
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">¿Te ha servido de ayuda?</p>
                                            <div className="flex gap-2">
                                                <button className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-green-500/10 hover:text-green-500 transition-all flex items-center justify-center border border-slate-100 dark:border-white/5">
                                                    <span className="material-symbols-outlined text-xl">thumb_up</span>
                                                </button>
                                                <button className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-rose-500/10 hover:text-rose-500 transition-all flex items-center justify-center border border-slate-100 dark:border-white/5">
                                                    <span className="material-symbols-outlined text-xl">thumb_down</span>
                                                </button>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                            className="text-xs font-bold text-slate-400 hover:text-primary flex items-center gap-2"
                                        >
                                            Volver arriba
                                            <span className="material-symbols-outlined text-base">expand_less</span>
                                        </button>
                                    </div>
                                </div>
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