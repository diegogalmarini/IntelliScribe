-- ========================================
-- LIMPIEZA FINAL DE USUARIOS TEST
-- ========================================
-- Ejecutar en Supabase SQL Editor

-- PASO 1: Ver usuarios que vamos a borrar (verificación)
SELECT id, email, created_at 
FROM auth.users 
WHERE email IN ('testuser@gmail.com', 'testuser@diktalo.com');

-- PASO 2: Borrar perfiles primero (por foreign key constraint)
DELETE FROM public.profiles
WHERE email IN ('testuser@gmail.com', 'testuser@diktalo.com');

-- PASO 3: Borrar de auth.users
-- NOTA: Esto requiere privilegios especiales
-- Si falla, necesitarás usar la API admin de Supabase

-- Alternativa: Usar función de Supabase
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN 
    SELECT id FROM auth.users 
    WHERE email IN ('testuser@gmail.com', 'testuser@diktalo.com')
  LOOP
    -- Esto debería funcionar si tienes service_role
    DELETE FROM auth.users WHERE id = user_record.id;
  END LOOP;
END $$;

-- ========================================
-- VERIFICACIÓN
-- ========================================

-- Verificar que se borraron
SELECT COUNT(*) as remaining_test_users
FROM auth.users 
WHERE email IN ('testuser@gmail.com', 'testuser@diktalo.com');
-- Debe devolver: 0

-- Ver usuarios finales
SELECT email, first_name, last_name, role
FROM profiles
ORDER BY created_at;
-- Debe mostrar solo: Diego, Raul, Nati

-- Verificar conteos finales
SELECT 
  (SELECT COUNT(*) FROM auth.users) as auth_users,
  (SELECT COUNT(*) FROM profiles) as profiles,
  (SELECT COUNT(*) FROM auth.users au LEFT JOIN profiles p ON au.id = p.id WHERE p.id IS NULL) as missing;
-- Debe mostrar: 3, 3, 0
