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
*   **Contexto:** Múltiples grabaciones dentro de un Proyecto (Folder).
*   **Query:** "Analiza las 5 entrevistas de la carpeta 'Candidatos Ventas' y compáralos".
*   **Estado:** 🚧 Pendiente / Por Validar.

### Nivel 3: Macro (Chat con la Cuenta)
*   **Contexto:** Toda la base de conocimientos del usuario.
*   **Query:** "¿Cuándo fue la última vez que hablé de 'precios' con algún cliente en los últimos 6 meses?".
*   **Estado:** 🚧 Pendiente / Por Validar.
