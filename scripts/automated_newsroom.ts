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

async function generateImageWithGemini(prompt: string, slug: string): Promise<string> {
    console.log(`🎨 Generating realistic AI image for: ${slug}...`);
    try {
        // We use Pollinations.ai (FLUX model) for stable, realistic AI images. 
        // This is robust for CI environments and produces the "realistic people" style requested.
        const encodedPrompt = encodeURIComponent(prompt + ", photorealistic, high resolution, professional photography, cinematic lighting, no text, no logos");
        const imageUrl = `https://pollinations.ai/p/${encodedPrompt}?width=1024&height=768&model=flux&nologo=true&seed=${Math.floor(Math.random() * 100000)}`;

        console.log(`📸 Requesting image from: ${imageUrl}`);
        const response = await fetch(imageUrl);

        if (!response.ok) {
            throw new Error(`Image API failed with status: ${response.status}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const imagePath = `/images/blog/${slug}.png`;
        const fullPath = path.join(process.cwd(), 'public', imagePath);

        // Ensure directory exists
        const dir = path.dirname(fullPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        // Write REAL binary image data (not mock strings)
        fs.writeFileSync(fullPath, buffer);

        console.log(`✅ Real image generated and saved to: ${imagePath} (${buffer.length} bytes)`);
        return imagePath;
    } catch (error) {
        console.error("❌ Error generating image:", error);
        // Fallback to a high-quality professional office image if generation fails
        return "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80";
    }
}

async function injectPostToBlogData(newPost: BlogPost) {
    console.log(`📝 Injecting new post into ${BLOG_DATA_PATH}...`);

    const fileContent = fs.readFileSync(BLOG_DATA_PATH, 'utf-8');

    // DEDUPLICATION: Check if slug already exists to prevent tripling posts
    if (fileContent.includes(`"slug": "${newPost.slug}"`) || fileContent.includes(`slug: "${newPost.slug}"`)) {
        console.warn(`⚠️ Post with slug "${newPost.slug}" already exists. Skipping injection.`);
        return;
    }

    // First, generate the REAL image
    const realImagePath = await generateImageWithGemini(newPost.imageAlt, newPost.slug);
    newPost.image = realImagePath;

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

async function sendToSocialWebhook(blogPost: BlogPost) {
    const webhookUrl = process.env.SOCIAL_WEBHOOK_URL;
    if (!webhookUrl) {
        console.warn("⚠️ SOCIAL_WEBHOOK_URL not found in environment. Skipping social distribution.");
        return;
    }

    const postUrl = `https://diktalo.com/blog/${blogPost.slug}`;
    const imageUrl = `https://diktalo.com${blogPost.image}`; // Assuming image path is relative like /images/blog/...

    // --- 1. Generate X Text (Max 280) ---
    // Format: "{title} — {url}"
    let xTitle = blogPost.title;
    const xUrlSuffix = ` — ${postUrl}`;
    const xMaxLen = 280 - xUrlSuffix.length;

    if (xTitle.length > xMaxLen) {
        xTitle = xTitle.substring(0, xMaxLen - 3) + "..."; // Truncate with ellipsis
    }
    const xText = `${xTitle}${xUrlSuffix}`;

    // --- 2. Generate LinkedIn Text (Max 3000) ---
    // Format: "{title}\n\n{summary}\n\n👉 Probalo: {url}"
    const linkedinText = `${blogPost.title}\n\n${blogPost.excerpt}\n\n👉 Probalo: ${postUrl}`;

    // Construct Payload
    const payload = {
        title: blogPost.title,
        summary: blogPost.excerpt,
        url: postUrl,
        image_url: imageUrl,
        x_text: xText,
        linkedin_text: linkedinText
    };

    console.log("📤 Sending structured payload to Make.com:", JSON.stringify(payload, null, 2));

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            console.log("✅ Successfully sent to Social Webhook.");
        } else {
            console.error(`❌ Webhook failed with status: ${response.status}`);
        }
    } catch (error) {
        console.error("❌ Error sending to Webhook:", error);
    }
}

async function runNewsroom() {
    try {
        const news = await fetchLatestNews();
        const bestItem = news[0];
        const draftedContent = await generateContentWithGemini(bestItem);

        await injectPostToBlogData(draftedContent.blog);

        // --- Send Blog Post Data to Make.com for Socials ---
        await sendToSocialWebhook(draftedContent.blog);

        console.log("🚀 Automated Newsletter cycle complete!");
    } catch (error) {
        console.error("❌ Automation failed:", error);
        process.exit(1);
    }
}

runNewsroom();
