-- Create minute_packs table
create table if not exists public.minute_packs (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    minutes integer not null,
    price numeric(10,2) not null,
    checkout_url text not null,
    is_active boolean default true,
    "order" integer default 0,
    created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.minute_packs enable row level security;

-- DROP OLD POLICIES (to avoid name conflicts)
drop policy if exists "Minute packs are manageable by admins" on public.minute_packs;
drop policy if exists "Minute packs are viewable by everyone" on public.minute_packs;
drop policy if exists "Minute packs select policy" on public.minute_packs;
drop policy if exists "Minute packs admin policy" on public.minute_packs;

-- Create robust policies using the existing is_admin() function
-- SELECT: Everyone can view active packs (or all for admins)
create policy "Minute packs select policy"
on public.minute_packs for select
using (is_active = true or is_admin());

-- ALL OTHER: Restricted to admins (using ALL to cover insert, update, delete)
create policy "Minute packs admin policy"
on public.minute_packs for all
using (is_admin())
with check (is_admin());

-- Insert initial data
insert into public.minute_packs (name, minutes, price, checkout_url, "order")
values 
    ('Pack Básico', 60, 15.00, 'https://checkout.lemonsqueezy.com/buy/placeholder1', 1),
    ('Pack Profesional', 180, 40.00, 'https://checkout.lemonsqueezy.com/buy/placeholder2', 2),
    ('Pack Empresa', 500, 100.00, 'https://checkout.lemonsqueezy.com/buy/placeholder3', 3),
    ('Pack Elite', 1200, 200.00, 'https://checkout.lemonsqueezy.com/buy/placeholder4', 4)
on conflict (id) do nothing;
