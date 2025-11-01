# TaskManager Pro 📋

Sistema completo de gestión de tareas operativas con seguimiento de tiempos, notificaciones y reportes.

## 🚀 Inicio Rápido

1. **Instalar Node.js** (si no lo tienes): https://nodejs.org/
2. **Doble clic en** `IniciarApp.bat`
3. ¡Listo! El navegador se abrirá automáticamente

## ✨ Características

- ✅ **Gestión de Tareas**: Crea, edita y organiza tareas con prioridades
- 👥 **Gestión de Usuarios**: Administra tu equipo y asigna tareas
- ⏱️ **Seguimiento de Tiempo**: Monitorea cuánto tiempo toma cada tarea
- 📊 **Dashboard Estadístico**: Visualiza el progreso en tiempo real
- 🔔 **Notificaciones Email**: Recordatorios automáticos
- 📈 **Reportes**: Análisis cuantitativo y cualitativo
- 🎨 **Vista Kanban**: Interfaz intuitiva tipo tablero
- 🔍 **Filtros Avanzados**: Busca por estado, prioridad, usuario
- 🌙 **Modo Oscuro**: Cambia entre tema claro y oscuro con un clic

## 📦 Tecnologías

- **Backend**: Node.js + Express + SQLite
- **Frontend**: HTML5 + CSS3 + JavaScript (Vanilla)
- **Base de Datos**: SQLite (local, sin configuración)
- **Notificaciones**: Nodemailer

## 🎯 Uso

### Crear una Tarea
1. Ve a la sección "Tareas"
2. Haz clic en "+ Nueva Tarea"
3. Completa los datos y asigna a un usuario
4. ¡Listo! La tarea aparecerá en el tablero Kanban

### Configurar Notificaciones Email
1. Ve a "Configuración"
2. Completa los datos SMTP de tu email
3. Para Gmail, necesitas generar una "Contraseña de aplicación"
4. Guarda la configuración

### Ver Reportes
1. Ve a "Reportes"
2. Selecciona el período de fechas
3. Haz clic en "Generar Reporte"
4. Visualiza análisis cuantitativo y cualitativo

## 🌐 Acceso desde Otros Dispositivos

Si quieres que otros accedan desde la misma red:

1. Averigua tu IP con: `ipconfig` (en CMD)
2. Comparte la URL: `http://TU_IP:3000`

## 💾 Respaldo de Datos

Tus datos están en: `backend/data/database.db`

Para hacer respaldo, simplemente copia ese archivo.

## 📁 Estructura

```
TaskManager/
├── IniciarApp.bat          # Inicia la aplicación
├── backend/
│   ├── server.js           # API REST
│   └── data/
│       └── database.db     # Base de datos
└── frontend/
    ├── index.html          # Interfaz
    ├── app.js              # Lógica
    └── styles.css          # Estilos
```

## 🔧 Configuración Avanzada

### Cambiar Puerto
Edita `backend/server.js` línea 10:
```javascript
const PORT = 3000; // Cambia a otro puerto
```

### Variables de Entorno
Edita `.env` para configurar email por defecto.

## ❓ Preguntas Frecuentes

**¿Necesito internet?**
No, funciona 100% offline (excepto para enviar emails).

**¿Dónde se guardan los datos?**
En tu computadora, en `backend/data/database.db`.

**¿Puedo usarlo en Mac o Linux?**
Sí, ejecuta: `node backend/server.js`

**¿Es gratis?**
Sí, 100% gratis y sin límites.

## 📞 Soporte

Revisa `INSTRUCCIONES.txt` para guía detallada.

---

**Desarrollado con ❤️ para gestión eficiente de tareas**
