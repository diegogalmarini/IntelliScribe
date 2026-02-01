
const fs = require('fs');
const path = require('path');

// Read the file content
const blogDataPath = path.join('c:', 'Users', 'diego', 'Diktalo', 'utils', 'blogData.ts');
const fileContent = fs.readFileSync(blogDataPath, 'utf8');

// Regex to extract objects. This is a simple regex and might need adjustment if the file structure is complex.
// We assume objects are inside the `blogPosts` array.
// A better way is to basically eval the file content if it was pure JSON, but it is TS.
// So we will use a regex to capture relevant fields.

// Strategy: Split by `id: "` to separate articles.
const articles = fileContent.split(/id:\s*"/).slice(1); // Remove the first chunk before the first ID

console.log(`Found ${articles.length} articles to validate.\n`);

let totalPass = 0;

articles.forEach(articleChunk => {
    // Extract ID
    const idMatch = articleChunk.match(/^(\d+)"/);
    const id = idMatch ? idMatch[1] : 'Unknown';

    // Extract Title
    const titleMatch = articleChunk.match(/title:\s*"(.+?)"/);
    const title = titleMatch ? titleMatch[1] : 'Unknown Title';

    // Extract Content - this is tricky because of backticks. 
    // We look for content: ` and end with `
    const contentMatch = articleChunk.match(/content:\s*`([\s\S]*?)`/);
    const content = contentMatch ? contentMatch[1] : '';

    // Extract AEO Answer
    const aeoMatch = articleChunk.match(/aeoAnswer:\s*"(.+?)"/);
    const aeoAnswer = aeoMatch ? aeoMatch[1] : '';

    const charCount = content.length;
    const hasVision = content.includes('Visión Diktalo');
    const hasAEO = aeoAnswer.length > 50; // Arbitrary check for non-empty
    const isLongEnough = charCount > 2500;

    console.log(`Article ID: ${id}`);
    console.log(`Title: ${title.substring(0, 50)}...`);
    console.log(`Length: ${charCount} chars`);
    console.log(`Has Visión Diktalo: ${hasVision ? 'YES' : 'NO'}`);
    console.log(`Has AEO Answer: ${hasAEO ? 'YES' : 'NO'}`);

    if (isLongEnough && hasVision && hasAEO) {
        console.log(`STATUS: PASS ✅`);
        totalPass++;
    } else {
        console.log(`STATUS: FAIL ❌`);
        if (!isLongEnough) console.log(`  - Content too short (Aim for > 2500)`);
        if (!hasVision) console.log(`  - Missing 'Visión Diktalo' section`);
        if (!hasAEO) console.log(`  - Missing/Short AEO Answer`);
    }
    console.log('-----------------------------------');
});

console.log(`\nValidation Complete. ${totalPass}/${articles.length} Passed.`);
