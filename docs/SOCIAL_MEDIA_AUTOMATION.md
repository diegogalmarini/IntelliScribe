# Guía de Automatización en Redes Sociales (Social Media Cross-Posting)

Diktalo utiliza un sistema de "Webhooks" para enviar automáticamente los contenidos generados a redes sociales sin necesidad de gestionar APIs complejas (X, LinkedIn, Instagram) directamente en el código.

## 1. Arquitectura del Flujo
1. **GitHub Action**: Se activa los lunes, miércoles y viernes a las 10:00 UTC.
2. **Newsroom Engine**: Genera el artículo del blog y las piezas de redes sociales.
3. **Webhook Trigger**: Envía un JSON con los contenidos a una URL externa.
4. **Make.com / Buffer**: Recibe el JSON y lo distribuye a las plataformas vinculadas.

## 2. Configuración en Redes (Agnóstico)

El sistema envía un JSON con esta estructura a tu Webhook:
```json
{
  "twitter_copy": "...",
  "linkedin_copy": "...",
  "instagram_caption": "...",
  "instagram_prompt": "..."
}
```

### Opción A: n8n (Recomendado - Tu Servidor Propio) 🚀
1. **Webhook Node**: Crea un nodo "Webhook" en n8n.
   - HTTP Method: `POST`
   - Path: `diktalo-newsroom`
2. **Social Nodes**: Conecta el Webhook a los nodos de:
   - **X (Twitter)**: Usa el campo `twitter_copy`.
   - **LinkedIn**: Usa `linkedin_copy`.
   - **OpenAI/DALL-E**: (Opcional) Pasa el `instagram_prompt` para generar la imagen y luego envíala al nodo de **Instagram**.

### Opción B: Make.com

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
