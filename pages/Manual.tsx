import React, { useState, useEffect } from 'react';
import { LegalLayout } from '../layouts/LegalLayout';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import './Manual.css'; // Custom styles for manual

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

    return (
        <LegalLayout
            title={currentSection?.title || 'Manual de Usuario'}
            lastUpdated="09 de Enero de 2026"
        >
            {/* Section Selector */}
            <div className="flex flex-wrap gap-2 mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
                {MANUAL_SECTIONS.map((section) => (
                    <button
                        key={section.id}
                        onClick={() => setSelectedSection(section.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedSection === section.id
                                ? 'bg-primary text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                    >
                        {section.title}
                    </button>
                ))}
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="flex items-center justify-center py-24">
                    <div className="flex flex-col items-center gap-4">
                        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
                        <p className="text-slate-500">Cargando sección...</p>
                    </div>
                </div>
            ) : (
                <div className="manual-content">
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
                            h2: ({ node, ...props }) => (
                                <h2 {...props} className="text-2xl font-bold text-slate-900 dark:text-white mt-12 mb-4" />
                            ),
                            h3: ({ node, ...props }) => (
                                <h3 {...props} className="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-3" />
                            ),
                        }}
                    >
                        {content || '# Cargando...\n\nPor favor espera mientras cargamos el contenido del manual.'}
                    </ReactMarkdown>
                </div>
            )}

            {/* FAQ Link */}
            <div className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-800">
                <p className="text-slate-600 dark:text-slate-400">
                    ¿No encuentras lo que buscas? Consulta nuestras{' '}
                    <a href="/docs/FAQ.md" target="_blank" className="text-primary hover:underline">
                        Preguntas Frecuentes (FAQ)
                    </a>
                </p>
            </div>
        </LegalLayout>
    );
};

export default Manual;