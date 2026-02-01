
const fs = require('fs');
const path = require('path');

const filePath = path.join('c:', 'Users', 'diego', 'Diktalo', 'utils', 'blogData.ts');
let content = fs.readFileSync(filePath, 'utf8');

console.log('Original size:', content.length);

// 1. OPENING TAGS: " ** Text" -> " **Text"
// Match: whitespace ** whitespace
// Replace: whitespace **
content = content.replace(/(\s)\*\* +/g, '$1**');

// 2. CLOSING TAGS: "Text ** " -> "Text** "
// Match: whitespace ** whitespace
// Replace: ** whitespace
content = content.replace(/ +\*\*(\s)/g, '**$1');

// Match: whitespace ** punctuation
// Replace: ** punctuation
content = content.replace(/ +\*\*([,.!:;?\)\]\}])/g, '**$1');

// 3. ITALICS OPENING: " * Text" -> " *Text"
// Match: whitespace * whitespace (Excluding **)
content = content.replace(/(\s)(?<!\*)\* +/g, '$1*');

// 4. ITALICS CLOSING: "Text * " -> "Text* "
// Match: whitespace * whitespace
content = content.replace(/ +\*(?!\*)(\s)/g, '*$1');
// Match: whitespace * punctuation
content = content.replace(/ +\*(?!\*)([,.!:;?\)\]\}])/g, '*$1');

// 5. Fix "1.**" -> "1. **" 
content = content.replace(/(\d+)\.\*\*/g, '$1. **');

fs.writeFileSync(filePath, content);
console.log('Fixed.');
