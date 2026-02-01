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
    { path: '/login', priority: '0.8', changefreq: 'monthly' },
    { path: '/contact', priority: '0.7', changefreq: 'monthly' },
    { path: '/about', priority: '0.7', changefreq: 'monthly' },
    { path: '/privacy', priority: '0.5', changefreq: 'yearly' },
    { path: '/terms', priority: '0.5', changefreq: 'yearly' },
    { path: '/trust', priority: '0.6', changefreq: 'monthly' },
    { path: '/roadmap', priority: '0.7', changefreq: 'monthly' }
];

function generateSitemap() {
    console.log('🗺️  Starting Sitemap Generation...');

    // 1. Static Routes XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    STATIC_ROUTES.forEach(route => {
        xml += `  <url>
    <loc>${BASE_URL}${route.path}</loc>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>
`;
    });

    // 2. Dynamic Blog Routes
    try {
        const blogData = fs.readFileSync(BLOG_DATA_PATH, 'utf8');

        // Simple regex parsing to extract slug and date
        // Matches objects roughly: { ... slug: "abc", ... date: "2024-01-01" ... }
        // We split by object start "{" to handle multiple items
        const rawPosts = blogData.split(/{\s*id:\s*"/).slice(1); // Skip prelude

        console.log(`📝 Found ${rawPosts.length} potential blog posts.`);

        let count = 0;
        rawPosts.forEach(chunk => {
            const slugMatch = chunk.match(/slug:\s*"([^"]+)"/);
            const dateMatch = chunk.match(/date:\s*"([^"]+)"/);

            if (slugMatch && dateMatch) {
                const slug = slugMatch[1];
                const date = dateMatch[1];

                xml += `  <url>
    <loc>${BASE_URL}/blog/${slug}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
`;
                count++;
            }
        });

        console.log(`✅ Added ${count} blog posts to sitemap.`);

    } catch (err) {
        console.error('❌ Error reading blog data:', err);
    }

    xml += `</urlset>`;

    fs.writeFileSync(OUTPUT_PATH, xml);
    console.log(`✨ Sitemap generated successfully at: ${OUTPUT_PATH}`);
}

generateSitemap();
