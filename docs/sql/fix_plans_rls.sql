-- =============================================================================
-- FIX RLS POLICIES FOR PLANS_CONFIGURATION (CORREGIDO - IDEMPOTENTE)
-- =============================================================================
-- Objetivo: Solucionar el error "permission denied" y evitar "policy already exists".
-- =============================================================================

-- 1. ASEGURAR QUE LA FUNCIÓN is_admin() EXISTE Y ES SEGURA
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() 
    AND (role = 'admin' OR role = 'super_admin' OR role = 'Administrator')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. RESETEAR POLÍTICAS EN plans_configuration
ALTER TABLE public.plans_configuration ENABLE ROW LEVEL SECURITY;

-- IMPORTANTE: Eliminar TODAS las posibles políticas existentes para evitar errores de duplicados
DROP POLICY IF EXISTS "Enable read access for all users" ON public.plans_configuration;
DROP POLICY IF EXISTS "Enable update for admins" ON public.plans_configuration;
DROP POLICY IF EXISTS "Allow public read" ON public.plans_configuration;
DROP POLICY IF EXISTS "Allow admin update" ON public.plans_configuration;
DROP POLICY IF EXISTS "plans_configuration_read_policy" ON public.plans_configuration;
DROP POLICY IF EXISTS "plans_configuration_update_policy" ON public.plans_configuration;
-- Eliminar también las políticas que vamos a crear a continuación (por si ya existen)
DROP POLICY IF EXISTS "Public Read Access" ON public.plans_configuration;
DROP POLICY IF EXISTS "Admin Update Access" ON public.plans_configuration;
DROP POLICY IF EXISTS "Admin Insert Access" ON public.plans_configuration;


-- 3. CREAR NUEVAS POLÍTICAS LIMPIAS

-- A) LECTURA PÚBLICA (Para Landing Page + App)
-- Todo el mundo (autenticado o anónimo) debe poder ver los precios.
CREATE POLICY "Public Read Access"
ON public.plans_configuration
FOR SELECT
USING (true);

-- B) ACTUALIZACIÓN SOLO ADMINS
-- Usamos la función is_admin() que es segura y no toca auth.users directamente.
CREATE POLICY "Admin Update Access"
ON public.plans_configuration
FOR UPDATE
USING (is_admin());

-- C) INSERCIÓN (Opcional)
CREATE POLICY "Admin Insert Access"
ON public.plans_configuration
FOR INSERT
WITH CHECK (is_admin());

-- 4. REPETIR PARA app_settings 
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Settings" ON public.app_settings;
DROP POLICY IF EXISTS "Admin Update Settings" ON public.app_settings;
-- Limpieza extra
DROP POLICY IF EXISTS "Enable read access for all users" ON public.app_settings;
DROP POLICY IF EXISTS "Enable update for admins" ON public.app_settings;

CREATE POLICY "Public Read Settings"
ON public.app_settings
FOR SELECT
USING (true);

CREATE POLICY "Admin Update Settings"
ON public.app_settings
FOR UPDATE
USING (is_admin());

-- 5. PERMISOS GRANT (Asegurar acceso a nivel de usuario DB)
GRANT SELECT ON public.plans_configuration TO anon;
GRANT SELECT ON public.plans_configuration TO authenticated;
GRANT UPDATE, INSERT ON public.plans_configuration TO authenticated;

GRANT SELECT ON public.app_settings TO anon;
GRANT SELECT ON public.app_settings TO authenticated;
GRANT UPDATE, INSERT ON public.app_settings TO authenticated;
