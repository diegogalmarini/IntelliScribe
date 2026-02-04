import React, { useEffect, useRef, useState } from 'react';
import { Search, X, Mic } from 'lucide-react';
import { Recording } from '../../../types';
import { useLanguage } from '../../../contexts/LanguageContext';

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSearch: (query: string) => void;
    searchQuery: string;
    searchResults: Recording[];
    onSelectResult: (id: string) => void;
    useSemanticSearch: boolean;
    onToggleSemantic: () => void;
    isSearching: boolean;
}

export const SearchModal: React.FC<SearchModalProps> = ({
    isOpen,
    onClose,
    onSearch,
    searchQuery,
    searchResults,
    onSelectResult,
    useSemanticSearch,
    onToggleSemantic,
    isSearching
}) => {
    const { t } = useLanguage();
    const inputRef = useRef<HTMLInputElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    // Close on Escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                ref={modalRef}
                className="w-full max-w-2xl bg-[#f0f4f9] dark:bg-[#1e1e1e] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh] animate-in zoom-in-95 duration-200 border border-white/20"
            >
                {/* Search Bar */}
                <div className="flex items-center gap-3 px-6 py-4 bg-white dark:bg-[#2a2a2a] border-b border-gray-100 dark:border-white/5">
                    <Search className="text-gray-500" size={20} />
                    <input
                        ref={inputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => onSearch(e.target.value)}
                        placeholder={t('search_placeholder_short') || "Buscar..."}
                        className="flex-1 bg-transparent border-none outline-none text-lg text-gray-900 dark:text-white placeholder:text-gray-500"
                    />
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onToggleSemantic}
                            className={`p-2 rounded-full transition-colors ${useSemanticSearch ? 'text-blue-600 bg-blue-100 dark:bg-blue-900/40' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                            title="AI Semantic Search"
                        >
                            <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
                        </button>
                        {searchQuery && (
                            <button onClick={() => onSearch('')} className="p-1 text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Results Area */}
                <div className="flex-1 overflow-y-auto p-2 bg-white dark:bg-[#1a1a1a]">
                    {isSearching ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                            <span className="material-symbols-outlined animate-spin text-3xl mb-2">sync</span>
                            <p className="text-sm">Buscando...</p>
                        </div>
                    ) : searchResults.length > 0 ? (
                        <div className="space-y-1">
                            {searchResults.map((rec) => (
                                <button
                                    key={rec.id}
                                    onClick={() => {
                                        onSelectResult(rec.id);
                                        onClose();
                                    }}
                                    className="w-full flex items-center gap-4 px-4 py-3 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors text-left group"
                                >
                                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg group-hover:bg-white dark:group-hover:bg-blue-900/40 transition-colors">
                                        <span className="material-symbols-outlined">graphic_eq</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-gray-900 dark:text-white truncate">
                                            {rec.title || t('untitledRecording')}
                                        </h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                            <span>
                                                {new Date(rec.date).toLocaleDateString()}
                                            </span>
                                            {rec.summary && (
                                                <span className="truncate max-w-[300px] opacity-70">
                                                    • {rec.summary.substring(0, 50)}...
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                    <span className="material-symbols-outlined text-gray-300 dark:text-gray-600 group-hover:text-blue-500 transition-colors">
                                        arrow_forward
                                    </span>
                                </button>
                            ))}
                        </div>
                    ) : searchQuery ? (
                        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                            <span className="material-symbols-outlined text-4xl mb-2 opacity-50">search_off</span>
                            <p>{t('no_results_found_short')}</p>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-400 dark:text-gray-600">
                            <p>Escribe para buscar en tus grabaciones...</p>
                        </div>
                    )}
                </div>

                {/* Footer / Shortcuts */}
                <div className="px-4 py-2 bg-gray-50 dark:bg-[#252525] border-t border-gray-100 dark:border-white/5 text-[11px] text-gray-500 flex justify-end gap-4">
                    <div className="flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 bg-white dark:bg-[#333] border border-gray-200 dark:border-gray-700 rounded text-xs font-mono">ESC</kbd>
                        <span>para cerrar</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
