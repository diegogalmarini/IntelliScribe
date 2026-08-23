
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { sentryVitePlugin } from '@sentry/vite-plugin';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,

        // Solo el esqueleto de la app. Antes esto incluia `png` y `svg`, con lo
        // que precacheaba TODAS las imagenes del build —las del blog, las de
        // features, los mockups— y la primera visita se descargaba 58,8 MB en
        // segundo plano.
        //
        // Efecto secundario peor que el peso: hasta que ese precache no termina,
        // el service worker nuevo no activa y el usuario sigue viendo el bundle
        // anterior. Es la razon de que los despliegues tarden en llegar.
        globPatterns: ['**/*.{js,css,html}'],

        // Las imagenes se cachean cuando se piden, no antes. Quien no entre al
        // blog no descarga sus imagenes.
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'diktalo-imagenes',
              expiration: {
                maxEntries: 80,
                maxAgeSeconds: 30 * 24 * 60 * 60,
                purgeOnQuotaError: true
              },
              cacheableResponse: { statuses: [0, 200] }
            }
          }
        ]
      },
      manifest: {
        name: 'Diktalo - AI Meeting Assistant',
        short_name: 'Diktalo',
        description: 'Capture, Transcribe, and Analyze meetings with AI.',
        theme_color: '#111827', // Matches background-dark
        background_color: '#111827',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    }),
    // Condicionado a propósito: sin el guard, un token caducado convierte cada
    // despliegue en un fallo de build. `filesToDeleteAfterUpload` garantiza que
    // ningún .map llegue al CDN.
    process.env.SENTRY_AUTH_TOKEN && sentryVitePlugin({
      org: 'diktalo',
      project: 'diktalo',
      authToken: process.env.SENTRY_AUTH_TOKEN,
      telemetry: false,
      sourcemaps: { filesToDeleteAfterUpload: ['./dist/**/*.map'] }
    })
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    minify: true,
    // Con `true` se publicaban 24 ficheros .map en producción: el código fuente
    // completo descargable desde diktalo.com.
    //
    // 'hidden' genera los mapas sin dejar el comentario //# sourceMappingURL,
    // pero el fichero sigue subiéndose al CDN, así que solo es aceptable cuando
    // el plugin de Sentry está activo y los borra tras subirlos. Sin token, no
    // se generan: es preferible perder la simbolización de stacks a republicar
    // el fuente. Para recuperarla, configurar SENTRY_AUTH_TOKEN en Vercel.
    sourcemap: process.env.SENTRY_AUTH_TOKEN ? 'hidden' : false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom', 'framer-motion'],
          ui: ['lucide-react'],
          // html2canvas no está en package.json: solo llega como transitiva de
          // jspdf. Referenciarlo aquí rompe el build el día que se pode.
          utils: ['jspdf', 'file-saver'],
          supabase: ['@supabase/supabase-js']
        }
      }
    }
  }
});
