import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Phone, Smartphone } from 'lucide-react';

interface RateRow {
    country: string;
    flag: string;
    fixedRate: string; // e.g. "1 cred/min"
    mobileRate: string; // e.g. "10 creds/min"
    fixedTier: 'STANDARD' | 'PREMIUM' | 'ULTRA';
    mobileTier: 'STANDARD' | 'PREMIUM' | 'ULTRA';
}

export const VoiceRatesTable: React.FC = () => {
    const { t } = useLanguage();

    // Data derived from utils/voiceRates.ts
    // STANDARD = 1, PREMIUM = 5, ULTRA = 10
    const rates: RateRow[] = [
        // --- North America ---
        { country: "Estados Unidos", flag: "🇺🇸", fixedRate: "1", mobileRate: "1", fixedTier: 'STANDARD', mobileTier: 'STANDARD' },
        { country: "Canadá", flag: "🇨🇦", fixedRate: "1", mobileRate: "1", fixedTier: 'STANDARD', mobileTier: 'STANDARD' },
        { country: "México", flag: "🇲🇽", fixedRate: "1", mobileRate: "1", fixedTier: 'STANDARD', mobileTier: 'STANDARD' },
        { country: "Puerto Rico", flag: "🇵🇷", fixedRate: "1", mobileRate: "1", fixedTier: 'STANDARD', mobileTier: 'STANDARD' },

        // --- Europe ---
        { country: "España", flag: "🇪🇸", fixedRate: "1", mobileRate: "10", fixedTier: 'STANDARD', mobileTier: 'ULTRA' },
        { country: "Reino Unido", flag: "🇬🇧", fixedRate: "1", mobileRate: "5", fixedTier: 'STANDARD', mobileTier: 'PREMIUM' },
        { country: "Francia", flag: "🇫🇷", fixedRate: "1", mobileRate: "5", fixedTier: 'STANDARD', mobileTier: 'PREMIUM' },
        { country: "Alemania", flag: "🇩🇪", fixedRate: "1", mobileRate: "10", fixedTier: 'STANDARD', mobileTier: 'ULTRA' },
        { country: "Italia", flag: "🇮🇹", fixedRate: "1", mobileRate: "10", fixedTier: 'STANDARD', mobileTier: 'ULTRA' },
        { country: "Portugal", flag: "🇵🇹", fixedRate: "1", mobileRate: "5", fixedTier: 'STANDARD', mobileTier: 'PREMIUM' },
        { country: "Irlanda", flag: "🇮🇪", fixedRate: "1", mobileRate: "10", fixedTier: 'STANDARD', mobileTier: 'ULTRA' },
        { country: "Países Bajos", flag: "🇳🇱", fixedRate: "1", mobileRate: "1", fixedTier: 'STANDARD', mobileTier: 'STANDARD' }, // Check default
        { country: "Suiza", flag: "🇨🇭", fixedRate: "1", mobileRate: "10", fixedTier: 'STANDARD', mobileTier: 'ULTRA' },
        { country: "Grecia", flag: "🇬🇷", fixedRate: "1", mobileRate: "5", fixedTier: 'STANDARD', mobileTier: 'PREMIUM' },
        { country: "Dinamarca", flag: "🇩🇰", fixedRate: "1", mobileRate: "1", fixedTier: 'STANDARD', mobileTier: 'STANDARD' }, // Check default
        { country: "Suecia", flag: "🇸🇪", fixedRate: "1", mobileRate: "1", fixedTier: 'STANDARD', mobileTier: 'STANDARD' }, // Check default
        { country: "Noruega", flag: "🇳🇴", fixedRate: "1", mobileRate: "10", fixedTier: 'STANDARD', mobileTier: 'ULTRA' },
        { country: "Polonia", flag: "🇵🇱", fixedRate: "1", mobileRate: "1", fixedTier: 'STANDARD', mobileTier: 'STANDARD' }, // Check default
        { country: "Rumanía", flag: "🇷🇴", fixedRate: "1", mobileRate: "1", fixedTier: 'STANDARD', mobileTier: 'STANDARD' }, // Check default
        { country: "Andorra", flag: "🇦🇩", fixedRate: "5", mobileRate: "5", fixedTier: 'PREMIUM', mobileTier: 'PREMIUM' },
        { country: "Mónaco", flag: "🇲🇨", fixedRate: "10", mobileRate: "10", fixedTier: 'ULTRA', mobileTier: 'ULTRA' },

        // --- Asia / Oceania ---
        { country: "Australia", flag: "🇦🇺", fixedRate: "1", mobileRate: "1", fixedTier: 'STANDARD', mobileTier: 'STANDARD' },
        { country: "Nueva Zelanda", flag: "🇳🇿", fixedRate: "1", mobileRate: "1", fixedTier: 'STANDARD', mobileTier: 'STANDARD' },
        { country: "Japón", flag: "🇯🇵", fixedRate: "5", mobileRate: "5", fixedTier: 'PREMIUM', mobileTier: 'PREMIUM' },
        { country: "Corea del Sur", flag: "🇰🇷", fixedRate: "1", mobileRate: "1", fixedTier: 'STANDARD', mobileTier: 'STANDARD' },
        { country: "China (Hong Kong)", flag: "🇭🇰", fixedRate: "1", mobileRate: "1", fixedTier: 'STANDARD', mobileTier: 'STANDARD' },
        { country: "Israel", flag: "🇮🇱", fixedRate: "1", mobileRate: "5", fixedTier: 'STANDARD', mobileTier: 'PREMIUM' },
        { country: "Turquía", flag: "🇹🇷", fixedRate: "5", mobileRate: "5", fixedTier: 'PREMIUM', mobileTier: 'PREMIUM' },
        { country: "Singapur", flag: "🇸🇬", fixedRate: "1", mobileRate: "1", fixedTier: 'STANDARD', mobileTier: 'STANDARD' },
        { country: "India", flag: "🇮🇳", fixedRate: "1", mobileRate: "1", fixedTier: 'STANDARD', mobileTier: 'STANDARD' },

        // --- Africa / Latam ---
        { country: "Sudáfrica", flag: "🇿🇦", fixedRate: "1", mobileRate: "10", fixedTier: 'STANDARD', mobileTier: 'ULTRA' },
        { country: "Panamá", flag: "🇵🇦", fixedRate: "1", mobileRate: "10", fixedTier: 'STANDARD', mobileTier: 'ULTRA' },
    ];

    // TRAFFIC LIGHT STYLING
    const getRatePill = (rate: string, tier: string) => {
        let colorClass = '';
        let label = '';

        switch (tier) {
            case 'STANDARD': // 1 credit -> Green
                colorClass = 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800';
                label = '';
                break;
            case 'PREMIUM': // 5 credits -> Orange
                colorClass = 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800';
                label = 'Premium';
                break;
            case 'ULTRA': // 10 credits -> Red
                colorClass = 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
                label = 'Ultra';
                break;
            default:
                colorClass = 'bg-slate-100 text-slate-600';
        }

        return (
            <div className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold border ${colorClass}`}>
                {rate} <span className="text-[10px] opacity-70 ml-1 font-normal">cred/min</span>
            </div>
        );
    };

    return (
        <section className="max-w-5xl mx-auto mb-20 px-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-8 shadow-sm">
                <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Tarifas de Voz Internacionales</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm max-w-2xl mx-auto">
                        Consulta el coste en créditos por minuto según el destino.
                        <br />
                        <span className="text-xs text-blue-500 font-medium">Incluido en Plan Business + Call</span>
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {rates.map((row, idx) => (
                        <div key={idx} className="flex flex-col bg-slate-50 dark:bg-white/5 rounded-xl p-4 border border-slate-100 dark:border-white/5 hover:border-blue-200 dark:hover:border-blue-500/30 transition-colors">
                            <div className="flex items-center gap-3 mb-3 border-b border-black/5 pb-2">
                                <span className="text-2xl shadow-sm rounded-md overflow-hidden">{row.flag}</span>
                                <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">{row.country}</span>
                            </div>

                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                    <Phone size={12} />
                                    <span>Fijo</span>
                                </div>
                                {getRatePill(row.fixedRate, row.fixedTier)}
                            </div>

                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                    <Smartphone size={12} />
                                    <span>Móvil</span>
                                </div>
                                {getRatePill(row.mobileRate, row.mobileTier)}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 flex flex-wrap gap-6 justify-center text-xs font-medium text-slate-500 border-t border-slate-100 dark:border-white/5 pt-6">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-green-500"></span>
                        1 Crédito/min
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                        5 Créditos/min
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-red-500"></span>
                        10 Créditos/min
                    </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/5 text-[11px] leading-relaxed text-slate-400 text-center max-w-3xl mx-auto">
                    <p className="mb-2">
                        El servicio de llamadas (Dialer) incluido en el plan <strong>Business+</strong> está optimizado para España, Europa (fijos) y EE. UU. El uso abusivo de llamadas a móviles internacionales puede estar sujeto a cargos adicionales.
                    </p>
                    <p>
                        * Las llamadas salientes incluidas están limitadas a destinos de la <strong>Zona 1 (Fijos y Móviles)</strong>: España, Estados Unidos, Canadá, Reino Unido y Unión Europea Occidental (Alemania, Francia, Italia, Portugal, Irlanda, Países Bajos, Bélgica). El resto de destinos o números de tarificación especial requieren la compra de créditos adicionales.
                    </p>
                </div>
            </div>
        </section>
    );
};
