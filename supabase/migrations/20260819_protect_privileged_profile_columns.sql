-- 20260819_protect_privileged_profile_columns.sql
--
-- Cierra la escalada de privilegios de `public.profiles`.
--
-- EL PROBLEMA
-- Las dos policies de UPDATE sobre profiles tienen `with_check` NULL. Cuando una
-- policy FOR UPDATE omite WITH CHECK, PostgreSQL reutiliza la expresión de USING
-- como check, así que "Users can update own profile" (USING auth.uid() = id)
-- solo impide reasignar la fila a otro id: TODAS las demás columnas quedan
-- libremente escribibles por el propio usuario vía PostgREST.
--
-- En la práctica, cualquier usuario autenticado podía ejecutar
--     update profiles set role = 'admin' where id = auth.uid();
-- y obtener control total, porque is_admin() decide por esa misma columna.
-- Por la misma vía podía asignarse plan_id, minutes_limit, extra_minutes,
-- voice_credits o subscription_status: servicio ilimitado gratis.
--
-- Verificado en producción antes de escribir esto: solo existe un perfil con rol
-- elevado y es el del propietario, así que el agujero estaba abierto pero sin
-- explotar.
--
-- POR QUÉ UN TRIGGER Y NO REVOKE POR COLUMNA
-- Revocar sobre columnas sueltas no surte efecto si el privilegio está concedido
-- a nivel de tabla, que es el default de Supabase: obliga a REVOKE total más un
-- GRANT de allowlist. Y services/databaseService.ts compone un único PATCH que
-- mezcla campos de perfil con campos de facturación, así que un GRANT por columna
-- haría que PostgREST devolviera 42501 y fallara el guardado entero: el usuario
-- no podría ni cambiar su nombre. Además el panel de admin edita perfiles AJENOS
-- desde el navegador, y un GRANT es todo o nada para el rol `authenticated`.
--
-- El trigger sí distingue admin de usuario, falla en seguro y es silencioso para
-- el cliente: revierte el valor y guarda el resto de la fila.
--
-- QUÉ NO ROMPE
-- Los backends de confianza pasan sin tocar. Eso incluye service_role y, por
-- tanto, las funciones SECURITY DEFINER (increment_user_usage, reset mensual,
-- webhooks de Lemon Squeezy), porque dentro de ellas current_user es el
-- propietario de la función, no `authenticated`.

-- ---------------------------------------------------------------------------
-- 1. Función del trigger, generada dinámicamente
-- ---------------------------------------------------------------------------
-- El cuerpo se compone leyendo information_schema porque plpgsql compila de
-- forma perezosa: referenciar una columna inexistente no fallaría al aplicar la
-- migración, fallaría en CADA update de perfil en producción.
do $outer$
declare
    -- Nunca escribibles desde PostgREST, ni siquiera por un admin. El rol se
    -- asigna a mano en base de datos; ningún camino de cliente lo escribe.
    v_identity_cols text[] := array['id', 'role', 'email'];

    -- Escribibles solo por admin. El panel de administración las edita sobre
    -- perfiles ajenos y tiene policy propia para ello.
    v_privileged_cols text[] := array[
        'plan_id', 'plan_type', 'subscription_status', 'subscription_id',
        'lemon_subscription_id', 'lemon_customer_id',
        'minutes_limit', 'minutes_used', 'extra_minutes',
        'storage_limit', 'storage_used', 'storage_days_limit',
        'voice_credits', 'call_limit', 'call_minutes_used',
        'phone_verified', 'caller_id_verified',
        'trial_ends_at', 'current_period_end', 'renews_at', 'usage_reset_date'
    ];

    v_identity_body   text := '';
    v_privileged_body text := '';
    c text;
begin
    foreach c in array v_identity_cols loop
        if exists (select 1 from information_schema.columns
                    where table_schema = 'public' and table_name = 'profiles' and column_name = c) then
            v_identity_body := v_identity_body
                || format('    if new.%1$I is distinct from old.%1$I then'
                       || ' raise warning ''[profiles] intento de modificar %1$s por %%'', current_user;'
                       || ' new.%1$I := old.%1$I; end if;' || E'\n', c);
        end if;
    end loop;

    foreach c in array v_privileged_cols loop
        if exists (select 1 from information_schema.columns
                    where table_schema = 'public' and table_name = 'profiles' and column_name = c) then
            v_privileged_body := v_privileged_body
                || format('        new.%1$I := old.%1$I;' || E'\n', c);
        end if;
    end loop;

    execute format($fmt$
create or replace function public.tg_profiles_protect_privileged_columns()
returns trigger
language plpgsql
-- SECURITY INVOKER a propósito: hace falta ver el rol REAL del llamante.
security invoker
set search_path = public, pg_temp
as $body$
declare
    v_is_admin boolean := false;
begin
    -- Backends de confianza: service_role, postgres, cron y cualquier función
    -- SECURITY DEFINER (dentro de ellas current_user es su propietario).
    if current_user not in ('authenticated', 'anon') then
        return new;
    end if;

%1$s
    begin
        v_is_admin := public.is_admin();
    exception when others then
        begin
            v_is_admin := public.is_admin_user();
        exception when others then
            v_is_admin := false;
        end;
    end;

    if not v_is_admin then
%2$s
    end if;

    return new;
end;
$body$;
$fmt$, v_identity_body, v_privileged_body);
end
$outer$;

drop trigger if exists trg_profiles_protect_privileged_columns on public.profiles;
create trigger trg_profiles_protect_privileged_columns
    before update on public.profiles
    for each row execute function public.tg_profiles_protect_privileged_columns();


-- ---------------------------------------------------------------------------
-- 2. Sustituto para el único uso legítimo que el trigger corta
-- ---------------------------------------------------------------------------
-- services/databaseService.ts calculaba el almacenamiento real del usuario y lo
-- escribía directo sobre profiles.storage_used. Es un total auditado, no un
-- delta, así que no se puede expresar con las RPC de incremento existentes sin
-- leer primero (dos viajes, condición de carrera y no idempotente).
--
-- Este setter no concede ningún privilegio nuevo: lleva la misma guarda de
-- auth.uid() que increment_user_storage, y un usuario ya podía poner su contador
-- a cero llamando a decrement_user_storage con un número grande.
create or replace function public.set_user_storage(p_user_id uuid, p_bytes bigint)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
    if auth.uid() is distinct from p_user_id then
        raise exception 'No autorizado para sincronizar el almacenamiento de otro usuario';
    end if;
    if p_bytes is null or p_bytes < 0 then
        raise exception 'Tamaño inválido: %', p_bytes;
    end if;

    update public.profiles set storage_used = p_bytes where id = p_user_id;
end;
$$;

revoke all on function public.set_user_storage(uuid, bigint) from public, anon;
grant execute on function public.set_user_storage(uuid, bigint) to authenticated, service_role;


-- ---------------------------------------------------------------------------
-- 3. Comprobación
-- ---------------------------------------------------------------------------
-- Con la sesión de un usuario normal, esto debe dejar `role` intacto:
--     update public.profiles set role = 'super_admin' where id = auth.uid();
--     select role from public.profiles where id = auth.uid();
-- y en los logs de Postgres debe aparecer el warning correspondiente.
