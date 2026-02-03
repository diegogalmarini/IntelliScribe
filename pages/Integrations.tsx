import React, { useState } from 'react';
import { IntegrationState, UserProfile } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSelector } from '../components/LanguageSelector';
import { ThemeToggle } from '../components/ThemeToggle';
import { useToast } from '../components/Toast';
import { motion, AnimatePresence } from 'framer-motion';

interface IntegrationsProps {
    integrations?: IntegrationState[];
    user: UserProfile;
    onToggle?: (id: string) => void;
    onUpdateProfile?: (updates: Partial<UserProfile>) => void;
}

export const Integrations: React.FC<IntegrationsProps> = ({ integrations = [], user, onToggle, onUpdateProfile }) => {
    const { t } = useLanguage();
    const { showToast } = useToast();
    const [configId, setConfigId] = useState<string | null>(null);
    const [webhookUrl, setWebhookUrl] = useState(user.zapier_webhook_url || '');
    const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const handleSaveZapier = () => {
        if (onUpdateProfile) {
            onUpdateProfile({
                zapier_webhook_url: webhookUrl,
                auto_sync_enabled: user.auto_sync_enabled
            });
            showToast(t('settingsSaved') || 'Configuración guardada', 'success');
            setConfigId(null);
        }
    };

    const handleTestConnection = async () => {
        if (!webhookUrl) {
            showToast(t('zapierWebhookMissing') || 'Por favor, ingresa una URL de webhook.', 'error');
            return;
        }

        setTestStatus('loading');
        try {
            const response = await fetch('/api/zapier-sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    isTest: true,
                    webhookUrl: webhookUrl // Send temporary URL for testing
                })
            });

            if (response.ok) {
                setTestStatus('success');
                showToast(t('zapierTestSuccess') || '¡Conexión exitosa! Zapier recibió el payload de prueba.', 'success');
            } else {
                const err = await response.json();
                setTestStatus('error');
                showToast(err.error || t('zapierSyncError') || 'Error al conectar con Zapier.', 'error');
            }
        } catch (error) {
            setTestStatus('error');
            showToast('Error de red al probar la conexión.', 'error');
        } finally {
            setTimeout(() => setTestStatus('idle'), 3000);
        }
    };

    const ZapierModal = () => (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white dark:bg-card-dark w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-border-dark overflow-hidden"
            >
                <div className="p-6 border-b border-slate-100 dark:border-border-dark flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-lg bg-[#FF4A00] flex items-center justify-center">
                            <span className="material-symbols-outlined text-white">bolt</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t('zapierTitle') || 'Zapier Custom Webhook'}</h3>
                    </div>
                    <button onClick={() => setConfigId(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <span className="material-symbols-outlined text-slate-500">close</span>
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t('zapierWebhookLabel') || 'Zapier Webhook URL'}</label>
                        <p className="text-xs text-slate-500 dark:text-text-secondary mb-2">{t('zapierWebhookDesc') || 'Copia la URL de "Webhooks by Zapier" (Catch Hook) y pégala aquí.'}</p>
                        <input
                            type="text"
                            className="w-full bg-slate-50 dark:bg-[#1a202c] border border-slate-200 dark:border-border-dark rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            placeholder="https://hooks.zapier.com/hooks/catch/..."
                            value={webhookUrl}
                            onChange={(e) => setWebhookUrl(e.target.value)}
                        />
                    </div>

                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{t('zapierAutoSyncTitle') || 'Auto-Sync Sync'}</h4>
                                <p className="text-[11px] text-slate-500 dark:text-text-secondary">{t('zapierAutoSyncDesc') || 'Envía grabaciones automáticamente al finalizar.'}</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={user.auto_sync_enabled}
                                    onChange={(e) => onUpdateProfile?.({ auto_sync_enabled: e.target.checked })}
                                />
                                <div className="w-10 h-5 bg-slate-300 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        <button
                            onClick={handleTestConnection}
                            disabled={testStatus === 'loading'}
                            className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-white text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all disabled:opacity-50"
                        >
                            {testStatus === 'loading' ? (
                                <div className="size-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                            ) : testStatus === 'success' ? (
                                <span className="material-symbols-outlined text-green-500 text-lg">check_circle</span>
                            ) : testStatus === 'error' ? (
                                <span className="material-symbols-outlined text-red-500 text-lg">error</span>
                            ) : (
                                <span className="material-symbols-outlined text-lg">flask</span>
                            )}
                            {testStatus === 'loading' ? t('zapierTesting') || 'Testing...' : t('zapierTestConnection') || 'Test Connection'}
                        </button>
                        <button
                            onClick={handleSaveZapier}
                            className="flex-1 h-11 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all"
                        >
                            {t('zapierSaveConfig') || 'Save Configuration'}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );

    return (
        <div className="flex flex-1 flex-col h-full overflow-hidden bg-background-light dark:bg-background-dark relative transition-colors duration-200">
            <header className="flex items-center justify-between border-b border-slate-200 dark:border-border-dark bg-white/80 dark:bg-[#111722]/80 backdrop-blur-md px-4 md:px-8 py-4 sticky top-0 z-20 transition-colors duration-200">
                <h2 className="text-slate-900 dark:text-white text-lg font-bold tracking-tight">{t('connectionCenter')}</h2>
                <div className="flex items-center gap-3">
                    <ThemeToggle />
                    <LanguageSelector />
                    <div className="relative group hidden sm:block">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-text-secondary">search</span>
                        <input className="bg-white dark:bg-card-dark border border-slate-300 dark:border-border-dark text-slate-900 dark:text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-48 md:w-64 pl-10 p-2.5 placeholder-slate-500 dark:placeholder-text-secondary transition-all" placeholder={t('searchPlaceholder')} type="text" />
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                <div className="mx-auto max-w-[1600px] flex flex-col gap-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div className="flex flex-col gap-2 max-w-2xl">
                            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">{t('integrations')} & AutoFlow</h1>
                            <p className="text-slate-500 dark:text-text-secondary text-sm md:text-base">{t('manageConnections')}</p>
                        </div>
                        <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-medium px-5 py-2.5 rounded-lg shadow-lg shadow-primary/20 transition-all active:scale-95">
                            <span className="material-symbols-outlined text-[20px]">add</span>
                            {t('newAutoFlow')}
                        </button>
                    </div>

                    {/* Integration Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {integrations.map((item, i) => {
                            const isZapier = item.id === 'zapier';
                            const isLocked = isZapier && !['business', 'business_plus'].includes(user.subscription?.planId || '');
                            const isConnected = isZapier ? !!user.zapier_webhook_url : item.connected;

                            return (
                                <div key={i} className="group flex flex-col p-5 rounded-xl bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5 relative overflow-hidden">
                                    {isLocked && (
                                        <div className="absolute inset-0 z-10 bg-white/40 dark:bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
                                            <div className="bg-white dark:bg-slate-800 px-3 py-1.5 rounded-full shadow-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2 animate-bounce">
                                                <span className="material-symbols-outlined text-sm text-amber-500">lock</span>
                                                <span className="text-[10px] font-black uppercase text-slate-700 dark:text-slate-300">Business Plan Required</span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="absolute top-0 right-0 p-3">
                                        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full border ${isConnected ? 'bg-green-500/10 border-green-500/20' : 'bg-slate-200 dark:bg-gray-700/50 border-slate-300 dark:border-gray-600/30'}`}>
                                            <div className={`size-1.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                            <span className={`text-[10px] font-bold uppercase tracking-wide ${isConnected ? 'text-green-500' : 'text-gray-400'}`}>{isConnected ? t('connected') : t('disconnected')}</span>
                                        </div>
                                    </div>
                                    <div className="mb-4 size-12 rounded-lg bg-slate-100 dark:bg-white flex items-center justify-center p-2 text-black" style={{ backgroundColor: item.color === '#4A154B' ? '#4A154B' : 'white' }}>
                                        <span className={`material-symbols-outlined text-3xl ${item.color === '#4A154B' ? 'text-white' : 'text-black'}`}>{item.icon}</span>
                                    </div>
                                    <h4 className="text-slate-900 dark:text-white font-bold text-lg">{item.name}</h4>
                                    <p className="text-slate-500 dark:text-text-secondary text-sm mt-1 mb-6 line-clamp-2">{item.description}</p>
                                    <div className="mt-auto pt-4 border-t border-slate-200 dark:border-border-dark flex items-center justify-between">
                                        <button
                                            onClick={() => isZapier && !isLocked && setConfigId(item.id)}
                                            className="text-sm font-medium text-slate-500 dark:text-text-secondary hover:text-slate-900 dark:hover:text-white transition-colors"
                                        >
                                            {isConnected ? t('configure') : t('connectAccount')}
                                        </button>
                                        <div className="form-control">
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={isConnected}
                                                    onChange={() => !isLocked && onToggle && onToggle(item.id)}
                                                    disabled={isLocked}
                                                />
                                                <div className="w-11 h-6 bg-slate-300 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {configId === 'zapier' && <ZapierModal />}
            </AnimatePresence>
        </div>
    );
};