# Especificación Técnica: Diktalo Chrome Extension (Ghostwire)

**Versión:** 1.0  
**Estado:** PLANNED  
**Última actualización:** 2026-01-03

---

## 1. Objetivo

Permitir a los usuarios grabar audio de alta calidad directamente desde una pestaña del navegador (Meet, Zoom, Teams, Cursos) y sincronizarlo automáticamente con su cuenta de Diktalo para transcripción y análisis.

---

## 2. Flujo de Usuario (User Journey)

### 2.1. Instalación
1. Usuario accede a Chrome Web Store
2. Busca "Diktalo" o accede desde link en `diktalo.com`
3. Clic en "Añadir a Chrome"
4. Extensión se instala y muestra icono en toolbar
5. Al hacer primer clic, se abre página de bienvenida/autenticación

### 2.2. Autenticación
**Opción A: Cookie Sharing (Preferida)**
- Si usuario ya está logueado en `diktalo.com`, la extensión detecta cookies
- No requiere login adicional

**Opción B: Link Device**
- Extensión genera código único de 6 dígitos
- Usuario va a `diktalo.com/link-device`
- Ingresa código
- Extensión queda vinculada a la cuenta

### 2.3. Grabación
1. Usuario entra a una reunión (ej. Google Meet: `meet.google.com/xxx-xxxx-xxx`)
2. Clic en icono Diktalo en barra de navegador
3. **Popup muestra:**
   - Estado: "✅ Listo para grabar"
   - Título de la pestaña detectada: "Google Meet - Reunión con..."
   - Botón principal: "🔴 Start Recording"
   - Toggle opcional: "🎤 Incluir mi micrófono"

4. **Al iniciar:**
   - Se captura el audio de la pestaña (System Audio)
   - Opcional: Se mezcla con el micrófono del usuario (para escuchar ambos lados)
   - UI cambia a:
     - Timer: "00:00:15" (cuenta hacia arriba)
     - Botón: "⏸️ Pause" / "⏹️ Stop"
     - Indicador visual de grabación (onda de audio animada)

5. **Al finalizar:**
   - El audio se procesa localmente (blob WebM o WAV)
   - Muestra modal: "📤 Subiendo grabación..." con progress bar
   - Se sube automáticamente al endpoint `/api/upload-audio` de Diktalo
   - Popup muestra: "✅ Grabación guardada"
   - Botón: "Ver en Diktalo" → abre nueva pestaña `diktalo.com/intelligence/recordings/{id}`

---

## 3. Requerimientos Técnicos

### 3.1. Manifest V3 Compliance
```json
{
  "manifest_version": 3,
  "name": "Diktalo - AI Meeting Recorder",
  "version": "1.0.0",
  "description": "Graba y transcribe reuniones automáticamente",
  "permissions": [
    "tabCapture",
    "scripting",
    "activeTab",
    "storage"
  ],
  "host_permissions": [
    "https://meet.google.com/*",
    "https://*.zoom.us/*",
    "https://teams.microsoft.com/*",
    "https://www.diktalo.com/*"
  ],
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  "background": {
    "service_worker": "background.js",
    "type": "module"
  },
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
}
```

### 3.2. Arquitectura de Componentes

```
/chrome-extension/
├── manifest.json           # Configuración principal
├── popup.html             # UI del popup
├── popup.tsx              # Lógica del popup (React)
├── background.ts          # Service Worker (captura de audio)
├── content-script.ts      # Opcional: detectar reuniones activas
├── icons/                 # Iconos de la extensión
├── utils/
│   ├── auth.ts           # Gestión de autenticación
│   ├── recorder.ts       # Wrapper de MediaRecorder
│   └── uploader.ts       # Cliente para /api/upload-audio
├── package.json
└── tsconfig.json
```

### 3.3. Offscreen Documents
Para manejar audio persistente si es necesario (solo si Background Service Worker no es suficiente):

```typescript
// background.ts - crear offscreen doc
await chrome.offscreen.createDocument({
  url: 'offscreen.html',
  reasons: ['USER_MEDIA'],
  justification: 'Recording audio from tab capture'
});
```

### 3.4. Comunicación Entre Componentes
```typescript
// popup.tsx → background.ts
chrome.runtime.sendMessage({
  action: 'START_RECORDING',
  tabId: currentTabId,
  includeMic: true
});

// background.ts → popup.tsx
chrome.runtime.sendMessage({
  action: 'RECORDING_STATUS',
  isRecording: true,
  duration: 125 // segundos
});
```

---

## 4. Captura de Audio (Core Logic)

### 4.1. TabCapture API
```typescript
// background.ts
chrome.tabCapture.capture(
  {
    audio: true,
    video: false
  },
  (stream: MediaStream | null) => {
    if (!stream) {
      console.error('Failed to capture tab audio');
      return;
    }
    
    startRecording(stream);
  }
);
```

### 4.2. MediaRecorder Setup
```typescript
const mediaRecorder = new MediaRecorder(stream, {
  mimeType: 'audio/webm;codecs=opus', // Preferido
  audioBitsPerSecond: 128000
});

const audioChunks: Blob[] = [];

mediaRecorder.ondataavailable = (event) => {
  if (event.data.size > 0) {
    audioChunks.push(event.data);
  }
};

mediaRecorder.onstop = async () => {
  const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
  await uploadToDiktalo(audioBlob);
};

mediaRecorder.start(1000); // Chunks de 1 segundo
```

### 4.3. Mixing Tab Audio + Microphone (Opcional)
```typescript
// Si usuario activa "Incluir mi micrófono"
const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
const audioContext = new AudioContext();

const tabSource = audioContext.createMediaStreamSource(tabStream);
const micSource = audioContext.createMediaStreamSource(micStream);
const destination = audioContext.createMediaStreamDestination();

tabSource.connect(destination);
micSource.connect(destination);

const mediaRecorder = new MediaRecorder(destination.stream);
```

---

## 5. Integración con Diktalo Backend

### 5.1. Nuevo Endpoint: `/api/upload-audio`

**Request:**
```typescript
POST /api/upload-audio
Content-Type: multipart/form-data
Authorization: Bearer {token} // o Cookie

Body:
- audio: File (blob)
- title: string (opcional, ej: "Google Meet - 2026-01-03")
- source: "chrome-extension"
- tabUrl: string (URL de la pestaña grabada)
```

**Response:**
```json
{
  "success": true,
  "recordingId": "uuid-xxx-yyy",
  "message": "Recording uploaded successfully"
}
```

**Backend Logic:**
1. Validar autenticación del usuario
2. Guardar blob en Supabase Storage: `recordings/{userId}/{timestamp}.webm`
3. Crear entrada en tabla `recordings` con status: "Processing"
4. Encolar job de transcripción (AssemblyAI)
5. Retornar ID de la grabación

### 5.2. Autenticación

**Opción A: Cookie/Session Sharing**
```typescript
// popup.tsx
const checkAuth = async () => {
  const response = await fetch('https://www.diktalo.com/api/auth/session', {
    credentials: 'include' // Incluir cookies
  });
  
  if (response.ok) {
    const { user } = await response.json();
    return user;
  }
  
  // No autenticado → mostrar "Login Required"
};
```

**Opción B: Device Linking**
```typescript
// 1. Extensión genera código
const linkCode = generateCode(); // "AB12CD"
chrome.storage.local.set({ linkCode });

// 2. Usuario va a diktalo.com/link-device y lo ingresa
// 3. Backend valida y crea token de sesión
// 4. Extensión polling para verificar si fue vinculada
const checkLinking = setInterval(async () => {
  const response = await fetch(`/api/check-link/${linkCode}`);
  if (response.ok) {
    const { token } = await response.json();
    chrome.storage.local.set({ authToken: token });
    clearInterval(checkLinking);
  }
}, 2000);
```

---

## 6. Estados y UI del Popup

### 6.1. Estados Posibles
| Estado | UI a Mostrar |
|--------|-------------|
| `NOT_AUTHENTICATED` | "Inicia sesión en Diktalo" + botón |
| `READY` | "Listo para grabar" + botón Start |
| `RECORDING` | Timer + botón Stop + onda animada |
| `PAUSED` | Timer pausado + botón Resume/Stop |
| `UPLOADING` | Progress bar + "Subiendo..." |
| `UPLOADED` | ✅ "Grabación guardada" + link |
| `ERROR` | ❌ Mensaje de error + botón Retry |

### 6.2. Mockup del Popup
```
┌─────────────────────────────┐
│  🎙️ Diktalo                 │
├─────────────────────────────┤
│                             │
│  📹 Google Meet detectado   │
│  "Reunión con Equipo"       │
│                             │
│  ┌─────────────────────┐   │
│  │  🔴 Start Recording │   │
│  └─────────────────────┘   │
│                             │
│  ☐ Incluir mi micrófono     │
│                             │
└─────────────────────────────┘

[DURANTE GRABACIÓN]

┌─────────────────────────────┐
│  🎙️ Diktalo                 │
├─────────────────────────────┤
│  🔴 Grabando...             │
│  ⏱️  00:02:35               │
│                             │
│  ▁▂▃▅▇▅▃▂▁▂▃▅▇ (waveform)  │
│                             │
│  ┌──────┐  ┌──────┐       │
│  │ Pause│  │ Stop │       │
│  └──────┘  └──────┘       │
└─────────────────────────────┘
```

---

## 7. Detección Automática de Reuniones (Opcional)

### 7.1. Content Script
Detectar cuándo el usuario está en una reunión activa:

```typescript
// content-script.ts
// Se inyecta en meet.google.com, zoom.us, teams.microsoft.com

const detectMeeting = () => {
  // Google Meet: buscar elemento de video activo
  const meetingActive = document.querySelector('[data-meeting-active]') !== null;
  
  if (meetingActive) {
    chrome.runtime.sendMessage({
      action: 'MEETING_DETECTED',
      platform: 'Google Meet',
      title: document.title
    });
  }
};

// Observer para detectar cambios
const observer = new MutationObserver(detectMeeting);
observer.observe(document.body, { childList: true, subtree: true });
detectMeeting(); // Check inicial
```

### 7.2. Badge Notification
Mostrar badge en el icono cuando hay reunión activa:

```typescript
// background.ts
chrome.action.setBadgeText({ text: '1' });
chrome.action.setBadgeBackgroundColor({ color: '#FF0000' });
```

---

## 8. Testing Strategy

### 8.1. Unit Tests
- `recorder.ts`: Verificar creación y manejo de MediaRecorder
- `uploader.ts`: Mocks de fetch para upload
- `auth.ts`: Flujos de autenticación

### 8.2. Integration Tests
- Captura de audio real en pestaña de prueba
- Upload a staging de Diktalo
- Verificación de transcripción completa

### 8.3. Manual Testing Checklist
- [ ] Instalación desde `.crx` local
- [ ] Login/linking funciona
- [ ] Grabación en Google Meet (5 min)
- [ ] Grabación en Zoom Web (5 min)
- [ ] Pausar/reanudar funciona
- [ ] Upload completo sin errores
- [ ] Ver en Dashboard muestra grabación
- [ ] Transcripción generada correctamente

---

## 9. Deployment

### 9.1. Build Process
```bash
cd chrome-extension
npm install
npm run build  # Genera /dist con archivos compilados
```

### 9.2. Chrome Web Store Submission
1. Crear cuenta de desarrollador ($5 fee única)
2. Preparar assets:
   - Screenshots (1280x800px)
   - Descripción en ES/EN
   - Promotional tile (440x280px)
3. Subir `.zip` de `/dist`
4. Review process: ~1-3 días

### 9.3. Versioning
- `1.0.0` - Versión inicial (Meet + Zoom)
- `1.1.0` - Añadir Teams support
- `1.2.0` - Auto-start on meeting join

---

## 10. Privacy & Security

### 10.1. Declaraciones Requeridas
- **¿Por qué `tabCapture`?** "Para grabar el audio de reuniones y webinars para transcripción posterior"
- **¿Dónde se almacenan los datos?** "Audio se sube a servidores de Diktalo (Supabase) encriptados"
- **¿Se comparte con terceros?** "No, solo se usa AssemblyAI para transcripción (procesador de datos GDPR-compliant)"

### 10.2. Permissions Justification
```json
{
  "permissions": {
    "tabCapture": "Required to capture audio from browser tabs during meetings",
    "activeTab": "To detect which tab is currently being recorded",
    "storage": "To store user authentication tokens and preferences",
    "scripting": "To inject content scripts for meeting detection"
  }
}
```

---

## 11. Limitaciones Conocidas

1. **Solo funciona en Chrome/Edge**: Firefox usa API diferente
2. **Requiere pestañas activas**: No puede grabar pestañas en background
3. **Calidad depende de codec**: WebM Opus es preferido pero no universal
4. **Sin grabación de video**: Solo audio (por ahora)
5. **Límite de duración**: Backend puede limitar a X minutos según plan

---

## 12. Prompt de Inicialización (Para Desarrollo Futuro)

Cuando estés listo para comenzar el desarrollo, usa este prompt:

```markdown
Actúa como experto en Chrome Extensions Manifest V3 y TypeScript.

Crea una estructura de proyecto completa en la carpeta `/chrome-extension`.

Necesito:

1. **`manifest.json`** configurado con:
   - Manifest V3
   - Permisos: `tabCapture`, `scripting`, `activeTab`, `storage`
   - Host permissions para Meet, Zoom, Teams, Diktalo
   - Background service worker
   - Action con popup

2. **`popup.html/tsx`** con interfaz limpia usando React:
   - Estado: "Listo para grabar" vs "Grabando" vs "Subiendo"
   - Botón principal: Start/Stop Recording
   - Timer visible durante grabación
   - Toggle: "Incluir mi micrófono"
   - Estilos: Tailwind CSS o CSS modules

3. **`background.ts`** manejando:
   - Capturastream de audio via `chrome.tabCapture.capture()`
   - Comunicación con popup via `chrome.runtime.sendMessage`
   - Estado global de grabación

4. **`MediaRecorder` logic** para:
   - Crear blobs de audio WebM/Opus
   - Manejar eventos: ondataavailable, onstop
   - Chunks de 1 segundo

5. **Lógica de upload** al servidor Diktalo:
   - Endpoint: `POST /api/upload-audio`
   - FormData con blob de audio
   - Headers de autenticación (cookie o token)
   - Progress tracking

6. **Sistema de autenticación**:
   - Detectar si usuario está logueado en diktalo.com
   - Fallback: Generar código de vinculación
   - Almacenar token en chrome.storage.local

Usa TypeScript estricto, ESLint, y Prettier.
Código debe ser fácil de entender y bien comentado.
```

---

## 13. Métricas de Éxito

**Alpha Release (MVP):**
- [ ] 10 usuarios beta testeando
- [ ] 50+ grabaciones procesadas sin errores
- [ ] Tasa de éxito de upload > 95%
- [ ] Tiempo promedio de upload < 30s para 10min de audio

**Public Release:**
- [ ] 100 instalaciones en primer mes
- [ ] Rating > 4.5 estrellas en Chrome Web Store
- [ ] Menos de 5% de reportes de bugs

---

## 14. Referencias

- [Chrome Extensions - TabCapture API](https://developer.chrome.com/docs/extensions/reference/tabCapture/)
- [Manifest V3 Migration Guide](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [MediaRecorder API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)
- [Service Workers in Extensions](https://developer.chrome.com/docs/extensions/mv3/service_workers/)

---

**Fin de la especificación. Este documento será la guía maestra para implementar Ghostwire.**
