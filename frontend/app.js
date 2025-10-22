// API Base URL
const API_URL = 'http://localhost:3000/api';

// ==================== CONFIGURACIÓN SUPABASE ====================

// Importar Supabase
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// Configurar Supabase
const supabaseUrl = 'https://xbbripsybpvbxbayooum.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhiYnJpcHN5YnB2YnhiYXlvb3VtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MTg1NjEsImV4cCI6MjA3NzQ5NDU2MX0.BiZsOy_qTUxalMjZcMYAEXO2XTHYjxFS2tOzrn54e6M'
const supabase = createClient(supabaseUrl, supabaseKey)

// ==================== CONFIGURACIÓN EMAIL ====================

// Configuración de Gmail SMTP (usando contraseña de aplicación)
// Obtén tu contraseña de aplicación en: https://myaccount.google.com/apppasswords
const GMAIL_USER = 'jdriverac08@gmail.com'; // ⚠️ CAMBIA TU EMAIL DE GMAIL
const GMAIL_APP_PASSWORD = 'rukg pigd vvbj lvyf'; // ⚠️ PON TU CONTRASEÑA DE APLICACIÓN
const EMAIL_FROM = 'TaskManager Pro <jdriverac08@gmail.com>'; // Cambia por tu email

// Variables globales
let tareas = [];
let usuarios = [];
let tareaEditando = null;
let usuarioEditando = null;
let supabaseReady = false;

// ==================== AUTENTICACIÓN ====================

function verificarAcceso() {
    // Verificar si ya está autenticado en esta sesión
    const autenticado = sessionStorage.getItem('autenticado');
    if (autenticado === 'true') {
        return true;
    }

    // Pedir contraseña
    const password = prompt('🔒 Acceso Privado - Ingresa tu contraseña:');
    if (!password) {
        document.body.innerHTML = '<div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;"><h1>🚫 Acceso Denegado</h1><p>Debes ingresar la contraseña correcta para acceder.</p><button onclick="location.reload()">Reintentar</button></div>';
        return false;
    }

    // Aquí puedes cambiar la contraseña
    const contraseñaCorrecta = 'srwill2024'; // CAMBIA ESTA CONTRASEÑA

    if (password === contraseñaCorrecta) {
        sessionStorage.setItem('autenticado', 'true');
        return true;
    } else {
        alert('❌ Contraseña incorrecta');
        return verificarAcceso(); // Reintentar
    }
}

// Verificar que Supabase esté funcionando
async function verificarSupabase() {
    try {
        // Intentar una consulta simple para verificar conexión
        const { data, error } = await supabase.from('usuarios').select('count').limit(1);
        if (error && error.code !== 'PGRST116') { // PGRST116 es "no rows returned"
            throw error;
        }
        supabaseReady = true;
        console.log('✅ Supabase conectado correctamente');
    } catch (error) {
        console.error('❌ Error conectando con Supabase:', error);
        throw error;
    }
}

// Mostrar mensaje cuando Supabase no está configurado
function mostrarMensajeConfiguracion() {
    const mensaje = document.createElement('div');
    mensaje.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 30px;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        text-align: center;
        max-width: 500px;
        z-index: 10000;
        font-family: Arial, sans-serif;
    `;
    mensaje.innerHTML = `
        <h2 style="color: #dc2626; margin-bottom: 20px;">⚠️ Configuración Requerida</h2>
        <p style="margin-bottom: 20px; line-height: 1.6;">
            La aplicación necesita que configures las tablas en Supabase antes de poder funcionar.
        </p>
        <div style="background: #f3f4f6; padding: 15px; border-radius: 5px; margin-bottom: 20px; text-align: left;">
            <strong>Pasos a seguir:</strong>
            <ol style="margin-top: 10px; padding-left: 20px;">
                <li>Ve a <a href="https://supabase.com/dashboard/project/xbbripsybpvbxbayooum/sql" target="_blank" style="color: #3b82f6;">SQL Editor de Supabase</a></li>
                <li>Copia y pega el contenido del archivo <code>supabase_setup_clean.sql</code></li>
                <li>Ejecuta el script para crear las tablas</li>
                <li>Actualiza esta página</li>
            </ol>
        </div>
        <button onclick="location.reload()" style="background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
            🔄 Verificar Conexión
        </button>
    `;
    document.body.appendChild(mensaje);
}

// ==================== TEMA OSCURO/CLARO ====================

function toggleTheme() {
    const body = document.body;
    body.classList.toggle('dark-mode');
    
    // Guardar preferencia en localStorage
    const isDark = body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    // Animación del icono
    const icon = document.querySelector('.theme-toggle i');
    icon.style.transform = 'rotate(360deg)';
    setTimeout(() => {
        icon.style.transform = 'rotate(0deg)';
    }, 300);
}

function cargarTemaGuardado() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }
}

async function cargarDatos() {
    if (!supabaseReady) {
        console.warn('Supabase no está listo, saltando carga de datos');
        return;
    }

    try {
        // Cargar usuarios primero
        await cargarUsuarios();

        // Cargar tipos de tarea en paralelo (no bloqueante)
        cargarTiposTarea().catch(err => console.error('Error cargando tipos:', err));

        // Cargar tareas y dashboard
        await cargarTareas();
        await cargarDashboard();
        await cargarConfiguracion();

        configurarFechasReporte();
        cargarTemaGuardado();
    } catch (error) {
        console.error('Error al cargar datos:', error);
        mostrarNotificacion('Error al cargar datos iniciales', 'error');
    }
}

// ==================== NAVEGACIÓN ====================

function mostrarSeccion(seccionId) {
    // Ocultar todas las secciones
    document.querySelectorAll('.seccion').forEach(seccion => {
        seccion.classList.remove('active');
    });

    // Mostrar sección seleccionada
    document.getElementById(seccionId).classList.add('active');

    // Actualizar navegación
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    event.target.closest('.nav-item').classList.add('active');

    // Recargar datos según sección
    if (seccionId === 'dashboard') {
        cargarDashboard();
    } else if (seccionId === 'tareas') {
        cargarTareas();
    } else if (seccionId === 'usuarios') {
        cargarUsuarios();
    } else if (seccionId === 'reportes') {
        // Configurar fechas por defecto cuando se abre la sección de reportes
        configurarFechasReporte();
        // Mostrar estadísticas generales si no hay fechas específicas
        mostrarEstadisticasGenerales();
    }
}

// ==================== DASHBOARD ====================

async function cargarDashboard() {
    try {
        // Obtener estadísticas usando consultas directas a Supabase
        const { data: statsPorEstado, error: errorEstado } = await supabase
            .from('tareas')
            .select('estado')
            .then(result => {
                if (result.error) throw result.error;
                const counts = {};
                result.data.forEach(tarea => {
                    counts[tarea.estado] = (counts[tarea.estado] || 0) + 1;
                });
                return { data: Object.entries(counts).map(([estado, total]) => ({ estado, total })) };
            });

        const { data: statsPorPrioridad, error: errorPrioridad } = await supabase
            .from('tareas')
            .select('prioridad')
            .then(result => {
                if (result.error) throw result.error;
                const counts = {};
                result.data.forEach(tarea => {
                    counts[tarea.prioridad] = (counts[tarea.prioridad] || 0) + 1;
                });
                return { data: Object.entries(counts).map(([prioridad, total]) => ({ prioridad, total })) };
            });

        const { data: statsPorUsuario, error: errorUsuario } = await supabase
            .from('tareas')
            .select('usuario_asignado_id, usuarios!inner(nombre)')
            .then(result => {
                if (result.error) throw result.error;
                const counts = {};
                result.data.forEach(tarea => {
                    const nombre = tarea.usuarios.nombre;
                    counts[nombre] = (counts[nombre] || 0) + 1;
                });
                return { data: Object.entries(counts).map(([nombre, total]) => ({ nombre, total })) };
            });

        if (errorEstado || errorPrioridad || errorUsuario) {
            throw errorEstado || errorPrioridad || errorUsuario;
        }

        const stats = {
            por_estado: statsPorEstado,
            por_prioridad: statsPorPrioridad,
            por_usuario: statsPorUsuario,
            total_tareas: statsPorEstado.reduce((sum, item) => sum + item.total, 0),
            completadas: statsPorEstado.find(s => s.estado === 'Completada')?.total || 0,
            pendientes: statsPorEstado.find(s => s.estado === 'Pendiente')?.total || 0,
            en_progreso: statsPorEstado.find(s => s.estado === 'En Progreso')?.total || 0,
            urgentes: statsPorPrioridad.find(s => s.prioridad === 'Urgente')?.total || 0,
            vencidas: 0 // Calcular si es necesario
        };

        // Actualizar estadísticas
        actualizarEstadisticas(stats);

        // Mostrar gráficos
        mostrarGraficoPrioridad(stats.por_prioridad);
        mostrarGraficoUsuario(stats.por_usuario);

        // Mostrar tareas próximas a vencer
        mostrarTareasProximas();

    } catch (error) {
        console.error('Error al cargar dashboard:', error);
    }
}

function actualizarEstadisticas(stats) {
    const porEstado = {};
    stats.por_estado.forEach(item => {
        porEstado[item.estado] = item.total;
    });

    const total = stats.por_estado.reduce((sum, item) => sum + item.total, 0);
    
    document.getElementById('stat-total').textContent = total;
    document.getElementById('stat-completadas').textContent = porEstado['Completada'] || 0;
    document.getElementById('stat-pendientes').textContent = porEstado['Pendiente'] || 0;
    document.getElementById('stat-vencidas').textContent = stats.vencidas || 0;
}

function mostrarGraficoPrioridad(datos) {
    const container = document.getElementById('chart-prioridad');
    container.innerHTML = '';

    const colores = {
        'Urgente': '#dc2626',
        'Alta': '#ea580c',
        'Media': '#f59e0b',
        'Baja': '#10b981'
    };

    datos.forEach(item => {
        const barra = document.createElement('div');
        barra.className = 'chart-bar';
        barra.innerHTML = `
            <div class="chart-label">${item.prioridad}</div>
            <div class="chart-progress">
                <div class="chart-fill" style="width: ${item.total * 10}%; background-color: ${colores[item.prioridad]}"></div>
            </div>
            <div class="chart-value">${item.total}</div>
        `;
        container.appendChild(barra);
    });
}

function mostrarGraficoUsuario(datos) {
    const container = document.getElementById('chart-usuario');
    container.innerHTML = '';

    datos.forEach(item => {
        const barra = document.createElement('div');
        barra.className = 'chart-bar';
        barra.innerHTML = `
            <div class="chart-label">${item.nombre}</div>
            <div class="chart-progress">
                <div class="chart-fill" style="width: ${item.total * 5}%"></div>
            </div>
            <div class="chart-value">${item.total}</div>
        `;
        container.appendChild(barra);
    });
}

async function mostrarTareasProximas() {
    const container = document.getElementById('tareas-proximas');
    const ahora = new Date();
    const proximasSemana = new Date(ahora.getTime() + 7 * 24 * 60 * 60 * 1000);

    const tareasProximas = tareas.filter(t => {
        if (!t.fecha_vencimiento || t.estado === 'Completada') return false;
        const vencimiento = new Date(t.fecha_vencimiento);
        return vencimiento >= ahora && vencimiento <= proximasSemana;
    }).sort((a, b) => new Date(a.fecha_vencimiento) - new Date(b.fecha_vencimiento));

    if (tareasProximas.length === 0) {
        container.innerHTML = '<p class="text-muted">No hay tareas próximas a vencer</p>';
        return;
    }

    container.innerHTML = tareasProximas.map(tarea => `
        <div class="tarea-item-horizontal">
            <div class="tarea-info">
                <strong>${tarea.titulo}</strong>
                <span class="badge badge-${tarea.prioridad.toLowerCase()}">${tarea.prioridad}</span>
            </div>
            <div class="tarea-meta">
                <span><i class="fas fa-user"></i> ${tarea.usuario_nombre || 'Sin asignar'}</span>
                <span><i class="fas fa-clock"></i> ${formatearFecha(tarea.fecha_vencimiento)}</span>
            </div>
        </div>
    `).join('');
}

// ==================== FUNCIONES DE EMAIL ====================

// Función para verificar rate limiting (evitar spam)
async function puedeEnviarEmail(to, type, tareaId) {
    if (!supabaseReady) return true; // Si no hay Supabase, permitir
    
    try {
        // Verificar cuántos emails se han enviado en la última hora
        const unaHoraAtras = new Date(Date.now() - 60 * 60 * 1000).toISOString();
        
        const { data, error } = await supabase
            .from('notificaciones_email')
            .select('id')
            .eq('destinatario', to)
            .eq('tipo', type)
            .gte('fecha_envio', unaHoraAtras);
        
        if (error) {
            console.error('Error verificando rate limit:', error);
            return true; // En caso de error, permitir
        }
        
        // Límite: máximo 3 emails del mismo tipo por hora al mismo destinatario
        if (data && data.length >= 3) {
            console.warn(`⚠️ Rate limit alcanzado para ${to} (tipo: ${type})`);
            return false;
        }
        
        return true;
    } catch (err) {
        console.error('Error en puedeEnviarEmail:', err);
        return true;
    }
}

// Función para enviar email usando Gmail SMTP (desde frontend)
async function enviarEmail(to, subject, html, type, tareaId = null, usuarioId = null) {
    try {
        // Verificar configuración
        if (GMAIL_USER === 'tu_email@gmail.com' || GMAIL_APP_PASSWORD === 'tu_contraseña_aplicación') {
            console.warn('Gmail no configurado - email no enviado');
            return false;
        }

        // Verificar rate limiting
        const puedeEnviar = await puedeEnviarEmail(to, type, tareaId);
        if (!puedeEnviar) {
            console.warn(`⚠️ Email bloqueado por rate limiting: ${type} a ${to}`);
            return false;
        }

        // Enviar usando función serverless de Netlify (usa Gmail SMTP directamente)
        const response = await fetch('/.netlify/functions/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to: to,
                subject: subject,
                html: html,
                type: type,
                tareaId: tareaId,
                usuarioId: usuarioId
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Error enviando email');
        }

        // Log en base de datos si el envío fue exitoso
        if (result.success) {
            const { error: logError } = await supabase
                .from('notificaciones_email')
                .insert({
                    tipo: type,
                    destinatario: to,
                    asunto: subject,
                    contenido: html,
                    estado: 'enviado',
                    fecha_envio: new Date().toISOString(),
                    tarea_id: tareaId,
                    usuario_id: usuarioId
                });

            if (logError) {
                console.error('Error logging email notification:', logError);
            }
        }

        return result.success;
    } catch (error) {
        console.error('Error en enviarEmail:', error);
        return false;
    }
}

// Función para enviar notificación de tarea asignada
async function notificarTareaAsignada(tarea, usuarioAsignado) {
    if (!usuarioAsignado?.email) return;

    const subject = `Nueva tarea asignada: ${tarea.titulo}`;
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3b82f6;">Nueva tarea asignada</h2>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>${tarea.titulo}</h3>
                ${tarea.descripcion ? `<p><strong>Descripción:</strong> ${tarea.descripcion}</p>` : ''}
                <p><strong>Prioridad:</strong> ${tarea.prioridad}</p>
                <p><strong>Estado:</strong> ${tarea.estado}</p>
                ${tarea.fecha_vencimiento ? `<p><strong>Fecha límite:</strong> ${formatearFecha(tarea.fecha_vencimiento)}</p>` : ''}
                ${tarea.area ? `<p><strong>Área:</strong> ${tarea.area}</p>` : ''}
            </div>
            <p>Accede a tu TaskManager Pro para gestionar esta tarea.</p>
            <a href="https://srwilltask.netlify.app" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Ver tarea</a>
        </div>
    `;

    await enviarEmail(usuarioAsignado.email, subject, html, 'task_assigned', tarea.id, usuarioAsignado.id);
}

// Función para enviar notificación de tarea completada
async function notificarTareaCompletada(tarea, usuarioAsignado) {
    if (!usuarioAsignado?.email) return;

    const subject = `Tarea completada: ${tarea.titulo}`;
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #10b981;">¡Tarea completada!</h2>
            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
                <h3>${tarea.titulo}</h3>
                ${tarea.descripcion ? `<p><strong>Descripción:</strong> ${tarea.descripcion}</p>` : ''}
                <p><strong>Completada el:</strong> ${formatearFecha(tarea.fecha_completado || new Date())}</p>
                ${tarea.area ? `<p><strong>Área:</strong> ${tarea.area}</p>` : ''}
            </div>
            <p>¡Excelente trabajo! Esta tarea ha sido marcada como completada.</p>
        </div>
    `;

    await enviarEmail(usuarioAsignado.email, subject, html, 'task_completed', tarea.id, usuarioAsignado.id);
}

// Función para enviar notificación de comentario agregado
async function notificarComentarioAgregado(tarea, comentario, usuarioComentario) {
    // Notificar al usuario asignado si no es el mismo que comentó
    const usuarioAsignado = usuarios.find(u => u.id === tarea.usuario_asignado_id);
    if (!usuarioAsignado?.email || usuarioAsignado.id === usuarioComentario?.id) return;

    const subject = `Nuevo comentario en: ${tarea.titulo}`;
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #f59e0b;">Nuevo comentario</h2>
            <div style="background: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                <h3>${tarea.titulo}</h3>
                <p><strong>Comentario de ${usuarioComentario?.nombre || 'Usuario'}:</strong></p>
                <div style="background: white; padding: 15px; border-radius: 5px; margin: 10px 0;">
                    ${comentario}
                </div>
                ${tarea.descripcion ? `<p><strong>Descripción de la tarea:</strong> ${tarea.descripcion}</p>` : ''}
            </div>
            <a href="https://srwilltask.netlify.app" style="background: #f59e0b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Ver comentarios</a>
        </div>
    `;

    await enviarEmail(usuarioAsignado.email, subject, html, 'comment_added', tarea.id, usuarioAsignado.id);
}

// Función para enviar notificación de tarea vencida
async function notificarTareaVencida(tarea, usuarioAsignado) {
    if (!usuarioAsignado?.email) return;

    const subject = `⚠️ Tarea vencida: ${tarea.titulo}`;
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #ef4444;">⚠️ Tarea vencida</h2>
            <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
                <h3>${tarea.titulo}</h3>
                ${tarea.descripcion ? `<p><strong>Descripción:</strong> ${tarea.descripcion}</p>` : ''}
                <p><strong>Fecha de vencimiento:</strong> ${formatearFecha(tarea.fecha_vencimiento)}</p>
                <p><strong>Días de retraso:</strong> ${Math.floor((new Date() - new Date(tarea.fecha_vencimiento)) / (1000 * 60 * 60 * 24))}</p>
                ${tarea.area ? `<p><strong>Área:</strong> ${tarea.area}</p>` : ''}
            </div>
            <p style="color: #ef4444; font-weight: bold;">Esta tarea requiere atención inmediata.</p>
            <a href="https://srwilltask.netlify.app" style="background: #ef4444; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Gestionar tarea</a>
        </div>
    `;

    await enviarEmail(usuarioAsignado.email, subject, html, 'task_overdue', tarea.id, usuarioAsignado.id);
}

// Cargar tareas desde Supabase
async function cargarTareas() {
    if (!supabaseReady) return;

    try {
        const { data, error } = await supabase
            .from('tareas')
            .select(`
                *,
                tipos_tarea (nombre, color),
                usuarios (nombre)
            `)
            .order('fecha_creacion', { ascending: false });

        if (error) {
            if (error.code === 'PGRST116' || error.message.includes('relation "tareas" does not exist')) {
                console.warn('Tabla tareas no existe aún');
                tareas = [];
            } else {
                throw error;
            }
        } else {
            tareas = data || [];
        }

        mostrarTareas();
        mostrarTareasKanban();
    } catch (error) {
        console.error('Error cargando tareas:', error);
        mostrarError('Error al cargar las tareas');
        tareas = [];
        mostrarTareas();
        mostrarTareasKanban();
    }
}

// Mostrar lista de tareas (si existe vista de lista)
function mostrarTareas() {
    // Esta función puede implementarse si hay una vista de lista de tareas
    // Por ahora solo se usa mostrarTareasKanban
}

// Función para mostrar errores
function mostrarError(mensaje) {
    mostrarNotificacion(mensaje, 'error');
}

function mostrarTareasKanban() {
    const estados = ['Pendiente', 'En Progreso', 'Completada', 'Cancelada'];
    
    // Mapeo de estados a IDs de contenedores
    const estadoToId = {
        'Pendiente': 'kanban-pendiente',
        'En Progreso': 'kanban-progreso',
        'Completada': 'kanban-completada',
        'Cancelada': 'kanban-cancelada'
    };
    
    const estadoToCountId = {
        'Pendiente': 'count-pendiente',
        'En Progreso': 'count-progreso',
        'Completada': 'count-completada',
        'Cancelada': 'count-cancelada'
    };
    
    estados.forEach(estado => {
        const containerId = estadoToId[estado];
        const container = document.getElementById(containerId);
        if (!container) return; // Si no existe el contenedor, saltar
        
        const tareasFiltradas = filtrarTareasPorEstado(estado);
        
        // Actualizar contador
        const countId = estadoToCountId[estado];
        const countElement = document.getElementById(countId);
        if (countElement) {
            countElement.textContent = tareasFiltradas.length;
        }

        // Renderizar tareas o placeholder si está vacío
        if (tareasFiltradas.length === 0) {
            container.innerHTML = '<div class="kanban-placeholder">Arrastra tareas aquí</div>';
        } else {
            container.innerHTML = tareasFiltradas.map(tarea => crearTarjetaTarea(tarea)).join('');
        }
        
        // Configurar eventos de drag & drop para el contenedor
        configurarDragAndDrop(container, estado);
    });
    
    // Configurar eventos de arrastre para las tarjetas
    configurarTarjetasArrastrables();
}

function filtrarTareasPorEstado(estado) {
    let tareasFiltradas = tareas.filter(t => t.estado === estado);

    // Aplicar filtros adicionales
    const buscar = document.getElementById('filtro-buscar')?.value.toLowerCase();
    const filtroEstado = document.getElementById('filtro-estado')?.value;
    const filtroPrioridad = document.getElementById('filtro-prioridad')?.value;

    if (buscar) {
        tareasFiltradas = tareasFiltradas.filter(t => 
            t.titulo.toLowerCase().includes(buscar) ||
            (t.descripcion && t.descripcion.toLowerCase().includes(buscar))
        );
    }

    if (filtroEstado && filtroEstado !== estado) {
        return [];
    }

    if (filtroPrioridad) {
        tareasFiltradas = tareasFiltradas.filter(t => t.prioridad === filtroPrioridad);
    }

    return tareasFiltradas;
}

function crearTarjetaTarea(tarea) {
    const vencida = tarea.fecha_vencimiento && new Date(tarea.fecha_vencimiento) < new Date() && tarea.estado !== 'Completada';
    
    // Obtener nombre del usuario asignado
    let nombreUsuario = 'Sin asignar';
    if (tarea.usuario_asignado_id) {
        // Intentar obtener de la relación de Supabase
        if (tarea.usuarios && tarea.usuarios.nombre) {
            nombreUsuario = tarea.usuarios.nombre;
        } else {
            // Si no viene de la relación, buscar en el array de usuarios
            const usuario = usuarios.find(u => u.id === tarea.usuario_asignado_id);
            if (usuario) {
                nombreUsuario = usuario.nombre;
            }
        }
    }
    
    return `
        <div class="kanban-card ${vencida ? 'vencida' : ''}" draggable="true" data-tarea-id="${tarea.id}">
            <div class="card-header">
                <span class="badge badge-${tarea.prioridad.toLowerCase()}">${tarea.prioridad}</span>
                <div class="card-actions">
                    <button onclick="editarTarea(${tarea.id})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="eliminarTarea(${tarea.id})" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            ${tarea.tipos_tarea ? `<span class="tipo-badge" style="background-color: ${tarea.tipos_tarea.color}">${tarea.tipos_tarea.nombre}</span>` : ''}
            <h4>${tarea.titulo}</h4>
            ${tarea.descripcion ? `<p class="card-description">${tarea.descripcion}</p>` : ''}
            <div class="card-meta">
                <span><i class="fas fa-user"></i> ${nombreUsuario}</span>
                ${tarea.area ? `<span><i class="fas fa-folder"></i> ${tarea.area}</span>` : ''}
                ${tarea.fecha_vencimiento ? `<span><i class="fas fa-calendar"></i> ${formatearFecha(tarea.fecha_vencimiento)}</span>` : ''}
                ${tarea.categoria ? `<span><i class="fas fa-tag"></i> ${tarea.categoria}</span>` : ''}
            </div>
            ${vencida ? '<div class="alert-vencida"><i class="fas fa-exclamation-circle"></i> Vencida</div>' : ''}
        </div>
    `;
}

function filtrarTareas() {
    mostrarTareasKanban();
}

// CRUD Tareas

function abrirModalTarea(id = null) {
    const modal = document.getElementById('modal-tarea');
    const titulo = document.getElementById('modal-tarea-titulo');
    const seccionAdjuntos = document.getElementById('seccion-adjuntos');
    const seccionComentarios = document.getElementById('seccion-comentarios');
    
    if (id) {
        const tarea = tareas.find(t => t.id === id);
        if (tarea) {
            tareaEditando = id; // Guardar ID para adjuntos/comentarios
            titulo.innerHTML = '<i class="fas fa-edit"></i> Editar Tarea';
            document.getElementById('tarea-id').value = tarea.id;
            document.getElementById('tarea-titulo').value = tarea.titulo;
            document.getElementById('tarea-descripcion').value = tarea.descripcion || '';
            document.getElementById('tarea-prioridad').value = tarea.prioridad;
            document.getElementById('tarea-estado').value = tarea.estado;
            document.getElementById('tarea-usuario').value = tarea.usuario_asignado_id || '';
            document.getElementById('tarea-categoria').value = tarea.categoria || '';
            document.getElementById('tarea-fecha-vencimiento').value = tarea.fecha_vencimiento ? formatearFechaInput(tarea.fecha_vencimiento) : '';
            document.getElementById('tarea-tiempo-estimado').value = tarea.tiempo_estimado || '';
            document.getElementById('tarea-notas').value = tarea.notas || '';
            document.getElementById('tarea-tipo').value = tarea.tipo_tarea_id || '';
            document.getElementById('tarea-area').value = tarea.area || '';

            // Mostrar secciones de adjuntos y comentarios
            seccionAdjuntos.style.display = 'block';
            seccionComentarios.style.display = 'block';

            // Cargar adjuntos y comentarios
            cargarAdjuntos(id);
            cargarComentarios(id);
        }
    } else {
        tareaEditando = null;
        titulo.innerHTML = '<i class="fas fa-plus"></i> Nueva Tarea';
        document.getElementById('form-tarea').reset();
        document.getElementById('tarea-id').value = '';

        // Ocultar secciones de adjuntos y comentarios en modo creación
        seccionAdjuntos.style.display = 'none';
        seccionComentarios.style.display = 'none';
    }
    
    modal.style.display = 'flex';
}

function cerrarModalTarea() {
    document.getElementById('modal-tarea').style.display = 'none';
    document.getElementById('form-tarea').reset();
}

function editarTarea(id) {
    abrirModalTarea(id);
}

async function guardarTarea(event) {
    event.preventDefault();

    const id = document.getElementById('tarea-id').value;
    const datos = {
        titulo: document.getElementById('tarea-titulo').value,
        descripcion: document.getElementById('tarea-descripcion').value,
        prioridad: document.getElementById('tarea-prioridad').value,
        estado: document.getElementById('tarea-estado').value,
        usuario_asignado_id: document.getElementById('tarea-usuario').value || null,
        categoria: document.getElementById('tarea-categoria').value,
        fecha_vencimiento: document.getElementById('tarea-fecha-vencimiento').value || null,
        tiempo_estimado: document.getElementById('tarea-tiempo-estimado').value || null,
        notas: document.getElementById('tarea-notas').value,
        tipo_tarea_id: document.getElementById('tarea-tipo').value || null,
        area: document.getElementById('tarea-area').value
    };

    try {
        // Obtener datos anteriores si es edición
        const tareaAnterior = id ? tareas.find(t => t.id == id) : null;
        const estadoAnterior = tareaAnterior?.estado;
        const usuarioAnterior = tareaAnterior?.usuario_asignado_id;

        let result;
        if (id) {
            result = await supabase
                .from('tareas')
                .update(datos)
                .eq('id', id);
        } else {
            result = await supabase
                .from('tareas')
                .insert([datos]);
        }

        if (result.error) throw result.error;

        mostrarNotificacion(id ? 'Tarea actualizada correctamente' : 'Tarea creada correctamente', 'success');
        cerrarModalTarea();
        await cargarTareas();
        await cargarDashboard();

        // NOTIFICACIONES DE EMAIL
        const usuarioAsignado = usuarios.find(u => u.id == datos.usuario_asignado_id);
        
        if (id) {
            // TAREA EDITADA
            // 1. Notificar si cambió de usuario asignado (reasignación)
            if (datos.usuario_asignado_id && datos.usuario_asignado_id != usuarioAnterior && usuarioAsignado) {
                const tareaActualizada = { ...datos, id: id };
                await notificarTareaAsignada(tareaActualizada, usuarioAsignado);
            }
            
            // 2. Notificar si se marcó como completada
            if (datos.estado === 'Completada' && estadoAnterior !== 'Completada' && usuarioAsignado) {
                const tareaCompletada = { ...datos, id: id };
                await notificarTareaCompletada(tareaCompletada, usuarioAsignado);
            }
        } else {
            // TAREA NUEVA
            // Notificar solo si se asignó a un usuario
            if (datos.usuario_asignado_id && usuarioAsignado) {
                const tareaCreada = { ...datos, id: result.data?.[0]?.id || Date.now() };
                await notificarTareaAsignada(tareaCreada, usuarioAsignado);
            }
        }
    } catch (error) {
        console.error('Error al guardar tarea:', error);
        mostrarNotificacion('Error al guardar la tarea', 'error');
    }
}

async function eliminarTarea(id) {
    if (!confirm('¿Estás seguro de eliminar esta tarea? Se eliminarán también todos sus archivos adjuntos y comentarios.')) return;

    try {
        // 1. Primero obtener todos los adjuntos de la tarea
        const { data: adjuntos, error: errorAdjuntos } = await supabase
            .from('adjuntos')
            .select('ruta_archivo')
            .eq('tarea_id', id);

        if (errorAdjuntos) {
            console.error('Error obteniendo adjuntos:', errorAdjuntos);
        }

        // 2. Eliminar archivos del Storage de Supabase
        if (adjuntos && adjuntos.length > 0) {
            for (const adjunto of adjuntos) {
                try {
                    // Extraer el nombre del archivo de la ruta completa
                    const fileName = adjunto.ruta_archivo.split('/').pop();
                    
                    const { error: storageError } = await supabase
                        .storage
                        .from('adjuntos')
                        .remove([fileName]);

                    if (storageError) {
                        console.error('Error eliminando archivo del storage:', storageError);
                    } else {
                        console.log(`✅ Archivo eliminado del storage: ${fileName}`);
                    }
                } catch (err) {
                    console.error('Error al procesar adjunto:', err);
                }
            }
        }

        // 3. Eliminar registros de adjuntos de la base de datos
        const { error: errorDeleteAdjuntos } = await supabase
            .from('adjuntos')
            .delete()
            .eq('tarea_id', id);

        if (errorDeleteAdjuntos) {
            console.error('Error eliminando registros de adjuntos:', errorDeleteAdjuntos);
        }

        // 4. Eliminar comentarios asociados
        const { error: errorDeleteComentarios } = await supabase
            .from('comentarios')
            .delete()
            .eq('tarea_id', id);

        if (errorDeleteComentarios) {
            console.error('Error eliminando comentarios:', errorDeleteComentarios);
        }

        // 5. Eliminar notificaciones de email asociadas
        const { error: errorDeleteNotificaciones } = await supabase
            .from('notificaciones_email')
            .delete()
            .eq('tarea_id', id);

        if (errorDeleteNotificaciones) {
            console.error('Error eliminando notificaciones:', errorDeleteNotificaciones);
        }

        // 6. Finalmente eliminar la tarea
        const { error } = await supabase
            .from('tareas')
            .delete()
            .eq('id', id);

        if (error) throw error;

        mostrarNotificacion('Tarea y archivos adjuntos eliminados correctamente', 'success');
        await cargarTareas();
        await cargarDashboard();
    } catch (error) {
        console.error('Error al eliminar tarea:', error);
        mostrarNotificacion('Error al eliminar la tarea', 'error');
    }
}

// Cargar usuarios desde Supabase
async function cargarUsuarios() {
    if (!supabaseReady) return;

    try {
        const { data, error } = await supabase
            .from('usuarios')
            .select('*')
            .order('nombre');

        if (error) {
            if (error.code === 'PGRST116' || error.message.includes('relation "usuarios" does not exist')) {
                console.warn('Tabla usuarios no existe aún');
                usuarios = [];
            } else {
                throw error;
            }
        } else {
            usuarios = data || [];
        }

        mostrarUsuarios();
        actualizarSelectUsuarios();
    } catch (error) {
        console.error('Error cargando usuarios:', error);
        mostrarNotificacion('Error al cargar usuarios', 'error');
        usuarios = [];
        mostrarUsuarios();
        actualizarSelectUsuarios();
    }
}

function mostrarUsuarios() {
    const tbody = document.getElementById('tabla-usuarios');
    
    tbody.innerHTML = usuarios.map(usuario => {
        const tareasAsignadas = tareas.filter(t => t.usuario_asignado_id === usuario.id).length;
        
        return `
            <tr>
                <td><strong>${usuario.nombre}</strong></td>
                <td>${usuario.email}</td>
                <td>${usuario.area || '-'}</td>
                <td>${usuario.telefono || '-'}</td>
                <td><span class="badge badge-primary">${tareasAsignadas}</span></td>
                <td>
                    <button class="btn-icon" onclick="editarUsuario(${usuario.id})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" onclick="eliminarUsuario(${usuario.id})" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function actualizarSelectUsuarios() {
    const select = document.getElementById('tarea-usuario');
    if (!select) return;

    const valorActual = select.value;
    select.innerHTML = '<option value="">Seleccionar usuario...</option>' +
        usuarios.map(u => `<option value="${u.id}">${u.nombre}</option>`).join('');
    
    if (valorActual) {
        select.value = valorActual;
    }
}

// CRUD Usuarios

function abrirModalUsuario(id = null) {
    const modal = document.getElementById('modal-usuario');
    const titulo = document.getElementById('modal-usuario-titulo');
    
    if (id) {
        const usuario = usuarios.find(u => u.id === id);
        if (usuario) {
            titulo.innerHTML = '<i class="fas fa-edit"></i> Editar Usuario';
            document.getElementById('usuario-id').value = usuario.id;
            document.getElementById('usuario-nombre').value = usuario.nombre;
            document.getElementById('usuario-email').value = usuario.email;
            document.getElementById('usuario-area').value = usuario.area || '';
            document.getElementById('usuario-telefono').value = usuario.telefono || '';
        }
    } else {
        titulo.innerHTML = '<i class="fas fa-user-plus"></i> Nuevo Usuario';
        document.getElementById('form-usuario').reset();
        document.getElementById('usuario-id').value = '';
    }
    
    modal.style.display = 'flex';
}

function cerrarModalUsuario() {
    document.getElementById('modal-usuario').style.display = 'none';
    document.getElementById('form-usuario').reset();
}

function editarUsuario(id) {
    abrirModalUsuario(id);
}

async function guardarUsuario(event) {
    event.preventDefault();

    const id = document.getElementById('usuario-id').value;
    const datos = {
        nombre: document.getElementById('usuario-nombre').value,
        email: document.getElementById('usuario-email').value,
        area: document.getElementById('usuario-area').value,
        telefono: document.getElementById('usuario-telefono').value
    };

    try {
        let result;
        if (id) {
            result = await supabase
                .from('usuarios')
                .update(datos)
                .eq('id', id);
        } else {
            result = await supabase
                .from('usuarios')
                .insert([datos]);
        }

        if (result.error) throw result.error;

        mostrarNotificacion(id ? 'Usuario actualizado correctamente' : 'Usuario creado correctamente', 'success');
        cerrarModalUsuario();
        await cargarUsuarios();
        await cargarDashboard();
    } catch (error) {
        console.error('Error al guardar usuario:', error);
        mostrarNotificacion('Error al guardar el usuario', 'error');
    }
}

async function eliminarUsuario(id) {
    const tareasAsignadas = tareas.filter(t => t.usuario_asignado_id === id).length;
    
    if (tareasAsignadas > 0) {
        if (!confirm(`Este usuario tiene ${tareasAsignadas} tarea(s) asignada(s). ¿Deseas eliminarlo de todas formas?`)) {
            return;
        }
    }

    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;

    try {
        const { error } = await supabase
            .from('usuarios')
            .delete()
            .eq('id', id);

        if (error) throw error;

        mostrarNotificacion('Usuario eliminado correctamente', 'success');
        await cargarUsuarios();
        await cargarTareas();
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        mostrarNotificacion('Error al eliminar el usuario', 'error');
    }
}

// Función para mostrar estadísticas generales cuando se abre la sección de reportes
async function mostrarEstadisticasGenerales() {
    try {
        // Obtener todas las tareas para estadísticas generales
        const { data: todasLasTareas, error } = await supabase
            .from('tareas')
            .select('*');

        if (error) throw error;

        console.log(`📈 Mostrando estadísticas generales de ${todasLasTareas.length} tareas totales`);

        // Calcular tiempos reales de tareas completadas
        const tareasCompletadas = todasLasTareas.filter(t => t.estado === 'Completada' && t.fecha_completado && t.fecha_creacion);
        
        let tiempoTotalMinutos = 0;
        tareasCompletadas.forEach(tarea => {
            const inicio = new Date(tarea.fecha_creacion);
            const fin = new Date(tarea.fecha_completado);
            const diferenciaMs = fin - inicio;
            const minutos = Math.floor(diferenciaMs / (1000 * 60));
            tiempoTotalMinutos += minutos > 0 ? minutos : 0;
        });

        const tiempoPromedio = tareasCompletadas.length > 0 ? tiempoTotalMinutos / tareasCompletadas.length : 0;

        const cuantitativo = {
            total_tareas: todasLasTareas.length,
            completadas: todasLasTareas.filter(t => t.estado === 'Completada').length,
            pendientes: todasLasTareas.filter(t => t.estado === 'Pendiente').length,
            en_progreso: todasLasTareas.filter(t => t.estado === 'En Progreso').length,
            canceladas: todasLasTareas.filter(t => t.estado === 'Cancelada').length,
            urgentes: todasLasTareas.filter(t => t.prioridad === 'Urgente').length,
            tiempo_promedio: tiempoPromedio,
            tiempo_total: tiempoTotalMinutos
        };

        mostrarReporteCuantitativo(cuantitativo);

        // Mostrar las últimas 10 tareas para análisis cualitativo general
        const ultimasTareas = todasLasTareas
            .sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion))
            .slice(0, 10)
            .map(t => ({
                ...t,
                usuario_nombre: usuarios.find(u => u.id === t.usuario_asignado_id)?.nombre || 'Sin asignar'
            }));

        mostrarReporteCualitativo(ultimasTareas);

        // Agregar nota indicando que son estadísticas generales
        const containerCuantitativo = document.getElementById('reporte-cuantitativo');
        const notaGeneral = document.createElement('div');
        notaGeneral.className = 'alert info';
        notaGeneral.innerHTML = `
            <i class="fas fa-info-circle"></i>
            <div>Mostrando estadísticas generales de todas las tareas. Selecciona un período específico para filtrar los datos.</div>
        `;
        containerCuantitativo.insertBefore(notaGeneral, containerCuantitativo.firstChild);

    } catch (error) {
        console.error('Error al mostrar estadísticas generales:', error);
        mostrarNotificacion('Error al cargar estadísticas generales', 'error');
    }
}

function configurarFechasReporte() {
    const hoy = new Date();
    const hace30dias = new Date(hoy.getTime() - 30 * 24 * 60 * 60 * 1000);

    document.getElementById('reporte-fecha-inicio').value = hace30dias.toISOString().split('T')[0];
    document.getElementById('reporte-fecha-fin').value = hoy.toISOString().split('T')[0];
}

async function generarReportes() {
    const fechaInicio = document.getElementById('reporte-fecha-inicio').value;
    const fechaFin = document.getElementById('reporte-fecha-fin').value;

    if (!fechaInicio || !fechaFin) {
        mostrarNotificacion('Por favor selecciona ambas fechas', 'error');
        return;
    }

    // Validar que la fecha de inicio no sea mayor que la fecha de fin
    if (new Date(fechaInicio) > new Date(fechaFin)) {
        mostrarNotificacion('La fecha de inicio no puede ser mayor que la fecha de fin', 'error');
        return;
    }

    try {
        mostrarNotificacion('Generando reporte...', 'info');

        // Reporte Cuantitativo usando consultas directas
        const { data: tareas, error } = await supabase
            .from('tareas')
            .select('*')
            .gte('fecha_creacion', fechaInicio)
            .lte('fecha_creacion', fechaFin);

        if (error) throw error;

        console.log(`📊 Generando reporte para ${tareas.length} tareas del período ${fechaInicio} al ${fechaFin}`);

        // Calcular tiempos reales de tareas completadas en el período
        const tareasCompletadas = tareas.filter(t => t.estado === 'Completada' && t.fecha_completado && t.fecha_creacion);
        
        let tiempoTotalMinutos = 0;
        let tiemposDetalle = [];
        
        tareasCompletadas.forEach(tarea => {
            const inicio = new Date(tarea.fecha_creacion);
            const fin = new Date(tarea.fecha_completado);
            const diferenciaMs = fin - inicio;
            const minutos = Math.floor(diferenciaMs / (1000 * 60));
            
            if (minutos > 0) {
                tiempoTotalMinutos += minutos;
                tiemposDetalle.push({
                    titulo: tarea.titulo,
                    minutos: minutos,
                    horas: (minutos / 60).toFixed(2)
                });
            }
        });

        const tiempoPromedio = tareasCompletadas.length > 0 ? tiempoTotalMinutos / tareasCompletadas.length : 0;

        console.log(`⏱️  Tiempos calculados:`, {
            tareasCompletadas: tareasCompletadas.length,
            tiempoTotal: `${(tiempoTotalMinutos / 60).toFixed(2)} hrs`,
            tiempoPromedio: `${(tiempoPromedio / 60).toFixed(2)} hrs`,
            detalles: tiemposDetalle
        });

        const cuantitativo = {
            total_tareas: tareas.length,
            completadas: tareas.filter(t => t.estado === 'Completada').length,
            pendientes: tareas.filter(t => t.estado === 'Pendiente').length,
            en_progreso: tareas.filter(t => t.estado === 'En Progreso').length,
            canceladas: tareas.filter(t => t.estado === 'Cancelada').length,
            urgentes: tareas.filter(t => t.prioridad === 'Urgente').length,
            tiempo_promedio: tiempoPromedio,
            tiempo_total: tiempoTotalMinutos
        };

        mostrarReporteCuantitativo(cuantitativo);

        // Reporte Cualitativo
        const cualitativo = tareas.map(t => ({
            ...t,
            usuario_nombre: usuarios.find(u => u.id === t.usuario_asignado_id)?.nombre || 'Sin asignar'
        }));

        mostrarReporteCualitativo(cualitativo);

        mostrarNotificacion(`✅ Reporte generado con ${tareas.length} tareas`, 'success');

    } catch (error) {
        console.error('Error al generar reportes:', error);
        mostrarNotificacion('Error al generar reportes', 'error');
    }
}

function mostrarReporteCuantitativo(datos) {
    const container = document.getElementById('reporte-cuantitativo');
    
    const porcentajeCompletadas = datos.total_tareas > 0 
        ? ((datos.completadas / datos.total_tareas) * 100).toFixed(1) 
        : 0;

    // Calcular horas y minutos para tiempo promedio
    const horasPromedio = Math.floor(datos.tiempo_promedio / 60);
    const minutosPromedio = Math.round(datos.tiempo_promedio % 60);
    const tiempoPromedioTexto = datos.tiempo_promedio > 0 
        ? (horasPromedio > 0 
            ? `${horasPromedio}h ${minutosPromedio}min` 
            : `${minutosPromedio} min`)
        : '0 min';

    // Calcular horas totales
    const horasTotales = (datos.tiempo_total / 60).toFixed(1);
    const diasTotales = (datos.tiempo_total / (60 * 24)).toFixed(1);
    const tiempoTotalTexto = datos.tiempo_total > 0
        ? (datos.tiempo_total >= 1440 // Más de 1 día
            ? `${diasTotales} días`
            : `${horasTotales} hrs`)
        : '0 hrs';

    container.innerHTML = `
        <div class="reporte-stat">
            <div class="stat-label">Total de Tareas</div>
            <div class="stat-value">${datos.total_tareas}</div>
        </div>
        <div class="reporte-stat success">
            <div class="stat-label">Completadas</div>
            <div class="stat-value">${datos.completadas} (${porcentajeCompletadas}%)</div>
        </div>
        <div class="reporte-stat warning">
            <div class="stat-label">Pendientes</div>
            <div class="stat-value">${datos.pendientes}</div>
        </div>
        <div class="reporte-stat info">
            <div class="stat-label">En Progreso</div>
            <div class="stat-value">${datos.en_progreso}</div>
        </div>
        <div class="reporte-stat danger">
            <div class="stat-label">Urgentes</div>
            <div class="stat-value">${datos.urgentes}</div>
        </div>
        <div class="reporte-stat" title="Tiempo promedio desde creación hasta completado">
            <div class="stat-label">Tiempo Promedio</div>
            <div class="stat-value">${tiempoPromedioTexto}</div>
        </div>
        <div class="reporte-stat" title="Suma total de tiempo de todas las tareas completadas">
            <div class="stat-label">Tiempo Total</div>
            <div class="stat-value">${tiempoTotalTexto}</div>
        </div>
    `;
}

function mostrarReporteCualitativo(tareas) {
    const container = document.getElementById('reporte-cualitativo');
    
    if (tareas.length === 0) {
        container.innerHTML = '<p class="text-muted">No hay tareas en el período seleccionado</p>';
        return;
    }

    container.innerHTML = `
        <div class="reporte-list">
            ${tareas.map(t => `
                <div class="reporte-item">
                    <div class="reporte-item-header">
                        <strong>${t.titulo}</strong>
                        <span class="badge badge-${t.prioridad.toLowerCase()}">${t.prioridad}</span>
                        <span class="badge badge-${getEstadoClass(t.estado)}">${t.estado}</span>
                    </div>
                    <div class="reporte-item-body">
                        <p><i class="fas fa-user"></i> Asignado a: ${t.usuario_nombre || 'Sin asignar'}</p>
                        <p><i class="fas fa-calendar"></i> Creado: ${formatearFecha(t.fecha_creacion)}</p>
                        ${t.fecha_completado ? `<p><i class="fas fa-check"></i> Completado: ${formatearFecha(t.fecha_completado)}</p>` : ''}
                        ${t.tiempo_total_seguimiento ? `<p><i class="fas fa-clock"></i> Tiempo total: ${t.tiempo_total_seguimiento} min</p>` : ''}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// ==================== CONFIGURACIÓN ====================

async function cargarConfiguracion() {
    try {
        // Cargar configuración SMTP desde localStorage
        const smtpConfig = JSON.parse(localStorage.getItem('smtp_config') || '{}');

        document.getElementById('config-smtp-host').value = smtpConfig.host || '';
        document.getElementById('config-smtp-port').value = smtpConfig.port || '';
        document.getElementById('config-smtp-user').value = smtpConfig.user || '';
        document.getElementById('config-smtp-pass').value = smtpConfig.pass || '';
        document.getElementById('config-notif-email').checked = smtpConfig.emailEnabled || false;
        document.getElementById('config-notif-anticipadas').value = smtpConfig.anticipacionHoras || 60;
    } catch (error) {
        console.error('Error al cargar configuración:', error);
    }
}

async function guardarConfiguracion() {
    // Guardar configuración SMTP en localStorage (por ahora)
    const smtpConfig = {
        host: document.getElementById('config-smtp-host').value,
        port: document.getElementById('config-smtp-port').value,
        user: document.getElementById('config-smtp-user').value,
        pass: document.getElementById('config-smtp-pass').value,
        emailEnabled: document.getElementById('config-notif-email').checked,
        anticipacionHoras: document.getElementById('config-notif-anticipadas').value
    };

    localStorage.setItem('smtp_config', JSON.stringify(smtpConfig));

    // Nota: Para producción, implementar guardado en Supabase
    mostrarNotificacion('Configuración guardada localmente. Para emails usa Gmail con contraseña de aplicación.', 'success');
}

// ==================== UTILIDADES ====================

function formatearFecha(fecha) {
    if (!fecha) return '-';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatearFechaInput(fecha) {
    if (!fecha) return '';
    const date = new Date(fecha);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function getEstadoClass(estado) {
    const clases = {
        'Pendiente': 'warning',
        'En Progreso': 'info',
        'Completada': 'success',
        'Cancelada': 'secondary'
    };
    return clases[estado] || 'secondary';
}

function mostrarNotificacion(mensaje, tipo = 'info') {
    // Limpiar notificaciones antiguas para evitar acumulación
    const notificacionesAnteriores = document.querySelectorAll('.notificacion-realtime');
    if (notificacionesAnteriores.length > 2) {
        notificacionesAnteriores[0].remove();
    }

    // Crear elemento de notificación
    const notif = document.createElement('div');
    notif.className = `notificacion-realtime notificacion-realtime-${tipo}`;
    
    // Escapar HTML para evitar inyección
    const mensajeSeguro = mensaje.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
    notif.innerHTML = `
        <i class="fas fa-${tipo === 'success' ? 'check-circle' : tipo === 'error' ? 'times-circle' : 'info-circle'}"></i>
        <span>${mensajeSeguro}</span>
    `;

    // Agregar al DOM
    document.body.appendChild(notif);

    // Animar entrada
    requestAnimationFrame(() => {
        setTimeout(() => notif.classList.add('show'), 10);
    });

    // Remover después de 3 segundos
    const timeoutId = setTimeout(() => {
        notif.classList.remove('show');
        setTimeout(() => {
            if (notif.parentNode) {
                notif.remove();
            }
        }, 300);
    }, 3000);

    // Permitir cerrar manualmente
    notif.addEventListener('click', () => {
        clearTimeout(timeoutId);
        notif.classList.remove('show');
        setTimeout(() => {
            if (notif.parentNode) {
                notif.remove();
            }
        }, 300);
    });
}

// ==================== TIPOS DE TAREAS ====================

async function cargarTiposTarea() {
    if (!supabaseReady) return;

    try {
        const { data, error } = await supabase
            .from('tipos_tarea')
            .select('*')
            .order('nombre');

        if (error) {
            if (error.code === 'PGRST116' || error.message.includes('relation "tipos_tarea" does not exist')) {
                console.warn('Tabla tipos_tarea no existe aún');
                return;
            } else {
                throw error;
            }
        }

        const tipos = data || [];

        // Actualizar tabla en configuración
        const tbody = document.getElementById('tabla-tipos-tarea');
        if (tbody) {
            tbody.innerHTML = tipos.map(tipo => `
                <tr>
                    <td><span class="tipo-badge" style="background-color: ${tipo.color}">${tipo.nombre}</span></td>
                    <td>${tipo.area || '-'}</td>
                    <td>${tipo.descripcion || '-'}</td>
                    <td>
                        <button class="btn-icon" onclick="abrirModalTipoTarea(${tipo.id})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon" onclick="eliminarTipoTarea(${tipo.id})" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        }

        // Actualizar select en modal de tareas
        const select = document.getElementById('tarea-tipo');
        if (select) {
            select.innerHTML = '<option value="">Sin tipo específico</option>' +
                tipos.map(tipo => `<option value="${tipo.id}">${tipo.nombre} (${tipo.area || 'General'})</option>`).join('');
        }

    } catch (error) {
        console.error('Error al cargar tipos de tarea:', error);
    }
}

function abrirModalTipoTarea(id = null) {
    const modal = document.getElementById('modal-tipo-tarea');
    const titulo = document.getElementById('modal-tipo-tarea-titulo');
    const form = document.getElementById('form-tipo-tarea');

    form.reset();

    if (id) {
        // Modo edición
        titulo.innerHTML = '<i class="fas fa-tag"></i> Editar Tipo de Tarea';
        
        // Cargar datos del tipo usando Supabase
        supabase
            .from('tipos_tarea')
            .select('*')
            .eq('id', id)
            .single()
            .then(({ data: tipo, error }) => {
                if (error) {
                    console.error('Error cargando tipo:', error);
                    return;
                }
                if (tipo) {
                    document.getElementById('tipo-id').value = tipo.id;
                    document.getElementById('tipo-nombre').value = tipo.nombre;
                    document.getElementById('tipo-area').value = tipo.area;
                    document.getElementById('tipo-descripcion').value = tipo.descripcion || '';
                    document.getElementById('tipo-color').value = tipo.color || '#3b82f6';
                }
            });
    } else {
        // Modo creación
        titulo.innerHTML = '<i class="fas fa-tag"></i> Nuevo Tipo de Tarea';
        document.getElementById('tipo-id').value = '';
    }

    modal.style.display = 'flex';
}

function cerrarModalTipoTarea() {
    document.getElementById('modal-tipo-tarea').style.display = 'none';
}

async function guardarTipoTarea(event) {
    event.preventDefault();

    const id = document.getElementById('tipo-id').value;
    const tipo = {
        nombre: document.getElementById('tipo-nombre').value,
        area: document.getElementById('tipo-area').value,
        descripcion: document.getElementById('tipo-descripcion').value,
        color: document.getElementById('tipo-color').value
    };

    try {
        let result;
        if (id) {
            result = await supabase
                .from('tipos_tarea')
                .update(tipo)
                .eq('id', id);
        } else {
            result = await supabase
                .from('tipos_tarea')
                .insert([tipo]);
        }

        if (result.error) throw result.error;

        mostrarNotificacion(id ? 'Tipo actualizado' : 'Tipo creado', 'success');
        cerrarModalTipoTarea();
        await cargarTiposTarea();
    } catch (error) {
        console.error('Error al guardar tipo:', error);
        mostrarNotificacion('Error al guardar el tipo', 'error');
    }
}

async function eliminarTipoTarea(id) {
    if (!confirm('¿Eliminar este tipo de tarea? Las tareas existentes no se eliminarán.')) return;

    try {
        const { error } = await supabase
            .from('tipos_tarea')
            .delete()
            .eq('id', id);

        if (error) throw error;

        mostrarNotificacion('Tipo eliminado', 'success');
        await cargarTiposTarea();
    } catch (error) {
        console.error('Error al eliminar tipo:', error);
        mostrarNotificacion('Error al eliminar el tipo', 'error');
    }
}

// ==================== ADJUNTOS ====================

async function cargarAdjuntos(tareaId) {
    try {
        const { data, error } = await supabase
            .from('adjuntos')
            .select('*')
            .eq('tarea_id', tareaId)
            .order('fecha_subida', { ascending: false });

        if (error) throw error;

        const adjuntos = data || [];

        const container = document.getElementById('lista-adjuntos');
        if (!container) return;

        if (adjuntos.length === 0) {
            container.innerHTML = '<p class="text-muted">No hay archivos adjuntos</p>';
            return;
        }

        container.innerHTML = adjuntos.map(adj => {
            const icon = getFileIcon(adj.nombre_archivo);
            const size = formatFileSize(adj.tamano);
            const fecha = new Date(adj.fecha_subida).toLocaleString('es-ES');

            return `
                <div class="adjunto-item">
                    <i class="${icon} file-icon"></i>
                    <div class="adjunto-info">
                        <strong>${adj.nombre_archivo}</strong>
                        <small>${size} - ${fecha}</small>
                    </div>
                    <div class="adjunto-acciones">
                        <a href="${supabase.supabaseUrl}/storage/v1/object/public/adjuntos/${adj.ruta_archivo}" target="_blank" class="btn-icon" title="Descargar">
                            <i class="fas fa-download"></i>
                        </a>
                        <button class="btn-icon" onclick="eliminarAdjunto(${adj.id}, ${tareaId})" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error('Error al cargar adjuntos:', error);
        const container = document.getElementById('lista-adjuntos');
        if (container) {
            container.innerHTML = '<p class="text-muted">Error al cargar archivos adjuntos</p>';
        }
    }
}

async function subirAdjunto() {
    const tareaId = tareaEditando;
    const fileInput = document.getElementById('tarea-archivo');

    if (!fileInput.files.length) {
        mostrarNotificacion('Selecciona un archivo', 'error');
        return;
    }

    const file = fileInput.files[0];
    const fileName = `${Date.now()}_${file.name}`;

    try {
        // Subir archivo a Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('adjuntos')
            .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Guardar registro en la tabla adjuntos
        const { error: dbError } = await supabase
            .from('adjuntos')
            .insert([{
                tarea_id: tareaId,
                nombre_archivo: file.name,
                ruta_archivo: fileName,
                tamano: file.size,
                tipo_archivo: file.type
            }]);

        if (dbError) throw dbError;

        mostrarNotificacion('Archivo subido correctamente', 'success');
        fileInput.value = '';
        await cargarAdjuntos(tareaId);
    } catch (error) {
        console.error('Error al subir adjunto:', error);
        mostrarNotificacion('Error al subir el archivo', 'error');
    }
}

async function eliminarAdjunto(adjuntoId, tareaId) {
    if (!confirm('¿Eliminar este archivo?')) return;

    try {
        // Primero obtener el archivo para saber su ruta
        const { data: adjunto, error: fetchError } = await supabase
            .from('adjuntos')
            .select('ruta_archivo, nombre_archivo')
            .eq('id', adjuntoId)
            .single();

        if (fetchError) throw fetchError;

        // Extraer el nombre del archivo de la ruta completa
        const fileName = adjunto.ruta_archivo.split('/').pop();

        // Eliminar archivo del storage
        const { error: storageError } = await supabase.storage
            .from('adjuntos')
            .remove([fileName]);

        if (storageError) {
            console.error('Error eliminando archivo del storage:', storageError);
            // Continuar con la eliminación del registro aunque falle el storage
        } else {
            console.log(`✅ Archivo eliminado del storage: ${fileName}`);
        }

        // Eliminar registro de la base de datos
        const { error: dbError } = await supabase
            .from('adjuntos')
            .delete()
            .eq('id', adjuntoId);

        if (dbError) throw dbError;

        mostrarNotificacion('Archivo eliminado correctamente', 'success');
        await cargarAdjuntos(tareaId);
    } catch (error) {
        console.error('Error al eliminar adjunto:', error);
        mostrarNotificacion('Error al eliminar el archivo', 'error');
    }
}

function getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const iconMap = {
        'pdf': 'fas fa-file-pdf',
        'doc': 'fas fa-file-word',
        'docx': 'fas fa-file-word',
        'xls': 'fas fa-file-excel',
        'xlsx': 'fas fa-file-excel',
        'ppt': 'fas fa-file-powerpoint',
        'pptx': 'fas fa-file-powerpoint',
        'txt': 'fas fa-file-alt',
        'jpg': 'fas fa-file-image',
        'jpeg': 'fas fa-file-image',
        'png': 'fas fa-file-image',
        'gif': 'fas fa-file-image',
        'zip': 'fas fa-file-archive',
        'rar': 'fas fa-file-archive'
    };
    return iconMap[ext] || 'fas fa-file';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// ==================== COMENTARIOS ====================

async function cargarComentarios(tareaId) {
    try {
        const { data, error } = await supabase
            .from('comentarios')
            .select(`
                *,
                usuarios (nombre)
            `)
            .eq('tarea_id', tareaId)
            .order('fecha', { ascending: false });

        if (error) throw error;

        const comentarios = data || [];

        const container = document.getElementById('lista-comentarios');
        if (!container) return;

        if (comentarios.length === 0) {
            container.innerHTML = '<p class="text-muted">No hay comentarios</p>';
            return;
        }

        container.innerHTML = comentarios.map(com => {
            const fecha = new Date(com.fecha).toLocaleString('es-ES');
            let badge = '';

            if (com.tipo !== 'comentario') {
                badge = `<span class="cambio-badge">${com.tipo.replace('cambio_', '').replace('_', ' ')}: ${com.valor_anterior} → ${com.valor_nuevo}</span>`;
            }

            return `
                <div class="comentario-item">
                    <div class="comentario-header">
                        <strong>${com.usuarios?.nombre || 'Usuario'}</strong>
                        <small>${fecha}</small>
                    </div>
                    ${badge}
                    <p>${com.comentario}</p>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error('Error al cargar comentarios:', error);
        const container = document.getElementById('lista-comentarios');
        if (container) {
            container.innerHTML = '<p class="text-muted">Error al cargar comentarios</p>';
        }
    }
}

async function agregarComentario() {
    const tareaId = tareaEditando;
    const textarea = document.getElementById('nuevo-comentario');
    const comentario = textarea.value.trim();

    if (!comentario) {
        mostrarNotificacion('Escribe un comentario', 'error');
        return;
    }

    try {
        const { error } = await supabase
            .from('comentarios')
            .insert([{
                tarea_id: tareaId,
                comentario,
                usuario_id: null, // Sin usuario por ahora (sistema sin login)
                tipo: 'comentario'
            }]);

        if (error) throw error;

        mostrarNotificacion('Comentario agregado', 'success');
        textarea.value = '';
        await cargarComentarios(tareaId);

        // Enviar notificación por email al usuario asignado
        const tarea = tareas.find(t => t.id == tareaId);
        if (tarea) {
            await notificarComentarioAgregado(tarea, comentario, null); // null porque no hay usuario logueado
        }
    } catch (error) {
        console.error('Error al agregar comentario:', error);
        mostrarNotificacion('Error al agregar comentario', 'error');
    }
}

// Función para verificar tareas vencidas y enviar notificaciones
async function verificarTareasVencidas() {
    if (!supabaseReady) return;
    
    const ahora = new Date();
    const hoyISO = new Date().toISOString().split('T')[0]; // Solo fecha (YYYY-MM-DD)
    
    const tareasVencidas = tareas.filter(tarea => {
        if (!tarea.fecha_vencimiento || tarea.estado === 'Completada' || tarea.estado === 'Cancelada') return false;
        const fechaVencimiento = new Date(tarea.fecha_vencimiento);
        return fechaVencimiento < ahora;
    });

    for (const tarea of tareasVencidas) {
        const usuarioAsignado = usuarios.find(u => u.id === tarea.usuario_asignado_id);
        if (!usuarioAsignado?.email) continue;

        try {
            // Verificar si ya se envió notificación HOY usando Supabase
            const { data: notificacionesHoy, error } = await supabase
                .from('notificaciones_email')
                .select('id')
                .eq('tarea_id', tarea.id)
                .eq('tipo', 'task_overdue')
                .gte('fecha_envio', `${hoyISO}T00:00:00`)
                .lte('fecha_envio', `${hoyISO}T23:59:59`)
                .limit(1);

            if (error) {
                console.error('Error verificando notificación:', error);
                continue;
            }

            // Solo enviar si NO hay notificaciones hoy
            if (!notificacionesHoy || notificacionesHoy.length === 0) {
                await notificarTareaVencida(tarea, usuarioAsignado);
                console.log(`📧 Notificación de vencimiento enviada: ${tarea.titulo}`);
            }
        } catch (err) {
            console.error('Error al verificar/enviar notificación de tarea vencida:', err);
        }
    }
}

// Verificar tareas vencidas cada 2 horas (más razonable que cada hora)
setInterval(verificarTareasVencidas, 2 * 60 * 60 * 1000);

async function probarEmail() {
    const email = prompt('Ingresa el email de prueba:');
    if (!email) return;

    // Verificar configuración
    if (GMAIL_USER === 'tu_email@gmail.com' || GMAIL_APP_PASSWORD === 'tu_contraseña_aplicación') {
        alert('⚠️ Configura primero tu Gmail:\n\n1. Ve a https://myaccount.google.com/apppasswords\n2. Genera una contraseña de aplicación\n3. Edita app.js y cambia:\n   - GMAIL_USER = "tu_email@gmail.com"\n   - GMAIL_APP_PASSWORD = "tu_contraseña_generada"\n\n¡Ya está configurado! Solo usa tu contraseña de aplicación de Google.');
        return;
    }

    mostrarNotificacion('Enviando email de prueba...', 'info');

    const subject = 'Prueba - TaskManager Pro';
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3b82f6;">¡Email de prueba enviado!</h2>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p>Este es un email de prueba desde tu TaskManager Pro.</p>
                <p><strong>Fecha de envío:</strong> ${new Date().toLocaleString('es-ES')}</p>
                <p><strong>Sistema funcionando:</strong> ✅ Correctamente</p>
                <p><strong>Método:</strong> Gmail SMTP directo con contraseña de aplicación</p>
                <p><strong>Servidor:</strong> Función serverless de Netlify</p>
            </div>
            <p>Si recibiste este email, las notificaciones están configuradas correctamente.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">
                TaskManager Pro - Sistema de gestión de tareas<br>
                Notificaciones automáticas activadas con Gmail
            </p>
        </div>
    `;

    const exito = await enviarEmail(email, subject, html, 'test');

    if (exito) {
        mostrarNotificacion('✅ Email enviado correctamente. Revisa tu bandeja de entrada.', 'success');
    } else {
        mostrarNotificacion('❌ Error al enviar email. Revisa la configuración de Gmail.', 'error');
    }
}

// ==================== DRAG & DROP ====================

let tareaArrastrada = null;

function configurarTarjetasArrastrables() {
    const tarjetas = document.querySelectorAll('.kanban-card');
    
    tarjetas.forEach(tarjeta => {
        tarjeta.addEventListener('dragstart', (e) => {
            tareaArrastrada = e.target;
            e.target.classList.add('dragging');
        });
        
        tarjeta.addEventListener('dragend', (e) => {
            e.target.classList.remove('dragging');
            tareaArrastrada = null;
        });
    });
}

function configurarDragAndDrop(container, estadoDestino) {
    // Permitir soltar elementos
    container.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        container.classList.add('drag-over');
    });
    
    // Permitir entrada de elementos
    container.addEventListener('dragenter', (e) => {
        e.preventDefault();
        e.stopPropagation();
        container.classList.add('drag-over');
    });
    
    // Quitar resaltado al salir
    container.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        // Solo remover si salimos del contenedor, no de un hijo
        if (e.target === container || !container.contains(e.relatedTarget)) {
            container.classList.remove('drag-over');
        }
    });
    
    // Manejar el drop
    container.addEventListener('drop', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        container.classList.remove('drag-over');
        
        if (!tareaArrastrada) return;
        
        const tareaId = tareaArrastrada.getAttribute('data-tarea-id');
        const tarea = tareas.find(t => t.id == tareaId);
        
        // Permitir mover a cualquier estado, incluso si es el mismo
        if (!tarea) return;
        
        // Si es el mismo estado, solo recargar para reordenar
        if (tarea.estado === estadoDestino) {
            await cargarTareas();
            return;
        }
        
        // Actualizar estado de la tarea
        await cambiarEstadoTarea(tareaId, estadoDestino);
    });
}

async function cambiarEstadoTarea(tareaId, nuevoEstado) {
    try {
        // Validar que el ID de tarea existe
        if (!tareaId || tareaId === 'null' || tareaId === 'undefined') {
            console.error('ID de tarea inválido:', tareaId);
            return;
        }

        // Buscar la tarea por ID (conversión a número para comparación estricta)
        const tarea = tareas.find(t => parseInt(t.id) === parseInt(tareaId));
        
        if (!tarea) {
            console.error('Tarea no encontrada:', tareaId);
            mostrarNotificacion('Error: Tarea no encontrada', 'error');
            return;
        }

        // Validar que el título existe (campo obligatorio)
        if (!tarea.titulo || tarea.titulo.trim() === '') {
            console.error('Tarea sin título válido');
            mostrarNotificacion('Error: Tarea sin título', 'error');
            return;
        }
        
        // Preservar TODOS los datos de la tarea sin mezclar
        const datosActualizados = {
            titulo: tarea.titulo,
            descripcion: tarea.descripcion || '',
            prioridad: tarea.prioridad || 'Media',
            estado: nuevoEstado,
            usuario_asignado_id: tarea.usuario_asignado_id || null,
            fecha_vencimiento: tarea.fecha_vencimiento || null,
            fecha_inicio: tarea.fecha_inicio || null,
            tiempo_estimado: tarea.tiempo_estimado || null,
            tiempo_real: tarea.tiempo_real || null,
            categoria: tarea.categoria || '',
            notas: tarea.notas || '',
            tipo_tarea_id: tarea.tipo_tarea_id || null,
            area: tarea.area || '',
            // Actualizar fecha de completado
            fecha_completado: nuevoEstado === 'Completada' ? new Date().toISOString() : tarea.fecha_completado
        };

        // Log para debugging (puedes comentar después)
        console.log('Actualizando tarea:', {
            id: tareaId,
            titulo: datosActualizados.titulo,
            estadoAnterior: tarea.estado,
            estadoNuevo: nuevoEstado,
            tipo_tarea_id: datosActualizados.tipo_tarea_id,
            area: datosActualizados.area
        });
        
        const { error } = await supabase
            .from('tareas')
            .update(datosActualizados)
            .eq('id', tareaId);
        
        if (error) throw error;
            
        // Mensajes claros y específicos
        let mensaje = '';
        const estadoAnterior = tarea.estado;
        
        if (estadoAnterior === 'Completada' && nuevoEstado !== 'Completada') {
            mensaje = `✓ "${tarea.titulo}" reactivada → ${nuevoEstado}`;
        } else if (nuevoEstado === 'Completada') {
            mensaje = `✓ "${tarea.titulo}" completada`;
        } else {
            mensaje = `✓ "${tarea.titulo}" → ${nuevoEstado}`;
        }
        
        mostrarNotificacion(mensaje, 'success');
        
        // Recargar tareas para asegurar sincronización
        await cargarTareas();

        // Enviar notificación si la tarea se completó
        if (nuevoEstado === 'Completada' && estadoAnterior !== 'Completada') {
            const usuarioAsignado = usuarios.find(u => u.id === tarea.usuario_asignado_id);
            if (usuarioAsignado) {
                await notificarTareaCompletada(tarea, usuarioAsignado);
            }
        }
    } catch (error) {
        console.error('Error al cambiar estado:', error);
        mostrarNotificacion('Error al mover la tarea', 'error');
    }
}

// Cerrar modales al hacer clic fuera
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}

// ==================== EXPORTAR FUNCIONES AL SCOPE GLOBAL ====================
// Necesario para que los onclick del HTML funcionen con ES6 modules

window.mostrarSeccion = mostrarSeccion;
window.toggleTheme = toggleTheme;
window.abrirModalTarea = abrirModalTarea;
window.cerrarModalTarea = cerrarModalTarea;
window.editarTarea = editarTarea;
window.guardarTarea = guardarTarea;
window.eliminarTarea = eliminarTarea;
window.filtrarTareas = filtrarTareas;
window.abrirModalUsuario = abrirModalUsuario;
window.cerrarModalUsuario = cerrarModalUsuario;
window.editarUsuario = editarUsuario;
window.guardarUsuario = guardarUsuario;
window.eliminarUsuario = eliminarUsuario;
window.generarReportes = generarReportes;
window.guardarConfiguracion = guardarConfiguracion;
window.probarEmail = probarEmail;
window.abrirModalTipoTarea = abrirModalTipoTarea;
window.cerrarModalTipoTarea = cerrarModalTipoTarea;
window.guardarTipoTarea = guardarTipoTarea;
window.eliminarTipoTarea = eliminarTipoTarea;
window.subirAdjunto = subirAdjunto;
window.eliminarAdjunto = eliminarAdjunto;
window.agregarComentario = agregarComentario;

// ==================== INICIALIZACIÓN DE LA APLICACIÓN ====================

// Inicializar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
    // Verificar acceso con contraseña
    if (!verificarAcceso()) return;
    
    try {
        // Verificar conexión con Supabase
        await verificarSupabase();
        
        // Cargar datos iniciales
        await cargarDatos();
        
        // Configurar elementos adicionales
        configurarFechasReporte();
        cargarTemaGuardado();
        
        console.log('✅ Aplicación inicializada correctamente');
        
    } catch (error) {
        console.error('❌ Error inicializando aplicación:', error);
        mostrarMensajeConfiguracion();
    }
});

// Commit diario 8