import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
    plugins: [react()],
    build: {
        outDir: 'dist',
        emptyOutDir: false, // Don't wipe dist, we append to it
        rollupOptions: {
            input: {
                content: resolve(__dirname, 'src/content.tsx')
            },
            output: {
                format: 'iife',
                entryFileNames: 'content.js',
                name: 'DiktaloContent', // Global name for IIFE
                extend: true,
                inlineDynamicImports: true // Force everything into one file
            }
        }
    },
    define: {
        'process.env.NODE_ENV': '"production"' // React needs this
    }
});
