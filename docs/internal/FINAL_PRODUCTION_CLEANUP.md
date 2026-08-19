# Limpieza Final de Producción

## Situación Actual

**5 usuarios en CRM**:
1. ✅ Diego Galmarini (admin) - diegogalmarini@gmail.com
2. ✅ Raul Gandulfo - diegorgandulfo@gmail.com  
3. ✅ Nati Pol - imnatipol@gmail.com
4. ❌ Test User - testuser@gmail.com
5. ❌ Test User - testuser@diktalo.com

**Problema**: Los usuarios test siguen en `auth.users`, por eso se recrearon sus perfiles.

---

## Paso 1: Borrar Usuarios Test COMPLETAMENTE

### Opción A: Desde Supabase Auth Dashboard (Recomendado)

1. Ve a https://supabase.com/dashboard/project/qnvzofpdrfzchsegooic/auth/users
2. Busca `testuser@gmail.com` y `testuser@diktalo.com`
3. Click en cada uno → botón "Delete user"
4. Confirma la eliminación

Esto elimina de `auth.users` Y automáticamente de `profiles` por la foreign key.

### Opción B: Desde SQL (Alternativa)

```sql
-- CUIDADO: Esto elimina usuarios permanentemente
-- Verificar emails antes de ejecutar

-- Ver usuarios que vamos a borrar
SELECT id, email, created_at 
FROM auth.users 
WHERE email IN ('testuser@gmail.com', 'testuser@diktalo.com');

-- Si estás seguro, ejecutar:
-- NOTA: Necesitas permisos de service_role para esto
-- Es más seguro usar el dashboard de Supabase
```

---

## Paso 2: Crear Trigger de Auto-Creación de Perfiles

Esto asegura que TODOS los futuros usuarios tengan perfil automáticamente:

```sql
-- Función que se ejecuta al crear usuario nuevo
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

-- Trigger que ejecuta la función
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

---

## Paso 3: Verificación Final

### 3.1 Verificar conteos
```sql
SELECT 
  (SELECT COUNT(*) FROM auth.users) as total_auth,
  (SELECT COUNT(*) FROM profiles) as total_profiles,
  (SELECT COUNT(*) FROM auth.users au LEFT JOIN profiles p ON au.id = p.id WHERE p.id IS NULL) as missing;
```

**Resultado esperado**:
- `total_auth: 3`
- `total_profiles: 3`
- `missing: 0`

### 3.2 Ver usuarios finales
```sql
SELECT 
  email, 
  first_name, 
  last_name, 
  plan_id, 
  role,
  subscription_status
FROM profiles
ORDER BY created_at;
```

**Resultado esperado** (3 usuarios):
1. Diego Galmarini - admin - business_plus - active
2. Raul Gandulfo - Member - free - active
3. Nati Pol - Member - free - active

### 3.3 Probar trigger (opcional)
Crea un usuario test nuevo y verifica que el perfil se cree automáticamente:

```sql
-- Después de crear usuario en frontend o dashboard:
SELECT email FROM profiles ORDER BY created_at DESC LIMIT 1;
-- Debería aparecer inmediatamente
```

---

## Paso 4: Actualizar Overview con Datos Limpios

Después de borrar los test users, los KPIs deberían ser:

```
MRR: $49 (solo Diego con Business+)
Active Users: 3 (todos activos)
Total Minutes: depende del uso real
Estimated Cost: minutos × $0.04
Gross Profit: $49 - costo
```

---

## ✅ Checklist de Producción Final

- [ ] Usuarios test eliminados de auth.users (Dashboard de Supabase)
- [ ] Trigger `on_auth_user_created` creado
- [ ] Función `handle_new_user()` creada
- [ ] Verificación muestra 3 auth / 3 profiles / 0 missing
- [ ] CRM muestra solo 3 usuarios reales
- [ ] Overview muestra datos correctos
- [ ] Nuevo registro automáticamente crea perfil

---

## 🚀 Estado Final Esperado

**Base de Datos Limpia**:
- ✅ Solo usuarios reales (Diego, Raul, Nati)
- ✅ Todos con perfiles completos
- ✅ Trigger activo para futuros usuarios
- ✅ Sin usuarios test
- ✅ KPIs correctos

**READY FOR PRODUCTION** 🎉
