# 🎨 Filosofía de Diseño y Decisiones Clave

Diktalo no es solo una herramienta, es una experiencia. Este documento explica el "por qué" de nuestras decisiones de diseño más importantes.

---

## 1. Humanización de la IA (El SupportBot)
**Decisión:** Dotar al sistema de soporte de múltiples personalidades con trasfondo humano.
- **Razón:** En un mundo lleno de chatbots genéricos, la personalización genera confianza. Al saber que "Raúl vive en Madrid y le gusta el pádel", el usuario baja la guardia y la interacción se vuelve más fluida.
- **Implementación:** `SupportBot.tsx` elige aleatoriamente un perfil en cada carga, manteniendo la frescura de la experiencia.

## 2. Minimalismo Radical (Dashboard Unificado)
**Decisión:** Eliminar barras laterales estáticas y menús complejos.
- **Razón:** El foco de Diktalo es el audio y su inteligencia. Todo lo demás (ajustes, planes) debe aparecer solo cuando se necesita.
- **Diseño:** Uso masivo de modales con `framer-motion` para transiciones suaves y `glassmorphism` (efecto cristal) para dar una sensación premium.

## 3. Micro-interacciones y Feedback (Adaptive UI)
**Decisión:** El botón de chat debe "sentir" el espacio.
- **Razón:** Una interfaz que se adapta a las acciones del usuario (como el arrastre) se siente más "viva".
- **Efecto Parallax:** Si mueves el botón a la izquierda, la ventana se abre a la derecha. Este tipo de detalles elevan el producto de "funcional" a "premium".

## 4. Estrategia "Show, Don't Hide" (Monetización)
**Decisión:** Mostrar las funciones premium a los usuarios FREE con iconos de candado o indicadores visuales.
- **Razón:** Si un usuario no sabe qué existe la función de "Análisis con IA", nunca sentirá la necesidad de comprar el plan Pro.
- **UX:** El `UpgradeModal` no es agresivo; es informativo, resaltando el valor de lo que el usuario está a punto de desbloquear.

---

## 🛠️ Tecnologías Elegidas
- **React + Vite:** Para una velocidad de desarrollo y tiempo de carga instantáneo.
- **Tailwind CSS:** Para un diseño consistente y altamente adaptable.
- **Framer Motion:** Para animaciones que no solo decoran, sino que guían la vista del usuario.
- **Google Gemini 1.5:** Elegido por su ventana de contexto masiva, crucial para analizar grabaciones de varias horas.
