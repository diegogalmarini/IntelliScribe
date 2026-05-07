-- RPC to safely decrement user usage (minutes) when deleting a recording
-- Mirrors increment_user_usage but in reverse; never goes below 0
create or replace function decrement_user_usage(p_user_id uuid, p_minutes int)
returns void
language plpgsql
security definer
as $$
begin
  if auth.uid() != p_user_id then
    raise exception 'Unauthorized to decrement usage for other users';
  end if;

  update profiles
  set minutes_used = greatest(0, coalesce(minutes_used, 0) - p_minutes)
  where id = p_user_id;
end;
$$;

-- RPC to safely decrement user storage when deleting a recording
-- Mirrors increment_user_storage but in reverse; never goes below 0
create or replace function decrement_user_storage(p_user_id uuid, p_size_bytes bigint)
returns void
language plpgsql
security definer
as $$
begin
  if auth.uid() != p_user_id then
    raise exception 'Unauthorized to decrement storage for other users';
  end if;

  update profiles
  set storage_used = greatest(0, coalesce(storage_used, 0) - p_size_bytes)
  where id = p_user_id;
end;
$$;
