-- scripts/db-inventory.sql
--
-- Inventario del estado REAL de la base de datos de producción.
--
-- Por qué existe: `supabase/migrations/` no es el esquema. Las tablas núcleo
-- (profiles, recordings, folders) y todas las policies de `profiles` viven en
-- `db/schema/master_migration_v1.sql`, fuera del pipeline de migraciones, y hay
-- tablas y RPC en uso en el código que no existen en ningún archivo del repo.
-- Sin este inventario no se puede escribir ninguna migración con seguridad.
--
-- Cómo usarlo: pegar bloque a bloque en el SQL Editor de Supabase
-- (proyecto qnvzofpdrfzchsegooic) y guardar cada resultado. Todo es de solo
-- lectura: no modifica nada.

-- ---------------------------------------------------------------------------
-- Q0 — ¿LA ESCALADA DE PRIVILEGIOS YA HA OCURRIDO?  (ejecutar esta primero)
-- ---------------------------------------------------------------------------
-- La policy de UPDATE sobre `profiles` no restringe columnas, así que cualquier
-- usuario autenticado ha podido asignarse rol de admin o cuota ilimitada.
-- Si esto devuelve filas inesperadas, hay incidente antes que refactor.
select id, email, role, plan_id, subscription_status,
       minutes_limit, minutes_used, extra_minutes, created_at
  from public.profiles
 where role is distinct from 'Member'
    or minutes_limit > 1000
    or coalesce(extra_minutes, 0) > 0
    or coalesce(voice_credits, 0) > 0
 order by created_at desc;


-- ---------------------------------------------------------------------------
-- Q1 — Policies RLS reales (public + storage)
-- ---------------------------------------------------------------------------
-- Clave para dos decisiones del plan:
--  a) ¿existe una policy de admin sobre `profiles`? De ello depende si el panel
--     de admin funciona hoy o lleva roto en silencio.
--  b) ¿tiene `app_settings` policy pública de SELECT? La landing la lee de forma
--     anónima; habilitar RLS sin esa policy rompe la página de precios.
select schemaname, tablename, policyname, roles, cmd, qual, with_check
  from pg_policies
 where schemaname in ('public', 'storage')
 order by schemaname, tablename, policyname;


-- ---------------------------------------------------------------------------
-- Q2 — RLS activo por tabla
-- ---------------------------------------------------------------------------
select c.relname               as tabla,
       c.relrowsecurity        as rls_activo,
       c.relforcerowsecurity   as rls_forzado
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
 where n.nspname = 'public'
   and c.relkind = 'r'
 order by 1;


-- ---------------------------------------------------------------------------
-- Q3 — Funciones: cuáles son SECURITY DEFINER y cuáles tienen search_path
-- ---------------------------------------------------------------------------
-- `prosecdef = true` y `config` sin search_path = vector de secuestro de
-- search_path. Afecta al menos a is_admin_user() y handle_new_user().
select p.oid::regprocedure           as firma,
       p.prosecdef                   as security_definer,
       p.proconfig                   as config,
       pg_get_userbyid(p.proowner)   as propietario
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
 where n.nspname = 'public'
 order by p.prosecdef desc, 1;


-- ---------------------------------------------------------------------------
-- Q4 — ¿Quién puede EJECUTAR cada RPC?
-- ---------------------------------------------------------------------------
-- increment_extra_minutes y get_onboarding_email_candidates son SECURITY
-- DEFINER sin comprobar el llamante: si aquí aparecen con grantee `anon` o
-- `authenticated`, son explotables desde el navegador.
select routine_name, grantee, privilege_type
  from information_schema.routine_privileges
 where routine_schema = 'public'
   and grantee in ('anon', 'authenticated', 'public', 'service_role')
 order by routine_name, grantee;


-- ---------------------------------------------------------------------------
-- Q5 — GRANTs de tabla y de columna sobre `profiles`
-- ---------------------------------------------------------------------------
-- Determina si el bloqueo por columna es viable o si hay que ir por trigger.
select table_name, grantee, privilege_type
  from information_schema.role_table_grants
 where table_schema = 'public'
   and grantee in ('anon', 'authenticated')
 order by 1, 2, 3;

select column_name, grantee, privilege_type
  from information_schema.column_privileges
 where table_schema = 'public'
   and table_name = 'profiles'
   and grantee in ('anon', 'authenticated')
 order by 1, 2;


-- ---------------------------------------------------------------------------
-- Q6 — Columnas reales de `profiles`
-- ---------------------------------------------------------------------------
-- Imprescindible antes de escribir el trigger: el código usa call_limit,
-- caller_id_verified, voice_credits y storage_limit, que no están en el
-- esquema versionado. Referenciar una columna inexistente en plpgsql falla en
-- CADA update de perfil, no al aplicar la migración.
-- Resuelve además la ambigüedad current_period_end vs renews_at, que decide
-- el WHERE del reset mensual.
select column_name, data_type, is_nullable, column_default
  from information_schema.columns
 where table_schema = 'public'
   and table_name = 'profiles'
 order by ordinal_position;


-- ---------------------------------------------------------------------------
-- Q7 — Tablas existentes
-- ---------------------------------------------------------------------------
-- Contrastar con las que el código usa sin migración:
-- newsletter_subscriptions, call_credit_packs, system_logs.
select table_name
  from information_schema.tables
 where table_schema = 'public'
 order by 1;


-- ---------------------------------------------------------------------------
-- Q8 — RPC que el código llama y podrían no existir
-- ---------------------------------------------------------------------------
-- is_admin() la invocan las policies de minute_packs: si falta, cualquier
-- SELECT sobre esa tabla lanza error y la página de planes se cae.
-- decrement_voice_credits: si falta, los créditos de voz nunca se descuentan.
select p.proname,
       p.oid::regprocedure as firma,
       p.prosecdef         as security_definer
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
 where n.nspname = 'public'
   and p.proname in (
       'reset_monthly_usage', 'decrement_voice_credits', 'decrement_storage',
       'match_recordings', 'match_recording_chunks', 'is_admin', 'is_admin_user',
       'increment_extra_minutes', 'increment_user_usage', 'increment_user_storage',
       'decrement_user_usage', 'decrement_user_storage',
       'get_onboarding_email_candidates', 'exec_sql'
   )
 order by 1;


-- ---------------------------------------------------------------------------
-- Q9 — Triggers no internos
-- ---------------------------------------------------------------------------
select tgname                        as trigger_name,
       tgrelid::regclass             as tabla,
       pg_get_triggerdef(oid)        as definicion
  from pg_trigger
 where not tgisinternal
 order by 2, 1;


-- ---------------------------------------------------------------------------
-- Q10 — Estado público de los buckets de Storage
-- ---------------------------------------------------------------------------
-- `recordings` DEBE ser public = false. Si es true, todo el audio está
-- expuesto: services/storageService.ts tiene un fallback a getPublicUrl que
-- lo consumiría en silencio.
select id, name, public, file_size_limit, allowed_mime_types
  from storage.buckets
 order by 1;


-- ---------------------------------------------------------------------------
-- Q11 — Qué migraciones cree la CLI que están aplicadas
-- ---------------------------------------------------------------------------
select version, name
  from supabase_migrations.schema_migrations
 order by version;


-- ---------------------------------------------------------------------------
-- Q12 — Dimensiones reales de los embeddings almacenados
-- ---------------------------------------------------------------------------
-- api/ai.ts indexa a 768 dims pero genera el embedding de consulta sin
-- outputDimensionality (3072). Si aquí aparece más de un valor, hay vectores
-- de espacios distintos mezclados y el índice RAG está corrupto.
select vector_dims(embedding) as dims, count(*) as filas
  from public.recording_chunks
 group by 1
 order by 1;


-- ---------------------------------------------------------------------------
-- Q13 — Formatos de audio_url conviviendo en la misma columna
-- ---------------------------------------------------------------------------
-- upload-audio guarda ruta relativa; recording-callback guarda URL absoluta.
-- El cron de retención hace storage.remove() con ese valor: con URL absoluta
-- no borra nada, no da error, y aun así pone audio_url a null.
-- NO programar el cron de limpieza mientras esto devuelva filas 'url_absoluta'.
select case
         when audio_url is null          then 'null'
         when audio_url like 'http%'     then 'url_absoluta'
         else 'ruta_relativa'
       end as formato,
       count(*) as filas
  from public.recordings
 group by 1
 order by 2 desc;
