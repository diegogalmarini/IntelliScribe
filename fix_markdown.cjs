
const fs = require('fs');
const path = require('path');

const filePath = path.join('c:', 'Users', 'diego', 'Diktalo', 'utils', 'blogData.ts');
let content = fs.readFileSync(filePath, 'utf8');

console.log('Original size:', content.length);

// 1. Fix Bold: "** Text **" -> "**Text**"
// Remove space after **
content = content.replace(/\*\* +/g, '**');
// Remove space before ** (but be careful not to merge words like "Word**" is fine, but "Word **" -> "Word**" is wrong.
// Wait, the issue is inside the tag.
// " ** Text ** " -> " **Text** "
// The ending tag: "** Text **" -> "** Text**" -> "**Text**"
// We want to turn `** ` into `**` ONLY if it is the opening tag? 
// No, Markdown `**` is symmetric.
// If we have `Text ** Bold ** Text`, we want `Text **Bold** Text`.
// `\*\* +` -> matches `** `
// ` +\*\*` -> matches ` **`
// Let's rely on the fact that these are tokens.
content = content.replace(/\*\* +/g, '**'); // Fixes "** Text" -> "**Text"
content = content.replace(/ +\*\*/g, '**'); // Fixes "Text **" -> "Text**"

// 2. Fix Italics: "* Text *" -> "*Text*"
// Avoid touching list bullets at start of line (or after \n)
// Regex: Match `*` that is NOT at start of line (ignoring whitespace).
// But `content` is a TS string, so line breaks might be literal `\n`.
// We specifically want to fix `* text *`.
// Remove space after `*` if it's not a list bullet.
// A list bullet is `^\s*(\*|-|\d+\.)\s+`.
// We will simply look for ` * ` and collapse it? No.
// Let's target the specific pattern `* ` followed by non-space, and ` *` preceded by non-space?
// The issue in the file is `* modelos mentales *`.
// `\* +` -> `*`
content = content.replace(/(?<!\n\s*)\* +/g, '*');
// ` +\*` -> `*`
content = content.replace(/ +\*/g, '*');

// 3. Fix Table formatting
// The user complained about symbols being wrong.
// `| : --- |` is often parsed correctly, but `| :--- |` is better.
content = content.replace(/\| : --- \|/g, '| :--- |');
content = content.replace(/\| --- \|/g, '| :--- |');

// 4. Fix Spaces around Parentheses
// "Title(Context)" -> "Title (Context)"
// Regex: `(\w)\(` -> `$1 (`
content = content.replace(/([a-zá-úñA-ZÁ-ÚÑ])\(/g, '$1 (');
// Fix " ( Text ) " -> " (Text) "
content = content.replace(/\( +/g, '(');
content = content.replace(/ +\)/g, ')');

// 5. Fix " ?" and " )" spacing issues seen in file
content = content.replace(/ \?/g, '?');
// Fix "Cortex - Core" -> "Cortex-Core"
content = content.replace(/Cortex - Core/g, 'Cortex-Core');
// Fix "Real - time" -> "Real-time"
content = content.replace(/Real - time/g, 'Real-time');
// Fix "Micro - segmentación" -> "Micro-segmentación"
content = content.replace(/Micro - segmentación/g, 'Micro-segmentación');
// Fix "micro - expresiones" -> "micro-expresiones"
content = content.replace(/micro - expresiones/g, 'micro-expresiones');
// Fix "Blockchain - style" -> "Blockchain-style"
content = content.replace(/Blockchain - style/g, 'Blockchain-style');
// Fix "Task - switching" (task- switching)
content = content.replace(/task- switching/g, 'task-switching');

console.log('Fixed size:', content.length);
fs.writeFileSync(filePath, content);
console.log('File saved.');
