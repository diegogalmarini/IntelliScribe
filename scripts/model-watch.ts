/**
 * scripts/model-watch.ts
 *
 * Vigila los modelos de los tres proveedores y avisa cuando lo que usa Diktalo
 * deja de ser la mejor opción, o directamente deja de existir.
 *
 * QUÉ PUEDE SABER DE VERDAD Y QUÉ NO
 *
 * Las tres APIs exponen su CATÁLOGO de modelos, así que la disponibilidad y las
 * desapariciones se detectan con certeza: si un modelo que el código invoca ya no
 * está en la lista, es un fallo inminente en producción.
 *
 * Lo que NINGUNA de las tres expone es el PRECIO por token. No hay endpoint de
 * tarifas. Por eso los precios viven en una tabla curada aquí abajo, con la fecha
 * en que se revisó, y el informe avisa cuando esa tabla lleva demasiado tiempo sin
 * mirarse. Prefiero decirlo que fingir que el precio se consulta solo.
 *
 * USO
 *   npx tsx scripts/model-watch.ts            informe por consola
 *   npx tsx scripts/model-watch.ts --json     salida JSON, para CI
 *
 * Necesita GEMINI_API_KEY, OPENAI_API_KEY y ANTHROPIC_API_KEY. Si falta alguna,
 * ese proveedor se salta y se indica en el informe: nunca se falla en silencio.
 */

import { GEMINI_CONFIG } from '../api/_utils/gemini.js';

// ---------------------------------------------------------------------------
// Tabla de precios curada
// ---------------------------------------------------------------------------
// USD por millón de tokens. `revisado` es la fecha en que se comprobó contra la
// página de tarifas del proveedor. Al superar MAX_PRICE_AGE_DAYS, el informe lo
// marca como caducado: significa "vuelve a mirarlo", no "esto es falso".
const MAX_PRICE_AGE_DAYS = 45;

interface PriceEntry {
    input: number;
    output: number;
    revisado: string; // YYYY-MM-DD
}

const PRECIOS: Record<string, PriceEntry> = {
    // Google
    'gemini-3.1-pro-preview':        { input: 1.25, output: 10.00, revisado: '2026-08-19' },
    'gemini-3.1-flash-preview':      { input: 0.30, output: 2.50,  revisado: '2026-08-19' },
    'gemini-3.1-flash-lite-preview': { input: 0.10, output: 0.40,  revisado: '2026-08-19' },
    'gemini-2.5-pro':                { input: 1.25, output: 10.00, revisado: '2026-08-19' },
    'gemini-2.5-flash':              { input: 0.30, output: 2.50,  revisado: '2026-08-19' },
    'gemini-3.7-flash':              { input: 0.30, output: 2.50,  revisado: '2026-08-19' },
    'gemini-embedding-001':          { input: 0.15, output: 0,     revisado: '2026-08-19' },
};

// ---------------------------------------------------------------------------
// Modelos que el código invoca hoy. Si uno desaparece del catálogo, es un fallo
// de producción esperando a ocurrir.
// ---------------------------------------------------------------------------
function modelosEnUso(): { modelo: string; donde: string }[] {
    const enUso: { modelo: string; donde: string }[] = [];

    for (const [accion, cfg] of Object.entries(GEMINI_CONFIG.actions)) {
        enUso.push({ modelo: (cfg as any).preferredModel, donde: `acción "${accion}"` });
    }
    for (const m of GEMINI_CONFIG.modelPriorities) {
        if (!enUso.some(e => e.modelo === m)) {
            enUso.push({ modelo: m, donde: 'cadena de fallback' });
        }
    }
    return enUso;
}

// ---------------------------------------------------------------------------
// Catálogos
// ---------------------------------------------------------------------------
interface Catalogo {
    proveedor: string;
    modelos: string[];
    error?: string;
}

async function catalogoGemini(): Promise<Catalogo> {
    const key = process.env.GEMINI_API_KEY;
    if (!key) return { proveedor: 'Google', modelos: [], error: 'falta GEMINI_API_KEY' };
    try {
        const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}&pageSize=200`);
        if (!r.ok) return { proveedor: 'Google', modelos: [], error: `HTTP ${r.status}` };
        const j: any = await r.json();
        // La API devuelve "models/gemini-x"; el código usa el nombre pelado.
        return { proveedor: 'Google', modelos: (j.models || []).map((m: any) => String(m.name).replace(/^models\//, '')) };
    } catch (e: any) {
        return { proveedor: 'Google', modelos: [], error: e?.message || 'error de red' };
    }
}

async function catalogoOpenAI(): Promise<Catalogo> {
    const key = process.env.OPENAI_API_KEY;
    if (!key) return { proveedor: 'OpenAI', modelos: [], error: 'falta OPENAI_API_KEY' };
    try {
        const r = await fetch('https://api.openai.com/v1/models', {
            headers: { Authorization: `Bearer ${key}` }
        });
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

// ---------------------------------------------------------------------------
// Análisis
// ---------------------------------------------------------------------------
const FAMILIAS_PROHIBIDAS = /^(gemini-1\.0|gemini-1\.5|gemini-2\.0|text-embedding-004|embedding-001$)/;

function diasDesde(fecha: string): number {
    return Math.floor((Date.now() - new Date(fecha).getTime()) / 86_400_000);
}

async function main() {
    const soloJson = process.argv.includes('--json');

    const [google, openai, anthropic] = await Promise.all([
        catalogoGemini(), catalogoOpenAI(), catalogoAnthropic()
    ]);

    const catalogos = [google, openai, anthropic];
    const disponibles = new Set(catalogos.flatMap(c => c.modelos));

    // 1. Modelos en uso que ya no existen en el catálogo: rotura inminente.
    const desaparecidos = modelosEnUso().filter(({ modelo }) =>
        google.modelos.length > 0 && !disponibles.has(modelo)
    );

    // 2. Modelos en uso de familias prohibidas por AGENTS.md.
    const prohibidos = modelosEnUso().filter(({ modelo }) => FAMILIAS_PROHIBIDAS.test(modelo));

    // 3. Precios que llevan demasiado sin revisar.
    const preciosCaducados = Object.entries(PRECIOS)
        .filter(([, p]) => diasDesde(p.revisado) > MAX_PRICE_AGE_DAYS)
        .map(([m, p]) => ({ modelo: m, dias: diasDesde(p.revisado) }));

    // 4. Modelos nuevos de Google que aún no se usan: candidatos a evaluar.
    const enUso = new Set(modelosEnUso().map(m => m.modelo));
    const candidatos = google.modelos
        .filter(m => /^gemini-/.test(m) && !enUso.has(m) && !FAMILIAS_PROHIBIDAS.test(m))
        .filter(m => !/embedding|aqa|tuning/.test(m));

    const informe = {
        fecha: new Date().toISOString(),
        catalogos: catalogos.map(c => ({
            proveedor: c.proveedor,
            modelos: c.modelos.length,
            error: c.error ?? null
        })),
        desaparecidos,
        prohibidos,
        preciosCaducados,
        candidatos,
    };

    if (soloJson) {
        console.log(JSON.stringify(informe, null, 2));
        process.exit(desaparecidos.length > 0 || prohibidos.length > 0 ? 1 : 0);
    }

    console.log('\n=== VIGILANCIA DE MODELOS ===\n');

    for (const c of catalogos) {
        console.log(c.error
            ? `  ${c.proveedor.padEnd(10)} ⚠️  ${c.error}`
            : `  ${c.proveedor.padEnd(10)} ${c.modelos.length} modelos`);
    }

    if (desaparecidos.length) {
        console.log('\n🔴 EN USO PERO YA NO EXISTEN — rotura inminente en producción:');
        desaparecidos.forEach(d => console.log(`   ${d.modelo}  (${d.donde})`));
    }

    if (prohibidos.length) {
        console.log('\n🔴 FAMILIAS PROHIBIDAS por AGENTS.md:');
        prohibidos.forEach(d => console.log(`   ${d.modelo}  (${d.donde})`));
    }

    if (preciosCaducados.length) {
        console.log(`\n🟡 PRECIOS SIN REVISAR (>${MAX_PRICE_AGE_DAYS} días). Ningún proveedor expone tarifas por API:`);
        preciosCaducados.forEach(p => console.log(`   ${p.modelo}  hace ${p.dias} días`));
    }

    if (candidatos.length) {
        console.log('\n🔵 MODELOS DE GOOGLE DISPONIBLES QUE NO SE USAN — evaluar:');
        candidatos.slice(0, 20).forEach(m => console.log(`   ${m}`));
        if (candidatos.length > 20) console.log(`   ... y ${candidatos.length - 20} más`);
    }

    if (!desaparecidos.length && !prohibidos.length && !preciosCaducados.length) {
        console.log('\n✅ Todo lo que usa el código sigue disponible y dentro de las familias permitidas.');
    }

    console.log('\nMapa actual acción → modelo:');
    for (const [accion, cfg] of Object.entries(GEMINI_CONFIG.actions)) {
        const m = (cfg as any).preferredModel;
        const p = PRECIOS[m];
        const precio = p ? `$${p.input}/$${p.output} por millón` : 'precio desconocido';
        console.log(`   ${accion.padEnd(14)} ${m.padEnd(32)} ${precio}`);
    }
    console.log('');

    process.exit(desaparecidos.length > 0 || prohibidos.length > 0 ? 1 : 0);
}

main();
