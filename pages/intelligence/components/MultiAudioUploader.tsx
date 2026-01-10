import React, { useState, useEffect, useRef } from 'react';
import { Upload, X, Calendar, Clock, User, ArrowUp, ArrowDown, Trash2, Play, Pause, Check } from 'lucide-react';
import { UserProfile } from '../../../types';

interface AudioFileItem {
    id: string;
    file: File;
    filename: string;
    duration: number;
    size: number;
    extractedDate: Date | null;
    assignedSpeaker: string;
    order: number;
    audioUrl?: string;
}

interface MultiAudioUploaderProps {
    user: UserProfile;
    onProcess: (files: AudioFileItem[]) => void;
    onCancel: () => void;
}

export const MultiAudioUploader: React.FC<MultiAudioUploaderProps> = ({ user, onProcess, onCancel }) => {
    const [audioFiles, setAudioFiles] = useState<AudioFileItem[]>([]);
    const [step, setStep] = useState<'upload' | 'mapping'>('upload');
    const [speakerMapping, setSpeakerMapping] = useState<Record<string, string>>({});
    const [playingId, setPlayingId] = useState<string | null>(null);
    const audioRefs = useRef<Record<string, HTMLAudioElement>>({});

    // Predefined speaker options
    const speakerOptions = [
        'Hablante 1',
        'Hablante 2',
        'Hablante 3',
        'Hablante 4',
        'Hablante 5',
        'Hablante 6',
        'Hablante 7',
        'Hablante 8',
        'Hablante 9',
        'Hablante 10'
    ];

    const parseAudioFilename = (filename: string): Date | null => {
        const match = filename.match(/(\d{4})-(\d{2})-(\d{2}) at (\d{2})\.(\d{2})\.(\d{2})/);
        if (!match) return null;
        const [_, year, month, day, hour, min, sec] = match;
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(min), parseInt(sec));
    };

    const getAudioDuration = (file: File): Promise<number> => {
        return new Promise((resolve) => {
            const audio = new Audio();
            audio.src = URL.createObjectURL(file);
            audio.onloadedmetadata = () => resolve(audio.duration);
            audio.onerror = () => resolve(0);
        });
    };

    const [isDragging, setIsDragging] = useState(false);

    // Common file processor
    const processFiles = async (files: File[]) => {
        const processedFiles = await Promise.all(
            files.map(async (file, index) => {
                const duration = await getAudioDuration(file);
                const extractedDate = parseAudioFilename(file.name);
                const audioUrl = URL.createObjectURL(file);
                return {
                    id: `${Date.now()}-${index}`,
                    file,
                    filename: file.name,
                    duration,
                    size: file.size,
                    extractedDate,
                    assignedSpeaker: '',
                    order: index,
                    audioUrl
                };
            })
        );
        setAudioFiles(prev => [...prev, ...processedFiles]);
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        await processFiles(files);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('audio/'));
        if (files.length > 0) {
            await processFiles(files);
        }
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
        const file = audioFiles.find(f => f.id === id);
        if (file?.audioUrl) URL.revokeObjectURL(file.audioUrl);
        setAudioFiles(prev => prev.filter(f => f.id !== id).map((item, idx) => ({ ...item, order: idx })));
    };

    const updateSpeaker = (id: string, speaker: string) => {
        setAudioFiles(prev => prev.map(f => f.id === id ? { ...f, assignedSpeaker: speaker } : f));
    };

    const togglePlayAudio = (id: string) => {
        const file = audioFiles.find(f => f.id === id);
        if (!file?.audioUrl) return;

        if (playingId && playingId !== id) {
            const currentAudio = audioRefs.current[playingId];
            if (currentAudio) {
                currentAudio.pause();
                currentAudio.currentTime = 0;
            }
        }

        let audio = audioRefs.current[id];
        if (!audio) {
            audio = new Audio(file.audioUrl);
            audioRefs.current[id] = audio;
            audio.onended = () => setPlayingId(null);
        }

        if (playingId === id) {
            audio.pause();
            audio.currentTime = 0;
            setPlayingId(null);
        } else {
            audio.play();
            setPlayingId(id);
        }
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const formatFileSize = (bytes: number) => (bytes / 1024).toFixed(0) + ' KB';

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

    const getUniqueSpeakers = () => [...new Set(audioFiles.map(f => f.assignedSpeaker).filter(Boolean))];

    const canProceed = audioFiles.length > 0 && audioFiles.every(f => f.assignedSpeaker);

    const handleNext = () => {
        const speakers = getUniqueSpeakers();
        if (speakers.length > 0) {
            const mapping: Record<string, string> = {};
            speakers.forEach(speaker => { mapping[speaker] = speaker; });
            setSpeakerMapping(mapping);
            setStep('mapping');
        }
    };

    const handleProcessFinal = () => {
        console.log('[MultiAudioUploader] handleProcessFinal called');
        console.log('[MultiAudioUploader] audioFiles:', audioFiles.length);
        console.log('[MultiAudioUploader] speakerMapping:', speakerMapping);

        // Apply speaker mapping
        const mappedFiles = audioFiles.map(file => ({
            ...file,
            assignedSpeaker: speakerMapping[file.assignedSpeaker] || file.assignedSpeaker
        }));

        console.log('[MultiAudioUploader] Calling onProcess with:', mappedFiles);
        onProcess(mappedFiles);
    };

    const canFinalize = Object.values(speakerMapping).every(name => name.trim().length > 0);

    useEffect(() => {
        return () => {
            audioFiles.forEach(file => { if (file.audioUrl) URL.revokeObjectURL(file.audioUrl); });
            Object.values(audioRefs.current).forEach(audio => audio.pause());
        };
    }, []);

    return (
        <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#1a1a1a] overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-white/5">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                            {step === 'upload' ? 'Conversación Multi-Audio' : 'Identificar Hablantes'}
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            {step === 'upload' ? 'Sube los audios y asígnalos a hablantes. Click en el número para escuchar.' : 'Confirma o edita el nombre de cada hablante'}
                        </p>
                    </div>
                    <button onClick={onCancel} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                {step === 'upload' ? (
                    <>
                        {audioFiles.length === 0 ? (
                            <label
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${isDragging
                                        ? 'border-primary bg-blue-50 dark:bg-blue-900/20 scale-[1.02]'
                                        : 'border-slate-300 dark:border-slate-700 hover:border-primary dark:hover:border-primary'
                                    }`}
                            >
                                <Upload size={48} className={`mb-4 transition-colors ${isDragging ? 'text-primary' : 'text-slate-400 dark:text-slate-500'}`} />
                                <p className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                                    {isDragging ? '¡Suelta los audios aquí!' : 'Selecciona audios de conversación'}
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Soporta .ogg, .mp3, .m4a, .wav</p>
                                <input type="file" multiple accept="audio/*" onChange={handleFileSelect} className="hidden" />
                                <div className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isDragging ? 'bg-blue-600 text-white shadow-lg' : 'bg-primary text-white'
                                    }`}>
                                    Explorar archivos
                                </div>
                            </label>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <label className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                            <input type="file" multiple accept="audio/*" onChange={handleFileSelect} className="hidden" />
                                            + Añadir más audios
                                        </label>
                                        <button onClick={sortByDate} className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                                            Ordenar por fecha
                                        </button>
                                    </div>
                                    <span className="text-sm text-slate-500 dark:text-slate-400">{audioFiles.length} archivo{audioFiles.length !== 1 ? 's' : ''}</span>
                                </div>

                                <div className="space-y-3">
                                    {audioFiles.map((audio, index) => (
                                        <div key={audio.id} className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
                                            <button onClick={() => togglePlayAudio(audio.id)} className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-blue-600 transition-all" title="Click para escuchar">
                                                {playingId === audio.id ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
                                            </button>

                                            <div className="flex-1 min-w-0 space-y-2">
                                                <h3 className="text-sm font-medium text-slate-900 dark:text-white truncate">{audio.filename}</h3>
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                                                    <div className="flex items-center gap-1"><Calendar size={14} /><span>{formatDateTime(audio.extractedDate)}</span></div>
                                                    <div className="flex items-center gap-1"><Clock size={14} /><span>{formatDuration(audio.duration)}</span></div>
                                                    <span>{formatFileSize(audio.size)}</span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <User size={16} className="text-slate-400 flex-shrink-0" />
                                                    <select
                                                        value={audio.assignedSpeaker}
                                                        onChange={(e) => updateSpeaker(audio.id, e.target.value)}
                                                        className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                                    >
                                                        <option value="">Seleccionar hablante...</option>
                                                        {speakerOptions.map(speaker => (
                                                            <option key={speaker} value={speaker}>{speaker}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="flex-shrink-0 flex flex-col gap-1">
                                                <button onClick={() => moveUp(audio.id)} disabled={index === 0} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed" title="Mover arriba"><ArrowUp size={16} className="text-slate-600 dark:text-slate-400" /></button>
                                                <button onClick={() => moveDown(audio.id)} disabled={index === audioFiles.length - 1} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed" title="Mover abajo"><ArrowDown size={16} className="text-slate-600 dark:text-slate-400" /></button>
                                                <button onClick={() => removeFile(audio.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors" title="Eliminar"><Trash2 size={16} className="text-red-600 dark:text-red-400" /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="max-w-2xl mx-auto space-y-6">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800/30">
                            <p className="text-sm text-blue-900 dark:text-blue-200">💡 <strong>Tip:</strong> Confirma o edita el nombre final de cada hablante identificado.</p>
                        </div>

                        {Object.entries(speakerMapping).map(([speaker, name]) => (
                            <div key={speaker} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center"><User size={20} /></div>
                                <div className="flex-1">
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Identificado como: <span className="font-medium text-slate-700 dark:text-slate-300">"{speaker}"</span></p>
                                    <input type="text" value={name} onChange={(e) => setSpeakerMapping(prev => ({ ...prev, [speaker]: e.target.value }))} placeholder="Nombre final..." className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
                                </div>
                                <div className="flex-shrink-0">
                                    {name.trim() && name === speaker && <Check size={20} className="text-green-500" />}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {audioFiles.length > 0 && (
                <div className="px-6 py-4 border-t border-slate-200 dark:border-white/5 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                        {step === 'upload' ? (
                            !canProceed && <span className="text-amber-600 dark:text-amber-400">⚠️ Asigna un hablante a cada audio para continuar</span>
                        ) : (
                            !canFinalize && <span className="text-amber-600 dark:text-amber-400">⚠️ Completa el nombre de todos los hablantes</span>
                        )}
                    </div>
                    <div className="flex gap-3">
                        {step === 'mapping' && (
                            <button onClick={() => setStep('upload')} className="px-6 py-2 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-sm font-medium hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">← Volver</button>
                        )}
                        <button onClick={onCancel} className="px-6 py-2 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-sm font-medium hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">Cancelar</button>
                        {step === 'upload' ? (
                            <button onClick={handleNext} disabled={!canProceed} className="px-6 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Siguiente ({audioFiles.length}) →</button>
                        ) : (
                            <button onClick={handleProcessFinal} disabled={!canFinalize} className="px-6 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Procesar Conversación ({audioFiles.length})</button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
