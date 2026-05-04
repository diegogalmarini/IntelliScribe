---
name: Consultar skills antes de decisiones de IA o arquitectura
description: Nunca decidir sobre modelos Gemini o arquitectura sin leer primero los skills del proyecto
type: feedback
---

Antes de cualquier decisión sobre modelos de IA, integraciones o arquitectura, leer primero los archivos en `.agent/skills/`.

**Why:** Un agente anterior migró código a Gemini 1.5 (familia depreciada) sin consultar la skill de modelos. Tuvo que revertirse. La skill `optimizing-gemini-models` es "La Biblia" del proyecto — contiene la tabla de modelos válidos, prohibidos y su uso por caso de uso.

**How to apply:** Ante cualquier mención de un modelo Gemini, una integración nueva o un cambio de arquitectura, abrir `.agent/skills/optimizing-gemini-models/SKILL.md` antes de escribir código. Si la skill está desactualizada respecto a la documentación oficial de Google, actualizarla primero.
