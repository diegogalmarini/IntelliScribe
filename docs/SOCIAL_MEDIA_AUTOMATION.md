# Guía de Automatización en Redes Sociales (Social Media Cross-Posting)

Diktalo utiliza un sistema de "Webhooks" para enviar automáticamente los contenidos generados a redes sociales sin necesidad de gestionar APIs complejas (X, LinkedIn, Instagram) directamente en el código.

## 1. Arquitectura del Flujo
1. **GitHub Action**: Se activa los lunes, miércoles y viernes a las 10:00 UTC.
2. **Newsroom Engine**: Genera el artículo del blog y las piezas de redes sociales.
3. **Webhook Trigger**: Envía un JSON con los contenidos a una URL externa.
4. **Make.com / Buffer**: Recibe el JSON y lo distribuye a las plataformas vinculadas.

## 2. Configuración en Make.com (Recomendado)

### Paso A: Crear un Escenario
1. Añade un módulo de **Webhooks > Custom Webhook**.
2. Copia la URL generada (ej: `https://hook.make.com/xxxxxx`).
3. Pega esta URL en los Secretos de GitHub como `SOCIAL_WEBHOOK_URL`.

### Paso B: Conectar Canales
- **Módulo X (Twitter)**: Configura "Create a Tweet". Usa el campo `twitter_copy` del JSON.
- **Módulo LinkedIn**: Configura "Create an Organization Share". Usa `linkedin_copy`.
- **Módulo Instagram**: Configura "Create a Photo Post". Usa `instagram_prompt` para generar la imagen (vía DALL-E) y `instagram_caption` para el texto.

## 3. Secretos de GitHub Necesarios
Para que la automatización funcione, debes configurar estos secretos en `Settings > Secrets and variables > Actions`:

| Secreto | Descripción |
| :--- | :--- |
| `GEMINI_API_KEY` | Tu llave de Google AI Studio para escribir los artículos. |
| `SOCIAL_WEBHOOK_URL` | La URL de Make.com o Buffer para el cross-posting. |
| `GITHUB_TOKEN` | (Automático) Permite al Bot subir el nuevo `blogData.ts`. |

## 4. Pruebas Manuales
Puedes disparar la automatización manualmente desde la pestaña **Actions** en GitHub seleccionando el workflow "Diktalo Newsroom Automation" y haciendo clic en **Run workflow**.

---

**Nota:** El sistema está diseñado para fallar de forma segura (Graceful Degradation). Si el webhook falla, el artículo del blog se publicará de todos modos, pero los posts sociales no se enviarán.
