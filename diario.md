# Diario de Desarrollo — Diktalo

> Bitácora técnica viva del proyecto. Cada decisión, cada feature, cada bug resuelto.
> Actualizado: 19 agosto 2026
>
> ⚠️ **Advertencia:** Este documento es contexto vivo, no spec de implementación. Validar siempre contra:
> 1. El código real en `/api/`, `/services/`, `/pages/`
> 2. `.agent/skills/` para estándares de IA y proceso
> 3. `AGENTS.md` para reglas invariables del proyecto
>
> 📌 **Estado actual resumido (2026-08-19):**
> Último hito documentado: 19 agosto 2026 (auditoría completa + saneamiento de seguridad en curso).
> En curso: ver entrada más reciente.
> Brújula de metodología: `AGENTS.md` + `CLAUDE.md`. Historial por fases: `docs/DEVELOPMENT_LOG.md`.

---

## Registro 2026-08-19 — Auditoría completa y saneamiento de seguridad

**Qué se hizo:**

Auditoría del proyecto y ejecución de la mayor parte del plan de saneamiento en
la rama `hardening/security-audit-2026-08`.

Hallazgo que reordenó todo lo demás: **el repositorio de GitHub es público** y la
API key de Resend commiteada en `docs/resend-setup.md:8` es byte a byte la misma
que está en uso. La rotación pasa a ser el paso cero, antes que cualquier código:
el canal de fuga es una historia de git pública, no un endpoint.

Endpoints que estaban abiertos y ya exigen identidad:
- `/api/send-email` era un relay abierto: aceptaba destinatario y HTML
  arbitrarios y enviaba firmado como diktalo.com. El formulario público sale a
  `/api/contact`, con destino fijo y HTML compuesto y escapado en servidor.
- `/api/ai` no tenía autenticación, con CORS abierto y 300 s de cómputo. Además
  filtraba datos entre cuentas: el `chat` pasaba a `match_recording_chunks` unos
  `recordingIds` del cliente usando service role, así que la RLS no aplicaba.
- `/api/twilio-token` emitía tokens de voz confiando en un `userId` del body.
- `/api/admin-stats`, `/api/verify` y `/api/zapier-sync`, en la misma línea.
- La Edge Function `delete-old-recordings` borraba grabaciones sin autorización.
- `utils/twilioSecurity.ts` se saltaba la validación de firma si el header
  `Host` contenía "localhost", y ese header lo pone quien llama.

Fallos funcionales encontrados por el camino, todos rotos desde su origen:
- `/api/voice` no importaba `twilio` ni `getTierForNumber`: lanzaba
  ReferenceError al cargar y **ninguna llamada saliente ha funcionado nunca**.
  Va acoplado al cierre de `/api/twilio-token`: arreglarlo antes habría
  convertido un bug en un canal de gasto facturable.
- El embedding de la consulta del chat se generaba sin `outputDimensionality`,
  de 3072 dimensiones contra una RPC que espera VECTOR(768). Fallaba siempre y
  el `catch` lo tragaba: **el RAG nunca ha funcionado en el camino de consulta**.
- `audio_url` tenía dos formatos incompatibles en la misma columna. Programar el
  cron de retención sin normalizarlo habría borrado la referencia de las
  grabaciones telefónicas dejando los ficheros ocupando espacio.
- La traducción automática del contenido de BD leía `VITE_GEMINI_API_KEY`, que
  no existe: lleva fallando en silencio desde abril.
- `lemonsqueezy-webhook` llama a `increment_extra_minutes` con los nombres de
  parámetro equivocados, así que la RPC atómica de compra de packs no se usa
  nunca y cae al fallback con condición de carrera. **Pendiente.**

Deuda cerrada: sourcemaps de producción (se publicaban 24 ficheros con el fuente
completo), 41 vulnerabilidades de npm reducidas a 11, gate de typecheck de
backend a 0 errores y dentro de `build`, ámbito completo de 194 a 75 errores,
restos de Stripe, 34 scripts de un solo uso en la raíz, y 27 documentos internos
que se servían públicamente en diktalo.com —incluidos el esquema de la BD, el
email del super admin con el SQL para crear administradores y correos de
usuarios reales—.

**Por qué:**

El patrón de fondo es el mismo en casi todos los hallazgos: el servidor confiaba
en un `userId` que mandaba el cliente y operaba con la service role key, que
bypasea RLS. La RLS estaba bien pensada y mal aplicada. La utilidad
`api/_utils/auth.ts` existe para que esa decisión se tome en un solo sitio.

**Pendiente / siguiente:**

- **Rotar la clave de Resend.** Sigue viva y publicada.
- Ejecutar `scripts/db-inventory.sql` en el SQL Editor. Bloquea todas las
  migraciones. La consulta Q0 dice si la escalada a admin ya ha ocurrido.
- Migraciones de RLS: bloqueo de columnas privilegiadas de `profiles` (hoy
  cualquier usuario puede hacer `UPDATE profiles SET role='super_admin'`),
  `search_path` en las funciones SECURITY DEFINER, `filter_user_id` en
  `match_recording_chunks`, y las RPC que el código llama y no existen en el
  repo (`reset_monthly_usage`, `decrement_voice_credits`, `is_admin`).
- Crons en `vercel.json`: no activar el de limpieza hasta migrar las filas
  históricas de `audio_url` y verificar con `?dryRun=1`.
- Rate limiting de los endpoints que siguen públicos.
- jspdf 3.0.4 tiene una CVE crítica y exige subir de major.
- Cinco artículos del blog afirman certificaciones (SOC 2, HIPAA, ISO 27001) y
  capacidades técnicas (cifrado extremo a extremo, biometría vocal) que el
  producto no tiene. Decisión de producto pendiente.

---

## Historial — resumen de fases anteriores

> El historial completo por fases está en `docs/DEVELOPMENT_LOG.md`. Este diario recoge solo lo relevante para el trabajo actual.

### Decisiones clave tomadas (no reversibles sin deliberación)

| Decisión | Fecha | Razón |
|---|---|---|
| Lemon Squeezy sobre Stripe | Feb 2026 | MoR — elimina gestión de IVA/VAT internacional |
| Gemini 3.1 como estándar primario de producción | Mar 2026 | Promovido desde preview; 2.5 queda como fallback |
| `gemini-embedding-001` como embedding obligatorio | Feb 2026 | Reemplaza `text-embedding-004` depreciado |
| RAG pipeline con pgvector (`recording_chunks`) | Mar 2026 | Chat sobre transcripts largos sin exceder contexto |
| RPC `security definer` para estadísticas de usuario | Feb 2026 | RLS bloqueaba updates desde cliente |
| URLs firmadas de corta duración para audio | Desde inicio | Seguridad — nunca URLs públicas |
| Sentry + Skills como protocolo obligatorio | Feb 2026 | Institucionalizado como regla de oro |

### Bugs críticos resueltos (no repetir)

| Bug | Causa real | Fix |
|---|---|---|
| `minutes_used` y `storage_used` en 0 en admin | RLS bloqueaba `update` desde cliente | RPCs `increment_user_usage` / `increment_user_storage` con `security definer` |
| Error `MPEGMode` en Safari/iOS | Referencia rota en `audioConcat.ts` | Polyfill defensivo para `lamejs` |
| Acciones de carpetas no persistían en desktop | Prop drilling roto entre `App.tsx` e `IntelligenceDashboard` | Refactorización con `FolderModal.tsx` |
| Transcripción no aparecía tras upload sin refresh | `transcribeAudio()` devuelve `{segments, suggestedSpeakers}` pero el upload lo trataba como array (`.length` en objeto = `undefined`) — condition siempre `false`. `handleGenerateTranscript` actualizaba `recordings` pero `activeRecording` apuntaba a `tempRecording`. | Destructuring correcto + `setTempRecording` en ambos paths. |

---

## Registro 2026-05-04 — Fix transcripción no visible sin refresh

**Qué se hizo:**
- Fix en `IntelligenceDashboard.tsx:262`: el upload flow asignaba el return de `transcribeAudio()` (un objeto) a `segments` y lo comprobaba con `.length` — siempre `false`. Corregido con destructuring `{ segments: rawSegments }`.
- Fix en `handleGenerateTranscript`: añadido `setTempRecording()` para sincronizar la vista activa, que apuntaba a `tempRecording` aunque `onUpdateRecording` actualizara el array `recordings`.
- Ambos paths ahora también persisten `status: 'Completed'`.

**Por qué:**
El bug estaba desde la introducción de `transcribeAudio()` con la firma `Promise<{segments, suggestedSpeakers}>`. El upload flow nunca se actualizó para destructurar. `handleGenerateTranscript` actualizaba el estado global pero no el local (`tempRecording`), dejando la vista obsoleta hasta refresh manual.

**Pendiente / siguiente:**
- Verificar en producción que audios subidos transcriben y aparecen sin refresh.

---

## Registro 2026-03-10 — Migración a Gemini 3.1 como estándar primario

**Qué se hizo:**
- Actualización de `api/ai.ts`: `gemini-3.1-pro-preview`, `gemini-3.1-flash-preview` y `gemini-3.1-flash-lite-preview` promovidos a modelos primarios.
- `gemini-2.5-pro` y `gemini-2.5-flash` pasan a ser fallback en la cadena de reintentos.
- Actualización del skill `optimizing-gemini-models/SKILL.md` para reflejar Gemini 3.1 como estándar de producción actual.
- Mapa de acción → modelo: summary → `flash-lite`, chat → `pro-preview`, transcription → `flash-preview`, support → `flash-lite`.

**Por qué:**
Gemini 3.1 estabilizó sus preview APIs. El skill ya lo tenía documentado como "próxima generación válida" desde febrero — este commit ejecuta la migración real. Los modelos 2.5 permanecen como fallback hasta confirmar estabilidad en producción de 3.1.

**Pendiente / siguiente:**
- Monitorear Sentry por errores 500 de modelos preview en producción.
- Eliminar fallback 2.5 una vez confirmada estabilidad de 3.1 preview.

---

## Registro 2026-03-20 — RAG pipeline completo (chunking + embeddings + búsqueda semántica)

**Qué se hizo:**
- Nueva acción `sync-rag` en `api/ai.ts`: chunka transcripts (~1000 chars via `_utils/chunker`), genera embeddings con `gemini-embedding-001` (768 dimensiones), y persiste chunks en tabla `recording_chunks` (campos: `recording_id`, `user_id`, `chunk_index`, `content`, `embedding`).
- Chat con RAG: cuando se reciben `recordingIds`, el chat genera embedding de la query y llama a RPC `match_recording_chunks` (threshold 0.3, top 15 chunks). Fallback al transcript completo si RAG no devuelve resultados.
- Límite de contexto: 700k chars con truncado defensivo y log de aviso.
- Fallback de embedding a `embedding-001` legacy si `gemini-embedding-001` falla.

**Por qué:**
El chat sobre múltiples grabaciones largas excedía el contexto de Gemini con transcripts completos. RAG resuelve esto recuperando solo los chunks semánticamente relevantes a la query. `pgvector` ya estaba disponible en Supabase — solo faltaba la capa de aplicación.

**Pendiente / siguiente:**
- Verificar que la migración SQL de `recording_chunks` con índice vectorial está aplicada en producción.
- Probar con grabaciones largas (>1h) para validar calidad de recuperación.

---

## Registro 2026-04-05 — Servicio de auto-traducción IA para contenido dinámico

**Qué se hizo:**
- Creación de `services/aiTranslationService.ts`: traduce contenido dinámico de BD (descripción y features de planes, configuraciones de texto, legal footer) usando `gemini-3.1-flash-lite-preview`.
- Funciones exportadas: `translateWithGemini`, `translateArray`, `autoTranslatePlan`, `autoTranslateSetting`, `translateAllPlans`.
- Las traducciones se ejecutan en paralelo (`Promise.all`) para minimizar latencia.
- Fallback: si Gemini falla, devuelve el texto original sin lanzar error.

**Por qué:**
Los planes de Lemon Squeezy y configuraciones del admin se gestionan en ES desde el panel. Sin traducción automática, la UI en EN mostraba texto en español para contenido dinámico (lo que no está hardcodeado en `translations.ts`). Este servicio completa la internacionalización para el contenido que viene de BD.

**Pendiente / siguiente:**
- Considerar caché de traducciones para evitar llamadas repetidas a Gemini por el mismo texto.

---

## Registro 2026-04-15 — Rediseño de sección Features en landing

**Qué se hizo:**
- Refactorización de `components/Landing/Features.tsx`: de lista estática a tab UI animada con 4 pasos (Captura Omnicanal → IA → Análisis → Chat).
- Barra de progreso animada por tab activo (Framer Motion, 6s autoplay).
- Layout split: texto descriptivo a la izquierda (1/3), imagen del feature a la derecha (2/3).
- Responsive: stack vertical en móvil, horizontal en desktop.
- Fallback de imagen: si no carga, muestra el número del step en grande.
- Todas las strings van via `t()` de `LanguageContext`.

**Por qué:**
La sección Features anterior era estática y no comunicaba el flujo de trabajo del producto. El nuevo diseño de tabs con autoplay guía al usuario por los 4 pasos clave y es visualmente más moderno para conversión en landing.

**Pendiente / siguiente:**
- Preparar las imágenes `/images/feature-step1-capture.png` etc. si no existen.
- Verificar keys de traducción en `utils/translations.ts` para todos los textos del componente.

---

## Registro 2026-04-28 — Skill creator añadido al sistema de agentes

**Qué se hizo:**
- Incorporación de `.agent/skills/skill-creator/` al repo: skill completo con agentes, assets, eval-viewer, referencias y scripts para crear y evaluar nuevos skills.
- Actualización de `optimizing-gemini-models/SKILL.md` para reflejar `gemini-3.1-flash-image-preview` como modelo de generación de imágenes (Nano Banana Pro).

**Por qué:**
El workflow de creación de skills era manual. El skill-creator formaliza el proceso de diseñar, probar y publicar nuevas capacidades de agente de forma sistemática.

**Pendiente / siguiente:**
- Evaluar si skill-creator necesita docs adicionales en `memory/` sobre cómo usarlo.

---

## Registro 2026-05-04 — Setup de metodología multi-agente

**Qué se hizo:**
- Creación de `AGENTS.md` — contrato base para todos los agentes (Claude, Gemini, futuros)
- Creación de `CLAUDE.md` — instrucciones específicas para Claude con workflow Superpowers adaptado
- Creación de `diario.md` — este archivo, bitácora viva desde ahora
- Creación de `Memory.md` + carpeta `memory/` — sistema de memoria persistente entre sesiones

**Por qué:**
El proyecto tenía skills bien documentados (`.agent/skills/`) pero sin capa de coordinación entre agentes ni bitácora viva sesión a sesión. Cada sesión empezaba de cero. Estos archivos dan contexto inmediato a cualquier agente sin necesidad de re-leer todo el código.

**Pendiente / siguiente:**
- Gap documentado en esta sesión (ver entradas retroactivas mar–abr 2026).
- Definir foco de ejecución actual: qué se está construyendo ahora mismo y en qué orden.

---

## Registro 2026-05-12 — Instalación de skill find-skills (ecosistema open agent skills)

**Qué se hizo:**
- Instalado `find-skills` vía `npx skills add https://github.com/vercel-labs/skills --skill find-skills`.
- El skill queda en `.agents/skills/find-skills/SKILL.md` con symlink a Claude Code.
- Generado `skills-lock.json` en raíz (lockfile del ecosistema, similar a `package-lock.json`).

**Por qué:**
`find-skills` actúa como un "package manager discovery tool" para el ecosistema de agent skills (skills.sh). Permite buscar e instalar skills de terceros directamente desde el agente, sin tener que conocer la URL de cada repo. Flujo: usuario describe lo que necesita → agente corre `npx skills find [query]` → evalúa reputación (installs, fuente, stars) → instala con `npx skills add`. Útil para extender capacidades del agente sin tener que crear todo desde cero.

**Cómo usar esta skill:**
- Cuando el usuario pregunte "¿hay un skill para X?" o "¿cómo hago X?", invocar `/find-skills` o correr `npx skills find [query]`.
- Verificar siempre: installs > 1K, fuente oficial (`vercel-labs`, `anthropics`), stars en GitHub.
- Instalar con: `npx skills add <owner/repo@skill> -g -y` (flag `-y` para no-interactivo).

**Pendiente / siguiente:**
- Ninguno. Skill activo y disponible.

---

*Próximas entradas deben seguir el formato:*
```
## Registro YYYY-MM-DD — [título breve]

**Qué se hizo:** ...
**Por qué:** ...
**Pendiente / siguiente:** ...
```
