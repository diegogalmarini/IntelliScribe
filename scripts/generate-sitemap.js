import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://www.diktalo.com';
const BLOG_DATA_PATH = path.join(__dirname, '../utils/blogData.ts');
const OUTPUT_PATH = path.join(__dirname, '../public/sitemap.xml');

const STATIC_ROUTES = [
    { path: '/', priority: '1.0', changefreq: 'weekly' },
    { path: '/comparar-planes', priority: '0.9', changefreq: 'weekly' },
    { path: '/blog', priority: '0.9', changefreq: 'daily' },
    { path: '/about', priority: '0.7', changefreq: 'monthly' },
    { path: '/contact', priority: '0.7', changefreq: 'monthly' },
    { path: '/roadmap', priority: '0.7', changefreq: 'monthly' },
    { path: '/trust', priority: '0.6', changefreq: 'monthly' },
    { path: '/privacy', priority: '0.5', changefreq: 'yearly' },
    { path: '/terms', priority: '0.5', changefreq: 'yearly' },
];

function generateSitemap() {
    console.log('Generating sitemap...');

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    STATIC_ROUTES.forEach(route => {
        xml += `  <url>\n    <loc>${BASE_URL}${route.path}</loc>\n    <changefreq>${route.changefreq}</changefreq>\n    <priority>${route.priority}</priority>\n  </url>\n`;
    });

    try {
        const blogData = fs.readFileSync(BLOG_DATA_PATH, 'utf8');

        // Extract slug+date pairs by scanning line-by-line.
        // Handles both unquoted keys (id: "...") and quoted keys ("id": "...").
        const lines = blogData.split('\n');
        const posts = [];
        let currentSlug = null;
        let currentDate = null;

        for (const line of lines) {
            const slugMatch = line.match(/"?slug"?:\s*"([^"]+)"/);
            const dateMatch = line.match(/"?date"?:\s*"(\d{4}-\d{2}-\d{2})"/);

            if (slugMatch) currentSlug = slugMatch[1];
            if (dateMatch) currentDate = dateMatch[1];

            if (currentSlug && currentDate) {
                posts.push({ slug: currentSlug, date: currentDate });
                currentSlug = null;
                currentDate = null;
            }
        }

        // Deduplicate by slug (keep first occurrence)
        const seen = new Set();
        const unique = posts.filter(p => {
            if (seen.has(p.slug)) return false;
            seen.add(p.slug);
            return true;
        });

        console.log(`Found ${unique.length} blog posts.`);

        unique.forEach(({ slug, date }) => {
            xml += `  <url>\n    <loc>${BASE_URL}/blog/${slug}</loc>\n    <lastmod>${date}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
        });

    } catch (err) {
        console.error('Error reading blog data:', err);
        process.exit(1);
    }

    xml += `</urlset>`;
    fs.writeFileSync(OUTPUT_PATH, xml);
    console.log(`Sitemap written to ${OUTPUT_PATH}`);
}

generateSitemap();
