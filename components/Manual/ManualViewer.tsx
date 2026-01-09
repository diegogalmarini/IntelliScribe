import React, { useState, useEffect } from 'react';
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

export const ManualViewer: React.FC = () => {
    const [selectedSection, setSelectedSection] = useState<string>('crear-cuenta');
    const [content, setContent] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

    // Load markdown content when section changes
    useEffect(() => {
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

    // Filter sections by search query
    const filteredSections = MANUAL_SECTIONS.filter(section =>
        section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        section.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Group sections by category
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
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'Intermedio':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'Avanzado':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
        }
    };

    return (
        <div className="flex h-screen bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-white">
            {/* Sidebar */}
            <div
                className={`${isSidebarOpen ? 'w-80' : 'w-0'
                    } transition-all duration-300 border-r border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden`}
            >
                {/* Header */}
                <div className="p-6  border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold">Manual de Usuario</h2>
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                            search
                        </span>
                        <input
                            type="text"
                            placeholder="Buscar en el manual..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                        />
                    </div>
                </div>

                {/* Table of Contents */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {Object.entries(groupedSections).map(([category, sections]) => (
                        <div key={category}>
                            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                                {category}
                            </h3>
                            <div className="space-y-1">
                                {sections.map((section) => (
                                    <button
                                        key={section.id}
                                        onClick={() => setSelectedSection(section.id)}
                                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${selectedSection === section.id
                                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                                                : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
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

                {/* Footer */}
                <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                    <a
                        href="/docs/FAQ.md"
                        className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                        <span className="material-symbols-outlined text-base">help</span>
                        Ver FAQ (Preguntas Frecuentes)
                    </a>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Bar */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className={`${isSidebarOpen ? 'hidden' : 'flex'
                            } items-center gap-2 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg`}
                    >
                        <span className="material-symbols-outlined">menu</span>
                        <span className="text-sm font-medium">Ver Índice</span>
                    </button>

                    <div className="flex items-center gap-3">
                        {/* Helpful button */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-600 dark:text-slate-400">¿Te ayudó?</span>
                            <button className="p-2 hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg transition-colors">
                                <span className="material-symbols-outlined">thumb_up</span>
                            </button>
                            <button className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg transition-colors">
                                <span className="material-symbols-outlined">thumb_down</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-4xl mx-auto p-8">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
                            </div>
                        ) : (
                            <article className="prose prose-slate dark:prose-invert max-w-none">
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    rehypePlugins={[rehypeRaw]}
                                    components={{
                                        // Custom rendering for images
                                        img: ({ node, ...props }) => (
                                            <img
                                                {...props}
                                                className="rounded-lg shadow-lg my-6 cursor-pointer hover:shadow-xl transition-shadow"
                                                onClick={() => window.open(props.src, '_blank')}
                                            />
                                        ),
                                        // Custom rendering for links
                                        a: ({ node, ...props }) => (
                                            <a
                                                {...props}
                                                className="text-blue-600 dark:text-blue-400 hover:underline"
                                                target={props.href?.startsWith('http') ? '_blank' : undefined}
                                                rel={props.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                                            />
                                        ),
                                        // Custom rendering for code blocks
                                        code: ({ node, inline, ...props }) =>
                                            inline ? (
                                                <code
                                                    {...props}
                                                    className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono"
                                                />
                                            ) : (
                                                <code
                                                    {...props}
                                                    className="block p-4 bg-slate-50 dark:bg-slate-900 rounded-lg overflow-x-auto"
                                                />
                                            ),
                                    }}
                                >
                                    {content}
                                </ReactMarkdown>
                            </article>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
