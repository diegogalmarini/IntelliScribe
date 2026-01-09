import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Landing/Navbar';
import { Footer } from '../components/Footer';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

interface ManualSection {
    id: string;
    title: string;
    category: string;
    path: string;
    icon: string;
}

const MANUAL_SECTIONS: ManualSection[] = [
    {
        id: 'crear-cuenta',
        title: 'Crear tu Cuenta',
        category: 'Primeros Pasos',
        path: '/docs/manual/es/01_primeros_pasos/crear_cuenta.md',
        icon: 'account_circle'
    },
    {
        id: 'grabadora-web',
        title: 'Grabadora Web',
        category: 'Métodos de Grabación',
        path: '/docs/manual/es/02_metodos_grabacion/grabadora_web.md',
        icon: 'mic'
    },
    {
        id: 'subir-archivos',
        title: 'Subir Archivos y Multi-Audio',
        category: 'Métodos de Grabación',
        path: '/docs/manual/es/02_metodos_grabacion/subir_archivos.md',
        icon: 'upload_file'
    },
    {
        id: 'ask-diktalo',
        title: 'ASK Diktalo - Los 3 Niveles',
        category: 'Inteligencia IA',
        path: '/docs/manual/es/03_inteligencia_ia/ask_diktalo.md',
        icon: 'psychology'
    },
    {
        id: 'resumenes-plantillas',
        title: 'Plantillas de Resumen',
        category: 'Inteligencia IA',
        path: '/docs/manual/es/03_inteligencia_ia/resumenes_plantillas.md',
        icon: 'description'
    },
    {
        id: 'exportar',
        title: 'Exportar (PDF, DOC, TXT, JSON)',
        category: 'Exportación',
        path: '/docs/manual/es/03_inteligencia_ia/exportar.md',
        icon: 'download'
    },
    {
        id: 'configuracion',
        title: 'Configuración y Ajustes',
        category: 'Ajustes',
        path: '/docs/manual/es/05_ajustes/configuracion.md',
        icon: 'settings'
    }
];

export const Manual: React.FC = () => {
    const [selectedSection, setSelectedSection] = useState<string>('crear-cuenta');
    const [content, setContent] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // Load markdown content
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

    const currentSection = MANUAL_SECTIONS.find(s => s.id === selectedSection);

    // Group sections by category
    const groupedSections = MANUAL_SECTIONS.reduce((acc, section) => {
        if (!acc[section.category]) {
            acc[section.category] = [];
        }
        acc[section.category].push(section);
        return acc;
    }, {} as Record<string, ManualSection[]>);

    return (
        <div className="min-h-screen bg-white dark:bg-background-dark flex flex-col">
            {/* Navbar */}
            <Navbar />

            {/* Main Content */}
            <div className="flex-1 pt-24 pb-16">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <div className="flex gap-8 lg:gap-12">
                        {/* Sidebar - Table of Contents */}
                        <aside className="hidden lg:block w-64 flex-shrink-0">
                            <div className="sticky top-24">
                                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
                                    Manual de Usuario
                                </h2>

                                <nav className="space-y-6">
                                    {Object.entries(groupedSections).map(([category, sections]) => (
                                        <div key={category}>
                                            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                                                {category}
                                            </h3>
                                            <ul className="space-y-1">
                                                {sections.map((section) => (
                                                    <li key={section.id}>
                                                        <button
                                                            onClick={() => setSelectedSection(section.id)}
                                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${selectedSection === section.id
                                                                    ? 'bg-primary text-white font-medium'
                                                                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                                                }`}
                                                        >
                                                            <span className="material-symbols-outlined text-base">
                                                                {section.icon}
                                                            </span>
                                                            <span className="flex-1">{section.title}</span>
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </nav>

                                {/* FAQ Link */}
                                <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
                                    <a
                                        href="/docs/FAQ.md"
                                        target="_blank"
                                        className="flex items-center gap-2 text-sm text-primary hover:text-primary-dark"
                                    >
                                        <span className="material-symbols-outlined text-base">help</span>
                                        Ver Preguntas Frecuentes
                                    </a>
                                </div>
                            </div>
                        </aside>

                        {/* Main Content Area */}
                        <main className="flex-1 min-w-0">
                            {/* Mobile Section Selector */}
                            <div className="lg:hidden mb-6">
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                                    Selecciona una sección
                                </label>
                                <select
                                    value={selectedSection}
                                    onChange={(e) => setSelectedSection(e.target.value)}
                                    className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                                >
                                    {Object.entries(groupedSections).map(([category, sections]) => (
                                        <optgroup key={category} label={category}>
                                            {sections.map((section) => (
                                                <option key={section.id} value={section.id}>
                                                    {section.title}
                                                </option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </select>
                            </div>

                            {/* Page Header */}
                            <div className="mb-8">
                                <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">
                                    {currentSection?.category}
                                </p>
                                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                                    {currentSection?.title}
                                </h1>
                            </div>

                            {/* Content */}
                            {isLoading ? (
                                <div className="flex items-center justify-center py-24">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
                                        <p className="text-sm text-slate-500">Cargando sección...</p>
                                    </div>
                                </div>
                            ) : (
                                <article className="prose prose-slate dark:prose-invert max-w-none manual-content">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        rehypePlugins={[rehypeRaw]}
                                        components={{
                                            img: ({ node, ...props }) => (
                                                <img
                                                    {...props}
                                                    className="rounded-xl shadow-lg my-6 cursor-pointer hover:shadow-xl transition-shadow border border-slate-200 dark:border-slate-700"
                                                    onClick={() => window.open(props.src, '_blank')}
                                                    alt={props.alt || 'Screenshot'}
                                                />
                                            ),
                                            a: ({ node, ...props }) => (
                                                <a
                                                    {...props}
                                                    className="text-primary hover:text-primary-dark hover:underline"
                                                    target={props.href?.startsWith('http') ? '_blank' : undefined}
                                                    rel={props.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                                                />
                                            ),
                                        }}
                                    >
                                        {content || '# Cargando...\n\nPor favor espera mientras cargamos el contenido del manual.'}
                                    </ReactMarkdown>
                                </article>
                            )}
                        </main>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <Footer />

            {/* Custom Styles */}
            <style jsx>{`
        .manual-content :global(p) {
          margin: 0.5rem 0;
          font-size: 0.8rem;
          line-height: 1.625;
        }

        .manual-content :global(ul),
        .manual-content :global(ol) {
          font-size: 0.8rem;
          line-height: 1.625;
        }

        .manual-content :global(li) {
          margin: 0.25rem 0;
        }

        .manual-content :global(h2) {
          font-size: 1.5rem;
          margin-top: 2rem;
          margin-bottom: 0.75rem;
        }

        .manual-content :global(h3) {
          font-size: 1.25rem;
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
        }

        .manual-content :global(code) {
          font-size: 0.75rem;
        }

        .manual-content :global(blockquote) {
          font-size: 0.85rem;
          padding: 0.75rem 1rem;
          border-left: 4px solid var(--color-primary);
          background: rgba(59, 130, 246, 0.05);
          border-radius: 0 0.5rem 0.5rem 0;
          margin: 1.5rem 0;
        }
      `}</style>
        </div>
    );
};

export default Manual;