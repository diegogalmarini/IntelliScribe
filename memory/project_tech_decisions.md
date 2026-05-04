---
name: Decisiones técnicas de producto no reversibles
description: Decisiones de stack, monetización y arquitectura ya tomadas — no reabrir sin deliberación explícita con el usuario
type: project
---

## Lemon Squeezy como Merchant of Record (no Stripe)

**Decisión:** Todos los pagos pasan por Lemon Squeezy.

**Why:** Lemon Squeezy actúa como MoR — gestiona IVA, VAT y facturación internacional automáticamente. Stripe requeriría que Diktalo gestione impuestos por país, lo que es inviable para un equipo pequeño con clientes globales.

**How to apply:** Si aparece código con Stripe o se propone integrar Stripe, rechazarlo. La lógica de pagos vive en `services/paymentService.ts` y los webhooks en `supabase/functions/lemon-webhook/`.

---

## Gemini 2.5 como estándar de producción / 3.1 como siguiente generación

**Decisión:** Solo Gemini 2.5 (Flash, Pro, Flash-Lite) y Gemini 3.1 son válidos. Las familias 1.0, 1.5 y 2.0 están prohibidas.

**Why:** Los modelos 2.0 eran experimentales y Google los deprecó. Un agente anterior migró accidentalmente a 1.5 (legacy) — se detectó y revirtió. La skill `optimizing-gemini-models` es la fuente de verdad y debe consultarse siempre.

**How to apply:** Antes de cualquier uso de Gemini, leer `.agent/skills/optimizing-gemini-models/SKILL.md`. Si se encuentra un modelo prohibido en el código, es un bug de alta prioridad.

---

## URLs firmadas para audio (nunca públicas)

**Decisión:** Todo acceso a archivos de audio en Supabase Storage usa URLs firmadas de corta duración.

**Why:** Los audios contienen información confidencial de reuniones y llamadas. URLs públicas permanentes son un riesgo de seguridad inaceptable para el producto.

**How to apply:** Si se genera una URL de storage, siempre usar el método de URL firmada con expiración corta. Nunca `.getPublicUrl()` para buckets de audio.

---

## RPCs `security definer` para estadísticas de usuario

**Decisión:** Las columnas `minutes_used` y `storage_used` en `profiles` solo se actualizan via RPC, nunca desde el cliente.

**Why:** RLS bloquea silenciosamente los updates desde el cliente — el valor quedaba en 0 sin error visible. Fix: RPCs `increment_user_usage` e `increment_user_storage` con `security definer` en migración `20260224_usage_rpcs.sql`.

**How to apply:** Si necesitas actualizar estadísticas de uso, llamar a las RPCs. Nunca `supabase.from('profiles').update({ minutes_used: ... })` desde el cliente.

---

## RAG pipeline con pgvector — implementado (marzo 2026)

**Decisión:** Búsqueda semántica operativa via tabla `recording_chunks` + RPC `match_recording_chunks`.

**Why:** El chat sobre múltiples grabaciones largas excedía el contexto de Gemini. RAG recupera solo los chunks relevantes a cada query (threshold 0.3, top 15). La acción `sync-rag` en `api/ai.ts` chunka (~1000 chars), genera embeddings con `gemini-embedding-001` (768 dims), y persiste en `recording_chunks`.

**How to apply:** Al añadir features de chat o búsqueda, usar `sync-rag` para indexar y `match_recording_chunks` para recuperar. No pasar transcripts completos si hay `recordingIds` disponibles.
