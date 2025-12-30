import React from 'react';
import { X, FileText, Users, GraduationCap, Mic, Briefcase, Sparkles } from 'lucide-react';

interface AnalysisModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGenerate: (template: string) => void;
    isGenerating: boolean;
}

const templates = [
    {
        id: 'general',
        icon: FileText,
        title: 'General',
        description: 'Resumen estructurado con puntos clave y conclusiones.',
        color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
    },
    {
        id: 'meeting',
        icon: Users,
        title: 'Reunión',
        description: 'Acta con decisiones tomadas y tareas pendientes.',
        color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
    },
    {
        id: 'class',
        icon: GraduationCap,
        title: 'Clase/Conferencia',
        description: 'Conceptos clave, definiciones y puntos de examen.',
        color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
    },
    {
        id: 'interview',
        icon: Mic,
        title: 'Entrevista',
        description: 'Perfil del candidato, preguntas y fortalezas.',
        color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
    },
    {
        id: 'sales',
        icon: Briefcase,
        title: 'Ventas',
        description: 'Necesidades cliente, objeciones y próximos pasos.',
        color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
    }
];

export const AnalysisModal: React.FC<AnalysisModalProps> = ({
    isOpen,
    onClose,
    onGenerate,
    isGenerating
}) => {
    const [selectedTemplate, setSelectedTemplate] = React.useState('general');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-200 dark:border-gray-800 transform transition-all animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                        <Sparkles size={20} className="text-blue-600 dark:text-blue-400" />
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Generar Resumen IA</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-500"
                        disabled={isGenerating}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                        Selecciona el tipo de análisis que deseas realizar. La Inteligencia Artificial adaptará el resumen al contexto específico.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {templates.map((template) => (
                            <button
                                key={template.id}
                                onClick={() => setSelectedTemplate(template.id)}
                                className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 flex items-start gap-4 hover:shadow-md ${selectedTemplate === template.id
                                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/10'
                                        : 'border-transparent bg-gray-50 dark:bg-[#252525] hover:bg-gray-100 dark:hover:bg-[#2a2a2a]'
                                    }`}
                                disabled={isGenerating}
                            >
                                <div className={`p-2 rounded-lg ${template.color}`}>
                                    <template.icon size={20} />
                                </div>
                                <div>
                                    <h3 className={`font-medium mb-1 ${selectedTemplate === template.id
                                            ? 'text-blue-700 dark:text-blue-300'
                                            : 'text-gray-900 dark:text-gray-200'
                                        }`}>
                                        {template.title}
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                        {template.description}
                                    </p>
                                </div>
                                {selectedTemplate === template.id && (
                                    <div className="absolute top-4 right-4 w-3 h-3 bg-blue-600 rounded-full animate-bounce" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 dark:bg-[#1f1f1f] border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        disabled={isGenerating}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => onGenerate(selectedTemplate)}
                        className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg hover:shadow-blue-500/25 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        disabled={isGenerating}
                    >
                        {isGenerating ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Analizando...
                            </>
                        ) : (
                            <>
                                <Sparkles size={16} />
                                Generar Resumen
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
