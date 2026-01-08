# Diktalo: Voice Intelligence for Professionals

## 🎯 Identidad (The Pivot)
**NO somos:** Un SaaS de transcripción commodity.
**SÍ somos:** Inteligencia de Voz para Profesionales.

**Propuesta de Valor:**
"Grabamos tus llamadas y reuniones (Chrome/Dialer), y nuestra IA conecta los puntos entre todas ellas para que no tengas que volver a escuchar un audio de 1 hora."

---

## 🏗️ Arquitectura de Entrada (Las 5 Fuentes de Verdad)
Todas las fuentes son ciudadanos de primera clase.

1.  **Grabadora Web:** Captura rápida para notas de voz.
2.  **Upload de Archivo Único:** Procesamiento de audio externo.
3.  **Upload Multi-Archivo (Modo Conversación):** Análisis conjunto de múltiples audios de una misma sesión.
4.  **Extensión de Chrome:** Grabación pasiva de Google Meet/Zoom/Teams.
5.  **Dialer (Telefonía):** Grabación de llamadas reales (Twilio) con verificación de identidad.

---

## 🧠 Arquitectura de Inteligencia (Los 3 Niveles de "Ask")
El sistema de chat (RAG - Retrieval Augmented Generation) escala en 3 niveles:

### Nivel 1: Micro (Chat con el Audio)
*   **Contexto:** Una sola grabación.
*   **Query:** "Dime qué acordamos en esta reunión específica".
*   **Estado:** ✅ Implementado (`RecordingDetailView`).

### Nivel 2: Meso (Chat con el Proyecto/Carpeta)
*   **Contexto:** Múltiples grabaciones (10-20) dentro de un Proyecto (Folder).
*   **Query:** "Analiza las 5 entrevistas de la carpeta 'Candidatos Ventas' y compáralos".
*   **Estado:** ✅ Implementado (Context Stuffing).
    *   *Nota Técnica:* Actualmente envía todo el texto de la carpeta a Gemini 1.5 Pro. Funciona perfecto para < 50 grabaciones gracias a la ventana de contexto de 1M tokens.

### Nivel 3: Macro (Chat con la Cuenta)
*   **Contexto:** Toda la base de conocimientos del usuario.
*   **Query:** "¿Cuándo fue la última vez que hablé de 'precios' con algún cliente en los últimos 6 meses?".
*   **Estado:** ⚠️ Implementado Parcialmente (Brute Force).
    *   *Limitación:* Usa la misma lógica que Nivel 2. Si el usuario tiene 1000 grabaciones, fallará por límites de red.
    *   *Roadmap:* Migrar a **RAG (Vector Search)** con `pgvector` en Supabase para escalar.
