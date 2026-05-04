#!/usr/bin/env tsx
/**
 * Backfill script: regenerate all automated blog article images with the
 * correct Gemini model (gemini-3.1-flash-image-preview) and dynamic prompts.
 *
 * Run: npx tsx scripts/regenerate_blog_images.ts
 *
 * - Overwrites existing /public/images/blog/{slug}.png files
 * - Replaces Unsplash fallback URLs in blogData.ts with local paths
 * - Processes articles dated >= 2026-02-25 (all automated articles)
 * - Skips articles that fail image generation (keeps existing image)
 */

import { config } from 'dotenv';
config({ path: '.env.local' });
import path from 'path';
import fs from 'fs';

const BLOG_DATA_PATH = path.join(process.cwd(), 'utils', 'blogData.ts');
const PUBLIC_BLOG_DIR = path.join(process.cwd(), 'public', 'images', 'blog');

interface ArticleEntry {
    slug: string;
    title: string;
    excerpt: string;
    category: string;
    tags: string[];
    currentImage: string;
    date: string;
}

function parseArticles(): ArticleEntry[] {
    const text = fs.readFileSync(BLOG_DATA_PATH, 'utf-8');
    const articles: ArticleEntry[] = [];

    // Match each top-level object by looking for "slug" anchors and extracting nearby fields
    // Strategy: split on "},\n  {" to get individual article blocks
    const arrayStart = text.indexOf('BlogPost[] = [');
    const content = text.slice(arrayStart);

    // Extract each article JSON block by finding matching braces
    let depth = 0;
    let start = -1;
    for (let i = 0; i < content.length; i++) {
        if (content[i] === '{') {
            if (depth === 0) start = i;
            depth++;
        } else if (content[i] === '}') {
            depth--;
            if (depth === 0 && start !== -1) {
                const block = content.slice(start, i + 1);
                try {
                    const obj = JSON.parse(block);
                    if (obj.slug && obj.date) {
                        articles.push({
                            slug: obj.slug,
                            title: obj.title || '',
                            excerpt: obj.excerpt || '',
                            category: obj.category || 'Tecnología',
                            tags: Array.isArray(obj.tags) ? obj.tags : [],
                            currentImage: obj.image || '',
                            date: obj.date,
                        });
                    }
                } catch {
                    // malformed block, skip
                }
                start = -1;
            }
        }
    }

    return articles;
}

function buildImagePrompt(title: string, excerpt: string, category: string, tags: string[]): string {
    const tagList = (tags || []).slice(0, 4).join(', ');
    return `Photorealistic editorial illustration for a Spanish tech blog article. Category: ${category}. Article title: "${title}". Key themes: ${tagList}. Summary: ${excerpt.slice(0, 300)}. Visual style: cinematic lighting, clean modern composition, no text, no watermarks, no logos. The scene must directly represent the article topic — avoid generic office setups unless the article is specifically about office work.`;
}

async function generateImageForArticle(
    title: string,
    slug: string,
    excerpt: string,
    category: string,
    tags: string[]
): Promise<string | null> {
    const prompt = buildImagePrompt(title, excerpt, category, tags);
    const imagePath = `/images/blog/${slug}.png`;
    const fullPath = path.join(PUBLIC_BLOG_DIR, `${slug}.png`);

    // 1. DALL-E 3 (primary)
    if (process.env.OPENAI_API_KEY) {
        try {
            const OpenAI = (await import('openai')).default;
            const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
            const response = await client.images.generate({
                model: 'dall-e-3',
                prompt,
                size: '1792x1024',
                quality: 'hd',
                response_format: 'b64_json',
                n: 1,
            });
            const b64 = response.data[0].b64_json;
            if (!b64) throw new Error('No image data');
            if (!fs.existsSync(PUBLIC_BLOG_DIR)) fs.mkdirSync(PUBLIC_BLOG_DIR, { recursive: true });
            fs.writeFileSync(fullPath, Buffer.from(b64, 'base64'));
            return imagePath;
        } catch (e) {
            console.warn(`  ⚠️ DALL-E 3 failed: ${(e as Error).message}. Trying Gemini.`);
        }
    }

    // 2. Gemini fallback
    if (process.env.GEMINI_API_KEY) {
        try {
            const { GoogleGenerativeAI } = await import('@google/generative-ai');
            const model = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
                .getGenerativeModel({ model: 'gemini-3.1-flash-image-preview' });
            const result = await model.generateContent(prompt);
            const candidate = result.response.candidates?.[0];
            const part = candidate?.content?.parts?.find((p: any) => p.inlineData);
            if (!part?.inlineData?.data) throw new Error('No image data');
            if (!fs.existsSync(PUBLIC_BLOG_DIR)) fs.mkdirSync(PUBLIC_BLOG_DIR, { recursive: true });
            fs.writeFileSync(fullPath, Buffer.from(part.inlineData.data, 'base64'));
            return imagePath;
        } catch (e) {
            console.warn(`  ⚠️ Gemini failed: ${(e as Error).message}`);
        }
    }

    return null;
}

function updateUnsplashUrl(slug: string, oldUrl: string, newPath: string) {
    let text = fs.readFileSync(BLOG_DATA_PATH, 'utf-8');
    text = text.replace(oldUrl, newPath);
    fs.writeFileSync(BLOG_DATA_PATH, text);
    console.log(`  ↳ Updated blogData.ts: replaced Unsplash URL for "${slug}"`);
}

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    const articles = parseArticles();
    // Only automated articles (2026-02-25 onwards)
    const targets = articles.filter(a => a.date >= '2026-02-25');

    console.log(`\nFound ${targets.length} articles to regenerate.\n`);

    let success = 0;
    let failed = 0;

    for (let i = 0; i < targets.length; i++) {
        const article = targets[i];
        console.log(`[${i + 1}/${targets.length}] ${article.date} — ${article.slug}`);

        try {
            const newPath = await generateImageForArticle(
                article.title,
                article.slug,
                article.excerpt,
                article.category,
                article.tags
            );

            if (newPath) {
                // If the current image was an Unsplash URL, update blogData.ts
                if (article.currentImage.startsWith('https://images.unsplash.com')) {
                    updateUnsplashUrl(article.slug, article.currentImage, newPath);
                }
                console.log(`  ✓ Image saved: ${newPath}`);
                success++;
            } else {
                console.warn(`  ✗ No image data returned, keeping existing image`);
                failed++;
            }
        } catch (err) {
            console.warn(`  ✗ Failed: ${(err as Error).message}`);
            failed++;
        }

        // Rate limiting: wait 2s between calls
        if (i < targets.length - 1) await sleep(2000);
    }

    console.log(`\nDone. Success: ${success} | Failed/Skipped: ${failed}`);
    if (failed > 0) {
        console.log('Articles that failed kept their existing image. Re-run to retry.');
    }
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
