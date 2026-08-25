import React, { useState } from 'react';
import { X, Youtube, Loader2, Info } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { transcribeYouTube, YouTubeTranscription } from '../../../services/geminiService';

const IDIOMAS = [
    { codigo: 'es', nombre: 'Español' },
    { codigo: 'en', nombre: 'English' },
    { codigo: 'pt', nombre: 'Português' },
    { codigo: 'fr', nombre: 'Français' },
    { codigo: 'de', nombre: 'Deutsch' },
    { codigo: 'it', nombre: 'Italiano' }
];

interface YouTubeImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onTranscribed: (data: YouTubeTranscription) => Promise<void> | void;
}

/** Traduce el codigo que devuelve el servidor a un mensaje util. */
const claveDeError = (mensaje: string): string => {
    if (mensaje.includes('INVALID_YOUTUBE_URL')) return 'youtube_err_url';
    if (mensaje.includes('VIDEO_TOO_LONG')) return 'youtube_err_too_long';
    if (mensaje.includes('QUOTA_EXCEEDED')) return 'youtube_err_quota';
    if (mensaje.includes('VIDEO_UNAVAILABLE')) return 'youtube_err_unavailable';
    if (mensaje.includes('VIDEO_IS_LIVE')) return 'youtube_err_live';
    if (mensaje.includes('VIDEO_OVER_MAX_LENGTH')) return 'youtube_err_maxlen';
    if (mensaje.includes('TRANSCRIPT_TRUNCATED')) return 'youtube_err_truncated';
    return 'youtube_err_generic';
};

export const YouTubeImportModal: React.FC<YouTubeImportModalProps> = ({ isOpen, onClose, onTranscribed }) => {
    const { t, language } = useLanguage();
    const [url, setUrl] = useState('');
    const [aceptaDerechos, setAceptaDerechos] = useState(false);
    // 'clean' por defecto: una transcripcion traducida no puede ser literal.
    const [modo, setModo] = useState<'literal' | 'clean'>('clean');
    const [idiomaSalida, setIdiomaSalida] = useState<string>(language);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const cerrar = () => {
        if (cargando) return;
        setUrl('');
        setError(null);
        setAceptaDerechos(false);
        onClose();
    };

    const enviar = async () => {
        if (!url.trim() || !aceptaDerechos || cargando) return;
        setCargando(true);
        setError(null);
        try {
            const datos = await transcribeYouTube(url.trim(), language, { mode: modo, targetLanguage: idiomaSalida });
            if (!datos.segments || datos.segments.length === 0) {
                setError(t('youtube_err_empty'));
                return;
            }
            await onTranscribed(datos);
            setUrl('');
            setAceptaDerechos(false);
            onClose();
        } catch (e: any) {
            setError(t(claveDeError(String(e?.message || '')) as any));
        } finally {
            setCargando(false);
        }
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/50 z-[300]" onClick={cerrar} />
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-lg bg-white dark:bg-card-dark rounded-2xl shadow-2xl z-[400] p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <Youtube size={22} strokeWidth={1.5} className="text-red-600 shrink-0" />
                        <h3 className="text-lg font-semibold text-[#0d0d0d] dark:text-white">
                            {t('youtube_modal_title')}
                        </h3>
                    </div>
                    <button
                        onClick={cerrar}
                        disabled={cargando}
                        className="p-1.5 -mr-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors disabled:opacity-40"
                        aria-label={t('cancel')}
                    >
                        <X size={18} strokeWidth={1.5} />
                    </button>
                </div>

                <p className="text-[13px] text-[#676767] dark:text-[#c5c5c5] mb-5 leading-relaxed">
                    {t('youtube_modal_desc')}
                </p>

                <input
                    type="url"
                    inputMode="url"
                    value={url}
                    onChange={e => { setUrl(e.target.value); setError(null); }}
                    onKeyDown={e => { if (e.key === 'Enter') enviar(); }}
                    placeholder={t('youtube_placeholder')}
                    disabled={cargando}
                    autoFocus
                    className="w-full px-4 py-3 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-lg text-[14px] text-[#0d0d0d] dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
                />

                <div className="flex items-start gap-2 mt-3 text-[12px] text-[#8e8e8e]">
                    <Info size={14} strokeWidth={1.5} className="shrink-0 mt-0.5" />
                    <span>{t('youtube_only_public')}</span>
                </div>

                {/* Estilo e idioma, elegidos por video. */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
                    <div>
                        <span className="block text-[12px] font-medium text-[#676767] dark:text-[#c5c5c5] mb-2">
                            {t('youtube_mode')}
                        </span>
                        <div className="flex gap-1.5">
                            {(['clean', 'literal'] as const).map(m => (
                                <button
                                    key={m}
                                    type="button"
                                    onClick={() => setModo(m)}
                                    disabled={cargando}
                                    className={`flex-1 px-3 py-2 rounded-lg text-[12px] font-medium border transition-colors disabled:opacity-40 ${modo === m
                                        ? 'border-primary bg-primary/5 text-primary'
                                        : 'border-slate-200 dark:border-white/10 text-[#676767] dark:text-[#c5c5c5] hover:border-slate-300'
                                        }`}
                                >
                                    {m === 'clean' ? t('youtube_mode_clean') : t('youtube_mode_literal')}
                                </button>
                            ))}
                        </div>
                        <p className="text-[11px] text-[#8e8e8e] mt-1.5 leading-snug">
                            {modo === 'clean' ? t('youtube_mode_clean_hint') : t('youtube_mode_literal_hint')}
                        </p>
                    </div>

                    <div>
                        <label className="block text-[12px] font-medium text-[#676767] dark:text-[#c5c5c5] mb-2" htmlFor="yt-idioma">
                            {t('youtube_output_language')}
                        </label>
                        <select
                            id="yt-idioma"
                            value={idiomaSalida}
                            onChange={e => setIdiomaSalida(e.target.value)}
                            disabled={cargando}
                            className="w-full px-3 py-2 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-lg text-[13px] text-[#0d0d0d] dark:text-white focus:outline-none focus:border-primary transition-colors disabled:opacity-40"
                        >
                            {IDIOMAS.map(i => <option key={i.codigo} value={i.codigo}>{i.nombre}</option>)}
                        </select>
                    </div>
                </div>

                {/* La responsabilidad sobre los derechos del contenido es del usuario:
                    una transcripcion literal de un video ajeno es una reproduccion. */}
                <label className="flex items-start gap-2.5 mt-4 cursor-pointer select-none">
                    <input
                        type="checkbox"
                        checked={aceptaDerechos}
                        onChange={e => setAceptaDerechos(e.target.checked)}
                        disabled={cargando}
                        className="mt-0.5 rounded border-slate-300 dark:border-white/20 text-primary focus:ring-primary"
                    />
                    <span className="text-[12px] text-[#676767] dark:text-[#c5c5c5] leading-relaxed">
                        {t('youtube_rights')}
                    </span>
                </label>

                {error && (
                    <p className="mt-4 text-[13px] text-red-600 dark:text-red-400">{error}</p>
                )}

                {cargando && (
                    <p className="mt-4 flex items-center gap-2 text-[13px] text-[#676767] dark:text-[#c5c5c5]">
                        <Loader2 size={15} className="animate-spin shrink-0" />
                        {t('youtube_processing')}
                    </p>
                )}

                <div className="flex gap-3 mt-6">
                    <button
                        onClick={cerrar}
                        disabled={cargando}
                        className="flex-1 px-4 py-2.5 bg-[#f7f7f8] dark:bg-[#333] text-[#0d0d0d] dark:text-white rounded-lg text-[13px] font-medium hover:bg-[#ebebeb] dark:hover:bg-[#444] transition-colors disabled:opacity-40"
                    >
                        {t('cancel_btn')}
                    </button>
                    <button
                        onClick={enviar}
                        disabled={!url.trim() || !aceptaDerechos || cargando}
                        className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg text-[13px] font-medium hover:bg-primary-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {t('youtube_cta')}
                    </button>
                </div>
            </div>
        </>
    );
};
