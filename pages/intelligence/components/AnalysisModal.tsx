import React, { useState, useMemo } from 'react';
import { X, Search, Sparkles, Clock, LayoutGrid, Check, ChevronDown, Wand2, Languages, Microscope, Scale, Building2, Stethoscope, GraduationCap, PenTool, Radio, Eye } from 'lucide-react';
import { AI_TEMPLATES, AITemplate } from '../../../constants/templates';

interface AnalysisModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGenerate: (templateId: string, language: string) => void;
    isGenerating: boolean;
}

const CATEGORIES = [
    { id: 'all', label: 'All files', icon: LayoutGrid },
    { id: 'recent', label: 'Recently used', icon: Clock },
    { type: 'divider' },
    { id: 'General', label: 'General', icon: Wand2 },
    { id: 'Business', label: 'Meeting & Business', icon: Building2 },
    { id: 'Speech', label: 'Speech', icon: Mic },
    { id: 'Call', label: 'Call', icon: Phone },
    { id: 'Consulting', label: 'Consulting', icon: Briefcase },
    { id: 'Education', label: 'Education', icon: GraduationCap },
    { id: 'Medical', label: 'Medical', icon: Stethoscope },
    { id: 'Legal', label: 'Legal', icon: Scale },
    { id: 'HR', label: 'HR & Recruiting', icon: UsersIcon },
    { id: 'Product', label: 'Product & UX', icon: Microscope },
    { id: 'Periodismo', label: 'Journalism', icon: Radio },
    { id: 'Research', label: 'Research', icon: PenTool },
];

function UsersIcon(props: any) { return <Users {...props} /> }
import { Users, Mic, Phone, Briefcase } from 'lucide-react';

const LANGUAGES = [
    { code: 'es', label: 'Español' },
    { code: 'en', label: 'English' },
];

export const AnalysisModal: React.FC<AnalysisModalProps> = ({
    isOpen,
    onClose,
    onGenerate,
    isGenerating
}) => {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>('general');
    const [selectedLanguage, setSelectedLanguage] = useState('es');
    const [showLangMenu, setShowLangMenu] = useState(false);
    const [previewTemplate, setPreviewTemplate] = useState<AITemplate | null>(null);

    // Filtering logic
    const filteredTemplates = useMemo(() => {
        return AI_TEMPLATES.filter(template => {
            const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                template.description.toLowerCase().includes(searchQuery.toLowerCase());

            if (!matchesSearch) return false;

            if (selectedCategory === 'all') return true;
            if (selectedCategory === 'recent') return true; // Placeholder logic for recent

            return template.category === selectedCategory;
        });
    }, [selectedCategory, searchQuery]);

    const handleGenerate = () => {
        if (selectedTemplateId) {
            onGenerate(selectedTemplateId, selectedLanguage);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-[#1a1a1a] w-full md:max-w-6xl h-full md:h-[85vh] rounded-none md:rounded-2xl shadow-2xl overflow-hidden flex flex-col border-0 md:border border-gray-200 dark:border-gray-800"
                onClick={(e) => e.stopPropagation()}
            >

                {/* Header */}
                <div className="flex-shrink-0 px-4 md:px-6 py-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-white dark:bg-[#1a1a1a]">
                    <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">Select a template</h2>
                    <div className="flex items-center gap-2">
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors text-gray-500 dark:text-gray-400 dark:hover:text-white"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* Sidebar - Hidden on Mobile */}
                    <div className="w-64 bg-gray-50 dark:bg-[#141414] border-r border-gray-100 dark:border-white/5 flex flex-col py-4 overflow-y-auto hidden md:flex">
                        <div className="px-4 mb-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    placeholder='Try "Meeting"'
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-400"
                                />
                            </div>
                        </div>

                        <div className="flex-1 px-2 space-y-0.5">
                            {CATEGORIES.map((cat, idx) => (
                                cat.type === 'divider' ? (
                                    <div key={idx} className="my-2 border-t border-gray-200 dark:border-white/5 mx-2" />
                                ) : (
                                    <button
                                        key={cat.id || idx}
                                        onClick={() => cat.id && setSelectedCategory(cat.id)}
                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === cat.id
                                            ? 'bg-gray-200/50 dark:bg-white/10 text-gray-900 dark:text-white'
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
                                            }`}
                                    >
                                        {cat.icon && <cat.icon size={16} />}
                                        {cat.label}
                                    </button>
                                )
                            ))}
                        </div>
                    </div>

                    {/* Main Grid */}
                    <div className="flex-1 bg-white dark:bg-[#1a1a1a] p-4 md:p-6 overflow-y-auto relative scrollbar-hide">
                        {/* Mobile Search - Visible only on mobile */}
                        <div className="mb-4 md:hidden">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    placeholder='Search templates...'
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-lg text-sm text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 pb-32">
                            {filteredTemplates.map((template) => {
                                const isSelected = selectedTemplateId === template.id;
                                return (
                                    <div
                                        key={template.id}
                                        onClick={() => setSelectedTemplateId(template.id)}
                                        className={`group relative p-4 md:p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 flex flex-col h-full min-h-[160px] ${isSelected
                                            ? 'border-blue-600 dark:border-blue-500 bg-gray-50 dark:bg-white/5 shadow-md'
                                            : 'border-transparent bg-white dark:bg-[#1a1a1a] hover:bg-gray-50 dark:hover:bg-white/5 hover:shadow-md border-gray-100 dark:border-white/5'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className={`p-2.5 rounded-lg ${template.color} bg-opacity-10 dark:bg-opacity-20 text-opacity-100`}>
                                                <template.icon size={20} className={template.color.split(' ')[0]} />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setPreviewTemplate(template);
                                                    }}
                                                    className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity"
                                                    title="Preview Template"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                {isSelected && (
                                                    <div className="bg-blue-600 text-white rounded-full p-1">
                                                        <Check size={12} strokeWidth={3} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm md:text-base mb-1.5">
                                            {template.title}
                                        </h3>
                                        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-3">
                                            {template.description}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="flex-shrink-0 px-4 md:px-6 py-4 bg-white dark:bg-[#1a1a1a] border-t border-gray-100 dark:border-white/5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 z-20 pb-8 md:pb-4">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        {/* AI Model - Hidden on very small screens to save space if needed, or kept compact */}
                        <div className="flex flex-col hidden sm:flex">
                            <span className="text-[10px] uppercase font-bold text-gray-400 mb-1">AI Model</span>
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-sm font-medium text-gray-700 dark:text-gray-200 cursor-not-allowed opacity-70">
                                <Sparkles size={14} className="text-blue-500" />
                                <span>Gemini 2.0 Flash</span>
                            </div>
                        </div>

                        {/* Language Selector */}
                        <div className="flex flex-col relative group flex-1 sm:flex-none">
                            <span className="text-[10px] uppercase font-bold text-gray-400 mb-1">Language</span>
                            <button
                                onClick={() => setShowLangMenu(!showLangMenu)}
                                className="flex items-center gap-2 px-3 py-2 md:py-1.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors w-full sm:min-w-[160px] justify-between"
                            >
                                <div className="flex items-center gap-2">
                                    <Languages size={14} className="text-gray-500" />
                                    <span>{LANGUAGES.find(l => l.code === selectedLanguage)?.label}</span>
                                </div>
                                <ChevronDown size={14} className="text-gray-400" />
                            </button>

                            {/* Language Dropdown */}
                            {showLangMenu && (
                                <>
                                    <div
                                        className="fixed inset-0 z-30"
                                        onClick={() => setShowLangMenu(false)}
                                    />
                                    <div className="absolute bottom-full left-0 mb-2 w-full sm:w-48 bg-white dark:bg-[#252525] rounded-xl shadow-xl border border-gray-100 dark:border-white/10 overflow-hidden z-40 py-1">
                                        {LANGUAGES.map(lang => (
                                            <button
                                                key={lang.code}
                                                onClick={() => {
                                                    setSelectedLanguage(lang.code);
                                                    setShowLangMenu(false);
                                                }}
                                                className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-gray-50 dark:hover:bg-white/5 ${selectedLanguage === lang.code
                                                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10'
                                                    : 'text-gray-700 dark:text-gray-300'
                                                    }`}
                                            >
                                                {lang.label}
                                                {selectedLanguage === lang.code && <Check size={14} />}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={!selectedTemplateId || isGenerating}
                        className="w-full md:w-auto px-6 py-3 md:py-2.5 bg-gray-900 dark:bg-white text-white dark:text-black font-semibold rounded-lg shadow-lg shadow-gray-200 dark:shadow-none hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-safe-area"
                    >
                        {isGenerating ? (
                            <>
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles size={16} />
                                Generate now
                            </>
                        )}
                    </button>
                </div>

                {/* Preview Modal Overlay */}
                {previewTemplate && (
                    <div
                        className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-200"
                        onClick={() => setPreviewTemplate(null)}
                    >
                        <div
                            className="bg-white dark:bg-[#1a1a1a] w-full max-w-md max-h-[80vh] rounded-2xl shadow-2xl overflow-y-auto border border-gray-200 dark:border-gray-800 flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6">
                                <div className="flex flex-col items-center text-center mb-6">
                                    <div className={`p-4 rounded-2xl ${previewTemplate.color} bg-opacity-10 dark:bg-opacity-20 text-opacity-100 mb-4`}>
                                        <previewTemplate.icon size={48} className={previewTemplate.color.split(' ')[0]} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                        {previewTemplate.title}
                                    </h3>
                                    <div className="flex items-center gap-2 text-xs text-gray-400 font-medium uppercase tracking-wide">
                                        <span>{previewTemplate.category}</span>
                                        <span>•</span>
                                        <span>Plaud Style</span>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Description</h4>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                            {previewTemplate.description}
                                        </p>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 uppercase tracking-wider text-xs">Outline</h4>
                                        <ul className="space-y-2">
                                            {previewTemplate.outline.map((item, idx) => (
                                                <li key={idx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 border-t border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5 mt-auto">
                                <button
                                    onClick={() => {
                                        setSelectedTemplateId(previewTemplate.id);
                                        setPreviewTemplate(null);
                                    }}
                                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
                                >
                                    Use this template
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
