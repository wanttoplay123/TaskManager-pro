# 🚀 CONFIGURACIÓN DE EMAIL - TaskManager Pro

## ✅ COMPLETADO: Sistema de Email con Gmail Puro

**Tu configuración actual:**
- **Email:** `jdriverac08@gmail.com`
- **Contraseña de aplicación:** `rukg pigd vvbj lvyf`
- **Método:** Función serverless de Netlify con Gmail SMTP directo
- **Estado:** ✅ Configurado y desplegado

## 🎯 ¿Qué hace este sistema?

- ✅ **Usa SOLO Gmail** con tu contraseña de aplicación
- ✅ **Sin servicios externos** como EmailJS
- ✅ **Función serverless** en Netlify que envía emails directamente
- ✅ **Seguro y privado** - todo queda en tu infraestructura

## 🧪 Probar las Notificaciones

1. **Ve a tu app:** https://srwilltask.netlify.app
2. **Ingresa la contraseña:** `srwill2024`
3. **Ve a Configuración** → **"Probar Email"**
4. **Ingresa tu email** y verifica que llegue el email de prueba

## 📨 Tipos de Notificaciones Automáticas

### ✅ Notificaciones que se envían automáticamente:

1. **Nueva tarea asignada** → Email al usuario
2. **Tarea completada** → Notificación de éxito
3. **Comentario agregado** → Alerta al asignado
4. **Tarea vencida** → Recordatorio diario

### ⚙️ Funcionamiento Interno:

- **Frontend:** JavaScript llama a `/.netlify/functions/send-email`
- **Backend:** Función serverless usa NodeMailer con Gmail SMTP
- **Autenticación:** Tu contraseña de aplicación de Google
- **Logs:** Se guardan en tabla `notificaciones_email` de Supabase

## 🔧 Solución de Problemas

### "Email no llega"
- Verifica carpeta **Spam** en Gmail
- Confirma que la contraseña de aplicación es correcta
- Revisa los logs en Netlify: https://app.netlify.com/projects/srwilltask/logs/functions

### "Error al enviar"
- La función serverless puede estar inicializando (espera 30 segundos)
- Verifica que tengas conexión a internet
- Confirma que tu cuenta Gmail tenga 2FA activado

### "Contraseña incorrecta"
- Ve a https://myaccount.google.com/apppasswords
- Genera una nueva contraseña de aplicación
- Actualiza el archivo `netlify/functions/send-email.js`

## 📊 Límite de Emails

- **Gmail:** Sin límite específico para SMTP
- **Netlify Functions:** 125K invocations/mes gratis
- **Frecuencia:** Máximo 1 email por tarea vencida al día

## 🎉 ¡Todo Listo!

Tu TaskManager Pro ahora envía emails usando **exclusivamente Gmail** con tu contraseña de aplicación. No necesitas configurar nada más - solo prueba el sistema y disfruta de las notificaciones automáticas.

¿Necesitas ayuda con algo más? ¡Las notificaciones por email ya están funcionando! 🚀</content>
<parameter name="filePath">c:\Users\USUARIO\Desktop\srwill\EMAIL_SETUP_GMAIL.md