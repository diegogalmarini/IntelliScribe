-- 20260819_harden_security_definer_functions.sql
--
-- Cierra tres cosas relacionadas, todas verificadas contra producción:
--
--   1. Once funciones SECURITY DEFINER sin `search_path` fijado.
--   2. `match_recording_chunks` sin filtro por usuario, invocada con service role.
--   3. Dos RPC privilegiadas ejecutables desde el navegador.

-- ---------------------------------------------------------------------------
-- 1. search_path en todas las funciones SECURITY DEFINER
-- ---------------------------------------------------------------------------
-- Una función SECURITY DEFINER se ejecuta con los privilegios de su propietario.
-- Si no fija `search_path`, resuelve los nombres sin cualificar usando el del
-- llamante, que puede anteponer un esquema propio con una tabla o función
-- homónima y hacer que el cuerpo opere sobre ella con privilegios elevados.
--
-- Afectadas en producción: decrement_storage, decrement_user_storage,
-- decrement_user_usage, decrement_voice_credits, get_onboarding_email_candidates,
-- handle_new_user, increment_extra_minutes, increment_user_storage,
-- increment_user_usage, is_admin_user y reset_monthly_usage.
--
-- Se hace por barrido y no con ALTER uno a uno porque las firmas reales de
-- producción no coinciden siempre con las de las migraciones del repo.
-- Se incluye `extensions` en el path porque pgvector vive ahí en Supabase: sin
-- él, el operador <=> deja de resolverse dentro de las funciones afectadas.
do $$
declare r record;
begin
    for r in
        select p.oid::regprocedure as sig
          from pg_proc p
          join pg_namespace n on n.oid = p.pronamespace
         where n.nspname = 'public'
           and p.prosecdef
           and (p.proconfig is null
                or not exists (select 1 from unnest(p.proconfig) c where c like 'search\_path=%'))
    loop
        execute format('alter function %s set search_path = public, extensions, pg_temp', r.sig);
        raise notice 'search_path fijado en %', r.sig;
    end loop;
end $$;


-- ---------------------------------------------------------------------------
-- 2. match_recording_chunks: filtro por usuario obligatorio
-- ---------------------------------------------------------------------------
-- La función es SECURITY INVOKER y su único filtro son los recording_ids que
-- envía el llamante. Desde el cliente eso es seguro porque la RLS de
-- recording_chunks acota las filas, pero api/ai.ts la invoca con la SERVICE ROLE
-- KEY, que desactiva la RLS: bastaba conocer un UUID de grabación ajena para
-- leer sus fragmentos.
--
-- El DROP es imprescindible: añadir un parámetro con DEFAULT crea una SOBRECARGA,
-- y la llamada de cuatro argumentos seguiría resolviendo a la versión antigua e
-- insegura. Se eliminan todas las variantes por nombre.
do $$
declare r record;
begin
    for r in
        select p.oid::regprocedure as sig
          from pg_proc p
          join pg_namespace n on n.oid = p.pronamespace
         where n.nspname = 'public' and p.proname = 'match_recording_chunks'
    loop
        execute format('drop function %s', r.sig);
    end loop;
end $$;

create function public.match_recording_chunks(
    query_embedding      vector(768),
    match_threshold      float,
    match_count          int,
    filter_recording_ids uuid[] default null,
    filter_user_id       uuid   default null
)
returns table (
    id              uuid,
    recording_id    uuid,
    content         text,
    similarity      float,
    recording_title text,
    recording_date  text
)
language plpgsql
stable
-- Se mantiene SECURITY INVOKER: desde el cliente la RLS sigue aplicando ADEMÁS
-- del filtro explícito, que es defensa en profundidad.
set search_path = public, extensions, pg_temp
as $$
declare
    v_user uuid := coalesce(filter_user_id, auth.uid());
begin
    -- Falla en cerrado: sin usuario no se devuelve nada.
    if v_user is null then
        raise exception 'match_recording_chunks requiere auth.uid() o filter_user_id';
    end if;

    -- Un cliente autenticado no puede consultar en nombre de otro.
    if auth.uid() is not null and filter_user_id is not null and filter_user_id <> auth.uid() then
        raise exception 'No autorizado para consultar fragmentos de otro usuario';
    end if;

    if match_count is null or match_count > 50 then
        match_count := 50;
    end if;

    return query
    select rc.id,
           rc.recording_id,
           rc.content,
           1 - (rc.embedding <=> query_embedding) as similarity,
           r.title::text,
           r.date::text
      from public.recording_chunks rc
      join public.recordings r on r.id = rc.recording_id
     where rc.user_id = v_user
       and r.user_id  = v_user
       and (filter_recording_ids is null or rc.recording_id = any(filter_recording_ids))
       and 1 - (rc.embedding <=> query_embedding) > match_threshold
     order by similarity desc
     limit match_count;
end;
$$;

grant execute on function public.match_recording_chunks(vector(768), float, int, uuid[], uuid)
    to authenticated, service_role;


-- ---------------------------------------------------------------------------
-- 3. RPC privilegiadas: solo desde el servidor
-- ---------------------------------------------------------------------------
-- increment_extra_minutes acredita minutos comprados. Es SECURITY DEFINER y no
-- comprueba quién llama: cualquier usuario autenticado podía regalarse minutos
-- ilimitados con un POST a /rest/v1/rpc/increment_extra_minutes.
-- Su único llamante legítimo es la Edge Function del webhook de Lemon Squeezy,
-- que usa la service role key.
do $$
declare r record;
begin
    for r in
        select p.oid::regprocedure as sig
          from pg_proc p
          join pg_namespace n on n.oid = p.pronamespace
         where n.nspname = 'public' and p.proname = 'increment_extra_minutes'
    loop
        execute format('revoke all on function %s from public, anon, authenticated', r.sig);
        execute format('grant execute on function %s to service_role', r.sig);
    end loop;
end $$;

-- get_onboarding_email_candidates lee auth.users y devuelve correos y nombres de
-- todos los usuarios. Es SECURITY DEFINER y tampoco comprueba llamante:
-- enumeración masiva de datos personales desde el navegador.
-- Su único llamante legítimo es la Edge Function onboarding-emails.
do $$
declare r record;
begin
    for r in
        select p.oid::regprocedure as sig
          from pg_proc p
          join pg_namespace n on n.oid = p.pronamespace
         where n.nspname = 'public' and p.proname = 'get_onboarding_email_candidates'
    loop
        execute format('revoke all on function %s from public, anon, authenticated', r.sig);
        execute format('grant execute on function %s to service_role', r.sig);
    end loop;
end $$;

-- reset_monthly_usage la invoca solo el cron con la service role key.
do $$
declare r record;
begin
    for r in
        select p.oid::regprocedure as sig
          from pg_proc p
          join pg_namespace n on n.oid = p.pronamespace
         where n.nspname = 'public' and p.proname = 'reset_monthly_usage'
    loop
        execute format('revoke all on function %s from public, anon, authenticated', r.sig);
        execute format('grant execute on function %s to service_role', r.sig);
    end loop;
end $$;


-- ---------------------------------------------------------------------------
-- Comprobación
-- ---------------------------------------------------------------------------
-- No debe quedar ninguna fila:
--   select p.proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace
--    where n.nspname='public' and p.prosecdef
--      and (p.proconfig is null
--           or not exists (select 1 from unnest(p.proconfig) c where c like 'search\_path=%'));
