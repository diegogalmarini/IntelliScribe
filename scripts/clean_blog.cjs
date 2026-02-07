const fs = require('fs');
const path = 'C:/Users/diego/Diktalo/utils/blogData.ts';

const content = fs.readFileSync(path, 'utf8');
const lines = content.split('\n');

// Skip header (0, 1, 2) + 4 articles (3 to 106 in 0-indexed terms)
// Wait, my view_file used 1-based indexing.
// 1: import ...
// 2: 
// 3: export const blogPosts ... [
// 4:   { (Article 1)
// ...
// 107:   }, (Article 4)
// 108:   { (Article 5)

const header = lines.slice(0, 3);
const remaining = lines.slice(107); // Starts at index 107 (Line 108)

const newContent = header.concat(remaining).join('\n');
fs.writeFileSync(path, newContent, 'utf8');
console.log('Successfully cleaned blogData.ts while preserving encoding.');
