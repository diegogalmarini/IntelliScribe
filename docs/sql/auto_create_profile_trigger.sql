-- ========================================
-- TRIGGER AUTOMÁTICO DE CREACIÓN DE PERFILES
-- ========================================
-- Ejecutar en Supabase SQL Editor
-- Esto asegura que TODOS los futuros usuarios tengan perfil automáticamente

-- Paso 1: Crear la función que se ejecutará al crear un usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insertar perfil automáticamente cuando se crea usuario en auth.users
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
    -- Intenta sacar el nombre de los metadatos del signup, si no usa 'User'
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    'free',  -- Plan por defecto
    'active',  -- Estado por defecto
    0,  -- Sin minutos usados al inicio
    24,  -- Límite de minutos plan free
    'Member',  -- Rol por defecto (no admin)
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;  -- Si ya existe, no hacer nada
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Paso 2: Eliminar trigger anterior si existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Paso 3: Crear el trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ========================================
-- VERIFICACIÓN DEL TRIGGER
-- ========================================

-- Ver que el trigger fue creado correctamente
SELECT 
  t.tgname as trigger_name,
  c.relname as table_name,
  p.proname as function_name,
  t.tgenabled as enabled
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE t.tgname = 'on_auth_user_created';

-- Debe mostrar:
-- trigger_name: on_auth_user_created
-- table_name: users
-- function_name: handle_new_user
-- enabled: O (significa enabled)

-- ========================================
-- NOTAS IMPORTANTES
-- ========================================

/*
Este trigger:
1. Se ejecuta DESPUÉS de insertar un usuario en auth.users
2. Crea automáticamente un perfil en public.profiles
3. Usa datos del signup si están disponibles (first_name, last_name)
4. Asigna valores por defecto seguros
5. Evita duplicados con ON CONFLICT

Beneficios:
- ✅ No más perfiles faltantes
- ✅ Todos los usuarios nuevos automáticamente en CRM
- ✅ No requiere código adicional en el frontend
- ✅ Funciona para signups por email, OAuth, etc.

El trigger está SECURITY DEFINER para que tenga permisos
suficientes de ejecutar el INSERT en profiles.
*/
