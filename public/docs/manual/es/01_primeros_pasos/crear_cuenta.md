
# Iniciar en Diktalo: Tu Cuenta Corporativa

Bienvenido al ecosistema de inteligencia de voz de Diktalo. Configurar tu cuenta es el primer paso para desbloquear un "segundo cerebro" capaz de procesar, analizar y conectar todas tus conversaciones de negocios.

Esta guía técnica te acompañará en el proceso de alta, autenticación segura y configuración inicial.

![Página Principal de Diktalo](/docs/screenshots/es/onboarding/01_landing_hero.png)

---

## Métodos de Autenticación

Diktalo utiliza protocolos de seguridad de estándar bancario para gestionar tu identidad. Recomendamos encarecidamente el uso de proveedores de identidad (IdP) como Google para garantizar la máxima protección de tus datos.

### 1. Google Workspace (SSO) - Recomendado
El método estándar para entornos corporativos. Permite el acceso sin contraseña (passwordless), reduciendo vectores de ataque y simplificando el acceso.

1.  En la pantalla de acceso, selecciona el botón **"Continuar con Google"**.
2.  Selecciona tu cuenta corporativa (`@tuempresa.com`) o personal.
3.  **Permisos:** Diktalo solicitará acceso básico al perfil (nombre, email, foto). *No accedemos a tus correos, drive ni calendario sin permiso explícito posterior.*

**Ventajas de seguridad:**
- Autenticación de dos factores (2FA) delegada en Google.
- Revocación de acceso centralizada desde tu admin de Workspace.

![Botón de Google OAuth](/docs/screenshots/es/onboarding/03_login_google.png)

### 2. Autenticación por Correo (Magic Link)
Si prefieres no vincular proveedores externos, puedes utilizar nuestro sistema de credenciales seguras.

1.  Selecciona "Crear Cuenta".
2.  Introduce tu correo profesional.
3.  Define una contraseña de alta entropía (Mínimo 8 caracteres, al menos un número y símbolo).
4.  **Verificación:** Recibirás un enlace de activación con validez de 15 minutos.

---

## Primeros Pasos en el Dashboard

Una vez autenticado, aterrizarás en tu **Panel de Control (Dashboard)**. Este es tu centro de comando para la inteligencia de audio.

### Tu cuenta incluye (Plan Free)
Todo usuario nuevo comienza con un nivel de servicio gratuito diseñado para pruebas de concepto y uso ligero:
*   **Capacidad:** 24 minutos de procesamiento de IA mensual.
*   **Retención:** Historial de grabaciones de 7 días.
*   **Motor:** Transcripción estándar y Chat conversacional básico.

> **Nota para equipos:** Si perteneces a una organización Enterprise, contacta a tu administrador para que te envíe una invitación directa y te añada a la licencia corporativa.

---

## Solución de Problemas de Acceso

**"Este correo ya está registrado"**
Es posible que hayas intentado iniciar sesión con Google y luego crear una cuenta manual (o viceversa). El sistema unifica la identidad por correo. Intenta iniciar sesión con el método original que utilizaste.

**No llega el correo de verificación**
*   Verifica la carpeta de **Spam** o **Cuarentena** de tu servidor de correo corporativo.
*   Asegúrate de permitir correos de `noreply@diktalo.com`.
*   Si usas firewall corporativo (VPN), intenta acceder desde una red externa por primera vez.

---

## Siguiente Nivel

Tu cuenta está activa. Es hora de capturar tu primera fuente de datos.

1.  🎙️ [Activar la Grabadora Web](../02_metodos_grabacion/grabadora_web.md)
2.  📂 [Subir un archivo histórico](../02_metodos_grabacion/subir_archivos.md)
3.  ⚙️ [Configurar tu perfil](../05_ajustes/configuracion.md)
