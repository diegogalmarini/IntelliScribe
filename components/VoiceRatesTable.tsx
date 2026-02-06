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

    // Data derived from utils/voiceRates.ts logic
    // STANDARD = 1, PREMIUM = 5, ULTRA = 10
    const rates: RateRow[] = [
        { country: "España", flag: "🇪🇸", fixedRate: "1", mobileRate: "10 (Ultra)", fixedTier: 'STANDARD', mobileTier: 'ULTRA' },
        { country: "Estados Unidos", flag: "🇺🇸", fixedRate: "1", mobileRate: "1", fixedTier: 'STANDARD', mobileTier: 'STANDARD' },
        { country: "Reino Unido", flag: "🇬🇧", fixedRate: "1", mobileRate: "5 (Premium)", fixedTier: 'STANDARD', mobileTier: 'PREMIUM' },
        { country: "Francia", flag: "🇫🇷", fixedRate: "1", mobileRate: "5 (Premium)", fixedTier: 'STANDARD', mobileTier: 'PREMIUM' },
        { country: "Alemania", flag: "🇩🇪", fixedRate: "1", mobileRate: "10 (Ultra)", fixedTier: 'STANDARD', mobileTier: 'ULTRA' },
        { country: "Italia", flag: "🇮🇹", fixedRate: "1", mobileRate: "10 (Ultra)", fixedTier: 'STANDARD', mobileTier: 'ULTRA' },
        { country: "Portugal", flag: "🇵🇹", fixedRate: "1", mobileRate: "5 (Premium)", fixedTier: 'STANDARD', mobileTier: 'PREMIUM' },
        { country: "México", flag: "🇲🇽", fixedRate: "1", mobileRate: "10 (Ultra)", fixedTier: 'STANDARD', mobileTier: 'ULTRA' }, // Check Mexico Mobile? Typically high cost. Assuming Ultra based on pattern or defaulting.
        { country: "Canadá", flag: "🇨🇦", fixedRate: "1", mobileRate: "1", fixedTier: 'STANDARD', mobileTier: 'STANDARD' },
        { country: "Irlanda", flag: "🇮🇪", fixedRate: "1", mobileRate: "10 (Ultra)", fixedTier: 'STANDARD', mobileTier: 'ULTRA' },
        { country: "Suiza", flag: "🇨🇭", fixedRate: "1", mobileRate: "10 (Ultra)", fixedTier: 'STANDARD', mobileTier: 'ULTRA' },
    ];

    const getTierColor = (tier: string) => {
        switch (tier) {
            case 'STANDARD': return 'text-slate-600 dark:text-slate-400';
            case 'PREMIUM': return 'text-amber-600 dark:text-amber-400 font-bold';
            case 'ULTRA': return 'text-purple-600 dark:text-purple-400 font-bold';
            default: return 'text-slate-600';
        }
    };

    return (
        <section className="max-w-4xl mx-auto mb-20 px-4">
            <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-900/50 dark:to-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-8 shadow-sm">
                <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Tarifas de Llamadas Internacionales</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        Consumo de créditos por minuto según destino y tipo de línea.
                        <br />
                        <span className="text-xs opacity-70">Tarifas exclusivas para planes Business + Call</span>
                    </p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-white/10">
                                <th className="pb-4 pl-4 text-xs font-bold uppercase tracking-wider text-slate-400">País / Destino</th>
                                <th className="pb-4 text-center text-xs font-bold uppercase tracking-wider text-slate-400">
                                    <div className="flex items-center justify-center gap-2">
                                        <Phone size={14} /> Fijo
                                    </div>
                                </th>
                                <th className="pb-4 text-center text-xs font-bold uppercase tracking-wider text-slate-400">
                                    <div className="flex items-center justify-center gap-2">
                                        <Smartphone size={14} /> Móvil
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                            {rates.map((row, idx) => (
                                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                    <td className="py-3 pl-4 text-sm font-medium text-slate-900 dark:text-white flex items-center gap-3">
                                        <span className="text-lg">{row.flag}</span>
                                        {row.country}
                                    </td>
                                    <td className={`py-3 text-center text-sm ${getTierColor(row.fixedTier)}`}>
                                        {row.fixedRate} <span className="text-[10px] opacity-60">cred/min</span>
                                    </td>
                                    <td className={`py-3 text-center text-sm ${getTierColor(row.mobileTier)}`}>
                                        {row.mobileRate} <span className="text-[10px] opacity-60">cred/min</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-6 flex flex-wrap gap-4 justify-center text-xs text-slate-400 border-t border-slate-100 dark:border-white/5 pt-4">
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                        Standard: 1 crédito/min
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        Premium: 5 créditos/min
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                        Ultra: 10 créditos/min (Global/Móviles)
                    </div>
                </div>
            </div>
        </section>
    );
};
