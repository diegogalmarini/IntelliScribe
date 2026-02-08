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
    isProcessing?: boolean;
}

export const MultiAudioUploader: React.FC<MultiAudioUploaderProps> = ({ user, onProcess, onCancel, isProcessing = false }) => {
    // ... existing state ...

    // ... existing functions ...

    return (
        <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#1a1a1a] overflow-hidden relative">
            {isProcessing && (
                <div className="absolute inset-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Procesando audios...</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Esto puede tomar unos minutos. Por favor, no cierres esta ventana.</p>
                </div>
            )}

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
                    <button onClick={onCancel} disabled={isProcessing} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors disabled:opacity-50">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                {/* ... existing content ... */}
                {step === 'upload' ? (
                    // ... same upload content ...
                    <>
                        {audioFiles.length === 0 ? (
                            <label
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${isDragging
                                    ? 'border-primary bg-blue-50 dark:bg-blue-900/20 scale-[1.02]'
                                    : 'border-slate-300 dark:border-slate-700 hover:border-primary dark:hover:border-primary'
                                    } ${isProcessing ? 'pointer-events-none opacity-50' : ''}`}
                            >
                                {/* ... content ... */}
                                <Upload size={48} className={`mb-4 transition-colors ${isDragging ? 'text-primary' : 'text-slate-400 dark:text-slate-500'}`} />
                                <p className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                                    {isDragging ? '¡Suelta los audios aquí!' : 'Selecciona audios de conversación'}
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Soporta .ogg, .mp3, .m4a, .wav</p>
                                <input type="file" multiple accept="audio/*" onChange={handleFileSelect} className="hidden" disabled={isProcessing} />
                                <div className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isDragging ? 'bg-blue-600 text-white shadow-lg' : 'bg-primary text-white'
                                    }`}>
                                    Explorar archivos
                                </div>
                            </label>
                        ) : (
                            <div className={`space-y-6 ${isProcessing ? 'pointer-events-none opacity-50' : ''}`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <label className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                            <input type="file" multiple accept="audio/*" onChange={handleFileSelect} className="hidden" disabled={isProcessing} />
                                            + Añadir más audios
                                        </label>
                                        <button onClick={sortByDate} disabled={isProcessing} className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                                            Ordenar por fecha
                                        </button>
                                    </div>
                                    <span className="text-sm text-slate-500 dark:text-slate-400">{audioFiles.length} archivo{audioFiles.length !== 1 ? 's' : ''}</span>
                                </div>

                                <div className="space-y-3">
                                    {audioFiles.map((audio, index) => (
                                        <div key={audio.id} className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
                                            <button onClick={() => togglePlayAudio(audio.id)} disabled={isProcessing} className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-blue-600 transition-all disabled:opacity-50" title="Click para escuchar">
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
                                                        disabled={isProcessing}
                                                        className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
                                                    >
                                                        <option value="">Seleccionar hablante...</option>
                                                        {speakerOptions.map(speaker => (
                                                            <option key={speaker} value={speaker}>{speaker}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="flex-shrink-0 flex flex-col gap-1">
                                                <button onClick={() => moveUp(audio.id)} disabled={index === 0 || isProcessing} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed" title="Mover arriba"><ArrowUp size={16} className="text-slate-600 dark:text-slate-400" /></button>
                                                <button onClick={() => moveDown(audio.id)} disabled={index === audioFiles.length - 1 || isProcessing} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed" title="Mover abajo"><ArrowDown size={16} className="text-slate-600 dark:text-slate-400" /></button>
                                                <button onClick={() => removeFile(audio.id)} disabled={isProcessing} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-50" title="Eliminar"><Trash2 size={16} className="text-red-600 dark:text-red-400" /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className={`max-w-2xl mx-auto space-y-6 ${isProcessing ? 'pointer-events-none opacity-50' : ''}`}>
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800/30">
                            <p className="text-sm text-blue-900 dark:text-blue-200">💡 <strong>Tip:</strong> Confirma o edita el nombre final de cada hablante identificado.</p>
                        </div>

                        {Object.entries(speakerMapping).map(([speaker, name]) => (
                            <div key={speaker} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center"><User size={20} /></div>
                                <div className="flex-1">
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Identificado como: <span className="font-medium text-slate-700 dark:text-slate-300">"{speaker}"</span></p>
                                    <input type="text" value={name} onChange={(e) => setSpeakerMapping(prev => ({ ...prev, [speaker]: e.target.value }))} disabled={isProcessing} placeholder="Nombre final..." className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50" />
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
                            <button onClick={() => setStep('upload')} disabled={isProcessing} className="px-6 py-2 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-sm font-medium hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors disabled:opacity-50">← Volver</button>
                        )}
                        <button onClick={onCancel} disabled={isProcessing} className="px-6 py-2 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-sm font-medium hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors disabled:opacity-50">Cancelar</button>
                        {step === 'upload' ? (
                            <button onClick={handleNext} disabled={!canProceed || isProcessing} className="px-6 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Siguiente ({audioFiles.length}) →</button>
                        ) : (
                            <button onClick={handleProcessFinal} disabled={!canFinalize || isProcessing} className="px-6 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                {isProcessing ? 'Procesando...' : `Procesar Conversación (${audioFiles.length})`}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
