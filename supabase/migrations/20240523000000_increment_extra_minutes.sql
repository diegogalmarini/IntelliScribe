-- RPC to safely increment extra_minutes (for One-Time Packs)
create or replace function increment_extra_minutes(p_user_id uuid, p_amount int)
returns void
language plpgsql
security definer
as $$
begin
  update profiles
  set extra_minutes = coalesce(extra_minutes, 0) + p_amount
  where id = p_user_id;
end;
$$;
