-- Consumo de minutos de llamada: primero los incluidos en el plan, luego créditos.
--
-- EL PROBLEMA QUE ARREGLA
--
-- `profiles.call_limit` guarda los minutos de llamada incluidos en el plan (300
-- en Business+, 100 en Business; ver services/adminService.ts:286) y el sidebar
-- los muestra como "0 / 300 calls". Pero `call_minutes_used` no lo incrementaba
-- NADIE: solo se leía en adminService.
--
-- Mientras tanto, api/recording-callback.ts descontaba `voice_credits` en cada
-- llamada desde el primer minuto. Resultado: un usuario Business+ con 300
-- minutos incluidos gastaba créditos comprados sin llegar a usar ni uno de los
-- incluidos. Es exactamente cobrar de más.
--
-- Es el mismo patrón que `increment_user_usage` ya implementa para
-- minutos/extra_minutes, y que aquí faltaba.
--
-- POR QUÉ EL MULTIPLICADOR DECIDE
--
-- utils/voiceRates.ts: STANDARD x1, PREMIUM x5, ULTRA x10. La landing promete
-- que lo incluido es la zona estándar ("Zone 1 calls to US, UK, EU and more are
-- included in our premium plans"), así que los minutos del plan solo cubren
-- multiplicador 1. Los destinos premium y ultra van siempre contra créditos.
--
-- Si esa regla de negocio cambia, se cambia AQUÍ y en un solo sitio.

create or replace function public.consume_call_minutes(
    p_user_id uuid,
    p_minutes int,
    p_multiplier int
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
    v_limite int;
    v_usados int;
    v_creditos numeric;
    v_disponibles int;
    v_del_plan int := 0;
    v_resto int;
    v_creditos_gastados numeric := 0;
begin
    if p_minutes is null or p_minutes <= 0 then
        return jsonb_build_object('del_plan', 0, 'creditos', 0);
    end if;

    select
        coalesce(call_limit, 0),
        coalesce(call_minutes_used, 0),
        coalesce(voice_credits, 0)
    into v_limite, v_usados, v_creditos
    from public.profiles
    where id = p_user_id;

    if not found then
        raise exception 'Perfil no encontrado: %', p_user_id;
    end if;

    -- Solo la zona estándar consume del plan. Ver la nota de arriba.
    if coalesce(p_multiplier, 1) = 1 then
        v_disponibles := greatest(0, v_limite - v_usados);
        v_del_plan := least(p_minutes, v_disponibles);
    end if;

    v_resto := p_minutes - v_del_plan;
    v_creditos_gastados := v_resto * coalesce(p_multiplier, 1);

    -- Los créditos nunca bajan de cero: si no alcanzan, se consume lo que haya.
    -- Cortar la llamada ya no es posible a estas alturas —el callback llega
    -- cuando la grabación ha terminado—, así que se registra el consumo real.
    if v_creditos_gastados > v_creditos then
        v_creditos_gastados := v_creditos;
    end if;

    update public.profiles
    set
        call_minutes_used = coalesce(call_minutes_used, 0) + v_del_plan,
        voice_credits = greatest(0, coalesce(voice_credits, 0) - v_creditos_gastados)
    where id = p_user_id;

    return jsonb_build_object(
        'del_plan', v_del_plan,
        'creditos', v_creditos_gastados,
        'multiplicador', coalesce(p_multiplier, 1)
    );
end;
$$;

-- La llama api/recording-callback.ts con service role, tras validar la firma de
-- Twilio. Ningún cliente debe poder tocar sus propios contadores de consumo.
revoke all on function public.consume_call_minutes(uuid, int, int) from public, anon, authenticated;
grant execute on function public.consume_call_minutes(uuid, int, int) to service_role;
