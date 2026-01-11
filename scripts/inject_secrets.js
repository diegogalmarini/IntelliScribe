
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Simple .env parser since we can't depend on dotenv
function parseEnv(filePath) {
    if (!fs.existsSync(filePath)) return {};
    const content = fs.readFileSync(filePath, 'utf8');
    const env = {};
    content.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            env[match[1].trim()] = match[2].trim();
        }
    });
    return env;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const envPath = path.join(rootDir, '.env.local');
const backgroundPath = path.join(rootDir, 'chrome-extension', 'src', 'background.ts');

console.log('--- INJECTING SECRETS ---');
console.log('Reading .env.local from:', envPath);

const env = parseEnv(envPath);
const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SUPABASE_KEY = env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('ERROR: Missing Supabase credentials in .env.local');
    process.exit(1);
}

console.log('Supabase URL found:', SUPABASE_URL); // Log safe
console.log('Supabase Key found (length):', SUPABASE_KEY.length);

let content = fs.readFileSync(backgroundPath, 'utf8');

// Replace placeholders
const oldContent = content;
content = content.replace('%%SUPABASE_URL%%', SUPABASE_URL);
content = content.replace('%%SUPABASE_KEY%%', SUPABASE_KEY);

if (content === oldContent) {
    console.warn('WARNING: No placeholders found or replaced.');
} else {
    fs.writeFileSync(backgroundPath, content);
    console.log('SUCCESS: Secrets injected into background.ts');
}
