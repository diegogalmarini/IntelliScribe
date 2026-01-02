import React, { useState, useEffect } from 'react';
import { Upload, X, Calendar, Clock, User, ArrowUp, ArrowDown, Trash2 } from 'lucide-react';
import { UserProfile } from '../../../types';

interface AudioFileItem {
    id: string;
    file: File;
    filename: string;
    duration: number; // seconds
    size: number; // bytes
    extractedDate: Date | null; // parsed from filename
    assignedSpeaker: string;
    order: number;
}

interface MultiAudioUploaderProps {
    user: UserProfile;
    onProcess: (files: AudioFileItem[]) => void;
    onCancel: () => void;
}

export const MultiAudioUploader: React.FC<MultiAudioUploaderProps> = ({ user, onProcess, onCancel }) => {
    const [audioFiles, setAudioFiles] = useState<AudioFileItem[]>([]);
    const [customSpeakers, setCustomSpeakers] = useState<string[]>(['Tú', 'Otra Persona']);
    const [newSpeakerName, setNewSpeakerName] = useState('');
    const [showAddSpeaker, setShowAddSpeaker] = useState(false);

    // Parse WhatsApp filename: "WhatsApp Ptt 2025-12-24 at 14.30.10.ogg"
    const parseWhatsAppFilename = (filename: string): Date | null => {
        const match = filename.match(/(\d{4})-(\d{2})-(\d{2}) at (\d{2})\.(\d{2})\.(\d{2})/);
        if (!match) return null;

        const [_, year, month, day, hour, min, sec] = match;
        return new Date(
            parseInt(year),
            parseInt(month) - 1, // JS months are 0-indexed
            parseInt(day),
            parseInt(hour),
            parseInt(min),
            parseInt(sec)
        );
    };

    // Get audio duration using Audio API
    const getAudioDuration = (file: File): Promise<number> => {
        return new Promise((resolve) => {
            const audio = new Audio();
            audio.src = URL.createObjectURL(file);
            audio.onloadedmetadata = () => {
                URL.revokeObjectURL(audio.src);
                resolve(audio.duration);
            };
            audio.onerror = () => {
                URL.revokeObjectURL(audio.src);
                resolve(0);
            };
        });
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);

        const processedFiles = await Promise.all(
            files.map(async (file, index) => {
                const duration = await getAudioDuration(file);
                const extractedDate = parseWhatsAppFilename(file.name);

                return {
                    id: `${Date.now()}-${index}`,
                    file,
                    filename: file.name,
                    duration,
                    size: file.size,
                    extractedDate,
                    assignedSpeaker: '',
                    order: index
                };
            })
        );

        setAudioFiles(prev => [...prev, ...processedFiles]);
    };

    const sortByDate = () => {
        const sorted = [...audioFiles].sort((a, b) => {
            if (!a.extractedDate || !b.extractedDate) return 0;
            return a.extractedDate.getTime() - b.extractedDate.getTime();
        });
        setAudioFiles(sorted.map((item, idx) => ({ ...item, order: idx })));
    };

    const moveUp = (id: string) => {
        const index = audioFiles.findIndex(f => f.id === id);
        if (index <= 0) return;

        const newFiles = [...audioFiles];
        [newFiles[index], newFiles[index - 1]] = [newFiles[index - 1], newFiles[index]];
        setAudioFiles(newFiles.map((item, idx) => ({ ...item, order: idx })));
    };

    const moveDown = (id: string) => {
        const index = audioFiles.findIndex(f => f.id === id);
        if (index >= audioFiles.length - 1) return;

        const newFiles = [...audioFiles];
        [newFiles[index], newFiles[index + 1]] = [newFiles[index + 1], newFiles[index]];
        setAudioFiles(newFiles.map((item, idx) => ({ ...item, order: idx })));
    };

    const removeFile = (id: string) => {
        setAudioFiles(prev => prev.filter(f => f.id !== id).map((item, idx) => ({ ...item, order: idx })));
    };

    const updateSpeaker = (id: string, speaker: string) => {
        setAudioFiles(prev => prev.map(f => f.id === id ? { ...f, assignedSpeaker: speaker } : f));
    };

    const addCustomSpeaker = () => {
        if (!newSpeakerName.trim()) return;
        setCustomSpeakers(prev => [...prev, newSpeakerName.trim()]);
        setNewSpeakerName('');
        setShowAddSpeaker(false);
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const formatFileSize = (bytes: number) => {
        return (bytes / 1024).toFixed(0) + ' KB';
    };

    const formatDateTime = (date: Date | null) => {
        if (!date) return 'Fecha desconocida';
        return date.toLocaleString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const canProcess = audioFiles.length > 0 && audioFiles.every(f => f.assignedSpeaker);

    return (
        <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#1a1a1a] overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-white/5">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                            Conversación desde Audios de WhatsApp
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Sube múltiples audios y crea una transcripción unificada con timestamps
                        </p>
                    </div>
                    <button
                        onClick={onCancel}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors"
                    >
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                {/* Upload Area */}
                {audioFiles.length === 0 ? (
                    <label className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer hover:border-primary dark:hover:border-primary transition-colors">
                        <Upload size={48} className="text-slate-400 dark:text-slate-500 mb-4" />
                        <p className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                            Selecciona audios de WhatsApp
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                            Soporta .ogg, .mp3, .m4a, .wav
                        </p>
                        <input
                            type="file"
                            multiple
                            accept="audio/*"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                        <div className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium">
                            Explorar archivos
                        </div>
                    </label>
                ) : (
                    <div className="space-y-6">
                        {/* Toolbar */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <label className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                    <input
                                        type="file"
                                        multiple
                                        accept="audio/*"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />
                                    + Añadir más audios
                                </label>
                                <button
                                    onClick={sortByDate}
                                    className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                                >
                                    Ordenar por fecha
                                </button>
                            </div>
                            <span className="text-sm text-slate-500 dark:text-slate-400">
                                {audioFiles.length} archivo{audioFiles.length !== 1 ? 's' : ''}
                            </span>
                        </div>

                        {/* Audio Files List */}
                        <div className="space-y-3">
                            {audioFiles.map((audio, index) => (
                                <div
                                    key={audio.id}
                                    className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800"
                                >
                                    {/* Order Number */}
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                                        {index + 1}
                                    </div>

                                    {/* File Info */}
                                    <div className="flex-1 min-w-0 space-y-2">
                                        <h3 className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                            {audio.filename}
                                        </h3>

                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                                            <div className="flex items-center gap-1">
                                                <Calendar size={14} />
                                                <span>{formatDateTime(audio.extractedDate)}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock size={14} />
                                                <span>{formatDuration(audio.duration)}</span>
                                            </div>
                                            <span>{formatFileSize(audio.size)}</span>
                                        </div>

                                        {/* Speaker Assignment */}
                                        <div className="flex items-center gap-2">
                                            <User size={16} className="text-slate-400" />
                                            <select
                                                value={audio.assignedSpeaker}
                                                onChange={(e) => updateSpeaker(audio.id, e.target.value)}
                                                className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary"
                                            >
                                                <option value="">Seleccionar hablante...</option>
                                                {customSpeakers.map(speaker => (
                                                    <option key={speaker} value={speaker}>{speaker}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex-shrink-0 flex flex-col gap-1">
                                        <button
                                            onClick={() => moveUp(audio.id)}
                                            disabled={index === 0}
                                            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                            title="Mover arriba"
                                        >
                                            <ArrowUp size={16} className="text-slate-600 dark:text-slate-400" />
                                        </button>
                                        <button
                                            onClick={() => moveDown(audio.id)}
                                            disabled={index === audioFiles.length - 1}
                                            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                            title="Mover abajo"
                                        >
                                            <ArrowDown size={16} className="text-slate-600 dark:text-slate-400" />
                                        </button>
                                        <button
                                            onClick={() => removeFile(audio.id)}
                                            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                            title="Eliminar"
                                        >
                                            <Trash2 size={16} className="text-red-600 dark:text-red-400" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Add Custom Speaker */}
                        <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                            {showAddSpeaker ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={newSpeakerName}
                                        onChange={(e) => setNewSpeakerName(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && addCustomSpeaker()}
                                        placeholder="Nombre del hablante..."
                                        className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary"
                                        autoFocus
                                    />
                                    <button
                                        onClick={addCustomSpeaker}
                                        className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                                    >
                                        Añadir
                                    </button>
                                    <button
                                        onClick={() => { setShowAddSpeaker(false); setNewSpeakerName(''); }}
                                        className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowAddSpeaker(true)}
                                    className="text-sm text-primary hover:text-blue-600 dark:hover:text-blue-400 font-medium"
                                >
                                    + Añadir hablante personalizado
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            {audioFiles.length > 0 && (
                <div className="px-6 py-4 border-t border-slate-200 dark:border-white/5 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                        {!canProcess && (
                            <span className="text-amber-600 dark:text-amber-400">
                                ⚠️ Asigna un hablante a cada audio para continuar
                            </span>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onCancel}
                            className="px-6 py-2 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-sm font-medium hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={() => onProcess(audioFiles)}
                            disabled={!canProcess}
                            className="px-6 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Procesar Conversación ({audioFiles.length})
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
