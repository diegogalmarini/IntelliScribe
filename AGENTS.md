# AGENTS.md — Contrato compartido para todos los agentes de Diktalo

> Este archivo es el primero que debe leer cualquier agente (Claude, Gemini, otro) antes de actuar en este proyecto. Define las reglas invariables, las fuentes de verdad y las prohibiciones absolutas.

---

## El proyecto

**Diktalo** es una plataforma SaaS de inteligencia conversacional. Captura audio (web, extensión Chrome MV3, Twilio), transcribe con Gemini, genera resúmenes y permite chat contextual sobre las grabaciones. El producto tiene monetización propia vía Lemon Squeezy y automatización editorial vía GitHub Actions + Make.com.

**Usuarios objetivo:**
- Profesionales que graban reuniones (Meet, Zoom, Teams) o llamadas telefónicas
- Necesitan transcripción, resumen y acceso conversacional a sus grabaciones

---

## Stack — no negociable

| Capa | Tecnología | Nota crítica |
|---|---|---|
| Frontend | React 18 + TypeScript + Vite + Tailwind + Framer Motion | Estado minimalista (hooks + contextos, sin Redux) |
| Routing | React Router v6 | Centralizado en `App.tsx` |
| Backend | Vercel Serverless Functions (`/api/`) | Sin servidor propio — cada endpoint es una función independiente |
| Base de datos | Supabase PostgreSQL + RLS | RLS es crítico — nunca desactivar ni bypassear sin RPC `security definer` |
| Storage | Supabase Storage (buckets privados) | URLs firmadas de corta duración — nunca URLs públicas para audio |
| Auth | Supabase Auth | |
| IA | Google Gemini — ver sección prohibiciones | **Ver reglas de modelos abajo** |
| Telefonía | Twilio (Voice SDK + webhooks) | |
| Pagos | Lemon Squeezy (Merchant of Record) | **Jamás Stripe** — ver decisión en Memory |
| Email transaccional | Resend | Templates bilingües ES/EN en `supabase/functions/lemon-webhook/email-templates.ts` |
| Automatización | Zapier + Make.com | Webhooks desde GitHub Actions |
| Monitoreo | Sentry | **Ver Regla de Oro #1** |
| Extensión Chrome | Manifest V3 | Comparte sesión Supabase con el dashboard |

---

## Reglas de Oro — obligatorias antes de cualquier trabajo

### Regla #1 — Sentry primero

**Antes de comenzar cualquier ciclo de desarrollo, investigación o implementación:**
Revisar https://diktalo.sentry.io/issues/

Si hay errores activos en producción, esos tienen prioridad absoluta sobre cualquier feature nueva.

### Regla #2 — Skills antes de decisiones de IA o arquitectura

Nunca tomar decisiones sobre modelos Gemini, arquitectura de IA o integraciones sin leer primero los archivos en `.agent/skills/`. Los skills son la fuente de verdad técnica del proyecto.

Skills más críticos:
- `.agent/skills/optimizing-gemini-models/SKILL.md` — **La Biblia** de modelos Gemini
- `.agent/skills/systematic-debugging/SKILL.md` — proceso de debug obligatorio
- `.agent/skills/using-git-worktrees/SKILL.md` — trabajo en ramas aisladas

---

## Modelos Gemini — prohibiciones absolutas

| Familia | Estado |
|---|---|
| Gemini 1.0, 1.5 | ❌ PROHIBIDO — depreciados |
| Gemini 2.0 (incluyendo `gemini-2.0-flash`) | ❌ PROHIBIDO — depreciados |
| `text-embedding-004` | ❌ PROHIBIDO — reemplazado |
| Gemini 2.5 Flash/Pro/Flash-Lite | ✅ Estándar de producción actual |
| Gemini 3.1 (cuando disponible y estable) | ✅ Siguiente generación |
| `gemini-embedding-001` | ✅ Embedding obligatorio |

**Si encuentras código con modelos prohibidos, es un bug de alta prioridad. Corrígelo antes de continuar.**

Siempre verificar contra documentación oficial: https://ai.google.dev/gemini-api/docs/models

---

## RLS y base de datos — patrón obligatorio

- **Nunca** actualizar `profiles` o tablas con datos del usuario directamente desde el cliente.
- Si necesitas actualizar estadísticas de uso, usar las RPCs `security definer`:
  - `increment_user_usage(user_id, minutes)`
  - `increment_user_storage(user_id, bytes)`
- Cualquier operación que bypasee RLS debe ir en una RPC `security definer`, no en código cliente.
- Bug reference: 2026-02-24 — `minutes_used` y `storage_used` en 0 por actualización RLS bloqueada desde cliente.

---

## Estructura de carpetas — ownership

| Carpeta | Responsabilidad |
|---|---|
| `/api/` | Serverless functions Vercel — lógica de negocio backend, Gemini, Twilio |
| `/services/` | Business logic reutilizable — DB operations, audio, IA, pagos |
| `/pages/` | Rutas React principales |
| `/components/` | Componentes UI reutilizables |
| `/utils/` | Helpers, datos estáticos, traducciones |
| `/lib/` | Clientes singleton (Supabase) |
| `/docs/` | Documentación técnica y decisiones |
| `/supabase/` | Migraciones SQL + Edge Functions |
| `/chrome-extension/` | Extensión Chrome MV3 (build separado) |
| `.agent/skills/` | Skills de metodología — fuente de verdad para procesos |

---

## Fuentes de verdad — jerarquía si hay contradicción

1. Código real en `/api/`, `/services/`, `/pages/`
2. `.agent/skills/` — especialmente `optimizing-gemini-models`
3. `AGENTS.md` (este archivo)
4. `docs/ARCHITECTURE_OVERVIEW.md`
5. `docs/DEVELOPMENT_LOG.md` — histórico, puede estar desactualizado
6. `diario.md` — contexto de sesiones recientes
7. `README.md` — visión de producto, no implementación

---

## Workflow obligatorio para cambios no triviales

```
/brainstorming → /writing-plans → worktree → /test-driven-development → /verification-before-completion → /requesting-code-review → /finishing-a-development-branch
```

Excepciones permitidas:
- Documentación pura: se puede omitir brainstorming y TDD
- Hotfix de bug en producción: se puede omitir brainstorming, no verification

---

## Prohibiciones de producto

- **Jamás Stripe** como procesador de pagos principal — decisión firme, Lemon Squeezy es el MoR
- **Jamás URLs públicas** para archivos de audio — siempre URLs firmadas desde Supabase Storage
- **Jamás actualizar RLS directamente** desde cliente para estadísticas de usuario
- **Jamás modelos Gemini depreciados** — ver tabla arriba

---

## Documentos que deben estar actualizados

| Documento | Propósito | Frecuencia de actualización |
|---|---|---|
| `diario.md` | Bitácora viva — decisiones por sesión | Cada sesión de trabajo |
| `Memory.md` | Índice de memoria persistente | Cuando se aprende algo durable |
| `docs/DEVELOPMENT_LOG.md` | Historial por fases | Al cerrar fases o hitos grandes |
| `.agent/skills/` | Estándares técnicos | Cuando cambia un estándar (ej. nuevo modelo Gemini) |
