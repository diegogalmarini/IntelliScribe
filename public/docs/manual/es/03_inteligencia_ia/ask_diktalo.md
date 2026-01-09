
# ASK Diktalo: Inteligencia Conversacional

**ASK Diktalo** no es un buscador; es un analista experto que ha escuchado tu conversación y recuerda hasta el más mínimo detalle. Es la interfaz que te permite "dialogar" con tus datos.

Utilizando Modelos de Lenguaje de Gran Escala (LLMs) entrenados en contexto de negocios, ASK Diktalo puede extraer, sintetizar y razonar sobre la información contenida en tus grabaciones.

![Panel de Chat ASK Diktalo](/docs/screenshots/es/ask_diktalo/01_chat_panel.png)

---

## Los 3 Niveles de Inteligencia

La potencia de ASK Diktalo escala según el alcance de los datos que necesitas analizar.

### Nivel 1: MICRO (Single Session)
**"Analiza ESTA grabación."**

El chat vive dentro de una grabación específica. Su universo de conocimiento se limita a lo que se dijo en esa sesión.
*   **Pregunta:** *"¿Mencionaron alguna fecha límite para el proyecto?"*
*   **Pregunta:** *"Redacta un correo de seguimiento para el cliente basado en esta charla."*
*   **Precisión:** Máxima, ya que el contexto está cerrado y controlado.

---

### Nivel 2: MACRO (Multi-Session Project)
**"Analiza ESTE proyecto."** *(Próximamente)*

El chat entiende el contexto de toda una carpeta o etiqueta. Cruza información entre múltiples reuniones relacionadas.
*   **Pregunta:** *"¿Cómo ha evolucionado la opinión del cliente sobre el precio en las últimas 3 reuniones?"*
*   **Pregunta:** *"Resume los avances semanales del equipo de Marketing."*

---

### Nivel 3: GLOBAL (Second Brain)
**"Analiza TODO mi conocimiento."** *(Enterprise)*

El motor conecta puntos entre departamentos, años y equipos. Encuentra patrones que un humano jamás vería por el volumen de datos.
*   **Pregunta:** *"Dime todas las veces que hemos discutido sobre 'Ciberseguridad' en el último año, sin importar con qué cliente fue."*

---

## Capacidades del Asistente

### 🧠 Extracción de Datos Duros
Olvídate de tomar notas frenéticamente. Pide los datos exactos.
> *"Lista todos los precios que mencionó el proveedor."*
> *"Dame los nombres y cargos de los asistentes."*

### 💡 Síntesis Creativa
Transforma el formato de la información.
> *"Convierte esta reunión en una entrada de blog."*
> *"Crea una tabla comparativa de los pros y contras discutidos."*

### 🔎 Detección de Sentimientos
Lee entre líneas.
> *"¿Cuál fue el tono de la respuesta del inversor cuando hablamos de riesgos?"*
> *"¿Hubo algún momento de tensión en la llamada?"*

---

## Ingeniería de Promepts (Cómo preguntar)

Para obtener resultados de nivel "Consultor Senior", formula tus preguntas con contexto y objetivo:

**❌ Básico:**
*"Haz un resumen."*

**✅ Pro:**
*"Actúa como un Project Manager. Basado en la transcripción, genera una lista de tareas priorizadas por urgencia, asigna un responsable a cada una y detecta cualquier bloqueo mencionado que impida avanzar."*

---

## Verificabilidad (Citas)

La confianza es clave en IA. Por eso, cada respuesta de ASK Diktalo incluye **referencias clicables**.
*   Si el chat afirma: *"El cliente aceptó el presupuesto"*, verás un pequeño índice `[12:40]`.
*   Al hacer clic, el reproductor saltará al segundo exacto donde se dijo esa frase, permitiéndote **auditar la alucinación** y verificar la fuente original.
