# Fix: 2 Missing Profiles

## Problema
- **auth.users**: 5 usuarios
- **profiles**: 3 usuarios
- **missing**: 2 usuarios sin perfil

## Solución

### Paso 1: Identificar usuarios sin perfil

Ejecuta esto para ver quiénes son:

```sql
SELECT 
  au.id,
  au.email,
  au.created_at,
  au.email_confirmed_at
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL
ORDER BY au.created_at DESC;
```

### Paso 2: Crear perfiles para todos los usuarios faltantes

```sql
-- Crea perfiles automáticamente para TODOS los usuarios que no tienen uno
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

### Paso 3: Verificar que se arregló

```sql
SELECT 
  (SELECT COUNT(*) FROM auth.users) as auth_users,
  (SELECT COUNT(*) FROM profiles) as profiles,
  (SELECT COUNT(*) FROM auth.users au LEFT JOIN profiles p ON au.id = p.id WHERE p.id IS NULL) as missing;
```

**Resultado esperado**: `missing: 0`

### Paso 4: Ver todos los usuarios

```sql
SELECT email, first_name, last_name, plan_id, role
FROM profiles
ORDER BY created_at DESC;
```

---

## IMPORTANTE: Prevención Futura

Para evitar que esto vuelva a pasar, crear trigger automático:

```sql
-- Crear función que se ejecuta al registrar usuario nuevo
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
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

---

## ✅ Checklist Final

- [ ] Paso 1: Identificar los 2 usuarios sin perfil
- [ ] Paso 2: Ejecutar INSERT para crear perfiles faltantes
- [ ] Paso 3: Verificar que missing = 0
- [ ] Paso 4: Ver que ahora hay 5 usuarios en profiles
- [ ] Paso 5: Crear trigger para prevenir problema futuro
- [ ] Paso 6: Refresh del CRM y verificar que aparecen los 5 usuarios
