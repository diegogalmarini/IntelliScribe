---
name: diktalo-content-master-v5
description: "SOP de Ingeniería de Contenido. Genera activos de autoridad >2500 caracteres, optimizados para SEO/AEO/GEO y entrega técnica limpia."
---

# Diktalo Content Master V5 🧠

## 1. Protocolo de Extensión y Autoridad (Hard Constraints)
- **Umbral de Calidad**: Prohibido generar contenido de menos de **2,500 caracteres**. 
- **Validación Interna**: Si el borrador es corto, el agente DEBE expandir usando: 
    - Secciones de "Impacto por Industria".
    - "Guía de Implementación Paso a Paso".
    - "FAQ Técnica" basada en entidades LSI.
- **E-E-A-T**: Todo dato técnico debe sonar a "experto senior", evitando generalidades de IA.

## 2. Ingeniería de Estructura (Arquitectura AEO/GEO)
- **Párrafo 0 (Snippet Trigger)**: Respuesta directa y técnica de entre 40-50 palabras al inicio.
- **Data First**: Es obligatorio incluir una **Tabla Markdown** comparativa o de Roadmap.
- **Chunking Estricto**: Párrafos de 3-4 líneas máximo para legibilidad móvil y escaneo de LLMs.

## 3. Protocolo de Entrega "Zero-Glitch"
Para evitar errores visuales (como el del footer), el output se dividirá en bloques estancos:

### [BLOQUE 1: CONTENIDO VISUAL PARA EL BLOG]
- Texto limpio en Markdown.
- Sin scripts, sin código JSON. Solo lectura humana.

### [BLOQUE 2: ESTRATEGIA DE METADATOS]
- **Slug**: Formato `palabra-clave-principal-2026`.
- **SEO Title & Description**: Optimizados para CTR.

### [BLOQUE 3: CAPA TÉCNICA (JSON-LD)]
- **Formato**: Bloque de código puro.
- **Instrucción**: "Inyectar este código exclusivamente en el <head> o bloque de scripts del CMS. NO pegar en el cuerpo del artículo."