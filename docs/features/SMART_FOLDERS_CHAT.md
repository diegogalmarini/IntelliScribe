# Smart Folders & 3-Level Ask Diktalo

## Descripción General
Esta funcionalidad introduce una estructura organizativa basada en **Carpetas** y expande las capacidades de **Ask Diktalo** (IA) para operar en tres niveles de contexto distintos.

## Arquitectura de 3 Niveles
El sistema de chat IA ahora opera en tres ámbitos, permitiendo al usuario "hablar" con diferentes conjuntos de datos:

### 1. Nivel Global (Dashboard)
- **Alcance**: Toda la cuenta del usuario.
- **Funcionalidad**: Busca información en *todos* los audios y transcripciones que el usuario ha subido, independientemente de la carpeta.
- **Caso de Uso**: Búsqueda transversal ("¿En qué reunión mencioné el presupuesto general?"), resúmenes de actividad.

### 2. Nivel Carpeta (Temático)
- **Alcance**: Archivos dentro de una carpeta específica.
- **Funcionalidad**: El contexto de la IA se restringe a los documentos contenidos en la carpeta activa.
- **Caso de Uso**: Gestión de proyectos específicos. Ejemplo: Una carpeta "Proyecto Alpha". El usuario puede preguntar "¿Cuáles son los plazos acordados?" y la IA solo buscará en las reuniones de ese proyecto, evitando alucinaciones con otros proyectos.

### 3. Nivel Archivo (Específico)
- **Alcance**: Un único archivo de audio/transcripción.
- **Funcionalidad**: Análisis profundo de una sola sesión.
- **Caso de Uso**: Detalles puntuales ("¿Quién llegó tarde?", "Resume los puntos clave de esta llamada").

## Estructura de Datos (Carpetas)
- **Nueva Entidad**: `folders`
- **Relación**: Los archivos (`recordings`) tienen una clave foránea `folder_id` que los vincula a una carpeta.

## Beneficios para el Usuario
- **Organización Superior**: De una lista plana a un sistema estructurado.
- **IA Más Precisa**: Al acotar el contexto (Nivel Carpeta), las respuestas de la IA son más relevantes y tienen menos "ruido" de otros temas.
