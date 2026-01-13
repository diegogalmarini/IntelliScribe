
# Getting Started with Diktalo: Your Corporate Account

Welcome to the Diktalo voice intelligence ecosystem. Setting up your account is the first step to unlocking a "second brain" capable of processing, analyzing, and connecting all your business conversations.

This technical guide will accompany you through the registration process, secure authentication, and initial configuration.

![Diktalo Main Page](/docs/screenshots/es/onboarding/01_landing_hero.png)

---

## Authentication Methods

Diktalo uses bank-standard security protocols to manage your identity. We strongly recommend using Identity Providers (IdP) like Google to ensure maximum protection of your data.

### 1. Google Workspace (SSO) - Recommended
The standard method for corporate environments. It allows passwordless access, reducing attack vectors and simplifying access.

1.  On the login screen, select the **"Continue with Google"** button.
2.  Select your corporate account (`@yourcompany.com`) or personal account.
3.  **Permissions:** Diktalo will request basic profile access (name, email, photo). *We do not access your emails, drive, or calendar without explicit subsequent permission.*

**Security Advantages:**
- Two-Factor Authentication (2FA) delegated to Google.
- Centralized access revocation from your Workspace admin.

![Google OAuth Button](/docs/screenshots/es/onboarding/03_login_google.png)

### 2. Email Authentication (Magic Link)
If you prefer not to link external providers, you can use our secure credential system.

1.  Select "Create Account".
2.  Enter your professional email.
3.  Define a high-entropy password (Minimum 8 characters, at least one number and symbol).
4.  **Verification:** You will receive an activation link valid for 15 minutes.

---

## First Steps in the Dashboard

Once authenticated, you will land on your **Control Panel (Dashboard)**. This is your command center for audio intelligence.

### Your Account Includes (Free Plan)
Every new user starts with a free service level designed for proof of concept and light use:
*   **Capacity:** 24 minutes of AI processing monthly.
*   **Retention:** 7-day recording history.
*   **Engine:** Standard transcription and basic conversational Chat.

> **Note for Teams:** If you belong to an Enterprise organization, contact your administrator to send you a direct invitation and add you to the corporate license.

---

## Access Troubleshooting

**"This email is already registered"**
You may have tried logging in with Google and then creating a manual account (or vice versa). The system unifies identity by email. Try logging in with the original method you used.

**Verification email not arriving**
*   Check the **Spam** or **Quarantine** folder of your corporate email server.
*   Ensure you allow emails from `noreply@diktalo.com`.
*   If using a corporate firewall (VPN), try accessing from an external network for the first time.

---

## Next Level

Your account is active. It's time to capture your first data source.

1.  🎙️ [Activate Web Recorder](../02_metodos_grabacion/grabadora_web.md)
2.  📂 [Upload a historical file](../02_metodos_grabacion/subir_archivos.md)
3.  ⚙️ [Configure your profile](../05_ajustes/configuracion.md)
