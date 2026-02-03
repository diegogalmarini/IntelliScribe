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

## 4. AUTORES REALES DEL EQUIPO (OBLIGATORIO)

**REGLA CRÍTICA**: SOLO usar autores de esta lista. NUNCA inventar nombres ficticios.

### Listado Oficial de Avatares (11 personas):

| Nombre | Rol/Expertise | Imagen Avatar |
|--------|--------------|---------------|
| **Alexander** | N/A | `/images/avatars/alexander.webp` |
| **Anya Desai** | Strategic Systems Architect | `/images/avatars/anya-desai.webp` |
| **Camila** | N/A | `/images/avatars/camila.webp` |
| **Elena** | N/A | `/images/avatars/elena.webp` |
| **Isabella** | N/A | `/images/avatars/isabella.webp` |
| **Klaus** | N/A | `/images/avatars/klaus.webp` |
| **Leo Costa** | Strategic Architecture | `/images/avatars/leo-costa.webp` |
| **Nati Pol** | Experience Strategy | `/images/avatars/nati-pol.webp` |
| **Rohan Patel** | Infrastructure Lead | `/images/avatars/rohan-patel.webp` |
| **Sophie** | N/A | `/images/avatars/sophie.webp` |
| **Victoria** | N/A | `/images/avatars/victoria.webp` |

### Protocolo de Asignación de Autores:

1. **Seleccionar por temática**:
   - Artículos de infraestructura/seguridad → Rohan Patel
   - Contenido de estrategia/arquitectura → Leo Costa o Anya Desai
   - UX/Producto → Nati Pol
   - Otros temas → Rotar entre el resto del equipo

2. **Formato al crear contenido**:
```typescript
author: "Nombre Apellido",  // DEBE estar en la lista oficial
authorRole: "Rol específico",  // Si existe en la tabla
authorImage: "/images/avatars/nombre-archivo.webp",  // Path exacto
authorLinkedIn: "https://linkedin.com/in/username"  // Opcional
```

3. **Validación Obligatoria**: Antes de generar contenido, verificar que el autor existe en la lista oficial de avatares.

## 5. Instrucciones de Uso para el Agente

Cuando generes contenido para el blog de Diktalo:

1. ✅ **Verifica** que el autor que vas a usar está en la lista oficial arriba
2. ✅ **Usa el path exacto** del avatar (no inventes rutas)
3. ✅ **Asigna roles coherentes** con la expertise del autor
4. ❌ **NUNCA inventes** nombres como "Nati Ruiz", "Product Manager IA", etc.
5. ❌ **NUNCA uses** paths de imágenes que no existan en `/images/avatars/`

## 6. Ejemplo de Autor Correcto:

```typescript
{
  author: "Leo Costa",
  authorRole: "Strategic Architecture", 
  authorImage: "/images/avatars/leo-costa.webp",
  authorLinkedIn: "https://linkedin.com/in/leocosta"
}
```

## 7. Ejemplo de Autor INCORRECTO (NO HACER):

```typescript
{
  author: "Nati Ruiz",  // ❌ No existe
  authorRole: "Product Design",  // ❌ Rol inventado
  authorImage: "/images/avatars/nati-profile.webp"  // ❌ Archivo inexistente
}
```