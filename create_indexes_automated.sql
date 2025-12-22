-- SCRIPT DE VERIFICACIÓN Y CREACIÓN DE ÍNDICES
-- Este script primero verifica y luego crea los índices necesarios

-- 1. VERIFICAR ÍNDICES ACTUALES
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'recordings'
ORDER BY indexname;

-- 2. CREAR ÍNDICE COMPUESTO (si no existe)
-- CONCURRENTLY evita bloquear la tabla durante la creación
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_recordings_user_created'
    ) THEN
        CREATE INDEX CONCURRENTLY idx_recordings_user_created 
        ON recordings(user_id, created_at DESC);
        RAISE NOTICE 'Índice idx_recordings_user_created creado exitosamente';
    ELSE
        RAISE NOTICE 'Índice idx_recordings_user_created ya existe';
    END IF;
END $$;

-- 3. CREAR ÍNDICE EN FOLDER_ID (si no existe)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_recordings_folder_id'
    ) THEN
        CREATE INDEX CONCURRENTLY idx_recordings_folder_id 
        ON recordings(folder_id);
        RAISE NOTICE 'Índice idx_recordings_folder_id creado exitosamente';
    ELSE
        RAISE NOTICE 'Índice idx_recordings_folder_id ya existe';
    END IF;
END $$;

-- 4. VERIFICAR CREACIÓN EXITOSA
SELECT 
    indexname,
    indexdef,
    tablename
FROM pg_indexes
WHERE tablename = 'recordings'
ORDER BY indexname;

-- 5. MOSTRAR ESTADÍSTICAS DE LA TABLA
SELECT 
    schemaname,
    tablename,
    n_tup_ins as inserciones,
    n_tup_upd as actualizaciones,
    n_tup_del as eliminaciones,
    n_live_tup as filas_activas,
    n_dead_tup as filas_muertas,
    last_vacuum,
    last_autovacuum,
    last_analyze,
    last_autoanalyze
FROM pg_stat_user_tables
WHERE tablename = 'recordings';
