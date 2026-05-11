-- Fix: profiles has first_name/last_name, not full_name
create or replace function get_onboarding_email_candidates(
    p_min_date timestamptz,
    p_max_date timestamptz,
    p_step int
)
returns table(user_id uuid, user_email text, user_name text, user_language text)
language plpgsql
security definer
as $$
begin
    return query
    select
        p.id,
        u.email::text,
        coalesce(
            nullif(trim(concat(p.first_name, ' ', p.last_name)), ''),
            u.raw_user_meta_data->>'full_name',
            split_part(u.email, '@', 1)
        )::text as user_name,
        coalesce(p.language, 'es')::text as user_language
    from profiles p
    join auth.users u on u.id = p.id
    where
        (p.plan_type = 'free' or p.plan_type is null)
        and p.created_at >= p_min_date
        and p.created_at <= p_max_date
        and not exists (
            select 1 from recordings r where r.user_id = p.id
        )
        and not exists (
            select 1 from onboarding_emails_sent oes
            where oes.user_id = p.id and oes.email_step = p_step
        )
        and u.email is not null;
end;
$$;
