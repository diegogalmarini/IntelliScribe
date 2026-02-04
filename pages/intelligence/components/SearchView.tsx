import React, { useRef, useEffect } from 'react';
import { Search, X, Mic } from 'lucide-react';
import { Recording } from '../../../types';
import { useLanguage } from '../../../contexts/LanguageContext';

interface SearchViewProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    searchResults: Recording[];
    onSelectResult: (id: string) => void;
    isSearching: boolean;
    useSemanticSearch: boolean;
    onToggleSemantic: () => void;
}

export const SearchView: React.FC<SearchViewProps> = ({
    searchQuery,
    onSearchChange,
    searchResults,
    onSelectResult,
    isSearching,
    useSemanticSearch,
    onToggleSemantic
}) => {
    const { t } = useLanguage();
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Auto-focus input on mount
        inputRef.current?.focus();
    }, []);

    return (
        <div className="flex flex-col h-full w-full bg-white dark:bg-[#131314] overflow-hidden">
            {/* Centered Search Header */}
            <div className="flex-none px-4 py-8 md:py-12 flex flex-col items-center justify-center">
                <div className="w-full max-w-3xl">
                    <h1 className="text-2xl md:text-3xl font-medium text-center mb-8 text-[#1f1f1f] dark:text-[#e3e3e3]">
                        {t('search_title') || 'Buscar'}
                    </h1>

                    {/* Search Bar Container */}
                    <div className="relative group w-full">
                        <div className={`
                            flex items-center w-full px-5 py-3 md:py-4
                            bg-[#f0f4f9] dark:bg-[#1e1e1e]
                            rounded-full
                            border border-transparent 
                            transition-all duration-200 ease-in-out
                            hover:bg-[#e3e7eb] dark:hover:bg-[#2a2a2a]
                            focus-within:bg-white dark:focus-within:bg-[#303030]
                            focus-within:shadow-[0_1px_6px_0_rgba(32,33,36,0.28)]
                        `}>
                            <Search className="text-gray-500 mr-3" size={20} />
                            <input
                                ref={inputRef}
                                type="text"
                                value={searchQuery}
                                onChange={(e) => onSearchChange(e.target.value)}
                                placeholder={t('search_placeholder') || "Busca en tus grabaciones..."}
                                className="flex-1 bg-transparent border-none outline-none ring-0 focus:ring-0 focus:outline-none focus:border-none shadow-none text-base md:text-lg text-[#1f1f1f] dark:text-[#e3e3e3] placeholder:text-gray-500"
                                style={{ boxShadow: 'none' }}
                            />

                            <div className="flex items-center gap-2 ml-2">
                                {searchQuery && (
                                    <button
                                        onClick={() => onSearchChange('')}
                                        className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                                    >
                                        <X size={18} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Results List */}
            <div className="flex-1 overflow-y-auto px-4 md:px-0 bg-white dark:bg-[#131314]">
                <div className="w-full max-w-3xl mx-auto pb-20">
                    {/* Section Header */}
                    {(searchQuery || searchResults.length > 0) && (
                        <div className="px-4 py-2 mb-2 text-sm font-medium text-gray-500 uppercase tracking-wider">
                            {searchResults.length > 0 ? 'Resultados' : 'Recientes'}
                        </div>
                    )}

                    {isSearching ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                        </div>
                    ) : searchResults.length > 0 ? (
                        <div className="bg-white dark:bg-[#131314] rounded-none md:rounded-xl overflow-hidden">
                            {searchResults.map((rec, index) => (
                                <div
                                    key={rec.id}
                                    onClick={() => onSelectResult(rec.id)}
                                    className={`
                                        group flex items-center justify-between
                                        px-4 py-4 cursor-pointer
                                        border-b border-gray-100 dark:border-white/5
                                        hover:bg-[#f0f4f9] dark:hover:bg-[#1e1e1e]
                                        transition-colors duration-150
                                    `}
                                >
                                    <div className="flex items-center gap-4 min-w-0 flex-1">
                                        <div className="flex-shrink-0 p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full group-hover:bg-white dark:group-hover:bg-blue-900/40 transition-colors">
                                            <span className="material-symbols-outlined">graphic_eq</span>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="text-base text-[#1f1f1f] dark:text-[#e3e3e3] truncate font-normal">
                                                {rec.title || t('untitledRecording')}
                                            </h3>
                                            {rec.summary && (
                                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                                    {rec.summary}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex-shrink-0 ml-4 text-sm text-gray-500 dark:text-gray-400 font-normal">
                                        {new Date(rec.date).toLocaleDateString(undefined, {
                                            day: 'numeric',
                                            month: 'short'
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : searchQuery ? (
                        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                            <p>No se encontraron resultados para "{searchQuery}"</p>
                        </div>
                    ) : (
                        // Empty State / Suggestions
                        <div className="flex flex-col items-center justify-center py-12 opacity-50">
                            {/* Optional: Add recent searches or simplified instructions here */}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
