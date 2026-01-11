# Protocolo de Mantenimiento: Extensión de Chrome Diktalo

Este documento centraliza el historial de cambios, parches críticos aplicados y la guía de solución de problemas para la Extensión de Chrome. **Consúltalo OBLIGATORIAMENTE antes de subir cualquier nueva versión.**

---

## 🚨 Checklist de Publicación (IMPORTANTE)

Antes de generar un `.zip` para subir a la Chrome Web Store:

1.  **Versiones Sincronizadas**:
    *   [ ] `chrome-extension/manifest.json` -> `"version": "X.X.X"`
    *   [ ] `chrome-extension/package.json` -> `"version": "X.X.X"`
    *   *Si modificas código, SUBE la versión (ej: 1.0.0 -> 1.0.1).*

2.  **Inyección de Credenciales (Build)**:
    *   La extensión **NO** lee `.env.local` en tiempo de ejecución.
    *   Debes ejecutar el script de inyección antes/durante el build.
    *   Comando seguro: `npm run build` (asegúrate de que ejecute `scripts/inject_secrets.js` o que los secrets estén hardcodeados si falló la inyección).

3.  **Generación de ZIP**:
    *   Carpeta a comprimir: `chrome-extension/dist` (contenido interno, no la carpeta `dist` en sí).
    *   Archivo resultante: `diktalo-extension-vX.X.X.zip`

---

## 🛡️ Parches Críticos Aplicados (v1.0.1)

Se han implementado **mecanismos de seguridad** que no deben ser eliminados.

### 1. Backup de Seguridad Local (Anti-Pérdida de Datos)
*   **Problema**: Si fallaba la subida a Supabase/API (error 400, 401, internet caído), la grabación se perdía al limpiarse el estado.
*   **Solución**: `background.ts` captura el error de subida pero **retorna el blob de audio** (`backupAudioData`) al `content.tsx`.
*   **Comportamiento**: Si falla la subida, la extensión **descarga automáticamente** el archivo `.webm` al PC del usuario.
*   **Mensaje**: "Error al subir. SE HA GUARDADO EN TU PC."

### 2. Auto-Inyección de Secretos
*   **Problema**: La extensión instalada manualmente fallaba por falta de `VITE_SUPABASE_URL` y `KEY`.
*   **Solución**: Script `scripts/inject_secrets.js` que lee `.env.local` y reemplaza placeholders `%%SUPABASE_URL%%` en `background.ts`.
*   **Nota**: Esto permite que el build local funcione idéntico a producción.

### 3. Autenticación Resiliente
*   **Problema**: Error `Refresh Token Not Found`.
*   **Solución**:
    *   Mensajes de error sanitizados ("Tu sesión ha expirado...").
    *   Lógica de reintento en `authenticatedFetch` (1 reintento tras 401).

---

## 🔧 Guía de Solución de Problemas

### Error: "Invalid Refresh Token" / "Session Expired"
*   **Causa**: El token guardado en `chrome.storage.local` ha caducado y Supabase ya no lo acepta.
*   **Solución**: El usuario debe abrir el popup, ir a "Token" y pegar uno nuevo desde dashboard.
*   **Código a revisar**: `background.ts` -> `getOrRefreshAccessToken()`.

### Error: "Supabase URL missing"
*   **Causa**: El build se hizo sin las variables de entorno inyectadas.
*   **Solución**: Ejecutar `node scripts/inject_secrets.js` y luego `npm run build`. Verificar que `background.ts` no tenga `%%SUPABASE_URL%%`.

### Error: "Upload failed" pero no se descarga el archivo
*   **Causa**: Fallo en la lógica de retorno de `backupAudioData`.
*   **Código a revisar**:
    1.  `background.ts` -> `stopRecording`: Asegurar que el `catch` devuelve `{ success: false, backupAudioData: ... }`.
    2.  `content.tsx` -> `handleStopRecording`: Asegurar que verifica `response.backupAudioData` antes de mostrar solo error.

---

## 📜 Historial de Versiones

### v1.0.3 (Release Candidate - Actual)
*   **Fecha**: 11/01/2026
*   **Cambios**:
    *   Fix/UX: **Parsado Inteligente de Tokens**. Ahora detecta si el usuario pega un JSON (`{"access_token":...}`) y extrae el token automáticamente.
    *   Rationale: El dashboard da un JSON y el usuario lo pegaba tal cual, rompiendo la auth.

### v1.0.2 (Deprecated)
*   **Fecha**: 11/01/2026
*   **Cambios**:
    *   Fix/UX: Mejora en `content.tsx` para mostrar el error real.

### v1.0.1 (Deprecated)
*   **Fecha**: 11/01/2026
*   **Cambios**:
    *   Fix: Inyección de `VITE_SUPABASE_URL` y `ANON_KEY` desde `.env.local`.
    *   Feat: **Backup Safety**. Descarga automática si falla la subida.
    *   Fix: Mensajes de error de autenticación amigables.
    *   Chore: Bump de versión en manifest/package.

### v1.0.0 (Deprecated / Buggy)
*   **Estado**: En revisión (Google), pero contiene bugs críticos de configuración.
*   **Acción**: Debe ser reemplazada inmediatamente por v1.0.1 en el dashboard.
