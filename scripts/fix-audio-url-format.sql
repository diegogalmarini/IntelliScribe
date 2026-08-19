-- scripts/fix-audio-url-format.sql
--
-- Normaliza las filas históricas de `recordings.audio_url` que guardan una URL
-- absoluta en lugar de la ruta relativa dentro del bucket.
--
-- Origen del problema: api/recording-callback.ts guardaba
--   https://<ref>.supabase.co/storage/v1/object/public/recordings/<userId>/<sid>.mp3
-- mientras api/upload-audio.ts guardaba
--   <userId>/<fichero>
--
-- Consecuencias de la forma absoluta:
--   1. El bucket `recordings` es privado, así que esa URL devuelve 400: las
--      grabaciones telefónicas afectadas NO se pueden reproducir hoy.
--      services/storageService.ts llama a createSignedUrl(), que espera ruta
--      relativa.
--   2. api/cron-cleanup-free.ts hace storage.remove([audio_url]). Con una URL
--      absoluta no coincide con ninguna clave, Supabase no devuelve error, y el
--      código ponía audio_url a null igualmente: se perdía la referencia y el
--      fichero seguía ocupando espacio.
--
-- El código ya está corregido (guarda ruta relativa y normaliza de forma
-- defensiva antes de borrar). Esto arregla lo ya almacenado.
--
-- ⚠️ PROYECTO: ejecutar en `qnvzofpdrfzchsegooic` (Diktalo V2), que es el que
-- usa producción. Verificar que aparece en la URL del dashboard.
--
-- ⚠️ SIN COPIA DE SEGURIDAD: en plan Free, Supabase no hace backups
-- automáticos. La transformación es reversible por construcción —se puede
-- reconstruir la URL absoluta a partir de la ruta—, pero conviene exportar el
-- resultado del PASO 1 antes de ejecutar el PASO 2.

-- ---------------------------------------------------------------------------
-- PASO 1 — Previsualización. No modifica nada.
-- ---------------------------------------------------------------------------
-- Revisar que `ruta_nueva` tiene la forma <uuid>/<fichero> en todas las filas.
-- Si alguna sale con `revisar_a_mano`, no ejecutar el paso 2 sin mirarla.
select
    id,
    audio_url as valor_actual,
    case
        when position('/recordings/' in audio_url) > 0
            then split_part(
                     replace(
                         substring(audio_url from position('/recordings/' in audio_url) + 12),
                         '%2F', '/'
                     ),
                     '?', 1
                 )
        else null
    end as ruta_nueva,
    case
        when position('/recordings/' in audio_url) = 0 then 'revisar_a_mano'
        when split_part(
                 substring(audio_url from position('/recordings/' in audio_url) + 12), '?', 1
             ) !~ '^[0-9a-f-]{36}/.+' then 'revisar_a_mano'
        else 'ok'
    end as veredicto
  from public.recordings
 where audio_url like 'http%'
 order by veredicto desc, id;


-- ---------------------------------------------------------------------------
-- PASO 2 — Aplicar. Solo tras revisar que el paso 1 no deja 'revisar_a_mano'.
-- ---------------------------------------------------------------------------
-- Idempotente: la condición `like 'http%'` deja de cumplirse tras la primera
-- ejecución, así que volver a lanzarlo no hace nada.
update public.recordings
   set audio_url = split_part(
                       replace(
                           substring(audio_url from position('/recordings/' in audio_url) + 12),
                           '%2F', '/'
                       ),
                       '?', 1
                   )
 where audio_url like 'http%'
   and position('/recordings/' in audio_url) > 0
   and split_part(
           substring(audio_url from position('/recordings/' in audio_url) + 12), '?', 1
       ) ~ '^[0-9a-f-]{36}/.+';


-- ---------------------------------------------------------------------------
-- PASO 3 — Verificación. Debe quedar solo 'ruta_relativa' y 'null'.
-- ---------------------------------------------------------------------------
select case
           when audio_url is null      then 'null'
           when audio_url like 'http%' then 'url_absoluta'
           else 'ruta_relativa'
       end as formato,
       count(*) as filas
  from public.recordings
 group by 1
 order by 2 desc;


-- ---------------------------------------------------------------------------
-- PASO 4 — Comprobar que los ficheros existen de verdad en Storage.
-- ---------------------------------------------------------------------------
-- Cruza las rutas ya normalizadas con storage.objects. Si alguna sale en
-- `falta_en_storage`, esa grabación tiene registro pero no fichero: la ruta era
-- incorrecta desde el principio o el objeto se borró.
select r.id,
       r.audio_url,
       case when o.name is null then 'falta_en_storage' else 'ok' end as estado
  from public.recordings r
  left join storage.objects o
         on o.bucket_id = 'recordings'
        and o.name = r.audio_url
 where r.audio_url is not null
 order by estado desc, r.id
 limit 200;
