# Diktalo Chrome Extension (Ghostwire)

Chrome extension para capturar audio de pestañas del navegador y subirlas automáticamente a Diktalo.

## 🚀 Setup de Desarrollo

### 1. Instalar dependencias

```bash
cd chrome-extension
npm install
```

### 2. Build de la extensión

```bash
npm run build
```

Esto generará una carpeta `/dist` con la extensión compilada.

### 3. Cargar en Chrome (Load Unpacked)

1. Abre Chrome y ve a `chrome://extensions/`
2. Activa "Modo de desarrollador" (Developer mode) en la esquina superior derecha
3. Clic en "Cargar extensión sin empaquetar" (Load unpacked)
4. Selecciona la carpeta `chrome-extension/dist`

✅ La extensión debería aparecer en tu toolbar.

## 🔑 Configuración Inicial

1. Haz clic en el icono de Diktalo en la toolbar
2. Te pedirá un **API Token**
3. Por ahora, ve a `https://www.diktalo.com/settings` (cuando implementemos la página)
4. Copia tu token y pégalo en la extensión

> **Nota:** Por ahora usa un token temporal o implementa la autenticación con cookies.

## 🎬 Uso

1. Abre cualquier pestaña con audio (ej: YouTube, Google Meet)
2. Haz clic en el icono de Diktalo
3. Clic en "🔴 Grabar Pestaña"
4. El timer empezará a correr
5. Cuando termines, clic en "⏹️ Detener Grabación"
6. La grabación se subirá automáticamente y se abrirá en Diktalo

## 📁 Estructura del Proyecto

```
chrome-extension/
├── manifest.json          # Configuración Manifest V3
├── popup.html            # HTML del popup
├── offscreen.html        # HTML del offscreen document
├── src/
│   ├── background.ts     # Service Worker (maneja captura)
│   ├── offscreen.ts      # MediaRecorder handler
│   ├── popup.tsx         # React UI del popup
│   └── Popup.css         # Estilos del popup
├── icons/                # Iconos de la extensión
├── vite.config.ts        # Build config
└── package.json
```

## 🔧 Arquitectura Técnica

### Manifest V3 - Offscreen Document Pattern

Manifest V3 no permite usar `MediaRecorder` en Service Workers, por lo que usamos el patrón de **Offscreen Document**:

1. **popup.tsx** → Envía mensaje "START_RECORDING" a `background.ts`
2. **background.ts** → Crea offscreen document y usa `chrome.tabCapture`
3. **offscreen.ts** → Ejecuta MediaRecorder y guarda chunks de audio
4. **offscreen.ts** → Al detener, convierte chunks a Blob
5. **background.ts** → Sube Blob a `/api/upload-audio`

## 🐛 Debugging

### Ver logs de background script:
1. Ve a `chrome://extensions/`
2. Encuentra Diktalo
3. Clic en "service worker" (se abrirá DevTools)

### Ver logs de popup:
1. Click derecho en el icono de Diktalo
2. "Inspeccionar ventana emergente"

### Ver logs de offscreen:
1. Ve a `chrome://extensions/`
2. Clic en "Inspeccionar vistas: offscreen.html"

## 📝 Próximos Pasos (TODO)

- [ ] Crear iconos reales (ahora son placeholders)
- [ ] Implementar `/api/upload-audio` en el backend
- [ ] Sistema de autenticación más robusto (OAuth o cookie sharing)
- [ ] Detección automática de reuniones activas
- [ ] Soporte para mezclar audio de micrófono + pestaña
- [ ] Publicar en Chrome Web Store

## ⚠️ Known Issues

1. **Primer uso requiere permisos:** Chrome pedirá permisos de "tabCapture" la primera vez
2. **No funciona en pestañas protegidas:** chrome://, edge://, etc.
3. **Audio mudo en pestaña = grabación vacía:** Asegúrate de que el audio esté reproduciéndose

## 🆘 Troubleshooting

**Error: "Failed to capture tab audio"**
- Verifica que la pestaña tenga audio reproduciéndose
- Asegúrate de que no sea una pestaña protegida (chrome://)

**Error: "Not authenticated"**
- Configura tu API token en la extensión
- Verifica que el token sea válido en Diktalo

**Upload falla:**
- Verifica que el endpoint `/api/upload-audio` esté implementado
- Revisa los logs de background script para ver el error exacto

## 📚 Referencias

- [Chrome TabCapture API](https://developer.chrome.com/docs/extensions/reference/tabCapture/)
- [Offscreen Documents](https://developer.chrome.com/docs/extensions/reference/offscreen/)
- [MediaRecorder API](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)
