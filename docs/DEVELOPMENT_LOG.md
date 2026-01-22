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
