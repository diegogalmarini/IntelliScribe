import React, { useState, useMemo } from 'react';
import { X, Search, Sparkles, Star, Clock, LayoutGrid, Check, ChevronDown, Wand2, Languages, Microscope, Scale, Building2, Stethoscope, GraduationCap, PenTool, Radio } from 'lucide-react';
import { AI_TEMPLATES, AITemplate } from '../../../constants/templates';

interface AnalysisModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGenerate: (templateId: string, language: string) => void;
    isGenerating: boolean;
}

const CATEGORIES = [
    { id: 'all', label: 'All files', icon: LayoutGrid },
    { id: 'favorites', label: 'Favorites', icon: Star },
    { id: 'recent', label: 'Recently used', icon: Clock },
    { type: 'divider' },
    { id: 'General', label: 'General', icon: Wand2 },
    { id: 'Business', label: 'Meeting & Business', icon: Building2 },
    { id: 'Education', label: 'Education', icon: GraduationCap },
    { id: 'Medical', label: 'Medical', icon: Stethoscope },
    { id: 'Legal', label: 'Legal', icon: Scale },
    { id: 'HR', label: 'HR & Recruiting', icon: UsersIcon },
    { id: 'Product', label: 'Product & UX', icon: Microscope },
    { id: 'Periodismo', label: 'Journalism', icon: Radio },
    { id: 'Research', label: 'Research', icon: PenTool },
];

function UsersIcon(props: any) { return <Users {...props} /> }
import { Users } from 'lucide-react';

const LANGUAGES = [
    { code: 'es', label: 'Spanish (Spain)' },
    { code: 'en', label: 'English (US)' },
    { code: 'fr', label: 'French' },
    { code: 'de', label: 'German' },
    { code: 'it', label: 'Italian' },
    { code: 'pt', label: 'Portuguese' },
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

    // Filtering logic
    const filteredTemplates = useMemo(() => {
        return AI_TEMPLATES.filter(template => {
            const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                template.description.toLowerCase().includes(searchQuery.toLowerCase());

            if (!matchesSearch) return false;

            if (selectedCategory === 'all') return true;
            if (selectedCategory === 'recent') return true;
            if (selectedCategory === 'favorites') return false;

            return template.category === selectedCategory || (selectedCategory === 'Business' && template.category === 'Meeting');
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
                className="bg-white dark:bg-[#1a1a1a] w-full max-w-6xl h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-gray-200 dark:border-gray-800"
                onClick={(e) => e.stopPropagation()}
            >

                {/* Header */}
                <div className="flex-shrink-0 px-6 py-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-white dark:bg-[#1a1a1a]">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Select a template</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors text-gray-500 dark:text-gray-400 dark:hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* Sidebar */}
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
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.id!)}
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
                    <div className="flex-1 bg-white dark:bg-[#1a1a1a] p-6 overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredTemplates.map((template) => {
                                const isSelected = selectedTemplateId === template.id;
                                return (
                                    <div
                                        key={template.id}
                                        onClick={() => setSelectedTemplateId(template.id)}
                                        className={`group relative p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 flex flex-col h-full ${isSelected
                                                ? 'border-blue-600 dark:border-blue-500 bg-gray-50 dark:bg-white/5 shadow-md'
                                                : 'border-transparent bg-white dark:bg-[#1a1a1a] hover:bg-gray-50 dark:hover:bg-white/5 hover:shadow-md border-gray-100 dark:border-white/5'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className={`p-2.5 rounded-lg ${template.color} bg-opacity-10 dark:bg-opacity-20 text-opacity-100`}>
                                                <template.icon size={24} className={template.color.split(' ')[0]} />
                                            </div>
                                            {isSelected && (
                                                <div className="bg-blue-600 text-white rounded-full p-1">
                                                    <Check size={12} strokeWidth={3} />
                                                </div>
                                            )}
                                        </div>

                                        <h3 className="font-semibold text-gray-900 dark:text-white text-base mb-2">
                                            {template.title}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-3">
                                            {template.description}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="flex-shrink-0 px-6 py-4 bg-white dark:bg-[#1a1a1a] border-t border-gray-100 dark:border-white/5 flex items-center justify-between z-20">
                    <div className="flex items-center gap-4">
                        {/* AI Model - Static for now */}
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-bold text-gray-400 mb-1">AI Model</span>
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-sm font-medium text-gray-700 dark:text-gray-200 cursor-not-allowed opacity-70">
                                <Sparkles size={14} className="text-blue-500" />
                                <span>Gemini 2.0 Flash</span>
                            </div>
                        </div>

                        {/* Language Selector */}
                        <div className="flex flex-col relative group">
                            <span className="text-[10px] uppercase font-bold text-gray-400 mb-1">Language</span>
                            <button
                                onClick={() => setShowLangMenu(!showLangMenu)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors min-w-[160px] justify-between"
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
                                    <div className="absolute bottom-full left-0 mb-2 w-48 bg-white dark:bg-[#252525] rounded-xl shadow-xl border border-gray-100 dark:border-white/10 overflow-hidden z-40 py-1">
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
                        className="px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-black font-semibold rounded-lg shadow-lg shadow-gray-200 dark:shadow-none hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
            </div>
        </div>
    );
};
