-- ========================================
-- DIAGNÓSTICO COMPLETO - DIKTALO
-- Copia y pega TODO esto en tu Supabase SQL Editor
-- ========================================

-- 1. ¿Existen los índices necesarios?
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'recordings';

-- 2. ¿Cuántas grabaciones hay EN TOTAL y por usuario?
SELECT 
    'Total de grabaciones' as descripcion,
    count(*) as cantidad
FROM recordings
UNION ALL
SELECT 
    'Usuarios con grabaciones',
    count(DISTINCT user_id)
FROM recordings;

-- 3. ¿Cuál es el tamaño de los datos JSONB más grandes?
SELECT 
    id,
    title,
    pg_column_size(segments) as segments_bytes,
    pg_column_size(notes) as notes_bytes,
    pg_column_size(media) as media_bytes,
    created_at
FROM recordings
ORDER BY pg_column_size(segments) DESC
LIMIT 5;

-- 4. ¿Hay grabaciones con descripción muy grande?
SELECT 
    id,
    title,
    length(description) as description_length,
    created_at
FROM recordings
WHERE length(description) > 10000
ORDER BY length(description) DESC
LIMIT 5;

-- 5. Verifica las políticas RLS actuales
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'recordings';

-- 6. PRUEBA SIMPLE: ¿Puedo obtener solo IDs sin filtro de usuario?
-- (Esto verifica si el problema es específico de RLS)
SELECT id, created_at 
FROM recordings 
ORDER BY created_at DESC 
LIMIT 10;

-- ========================================
-- FIXES INMEDIATOS (ejecutar si el diagnóstico muestra problemas)
-- ========================================

-- FIX A: Crear índices compuestos (solo si NO existen según diagnóstico #1)
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recordings_user_created 
-- ON recordings(user_id, created_at DESC);

-- FIX B: Optimizar RLS (solo si ves problemas en diagnóstico #5)
-- DROP POLICY IF EXISTS "Users can CRUD own recordings" ON recordings;
-- CREATE POLICY "Users can CRUD own recordings"
-- ON recordings FOR ALL
-- TO authenticated
-- USING (user_id = auth.uid())
-- WITH CHECK (user_id = auth.uid());
