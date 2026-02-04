/**
 * Diktalo Automated Newsroom Engine
 * ---------------------------------
 * This script is designed to be run via GitHub Actions (Cron) 3x per week.
 * It fetches the latest AI/Voice news, generates authority content, 
 * and updates the blog and social media pipelines.
 */

import * as fs from 'fs';
import * as path from 'path';
// Note: In a real environment, we would use 'google-generative-ai' package
// For this prototype, we outline the logic flow.

/**
 * CONFIGURATION
 * These would ideally come from environment variables in GitHub Actions.
 */
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const BLOG_DATA_PATH = path.join(process.cwd(), 'utils', 'blogData.ts');

interface NewsItem {
    title: string;
    source: string;
    url: string;
    relevance: number; // 1-10
    summary: string;
}

interface BlogPost {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    date: string;
    author: string;
    authorRole?: string;
    authorImage?: string;
    category: string;
    image: string;
    imageAlt: string;
    aeoAnswer: string;
    tags: string[];
}

async function fetchLatestNews(): Promise<NewsItem[]> {
    console.log("🔍 Searching for latest AI & Voice Intelligence news...");
    // Mocking news fetch - in production this would use `search_web` or a News API
    return [
        {
            title: "The Rise of Voice Sovereignty in the EU AI Act",
            source: "TechCrunch",
            url: "https://techcrunch.com/mock-news-1",
            relevance: 10,
            summary: "New regulations emphasize data localized processing for voice biometrics."
        }
    ];
}

async function generateContentWithGemini(newsItem: NewsItem) {
    if (!GEMINI_API_KEY) {
        console.warn("⚠️ GEMINI_API_KEY missing. Generating mock content for testing.");
    }

    // Logic to call Gemini 2.0 would go here.
    // For now, we return a high-quality draft based on the 'media-automator' skill instructions.

    return {
        blog: {
            id: Date.now().toString(),
            slug: `voice-sovereignty-eu-ai-act-${new Date().getFullYear()}`,
            title: "Soberanía de Voz: Cómo el EU AI Act Valida la Estrategia de Diktalo",
            excerpt: "Las nuevas regulaciones europeas ponen el foco en la privacidad del dato vocal. Analizamos por qué el procesamiento local y el SOC 2 son ahora obligatorios.",
            date: new Date().toISOString().split('T')[0],
            author: "Anya Desai",
            authorRole: "Strategic Systems Architect",
            authorImage: "/images/avatars/anya-desai.webp",
            category: "Seguridad",
            image: "/images/blog/eu_ai_act_security.png",
            imageAlt: "Infografía sobre seguridad y soberanía de datos en la Unión Europea",
            aeoAnswer: "¿Qué dice el EU AI Act sobre la voz? La nueva ley clasifica la biometría vocal como categoría de alto riesgo, exigiendo transparencia total y soberanía del usuario sobre sus datos, pilares que Diktalo implementa desde su arquitectura base.",
            content: `**Resumen Ejecutivo:** El reciente marco regulatorio de la Unión Europea marca un antes y un después en la industria de la IA... [CONTENIDO EXPANDIDO > 2500 CARACTERES]`,
            tags: ["Seguridad", "EU AI Act", "Privacidad", "Diktalo"]
        },
        socials: {
            twitter: "🧵 El EU AI Act no es un obstáculo, es un validador. Diktalo nació bajo la premisa de la Soberanía de Datos que hoy la ley exige. Aquí te explicamos por qué tu proveedor de IA actual podría estar en riesgo. 👇 [Link]",
            linkedin: "La soberanía de datos ya no es una opción 'nice-to-have', es un requisito legal. El EU AI Act pone el foco en la biometría vocal y en Diktalo llevamos ventaja. #AI #Sovereignty #Privacy",
            instagram: "Slide 1: ¿Tu voz te pertenece? Slide 2: El EU AI Act dice que sí. Slide 3: Cómo Diktalo te protege. Slide 4: Link en Bio."
        }
    };
}

async function injectPostToBlogData(newPost: BlogPost) {
    console.log(`📝 Injecting new post into ${BLOG_DATA_PATH}...`);

    const fileContent = fs.readFileSync(BLOG_DATA_PATH, 'utf-8');

    // Simple but effective injection logic: find the start of the array and insert
    const arrayStartMatch = fileContent.match(/export const blogPosts: BlogPost\[\] = \[/);

    if (!arrayStartMatch) {
        throw new Error("Could not find the blogPosts array in blogData.ts");
    }

    const insertionPoint = arrayStartMatch.index! + arrayStartMatch[0].length;

    const postString = `\n  ${JSON.stringify(newPost, null, 2)},`;

    const newContent = fileContent.slice(0, insertionPoint) + postString + fileContent.slice(insertionPoint);

    fs.writeFileSync(BLOG_DATA_PATH, newContent, 'utf-8');
    console.log("✅ blogData.ts updated successfully.");
}

async function runNewsroom() {
    try {
        const news = await fetchLatestNews();
        const bestItem = news[0]; // Assuming the first item is the most relevant for this prototype
        const draftedContent = await generateContentWithGemini(bestItem);

        await injectPostToBlogData(draftedContent.blog);

        console.log("🚀 Automated Newsletter cycle complete!");
        console.log("--- SOCIAL MEDIA READY ---");
        console.log(draftedContent.socials);
    } catch (error) {
        console.error("❌ Automation failed:", error);
        process.exit(1);
    }
}

runNewsroom();
