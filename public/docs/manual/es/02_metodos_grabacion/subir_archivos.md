
# Ingesta de Archivos y Multi-Audio

La funcionalidad de **Subida (Upload)** actúa como un puerto de entrada universal para tus datos históricos. Diktalo puede procesar grabaciones realizadas con otros dispositivos (grabadoras de mano, móviles, sistemas de VoIP antiguos) e inyectarles inteligencia moderna.

![Dashboard con opciones de subida](/docs/screenshots/es/upload/01_initial.png)

---

## Capacidades de Ingesta

### Formatos Soportados (Universal Codec Support)
Nuestro motor de transcodificación acepta la mayoría de los estándares de la industria. No necesitas convertir tus archivos antes de subirlos.

*   **Audio Comprimido:** MP3, M4A, OGG (Ideal para cargas rápidas).
*   **Alta Fidelidad:** WAV, FLAC (Ideal para máxima precisión en transcripción).
*   **Web:** WEBM (Común en grabaciones de navegador).

**Límites Técnicos:**
*   Hasta **2 GB** por archivo individual.
*   Duración ilimitada (sujeta a tu plan de minutos).

---

## Motor de Multi-Audio (Conversation Stitching)

La verdadera potencia de Diktalo reside en su capacidad para entender que **una conversación puede estar fragmentada en varios archivos**.

El modo **Multi-Audio** no simplemente sube archivos en lote; los **fusiona cronológica y semánticamente** para tratarlos como una única entidad de conocimiento.

![Interfaz Multi-Audio](/docs/screenshots/es/upload/02_multiaudio.png)

### Casos de Uso Avanzados

#### A. Reconstrucción de Entrevistas
Si grabaste una entrevista larga y la grabadora generó cortes automáticos cada 30 minutos (`REC_001.mp3`, `REC_002.mp3`...), súbelos juntos.
*   **Resultado:** Diktalo entregará una sola transcripción contínua de 2 horas, sin cortes abruptos en el texto.

#### B. Pistas de Audio Separadas (Podcasting)
Para grabaciones profesionales donde cada orador tiene su propio micrófono y archivo (`pista_juan.wav`, `pista_ana.wav`).
*   **Resultado:** El sistema mezcla las fuentes y utiliza los canales para una identificación de oradores (diarización) perfecta.

#### C. Sesiones Fragmentadas
Una negociación que se interrumpió por el almuerzo y continuó por la tarde.
*   **Resultado:** Pregunta a la IA *"¿Qué cambió en la postura del cliente entre la sesión de la mañana y la de la tarde?"* y obtén una respuesta unificada.

---

## Guía de Operación

### 1. Carga de Archivos
Arrastra tus activos digitales al área de carga ("Drop Zone"). La barra de progreso te indicará la velocidad de encriptación y subida a nuestra nube segura.

### 2. Ordenamiento Lógico (Solo Multi-Audio)
Antes de procesar, verás una lista preliminar. Es **crítico** que el orden sea correcto para que la transcripción tenga sentido cronológico.
*   El sistema intenta ordenar por *Timestamp* o *Nombre*.
*   Arrastra las filas manualmente si necesitas corregir la secuencia.

### 3. Procesamiento Asíncrono
Una vez confirmada la subida, puedes cerrar la pestaña. Nuestros servidores trabajarán en segundo plano. Recibirás una notificación (si están activadas) o verás el estado "Listo" en tu Dashboard cuando la IA haya terminado.

> **Consejo Pro:** Si tienes archivos antiguos con nombres genéricos (`Audio 1`, `Audio 2`), renómbralos a algo descriptivo **antes** de subir (`Q1_Planning_2024.mp3`). Ese nombre se convertirá en el título de tu sesión en Diktalo, facilitando la búsqueda futura.
