# Missing Profile Issue - diegorgandulfo@gmail.com

## Problem
User `diegorgandulfo@gmail.com` can login (exists in `auth.users`) but doesn't appear in CRM (missing from `profiles` table).

## Root Cause
The auto-trigger that creates profiles after signup is either:
1. Not configured
2. Failed to execute
3. User signed up before trigger was created

## Diagnosis SQL

Run these queries in Supabase SQL Editor:

### 1. Check if user exists in auth.users
```sql
SELECT id, email, created_at, email_confirmed_at 
FROM auth.users 
WHERE email = 'diegorgandulfo@gmail.com';
```

### 2. Check if profile exists
```sql
SELECT id, email, first_name, last_name 
FROM profiles 
WHERE email = 'diegorgandulfo@gmail.com';
```

### 3. Find all users missing profiles
```sql
SELECT 
  au.id,
  au.email as missing_email,
  au.created_at
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL
ORDER BY au.created_at DESC;
```

### 4. Check if trigger exists
```sql
SELECT 
  t.tgname as trigger_name,
  c.relname as table_name,
  p.proname as function_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE t.tgname LIKE '%profile%' OR c.relname = 'users';
```

---

## Solution

### Option 1: Manual Profile Creation (Quick Fix)

```sql
-- Create profile for diegorgandulfo@gmail.com
INSERT INTO public.profiles (
  id,
  email,
  first_name,
  last_name,
  plan_id,
  subscription_status,
  minutes_used,
  minutes_limit,
  role
)
SELECT 
  au.id,
  au.email,
  'Raul',  -- First name from Settings screenshot
  'Gandulfo',  -- Last name from Settings screenshot
  'free',
  'active',
  0,
  24,
  'Member'
FROM auth.users au
WHERE au.email = 'diegorgandulfo@gmail.com'
ON CONFLICT (id) DO NOTHING;
```

### Option 2: Create Auto-Trigger (Permanent Fix)

This ensures ALL future signups automatically create a profile:

```sql
-- Step 1: Create the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    first_name,
    last_name,
    plan_id,
    subscription_status,
    minutes_used,
    minutes_limit,
    role,
    created_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    'free',
    'active',
    0,
    24,
    'Member',
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

### Option 3: Batch Fix (Fix ALL Missing Profiles)

```sql
-- Create profiles for ALL users that don't have one
INSERT INTO public.profiles (
  id,
  email,
  first_name,
  last_name,
  plan_id,
  subscription_status,
  minutes_used,
  minutes_limit,
  role,
  created_at
)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'first_name', 'User'),
  COALESCE(au.raw_user_meta_data->>'last_name', ''),
  'free',
  'active',
  0,
  24,
  'Member',
  au.created_at
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;
```

---

## Recommended Action Plan

1. **IMMEDIATE** - Run Option 1 (manual fix for diegorgandulfo)
2. **PERMANENT** - Run Option 2 (create trigger for future users)
3. **CLEANUP** - Run Option 3 (fix any other missing profiles)

After running these, refresh the CRM and diegorgandulfo should appear.

---

## Verification

After running the fix:

```sql
-- 1. Verify profile was created
SELECT id, email, first_name, last_name, plan_id
FROM profiles
WHERE email = 'diegorgandulfo@gmail.com';

-- 2. Verify all users have profiles
SELECT COUNT(*) as auth_users FROM auth.users;
SELECT COUNT(*) as profiles FROM profiles;
-- Numbers should match!

-- 3. Check for any remaining orphans
SELECT au.email
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL;
-- Should return 0 rows
```
