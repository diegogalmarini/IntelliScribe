/**
 * scripts/model-watch.ts
 *
 * Vigila a diario los modelos de Google, OpenAI y Anthropic y contrasta lo que
 * usa Diktalo contra lo que existe y lo que cuesta.
 *
 * LA LÓGICA
 *
 * El criterio NO es "el modelo más nuevo" ni "el mejor". Es el más barato que
 * cumpla los requisitos reales de cada tarea, porque cada tarea tiene una forma
 * de carga distinta:
 *
 *   - Transcribir es transducción mecánica: mucha entrada (audio), salida
 *     moderada, cero razonamiento. Manda el precio de ENTRADA.
 *   - Chatear sobre un transcript sí exige razonamiento y seguir instrucciones.
 *     Ahí la calidad se nota y conviene pagarla.
 *   - Resumir está en medio: entrada larga, salida corta, razonamiento ligero.
 *   - Embeddings no se eligen por precio: la dimensión del vector tiene que
 *     coincidir con lo ya indexado o la búsqueda semántica devuelve basura.
 *
 * Por eso el coste real no es el precio por token, sino precio x perfil de carga.
 * Un modelo con entrada barata y salida cara puede ser el mejor para transcribir
 * y el peor para chatear.
 *
 * QUÉ SABE CON CERTEZA Y QUÉ NO
 *
 * Los catálogos son consultables, así que las desapariciones se detectan seguro.
 * Los PRECIOS no: ninguno de los tres proveedores los expone por API. Viven en la
 * tabla de abajo con su fecha de revisión, y el informe avisa cuando caduca.
 *
 * USO
 *   npx tsx scripts/model-watch.ts            informe
 *   npx tsx scripts/model-watch.ts --json     para CI
 */

import { GEMINI_CONFIG } from '../api/_utils/gemini.js';

const MAX_PRICE_AGE_DAYS = 45;

interface PriceEntry {
    input: number;   // USD por millón de tokens de entrada
    output: number;  // USD por millón de tokens de salida
    revisado: string;
    audio?: boolean; // acepta audio como entrada
    /**
     * false para modelos de embeddings. Sin esto, el comparador de coste los
     * proponia como alternativa barata para chatear: son los mas baratos por
     * token y no pueden generar texto.
     */
    generativo: boolean;
}

const PRECIOS: Record<string, PriceEntry> = {
    'gemini-3.1-pro-preview':        { input: 1.25, output: 10.00, revisado: '2026-08-19', audio: true, generativo: true },
    'gemini-3.7-flash':              { input: 0.30, output: 2.50,  revisado: '2026-08-19', audio: true, generativo: true },
    'gemini-3.1-flash-lite-preview': { input: 0.10, output: 0.40,  revisado: '2026-08-19', audio: true, generativo: true },
    'gemini-2.5-pro':                { input: 1.25, output: 10.00, revisado: '2026-08-19', audio: true, generativo: true },
    'gemini-2.5-flash':              { input: 0.30, output: 2.50,  revisado: '2026-08-19', audio: true, generativo: true },
    'gemini-2.5-flash-lite':         { input: 0.10, output: 0.40,  revisado: '2026-08-19', audio: true, generativo: true },
    'gemini-embedding-001':          { input: 0.15, output: 0,     revisado: '2026-08-19', generativo: false },
};

/**
 * Perfil de carga por acción: cuántos tokens mueve una unidad típica de trabajo,
 * y qué necesita el modelo para poder hacerla.
 *
 * `unidad` es lo que se factura de cara al usuario, para poder comparar el coste
 * con lo que cobras por el plan.
 */
interface Perfil {
    unidad: string;
    tokensEntrada: number;
    tokensSalida: number;
    requiereAudio: boolean;
    /** true cuando la calidad del razonamiento es lo que percibe el usuario. */
    requiereRazonamiento: boolean;
    /** Modelo bloqueado por compatibilidad, no por precio. */
    fijo?: string;
}

const PERFILES: Record<string, Perfil> = {
    // Gemini cuenta ~32 tokens por segundo de audio.
    transcription: {
        unidad: '1 hora de audio',
        tokensEntrada: 3600 * 32,
        tokensSalida: 10_000,
        requiereAudio: true,
        requiereRazonamiento: false,
    },
    summary: {
        unidad: '1 transcript de 1 hora',
        tokensEntrada: 12_000,
        tokensSalida: 1_200,
        requiereAudio: false,
        requiereRazonamiento: false,
    },
    chat: {
        unidad: '1 pregunta con contexto RAG',
        tokensEntrada: 8_000,
        tokensSalida: 600,
        requiereAudio: false,
        requiereRazonamiento: true,
    },
    support: {
        unidad: '1 mensaje del bot',
        tokensEntrada: 6_000,
        tokensSalida: 300,
        requiereAudio: false,
        requiereRazonamiento: false,
    },
    embed: {
        unidad: '1 chunk',
        tokensEntrada: 1_000,
        tokensSalida: 0,
        requiereAudio: false,
        requiereRazonamiento: false,
        // No se elige por precio: la dimensión debe coincidir con lo ya indexado.
        fijo: 'gemini-embedding-001',
    },
};

function coste(modelo: string, p: Perfil): number | null {
    const precio = PRECIOS[modelo];
    if (!precio) return null;
    return (p.tokensEntrada * precio.input / 1e6) + (p.tokensSalida * precio.output / 1e6);
}

// ---------------------------------------------------------------------------
// Catálogos
// ---------------------------------------------------------------------------
interface Catalogo { proveedor: string; modelos: string[]; error?: string; }

async function catalogoGemini(): Promise<Catalogo> {
    const key = process.env.GEMINI_API_KEY;
    if (!key) return { proveedor: 'Google', modelos: [], error: 'falta GEMINI_API_KEY' };
    try {
        const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}&pageSize=200`);
        if (!r.ok) return { proveedor: 'Google', modelos: [], error: `HTTP ${r.status}` };
        const j: any = await r.json();
        return { proveedor: 'Google', modelos: (j.models || []).map((m: any) => String(m.name).replace(/^models\//, '')) };
    } catch (e: any) {
        return { proveedor: 'Google', modelos: [], error: e?.message || 'error de red' };
    }
}

async function catalogoOpenAI(): Promise<Catalogo> {
    const key = process.env.OPENAI_API_KEY;
    if (!key) return { proveedor: 'OpenAI', modelos: [], error: 'falta OPENAI_API_KEY' };
    try {
        const r = await fetch('https://api.openai.com/v1/models', { headers: { Authorization: `Bearer ${key}` } });
        if (!r.ok) return { proveedor: 'OpenAI', modelos: [], error: `HTTP ${r.status}` };
        const j: any = await r.json();
        return { proveedor: 'OpenAI', modelos: (j.data || []).map((m: any) => m.id) };
    } catch (e: any) {
        return { proveedor: 'OpenAI', modelos: [], error: e?.message || 'error de red' };
    }
}

async function catalogoAnthropic(): Promise<Catalogo> {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) return { proveedor: 'Anthropic', modelos: [], error: 'falta ANTHROPIC_API_KEY' };
    try {
        const r = await fetch('https://api.anthropic.com/v1/models?limit=100', {
            headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01' }
        });
        if (!r.ok) return { proveedor: 'Anthropic', modelos: [], error: `HTTP ${r.status}` };
        const j: any = await r.json();
        return { proveedor: 'Anthropic', modelos: (j.data || []).map((m: any) => m.id) };
    } catch (e: any) {
        return { proveedor: 'Anthropic', modelos: [], error: e?.message || 'error de red' };
    }
}

const FAMILIAS_PROHIBIDAS = /^(gemini-1\.0|gemini-1\.5|gemini-2\.0|text-embedding-004|embedding-001$)/;

const diasDesde = (f: string) => Math.floor((Date.now() - new Date(f).getTime()) / 86_400_000);

async function main() {
    const soloJson = process.argv.includes('--json');

    const [google, openai, anthropic] = await Promise.all([
        catalogoGemini(), catalogoOpenAI(), catalogoAnthropic()
    ]);
    const catalogos = [google, openai, anthropic];
    const disponibles = new Set(catalogos.flatMap(c => c.modelos));

    const enUso: { accion: string; modelo: string }[] = Object.entries(GEMINI_CONFIG.actions)
        .map(([accion, cfg]) => ({ accion, modelo: (cfg as any).preferredModel }));

    // 1. Roto: el código lo invoca y ya no existe.
    const desaparecidos = google.modelos.length
        ? [...enUso.map(e => ({ ...e, donde: `acción "${e.accion}"` })),
           ...GEMINI_CONFIG.modelPriorities.map(m => ({ accion: '-', modelo: m, donde: 'fallback' }))]
            .filter(e => !disponibles.has(e.modelo))
        : [];

    // 2. Prohibido por AGENTS.md.
    const prohibidos = enUso.filter(e => FAMILIAS_PROHIBIDAS.test(e.modelo));

    // 3. Precio sin revisar.
    const preciosCaducados = Object.entries(PRECIOS)
        .filter(([, p]) => diasDesde(p.revisado) > MAX_PRICE_AGE_DAYS)
        .map(([m, p]) => ({ modelo: m, dias: diasDesde(p.revisado) }));

    // 4. Ahorro disponible: modelo más barato que CUMPLE los requisitos.
    const ahorros: any[] = [];
    for (const { accion, modelo } of enUso) {
        const perfil = PERFILES[accion];
        if (!perfil || perfil.fijo) continue;

        const actual = coste(modelo, perfil);
        if (actual === null) continue;

        const candidatos = Object.entries(PRECIOS)
            .filter(([m]) => disponibles.has(m))
            // Un modelo de embeddings no puede sustituir a uno generativo por
            // barato que sea. Sin este filtro el comparador proponia embeddings
            // para chatear.
            .filter(([, p]) => p.generativo)
            .filter(([, p]) => !perfil.requiereAudio || p.audio)
            // Si la tarea exige razonamiento, no se propone bajar de gama: el
            // ahorro no compensa que el usuario perciba peores respuestas.
            .filter(([m]) => !perfil.requiereRazonamiento || !/lite/.test(m))
            .map(([m]) => ({ modelo: m, coste: coste(m, perfil)! }))
            .filter(c => c.coste < actual * 0.75)
            .sort((a, b) => a.coste - b.coste);

        if (candidatos.length) {
            ahorros.push({
                accion, unidad: perfil.unidad, actual: { modelo, coste: actual },
                mejor: candidatos[0], factor: +(actual / candidatos[0].coste).toFixed(1)
            });
        }
    }

    if (soloJson) {
        console.log(JSON.stringify({ fecha: new Date().toISOString(), desaparecidos, prohibidos, preciosCaducados, ahorros }, null, 2));
        process.exit(desaparecidos.length || prohibidos.length ? 1 : 0);
    }

    console.log('\n=== VIGILANCIA DE MODELOS ===\n');
    catalogos.forEach(c => console.log(c.error
        ? `  ${c.proveedor.padEnd(10)} ⚠️  ${c.error}`
        : `  ${c.proveedor.padEnd(10)} ${c.modelos.length} modelos`));

    if (desaparecidos.length) {
        console.log('\n🔴 EN USO Y YA NO EXISTEN:');
        desaparecidos.forEach(d => console.log(`   ${d.modelo}  (${d.donde})`));
    }
    if (prohibidos.length) {
        console.log('\n🔴 FAMILIAS PROHIBIDAS (AGENTS.md):');
        prohibidos.forEach(d => console.log(`   ${d.modelo}  (acción "${d.accion}")`));
    }

    console.log('\n--- COSTE POR UNIDAD DE TRABAJO ---');
    for (const { accion, modelo } of enUso) {
        const perfil = PERFILES[accion];
        if (!perfil) continue;
        const c = coste(modelo, perfil);
        const etiqueta = perfil.fijo ? ' [fijo por compatibilidad]'
            : perfil.requiereRazonamiento ? ' [calidad sobre precio]' : '';
        console.log(`   ${accion.padEnd(14)} ${modelo.padEnd(32)} ${c === null ? 'precio desconocido' : '$' + c.toFixed(4)}  por ${perfil.unidad}${etiqueta}`);
    }

    if (ahorros.length) {
        console.log('\n🟢 SE PUEDE PAGAR MENOS POR EL MISMO TRABAJO:');
        ahorros.forEach(a => {
            console.log(`   ${a.accion}: ${a.actual.modelo} -> ${a.mejor.modelo}`);
            console.log(`      $${a.actual.coste.toFixed(4)} -> $${a.mejor.coste.toFixed(4)} por ${a.unidad}  (${a.factor}x mas barato)`);
        });
        console.log('   Verifica la calidad antes de cambiar: el ahorro no vale una transcripcion peor.');
    }

    if (preciosCaducados.length) {
        console.log(`\n🟡 PRECIOS SIN REVISAR (>${MAX_PRICE_AGE_DAYS} dias). Ningun proveedor los expone por API:`);
        preciosCaducados.forEach(p => console.log(`   ${p.modelo}  hace ${p.dias} dias`));
    }

    if (!desaparecidos.length && !prohibidos.length) {
        console.log('\n✅ Todo lo que invoca el codigo existe y esta permitido.');
    }
    console.log('');

    process.exit(desaparecidos.length || prohibidos.length ? 1 : 0);
}

main();
