---
title: "Exportar Transcripciones y Resúmenes"
category: "Inteligencia IA"
difficulty: "Principiante"
tags: ["export", "exportar", "pdf", "doc", "word", "txt", "json"]
last_updated: "2026-01-09"
---

# Exportar Transcripciones y Resúmenes

Diktalo te permite **descargar tus grabaciones procesadas** en múltiples formatos para usar en otros programas, compartir con tu equipo, o archivar.

![Modal de Exportación](/docs/screenshots/es/export/01_export_modal.png)

---

## Formatos Disponibles

### 📄 Plain Text (TXT)
**Mejor para:**
- Copiar/pegar en otros documentos
- Editar la transcripción manualmente
- Máxima compatibilidad

**Incluye:**
- Transcripción completa sin formato
- Marcas de tiempo opcionales

**Tamaño:** ~20KB por 30 min de audio

---

### 🗂️ JSON
**Mejor para:**
- Desarrolladores/integraciones
- Análisis automatizado
- Procesamiento programático

**Incluye:**
```json
{
  "id": "rec_123",
  "title": "Reunión Q1",
  "duration": 1845,
  "transcript": {...},
  "segments": [...],
  "notes": [...],
  "metadata": {...}
}
```

**Tamaño:** ~50KB por 30 min de audio

---

### 📕 PDF
**Mejor para:**
- Presentaciones profesionales
- Compartir con clientes
- Imprimir

**Incluye:**
- **Portada** con título, fecha, duración
- **Transcripción formateada** con párrafos
- **Notas** (si las añadiste durante la grabación)
- **Resumen automático** (si lo generaste)
- Pie de página con "Generado por Diktalo"

**Tamaño:** ~100-200KB por 30 min de audio

**Ventajas:**
- ✅ No requiere software especial para abrir
- ✅ Se ve igual en cualquier dispositivo
- ✅ Ideal para enviar por email

---

### 📘 Word (DOCX)
**Mejor para:**
- Editar la transcripción
- Añadir comentarios/anotaciones
- Formato corporativo

**Incluye:**
- Todo lo del PDF pero **editable**
- Formato de párrafos
- Estilos de título

**Tamaño:** ~80KB por 30 min de audio

**Ventajas:**
- ✅ Compatible con Microsoft Word, Google Docs, LibreOffice
- ✅ Puedes ajustar formato, colores, fuentes
- ✅ Añadir tu logo corporativo

---

## Cómo Exportar

### Paso 1: Abrir Modal
1. Desde el dashboard, haz clic en la **grabación** que quieres exportar
2. En la vista de detalle, haz clic en el botón **"Exportar"** (icono de descarga)
3. Se abre el modal de exportación

### Paso 2: Seleccionar Formato
1. Haz clic en el formato deseado:
   - **Plain Text (TXT)**
   - **JSON**
   - **PDF**
   - **Word (DOCX)**

### Paso 3: Descargar
1. El archivo se descarga automáticamente
2. Ubicación: Carpeta de descargas de tu navegador
3. Nombre: `[Título-Grabación]_[Fecha].[formato]`

**Ejemplo:** `Reunion-Q1_2026-01-09.pdf`

---

## Opciones Avanzadas

### Incluir/Excluir Elementos

Antes de exportar, puedes configurar:

**Marcas de Tiempo**
- ✅ Activado: `[00:12:34] Juan: Creo que deberíamos...`
- ❌ Desactivado: `Juan: Creo que deberíamos...`

**Notas**
- ✅ Incluir notas que añadiste durante la grabación
- ❌ Solo transcripción

**Resumen**
- ✅ Incluir resumen generado (si existe)
- ❌ Solo transcripción original

### Idioma del Documento

Si generaste transcripción en múltiples idiomas o tienes resumen traducido:
- Selecciona el idioma de salida
- Útil para equipos multilingües

---

## Usos Comunes

### 1. Actas de Reunión (PDF o DOCX)
**Flujo:**
1. Graba reunión semanal
2. Genera [resumen con plantilla](./resumenes_plantillas.md) "Minuta de Reunión"
3. Exporta como **PDF**
4. Comparte por email con asistentes

**Resultado:** Acta profesional lista en 5 minutos.

---

### 2. Análisis de Entrevistas (JSON)
**Flujo:**
1. Sube 10 entrevistas de investigación
2. Exporta cada una como **JSON**
3. Usa Python/R para análisis de palabras clave

**Resultado:** Datos estructurados listos para procesamiento.

---

### 3. Documentación de Proyecto (DOCX)
**Flujo:**
1. Graba sesión de brainstorming
2. Exporta como **Word**
3. Edita, añade secciones, da formato corporativo
4. Integra en documentación del proyecto

**Resultado:** Documento editable con el contenido capturado.

---

### 4. Archivo Legal/Compliance (PDF)
**Flujo:**
1. Graba conversación importante (negociación, consultoría)
2. Exporta como **PDF con marcas de tiempo**
3. Archiva como prueba documental

**Resultado:** Registro inmutable con timestamps.

---

## Diferencias entre Formatos

| Característica | TXT | JSON | PDF | DOCX |
|--------------|-----|------|-----|------|
| **Editable** | ✅ Texto plano | ✅ Código | ❌ Fijo | ✅ Formato |
| **Profesional** | ❌ Básico | ❌ Técnico | ✅ Presentable | ✅ Corporativo |
| **Datos estructurados** | ❌ | ✅ | ❌ | ❌ |
| **Tamaño** | Pequeño | Mediano | Grande | Mediano |
| **Compatibilidad** | Universal | Desarrolladores | Universal | Office |

**Recomendación general:**
- **Uso interno/edición:** DOCX
- **Compartir oficialmente:** PDF
- **Archivo simple:** TXT
- **Automatización/código:** JSON

---

## Exportación Masiva *(Próximamente)*

Podrás exportar **múltiples grabaciones** a la vez:

1. Selecciona grabaciones con checkbox
2. "Exportar seleccionadas"
3. Descarga un `.zip` con todos los archivos

**Útil para:**
- Backup mensual
- Entregar paquete completo a cliente
- Migración a otro sistema

---

## Límites y Consideraciones

### Tamaño Máximo
- Grabaciones de hasta **3 horas** se exportan sin problema
- Grabaciones **>3 horas**: El PDF puede ser muy grande (>10MB)
  - Solución: Exporta como TXT o DOCX y genera PDF manualmente

### Calidad de Transcripción
- La exportación refleja la **transcripción original**
- Si editaste manualmente la transcripción en la app, esos cambios **SÍ se reflejan**

### Privacidad
- Los archivos exportados **NO tienen DRM ni marcas de agua invasivas**
- Solo llevan "Generado por Diktalo" en pie de página (PDF/DOCX)
- Puedes remover esa marca editando el DOCX

---

## Problemas Comunes

### Descarga no inicia
**Solución:**
- Verifica que tu navegador permite descargas desde diktalo.com
- Revisa bloqueadores de popups
- Usa Chrome/Edge/Firefox actualizado

### PDF/DOCX se ve mal
**Solución:**
- Abre con visor actualizado (Adobe Reader, Word, Google Docs)
- Si los acentos se ven raros: problema de encoding, usa TXT

### Archivo muy pesado
**Solución:**
- Exporta solo transcripción (sin resumen ni notas)
- Usa TXT en lugar de PDF
- Comprime el archivo (ZIP) antes de enviar por email

---

## Próximos Pasos

✅ **Ya sabes exportar!** Ahora puedes:

1. 📊 [Generar resúmenes con plantillas](./resumenes_plantillas.md)
2. 🤖 [Usar ASK Diktalo](./ask_diktalo.md)
3. 📁 [Organizar tus grabaciones](../04_organizacion/carpetas.md)

---

## ¿Necesitas Ayuda?

- 💬 **Chat en vivo:** Widget Crisp (esquina inferior derecha)
- 📧 **Email:** contacto@diktalo.com
- 📚 **Manual completo:** [Ver índice](../README.md)
