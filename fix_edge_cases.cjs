
const fs = require('fs');
const path = require('path');

const filePath = path.join('c:', 'Users', 'diego', 'Diktalo', 'utils', 'blogData.ts');
let content = fs.readFileSync(filePath, 'utf8');

console.log('Original size:', content.length);

// Fix " **y" -> "** y" (Space before ** but no space after?)
// No, the issue is "compleja **y".
// This means we have Space ** char.
// This looks like an OPENING tag! " **Text".
// But context implies closing. "visión compleja **y".
// This is because I previously merged " ** " into "** " (Space removed).
// Wait, Step 2: `content.replace(/ +\*\*(\s)/g, '**$1')`.
// If I had ` ** y`. Matches ` ** `. Replaces `** `. Result `** y`.
// Why did I get `**y`?
// Maybe `y` was NOT preceded by space?
// `compleja**y`.
// If original was `compleja **y` (no space after **).
// Then ` +\*\*(\s)` failed.
// Then `compleja **y` remained.
// So I need to handle ` **` followed by LETTER.
// BUT ` **Letter` is usually STARTING bold. ` **Text`.
// We need to know if it's closing.
// Bold ranges must be balanced.
// We can assume that if we have `**Text **Suffix`, the space before `**` implies closing.
// `Text **Suffix` -> `Text** Suffix`.
// content.replace(/ +\*\*([a-zA-Z0-9á-úñ])/g, '** $1');

// BUT this breaks ` **Text` (Start of bold).
// ` **Text` -> `** Text`. (Adds space! "una ** visión" -> "una ** visión").
// We want "una **visión".
// So ` **Text` should be ` **Text` (keep space before, remove space after?)
// My previous script #1 `(\s)\*\* +` handled ` ** ` -> ` **`.

// Let's just fix the known artifacts.
// ` **y` -> `** y`
content = content.replace(/ \*\*y/g, '** y');
// ` *manda` -> `* manda`
content = content.replace(/ \*manda/g, '* manda');
// ` *realmente` -> `* realmente`? 
// No `ahora *realmente`. `*realmente` is correct.
// `realmente *manda`. (Closing). ` *manda` -> `* manda`.
// ` **|` -> `** |`
content = content.replace(/ \*\*\|/g, '** |');
content = content.replace(/\*\*\|/g, '** |');

// General "Missing space after closing bold before word/punctuation"
// `Text**Suffix` -> `Text** Suffix`?
// `complexa**y` -> `complexa** y`.
content = content.replace(/([a-zA-Z])\*\*([a-zA-Z])/g, '$1** $2');

// Fix `**Alta **(` -> `**Alta** (`
content = content.replace(/\*\* \(/g, '** (');
// Fix ` **|` -> `** |`
content = content.replace(/ \*\*\|/g, '** |');

fs.writeFileSync(filePath, content);
console.log('Fixed.');
