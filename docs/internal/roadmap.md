# 🗺️ Diktalo - Roadmap del Proyecto

**Última actualización:** 2026-01-03

---

## 🎯 Visión General

Diktalo es una plataforma de transcripción y análisis de audio alimentada por IA, diseñada para profesionales que necesitan capturar, organizar y extraer insights de reuniones, llamadas y contenido de audio.

---

## ✅ Fase 1: Core - Grabación Manual **[COMPLETADO]**

### Objetivo
Establecer la funcionalidad básica de grabación de audio desde múltiples fuentes.

### Componentes Implementados
- ✅ **InlineRecorder**: Grabación directa desde micrófono
- ✅ **MultiAudioUploader**: Subida masiva de archivos de audio
- ✅ **Almacenamiento**: Integración con Supabase Storage
- ✅ **Procesamiento**: Pipeline de transcripción con AssemblyAI
- ✅ **IA**: Generación de resúmenes con Google Gemini

### Estado
**COMPLETADO** - Todas las funcionalidades core están operativas en producción.

---

## ✅ Fase 2: Dashboard Intelligence **[COMPLETADO]**

### Objetivo
Crear una interfaz completa para gestionar, visualizar y analizar grabaciones.

### Componentes Implementados
- ✅ **Dashboard principal** (`/intelligence`)
- ✅ **RecordingDetailView**: Vista detallada con reproductor y transcripción
- ✅ **Organización**: Sistema de carpetas
- ✅ **Búsqueda y filtros**: Por texto, fecha, duración
- ✅ **Exportación**: PDF, DOC, TXT
- ✅ **Chat IA**: "Ask Diktalo" para análisis conversacional
- ✅ **Edición inline**: Renombrado de grabaciones y speakers
- ✅ **Sistema de suscripciones**: Planes con Stripe
- ✅ **Gestión de perfil**: Avatar, configuración, límites de uso

### Estado
**COMPLETADO** - Dashboard completamente funcional con todas las features.

---

## 🚧 Fase 3: Captura de Sistema (Extensión Chrome - "Ghostwire") **[PLANNED]**

### Objetivo
Permitir la captura de audio de alta calidad directamente desde pestañas del navegador (Google Meet, Zoom Web, Teams, YouTube, cursos online) sin depender del micrófono ambiental.

### Arquitectura Propuesta

**Repositorio/Carpeta:** `/chrome-extension`

**Stack Técnico:**
- Manifest V3 (Chrome Extension)
- TypeScript + React (Popup UI)
- `chrome.tabCapture` API
- MediaRecorder API
- Background Service Worker

**Permisos Requeridos:**
- `tabCapture`
- `scripting`
- `activeTab`
- `storage`

### Flujo de Usuario
1. Usuario instala extensión de Chrome Web Store
2. Usuario abre reunión/video (Meet, Zoom, YouTube, etc.)
3. Clic en icono Diktalo en toolbar
4. Popup muestra: "Listo para grabar" + botón "Start Recording"
5. Al iniciar:
   - Captura audio de la pestaña (System Audio)
   - Opcional: Mezcla con micrófono (ambos lados)
   - Muestra timer en tiempo real
6. Al finalizar:
   - Procesa audio localmente (blob WebM/WAV)
   - Sube automáticamente a `/api/upload-audio`
   - Abre nueva pestaña: `diktalo.com/intelligence/recordings/{id}`

### Integración con Dashboard
- Endpoint nuevo: `/api/upload-audio` (recibe blobs de extensión)
- Autenticación: Compartir cookies/token o sistema "Link Device"
- Processing: Mismo pipeline que grabaciones manuales
- Visualización: Aparece en Dashboard Intelligence automáticamente

### Componentes a Desarrollar
- [ ] `manifest.json` (Manifest V3)
- [ ] `popup.html/tsx` (UI de control)
- [ ] `background.ts` (Service Worker con captura)
- [ ] `content-script.ts` (opcional, para detectar reuniones)
- [ ] Lógica de MediaRecorder
- [ ] Cliente de upload a API Diktalo
- [ ] Sistema de autenticación/linking

### Estado
**PLANNED** - Especificación completa disponible en `docs/specs/CHROME_EXTENSION_SPEC.md`

**Fecha estimada de inicio:** Por definir

---

## 🔮 Fase 4: Integraciones Nativas **[FUTURE]**

### Objetivo
Conectar Diktalo con herramientas de productividad y comunicación.

### Integraciones Planificadas
- [ ] Zapier (triggers: nueva grabación, transcripción completa)
- [ ] Google Calendar (auto-grabar reuniones programadas)
- [ ] Slack (compartir transcripciones)
- [ ] Notion (exportar notas estructuradas)
- [ ] CRM (Salesforce, HubSpot) - logging de llamadas

### Estado
**FUTURE** - Pendiente de priorización

---

## 🔮 Fase 5: Mobile Apps **[FUTURE]**

### Objetivo
Aplicaciones nativas para iOS y Android con capacidades offline.

### Features Planificadas
- [ ] Grabación móvil nativa
- [ ] Sincronización automática
- [ ] Transcripción offline (on-device)
- [ ] Widget de acceso rápido
- [ ] Integración con asistentes de voz

### Estado
**FUTURE** - Investigación de frameworks (React Native vs Flutter)

---

## 📊 Métricas de Progreso

| Fase | Completado | Estado |
|------|------------|--------|
| Fase 1: Core | 100% | ✅ LIVE |
| Fase 2: Dashboard | 100% | ✅ LIVE |
| Fase 3: Chrome Extension | 0% | 📋 PLANNED |
| Fase 4: Integraciones | 0% | 🔮 FUTURE |
| Fase 5: Mobile Apps | 0% | 🔮 FUTURE |

---

## 🎯 Próximo Milestone

**Ghostwire Alpha (Fase 3)**
- Extensión funcional para Google Meet
- Upload automático a Diktalo
- Procesamiento en Intelligence Dashboard
- Fecha objetivo: Q1 2026

---

## 📝 Notas

- Este roadmap es un documento vivo y se actualiza con cada fase completada
- Las fases futuras pueden cambiar de prioridad según feedback de usuarios
- Cada fase tiene su especificación técnica detallada en `docs/specs/`
