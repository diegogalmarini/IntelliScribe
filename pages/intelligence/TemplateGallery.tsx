import React, { useState, useMemo } from 'react';
import { Search, Filter, Sparkles, ArrowRight, X, Check } from 'lucide-react';
import { AI_TEMPLATES, AITemplate } from '../../constants/templates';

interface TemplateGalleryProps {
    onUseTemplate: (templateId: string) => void;
}

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({ onUseTemplate }) => {
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState<AITemplate | null>(null);

    const categories = ['All', ...Array.from(new Set(AI_TEMPLATES.map(t => t.category)))];

    const filteredTemplates = useMemo(() => {
        return AI_TEMPLATES.filter(template => {
            const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
            const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                template.description.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [selectedCategory, searchQuery]);

    const handleUseTemplate = (templateId: string) => {
        onUseTemplate(templateId);
        setSelectedTemplate(null);
    };

    return (
        <div className="h-full flex flex-col bg-slate-50 dark:bg-background-dark overflow-hidden">
            {/* Header */}
            <div className="px-8 py-6 border-b border-black/[0.05] dark:border-white/[0.05] bg-white dark:bg-background-dark z-10">
                <div className="max-w-7xl mx-auto w-full">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                                Galería de Plantillas
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400">
                                Explora plantillas diseñadas por expertos para obtener los mejores resúmenes IA.
                            </p>
                        </div>

                        {/* Search */}
                        <div className="relative w-full md:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Buscar plantillas..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-surface-dark border-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white placeholder-slate-500"
                            />
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`
                                    px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors
                                    ${selectedCategory === category
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                                        : 'bg-white dark:bg-surface-dark text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200 dark:border-white/5'}
                                `}
                            >
                                {category === 'All' ? 'Todos' : category}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Grid Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="max-w-7xl mx-auto w-full">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredTemplates.map((template) => (
                            <div
                                key={template.id}
                                onClick={() => setSelectedTemplate(template)}
                                className="group bg-white dark:bg-card-dark rounded-2xl border border-black/[0.05] dark:border-white/[0.05] p-5 hover:border-blue-500/50 dark:hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/5 dark:hover:shadow-blue-900/10 transition-all cursor-pointer flex flex-col h-full"
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${template.color} bg-opacity-15 dark:bg-opacity-20`}>
                                    <template.icon size={24} />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-blue-500 transition-colors">
                                    {template.title}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3 mb-4 flex-1">
                                    {template.description}
                                </p>
                                <div className="flex items-center gap-2 text-xs font-medium text-slate-400 dark:text-slate-500">
                                    <span className="bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-md">
                                        {template.category}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredTemplates.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4 text-slate-400">
                                <Search size={32} />
                            </div>
                            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">
                                No se encontraron plantillas
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400">
                                Intenta con otra categoría o término de búsqueda.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Detail View */}
            {selectedTemplate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div
                        className="bg-white dark:bg-[#0b0f17] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-white/10"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="p-6 pb-0 flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${selectedTemplate.color} bg-opacity-15 dark:bg-opacity-20`}>
                                    <selectedTemplate.icon size={28} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {selectedTemplate.title}
                                    </h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-sm text-slate-500 dark:text-slate-400">
                                            {selectedTemplate.category}
                                        </span>
                                        <span className="w-1 h-1 bg-slate-300 dark:bg-slate-600 rounded-full" />
                                        <span className="text-sm text-slate-500 dark:text-slate-400">
                                            IA Template
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedTemplate(null)}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full text-slate-400 dark:text-slate-500 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 overflow-y-auto">
                            <div className="prose prose-slate dark:prose-invert max-w-none">
                                <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-8">
                                    {selectedTemplate.description}
                                </p>

                                <div className="bg-slate-50 dark:bg-surface-dark rounded-xl p-6 border border-slate-200 dark:border-white/5">
                                    <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">
                                        Estructura del Resumen (Outline)
                                    </h3>
                                    <ul className="space-y-3">
                                        {selectedTemplate.outline.map((item, index) => (
                                            <li key={index} className="flex items-start gap-3 text-slate-700 dark:text-slate-200">
                                                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                                                <span className="text-sm font-medium">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-slate-100 dark:border-white/5 flex justify-end gap-3 bg-slate-50/50 dark:bg-surface-dark/50">
                            <button
                                onClick={() => setSelectedTemplate(null)}
                                className="px-6 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => handleUseTemplate(selectedTemplate.id)}
                                className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all"
                            >
                                <Sparkles size={18} />
                                Usar Plantilla
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
