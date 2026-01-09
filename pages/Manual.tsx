import React, { useState } from 'react';
import { AppRoute, UserProfile } from '../types';
import { MinimalSidebar } from './intelligence/components/MinimalSidebar';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

interface ManualSection {
    id: string;
    title: string;
    category: string;
    path: string;
    difficulty: 'Principiante' | 'Intermedio' | 'Avanzado';
}

const MANUAL_SECTIONS: ManualSection[] = [
    {
        id: 'crear-cuenta',
        title: 'Crear tu Cuenta',
        category: 'Primeros Pasos',
        path: '/docs/manual/es/01_primeros_pasos/crear_cuenta.md',
        difficulty: 'Principiante'
    },
    {
        id: 'grabadora-web',
        title: 'Grabadora Web',
        category: 'Métodos de Grabación',
        path: '/docs/manual/es/02_metodos_grabacion/grabadora_web.md',
        difficulty: 'Principiante'
    },
    {
        id: 'subir-archivos',
        title: 'Subir Archivos y Multi-Audio',
        category: 'Métodos de Grabación',
        path: '/docs/manual/es/02_metodos_grabacion/subir_archivos.md',
        difficulty: 'Principiante'
    },
    {
        id: 'ask-diktalo',
        title: 'ASK Diktalo - Los 3 Niveles',
        category: 'Inteligencia IA',
        path: '/docs/manual/es/03_inteligencia_ia/ask_diktalo.md',
        difficulty: 'Intermedio'
    },
    {
        id: 'resumenes-plantillas',
        title: 'Plantillas de Resumen',
        category: 'Inteligencia IA',
        path: '/docs/manual/es/03_inteligencia_ia/resumenes_plantillas.md',
        difficulty: 'Intermedio'
    },
    {
        id: 'exportar',
        title: 'Exportar (PDF, DOC, TXT, JSON)',
        category: 'Inteligencia IA',
        path: '/docs/manual/es/03_inteligencia_ia/exportar.md',
        difficulty: 'Principiante'
    },
    {
        id: 'configuracion',
        title: 'Configuración y Ajustes',
        category: 'Ajustes',
        path: '/docs/manual/es/05_ajustes/configuracion.md',
        difficulty: 'Principiante'
    }
];

interface ManualProps {
    onNavigate: (route: AppRoute) => void;
    user: UserProfile;
    onLogout: () => void;
    onUpdateUser: (updates: Partial<UserProfile>) => void;
}

export const Manual: React.FC<ManualProps> = ({ onNavigate, user, onLogout, onUpdateUser }) => {
    const [selectedSection, setSelectedSection] = useState<string>('crear-cuenta');
    const [content, setContent] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // Load markdown content
    React.useEffect(() => {
        const loadContent = async () => {
            setIsLoading(true);
            const section = MANUAL_SECTIONS.find(s => s.id === selectedSection);
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
            }
        };

        loadContent();
    }, [selectedSection]);

    // Filter sections by search
    const filteredSections = MANUAL_SECTIONS.filter(section =>
        section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        section.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Group by category
    const groupedSections = filteredSections.reduce((acc, section) => {
        if (!acc[section.category]) {
            acc[section.category] = [];
        }
        acc[section.category].push(section);
        return acc;
    }, {} as Record<string, ManualSection[]>);

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Principiante':
                return 'bg-green-500/10 text-green-600 dark:text-green-400';
            case 'Intermedio':
                return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400';
            case 'Avanzado':
                return 'bg-red-500/10 text-red-600 dark:text-red-400';
            default:
                return 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
        }
    };

    return (
        <div className="flex h-screen bg-background dark:bg-background-dark overflow-hidden">
            {/* Sidebar - Same as IntelligenceDashboard */}
            <MinimalSidebar
                onNavigate={onNavigate}
                user={user}
                onLogout={onLogout}
                onUpdateUser={onUpdateUser}
                currentRoute={AppRoute.MANUAL}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-white/10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-xl">
                            <span className="material-symbols-outlined text-primary">menu_book</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Manual de Usuario</h1>
                            <p className="text-sm text-slate-400">Guías y documentación completa</p>
                        </div>
                    </div>

                    {/* Helpful buttons */}
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-400">¿Te ayudó?</span>
                        <button className="p-2 hover:bg-green-500/10 text-green-500 rounded-lg transition-colors">
                            <span className="material-symbols-outlined">thumb_up</span>
                        </button>
                        <button className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors">
                            <span className="material-symbols-outlined">thumb_down</span>
                        </button>
                    </div>
                </div>

                {/* Content Layout - Split View */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Left Panel - Table of Contents */}
                    <div className="w-80 border-r border-white/10 flex flex-col overflow-hidden bg-white/[0.02]">
                        {/* Search */}
                        <div className="p-4">
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    search
                                </span>
                                <input
                                    type="text"
                                    placeholder="Buscar en el manual..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                        </div>

                        {/* TOC */}
                        <div className="flex-1 overflow-y-auto px-3 space-y-6">
                            {Object.entries(groupedSections).map(([category, sections]) => (
                                <div key={category}>
                                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-3">
                                        {category}
                                    </h3>
                                    <div className="space-y-1">
                                        {sections.map((section) => (
                                            <button
                                                key={section.id}
                                                onClick={() => setSelectedSection(section.id)}
                                                className={`w-full text-left px-3 py-2.5 rounded-xl transition-all ${selectedSection === section.id
                                                    ? 'bg-primary/20 text-primary font-medium'
                                                    : 'text-slate-300 hover:bg-white/5'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm">{section.title}</span>
                                                    <span
                                                        className={`text-[10px] px-2 py-0.5 rounded-full ${getDifficultyColor(
                                                            section.difficulty
                                                        )}`}
                                                    >
                                                        {section.difficulty}
                                                    </span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* FAQ Link */}
                        <div className="p-4 border-t border-white/10">
                            <a
                                href="/docs/FAQ.md"
                                target="_blank"
                                className="flex items-center gap-2 text-sm text-primary hover:underline"
                            >
                                <span className="material-symbols-outlined text-base">help</span>
                                Ver FAQ (Preguntas Frecuentes)
                            </a>
                        </div>
                    </div>

                    {/* Right Panel - Content */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="max-w-4xl mx-auto p-8 pb-24">
                            {isLoading ? (
                                <div className="flex items-center justify-center h-64">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
                                        <p className="text-slate-400">Cargando sección...</p>
                                    </div>
                                </div>
                            ) : (
                                <article className="prose prose-lg prose-invert max-w-none">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        rehypePlugins={[rehypeRaw]}
                                        components={{
                                            img: ({ node, ...props }) => (
                                                <img
                                                    {...props}
                                                    className="rounded-xl shadow-2xl my-8 cursor-pointer hover:scale-[1.02] transition-transform border border-white/10"
                                                    onClick={() => window.open(props.src, '_blank')}
                                                    alt={props.alt || 'Screenshot'}
                                                />
                                            ),
                                            a: ({ node, ...props }) => (
                                                <a
                                                    {...props}
                                                    className="text-primary hover:text-primary/80 hover:underline"
                                                    target={props.href?.startsWith('http') ? '_blank' : undefined}
                                                    rel={props.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                                                />
                                            ),
                                            code: ({ node, className, children, ...props }) => {
                                                const inline = !className?.includes('language-');
                                                return inline ? (
                                                    <code
                                                        {...props}
                                                        className="px-2 py-1 bg-white/10 rounded-lg text-sm font-mono text-primary"
                                                    >
                                                        {children}
                                                    </code>
                                                ) : (
                                                    <code
                                                        {...props}
                                                        className="block p-4 bg-white/5 rounded-xl overflow-x-auto border border-white/10"
                                                    >
                                                        {children}
                                                    </code>
                                                );
                                            },
                                            h1: ({ node, ...props }) => (
                                                <h1 {...props} className="text-4xl font-bold text-white mb-6 tracking-tight" />
                                            ),
                                            h2: ({ node, ...props }) => (
                                                <h2 {...props} className="text-3xl font-bold text-white mt-12 mb-4" />
                                            ),
                                            h3: ({ node, ...props }) => (
                                                <h3 {...props} className="text-2xl font-semibold text-white mt-8 mb-3" />
                                            ),
                                            p: ({ node, ...props }) => (
                                                <p {...props} className="text-slate-300 leading-relaxed mb-4" />
                                            ),
                                            ul: ({ node, ...props }) => (
                                                <ul {...props} className="list-disc list-inside text-slate-300 space-y-2 mb-4" />
                                            ),
                                            ol: ({ node, ...props }) => (
                                                <ol {...props} className="list-decimal list-inside text-slate-300 space-y-2 mb-4" />
                                            ),
                                            blockquote: ({ node, ...props }) => (
                                                <blockquote
                                                    {...props}
                                                    className="border-l-4 border-primary pl-4 py-2 bg-primary/5 rounded-r-lg my-6 text-slate-300"
                                                />
                                            ),
                                            table: ({ node, ...props }) => (
                                                <div className="overflow-x-auto my-6">
                                                    <table {...props} className="min-w-full border border-white/10 rounded-xl overflow-hidden" />
                                                </div>
                                            ),
                                            th: ({ node, ...props }) => (
                                                <th {...props} className="px-4 py-3 bg-white/10 text-left text-white font-semibold" />
                                            ),
                                            td: ({ node, ...props }) => (
                                                <td {...props} className="px-4 py-3 border-t border-white/10 text-slate-300" />
                                            ),
                                        }}
                                    >
                                        {content || '# Cargando...\n\nPor favor espera mientras cargamos el contenido del manual.'}
                                    </ReactMarkdown>
                                </article>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};