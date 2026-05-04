/**
 * Diktalo Automated Newsroom Engine V2 (Intelligence & Impact)
 * -----------------------------------------------------------
 * This script produces high-authority articles (>2500 chars) and 
 * viral-potential social media posts following the Diktalo Content Master V5 SOP.
 */

import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

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
    { name: "Anya Desai", role: "Strategic Systems Architect", image: "/images/avatars/anya-desai.webp", categories: ["Seguridad", "Ciberseguridad", "Infraestructura", "IA"] },
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

async function cleanAndParseJSON(jsonStr: string): Promise<any> {
    // 1. Remove Markdown code blocks
    let cleaned = jsonStr.trim();
    if (cleaned.includes("```json")) {
        cleaned = cleaned.split("```json")[1].split("```")[0];
    } else if (cleaned.includes("```")) {
        cleaned = cleaned.split("```")[1].split("```")[0];
    }

    cleaned = cleaned.trim();

    // 2. Attempt direct parse
    try {
        return JSON.parse(cleaned);
    } catch (e) {
        console.warn("⚠️ Standard JSON.parse failed, attempting aggressive sanitization...");
    }

    // 3. Aggressive Sanitization (common LLM JSON errors)
    // Fix bad escaped characters (e.g. single backslashes in text)
    // This is risky but often necessary for "creative" LLM outputs
    // We try to escape unescaped backslashes that aren't part of a valid escape sequence
    // A simple approach is often safer: text replacement for common issues

    // Remove control characters
    cleaned = cleaned.replace(/[\x00-\x1F\x7F-\x9F]/g, "");

    try {
        return JSON.parse(cleaned);
    } catch (e) {
        throw new Error(`Failed to parse JSON even after sanitization: ${(e as Error).message}`);
    }
}

async function generateAuthoritativeContent(topic: string) {
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY missing");

    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    // Use a model that is consistent. 
    // Gemini 2.5 is requested in user skills, using flash for speed/cost or pro for quality.
    // Script used gemini-2.5-flash.
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
    ACT AS: Senior Tech Content Engineer & Social Growth Specialist.
    STANDARD: DIKTALO-CONTENT-MASTER-V5.
    
    TOPIC FOR TODAY: "${topic}"

    GOAL: Create a "Flagship" blog post for Diktalo.com (min 2000 characters) and a high-impact LinkedIn "Alpha Copy".
    
    GUIDELINES:
    1. CONTENT LENGTH: 2000-3000 characters. Deep technical insight.
    2. AUTHOR: Choose the most relevant: Anya Desai (Security/AI), Leo Costa (Strategy), Nati Pol (Product).
    3. LANGUAGE: Spanish (ES).
    4. STRUCTURE: Use Markdown for the article content.
    5. TONE: Senior Expert Architect.
    6. ARTICLE FORMAT: **Pure Markdown only**. NO Emojis. NO Hashtags in the article body.

    LINKEDIN POST FORMAT (Strict):
    - Hook: Engaging headline with emoji.
    - Context: Brief problem statement (1-2 sentences).
    - Solution: 3-4 bullet points using "👉" emoji.
    - Call to Action: "Lee el artículo completo de [Author] en Diktalo.com..." with [URL] placeholder.
    - Hashtags: 8-10 relevant hashtags including #Diktalo #[Author]Name.

    **CRITICAL**: You MUST return a VALID JSON object. 
    - Escape all double quotes inside string values with backslash.
    - Do NOT use unescaped backslashes in text.
    - Do NOT add comments inside the JSON.
    
    JSON SCHEMA:
    {
      "article": {
        "title": "string",
        "slug": "string",
        "excerpt": "string",
        "content": "string (The full article markdown - NO social formatting)",
        "aeoAnswer": "string",
        "category": "string",
        "tags": ["string"]
      },
      "linkedin": "string (The LinkedIn post with emojis and hashtags)"
    }
    `;

    const MAX_RETRIES = 3;
    let lastError;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            console.log(`🧠 TRACE: Generation Attempt ${attempt}/${MAX_RETRIES} for topic: ${topic}`);

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const jsonStr = response.text();

            console.log(`🧠 TRACE: JSON received (Length: ${jsonStr.length}). Parsing...`);

            const data = await cleanAndParseJSON(jsonStr);
            console.log("🧠 TRACE: JSON parsed successfully.");

            // VALIDATION: Ensure critical fields exist
            if (!data.article || !data.article.title || !data.article.content) {
                throw new Error("JSON missing 'article' or core fields.");
            }

            // Fallback for LinkedIn text if missing
            if (!data.linkedin) {
                console.warn("⚠️ 'linkedin' field missing in JSON. Generating fallback from excerpt.");
                data.linkedin = `🚀 Nuevo artículo en Diktalo: ${data.article.title}\n\n${data.article.excerpt}\n\nLee más aquí: [URL]`;
            }

            const category = data.article.category || "Innovación";
            const author = AUTHORS.find(a => a.categories.includes(category)) || AUTHORS[1];

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

        } catch (error) {
            console.warn(`⚠️ Attempt ${attempt} failed: ${(error as Error).message}`);
            lastError = error;
            // Wait briefly before retry
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    console.error("❌ All generation attempts failed.");
    throw lastError;
}

function buildImagePrompt(title: string, excerpt: string, category: string, tags: string[]): string {
    const tagList = (tags || []).slice(0, 4).join(', ');
    return `Photorealistic editorial illustration for a Spanish tech blog article. Category: ${category}. Article title: "${title}". Key themes: ${tagList}. Summary: ${excerpt.slice(0, 300)}. Visual style: cinematic lighting, clean modern composition, no text, no watermarks, no logos. The scene must directly represent the article topic — avoid generic office setups unless the article is specifically about office work.`;
}

async function generateImageWithDallE3(prompt: string, slug: string): Promise<string> {
    const OpenAI = (await import("openai")).default;
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const response = await client.images.generate({
        model: "dall-e-3",
        prompt,
        size: "1792x1024",
        quality: "hd",
        response_format: "b64_json",
        n: 1,
    });

    const b64 = response.data[0].b64_json;
    if (!b64) throw new Error("No image data in DALL-E 3 response");

    const buffer = Buffer.from(b64, "base64");
    const imagePath = `/images/blog/${slug}.png`;
    const fullPath = path.join(process.cwd(), "public", imagePath);
    if (!fs.existsSync(path.dirname(fullPath))) fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, buffer);
    return imagePath;
}

async function generateImageWithGemini(prompt: string, slug: string): Promise<string> {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-image-preview" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const candidate = response.candidates?.[0];
    const part = candidate?.content?.parts?.find((p: any) => p.inlineData);
    if (!part?.inlineData?.data) throw new Error("No image data in Gemini response");

    const buffer = Buffer.from(part.inlineData.data, "base64");
    const imagePath = `/images/blog/${slug}.png`;
    const fullPath = path.join(process.cwd(), "public", imagePath);
    if (!fs.existsSync(path.dirname(fullPath))) fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, buffer);
    return imagePath;
}

async function generateImage(title: string, slug: string, excerpt: string, category: string, tags: string[]): Promise<string> {
    const prompt = buildImagePrompt(title, excerpt, category, tags);

    // 1. DALL-E 3 (primary — best quality)
    if (process.env.OPENAI_API_KEY) {
        try {
            console.log(`🎨 Generating image with DALL-E 3 for: ${slug}`);
            const imagePath = await generateImageWithDallE3(prompt, slug);
            console.log(`✅ DALL-E 3 image saved: ${imagePath}`);
            return imagePath;
        } catch (e) {
            console.warn(`⚠️ DALL-E 3 failed: ${(e as Error).message}. Trying Gemini fallback.`);
        }
    }

    // 2. Gemini fallback
    if (process.env.GEMINI_API_KEY) {
        try {
            console.log(`🎨 Fallback: generating image with Gemini for: ${slug}`);
            const imagePath = await generateImageWithGemini(prompt, slug);
            console.log(`✅ Gemini image saved: ${imagePath}`);
            return imagePath;
        } catch (e) {
            console.warn(`⚠️ Gemini failed: ${(e as Error).message}. Using Unsplash fallback.`);
        }
    }

    // 3. Unsplash last resort (deterministic hash per article)
    const combinedString = `${slug}-${title}`;
    let hash = 0;
    for (let i = 0; i < combinedString.length; i++) {
        hash = ((hash << 5) - hash) + combinedString.charCodeAt(i);
        hash |= 0;
    }
    const fallbackPool = [
        "photo-1550751827-4bd374c3f58b", "photo-1518770660439-4636190af475",
        "photo-1451187580459-43490279c0fa", "photo-1485827404703-89b55fcc595e",
        "photo-1558494949-ef010cbdcc31", "photo-1507413245164-6160d8298b31",
        "photo-1531297484001-80022131f5a1", "photo-1488590528505-98d2b5aba04b",
        "photo-1460925895917-afdab827c52f", "photo-1526374965328-7f61d4dc18c5",
        "photo-1551288049-bbbda536639a", "photo-1573164713714-d95e436ab8d6",
    ];
    const photoId = fallbackPool[Math.abs(hash) % fallbackPool.length];
    console.warn(`⚠️ Using Unsplash fallback for: ${slug}`);
    return `https://images.unsplash.com/${photoId}?auto=format&fit=crop&q=80&w=1200`;
}

async function runNewsroom() {
    console.log("🚀 Starting Diktalo Intelligence Newsroom...");

    try {
        const topics = await fetchDiscoveryTopics();
        // Picking the highest impact topic
        const selectedTopic = topics[Math.floor(Math.random() * topics.length)];

        const data = await generateAuthoritativeContent(selectedTopic);

        // Generate Image
        data.blog.image = await generateImage(data.blog.title, data.blog.slug, data.blog.excerpt, data.blog.category, data.blog.tags);

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
        if (webhookUrl && webhookUrl.startsWith("http")) {
            const payload = {
                title: data.blog.title,
                url: `https://diktalo.com/blog/${data.blog.slug}`,
                image_url: data.blog.image.startsWith('http') ? data.blog.image : `https://diktalo.com${data.blog.image}`,
                linkedin_text: data.linkedin
                    .replace(/\[URL\]/gi, `https://diktalo.com/blog/${data.blog.slug}`)
                    .replace(/\[LINK_AL_ARTICULO\]/gi, `https://diktalo.com/blog/${data.blog.slug}`)
                    .replace(/\[LINK\]/gi, `https://diktalo.com/blog/${data.blog.slug}`)
            };

            console.log(`📤 Sending payload to Make (URL: ${webhookUrl})...`);

            try {
                const response = await fetch(webhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    console.log("✅ Alpha LinkedIn post sent to Make.");
                } else {
                    console.error(`❌ Failed to send LinkedIn post to Make. Status: ${response.status}`);
                    const errorText = await response.text();
                    console.error(`Response content: ${errorText}`);
                }
            } catch (netError) {
                console.error(`❌ Network error sending to Make: ${(netError as Error).message}`);
            }
        } else {
            console.warn("⚠️ SOCIAL_WEBHOOK_URL is missing or invalid (must start with http). Skipping distribution.");
        }

        console.log("✨ Newsroom cycle completed successfully.");
    } catch (error) {
        console.error("❌ Newsroom failed:", error);
        process.exit(1);
    }
}

runNewsroom();
