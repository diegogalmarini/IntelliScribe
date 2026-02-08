# 🏗️ Arquitectura Técnica Deep-Dive

Este documento detalla la infraestructura y el flujo de datos que hace que Diktalo funcione.

---

## 1. Frontend: React + Vite + Tailwind
- **Estado Global:** Minimalista. Se utiliza el hooks personalizados y contextos para evitar el "prop drilling".
- **Animaciones:** `framer-motion` se utiliza para coordinar modales, listas y el comportamiento del chat.
- **Rutas:** Centralizadas en `App.tsx` para permitir una transición fluida entre vistas sin recargas de página.

## 2. Backend: Vercel Functions (/api)
- El "backend" es serverless. Cada endpoint en `/api` es una función independiente.
- **AI Core (`/api/ai/chat.ts`, etc.):** Se comunica con Google Gemini.
- **Twilio (`/api/twilio/*`):** Maneja la señalización y el streaming de audio para llamadas telefónicas.

## 3. Base de Datos y Almacenamiento: Supabase
- **Base de Datos:** PostgreSQL con extensiones de búsqueda vectorial (pgvector) planeadas para el futuro.
- **Storage:** Los audios se guardan en buckets privados. El acceso se hace mediante URLs firmadas de corta duración para máxima seguridad.
- **Seguridad (RLS):** Crucial. Cada tabla tiene políticas que aseguran que el `auth.uid()` coincida con el propietario del registro.

## 4. Pipeline de Inteligencia Artificial
1.  **Ingesta:** Audio capturado vía Web, Extensión o Teléfono.
2.  **Procesamiento:** El audio se sube a Supabase Storage.
3.  **Inferencia:** 
    - Se extrae la transcripción.
    - Gemini analiza el texto para generar el resumen, tareas y etiquetas.
4.  **Consumo:** El usuario interacciona con los datos mediante el Chat Contextual (RAG local).

- La extensión utiliza **Manifest V3**.
- Se comunica con el dashboard mediante mensajes nativos y comparte la sesión de Supabase si el usuario está logueado en la web, permitiendo sincronización instantánea.
## 6. Monitoreo y Estabilidad (Sentry & Skills)
Diktalo utiliza **Sentry** para el rastreo de errores en tiempo real tanto en frontend como en backend.

> [!IMPORTANT]
> **Regla de Oro para el Partner Tecnológico:** 
> 1. **REVISIÓN DE SENTRY**: Siempre, antes de comenzar cualquier ciclo de desarrollo o investigación, es **OBLIGATORIO** revisar el panel en [Sentry Issues](https://diktalo.sentry.io/issues/).
> 2. **REVISIÓN DE SKILLS**: Nunca tomes decisiones sobre modelos de IA o arquitectura sin consultar primero los archivos en `.agent/skills/`. Los Skills (especialmente `optimizing-gemini-models`) son la verdad absoluta del proyecto.
