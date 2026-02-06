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
            title: "Google Launches Gemini 2.5 with Enhanced Reasoning",
            source: "Google DeepMind Blog",
            url: "https://blog.google/technology/ai/gemini-2-5-launch",
            relevance: 10,
            summary: "The new Gemini 2.5 model introduces superior reasoning capabilities and 1M context window, setting a new standard for voice intelligence."
        }
    ];
}

async function generateContentWithGemini(newsItem: NewsItem) {
    if (!GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is missing. Cannot generate content.");
    }

    console.log("🧠 Generating authority content with Gemini 2.5 Flash...");

    // Using the official SDK for text generation (which is stable)
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    // ADHERING TO SKILL STANDARD: gemini-2.5-flash
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
    ACT AS: Senior Tech Journalist & SEO Specialist for Diktalo (Voice Intelligence Platform).
    TASK: Write a comprehensive, high-authority blog post based on this news:
    
    NEWS TITLE: "${newsItem.title}"
    SUMMARY: "${newsItem.summary}"
    SOURCE: "${newsItem.source}"

    REQUIREMENTS:
    1. LENGTH: > 2500 characters. Deep analysis, not just news reporting.
    2. TONE: Professional, insightful, authoritative, yet accessible.
    3. STRUCTURE:
       - Title (Engaging, SEO-optimized)
       - Excerpt (Tweet-style summary)
       - Content (Markdown, use ## H2 for sections, **bold** for emphasis, bullet points)
       - AEO Answer (Direct answer to a "People Also Ask" question related to the topic)
       - Social Media Posts (Twitter, LinkedIn, Instagram text)
    4. FOCUS: Analyze the news from Diktalo's perspective (Voice Intelligence, AI, Security). If relevant, mention "Voice Sovereignty" or "Privacy", but prioritize the actual news topic.
    5. LANGUAGE: Spanish (Spain).
    6. FORMATTING: STRICT JSON. Escape all double quotes (") inside the content strings with backslash (\"). Do not include any markdown code blocks.

    OUTPUT FORMAT: JSON ONLY.
    {
      "blog": {
        "title": "...",
        "slug": "...", // kebab-case, english or spanish
        "excerpt": "...",
        "content": "...", // The full markdown article
        "aeoAnswer": "...",
        "tags": ["Tag1", "Tag2"]
      },
      "socials": {
        "twitter": "...", // Max 280 chars
        "linkedin": "...", // Professional tone
        "instagram": "..." // Visual/Engagement focused
      }
    }
    `;

    const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
    });

    const responseText = result.response.text();

    // CLEANUP: Remove markdown code blocks if present (Gemini often wraps JSON in ```json ... ```)
    const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

    const data = JSON.parse(cleanedText);

    // Merge with static defaults
    return {
        blog: {
            id: Date.now().toString(),
            date: new Date().toISOString().split('T')[0],
            author: "Anya Desai",
            authorRole: "Strategic Systems Architect",
            authorImage: "/images/avatars/anya-desai.webp",
            category: "Seguridad",
            image: "", // Will be filled by image generator
            imageAlt: `Concepto visual sobre ${data.blog.title}`,
            ...data.blog
        },
        socials: data.socials
    };
}

async function generateImageWithGemini(prompt: string, slug: string): Promise<string> {
    console.log(`🎨 Generating realistic AI image for: ${slug}...`);
    // --- GEMINI IMAGEN 3.0 GENERATION (REST API) ---
    // User requested "Nano Banana" (Imagen)
    try {
        console.log(`🎨 Generating AI image with Gemini Imagen 3.0 for: "${prompt}"...`);

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("GEMINI_API_KEY is missing");

        const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                instances: [{ prompt: prompt + " --aspect_ratio 16:9 --photorealistic --high_quality" }],
                parameters: { aspectRatio: "16:9", sampleCount: 1 }
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Gemini Imagen API failed: ${response.status} ${errText}`);
        }

        const data = await response.json();

        // Gemini returns base64
        if (data.predictions && data.predictions[0] && data.predictions[0].bytesBase64Encoded) {
            const base64Data = data.predictions[0].bytesBase64Encoded;
            const buffer = Buffer.from(base64Data, 'base64');

            const imagePath = `/images/blog/${slug}.png`;
            const fullPath = path.join(process.cwd(), 'public', imagePath);

            const dir = path.dirname(fullPath);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

            fs.writeFileSync(fullPath, buffer);
            console.log(`✅ Gemini Imagen generated and saved to: ${imagePath} (${buffer.length} bytes)`);
            return imagePath;
        } else {
            throw new Error("Gemini response missing image data");
        }

    } catch (error: any) {
        console.warn(`⚠️ Gemini Image Generation failed: ${error.message}`);
        console.log("🔄 Falling back to Unsplash high-quality stock photo...");

        // --- FALLBACK: UNSPLASH ---
        // Using a reliable tech/business query
        const fallbackUrl = `https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80`;
        return fallbackUrl;
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

async function sendToSocialWebhook(blogPost: BlogPost, aiSocials?: { twitter: string, linkedin: string }) {
    const webhookUrl = process.env.SOCIAL_WEBHOOK_URL;
    if (!webhookUrl) {
        console.warn("⚠️ SOCIAL_WEBHOOK_URL not found in environment. Skipping social distribution.");
        return;
    }

    const postUrl = `https://diktalo.com/blog/${blogPost.slug}`;
    const imageUrl = `https://diktalo.com${blogPost.image}`;

    // --- 1. Generate X Text (Max 280) ---
    // PRIORITY: Use AI-generated text if available, otherwise fallback to template
    let xText = "";
    if (aiSocials && aiSocials.twitter) {
        xText = aiSocials.twitter;
    } else {
        // Fallback Logic
        let xTitle = blogPost.title;
        const xUrlSuffix = ` — ${postUrl}`;
        const xMaxLen = 280 - xUrlSuffix.length;

        if (xTitle.length > xMaxLen) {
            xTitle = xTitle.substring(0, xMaxLen - 3) + "...";
        }
        xText = `${xTitle}${xUrlSuffix}`;
    }

    // --- 2. Generate LinkedIn Text ---
    // PRIORITY: Use AI-generated text if available, otherwise fallback to template
    let linkedinText = "";
    if (aiSocials && aiSocials.linkedin) {
        linkedinText = aiSocials.linkedin;
    } else {
        // Fallback Logic
        linkedinText = `${blogPost.title}\n\n${blogPost.excerpt}\n\n👉 Probalo: ${postUrl}`;
    }

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
        await sendToSocialWebhook(draftedContent.blog, draftedContent.socials);

        console.log("🚀 Automated Newsletter cycle complete!");
    } catch (error) {
        console.error("❌ Automation failed:", error);
        process.exit(1);
    }
}

runNewsroom();
