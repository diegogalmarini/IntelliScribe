# 📒 Diktalo: Diario de Desarrollo (Development Log)

Este documento registra la evolución del proyecto, los hitos alcanzados y el proceso de pensamiento detrás de las grandes actualizaciones. Es una guía para entender cómo llegamos hasta aquí.

---

## 📅 Enero 2026: El Nacimiento de la IA con Alma

### 🤖 El Sistema de Personalidades (SupportBot)
**Problema:** El chat de soporte inicial se sentía frío y genérico.
**Solución:** Creamos un sistema de 4 agentes con personalidades, biografías e intereses reales (Isabella R., Javier M., Raúl S., Elena G.).
**Impacto:** El asistente no solo resuelve dudas técnicas, sino que conoce el contexto de tus grabaciones y responde con un tono humano y cercano.

### 📐 Refactorización de la Interfaz (Intelligence Hub)
**Hito:** Migramos de una estructura de Sidebar estática a un Dashboard unificado en `/intelligence`.
**Decisión:** Unificar todo bajo una misma interfaz reduce la fricción cognitiva. Ahora los Ajustes, Integraciones y Planes son modales o vistas dentro del mismo cerebro digital.

---

## 📅 Enero 2026: Pulido de UX y Monetización

### 🧭 Sistema de Chat Parallax / Adaptativo
**Problema:** El botón de chat flotante chocaba con la lista de audios o el nuevo Dialer.
**Innovación:** Implementamos un sistema de "Alineación Adaptativa" (Horizontal Parallax).
- El botón es 100% arrastrable.
- La ventana se abre hacia la derecha, centro o izquierda dependiendo de su posición en pantalla para optimizar el espacio.

### 🔐 Implementación de "Gates" Freemium
**Estrategia:** En lugar de ocultar las funciones PRO, las dejamos visibles pero con un "Soft Gate" (Upgrade Modal).
**Componentes:** `UpgradeModal.tsx`, `PremiumFeatureButton.tsx`.
**Razonamiento:** El usuario debe ver el valor que está perdiendo para sentir el impulso de mejorar su plan (Análisis IA, Exportación, Descarga de Audio).

---

## 🏗️ Hitos Técnicos Relevantes

1.  **Seguridad RLS (Row Level Security):** Se implementó una auditoría profunda de Supabase para asegurar que un usuario nunca pueda ver datos de otro, incluso en el Admin Panel.
2.  **Captura Omnicanal:** La combinación de la Extensión de Chrome + Twilio + Grabación Web convierte a Diktalo en el centro neurálgico de cualquier conversación.
3.  **Prompt Engineering Dinámico:** El sistema genera prompts masivos para Gemini que incluyen el contexto completo del usuario (perfil, plan) y los fragmentos más relevantes de las grabaciones para una respuesta precisa.

---

## 📅 Enero 2026: Estabilización y Escalabilidad de Producción

### 🎙️ Audio Engine: Migración de WAV a MP3 (LameJS)
**Problema:** Al subir grabaciones largas (+30 min), el formato WAV (sin comprimir) superaba el límite de 50MB de Supabase y causaba fallos de subida (error 400).
**Solución:** Integramos `lamejs` para comprimir el audio directamente en el cliente antes del envío.
- **Configuración:** 22050Hz (Mono) / 64kbps MP3.
- **Resultado:** Reducción del **90% en peso**. Una reunión de 1 hora pasó de ocupar cientos de MBs a tan solo **~28MB**.
- **Lección:** Para productos en producción, la compatibilidad nativa (WAV) es un buen inicio, pero la escalabilidad exige compresión *lossy* para mejorar la resiliencia en conexiones inestables.

### 🤖 Chat de Soporte: Validación de Roles Gemini
**Contexto:** La API de Gemini v1beta exige que el historial de chat comience SIEMPRE con el rol `user` y alterne estrictamente. 
**Fix:** Implementamos un filtro automático en `api/ai.ts` que sanea el historial, evitando errores 500 generados por inconsistencias en la base de datos local del cliente.

### 📊 Resiliencia en Analíticas (trackEvent)
**Problema:** Si el script de Google Analytics fallaba por bloqueadores de anuncios o problemas de red, el sistema lanzaba un `ReferenceError` que bloqueaba la subida de audios.
**Fix:** Implementamos importaciones con espacios de nombres y chequeos defensivos. **Regla de oro:** Las analíticas nunca deben ser un "punto único de fallo" para la funcionalidad core del producto.

### 🛡️ Infraestructura y Capacidad
**Decisión:** Se elevó la recomendación técnica de los límites de Supabase a **250MB por objeto** para permitir grabaciones maratonianas (8h+) y garantizar que el sistema nunca rechace una subida válida.
### 📄 Recalculación de Almacenamiento y Auditoría de Datos
**Problema:** Los usuarios con muchas imágenes y audios antiguos veían "0.0 GB" usado, ya que el sistema anterior no trackeaba el tamaño de los adjuntos ni actualizaba el contador retroactivamente.
**Solución:** 
- **Auditoría Retroactiva (`syncStorageUsage`):** Implementamos un sistema que recorre tanto los archivos en el bucket como las imágenes en Base64 de la base de datos para sincronizar el perfil del usuario con la realidad.
- **Tracking de Adjuntos:** Añadimos la propiedad `size` a los `MediaItem` para que cada captura o subida de imagen se sume al límite de almacenamiento en tiempo real.
- **Resultado:** El usuario ahora tiene una visión honesta y precisa de su consumo de datos.

### 🎨 Sidebar 2.0: Estandarización de Consumo
**Hito:** Refactorizamos los indicadores de Minutos, Almacenamiento y Días.
- **Decisión Visual:** Cambiamos los colores genéricos por el azul marca (`#0055FF`) para reforzar la identidad corporativa.
- **UX:** Implementamos el formato "Uso / Total --- %" y lógica dinámica que muestra MB para consumos pequeños, eliminando el confuso "0.0 GB".
- **Lógica de Días:** Corregimos el cálculo de días restantes basándonos en la fecha real de creación de la cuenta y los ciclos de renovación de Stripe/Trial.

### 🐛 Estabilización de Producción (Hotfixes)
- **Contextos React:** Corregimos un `ReferenceError` de `createContext` añadiendo las importaciones faltantes de React.
- **Prop Drilling:** Solucionamos un crash crítico en el Dashboard donde una prop indefinida (`onUpdateRecording`) bloqueaba la visualización de audios al hacer clic.
- **Lección:** Las auditorías de tipos en tiempo real y el uso de props opcionales seguros son vitales para prevenir pantallas en blanco en entornos de despliegue rápido.
### 🛡️ Filosofía de Colaboración: Proactividad Total del Agente
**Mandato del Usuario (Ene 2026):** El Agente (Antigravity) debe siempre tomar la iniciativa para realizar cualquier tarea técnica que reduzca la carga de trabajo del usuario (builds, empaquetado, correcciones concurrentes), siempre que sea más rápido y eficiente. 
**Regla de Oro:** "Haz todo lo que me quite trabajo a mí y puedas hacerlo tú más rápido y mejor".

### 🤖 Arquitectura Auto-Sanable (Model Agnostic)
**Problema:** Errores 404 recurrentes al usar modelos específicos como `gemini-1.5-flash-latest` en versiones de API beta.
**Solución:** Centralización en `constants/ai.ts` y lógica de fallback en `api/ai.ts`.
**Regla:** El Agente no debe hardcodear modelos. Si un modelo falla, el sistema debe intentar el siguiente en la lista de prioridades automáticamente. Esto previene interrupciones de servicio por cambios externos de Google.

### 🧠 Memoria Híbrida y Modelo de Partner (Support Bot)
**Problema:** El chat del asistente se reseteaba al cambiar de audio, rompiendo la fluidez, y el usuario se sentía "atrapado" con el mismo agente (Camila).
**Solución:** Implementamos un sistema de memoria y equipo coordinado.
- **Memoria Híbrida:** El historial visual persiste entre audios, pero la IA recibe un aviso interno de "Cambio de Contexto" para saber sobre qué audio está hablando el usuario en cada momento.
- **Modelo de Partner (Handoff):** Pasamos de un agente genérico a un equipo que se deriva tareas. Si un agente es de producto y detecta una duda técnica, ofrece pasar la consulta a un experto técnico (Klaus/Alex) mediante botones de acción.
- **Selección Profesional:** La elección del asistente se movió a **Ajustes**, permitiendo al usuario definir su compañero de IA permanente pero con la posibilidad de rotar cuando lo desee.
- **Escaner Profundo (Precisión):** Instruimos a la IA para que priorice siempre la **transcripción completa** sobre el resumen para evitar respuestas "vagas" que no encuentran detalles específicos.
**Filosofía:** El asistente ya no es solo una ayuda, es un equipo de expertos con "vidas virtuales" y relaciones entre ellos.
