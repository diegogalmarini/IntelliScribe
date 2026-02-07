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

    GOAL: Create a "Flagship" blog post for Diktalo.com (min 2000 characters) and a high-impact LinkedIn "Alpha Copy".
    
    GUIDELINES:
    1. CONTENT LENGTH: 2000-3000 characters. Deep technical insight.
    2. AUTHOR: Use "Anya Desai" or "Nati Pol".
    3. LANGUAGE: Spanish (ES).
    4. STRUCTURE: Use Markdown for the article content.
    5. TONE: Senior Expert Architect.

    **CRITICAL**: You MUST return a VALID JSON object. No conversational filler. No raw text between fields.
    
    JSON SCHEMA:
    {
      "article": {
        "title": "string",
        "slug": "string",
        "excerpt": "string",
        "content": "string (The full article markdown)",
        "aeoAnswer": "string",
        "category": "string",
        "tags": ["string"]
      },
      "linkedin": "string (Use [URL] for the link)"
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
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: { responseMimeType: "application/json" }
        }, { apiVersion: "v1beta" });

        console.log("🧠 TRACE: Prompt prepared. Sending to Gemini...");
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const jsonStr = response.text();

        console.log(`🧠 TRACE: JSON received (Length: ${jsonStr.length}).`);

        console.log("🧠 TRACE: Attempting JSON.parse...");
        let data;
        try {
            // Robust JSON extraction
            let sanitizedJson = jsonStr.trim();
            if (sanitizedJson.startsWith("```json")) {
                sanitizedJson = sanitizedJson.replace(/^```json/, '').replace(/```$/, '').trim();
            } else if (sanitizedJson.startsWith("```")) {
                sanitizedJson = sanitizedJson.replace(/^```/, '').replace(/```$/, '').trim();
            }

            data = JSON.parse(sanitizedJson);
            console.log("🧠 TRACE: JSON parsed successfully.");
        } catch (parseError: any) {
            console.error(`🧠 TRACE: JSON Parse failed at position ${parseError.at || 'unknown'}: ${parseError.message}`);
            fs.writeFileSync(path.join(process.cwd(), 'failed_newsroom_output.txt'), jsonStr);
            throw parseError;
        }

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

        if (!response.ok) {
            console.warn(`ÔÜá´©Å Imagen API failed with status ${response.status}. Using varied Unsplash fallback.`);
            const fallbackPool = [
                "photo-1550751827-4bd374c3f58b", // Circuit (Teal)
                "photo-1518770660439-4636190af475", // CPU
                "photo-1451187580459-43490279c0fa", // Digital Network
                "photo-1519389950473-acc7a968bb27", // Team/Tech
                "photo-1485827404703-89b55fcc595e", // AI/Future
                "photo-1558494949-ef010cbdcc31"  // Data center
            ];
            // Deterministic selection based on slug
            const charCodeSum = slug.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const photoId = fallbackPool[charCodeSum % fallbackPool.length];
            return `https://images.unsplash.com/${photoId}?auto=format&fit=crop&q=80&w=1200`;
        }

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
                linkedin_text: data.linkedin
                    .replace(/\[URL\]/gi, `https://diktalo.com/blog/${data.blog.slug}`)
                    .replace(/\[LINK_AL_ARTICULO\]/gi, `https://diktalo.com/blog/${data.blog.slug}`)
                    .replace(/\[LINK\]/gi, `https://diktalo.com/blog/${data.blog.slug}`)
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
