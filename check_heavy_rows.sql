-- check_heavy_rows.sql
-- ESTE SCRIPT ES PARA DETECTAR "BALLENAS DE DATOS" QUE CONSUMEN TU ANCHO DE BANDA
-- Ejecútalo en el SQL Editor de Supabase cuando tengas acceso.

/*
  OBJETIVO:
  Identificar grabaciones individuales que pesen más de 500KB.
  Normalmente una grabación (metadata) debería pesar < 5KB.
  
  Si ves filas > 100KB o 1MB, esas son las culpables del consumo masivo.
*/

WITH recording_sizes AS (
    SELECT 
        id,
        title,
        created_at,
        pg_column_size(segments) as segments_size,
        pg_column_size(notes) as notes_size,
        pg_column_size(media) as media_size,
        pg_column_size(audio_url) as audio_url_size,
        -- Total size estimate
        (COALESCE(pg_column_size(segments), 0) + 
         COALESCE(pg_column_size(notes), 0) + 
         COALESCE(pg_column_size(media), 0) + 
         COALESCE(pg_column_size(audio_url), 0)) as total_bytes
    FROM recordings
)
SELECT 
    id,
    title,
    created_at,
    pg_size_pretty(total_bytes) as formatted_size,
    total_bytes,
    CASE 
        WHEN total_bytes > 1000000 THEN 'CRITICAL (Mb scale)'
        WHEN total_bytes > 100000 THEN 'WARNING (Large)'
        ELSE 'OK' 
    END as status
FROM recording_sizes
WHERE total_bytes > 50000 -- Mostrar solo las que pesan más de 50KB
ORDER BY total_bytes DESC
LIMIT 50;
