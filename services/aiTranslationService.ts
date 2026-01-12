import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Servicio de traducción automática usando Gemini AI
 * Para contenido dinámico de base de datos (planes, settings, etc.)
 */

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

/**
 * Traduce un texto usando Gemini AI
 */
export async function translateWithGemini(
    text: string,
    targetLang: 'en' | 'es'
): Promise<string> {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

        const prompt = targetLang === 'en'
            ? `Translate this Spanish text to professional English for a SaaS product. Maintain the same tone and technical terms. Only return the translation, nothing else:\n\n${text}`
            : `Traduce este texto en inglés a español profesional para un producto SaaS. Mantén el mismo tono y términos técnicos. Solo devuelve la traducción:\n\n${text}`;

        const result = await model.generateContent(prompt);
        const translation = result.response.text().trim();

        console.log(`[AI Translation] ${targetLang.toUpperCase()}:`, { original: text.substring(0, 50), translated: translation.substring(0, 50) });

        return translation;
    } catch (error) {
        console.error('[AI Translation] Error:', error);
        // Fallback: retornar el texto original si falla la traducción
        return text;
    }
}

/**
 * Traduce un array de strings (para features de planes)
 */
export async function translateArray(
    items: string[],
    targetLang: 'en' | 'es'
): Promise<string[]> {
    try {
        // Traducir todos en paralelo para mejor performance
        const translations = await Promise.all(
            items.map(item => translateWithGemini(item, targetLang))
        );
        return translations;
    } catch (error) {
        console.error('[AI Translation] Error translating array:', error);
        return items; // Fallback
    }
}

/**
 * Auto-traduce los datos de un plan completo
 */
export async function autoTranslatePlan(planData: {
    description_es: string;
    features_es: string[];
}) {
    console.log('[AI Translation] Auto-translating plan...');

    const [description_en, features_en] = await Promise.all([
        translateWithGemini(planData.description_es, 'en'),
        translateArray(planData.features_es, 'en')
    ]);

    return {
        description_en,
        features_en
    };
}

/**
 * Auto-traduce un texto de configuración (como legal footer)
 */
export async function autoTranslateSetting(
    valueEs: string
): Promise<string> {
    console.log('[AI Translation] Auto-translating setting...');
    return translateWithGemini(valueEs, 'en');
}

/**
 * Traduce todo el contenido de planes existentes (migration helper)
 */
export async function translateAllPlans(plans: any[]) {
    console.log(`[AI Translation] Translating ${plans.length} plans...`);

    const translatedPlans = await Promise.all(
        plans.map(async (plan) => {
            if (!plan.description_es || !plan.features_es) {
                console.warn(`[AI Translation] Plan ${plan.id} missing ES data, skipping`);
                return plan;
            }

            const translations = await autoTranslatePlan({
                description_es: plan.description_es,
                features_es: plan.features_es
            });

            return {
                ...plan,
                ...translations
            };
        })
    );

    console.log('[AI Translation] All plans translated successfully');
    return translatedPlans;
}
