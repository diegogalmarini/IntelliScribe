/**
 * api/_utils/gemini.ts
 *
 * Configuración de modelos y ejecución con fallback.
 *
 * FUENTE DE VERDAD DE MODELOS. Cualquier cambio de modelo Gemini empieza aquí.
 * Antes esto vivía dentro del handler de api/ai.ts; se extrae para que
 * api/support-chat.ts —el único endpoint de IA que debe seguir siendo público—
 * pueda usarlo sin duplicar la cadena de fallback ni el mapa de modelos.
 *
 * Prohibidos: familias Gemini 1.0, 1.5 y 2.0, y `text-embedding-004`.
 * Ver .agent/skills/optimizing-gemini-models/SKILL.md antes de tocar esta tabla.
 */

export const GEMINI_CONFIG = {
    apiVersion: 'v1beta',
    // La cadena de fallback se recorre en orden cuando el modelo preferido falla.
    // OJO: ponerla encabezada por un modelo caro significa que cualquier fallo del
    // preferido dispara el gasto. Se ordena de barato a caro salvo para chat, que
    // pide su preferido explicitamente.
    modelPriorities: [
        'gemini-3.7-flash',
        'gemini-3.1-flash-lite-preview',
        'gemini-3.1-pro-preview',
        'gemini-2.5-flash',
        'gemini-2.5-pro'
    ],
    actions: {
        summary: { preferredModel: 'gemini-3.1-flash-lite-preview', temperature: 0.7 },
        chat: { preferredModel: 'gemini-3.1-pro-preview', temperature: 0.8 },
        support: { preferredModel: 'gemini-3.1-flash-lite-preview', temperature: 0.9 },
        // `gemini-3.1-flash-preview` NO EXISTE: Google devuelve 404. Cada
        // transcripcion gastaba una llamada fallida y caia al primero de la
        // cadena, que era el modelo Pro: cuatro veces el coste por token.
        transcription: { preferredModel: 'gemini-3.7-flash', temperature: 0.1 },
        embed: { preferredModel: 'gemini-embedding-001', temperature: 0, outputDimensionality: 768 }
    }
};

export type GeminiAction = keyof typeof GEMINI_CONFIG.actions;

/**
 * Dimensionalidad obligatoria de los embeddings.
 *
 * `recording_chunks.embedding` es VECTOR(768). Generar un vector con otra
 * dimensión —o con otro modelo— produce valores de un espacio distinto que
 * rompen la búsqueda semántica en silencio. Debe pasarse en TODAS las llamadas
 * a embedContent, tanto al indexar como al consultar.
 */
export const EMBEDDING_DIMENSIONS = 768;

/** Si Gemini se cuelga sin devolver error, se aborta y se prueba el siguiente modelo. */
const PER_MODEL_TIMEOUT_MS: Record<string, number> = {
    transcription: 45_000,
    summary: 25_000,
    chat: 25_000,
    support: 20_000,
    embed: 10_000,
    'sync-rag': 10_000,
};

const DEFAULT_TIMEOUT_MS = 25_000;

async function withRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number,
    actionName: string
): Promise<T> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error: any) {
            const isLastAttempt = attempt === maxRetries - 1;
            if (isLastAttempt) {
                console.error(`[AI] ${actionName} falló tras ${maxRetries} intentos:`, error.message);
                throw error;
            }

            // Solo se reintentan los errores de cuota; el resto falla rápido.
            const isRateLimit = error.status === 429 || /quota|rate.?limit/i.test(error.message || '');
            if (!isRateLimit) throw error;

            const delayMs = Math.pow(2, attempt) * 500;
            console.warn(`[AI] ${actionName} intento ${attempt + 1} limitado por cuota. Reintento en ${delayMs}ms...`);
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }
    throw new Error(`${actionName} falló tras todos los reintentos`);
}

function withModelTimeout<T>(promise: Promise<T>, actionType: string, modelName: string): Promise<T> {
    const ms = PER_MODEL_TIMEOUT_MS[actionType] ?? DEFAULT_TIMEOUT_MS;
    return Promise.race([
        promise,
        new Promise<T>((_, reject) =>
            setTimeout(() => reject(new Error(`Model timeout (${ms}ms): ${modelName}`)), ms)
        )
    ]);
}

/**
 * Devuelve un ejecutor ligado a una instancia de GoogleGenerativeAI.
 * Recorre el modelo preferido de la acción y luego la cadena de prioridades.
 */
export function createRunner(genAI: any) {
    return async function runWithFallback(
        actionType: GeminiAction,
        systemInstruction: string | undefined,
        task: (model: any, config: any) => Promise<any>
    ): Promise<any> {
        const config = GEMINI_CONFIG.actions[actionType];
        const modelsToTry = [
            config.preferredModel,
            ...GEMINI_CONFIG.modelPriorities.filter(m => m !== config.preferredModel)
        ];

        let lastError = null;
        for (const modelName of modelsToTry) {
            try {
                console.log(`[AI] Probando ${modelName} para ${actionType}`);
                const model = genAI.getGenerativeModel({
                    model: modelName,
                    systemInstruction,
                    generationConfig: { temperature: (config as any).temperature }
                }, { apiVersion: GEMINI_CONFIG.apiVersion as any });

                return await withRetry(
                    () => withModelTimeout(task(model, config), actionType, modelName),
                    2,
                    `${actionType} con ${modelName}`
                );
            } catch (err: any) {
                console.warn(`[AI] El modelo ${modelName} falló: ${err.message}. Siguiente...`);
                lastError = err;
            }
        }
        throw lastError || new Error(`Todos los modelos fallaron para: ${actionType}`);
    };
}
