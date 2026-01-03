# 🎬 Ghostwire Chrome Extension - MVP Completado

**Fecha:** 2026-01-03  
**Fase:** 3 - Captura de Sistema

---

## ✅ Lo Que Se Implementó

###1. **Estructura Completa de la Extensión**

Created `/chrome-extension` folder with:
- ✅ `manifest.json` (Manifest V3 compliant)
- ✅ `src/background.ts` - Service Worker con tab capture
- ✅ `src/offscreen.ts` - MediaRecorder handler
- ✅ `src/Popup.tsx` - React UI component
- ✅ `src/Popup.css` - Modern styling
- ✅ `popup.html` - Entry point
- ✅ `offscreen.html` - Offscreen document
- ✅ `icons/` - Generated icons (16px, 48px, 128px)
- ✅ Build configuration (Vite + TypeScript)

### 2. **Backend Integration**

Created [`api/upload-audio.ts`](file:///c:/Users/diego/Diktalo/api/upload-audio.ts):
- ✅ Receives multipart/form-data from extension
- ✅ Bearer token authentication
- ✅ Uploads to Supabase Storage (`recordings/{userId}/{timestamp}.webm`)
- ✅ Creates DB entry in `recordings` table
- ✅ CORS headers for extension requests
- ✅ Metadata tracking (source, tab_url)

### 3. **Architecture - Manifest V3 Pattern**

**Flow:**
1. **Popup UI** → User clicks "Grabar Pestaña"
2. **background.ts** → Uses `chrome.tabCapture.getMediaStreamId()`
3. **background.ts** → Creates offscreen document
4. **offscreen.ts** → Receives stream ID, creates MediaRecorder
5. **offscreen.ts** → Collects audio chunks (WebM/Opus)
6. **offscreen.ts** → On stop, creates Blob
7. **background.ts** → Uploads Blob to `/api/upload-audio`
8. **Intelligence Dashboard** → Recording appears automatically

**Why Offscreen Document?**  
Manifest V3 Service Workers don't support MediaRecorder API. Offscreen documents run in a hidden page context where MediaRecorder is available.

---

## 🚀 Setup e Instalación

### Paso 1: Build la Extensión

```bash
cd chrome-extension
npm install
npm run build
```

Esto genera la carpeta `/dist` con la extensión compilada.

### Paso 2: Cargar en Chrome

1. Abre Chrome: `chrome://extensions/`
2. Activa **"Modo de desarrollador"** (Developer mode)
3. Click "**Cargar extensión sin empaquetar**" (Load unpacked)
4. Selecciona: `c:\Users\diego\Diktalo\chrome-extension\dist`

✅ El icono de Diktalo debería aparecer en la toolbar

### Paso 3: Configurar Autenticación

**Opción A: API Token (Implementación actual)**
1. Ve a `https://www.diktalo.com/settings` (crear página de settings si no existe)
2. Genera/muestra tu API token
3. En la extensión, pega el token en el input
4. Click "Guardar Token"

**Opción B: Cookie Sharing (TODO)**
- Si el usuario ya está logueado en diktalo.com, compartir cookies automáticamente

---

## 🧪 Testing del MVP

### Test 1: Grabación Básica de YouTube

1. Abre un video de YouTube: https://www.youtube.com/watch?v=dQw4w9WgXcQ
2. Haz click en el icono de Diktalo en la toolbar
3. Click "🔴 Grabar Pestaña"
4. **Verificar:**
   - Timer empieza a correr (00:01, 00:02...)
   - Indicador "🔴 Grabando" visible
5. Espera **10 segundos**
6. Click "⏹️ Detener Grabación"
7. **Verificar:**
   - Status cambia a "📤 Subiendo"
   - Luego a "✅ Completado"
   - Se abre nueva pestaña: `diktalo.com/intelligence/recordings/{id}`

### Test 2: Ver en Dashboard

1. Ve a `https://www.diktalo.com/intelligence`
2. **Verificar:**
   - Aparece nueva grabación con título "Chrome Extension Recording - [fecha]"
   - Status: "Processing"
   - Source metadata visible

### Test 3: Verificar en Supabase

**Storage:**
1. Supabase → Storage → Bucket `recordings`
2. Carpeta `{userId}/`
3. **Buscar:** Archivo `.webm` con timestamp reciente
4. **Verificar:** Tamaño > 0 bytes, puede descargarse

**Database:**
1. Supabase → Table Editor → `recordings`
2. Filtrar por `status = 'Processing'`
3. **Verificar:** Nueva fila con metadata:
   ```json
   {
     "source": "chrome-extension",
     "tab_url": "https://www.youtube.com/watch?v=...",
     "uploaded_at": "2026-01-03T..."
   }
   ```

---

## 🐛 Debugging

### Ver Logs del Background Script

1. `chrome://extensions/`
2. Busca "Diktalo"
3. Click "service worker" (link azul)
4. Se abre DevTools con logs de `background.ts`

**Logs esperados:**
```
[Background] Received message: {action: "START_RECORDING", tabId: 123}
[Background] Starting recording for tab: 123
[Background] Got stream ID: {guid}
[Background] Offscreen document created
```

### Ver Logs del Offscreen

1. `chrome://extensions/`
2. Click "Inspeccionar vistas: offscreen.html"

**Logs esperados:**
```
[Offscreen] Received message: {action: "START_OFFSCREEN_RECORDING", streamId: ...}
[Offscreen] Starting recording with stream ID: ...
[Offscreen] Got MediaStream: MediaStream {active: true, ...}
[Offscreen] MediaRecorder started
[Offscreen] Audio chunk received: 8192 bytes
...
[Offscreen] Recording stopped, chunks collected: 10
[Offscreen] Creating final blob from 10 chunks
[Offscreen] Blob created: 81920 bytes, 10 seconds
```

### Ver Logs del Popup

1. Click derecho en icono de Diktalo
2. "Inspeccionar ventana emergente"

---

## ⚠️ Problemas Conocidos y Soluciones

### Error: "Failed to get stream ID"

**Causa:** La pestaña no tiene audio activo o es una página protegida.

**Solución:**
- Asegúrate de que el audio esté reproduciéndose
- No intentes grabar en `chrome://`, `edge://`, etc.
- Prueba con YouTube primero

### Error: "Unauthorized - Invalid token"

**Causa:** Token de API incorrecto o expirado.

**Solución:**
1. Genera nuevo token en Diktalo settings
2. Pega el nuevo token en la extensión
3. Verifica que el header `Authorization: Bearer {token}` se esté enviando

### Upload se queda en "Subiendo..." forever

**Causa:** Endpoint `/api/upload-audio` no está respondiendo.

**Verificar:**
1. Revisa Network tab del popup si hay errores 401/500
2. Verifica que `formidable` esté instalado en el backend:
   ```bash
   npm install formidable @types/formidable
   ```
3. Revisa logs de Vercel para ver errores del backend

### Grabación está vacía (0 bytes)

**Causa:** MediaRecorder no recibió datos del stream.

**Solución:**
- Confirma que el audio de la pestaña está activo
- Revisa logs de offscreen: debe mostrar "Audio chunk received"
-  Si no hay chunks, el stream puede estar mudo

---

## 📊 Resultados Esperados

| Test | Estado | Evidencia |
|------|--------|-----------|
| Build sin errores | ✅ | `/dist` folder created |
| Extensión se carga en Chrome | ⏳ | Icono visible en toolbar |
| Popup se abre | ⏳ | UI renderizada correctamente |
| Grabación de 10s | ⏳ | Timer cuenta, blob > 0 bytes |
| Upload a backend | ⏳ | Status 200 OK, recordingId retornado |
| Aparece en Dashboard | ⏳ | Nueva fila en `recordings` table |
| Audio reproducible | ⏳ | File descargable desde Supabase |

---

## 🎯 Próximos Pasos

### Inmediato (Para Completar MVP)
- [ ] **Testear el flujo completo end-to-end**
- [ ] **Implementar página `/settings` para generar API tokens**
- [ ] **Trigger automático de transcripción** después de upload
- [ ] **Mejorar manejo de errores** en UI del popup

### Futuro (Post-MVP)
- [ ] **Cookie sharing** para autenticación automática
- [ ] ** Detección automática** de reuniones activas (Meet/Zoom)
- [ ] **Mezclar micrófono + tab audio** (para grabaciones bidireccionales)
- [ ] **Publicar en Chrome Web Store**
- [ ] **Iconos de mejor calidad** (diseño profesional)
- [ ] **Estadísticas de uso** (minutos grabados, uploads exitosos)

---

## 📸 Screenshots

![Extension Icon](file:///C:/Users/diego/.gemini/antigravity/brain/ec52c185-28b1-42e2-837a-9577d52ce3e4/extension_icon_1767447983247.png)

---

## 📚 Archivos Clave Creados

**Extension:**
- [`chrome-extension/manifest.json`](file:///c:/Users/diego/Diktalo/chrome-extension/manifest.json)
- [`chrome-extension/src/background.ts`](file:///c:/Users/diego/Diktalo/chrome-extension/src/background.ts) - 153 líneas
- [`chrome-extension/src/offscreen.ts`](file:///c:/Users/diego/Diktalo/chrome-extension/src/offscreen.ts) - 114 líneas
- [`chrome-extension/src/Popup.tsx`](file:///c:/Users/diego/Diktalo/chrome-extension/src/Popup.tsx) - 193 líneas
- [`chrome-extension/README.md`](file:///c:/Users/diego/Diktalo/chrome-extension/README.md)

**Backend:**
- [`api/upload-audio.ts`](file:///c:/Users/diego/Diktalo/api/upload-audio.ts) - 141 líneas

**Documentation:**
- [`docs/roadmap.md`](file:///c:/Users/diego/Diktalo/docs/roadmap.md)
- [`docs/specs/CHROME_EXTENSION_SPEC.md`](file:///c:/Users/diego/Diktalo/docs/specs/CHROME_EXTENSION_SPEC.md)

---

**MVP Status:** ✅ **READY FOR TESTING**

El código está completo y compilado. Ahora necesitas:
1. Cargar la extensión en Chrome
2. Configurar tu API token
3. Testear una grabación de 10s en YouTube
4. Verificar que aparezca en el Dashboard

¡Estamos listos para el primer test real! 🚀
