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
  "twitter": "...",
  "linkedin": "...",
  "instagram": "..."
}
```

### Opción A: Make.com (Recomendado - Gratuito y Fiable) 🚀
1. **Paso Inicial**: Crea una cuenta en [Make.com](https://www.make.com).
2. **Webhook Node**: Crea un módulo de **Webhooks > Custom Webhook**.
3. **Configuración en GitHub**: Copia la URL generada y pégala en los Secretos de GitHub como `SOCIAL_WEBHOOK_URL`.
4. **Social Modules**:
    - **X (Twitter) - Método Expert (OAuth 2.0)**:
      1. Selecciona el módulo **HTTP > Make an OAuth 2.0 request**.
      2. Crea una conexión con estas URLs de X:
         - **Authorize URI**: `https://twitter.com/i/oauth2/authorize`
         - **Token URI**: `https://api.twitter.com/2/oauth2/token`
         - **Scope**: `tweet.read tweet.write users.read offline.access`
      3. **Configuración del Request**:
         - **URL**: `https://api.twitter.com/2/tweets`
         - **Method**: `POST`
         - **Body Type**: `Raw (JSON)`
         - **Content**: `{"text": "{{1.twitter}}" }` (Mapea el campo `twitter` del Webhook).
    - **LinkedIn**: Usa el módulo nativo con el campo `linkedin`.
    - **Instagram**: Usa el módulo nativo con el campo `instagram`.

### Opción B: n8n (Si reactivas tu servidor)
1. **Webhook Node**: Crea un nodo "Webhook" (`POST`) con el path `diktalo-newsroom`.
2. **Conexión**: Sigue el mismo proceso de mapeo de campos (`twitter`, etc.) que en Make.

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
