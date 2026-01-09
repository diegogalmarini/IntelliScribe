# Instrucciones de Ejecución - SQL Scripts

## PASO 1: Borrar usuarios test

Ejecuta estos comandos **UNO POR UNO** en Supabase SQL Editor:

### 1.1 - Verificar usuarios a borrar
```sql
SELECT id, email, created_at 
FROM auth.users 
WHERE email IN ('testuser@gmail.com', 'testuser@diktalo.com');
```
✅ Deberías ver 2 usuarios

---

### 1.2 - Borrar perfiles primero
```sql
DELETE FROM public.profiles
WHERE email IN ('testuser@gmail.com', 'testuser@diktalo.com');
```
✅ Debería decir "Success. 2 rows deleted"

---

### 1.3 - Borrar de auth.users
```sql
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN 
    SELECT id FROM auth.users 
    WHERE email IN ('testuser@gmail.com', 'testuser@diktalo.com')
  LOOP
    DELETE FROM auth.users WHERE id = user_record.id;
  END LOOP;
END $$;
```
✅ Debería decir "Success"

---

### 1.4 - Verificar que se borraron
```sql
SELECT COUNT(*) as remaining_test_users
FROM auth.users 
WHERE email IN ('testuser@gmail.com', 'testuser@diktalo.com');
```
✅ Debe devolver: **0**

---

## PASO 2: Crear trigger automático

### 2.1 - Crear función
```sql
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
```
✅ Debería decir "Success"

---

### 2.2 - Eliminar trigger anterior si existe
```sql
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
```
✅ Debería decir "Success" (o "NOTICE: trigger does not exist")

---

### 2.3 - Crear el trigger
```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```
✅ Debería decir "Success"

---

### 2.4 - Verificar que el trigger existe
```sql
SELECT 
  t.tgname as trigger_name,
  c.relname as table_name,
  p.proname as function_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE t.tgname = 'on_auth_user_created';
```
✅ Debe devolver 1 fila:
- trigger_name: `on_auth_user_created`
- table_name: `users`
- function_name: `handle_new_user`

---

## PASO 3: Verificación final

### 3.1 - Ver usuarios finales
```sql
SELECT email, first_name, last_name, role
FROM profiles
ORDER BY created_at;
```
✅ Debe mostrar **3 usuarios**:
1. Diego Galmarini (admin)
2. Raul Gandulfo (Member)
3. Nati Pol (Member)

---

### 3.2 - Verificar conteos
```sql
SELECT 
  (SELECT COUNT(*) FROM auth.users) as auth_users,
  (SELECT COUNT(*) FROM profiles) as profiles,
  (SELECT COUNT(*) FROM auth.users au LEFT JOIN profiles p ON au.id = p.id WHERE p.id IS NULL) as missing;
```
✅ Debe mostrar:
- auth_users: **3**
- profiles: **3**
- missing: **0**

---

## ✅ ÉXITO

Si todos los pasos devolvieron los resultados correctos:
- ✅ Usuarios test eliminados
- ✅ Trigger creado
- ✅ Solo usuarios reales permanecen
- ✅ Futuros usuarios automáticamente tendrán perfil

**¡Producción lista!** 🎉

---

## 🔴 Si algo falla

**Si el paso 1.3 falla** (borrar de auth.users):
- Es normal si no tienes permisos directos
- Alternativa: Ir al Auth Dashboard de Supabase y borrar manualmente
- URL: https://supabase.com/dashboard/project/qnvzofpdrfzchsegooic/auth/users

**Si el trigger no se crea**:
- Verifica que tienes permisos de crear funciones
- Intenta ejecutar desde un usuario con rol service_role
