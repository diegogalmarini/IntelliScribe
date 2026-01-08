import React, { useState } from 'react';
import { Recording } from '../../../types';
import { X, Download, FileText, FileJson } from 'lucide-react';
import * as exportUtils from '../../../utils/exportUtils';

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    recording: Recording;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, recording }) => {
    const [exporting, setExporting] = useState(false);

    if (!isOpen) return null;

    const exportAsText = () => {
        let content = `${recording.title}\n\n`;
        content += `Fecha: ${new Date(recording.date).toLocaleDateString('es-ES')}\n`;
        content += `Duración: ${recording.duration || 'N/A'}\n\n`;

        if (recording.summary) {
            content += `RESUMEN:\n${recording.summary}\n\n`;
        }

        content += `TRANSCRIPCIÓN:\n`;
        if (recording.segments) {
            recording.segments.forEach(seg => {
                content += `[${seg.timestamp}] ${seg.speaker}: ${seg.text}\n`;
            });
        }

        downloadFile(content, `${recording.title || 'transcripcion'}.txt`, 'text/plain');
    };

    const exportAsJSON = () => {
        const data = {
            title: recording.title,
            date: recording.date,
            duration: recording.duration,
            summary: recording.summary,
            transcript: recording.segments,
            audioUrl: recording.audioUrl
        };

        const jsonString = JSON.stringify(data, null, 2);
        downloadFile(jsonString, `${recording.title || 'recording'}.json`, 'application/json');
    };

    const exportAsPDF = async () => {
        await exportUtils.exportAsPDF(recording, { includeSummary: true, includeTranscript: true }, () => setExporting(true), () => { setExporting(false); onClose(); });
    };

    const exportAsDoc = () => {
        exportUtils.exportAsDoc(recording, { includeSummary: true, includeTranscript: true }, () => setExporting(true), () => { setExporting(false); onClose(); });
    };

    const downloadFile = (content: string, filename: string, type: string) => {
        const blob = new Blob([content], { type });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm p-0 md:p-4">
            <div className="w-full h-full md:h-auto md:max-w-lg bg-white dark:bg-[#2a2a2a] rounded-none md:rounded-2xl shadow-2xl flex flex-col md:block overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-black/[0.05] dark:border-white/[0.05] shrink-0">
                    <div>
                        <h2 className="text-lg font-semibold text-[#0d0d0d] dark:text-white">
                            Exportar Grabación
                        </h2>
                        <p className="text-[12px] text-[#8e8e8e] mt-1">
                            {recording.title}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X size={20} className="text-[#8e8e8e]" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 md:flex-none overflow-y-auto p-6 space-y-3">
                    <p className="text-[13px] text-[#8e8e8e] mb-4">
                        Selecciona el formato en el que deseas exportar esta grabación:
                    </p>

                    {/* TXT Export */}
                    <button
                        onClick={exportAsText}
                        className="w-full flex items-center gap-4 p-4 bg-[#f7f7f8] dark:bg-[#33343d] hover:bg-[#ebebeb] dark:hover:bg-[#3a3b44] rounded-xl transition-colors group"
                    >
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:scale-110 transition-transform">
                            <FileText size={24} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 text-left">
                            <h3 className="text-[14px] font-semibold text-[#0d0d0d] dark:text-white">
                                Texto Plano (TXT)
                            </h3>
                            <p className="text-[12px] text-[#8e8e8e]">
                                Transcripción con resumen en formato texto
                            </p>
                        </div>
                        <Download size={18} className="text-[#8e8e8e]" />
                    </button>

                    {/* JSON Export */}
                    <button
                        onClick={exportAsJSON}
                        className="w-full flex items-center gap-4 p-4 bg-[#f7f7f8] dark:bg-[#33343d] hover:bg-[#ebebeb] dark:hover:bg-[#3a3b44] rounded-xl transition-colors group"
                    >
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg group-hover:scale-110 transition-transform">
                            <FileJson size={24} className="text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1 text-left">
                            <h3 className="text-[14px] font-semibold text-[#0d0d0d] dark:text-white">
                                JSON
                            </h3>
                            <p className="text-[12px] text-[#8e8e8e]">
                                Datos estructurados para desarrollo
                            </p>
                        </div>
                        <Download size={18} className="text-[#8e8e8e]" />
                    </button>

                    {/* PDF Export */}
                    <button
                        onClick={exportAsPDF}
                        disabled={exporting}
                        className="w-full flex items-center gap-4 p-4 bg-[#f7f7f8] dark:bg-[#33343d] hover:bg-[#ebebeb] dark:hover:bg-[#3a3b44] rounded-xl transition-colors group disabled:opacity-50"
                    >
                        <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg group-hover:scale-110 transition-transform">
                            <FileText size={24} className="text-red-600 dark:text-red-400" />
                        </div>
                        <div className="flex-1 text-left">
                            <h3 className="text-[14px] font-semibold text-[#0d0d0d] dark:text-white">
                                PDF
                            </h3>
                            <p className="text-[12px] text-[#8e8e8e]">
                                Documento con formato profesional
                            </p>
                        </div>
                        <Download size={18} className="text-[#8e8e8e]" />
                    </button>

                    {/* DOCX Export */}
                    <button
                        onClick={exportAsDoc}
                        disabled={exporting}
                        className="w-full flex items-center gap-4 p-4 bg-[#f7f7f8] dark:bg-[#33343d] hover:bg-[#ebebeb] dark:hover:bg-[#3a3b44] rounded-xl transition-colors group disabled:opacity-50"
                    >
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:scale-110 transition-transform">
                            <FileText size={24} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 text-left">
                            <h3 className="text-[14px] font-semibold text-[#0d0d0d] dark:text-white">
                                Word (DOC)
                            </h3>
                            <p className="text-[12px] text-[#8e8e8e]">
                                Editable en Microsoft Word
                            </p>
                        </div>
                        <Download size={18} className="text-[#8e8e8e]" />
                    </button>
                </div>

                {/* Footer */}
                <div className="p-6 pt-4 border-t border-black/[0.05] dark:border-white/[0.05] bg-white dark:bg-[#2a2a2a] shrink-0 pb-24 md:pb-6">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-3 bg-[#f7f7f8] dark:bg-[#33343d] hover:bg-[#ebebeb] dark:hover:bg-[#3a3b44] text-[#0d0d0d] dark:text-white rounded-xl font-medium transition-colors"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};
