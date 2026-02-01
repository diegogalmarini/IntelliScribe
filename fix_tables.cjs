
const fs = require('fs');
const path = require('path');
const filePath = path.join('c:', 'Users', 'diego', 'Diktalo', 'utils', 'blogData.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Fix "Word **(" -> "Word** ("
content = content.replace(/([a-zA-Zá-úñ0-9]) \*\*\(/g, '$1** (');

// Fix "** (" -> "** (" (Ensure spacing)
content = content.replace(/\*\* \(/g, '** (');

fs.writeFileSync(filePath, content);
console.log('Fixed tables.');
