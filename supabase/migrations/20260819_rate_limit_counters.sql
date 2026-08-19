-- 20260819_rate_limit_counters.sql
--
-- Contador de peticiones para limitar los endpoints que son públicos por diseño.
--
-- POR QUÉ EN BASE DE DATOS Y NO EN MEMORIA
-- Vercel escala a N instancias concurrentes, así que un contador en memoria da un
-- límite efectivo de N × límite: inútil como control primario. Un almacén
-- compartido es la única forma de contar de verdad sin estado en el proceso.
--
-- POR QUÉ NO REDIS
-- Añadir Upstash significaría proveedor nuevo, secreto nuevo, factura nueva y dos
-- dependencias más. La service role key ya está en todas las funciones y la
-- llamada es un fetch a /rest/v1/rpc, igual que el resto del código. El coste es
-- un viaje extra de ~15-30 ms dentro de la misma región.
--
-- VENTANA FIJA, NO DESLIZANTE
-- El peor caso es 2× el límite justo en el cruce de dos ventanas. Para proteger
-- cuota de Gemini y de Resend eso sobra, y evita mantener un sorted set.

create table if not exists public.rate_limit_counters (
    bucket_key   text primary key,
    window_start timestamptz not null,
    hits         integer     not null default 0,
    updated_at   timestamptz not null default now()
);

-- RLS activa y CERO policies: denegado para cualquier rol sin BYPASSRLS. Solo
-- service_role puede tocar la tabla, que es justo lo que se quiere: los
-- contadores no deben ser legibles ni manipulables desde el navegador.
alter table public.rate_limit_counters enable row level security;
revoke all on table public.rate_limit_counters from anon, authenticated;

create index if not exists idx_rate_limit_window
    on public.rate_limit_counters (window_start);

-- Cuenta una petición y dice si se permite, en una sola sentencia atómica.
-- INSERT ... ON CONFLICT DO UPDATE ... RETURNING es seguro bajo concurrencia sin
-- necesidad de SELECT FOR UPDATE.
create or replace function public.consume_rate_limit(
    p_key            text,
    p_limit          integer,
    p_window_seconds integer
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    v_now          timestamptz := now();
    v_window_start timestamptz;
    v_hits         integer;
begin
    -- Solo backends. Si un cliente pudiera llamarla, podría agotar el contador
    -- de otro o inflar el suyo.
    if current_user in ('authenticated', 'anon') then
        raise exception 'consume_rate_limit solo es invocable desde el servidor';
    end if;

    if p_limit is null or p_limit <= 0 or p_window_seconds is null or p_window_seconds <= 0 then
        raise exception 'Parámetros de límite inválidos';
    end if;

    -- Inicio de la ventana actual, truncado al múltiplo de p_window_seconds.
    v_window_start := to_timestamp(
        floor(extract(epoch from v_now) / p_window_seconds) * p_window_seconds
    );

    insert into public.rate_limit_counters as rl (bucket_key, window_start, hits, updated_at)
    values (p_key, v_window_start, 1, v_now)
    on conflict (bucket_key) do update
        set hits = case
                       when rl.window_start = excluded.window_start then rl.hits + 1
                       else 1
                   end,
            window_start = excluded.window_start,
            updated_at   = v_now
    returning rl.hits into v_hits;

    return jsonb_build_object(
        'allowed',  v_hits <= p_limit,
        'hits',     v_hits,
        'limit',    p_limit,
        'reset_at', v_window_start + make_interval(secs => p_window_seconds)
    );
end;
$$;

revoke all on function public.consume_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text, integer, integer) to service_role;

-- Purga de ventanas viejas. La engancha el cron diario ya existente
-- (api/cron-cleanup-free.ts) en lugar de crear uno nuevo.
create or replace function public.purge_rate_limit_counters()
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_deleted integer;
begin
    delete from public.rate_limit_counters
     where window_start < now() - interval '2 days';
    get diagnostics v_deleted = row_count;
    return v_deleted;
end;
$$;

revoke all on function public.purge_rate_limit_counters() from public, anon, authenticated;
grant execute on function public.purge_rate_limit_counters() to service_role;
