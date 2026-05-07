-- Tracks which onboarding emails have been sent to each free user
create table if not exists onboarding_emails_sent (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade,
    email_step int not null check (email_step between 1 and 5),
    sent_at timestamptz default now(),
    unique(user_id, email_step)
);

-- RLS: only service role can read/write (called from Edge Function with service key)
alter table onboarding_emails_sent enable row level security;

-- Returns free/unactivated users in a signup window who haven't received a given step yet
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
        u.email,
        coalesce(p.full_name, u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)) as user_name,
        coalesce(p.language, 'es') as user_language
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
