# Diktalo - Intelligence for your Conversations 🧠🎙️

> **Turn meetings into actionable intelligence.** Captura, Transcribe, Analiza y Chatea con tus audios.

![Diktalo Dashboard](https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6)

Diktalo no es solo una grabadora. Es un **Sistema Operativo de Inteligencia Conversacional** completo que unifica tus reuniones (Google Meet, Zoom, Teams), llamadas telefónicas y archivos de audio en un solo cerebro digital.

---

## 🚀 Features Principales

### 1. Captura Omnicanal
*   **Web Recorder:** Grabación de voz directa en el navegador de alta fidelidad.
*   **Chrome Extension (MV3):** Captura audio de pestañas (Meet, Teams, Zoom) sin necesidad de bots intrusivos en la reunión.
*   **Twilio Integration:** Graba llamadas telefónicas reales y procésalas automáticamente.
*   **Multi-Audio Upload:** Sube 10+ archivos a la vez; Diktalo los procesa en paralelo.

### 2. Motor de Inteligencia (AI Core)
*   **Transcripción Precisa:** Motor Whisper-class para texto verbatim.
*   **Resúmenes Temáticos:** Detecta automáticamente los tópicos clave, decisiones y tareas.
*   **Smart Chat (3 Niveles):**
    *   *Chat Global:* "Busca en todas mis reuniones cuándo hablamos de presupuesto".
    *   *Chat de Carpeta:* "Resume los avances del Proyecto X en estas 5 grabaciones".
    *   *Chat de Audio:* Interroga a una reunión específica.

### 3. Organización & Seguridad
*   **Carpetas Inteligentes:** Organiza por cliente, proyecto o equipo.
*   **Row Level Security (RLS):** Tus datos están aislados a nivel de base de datos (Supabase).
*   **Exportación:** PDF, DOCX con formato profesional.

---

## 🏗️ Arquitectura Técnica

El sistema utiliza una arquitectura moderna y serverless:

```mermaid
graph TD
    User[Usuario] --> Web[Web Dashboard (React/Vite)]
    User --> Ext[Chrome Ext (MV3)]
    User --> Phone[Teléfono (Twilio)]
    
    Web --> API[Vercel Serverless Functions (/api/*)]
    Ext --> API
    Phone --> Webhook[API Webhooks]
    
    API --> Gemini[Google Gemini 1.5 Pro]
    API --> Storage[Supabase Storage (Audio)]
    API --> DB[Supabase DB (PostgreSQL)]
    
    subgraph "AI Pipeline"
        Gemini --> Transcribe[Transcripción]
        Gemini --> Analyze[Análisis & Resumen]
        Gemini --> Chat[RAG / Chat Contextual]
    end
```

---

## 🛠️ Quick Start (Local)

1.  **Clonar y configurar entorno:**
    ```bash
    git clone https://github.com/diegogalmarini/IntelliScribe.git diktalo
    cd diktalo
    npm install
    ```

2.  **Variables de Entorno:**
    Crea un archivo `.env.local` con tus credenciales:
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_key
    GEMINI_API_KEY=your_gemini_key
    ```

3.  **Correr Web App:**
    ```bash
    npm run dev
    # Abre http://localhost:5173
    ```

4.  **Cargar Extensión:**
    *   Ve a `chrome://extensions/` -> Activa "Developer mode".
    *   "Load unpacked" -> Selecciona la carpeta `/chrome-extension`.

---

## 📂 Estructura del Proyecto

*   `/pages`: Rutas de la aplicación (Dashboard, Landing, Legal).
*   `/chrome-extension`: Código fuente de la extensión (Manifest V3, Background Service Worker).
*   `/api`: Backend Serverless (Vercel Functions) para AI, Twilio y Pagos.
*   `/services`: Capa de servicio para interactuar con Supabase, Storage y Gemini.
*   `/components`: UI Kit reutilizable (Tailwind + Framer Motion).

---

## 🔮 Roadmap: "Meeting Capture Pro"

Estamos trabajando en cerrar la brecha entre lo físico y lo virtual:

*   [ ] **Snapshot Capture (Extensión):** Toma capturas de pantalla de slides durante la reunión y adjúntalas a tus notas.
*   [ ] **Smart Import:** Si la extensión no pudo grabar (ej. App nativa de Teams), importa el archivo y procésalo igual.
*   [ ] **Speaker ID:** Identificación biométrica de oradores.

---

**© 2026 Diktalo Intelligence.**
