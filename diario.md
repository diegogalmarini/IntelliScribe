# Diario de Desarrollo — Diktalo

> Bitácora técnica viva del proyecto. Cada decisión, cada feature, cada bug resuelto.
> Actualizado: 25 agosto 2026
>
> ⚠️ **Advertencia:** Este documento es contexto vivo, no spec de implementación. Validar siempre contra:
> 1. El código real en `/api/`, `/services/`, `/pages/`
> 2. `.agent/skills/` para estándares de IA y proceso
> 3. `AGENTS.md` para reglas invariables del proyecto
>
> 📌 **Estado actual resumido (2026-08-25):**
> Último hito documentado: 25 agosto 2026 (parpadeo de GPU resuelto, consentimiento real de cookies, techo de 75 min en YouTube, Limpia/Literal en audio subido, typecheck a cero).
> En curso: ver entrada más reciente.
> Brújula de metodología: `AGENTS.md` + `CLAUDE.md`. Historial por fases: `docs/DEVELOPMENT_LOG.md`.

---

## Registro 2026-08-25 (2) — Auditoría del newsroom y adiós a Make: LinkedIn y X en directo

**Qué se hizo:**

**1. Diagnóstico de por qué murió la distribución social.**
El escenario de Make estaba Inactive con 14 artículos en cola (~5 semanas sin
publicar, desde finales de julio). Make desactiva escenarios tras errores
consecutivos; las pistas apuntan al ciclo OAuth de X (refresh tokens de un solo
uso: una ejecución fallida a mitad rompe la cadena para siempre) y/o al token
de LinkedIn de 60 días. NO reactivar el escenario sin vaciar la cola: soltaría
14 posts de golpe.

**2. Auditoría del newsroom (79 artículos publicados, 46 keywords pendientes):**
- El bot podía tumbar todos los deploys: `blogData.ts` está en `utils/`, dentro
  del gate de tipos del build, y el workflow hacía push sin typecheck. Ahora
  `npx tsc --noEmit` corre ANTES del commit del bot.
- Modelo de artículos `gemini-2.5-flash` → `gemini-3.7-flash` (el mismo del
  chat; a 12 artículos/mes el coste es irrelevante, manda la prosa).
- El CSV mezcla artículos y landings comerciales: la siguiente keyword en cola
  era `/transcripcion-reuniones` (landing) y se habría quemado como blog post.
  Ahora el parser solo consume filas `/blog/...`.
- Slug drift: el prompt permitía "close variant" del slug; si el modelo se
  desviaba, la keyword nunca se marcaba publicada → duplicados. El slug ahora
  lo fija el CSV.
- Los 77 artículos del bot no llevaban JSON-LD aunque `Blog.tsx` lo renderiza.
  Ahora se genera schema BlogPosting determinísticamente (sin llamada IA).
- `npm install` → `npm ci` en CI.

**3. Publicación directa en LinkedIn y X, sin Make (`scripts/social_publish.ts`).**
- Nuevo paso del workflow DESPUÉS del push (espera a que la URL responda).
- LinkedIn: página de empresa vía Community Management API (refresh token de
  365 días como secret; el access de 60 días se renueva en cada run;
  reautorización manual 1 vez/año con `scripts/linkedin_auth.ts`).
- X: OAuth 1.0a con 4 secrets estáticos que NO caducan — elimina de raíz la
  rotación de refresh tokens que mató a Make. Librería `twitter-api-v2`.
  El tweet es un campo nuevo del JSON del newsroom (máx 200 chars + URL).
- Una red sin secrets se omite con aviso (cero regresión hasta configurar);
  una red configurada que falla pone el run en rojo (visibilidad, lo que Make
  nunca dio). Modo `--slug` para backfill de los 14 artículos perdidos.
- Handoff entre pasos por `.newsroom-social.json` (gitignored).

**Por qué:** el usuario quiere captación por contenido en ambas redes y Make
llevaba un mes caído en silencio. Menos servicios externos, fallos visibles.

**Pendiente / siguiente:**
- USUARIO: crear la app de LinkedIn (developers.linkedin.com, producto
  Community Management API, redirect http://localhost:8888/callback) y la de X
  (developer.x.com, tier Free, permisos Read+Write, keys OAuth 1.0a de la
  cuenta de marca). Cargar los 8 secrets en GitHub Actions.
- Tras los secrets: probar con `npx tsx scripts/social_publish.ts --slug <x>`
  y backfill gradual de los mejores artículos de la cola muerta.
- Desactivar/borrar el escenario de Make y su webhook cuando lo nuevo ruede.
- La "biblia" de modelos (`optimizing-gemini-models/SKILL.md`) sigue citando
  la serie 3.1 como frontier — refrescarla.

---

## Registro 2026-08-25 — Parpadeo de GPU, consentimiento real, techo de YouTube y typecheck a cero

**Qué se hizo:**

**1. El parpadeo/pantalla negra en la sección azul del CTA era la GPU, no React.**
El detalle clave lo dio el usuario: pasaba también en incógnito, donde el banner
de cookies siempre está visible. El banner y la navbar usaban `backdrop-blur-xl`
flotando sobre contenido saturado, y las barras del waveform de Insights animaban
`height` en bucle infinito (layout thrash continuo). Combinado, tumbaba el driver
gráfico hasta el punto de tener que suspender el equipo. Arreglo: fondos sólidos
en banner y navbar (`bg-white/95` + `transition-colors`), waveform a `scaleY`
(solo compositor) y el glow de Solutions contenido a `inset-0` — que además era
el único overflow horizontal de la página.

**2. Privacidad de la landing: nada de terceros antes del consentimiento.**
- Inter dejó de venir de Google Fonts: autoalojada en `/fonts/` (woff2 variable,
  latin + latin-ext, 130 KB), fuera los preconnect a googleapis/gstatic.
- El script de afiliados de Lemon Squeezy ya no va estático en `index.html`:
  `applyConsent()` lo inyecta solo si el usuario acepta cookies funcionales.
- El vídeo del Hero pasa a `youtube-nocookie.com`.
- Borradas 6 imágenes muertas de `public/images` (3,4 MB) y el acordeón del FAQ
  gana `aria-expanded` + anillo de foco visible.

**3. Techo real de YouTube, medido con un vídeo de 90 minutos.**
No es el tiempo de pared (182 s contra los 300 de la función): es la SALIDA del
modelo. Una clase densa de 90 min agotó los 65.520 tokens de salida
(finishReason MAX_TOKENS) y el JSON llegó truncado con 0 segmentos parseables.
A ~730 tokens/min de habla densa, el tope queda en 75 minutos: pre-check en
`transcribe-youtube` (400 `VIDEO_OVER_MAX_LENGTH`) y detección de truncado
(422 `TRANSCRIPT_TRUNCATED`) ANTES de parsear y antes de cobrar minutos.
Documentado en el manual ES/EN.

**4. Limpia/Literal también para audio subido.**
Selector nuevo en Ajustes (por defecto Literal: actas y registros con valor
probatorio). Se persiste SOLO en localStorage: mapear una columna inexistente en
`profiles` haría 400 el PATCH entero (trampa PostgREST ya conocida). El modo
viaja como 5º parámetro de `transcribeAudio` desde los 5 call sites; el
multi-audio se queda en literal a propósito (los timestamps reparten hablantes).

**5. El chat pasa a `gemini-3.7-flash` (4,1× más barato).**
El RAG hace el trabajo pesado; el modelo solo redacta sobre chunks ya
recuperados. ~$0,0039/pregunta. Nota de reversión en `api/_utils/gemini.ts`.

**6. Typecheck completo de la app: 38 errores → 0.**
Los que escondían bugs reales: TemplateGallery renderizaba objetos `{es,en}`
crudos en la galería de plantillas; el código inline del manual salía con
estilo de bloque (react-markdown v10 eliminó la prop `inline`); el deep-link
`/settings` nunca abría el modal de ajustes; InlineEditor usaba un estado
inexistente y estados fuera del union de `Recording`. `RecordingCard` era
código muerto y se eliminó. El typecheck completo sigue siendo informativo
(solo `tsconfig.api.json` bloquea el build), pero ya está en verde.

**Por qué:** todo era la lista diferida que el usuario autorizó en bloque el
24-25 de agosto, con el parpadeo como prioridad por hacer el equipo inutilizable.

**Pendiente / siguiente:**
- Usuario: confirmar que el parpadeo desapareció tras el deploy, y la prueba
  multi-voz pendiente (valida flash-lite en diarización).
- Ticket de Supabase Pro sigue sin respuesta.
- Opcional: convertir el typecheck completo en bloqueante ahora que está a cero
  (meterlo también en el workflow del newsroom antes del commit del bot).

---

## Registro 2026-08-24 — Cobro real de cuota, dieta de la PWA y adiós a la fuente de iconos

**Qué se hizo:**

**1. El cobro de minutos no funcionaba, en ninguna de las dos monedas.**
- Audio: `databaseService.incrementUsage` existía y llamaba a la RPC correcta,
  pero un grep devolvía CERO llamantes; un comentario afirmaba que "lo llama el
  editor" y no era verdad. `App.tsx` solo tocaba el estado de React, así que la
  cuota no se aplicaba entre sesiones. Ahora se cobra en `createRecording`, el
  único punto por el que pasan las tres rutas de cliente. YouTube pasa
  `yaCobrado: true` porque ya cobra en servidor.
- Llamadas: `call_limit` (300 min en Business+) se mostraba en el sidebar pero
  nadie incrementaba `call_minutes_used`, y cada llamada quemaba créditos
  comprados desde el primer minuto. RPC nueva `consume_call_minutes` con
  prioridad plan → créditos; los minutos del plan solo cubren multiplicador 1
  (zona estándar), que es lo que promete la landing. Aplicada en producción y
  probada por REST.
- El contador del sidebar se refresca en local vía `onUsageCharged`; no puede ir
  por `handleUpdateUser` porque `minutes_used` es columna protegida por el
  trigger anti-escalada.

**2. La PWA pesaba 58,8 MB y por eso los despliegues no llegaban.**
`globPatterns` incluía `png` y `svg`: precacheaba todas las imágenes del build.
Hasta terminar ese precache el service worker nuevo no activa, así que los
usuarios seguían viendo el bundle anterior — falseó nuestra verificación cuatro
veces. Ahora solo se precachea el esqueleto (js/css/html): 131 entradas →
33, 58.882 KiB → 4.641 KiB. Y los cuatro iconos PWA eran el MISMO fichero de
1024×1024 renombrado: favicon de 982 KB → 8,5 KB, total de iconos 1.999 KB →
264 KB. Verificado que `index.html` sigue precacheado y el `navigateFallback`
intacto, o el modo offline se habría roto en silencio.

**3. Lote de la auditoría de la landing (56 hallazgos, verificados y refutados
por workflow adversarial).**
- La familia entera de `.landing-page h1..h5/p/a/li` tenía especificidad (0,1,1)
  y le ganaba a cualquier utilidad de Tailwind, incluidas `md:`/`lg:`: la
  tipografía no escalaba en ningún tamaño. Envueltas en `:where()` → (0,0,1):
  gana al reset (va después en el fichero) y pierde contra utilidades. NO se usó
  `:where(.landing-page h2)` porque (0,0,0) perdería contra el propio reset y
  seis superficies (legales, About, Afiliados, Roadmap) se quedarían sin
  tipografía. Verificado con comparación controlada contra producción.
- Solutions estaba medio sin traducir y con el idioma invertido por ficha; 28
  claves nuevas y cero literales.
- Los 57 avatares de testimonios se pedían a xsgames.co (IP de cada visitante a
  un tercero no listado como subprocesador). Locales, redimensionados a 96×96:
  2,2 MB → 147 KB.
- Las 14 Suisse se servían desde el CDN de Webflow DE OTRO PROYECTO: si esa
  cuenta muere, la tipografía entera desaparece. Locales en `public/fonts/`.
- Restos de i18n (Pricing, Testimonials, Navbar, footer), el eyebrow del FAQ que
  duplicaba el título, `insightsAiAnalysis` en castellano dentro del bloque EN,
  el ancla `/#features` que apuntaba al vacío, ids duplicados
  `solutions`/`pricing`, el mockup de Insights recortado (aspect-video con
  contenido fijo: 84 px cortados medidos a 1100 px), y accesibilidad básica
  (switch del toggle de precios, logos como enlace/botón, aria-expanded del
  menú móvil, el enlace a X que se anunciaba "share").

**4. Crons de negocio: los dos activos por fin.**
`cron-reset-usage` a las 03:00 y `cron-cleanup-free` a las 03:30 con retención
subida de 7 a 30 días — con 7, el primer disparo habría borrado 17 audios de 19
usuarios beta sin aviso. FAQ y ajustes pasan a decir 30 para no prometer una
cosa y hacer otra.

**5. Los 189 usos de Material Symbols migrados a lucide y la fuente retirada.**
Componente puente `components/ui/MSymbol.tsx` con el mapa de 115 nombres,
verificado contra los exports reales de lucide-react ANTES de escribir nada.
183 por script (tamaño derivado del font-size), 6 a mano. El typecheck cazó
tres fallos del propio script (imports dentro de un import multilínea, un
className duplicado). Verificado en navegador: 0 ligaduras, 71 SVG en la
landing, estrellas rellenas, consola limpia. Un nombre futuro sin mapear pinta
interrogante y avisa, en vez del fallo silencioso de la ligadura.

**Qué queda pendiente:**

- **Diego: probar la diarización** con una grabación de varias voces (valida el
  cambio a flash-lite, 3,8× más barato). Si mezcla hablantes, revertir es una
  línea en `api/_utils/gemini.ts`.
- **Diego: limpiar Vercel** (borrar `STRIPE_*`, marcar secretos Sensitive) y el
  ticket del plan Pro de Supabase.
- Menores diferidos: Google Fonts (Inter) bloquea el render y carga antes del
  consentimiento; el script de afiliados de Lemon Squeezy también; el embed del
  Hero usa youtube.com con cookies (el de la ficha de grabación ya usa
  nocookie); imágenes muertas en `public/images`; el foco del acordeón del FAQ;
  los 38 errores de TS preexistentes fuera del gate de `api/`.
- Medir el techo de duración de YouTube con un vídeo de 1–2 h antes de
  anunciarlo; valorar extender el selector Limpia/Literal al audio subido (con
  Literal por defecto ahí).

---

## Registro 2026-08-23 — Transcripción de vídeo de YouTube, y documentarla

**Qué se hizo:**

Función nueva completa —transcribir un vídeo de YouTube pegando su URL— más los
arreglos de interfaz que salieron al usarla.

**Por qué solo YouTube, y por qué eso no es una limitación técnica.**
Gemini ingiere una URL de YouTube de forma nativa vía `fileData.fileUri`: es
Google procesando su propia plataforma. Diktalo nunca descarga ni aloja el
vídeo, así que no hay que tocar el ToS de nadie. Para Vimeo o Loom habría que
descargar el fichero, y eso sí viola sus términos. Esas irían por integración
oficial con OAuth o no van.

**Medido antes de escribir código.** Con `fps: 0.1` en vez del valor por
defecto, el gasto baja 2,9× sin perder transcripción, porque para transcribir
manda el audio y no los fotogramas. Dos vídeos, 19 s y 1299 s: 31,84 y 31,59
tokens/s. Sale a **$0,0112 por hora de vídeo**, prácticamente lo mismo que
transcribir el audio equivalente ($0,0115).

Esa tasa estable permitió derivar la duración del contador de tokens de la
propia API cuando no hay Data API. Se prefiere eso a la última marca de tiempo
del transcript: en el vídeo de 1299 s reales, el modelo cerró en 1314 s (1,15 %
de más) mientras los tokens daban 1303 s (0,31 %).

**Tope duro de duración.** Con la YouTube Data API v3 se consulta la duración
real antes de gastar un token, y se rechaza lo que no quepa en los minutos del
usuario. Degrada limpiamente si la API no responde. Aviso para el futuro:
habilitar la API en el proyecto de Google Cloud NO basta, hay que permitirla
también en las restricciones de la clave; el 403 dice "blocked" en vez de "has
not been used", y esa palabra es la que distingue un caso del otro. Como la
Gemini API exige vinculación a cuenta de servicio y no convive con otras en la
misma clave, se creó una `YOUTUBE_API_KEY` aparte, de mínimo privilegio.

**Estilo de transcripción.** Una transcripción traducida NO puede ser literal:
al traducir deja de ser verbatim. Pedir "literal + traducido", que es lo que
hacía el prompt, producía inglés hablado calcado al español. Se añaden dos modos
en una sola pasada, con 'clean' por defecto en vídeo, y el idioma de salida se
elige por vídeo. Esto además ahorra una llamada entera: el flujo anterior
transcribía literal y luego aplicaba la plantilla "Transcripción Literal
(Limpia)" encima.

El modo se guarda en `Recording.metadata` y las limpias llevan distintivo
visible. Diktalo se usa para actas legales y notas médicas: un texto editado por
un modelo no puede presentarse como verbatim sin dejar constancia.

**Plantillas.** Filtro "Vídeo" implementado como bandera transversal
`videoReady` y no como categoría nueva, porque `category` es única y marcar
"Resumen Adaptativo" como Vídeo lo sacaría de General. Once plantillas en el
filtro: seis existentes marcadas y cinco escritas para vídeo (Tutorial paso a
paso, Ficha de competidor, Referencias y datos citados, Preguntas y respuestas,
Guion para redes). Las cinco llevan restricción anti-invención explícita: el
vídeo técnico trae comandos y cifras que el modelo tiende a completar de memoria.

**Arreglos de interfaz que salieron de usarlo:**
- La ficha decía "Audio no disponible" en grabaciones que no tienen audio a
  propósito. Ahora muestra el vídeo incrustado con `youtube-nocookie`.
- Con un solo interlocutor se repetía su nombre en cada párrafo, convirtiendo un
  monólogo en falso diálogo. Se corrige en el pintado, así que arregla también
  los resúmenes ya guardados sin regenerar.
- Los resúmenes abrían con "Aquí tienes la transcripción corregida:" y esa línea
  se guardaba dentro. Reglas de salida añadidas al prompt de `summary`, aplican
  a las 60 plantillas.
- Botón + fijo en la cabecera del sidebar: grabar, subir, multi-audio y YouTube
  solo existían en el estado vacío, que desaparece al seleccionar una grabación.

**Documentación.** Se documentó en las cuatro superficies: página nueva del
manual en ES y EN registrada en `ManualViewer`, seis entradas en `FAQ.md`, cinco
intents nuevos en `api/_data/knowledge-base.json` para que el bot de soporte
sepa responder, y enlace en la columna "Métodos de Grabación" del footer.

**Qué queda pendiente:**

- **Medir el techo de duración.** Un vídeo de 22 min tardó 32 s con
  `maxDuration: 300`. Uno de dos horas podría acercarse al límite y no se ha
  medido.
- **El cobro de minutos del audio subido sigue roto.** `App.tsx:544` actualiza
  `minutesUsed` solo en el estado de React y `databaseService.incrementUsage` no
  lo llama nadie: los minutos no se persisten. La ruta de YouTube sí cobra, en
  servidor. Va en su propio arreglo.
- El precache de 58,8 MB del service worker hace que los despliegues no lleguen
  a los usuarios sin recarga forzada. Ha despistado la verificación cuatro veces
  en esta sesión.
- Sigue pendiente el cron `cron-cleanup-free` (17 audios de 19 usuarios free) y
  la familia de selectores `.landing-page` con especificidad (0,1,1).

---

## Registro 2026-08-20 — Sidebar en árbol, multi-audio, coste de modelos y chunks caducados

**Qué se hizo:**

Sesión larga con cinco frentes. Todo desplegado a producción y verificado contra
el sitio vivo, no solo en local.

**1. Vigilante de modelos, y el criterio corregido.**
El criterio de selección NO es "el modelo más nuevo" sino **el más barato que
cumpla los requisitos reales de cada tarea**, porque el coste real es precio ×
perfil de carga, no precio por token. Transcribir mueve mucha entrada (audio) y
poca salida, y no razona: manda el precio de ENTRADA. Chatear sí razona y ahí la
calidad se paga. `scripts/model-watch.ts` modela ese perfil por acción y avisa
cuando se está pagando de más. Pasa de semanal a **diario**.

Dos fallos del propio vigilante, encontrados al pasarlo por su propia prueba:
proponía `gemini-embedding-001` para chatear (es el más barato por token y no
puede generar texto), y el paso de CI leía `$?` después de un pipe a `tee`, con
lo que capturaba el código de `tee` y **jamás habría abierto una incidencia**.

Transcripción pasa a `gemini-3.1-flash-lite-preview`: $0,0155 por hora de audio
frente a $0,0596, **3,8× menos**. Verificado contra la API que acepta audio
inline, no solo que aparezca en el catálogo. El riesgo a vigilar no es la
precisión de las palabras sino la **diarización** en grabaciones de varias voces.
Para revertir: `gemini-3.7-flash` en `api/_utils/gemini.ts`.

**2. Sidebar: de dos listas planas a un árbol.**
Había dos listas independientes —carpetas arriba como filtro, grabaciones
abajo—, así que una grabación nunca aparecía dentro de su proyecto. Ahora es un
árbol con un solo contenedor con scroll. Se conserva el id `folder-list-section`
porque lo consumen `WelcomeTour` y las acciones de resalte del asistente.

Bugs arreglados por el camino: `databaseService` escribía `''` en `folder_id`,
que es una columna `uuid`, así que mover a "sin proyecto" fallaba siempre y
revertía al recargar; el buscador del sidebar móvil era inerte porque
`onOpenSearch` solo se pasaba en escritorio; `'ALL'` y `null` convivían como
centinela y el resaltado comparaba contra uno solo; el orden de proyectos se
calculaba sobre la lista ya filtrada y se reordenaba bajo el cursor; una fecha
inválida metía `NaN` en el orden; las carpetas de sistema se ocultaban por
**nombre traducido**, así que un proyecto llamado "Favoritos" desaparecía; y
había un `<button>` dentro de otro `<button>`.

La revisión adversarial encontró **tres fallos que introdujo el propio
rediseño**: al quitar la fila "Todas las grabaciones" no quedaba forma de volver
a `'ALL'` (y como ese valor es también la carpeta destino de lo que se graba,
las grabaciones nuevas caían en el último proyecto pulsado, en silencio); el
efecto de auto-desplegar dependía del array `recordings`, cuya identidad cambia
en cada `setRecordings`, y reabría lo que el usuario acababa de cerrar; y el
dashboard monta el sidebar dos veces sin desmontar ninguna, con lo que las dos
instancias se pisaban la clave de `localStorage`.

**3. Multi-audio: atribución de hablante.**
Cada fichero lleva su hablante asignado a mano en el uploader, pero esa certeza
se tiraba y el hablante se deducía de las marcas de tiempo del modelo.
Verificado en banco de pruebas con ficheros sintéticos de 48/44,1/16 kHz, mono y
estéreo: `segmentOffsets` tenía 5 entradas para 3 ficheros con las dos últimas
duplicadas, así que un segmento fechado al final indexaba `files[4]` y reventaba
la importación entera; y con el primer fichero estéreo y otro mono,
`getChannelData(1)` lanzaba `IndexSizeError`.

La causa de la mala atribución era otra: los audios se pegaban **sin ninguna
costura**, el modelo devolvía un único segmento cruzando la frontera entre dos
hablantes y se atribuía entero al anterior por su marca de inicio. Se inserta
silencio de 0,6 s entre ficheros.

**Hipótesis descartada, anotada para que no vuelva:** se sospechó que mezclar
frecuencias de muestreo desplazaba la línea de tiempo. **No es así** —
`decodeAudioData` remuestrea todo a la del `AudioContext`, así que el mapeo ya
era correcto para segmentos dentro de rango.

**4. Chunks caducados: la causa de `Failed to fetch dynamically imported module`.**
`DIKTALO-2Q` llevaba tres semanas abierto. No era la red del usuario: la regla
comodín de `vercel.json` se aplicaba también a `/assets/`, así que un chunk
retirado por un despliegue devolvía **200 con `index.html`** en vez de 404, y el
navegador reventaba al parsear HTML como módulo ES. Comprobado por
`content-type`: los tres ficheros de los eventos devolvían `text/html` de 2575
bytes. Arreglado en `vercel.json` (404 real) y con `lib/lazyWithReload.ts`, que
recarga una vez por sesión para rescatar la pestaña vieja, con guarda contra
bucle.

`DIKTALO-2R/2S` (`newRecording`) quedan explicados: el evento de las 07:30Z venía
de bundles que ya no existen. Pestaña cargada antes del fix, no regresión.

**5. Base de datos.**
Aplicada `20260819_rate_limit_counters.sql`, que estaba pendiente y era crítica:
`/api/ai` aplica el rate limit a `transcribe` con `failClosed: true`, así que sin
la RPC **toda transcripción devolvía 503**. Confirmado además que existen
`reset_monthly_usage`, `decrement_voice_credits` e `is_admin`.

**Qué queda pendiente:**

- **Cron `cron-cleanup-free` sin programar, a propósito.** Borraría 17 audios de
  19 usuarios free en su primer disparo, irreversiblemente y sin backups.
  Decisión de producto pendiente: avisar antes, subir la retención a 30 días, o
  activarlo tal cual (el FAQ ya promete 7 días). `cron-reset-usage` sí queda
  programado a diario a las 03:00 UTC.
- **Verificar la diarización** con el modelo nuevo en una grabación de varias
  voces.
- El vigilante señala que el chat podría costar 4,1× menos (`pro-preview` →
  `3.7-flash`), pero ahí manda la calidad del razonamiento.
- Limpiar en Vercel las variables sueltas de Stripe y marcar secretos como
  *Sensitive*. Ticket del plan Pro de Supabase sin respuesta.

---

## Registro 2026-08-19 — Auditoría completa y saneamiento de seguridad

**Qué se hizo:**

Auditoría del proyecto y ejecución de la mayor parte del plan de saneamiento en
la rama `hardening/security-audit-2026-08`.

Hallazgo que reordenó todo lo demás: **el repositorio de GitHub es público** y la
API key de Resend commiteada en `docs/resend-setup.md:8` es byte a byte la misma
que está en uso. La rotación pasa a ser el paso cero, antes que cualquier código:
el canal de fuga es una historia de git pública, no un endpoint.

Endpoints que estaban abiertos y ya exigen identidad:
- `/api/send-email` era un relay abierto: aceptaba destinatario y HTML
  arbitrarios y enviaba firmado como diktalo.com. El formulario público sale a
  `/api/contact`, con destino fijo y HTML compuesto y escapado en servidor.
- `/api/ai` no tenía autenticación, con CORS abierto y 300 s de cómputo. Además
  filtraba datos entre cuentas: el `chat` pasaba a `match_recording_chunks` unos
  `recordingIds` del cliente usando service role, así que la RLS no aplicaba.
- `/api/twilio-token` emitía tokens de voz confiando en un `userId` del body.
- `/api/admin-stats`, `/api/verify` y `/api/zapier-sync`, en la misma línea.
- La Edge Function `delete-old-recordings` borraba grabaciones sin autorización.
- `utils/twilioSecurity.ts` se saltaba la validación de firma si el header
  `Host` contenía "localhost", y ese header lo pone quien llama.

Fallos funcionales encontrados por el camino, todos rotos desde su origen:
- `/api/voice` no importaba `twilio` ni `getTierForNumber`: lanzaba
  ReferenceError al cargar y **ninguna llamada saliente ha funcionado nunca**.
  Va acoplado al cierre de `/api/twilio-token`: arreglarlo antes habría
  convertido un bug en un canal de gasto facturable.
- El embedding de la consulta del chat se generaba sin `outputDimensionality`,
  de 3072 dimensiones contra una RPC que espera VECTOR(768). Fallaba siempre y
  el `catch` lo tragaba: **el RAG nunca ha funcionado en el camino de consulta**.
- `audio_url` tenía dos formatos incompatibles en la misma columna. Programar el
  cron de retención sin normalizarlo habría borrado la referencia de las
  grabaciones telefónicas dejando los ficheros ocupando espacio.
- La traducción automática del contenido de BD leía `VITE_GEMINI_API_KEY`, que
  no existe: lleva fallando en silencio desde abril.
- `lemonsqueezy-webhook` llama a `increment_extra_minutes` con los nombres de
  parámetro equivocados, así que la RPC atómica de compra de packs no se usa
  nunca y cae al fallback con condición de carrera. **Pendiente.**

Deuda cerrada: sourcemaps de producción (se publicaban 24 ficheros con el fuente
completo), 41 vulnerabilidades de npm reducidas a 11, gate de typecheck de
backend a 0 errores y dentro de `build`, ámbito completo de 194 a 75 errores,
restos de Stripe, 34 scripts de un solo uso en la raíz, y 27 documentos internos
que se servían públicamente en diktalo.com —incluidos el esquema de la BD, el
email del super admin con el SQL para crear administradores y correos de
usuarios reales—.

**Por qué:**

El patrón de fondo es el mismo en casi todos los hallazgos: el servidor confiaba
en un `userId` que mandaba el cliente y operaba con la service role key, que
bypasea RLS. La RLS estaba bien pensada y mal aplicada. La utilidad
`api/_utils/auth.ts` existe para que esa decisión se tome en un solo sitio.

**Pendiente / siguiente:**

- **Rotar la clave de Resend.** Sigue viva y publicada.
- Ejecutar `scripts/db-inventory.sql` en el SQL Editor. Bloquea todas las
  migraciones. La consulta Q0 dice si la escalada a admin ya ha ocurrido.
- Migraciones de RLS: bloqueo de columnas privilegiadas de `profiles` (hoy
  cualquier usuario puede hacer `UPDATE profiles SET role='super_admin'`),
  `search_path` en las funciones SECURITY DEFINER, `filter_user_id` en
  `match_recording_chunks`, y las RPC que el código llama y no existen en el
  repo (`reset_monthly_usage`, `decrement_voice_credits`, `is_admin`).
- Crons en `vercel.json`: no activar el de limpieza hasta migrar las filas
  históricas de `audio_url` y verificar con `?dryRun=1`.
- Rate limiting de los endpoints que siguen públicos.
- jspdf 3.0.4 tiene una CVE crítica y exige subir de major.
- Cinco artículos del blog afirman certificaciones (SOC 2, HIPAA, ISO 27001) y
  capacidades técnicas (cifrado extremo a extremo, biometría vocal) que el
  producto no tiene. Decisión de producto pendiente.

---

## Historial — resumen de fases anteriores

> El historial completo por fases está en `docs/DEVELOPMENT_LOG.md`. Este diario recoge solo lo relevante para el trabajo actual.

### Decisiones clave tomadas (no reversibles sin deliberación)

| Decisión | Fecha | Razón |
|---|---|---|
| Lemon Squeezy sobre Stripe | Feb 2026 | MoR — elimina gestión de IVA/VAT internacional |
| Gemini 3.1 como estándar primario de producción | Mar 2026 | Promovido desde preview; 2.5 queda como fallback |
| `gemini-embedding-001` como embedding obligatorio | Feb 2026 | Reemplaza `text-embedding-004` depreciado |
| RAG pipeline con pgvector (`recording_chunks`) | Mar 2026 | Chat sobre transcripts largos sin exceder contexto |
| RPC `security definer` para estadísticas de usuario | Feb 2026 | RLS bloqueaba updates desde cliente |
| URLs firmadas de corta duración para audio | Desde inicio | Seguridad — nunca URLs públicas |
| Sentry + Skills como protocolo obligatorio | Feb 2026 | Institucionalizado como regla de oro |

### Bugs críticos resueltos (no repetir)

| Bug | Causa real | Fix |
|---|---|---|
| `minutes_used` y `storage_used` en 0 en admin | RLS bloqueaba `update` desde cliente | RPCs `increment_user_usage` / `increment_user_storage` con `security definer` |
| Error `MPEGMode` en Safari/iOS | Referencia rota en `audioConcat.ts` | Polyfill defensivo para `lamejs` |
| Acciones de carpetas no persistían en desktop | Prop drilling roto entre `App.tsx` e `IntelligenceDashboard` | Refactorización con `FolderModal.tsx` |
| Transcripción no aparecía tras upload sin refresh | `transcribeAudio()` devuelve `{segments, suggestedSpeakers}` pero el upload lo trataba como array (`.length` en objeto = `undefined`) — condition siempre `false`. `handleGenerateTranscript` actualizaba `recordings` pero `activeRecording` apuntaba a `tempRecording`. | Destructuring correcto + `setTempRecording` en ambos paths. |

---

## Registro 2026-05-04 — Fix transcripción no visible sin refresh

**Qué se hizo:**
- Fix en `IntelligenceDashboard.tsx:262`: el upload flow asignaba el return de `transcribeAudio()` (un objeto) a `segments` y lo comprobaba con `.length` — siempre `false`. Corregido con destructuring `{ segments: rawSegments }`.
- Fix en `handleGenerateTranscript`: añadido `setTempRecording()` para sincronizar la vista activa, que apuntaba a `tempRecording` aunque `onUpdateRecording` actualizara el array `recordings`.
- Ambos paths ahora también persisten `status: 'Completed'`.

**Por qué:**
El bug estaba desde la introducción de `transcribeAudio()` con la firma `Promise<{segments, suggestedSpeakers}>`. El upload flow nunca se actualizó para destructurar. `handleGenerateTranscript` actualizaba el estado global pero no el local (`tempRecording`), dejando la vista obsoleta hasta refresh manual.

**Pendiente / siguiente:**
- Verificar en producción que audios subidos transcriben y aparecen sin refresh.

---

## Registro 2026-03-10 — Migración a Gemini 3.1 como estándar primario

**Qué se hizo:**
- Actualización de `api/ai.ts`: `gemini-3.1-pro-preview`, `gemini-3.1-flash-preview` y `gemini-3.1-flash-lite-preview` promovidos a modelos primarios.
- `gemini-2.5-pro` y `gemini-2.5-flash` pasan a ser fallback en la cadena de reintentos.
- Actualización del skill `optimizing-gemini-models/SKILL.md` para reflejar Gemini 3.1 como estándar de producción actual.
- Mapa de acción → modelo: summary → `flash-lite`, chat → `pro-preview`, transcription → `flash-preview`, support → `flash-lite`.

**Por qué:**
Gemini 3.1 estabilizó sus preview APIs. El skill ya lo tenía documentado como "próxima generación válida" desde febrero — este commit ejecuta la migración real. Los modelos 2.5 permanecen como fallback hasta confirmar estabilidad en producción de 3.1.

**Pendiente / siguiente:**
- Monitorear Sentry por errores 500 de modelos preview en producción.
- Eliminar fallback 2.5 una vez confirmada estabilidad de 3.1 preview.

---

## Registro 2026-03-20 — RAG pipeline completo (chunking + embeddings + búsqueda semántica)

**Qué se hizo:**
- Nueva acción `sync-rag` en `api/ai.ts`: chunka transcripts (~1000 chars via `_utils/chunker`), genera embeddings con `gemini-embedding-001` (768 dimensiones), y persiste chunks en tabla `recording_chunks` (campos: `recording_id`, `user_id`, `chunk_index`, `content`, `embedding`).
- Chat con RAG: cuando se reciben `recordingIds`, el chat genera embedding de la query y llama a RPC `match_recording_chunks` (threshold 0.3, top 15 chunks). Fallback al transcript completo si RAG no devuelve resultados.
- Límite de contexto: 700k chars con truncado defensivo y log de aviso.
- Fallback de embedding a `embedding-001` legacy si `gemini-embedding-001` falla.

**Por qué:**
El chat sobre múltiples grabaciones largas excedía el contexto de Gemini con transcripts completos. RAG resuelve esto recuperando solo los chunks semánticamente relevantes a la query. `pgvector` ya estaba disponible en Supabase — solo faltaba la capa de aplicación.

**Pendiente / siguiente:**
- Verificar que la migración SQL de `recording_chunks` con índice vectorial está aplicada en producción.
- Probar con grabaciones largas (>1h) para validar calidad de recuperación.

---

## Registro 2026-04-05 — Servicio de auto-traducción IA para contenido dinámico

**Qué se hizo:**
- Creación de `services/aiTranslationService.ts`: traduce contenido dinámico de BD (descripción y features de planes, configuraciones de texto, legal footer) usando `gemini-3.1-flash-lite-preview`.
- Funciones exportadas: `translateWithGemini`, `translateArray`, `autoTranslatePlan`, `autoTranslateSetting`, `translateAllPlans`.
- Las traducciones se ejecutan en paralelo (`Promise.all`) para minimizar latencia.
- Fallback: si Gemini falla, devuelve el texto original sin lanzar error.

**Por qué:**
Los planes de Lemon Squeezy y configuraciones del admin se gestionan en ES desde el panel. Sin traducción automática, la UI en EN mostraba texto en español para contenido dinámico (lo que no está hardcodeado en `translations.ts`). Este servicio completa la internacionalización para el contenido que viene de BD.

**Pendiente / siguiente:**
- Considerar caché de traducciones para evitar llamadas repetidas a Gemini por el mismo texto.

---

## Registro 2026-04-15 — Rediseño de sección Features en landing

**Qué se hizo:**
- Refactorización de `components/Landing/Features.tsx`: de lista estática a tab UI animada con 4 pasos (Captura Omnicanal → IA → Análisis → Chat).
- Barra de progreso animada por tab activo (Framer Motion, 6s autoplay).
- Layout split: texto descriptivo a la izquierda (1/3), imagen del feature a la derecha (2/3).
- Responsive: stack vertical en móvil, horizontal en desktop.
- Fallback de imagen: si no carga, muestra el número del step en grande.
- Todas las strings van via `t()` de `LanguageContext`.

**Por qué:**
La sección Features anterior era estática y no comunicaba el flujo de trabajo del producto. El nuevo diseño de tabs con autoplay guía al usuario por los 4 pasos clave y es visualmente más moderno para conversión en landing.

**Pendiente / siguiente:**
- Preparar las imágenes `/images/feature-step1-capture.png` etc. si no existen.
- Verificar keys de traducción en `utils/translations.ts` para todos los textos del componente.

---

## Registro 2026-04-28 — Skill creator añadido al sistema de agentes

**Qué se hizo:**
- Incorporación de `.agent/skills/skill-creator/` al repo: skill completo con agentes, assets, eval-viewer, referencias y scripts para crear y evaluar nuevos skills.
- Actualización de `optimizing-gemini-models/SKILL.md` para reflejar `gemini-3.1-flash-image-preview` como modelo de generación de imágenes (Nano Banana Pro).

**Por qué:**
El workflow de creación de skills era manual. El skill-creator formaliza el proceso de diseñar, probar y publicar nuevas capacidades de agente de forma sistemática.

**Pendiente / siguiente:**
- Evaluar si skill-creator necesita docs adicionales en `memory/` sobre cómo usarlo.

---

## Registro 2026-05-04 — Setup de metodología multi-agente

**Qué se hizo:**
- Creación de `AGENTS.md` — contrato base para todos los agentes (Claude, Gemini, futuros)
- Creación de `CLAUDE.md` — instrucciones específicas para Claude con workflow Superpowers adaptado
- Creación de `diario.md` — este archivo, bitácora viva desde ahora
- Creación de `Memory.md` + carpeta `memory/` — sistema de memoria persistente entre sesiones

**Por qué:**
El proyecto tenía skills bien documentados (`.agent/skills/`) pero sin capa de coordinación entre agentes ni bitácora viva sesión a sesión. Cada sesión empezaba de cero. Estos archivos dan contexto inmediato a cualquier agente sin necesidad de re-leer todo el código.

**Pendiente / siguiente:**
- Gap documentado en esta sesión (ver entradas retroactivas mar–abr 2026).
- Definir foco de ejecución actual: qué se está construyendo ahora mismo y en qué orden.

---

## Registro 2026-05-12 — Instalación de skill find-skills (ecosistema open agent skills)

**Qué se hizo:**
- Instalado `find-skills` vía `npx skills add https://github.com/vercel-labs/skills --skill find-skills`.
- El skill queda en `.agents/skills/find-skills/SKILL.md` con symlink a Claude Code.
- Generado `skills-lock.json` en raíz (lockfile del ecosistema, similar a `package-lock.json`).

**Por qué:**
`find-skills` actúa como un "package manager discovery tool" para el ecosistema de agent skills (skills.sh). Permite buscar e instalar skills de terceros directamente desde el agente, sin tener que conocer la URL de cada repo. Flujo: usuario describe lo que necesita → agente corre `npx skills find [query]` → evalúa reputación (installs, fuente, stars) → instala con `npx skills add`. Útil para extender capacidades del agente sin tener que crear todo desde cero.

**Cómo usar esta skill:**
- Cuando el usuario pregunte "¿hay un skill para X?" o "¿cómo hago X?", invocar `/find-skills` o correr `npx skills find [query]`.
- Verificar siempre: installs > 1K, fuente oficial (`vercel-labs`, `anthropics`), stars en GitHub.
- Instalar con: `npx skills add <owner/repo@skill> -g -y` (flag `-y` para no-interactivo).

**Pendiente / siguiente:**
- Ninguno. Skill activo y disponible.

---

*Próximas entradas deben seguir el formato:*
```
## Registro YYYY-MM-DD — [título breve]

**Qué se hizo:** ...
**Por qué:** ...
**Pendiente / siguiente:** ...
```
