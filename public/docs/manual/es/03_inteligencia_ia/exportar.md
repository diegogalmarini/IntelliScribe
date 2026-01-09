
# Portabilidad y Exportación de Datos

Tu información no está atrapada en Diktalo. Diseñamos nuestra plataforma con la filosofía de **Interoperabilidad Total**: tus datos son tuyos y deben fluir libremente hacia el resto de tu ecosistema de productividad (CRM, ERP, Gestión Documental).

El motor de exportación convierte la inteligencia cruda (transcripciones) y sintetizada (resúmenes) en formatos estándar de la industria.

![Modal de Exportación](/docs/screenshots/es/export/01_export_modal.png)

---

## Formatos de Salida

Selecciona el vehículo adecuado para tu información según el destinatario.

### 📄 Documento PDF (Reportes Oficiales)
**La presentación ejecutiva por excelencia.**
Genera un informe con diseño editorial, listo para ser enviado a un cliente o archivado en carpetas de proyecto.
*   **Contenido:** Portada, Resumen Ejecutivo, Notas destacadas y Transcripción completa.
*   **Caso de uso:** Minutas de reunión para inversores, reportes mensuales.

### 📘 Microsoft Word / DOCX (Borradores Editables)
**El punto de partida para tu trabajo.**
¿Necesitas convertir una transcripción en un artículo de blog o una propuesta comercial? Exporta a Word para tener un borrador avanzado que puedes pulir y formatear.
*   **Caso de uso:** Creación de contenido, redacción de contratos legales.

### 📝 Texto Plano / TXT (Máxima Compatibilidad)
**Datos puros, sin ruido.**
Ideal para copiar y pegar en herramientas que no soportan formato rico, como campos de notas en Salesforce, HubSpot o Notion.
*   **Caso de uso:** Alimentar otros LLMs, archivar en sistemas legacy.

### 🔧 JSON (Integración Técnica)
**Para desarrolladores y automatización.**
Exporta la estructura de datos completa, incluyendo metadatos, timestamps por palabra e identificación de oradores.
*   **Caso de uso:** Entrenar modelos propios, ingesta en bases de datos SQL/NoSQL.

---

## Configuración de Exportación

Antes de descargar, puedes personalizar qué capas de información incluir:

1.  **Marcas de Tiempo (Timestamps):**
    *   *Activado:* `[14:02] Juan: Estoy de acuerdo.` (Ideal para referencias legales).
    *   *Desactivado:* `Juan: Estoy de acuerdo.` (Mejor para lectura fluida).

2.  **Identificación de Oradores:**
    *   Si la IA no etiquetó correctamente a alguien, edita los nombres en el editor antes de exportar para que el documento final sea perfecto.

3.  **Capas de Inteligencia:**
    *   Puedes decidir excluir la transcripción literal y descargar **solo el resumen** si buscas un documento ejecutivo de 1 página.

---

## Flujos de Trabajo Recomendados

### Ciclo de Ventas (CRM)
1.  Graba la llamada con el cliente.
2.  Genera un resumen con la plantilla "Ventas".
3.  Exporta a **Texto Plano**.
4.  Pega el resultado en la ficha de oportunidad de tu CRM (Salesforce/Pipedrive).

### Ciclo Legal (Compliance)
1.  Graba la deposición o negociación.
2.  Exporta a **PDF con Timestamps**.
3.  Firma digitalmente el PDF y archívalo como prueba inmutable.

### Ciclo Creativo (Marketing)
1.  Graba tu sesión de brainstorming caminando.
2.  Exporta a **Word**.
3.  Edita el flujo de ideas para crear el guion de tu próximo video o podcast.
