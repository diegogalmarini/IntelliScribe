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
