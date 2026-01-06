import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    isDestructive = false
}) => {
    const { theme } = useTheme();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm bg-white dark:bg-[#1e1e1e] rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 transform transition-all scale-100 opacity-100">

                {/* Header */}
                <div className="flex items-start justify-between p-4 pb-2">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${isDestructive ? 'bg-red-100 dark:bg-red-900/20' : 'bg-blue-100 dark:bg-blue-900/20'}`}>
                            <AlertTriangle size={20} className={isDestructive ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                            {title}
                        </h3>
                    </div>
                </div>

                {/* Body */}
                <div className="px-6 py-2">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        {message}
                    </p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-4 pt-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${isDestructive
                                ? 'bg-red-600 hover:bg-red-700'
                                : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};
