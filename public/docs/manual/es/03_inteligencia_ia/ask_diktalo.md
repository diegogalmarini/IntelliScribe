---
title: "ASK Diktalo - Chat con IA"
category: "Inteligencia IA"
difficulty: "Intermedio"
tags: ["chat", "ia", "ask", "preguntas", "insights"]
last_updated: "2026-01-09"
---

# ASK Diktalo - Los 3 Niveles de Inteligencia

**ASK Diktalo** es tu asistente de IA que convierte grabaciones en conocimiento accionable. No solo transcribe, sino que **comprende, analiza y conecta** información.

![Chat ASK Diktalo](/docs/screenshots/es/ask_diktalo/01_chat_interface.png)

---

## ¿Qué es ASK Diktalo?

ASK Diktalo es un sistema de **3 niveles de inteligencia artificial** que opera en diferentes escalas:

1. **Micro** - Preguntas sobre UNA grabación específica
2. **Meso** - Análisis de MÚLTIPLES grabaciones relacionadas  
3. **Macro** - Insights de TODA tu biblioteca de conversaciones

---

## Nivel 1: MICRO (Grabación Individual)

### Acceder al Chat
1. Accede desde cualquier grabación en tu dashboard.
2. Haz clic en el botón **"Preguntar a Diktalo"** o **"ASK"**
3. Se abre el panel de chat a la derecha

### Preguntas que Puedes Hacer

**Resúmenes:**
- "Resume esta reunión en 3 puntos"
- "¿Cuáles fueron las decisiones tomadas?"
- "Dame un resumen ejecutivo de 2 párrafos"

**Búsqueda Específica:**
- "¿Qué dijo [Nombre] sobre el presupuesto?"
- "¿Cuándo se mencionó el proyecto X?"
- "Encuentra todas las tareas pendientes"

**Aclaraciones:**
- "¿A qué se refería al decir [concepto]?"
- "Explica el contexto de la discusión sobre precios"

**Extracción de Datos:**
- "Lista todos los nombres mencionados"
- "¿Qué fechas se acordaron?"
- "Extrae los números y métricas discutidas"

### Ejemplo de Conversación

**Usuario:** "¿Qué decisiones se tomaron?"

**ASK Diktalo:**  
_"Se tomaron 3 decisiones principales:_
1. _Aumentar el presupuesto de marketing en 15%_
2. _Contratar 2 desarrolladores en Q2_
3. _Posponer el lanzamiento del producto B hasta julio"_

**Usuario:** "¿Quién propuso la decisión 2?"

**ASK Diktalo:**  
_"María González propuso contratar 2 desarrolladores, mencionando que el equipo actual está sobrecargado. Pedro apoyó la idea en el minuto 12:34."_

---

## Nivel 2: MESO (Múltiples Grabaciones)

### Búsqueda Cruzada

Usa la **barra de búsqueda global** del dashboard para encontrar información entre TODAS tus grabaciones:

**Ejemplo de Búsqueda:**  
Escribes: `"presupuesto 2026"`

**Resultado:**  
Diktalo muestra:
- 5 grabaciones que mencionan "presupuesto 2026"
- Fragmentos relevantes de cada una
- Conexiones entre conversaciones

### Análisis de Tendencias

Pregunta en la búsqueda global:
- "¿Cuántas veces se habló de [tema] este mes?"
- "Muéstrame todas las reuniones sobre [proyecto]"
- "Timeline de decisiones sobre el lanzamiento"

---

## Nivel 3: MACRO (Toda tu Biblioteca)

> *Esta funcionalidad está en Beta y se mejora continuamente*

### ¿Qué es el Nivel Macro?

La IA analiza **TODAS tus conversaciones** para encontrar patrones, contradicciones, y generar insights de alto nivel.

### Casos de Uso

**Auditoría de Decisiones:**
- "¿Ha cambiado nuestra estrategia de precios en los últimos 3 meses?"
- "Resume cómo evolucionó el proyecto X desde enero"

**Conocimiento Organizacional:**
- "¿Qué temas recurrentes discutimos en Q1?"
- "¿Quiénes son los stakeholders más mencionados?"

**Preparación para Reuniones:**
- "Dame contexto de todas las conversaciones con [Cliente]"
- "Resume los antecedentes del proyecto antes de la reunión de mañana"

---

## Cómo Funciona la IA

### RAG (Retrieval-Augmented Generation)

Diktalo usa **RAG** para:
1. **Buscar** en tus transcripciones (vectores semánticos)
2. **Recuperar** fragmentos relevantes
3. **Generar** respuesta contextual con esos fragmentos

**Ventaja:** No "alucina" ni inventa información. Solo responde basándose en lo que realmente dijiste.

### Memoria de Conversación

Dentro de un chat (Nivel Micro), la IA **recuerda el contexto**:

**Usuario:** "¿Qué dijo Juan?"  
**IA:** "Juan mencionó..."

**Usuario:** "¿Y María estuvo de acuerdo?"  
**IA:** _[Entiende que te refieres al mismo tema]_ "Sí, María apoyó la idea de Juan sobre..."

---

## Mejores Prácticas

### Preguntas Efectivas

✅ **Específicas:**  
"¿Qué presupuesto se asignó al departamento de ventas?"

❌ **Vagas:**  
"Cuéntame de la reunión"

✅ **Contextuales (Nivel Meso/Macro):**  
"Compara lo que se dijo sobre IA en enero vs. marzo"

❌ **Sin Contexto:**  
"¿Qué dijeron?"

✅ **Accionables:**  
"Lista las tareas asignadas a [Nombre]"

❌ **Demasiado Generales:**  
"¿Qué pasó?"

### Iterar Preguntas

No obtengas todo en una pregunta. **Conversa** con la IA:

1. "Resume la reunión" → _Obtienes resumen_
2. "Profundiza en el punto 2" → _IA expande ese tema_
3. "¿Quién está a cargo de eso?" → _IA identifica responsables_

---

## Limitaciones y Consideraciones

### Privacidad
- ✅ Todo el procesamiento respeta tu privacidad
- ✅ La IA no entrena modelos con tus datos
- ✅ Solo TÚ tienes acceso a tus chats

### Precisión
- La IA es tan precisa como la **calidad del audio y transcripción**
- Audio ruidoso → transcripción errónea → respuestas imprecisas
- Solución: Graba en ambientes silenciosos, usa buenos micrófonos

### Idioma
- Funciona mejor en **Español e Inglés**
- Idiomas mixtos (Spanglish) pueden reducir precisión
- Configura el idioma correcto en Ajustes > Preferencias

---

## Casos de Uso Reales

### 1. Equipos de Ventas
**Problema:** Perdemos detalles de llamadas con clientes  
**Solución (Micro):**  
- Graba llamada con cliente
- ASK: "¿Qué objeciones puso el cliente?"
- ASK: "Gener

a un seguimiento de próximos pasos"

**Solución (Macro):**  
- "¿Cuáles son las objeciones más comunes de los clientes este mes?"

### 2. Gestores de Proyectos
**Problema:** Reuniones sin actas claras  
**Solución (Micro):**  
- Graba reunión semanal
- ASK: "Genera minuta con formato:  
  Asistentes | Decisiones | Tareas | Próximos pasos"

### 3. Investigadores / Estudiantes
**Problema:** Muchas entrevistas, difícil sintetizar  
**Solución (Meso):**  
- Sube todas las entrevistas
- Búsqueda global: "motivaciones para cambiar de carrera"  
- ASK Macro: "Identifica patrones comunes en todas las entrevistas"

---

## Comandos Rápidos

Próximamente podrás usar comandos rápidos:

- `/resumir` - Resumen automático de la grabación
- `/tareas` - Extrae todas las tareas mencionadas
- `/decisiones` - Lista decisiones tomadas
- `/nombres` - Identifica personas mencionadas

---

## Próximos Pasos

✅ **Ya sabes usar ASK Diktalo!** Ahora puedes:

1. 📊 [Generar resúmenes con plantillas](./resumenes_plantillas.md)
2. 📥 [Exportar conversaciones](./exportar.md)
3. 📁 [Organizar por temas](../04_organizacion/carpetas.md)
4. 🔍 [Búsqueda avanzada](./busqueda_avanzada.md)

---

## ¿Necesitas Ayuda?

- 💬 **Chat en vivo:** Widget Crisp (esquina inferior derecha)
- 📧 **Email:** contacto@diktalo.com
- 📚 **Manual completo:** [Ver índice](../README.md)
