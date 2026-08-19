-- 20260819_add_missing_profile_columns.sql
--
-- Añade cinco columnas de `profiles` que el código lee y escribe pero que nunca
-- se crearon en la base de datos. Verificado contra producción
-- (qnvzofpdrfzchsegooic) consultando information_schema.columns.
--
-- Por qué importa: services/databaseService.ts compone el PATCH del perfil de
-- forma condicional, campo a campo. PostgREST rechaza la petición ENTERA con un
-- 400 si una sola columna no existe, así que cada una de estas ausencias no
-- degradaba una función: tumbaba el guardado completo en el que participara.
--
--   notification_settings  -> guardar preferencias de notificación fallaba siempre
--   timezone               -> guardar la zona horaria fallaba siempre
--   has_completed_tour     -> el tour de bienvenida no podía marcarse como visto,
--                             así que se repetía a cada usuario indefinidamente
--   active_agent_id        -> el agente de soporte elegido no persistía
--   extra_minutes          -> los packs de minutos no se acreditaban: tanto la RPC
--                             increment_extra_minutes como el fallback de
--                             supabase/functions/lemonsqueezy-webhook escriben
--                             aquí. Sin ventas reales todavía, es un fallo
--                             latente, pero tiene que existir antes de vender.
--
-- Es DDL puramente aditivo e idempotente: no modifica ni borra datos, no toca
-- RLS y no cambia ninguna columna existente. Seguro de aplicar en producción
-- aunque el proyecto siga en plan Free y sin copias de seguridad.

alter table public.profiles
    add column if not exists notification_settings jsonb   not null default '{}'::jsonb,
    add column if not exists timezone              text,
    add column if not exists has_completed_tour    boolean not null default false,
    add column if not exists active_agent_id       text,
    add column if not exists extra_minutes         integer not null default 0;

-- `extra_minutes` es un saldo comprado: nunca debe quedar negativo. El consumo
-- lo hacen RPC security definer, pero la restricción vale como última red.
do $$
begin
    if not exists (
        select 1 from pg_constraint
         where conname = 'profiles_extra_minutes_non_negative'
    ) then
        alter table public.profiles
            add constraint profiles_extra_minutes_non_negative
            check (extra_minutes >= 0) not valid;
    end if;
end $$;

comment on column public.profiles.extra_minutes is
    'Saldo de minutos comprados en packs. No caduca. Se consume DESPUÉS de agotar los minutos del plan mensual.';
comment on column public.profiles.has_completed_tour is
    'Si el usuario ya vio el tour de bienvenida. Sin esta columna el tour se repetía en cada sesión.';
