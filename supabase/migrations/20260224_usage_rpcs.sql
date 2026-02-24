-- RPC to safely increment user usage (minutes) with complex logic (plan vs extra)
create or replace function increment_user_usage(p_user_id uuid, p_minutes int)
returns void
language plpgsql
security definer
as $$
declare
  v_limit int;
  v_used int;
  v_extra int;
  v_available int;
  v_remainder int;
begin
  -- Restrict to the authenticated user themselves to prevent malicious usage bombing
  if auth.uid() != p_user_id then
    raise exception 'Unauthorized to increment usage for other users';
  end if;

  -- Get current values
  select 
    coalesce(minutes_limit, 0), coalesce(minutes_used, 0), coalesce(extra_minutes, 0)
  into 
    v_limit, v_used, v_extra
  from profiles
  where id = p_user_id;
  
  -- Calculate available in plan
  v_available := greatest(0, v_limit - v_used);
  
  if v_available >= p_minutes then
    v_used := v_used + p_minutes;
  else
    v_used := v_used + v_available;
    v_remainder := p_minutes - v_available;
    v_extra := greatest(0, v_extra - v_remainder);
  end if;
  
  update profiles
  set minutes_used = v_used,
      extra_minutes = v_extra
  where id = p_user_id;
end;
$$;

-- RPC to safely increment user storage
create or replace function increment_user_storage(p_user_id uuid, p_size_bytes bigint)
returns void
language plpgsql
security definer
as $$
begin
  if auth.uid() != p_user_id then
    raise exception 'Unauthorized to increment storage for other users';
  end if;

  update profiles
  set storage_used = coalesce(storage_used, 0) + p_size_bytes
  where id = p_user_id;
end;
$$;
