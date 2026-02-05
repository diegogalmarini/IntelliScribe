
export const VOICE_TIERS = {
    STANDARD: { id: 'STANDARD', multiplier: 1, label: 'Estándar' }, // 1 crédito/min
    PREMIUM: { id: 'PREMIUM', multiplier: 5, label: 'Premium' },   // 5 créditos/min
    ULTRA: { id: 'ULTRA', multiplier: 10, label: 'Ultra' },        // 10 créditos/min
    BLOCKED: { id: 'BLOCKED', multiplier: 0, label: 'No Incluido' }
} as const;

export type VoiceTierId = keyof typeof VOICE_TIERS;

// Prefix mapping logic: longest match wins.
export const DESTINATION_RATES: Record<string, VoiceTierId> = {
    // --- North America (STANDARD) ---
    '+1': 'STANDARD',           // USA & Canada
    '+52': 'STANDARD',         // Mexico
    '+1787': 'STANDARD',       // Puerto Rico
    '+1939': 'STANDARD',       // Puerto Rico
    '+1671': 'STANDARD',       // Guam

    // --- Central & South America (Activated only) ---
    '+507': 'STANDARD',        // Panama (Twilio: $0.045-$0.341)
    '+5076': 'ULTRA',          // Panama Mobile (Safety multiplier)

    // --- Europe (STANDARD Fixed / ULTRA/PREMIUM Mobile) ---
    '+34': 'STANDARD',         // Spain Fixed
    '+346': 'ULTRA',           // Spain Mobile
    '+347': 'ULTRA',           // Spain Mobile
    '+44': 'STANDARD',         // UK Fixed
    '+447': 'PREMIUM',         // UK Mobile
    '+33': 'STANDARD',         // France Fixed
    '+336': 'PREMIUM',         // France Mobile
    '+337': 'PREMIUM',         // France Mobile
    '+49': 'STANDARD',         // Germany Fixed
    '+491': 'ULTRA',           // Germany Mobile
    '+39': 'STANDARD',         // Italy Fixed
    '+393': 'ULTRA',           // Italy Mobile
    '+351': 'STANDARD',        // Portugal Fixed
    '+3519': 'PREMIUM',        // Portugal Mobile
    '+31': 'STANDARD',         // Netherlands Fixed
    '+41': 'STANDARD',         // Switzerland Fixed
    '+417': 'ULTRA',           // Switzerland Mobile
    '+45': 'STANDARD',         // Denmark
    '+30': 'STANDARD',         // Greece Fixed
    '+306': 'PREMIUM',         // Greece Mobile
    '+36': 'STANDARD',         // Hungary
    '+354': 'STANDARD',        // Iceland
    '+353': 'STANDARD',        // Ireland Fixed
    '+3538': 'ULTRA',          // Ireland Mobile
    '+352': 'STANDARD',        // Luxembourg
    '+377': 'ULTRA',           // Monaco
    '+48': 'STANDARD',         // Poland
    '+40': 'STANDARD',         // Romania
    '+421': 'STANDARD',        // Slovakia
    '+46': 'STANDARD',         // Sweden
    '+376': 'PREMIUM',         // Andorra
    '+379': 'STANDARD',        // Vatican City
    '+47': 'STANDARD',         // Norway Fixed
    '+474': 'ULTRA',           // Norway Mobile
    '+479': 'ULTRA',           // Norway Mobile

    // --- Asia / Oceania (Activated only) ---
    '+65': 'STANDARD',         // Singapore
    '+62': 'STANDARD',         // Indonesia
    '+880': 'STANDARD',        // Bangladesh
    '+852': 'STANDARD',        // Hong Kong
    '+972': 'STANDARD',        // Israel Fixed
    '+9725': 'PREMIUM',        // Israel Mobile
    '+81': 'PREMIUM',          // Japan
    '+82': 'STANDARD',         // Korea (South)
    '+60': 'STANDARD',         // Malaysia
    '+90': 'PREMIUM',          // Turkey
    '+61': 'STANDARD',         // Australia Fixed
    '+64': 'STANDARD',         // New Zealand

    // --- Africa (Activated only) ---
    '+27': 'STANDARD',         // South Africa Fixed
    '+276': 'ULTRA',           // South Africa Mobile
    '+277': 'ULTRA',           // South Africa Mobile
    '+278': 'ULTRA',           // South Africa Mobile
};

/**
 * Finds the correct tier for a given phone number by matching prefixes.
 * The longest matching prefix takes precedence.
 */
export function getTierForNumber(phoneNumber: string): typeof VOICE_TIERS[VoiceTierId] {
    // Clean number: keep only + and digits
    const cleanNumber = phoneNumber.replace(/[^\d+]/g, '');

    let bestMatch = '';
    let selectedTierId: VoiceTierId = 'BLOCKED';

    for (const prefix in DESTINATION_RATES) {
        if (cleanNumber.startsWith(prefix) && prefix.length > bestMatch.length) {
            bestMatch = prefix;
            selectedTierId = DESTINATION_RATES[prefix];
        }
    }

    return VOICE_TIERS[selectedTierId];
}
