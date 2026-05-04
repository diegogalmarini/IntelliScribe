# CLAUDE.md — Instrucciones para Claude en el proyecto Diktalo

## Orden de lectura obligatorio al inicio de cualquier sesión

1. `Memory.md` — memoria persistente entre sesiones
2. `AGENTS.md` — contrato compartido, reglas invariables, prohibiciones
3. `diario.md` — estado actual y decisiones recientes
4. Si la tarea involucra IA o arquitectura: `.agent/skills/optimizing-gemini-models/SKILL.md`
5. Si la tarea involucra un módulo específico: leer el archivo relevante en `docs/`

No implementar nada sin haber leído al menos los primeros tres.

---

## Approach

- Leer archivos existentes antes de escribir código.
- Preferir editar sobre reescribir archivos completos.
- Ser conciso en output, exhaustivo en razonamiento.
- No añadir features, refactors o abstracciones más allá de lo pedido.
- No añadir comentarios que expliquen QUÉ hace el código — solo el POR QUÉ si no es obvio.
- Verificar siempre contra `.agent/skills/` antes de decidir algo de arquitectura o modelos IA.
- No asumir que un modelo Gemini es válido sin verificar `optimizing-gemini-models/SKILL.md`.

---

## Workflow Superpowers — obligatorio para tareas no triviales

| Situación | Skill obligatoria |
|---|---|
| Feature nueva / cambio de comportamiento | `brainstorming` → `writing-plans` |
| Implementar plan existente | `executing-plans` |
| Bug o comportamiento inesperado | `systematic-debugging` |
| Escribir cualquier código | `test-driven-development` |
| Antes de decir "listo" o hacer PR | `verification-before-completion` |
| Al terminar implementación | `requesting-code-review` |
| Al cerrar rama | `finishing-a-development-branch` |
| Trabajo aislado en feature | `using-git-worktrees` |
| 2+ tareas independientes | `dispatching-parallel-agents` |
| Cualquier decisión de modelos Gemini | `optimizing-gemini-models` |

**Regla:** invocar la skill ANTES de responder o actuar. Nunca leer el SKILL.md directamente — usar el Skill tool.

### Excepciones al workflow

- Cambios de documentación pura: se puede omitir brainstorming y TDD.
- Hotfix de bug en producción con Sentry activo: omitir brainstorming, nunca omitir verification.
- El usuario puede indicar explícitamente "sin workflow" para casos concretos.

---

## Reglas de código específicas para Diktalo

### Gemini
- Nunca usar modelos de familias 1.0, 1.5 o 2.0 — ver `AGENTS.md` para tabla completa.
- Siempre verificar disponibilidad en https://ai.google.dev/gemini-api/docs/models antes de usar un modelo nuevo.
- El archivo central de IA es `api/ai.ts` — cualquier cambio de modelo empieza aquí.

### Supabase / RLS
- Estadísticas de usuario (`minutes_used`, `storage_used`) solo se actualizan via RPC `security definer`.
- Storage: siempre URLs firmadas, nunca públicas.
- Antes de cualquier migración SQL, verificar que no rompe RLS existente.

### Extensión Chrome
- Manifest V3 — nunca downgrade a V2.
- Siempre sincronizar versión entre `chrome-extension/manifest.json` y `chrome-extension/package.json` antes de publicar.
- El script `inject_secrets.js` debe ejecutarse antes del build de extensión.

### Pagos
- Toda la lógica de pagos va por Lemon Squeezy — nunca introducir Stripe.
- Los webhooks de Lemon Squeezy viven en `supabase/functions/lemon-webhook/`.

### Internacionalización
- El producto es bilingüe ES/EN. Toda string visible al usuario debe existir en `utils/translations.ts`.
- La detección de idioma es automática via `profiles.language`.

---

## Sentry — obligación antes de cualquier trabajo

**URL:** https://diktalo.sentry.io/issues/

Si hay errores activos en producción:
1. Documentar el error en el diario antes de trabajar en otra cosa.
2. Priorizar el fix sobre cualquier feature nueva.

---

## Memoria y documentación

- Actualizar `diario.md` al final de cada sesión con lo que se hizo, por qué, y qué queda pendiente.
- Si se aprende algo durable (corrección de comportamiento, decisión de producto no obvia), guardar en `memory/` y actualizar `Memory.md`.
- No guardar en memoria: estructura de carpetas, convenciones de código, cosas derivables del código actual.

---

## Tono y output

- Respuestas cortas y directas. Sin openers sycophánticos ni resúmenes de cierre innecesarios.
- Al referenciar código, usar formato `archivo:línea` para navegación directa.
- No usar emojis salvo que el usuario lo pida.
- No crear archivos de documentación (`.md`) salvo que el usuario lo solicite explícitamente.
