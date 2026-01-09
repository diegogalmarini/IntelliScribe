# 🧪 Ghostwire Extension - Guía de Testing

**Fecha:** 2026-01-03  
**Estado:** ✅ Ready for Testing

---

## 📋 Pre-requisitos

- ✅ Chrome/Edge instalado
- ✅ Extension compilada (`/chrome-extension/dist` existe)
- ✅ Backend con `/api/upload-audio` funcionando
- ✅ Cuenta en Diktalo activa

---

## 🚀 Paso 1: Cargar la Extensión en Chrome

1. **Abre Chrome Extensions**
   - Navega a: `chrome://extensions/`
   - O Menu → Más herramientas → Extensiones

2. **Activa Modo Desarrollador**
   - Toggle "Developer mode" en esquina superior derecha
   - Aparecerán nuevos botones: "Load unpacked", "Pack extension", etc.

3. **Carga la Extensión**
   - Click "Load unpacked" (Cargar extensión sin empaquetar)
   - Navega a: `c:\Users\diego\Diktalo\chrome-extension\dist`
   - Click "Seleccionar carpeta"

4. **Verificar Instalación**
   - ✅ Debe aparecer "Diktalo - AI Meeting Recorder" en la lista
   - ✅ Icono de Diktalo debe aparecer en la toolbar (esquina superior derecha)
   - ✅ Estado: Enabled (sin errores)

📸 **Screenshot esperado:**  
![Extension loaded](file:///c:/Users/diego/.gemini/antigravity/brain/ec52c185-28b1-42e2-837a-9577d52ce3e4/extension_tests/01_loaded.png)

---

## 🔑 Paso 2: Configurar API Token

1. **Obtener el Token**
   - Ve a: `https://www.diktalo.com`
   - Login si no estás logueado
   - Ve a Settings (⚙️ en sidebar)
   - Click en pestaña "**Developer**"
   - Verás tu API Token displayed

2. **Copiar el Token**
   - Click botón "Copiar Token"
   - Verás confirmación: "Copiado!"

3. **Configurar la Extensión**
   - Click en icono de Diktalo en toolbar
   - Se abre popup con formulario
   - **Estado inicial:** "Necesitasconfigur token de API"
   - Pega el token en el campo
   - Click "Guardar Token"

4. **Verificar Autenticación**
   - Popup debería cambiar a:
   - Status: "✅ Listo"
   - Botón visible: "🔴 Grabar Pestaña"

---

## 🎬 Paso 3: Test de Grabación (YouTube)

### 3.1. Preparación

1. **Abre un video de YouTube**
   - URL sugerida: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
   - Dale play al video (el audio DEBE estar sonando)

2. **Abre el Popup de Diktalo**
   - Click en icono de extensión
   - Verás: "✅ Listo para grabar"

### 3.2. Iniciar Grabación

1. Click "🔴 Grabar Pestaña"
2. **Verificar cambios:**
   - Status cambia a: "🔴 Grabando"
   - Timer empieza: "00:01", "00:02"...
   - Botones cambian a: "⏸️ Pause" y "⏹️ Stop"

3. **Dejar grabar 10-15 segundos**
   - El timer debe seguir incrementando
   - El audio del video debe seguir sonando

### 3.3. Detener Grabación

1. Click "⏹️ Detener Grabación"
2. **Verificar secuencia:**
   - Status: "⏳ Procesando" (1-2 segundos)
   - Status: "📤 Subiendo..." (2-5 segundos dependiendo del tamaño)
   - Status: "✅ Completado"
   - **Se abre nueva pestaña automáticamente:**
     `https://www.diktalo.com/intelligence/recordings/{id}`

---

## 📊 Paso 4: Verificar en Dashboard

### 4.1. En la Nueva Pestaña Abierta

- **URL:** `diktalo.com/intelligence/recordings/{id}`
- **Verificar:**
  - ✅ Título: "Chrome Extension Recording - [fecha]"
  - ✅ Status: "Processing" (cambiará a "Processed" después de transcripción)
  - ✅ Duración: ~10-15 segundos

### 4.2. En Dashboard Principal

1. Ve a: `https://www.diktalo.com/intelligence`
2. **Buscar la grabación:**
   - Primera tarjeta en la lista
   - Título: "Chrome Extension Recording..."
   - Source badge visible (opcional)

3. **Ver metadata:**
   - Fecha: Hoy
   - Duración: Correcta
   - Status: Processing

---

## 🗄️ Paso 5: Verificar en Supabase

### 5.1. Storage

1. **Supabase Dashboard:** `supabase.com/dashboard`
2. **Storage → Bucket `recordings`**
3. **Navegar a:** `{tu_user_id}/`
4. **Verificar archivo:**
   - Nombre: `{timestamp}.webm`
   - Tamaño: > 0 bytes (ej: 150KB para 10s)
   - Puede descargarse

### 5.2. Database

1. **Table Editor → `recordings`**
2. **Filtrar:** Status = 'Processing'
3. **Buscar última fila:**
   - `user_id`: Tu ID
   - `title`: "Chrome Extension Recording..."
   - `audio_url`: `{user_id}/{timestamp}.webm`
   - `metadata`: 
     ```json
     {
       "source": "chrome-extension",
       "tab_url": "https://www.youtube.com/watch?v=...",
       "uploaded_at": "2026-01-03T..."
     }
     ```

---

## 🐛 Debugging: Ver Logs

### Background Script Logs

1. `chrome://extensions/`
2. Busca "Diktalo"
3. Click en "service worker" (link azul)
4. Se abre DevTools

**Logs esperados:**
```
[Background] Received message: {action: "START_RECORDING", tabId: 1234}
[Background] Starting recording for tab: 1234
[Background] Got stream ID: dc8f2a3b-...
[Background] Offscreen document created
```

### Offscreen Logs

1. `chrome://extensions/`
2. Click "Inspeccionar vistas: offscreen.html"

**Logs esperados:**
```
[Offscreen] Received message: {action: "START_OFFSCREEN_RECORDING", ...}
[Offscreen] Got MediaStream: MediaStream {active: true}
[Offscreen] MediaRecorder started
[Offscreen] Audio chunk received: 8192 bytes
[Offscreen] Recording stopped, chunks collected: 10
[Offscreen] Blob created: 81920 bytes, 10 seconds
```

### Popup Logs

1. Click derecho en icono de Diktalo
2. "Inspeccionar ventana emergente"

---

## ✅ Checklist de Verificación

| Test | Esperado | ✓ |
|------|----------|---|
| Extensión se carga sin errores | Sin warnings en `chrome://extensions/` | |
| Icon visible en toolbar | Icono de Diktalo presente | |
| Popup se abre | UI renderizada correctamente | |
| API token se guarda | Cambio de estado a "Listo" | |
| Grabación inicia | Timer cuenta, status "Grabando" | |
| Audio se captura | Logs muestran chunks received | |
| Grabación se detiene | Blob creado correctamente | |
| Upload exitoso | Status 200 OK, recordingId retornado | |
| Abre dashboard | Nueva pestaña a `/recordings/{id}` | |
| Aparece en lista | Visible en `/intelligence` | |
| File en Storage | `.webm` descargable | |
| Row en DB | Metadata correcta | |

---

## ⚠️ Troubleshooting

### Error: "Failed to get stream ID"

**Síntoma:** Popup muestra error al iniciar grabación

**Causas posibles:**
- Pestaña no tiene audio activo
- Página protegida (chrome://, edge://)
- Permisos de tabCapture no otorgados

**Solución:**
1. Asegúrate de que el audio esté sonando
2. Prueba con YouTube primero
3. Verifica permisos en `chrome://extensions/`

### Error: "Unauthorized - Invalid token"

**Síntoma:** Upload falla con 401

**Solución:**
1. Ve a Settings → Developer
2. Copia el token nuevamente
3. Abre extensión y pega el nuevo token
4. Guarda

### Upload se queda en "Subiendo..." forever

**Síntoma:** Progress bar no avanza

**C Debugging:**
1. Abre DevTools del popup
2. Ve a Network tab
3. Busca request a `/api/upload-audio`
4. Revisa status code y response

**Causas comunes:**
- Backend no instaló `formidable`
- CORS headers incorrectos
- Token expirado

### Grabación vacía (0 bytes)

**Síntoma:** File existe pero tamaño = 0

**Solución:**
1. Verifica que el audio del video esté activo
2. Revisa logs de offscreen: debe mostrar "Audio chunk received"
3. Si no hay chunks, el stream está mudo

---

## 🎯 Próximos Tests (Opcional)

### Test con Google Meet

1. Crea/únete a una reunión de Meet
2. Activa tu micrófono y cámara
3. Graba 30 segundos de la reunión
4. Verifica transcripción (debería capturar ambos lados)

### Test con Zoom Web

1. Únete a reunión de Zoom desde navegador
2. Graba una conversación
3. Verifica calidad de audio

---

## 📝 Reportar Resultados

Después de completar todos los tests, documenta:

1. **Tests exitosos:** ¿Cuántos pasaron?
2. **Tests fallidos:** ¿Cuáles fallaron y por qué?
3. **Logs relevantes:** Copiar errores de console
4. **Screenshots:** De errores o comportamientos inesperados

---

**¿Listo para el primer test?** 🚀

1. Carga la extensión
2. Configura el token
3. Graba 10s de YouTube
4. Verifica en Dashboard

**¡Suerte!** Si algo falla, revisa la sección de Troubleshooting o contacta al equipo de desarrollo.
