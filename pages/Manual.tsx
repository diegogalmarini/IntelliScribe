import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from '../components/Landing/Navbar';
import { Footer } from '../components/Footer';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { motion, AnimatePresence } from 'framer-motion';
import './Manual.css';
import { SupportBot } from '../components/SupportBot/SupportBot';

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
    { id: 'Primeros Pasos' },
    { id: 'Métodos de Grabación' },
    { id: 'Inteligencia IA' },
    { id: 'Productividad' },
    { id: 'Ajustes' }
];

export const Manual: React.FC = () => {
    const [view, setView] = useState<'hub' | 'article'>('hub');
    const [selectedSectionId, setSelectedSectionId] = useState<string>('');
    const [content, setContent] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState('');

    const handleSelectSection = (id: string) => {
        setSelectedSectionId(id);
        setView('article');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

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
        <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col font-sans text-slate-900 dark:text-white">
            <Navbar />

            <div className="flex-grow pt-32 pb-24">
                {view === 'hub' ? (
                    /* HUB VIEW - DIRECTORY STYLE */
                    <div className="max-w-[1400px] mx-auto px-6">

                        {/* Header: Title Left, Search Right */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16 border-b border-transparent">
                            <div>
                                <h6 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Diktalo > Manual</h6>
                                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Manual de Usuario</h1>
                            </div>

                            <div className="relative w-full md:w-96">
                                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-slate-400 text-lg">search</span>
                                </span>
                                <input
                                    type="text"
                                    placeholder="Buscar en el manual..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full text-sm focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent transition-all"
                                />
                                {/* Search Dropdown */}
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
                                            <div className="p-4 text-center text-sm text-slate-500">No hay resultados.</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Directory Grid - Text Only */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
                            {groupedSections.map((cat) => (
                                <div key={cat.id} className="flex flex-col">
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
                        {/* Minimal Breadcrumb */}
                        <nav className="flex items-center gap-2 text-[13px] text-slate-500 mb-8">
                            <button onClick={() => setView('hub')} className="hover:text-slate-900 dark:hover:text-white transition-colors">Diktalo</button>
                            <span className="text-slate-300">/</span>
                            <button onClick={() => setView('hub')} className="hover:text-slate-900 dark:hover:text-white transition-colors">Manual</button>
                            <span className="text-slate-300">/</span>
                            <span className="text-slate-900 dark:text-white font-medium">{currentSection?.title}</span>
                        </nav>

                        <div className="flex flex-col md:flex-row gap-16">
                            {/* Sidebar List */}
                            <aside className="hidden md:block w-64 shrink-0">
                                <div className="sticky top-32">
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

                            {/* Content */}
                            <main className="flex-1 min-w-0">
                                {isLoading ? (
                                    <div className="py-12 text-center text-sm text-slate-400">Cargando...</div>
                                ) : (
                                    <article className="manual-article prose-slate dark:prose-invert">
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            rehypePlugins={[rehypeRaw]}
                                            components={{
                                                img: ({ node, ...props }) => (
                                                    <img {...props} className="rounded-lg border border-slate-100 dark:border-slate-800 my-8 shadow-sm" style={{ maxHeight: '500px' }} />
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
            {/* Bot is now injected via App.tsx, but kept here for fallback in case App.tsx routing fails */}
        </div>
    );
};

export default Manual;