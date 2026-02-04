---
name: media-automator
description: "Sistema de automatización editorial. Detecta tendencias de IA/Voz, genera artículos de autoridad y orquestra posteos en X, LinkedIn e Instagram."
---

# Diktalo Media Automator 🚀

Este skill permite a Diktalo mantener una presencia activa y automatizada en la web y redes sociales mediante el análisis de noticias en tiempo real.

## 1. Detección de Inteligencia (News Hunting)
- **Fuentes de Confianza**: Google News (AI section), MIT Technology Review, TechCrunch, Twitter Trends (vía search_web).
- **Filtros de Relevancia**:
    - Avances en **Whisper/Speech-to-Text**.
    - Privacidad y Soberanía de Datos en la UE (**AI Act**).
    - Productividad y Automatización de Reuniones.
    - Casos de uso de IA en **Real Estate**, **Fintech** y **Legal**.

## 2. Protocolo de "Diktalo Mirror" (News -> Product)
Cada noticia debe "reflejarse" en una ventaja competitiva de Diktalo:
- *Noticia sobre falta de privacidad* → Resaltar **Soberanía de Datos/SOC 2** de Diktalo.
- *Noticia sobre nuevos modelos de IA* → Linkar con la **velocidad de procesamiento** de Diktalo.
- *Noticia sobre fatiga de Zoom* → Resaltar **resúmenes automáticos y asincronismo**.

## 3. Matriz de Adaptación Multicanal

### A. Blog (Diktalo Web)
- **SOP**: Seguir estrictamente `diktalo-content-master-v5`.
- **Extensión**: >2,500 caracteres.
- **Acción**: Actualizar `utils/blogData.ts`.

### B. X (Twitter)
- **Formato**: Hilo de 3-5 posts o Post corto de alto impacto.
- **Tono**: Provocador, directo, "fricción cero".
- **CTA**: Link al artículo del blog.

### C. LinkedIn
- **Formato**: Post profesional extenso con viñetas.
- **Tono**: Autoritativo, enfocado a B2B y CTOs.
- **Visual**: Recomendar un gráfico o tabla comparativa.

### D. Instagram
- **Formato**: Carrusel de 3 slides (Concepto -> Solución Diktalo -> CTA).
- **Visual**: Prompt para generación de imagen (minimalista, tecnológico, premium).

## 4. Orquestación y Automatización
- **Trigger**: GitHub Action (Cron: 3x/semana).
- **Proceso**:
    1. `detect_news.ts`: Busca y selecciona el "Top News" de la semana.
    2. `generate_drafts.ts`: Crea 1 Artículo + 3 Posts Sociales usando Gemini.
    3. `commit_and_post.ts`: Commitea al repo y dispara webhooks de social media.

## 5. Reglas de Seguridad
- NUNCA postear información sensible del usuario.
- NUNCA usar nombres de autores fuera del listado oficial en `diktalo-content-master-v5`.
- Los links siempre deben apuntar a `diktalo.com` o fuentes de alta autoridad (.gov, .edu, top tech).
