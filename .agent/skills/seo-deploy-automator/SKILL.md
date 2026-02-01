---
name: seo-deploy-automator
description: "Use this skill whenever you or the user edits `utils/blogData.ts` or make changes to SEO metadata/slugs. It ensures the sitemap is regenerated and the site is built correctly before deployment."
---

# SEO Deploy Automator 🚀

## Objetivo
Standardize the deployment workflow when SEO content (Blog Posts, Metadata, Slugs) is modified. Since `sitemap.xml` is generated at **build time**, we must ensure a clean build before pushing changes to GitHub.

## Guidelines
- **Target File**: `c:\Users\diego\Diktalo\utils\blogData.ts`
- **Output File**: `c:\Users\diego\Diktalo\public\sitemap.xml`
- **Crucial Step**: `npm run build` must run successfully. This script runs `node scripts/generate-sitemap.js` internally.

## Workflow

### 1. Verification (Before Push)
If you have modified `blogData.ts` or any routing logic:
1. Run `npm run build`.
2. Check that the output says `✅ Added X blog posts to sitemap`.
3. Verify `public/sitemap.xml` has updated timestamps (`lastmod`) or new slugs.

### 2. Deployment (GitHub Sync)
Once the build passes:
1. `git add utils/blogData.ts public/sitemap.xml`
2. `git commit -m "chore(seo): update blog content and regenerate sitemap"`
3. `git push origin main`

## Troubleshooting
- If `npm run build` fails, **DO NOT PUSH**. Fix the syntax error first (usually in `blogData.ts`).
- If `sitemap.xml` is empty, check the regex parsing in `scripts/generate-sitemap.js`.
