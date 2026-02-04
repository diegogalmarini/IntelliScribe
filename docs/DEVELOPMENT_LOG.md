# 📒 Diktalo: Diario de Desarrollo (Development Log) - Fase 4

Este documento registra la evolución del proyecto durante la **Fase 4: Búsqueda Semántica**. 

---

## 📅 Enero 2026: El Inicio del Cerebro Digital

### 🧠 Proyecto: Búsqueda Semántica (Semantic Search)
**Objetivo:** Implementar memoria a largo plazo real mediante embeddings vectoriales y `pgvector` en Supabase.
- [ ] Configuración de Infraestructura Vectorial.
- [ ] Generación de Embeddings con Gemini.
- [ ] Integración de Búsqueda de Similitud en el Support Bot.

---

## 📅 17-18 Enero 2026: Persistencia y Experiencia de Usuario (Onboarding)

### 🚀 Mejoras en el Tour y Support Bot
**Objetivo:** Refinar el primer contacto del usuario con la app y asegurar que el soporte IA sea preciso.

- **Persistencia del Tour:** Implementado sistema de `localStorage` (`diktalo_tour_seen_${userId}`) combinado con Supabase para evitar que el Welcome Tour aparezca en cada recarga de página tras ser completado o descartado.
- **Manual Restart (Botón de Tour):** Añadido botón "Lanzar Tour Guiado" en el modal de Ajustes > Preferencias, permitiendo a los usuarios re-lanzar el onboarding cómodamente.
- **Precisión del Support Bot:** 
    - Actualizado el *System Prompt* de Victoria W. (y otros agentes) para incluir instrucciones exactas sobre la grabadora (Hold 3s to stop).
    - Prohibición de enlaces Markdown `[text](url)` en las respuestas del bot para evitar ruido visual, sustituyéndolos por URLs limpias o botones de acción interactivos.
    - Mejorada la lógica de navegación (`NAVIGATE`) con etiquetas claras para Dashboard e Intelligence.
- **GitHub Sync:** Todos los cambios sincronizados y pusheados a la rama `main` en GitHub.

---

## 📅 22 Enero 2026: Estabilidad Móvil y Lanzamiento Inminente

### 📱 Optimización de Grabación y UI en Móviles
**Objetivo:** Eliminar bloqueos técnicos en dispositivos móviles (iOS/Android) y mejorar la ergonomía de la interfaz de grabación.

- **Resolución Error `MPEGMode`:** Corregido fallo crítico de referencia en `services/audioConcat.ts` que impedía la conversión a MP3 en Safari/iOS mediante un polyfill defensivo para la librería `lamejs`.
- **Bloqueo de Interacciones del Sistema:** Implementado CSS (`user-select`, `touch-callout`) e intercepción de `onContextMenu` en botones de control para evitar que el selector de texto o la lupa de iOS interfieran con la grabación.
- **Refuerzo de UX (Hold to Action):** 
    - Ajustados tiempos de mantenimiento: **2s para Pausa** y **3s para Detener**.
    - Etiquetas refinadas a **"Hold (2s)"** y **"Hold (3s)"** con tipografía normal y color negro para máxima legibilidad.
- **Corrección de Errores Críticos:**
    - **Detail View Deletion:** Reparado el flujo de borrado en la vista de detalle de grabaciones; ahora se sincroniza correctamente con la base de datos y la barra lateral.
- **Auditoría de Sistema:** Realizada revisión técnica completa (Frontend/Backend/APIs) para asegurar la integridad previa al despliegue masivo. Lanzamiento aprobado.
- **GitHub Sync:** Todas las mejoras integradas en la rama `main`.

---

## 📅 30 Enero 2026: Modernización del Núcleo de IA

### 🤖 Migración a Gemini 2.5 Flash & Pro (Estable)
**Objetivo:** Asegurar la longevidad del sistema y mejorar la calidad de las respuestas antes de la depreciación de Gemini 2.0.

- **Auditoría de Modelos:** Identificada dependencia de modelos experimentales (`gemini-2.0-flash-exp`). Se detectó que Google dará de baja estas versiones el 31 de marzo de 2026.
- **Actualización a Producción (v2.5):**
    - **Motor de Procesamiento:** Implementado **Gemini 2.5 Flash** para transcripciones, resúmenes automáticos y el bot de soporte. Esto garantiza estabilidad y menor latencia.
    - **Mejora de Inteligencia (Chat):** Actualizado el modelo de chat a **Gemini 2.5 Pro**, habilitando un razonamiento superior para análisis complejos de grabaciones y una ventana de contexto de 1M de tokens.
- **Robustez del Servicio:** Refinada la lógica de *fallback* en el backend (`api/ai.ts`) para priorizar modelos estables y asegurar continuidad de servicio.
- **Documentación Técnica:** Creado análisis profundo sobre la hoja de ruta de Google Gemini (v2.5, v3) y recomendaciones para futuras integraciones.

---

## 📅 Febrero 2026: Refinamiento de Producto y Monetización

### 💰 Programa de Afiliados y Pagos
**Objetivo:** Escalar la adquisición de usuarios mediante incentivos y simplificar la gestión financiera.

- **Fidelización con Afiliados:** Implementada página de `/affiliates` y sistema de tracking basado en Lemon Squeezy. Esto permite a los usuarios recomendar Diktalo y recibir comisiones automáticamente.
- **Lemon Squeezy vs. Stripe:** Se formalizó la decisión de utilizar Lemon Squeezy como *Merchant of Record* principal. Esto garantiza que Diktalo no tenga que gestionar impuestos locales o facturación internacional manualmente.
- **Traducciones:** Corregidos mix de idiomas en la página de afiliados y añadido soporte bilingüe completo para strings de "Social Proof".

### 🎨 Refinamiento de UI/UX (Landing & Dashboard)
**Objetivo:** Elevar la percepción de calidad visual y corregir fricciones en dispositivos móviles.

- **Landing Page Re-balanceada:**
    - **Sección Blog:** Centrado de cabecera y botón en móviles para evitar el "espacio vacío" lateral.
    - **Visualizador de Funciones:** Restructurado el componente `Features.tsx` para móviles; ahora los elementos se apilan verticalmente evitando solapamientos entre imagen y texto.
- **Funcionalidad "Watch Demo":** Corregido el enlace de ancla; ahora el botón desplaza al usuario suavemente hasta el reproductor de vídeo principal.
- **Automatización Editorial (Newsroom):**
    - Implementado sistema de descubrimiento de noticias y generación de contenido de autoridad.
    - Configurado **GitHub Actions** para publicar automáticamente 3 veces por semana (Lunes, Miércoles, Viernes).
    - Creado script `automated_newsroom.ts` que inyecta artículos directamente en el blog y genera copias para redes sociales (X, LinkedIn, Instagram).
    - Documentada la integración con **Make.com** para el cross-posting automatizado.
- **GitHub Sync:** Todas las iteraciones de diseño, lógica de pagos y automatización sincronizadas con la rama principal.
