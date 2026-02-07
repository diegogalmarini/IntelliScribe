/**
 * Diktalo Automated Newsroom Engine V2 (Intelligence & Impact)
 * -----------------------------------------------------------
 * This script produces high-authority articles (>2500 chars) and 
 * viral-potential social media posts following the Diktalo Content Master V5 SOP.
 */

import * as fs from 'fs';
import * as path from 'path';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const BLOG_DATA_PATH = path.join(process.cwd(), 'utils', 'blogData.ts');

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
    authorLinkedIn?: string;
    category: string;
    image: string;
    imageAlt: string;
    aeoAnswer: string;
    jsonLd?: string;
    tags: string[];
}

const AUTHORS = [
    { name: "Anya Desai", role: "Strategic Systems Architect", image: "/images/avatars/anya-desai.webp", categories: ["Seguridad", "Infraestructura", "IA"] },
    { name: "Leo Costa", role: "Strategic Architecture", image: "/images/avatars/leo-costa.webp", categories: ["Estrategia", "Negocios", "Innovación"] },
    { name: "Nati Pol", role: "Experience Strategy", image: "/images/avatars/nati-pol.webp", categories: ["UX", "Producto", "Productividad"] },
    { name: "Rohan Patel", role: "Infrastructure Lead", image: "/images/avatars/rohan-patel.webp", categories: ["Seguridad", "Legal", "Cloud"] }
];

async function fetchDiscoveryTopics(): Promise<string[]> {
    console.log("🔍 Brainstorming trending topics for Voice AI & Security...");
    // In a real environment, this could call Gemini to get trending search terms
    // or use a real News API. Following user request for real-world scenarios.
    return [
        "Hybrid Voice AI Architectures on-device security",
        "AI voice deepfake fraud surge 2026 prevention",
        "Multimodal generative models impact on voice identity",
        "Cognition AI and spatial hearing breakthroughs"
    ];
}

async function getNewsContext(topic: string) {
    // This bridges the gap between searching and generating.
    // For this implementation, we allow the script to generate based on the "hot topic".
    return topic;
}

async function generateAuthoritativeContent(topic: string) {
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY missing");

    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Enforcing Diktalo Content Master V5
    const prompt = `
    ACT AS: Senior Tech Content Engineer & Social Growth Specialist.
    STANDARD: DIKTALO-CONTENT-MASTER-V5.
    
    TOPIC FOR TODAY: "${topic}"

    GOAL: Create a "Flagship" blog post for Diktalo.com and a high-impact LinkedIn "Alpha Copy".

    --- BLOCK 1: ARTICLE CONSTRAINTS ---
    1. LENGTH: Must be > 3500 characters. 
    2. STRUCTURE:
       - Párrafo 0 (Snippet Trigger): 40-50 words direct technical answer to a complex question.
       - H2 headers as questions (AEO optimized).
       - Mandatory Markdown Table: Comparative/Roadmap/Impact Analysis.
       - Sections: "Impacto por Industria", "Guía de Implementación", "FAQ Técnica".
    3. TONE: Senior Expert Architect. Avoid AI buzzwords. Use "Soberanía de Voz" and "Privacidad por Diseño".
    4. LANG: Spanish (Spain).

    --- BLOCK 2: SOCIAL IMPACT (LINKEDIN ALPHA COPY) ---
    Template to follow:
    "🚨ÚLTIMA HORA: [Noticia Impactante]
    [Narrativa de impacto/testeo]
    [Bullet points de problemas resueltos]
    ✓ [Beneficio Técnico 1]
    ✓ [Beneficio Técnico 2]
    Esto es lo que significa para ti:
    [Valor estratégico]
    He recopilado [Magnet]...
    👉 Lee el análisis completo: [URL]"

    OUTPUT FORMAT: STRICT JSON ONLY.
    {
      "article": {
        "title": "...",
        "slug": "...", // keyword-year format
        "excerpt": "...",
        "content": "...", // Full Markdown text
        "aeoAnswer": "...",
        "category": "...", // Select from: Seguridad, Innovación, Producto, Negocios
        "tags": ["...", "..."]
      },
      "linkedin": "..." // This must be the dynamic, high-engagement post
    }
    `;

    console.log(`🧠 TRACE: Starting content generation for topic: ${topic}`);
    try {
        console.log("🧠 TRACE: Checking API Key...");
        if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY missing");

        console.log("🧠 TRACE: Importing GoogleGenerativeAI...");
        const { GoogleGenerativeAI } = await import("@google/generative-ai");

        console.log("🧠 TRACE: Initializing Gemini...");
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        console.log("🧠 TRACE: Prompt prepared. Sending to Gemini...");
        const result = await model.generateContent(prompt);

        console.log("🧠 TRACE: Response received from Gemini. Awaiting response object...");
        const response = await result.response;

        console.log("🧠 TRACE: Extracting text from response...");
        const text = response.text();
        console.log(`🧠 TRACE: Text extracted (Length: ${text.length}). Cleaning JSON...`);

        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        console.log("🧠 TRACE: Attempting JSON.parse...");
        const data = JSON.parse(jsonStr);
        console.log("🧠 TRACE: JSON parsed successfully.");

        const category = data.article.category || "Innovación";
        const author = AUTHORS.find(a => a.categories.includes(category)) || AUTHORS[1];
        console.log(`🧠 TRACE: Author matched: ${author.name}`);

        return {
            blog: {
                id: Date.now().toString(),
                date: new Date().toISOString().split('T')[0],
                author: author.name,
                authorRole: author.role,
                authorImage: author.image,
                image: "", // To be filled
                imageAlt: `Análisis estratégico sobre ${data.article.title} - Diktalo Tech`,
                ...data.article
            },
            linkedin: data.linkedin
        };
    } catch (err: any) {
        console.error("🧠 TRACE: CRITICAL ERROR IN generateAuthoritativeContent:");
        console.error(err);
        throw err;
    }
}

async function generateImage(title: string, slug: string): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200";

    try {
        console.log(`🎨 Generating specialized AI visual for: ${slug}`);
        const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${apiKey}`;

        // Detailed prompt for Imagen
        const prompt = `Realistic high-quality technical office environment with subtle futuristic UI elements, focused on a professional looking at a voice waveform on a clean, premium desktop setup. Depth of field, volumetric lighting, photorealistic. Topic: ${title}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                instances: [{ prompt: prompt + " --aspect_ratio 16:9" }],
                parameters: { aspectRatio: "16:9", sampleCount: 1 }
            })
        });

        if (!response.ok) throw new Error("Imagen generation failed");

        const data: any = await response.json();
        if (data.predictions?.[0]?.bytesBase64Encoded) {
            const base64 = data.predictions[0].bytesBase64Encoded;
            const buffer = Buffer.from(base64, 'base64');
            const imagePath = `/images/blog/${slug}.png`;
            const fullPath = path.join(process.cwd(), 'public', imagePath);

            if (!fs.existsSync(path.dirname(fullPath))) fs.mkdirSync(path.dirname(fullPath), { recursive: true });
            fs.writeFileSync(fullPath, buffer);
            return imagePath;
        }
        throw new Error("No image in response");
    } catch (e) {
        console.warn("⚠️ Falling back to curated tech stock image.");
        return "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200";
    }
}

async function runNewsroom() {
    console.log("🚀 Starting Diktalo Intelligence Newsroom...");

    try {
        const topics = await fetchDiscoveryTopics();
        // Picking the highest impact topic
        const selectedTopic = topics[Math.floor(Math.random() * topics.length)];

        const data = await generateAuthoritativeContent(selectedTopic);

        // Generate Image
        data.blog.image = await generateImage(data.blog.title, data.blog.slug);

        // Inject to Blog
        const blogData = fs.readFileSync(BLOG_DATA_PATH, 'utf-8');

        // Simple idempotency check
        if (blogData.includes(`"slug": "${data.blog.slug}"`)) {
            console.log(`⚠️ Article with slug "${data.blog.slug}" already exists. Skipping injection.`);
        } else {
            const injectionMarker = "export const blogPosts: BlogPost[] = [";
            const idx = blogData.indexOf(injectionMarker) + injectionMarker.length;

            const updatedBlogData = blogData.slice(0, idx) + "\n  " + JSON.stringify(data.blog, null, 2) + "," + blogData.slice(idx);
            fs.writeFileSync(BLOG_DATA_PATH, updatedBlogData);
            console.log("✅ Blog Updated with V5 Article.");
        }

        // Distribution
        const webhookUrl = process.env.SOCIAL_WEBHOOK_URL;
        if (webhookUrl) {
            const payload = {
                title: data.blog.title,
                url: `https://diktalo.com/blog/${data.blog.slug}`,
                image_url: data.blog.image.startsWith('http') ? data.blog.image : `https://diktalo.com${data.blog.image}`,
                linkedin_text: data.linkedin.replace("[URL]", `https://diktalo.com/blog/${data.blog.slug}`)
            };

            await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            console.log("✅ Alpha LinkedIn post sent to Make.");
        }

        console.log("✨ Newsroom cycle completed successfully.");
    } catch (error) {
        console.error("❌ Newsroom failed:", error);
        process.exit(1);
    }
}

runNewsroom();
