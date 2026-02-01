
const fs = require('fs');
const path = require('path');

const filePath = path.join('c:', 'Users', 'diego', 'Diktalo', 'utils', 'blogData.ts');
let content = fs.readFileSync(filePath, 'utf8');

console.log('Original size (post-fix):', content.length);

// 1. Ensure space before ** if preceded by word char or punctuation (except [space, (, [])
// Covers: "una**visión", "1.**Header"
content = content.replace(/([^\s\(\[])\*\*/g, '$1 **');

// 2. Ensure space after ** if followed by word char or (
// Covers: "**Alta**(req", "**visión**y"
// Exclude: space, ), ], ., ,, ;, :, *
content = content.replace(/\*\*([^\s\)\],\.;:\*])/g, '** $1');

// 3. Ensure space after . if followed by Uppercase letter (Fixes "Core).Entiende")
content = content.replace(/\.([A-ZÁ-ÚÑ])/g, '. $1');

// 4. Ensure space after : if followed by word (Fixes "Métrica:Antes")
content = content.replace(/:([a-zA-ZÁ-ÚÑ])/g, ': $1');

// 5. Table cosmetics: "|**" -> "| **" and "**|" -> "** |"
content = content.replace(/\|\*\*/g, '| **');
content = content.replace(/\*\*\|/g, '** |');

// 6. Fix specific "registra*modelos" case (Italic single star)
// Match * preceded by char, NOT *
// Regex: char + single *
content = content.replace(/([a-zA-Z0-9á-úñ])(?<!\*)\*(?!\*)/g, '$1 *');
// Match * followed by char, NOT *
content = content.replace(/(?<!\*)\*(?!\*)([a-zA-Z0-9á-úñ])/g, '* $1');

// 7. Fix "Core).Entiende" type patterns generally
// ) followed by char
content = content.replace(/\)([a-zA-Z])/g, ') $1');


fs.writeFileSync(filePath, content);
console.log('File saved.');
