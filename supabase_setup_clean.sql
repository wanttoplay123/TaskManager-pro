-- Crear tablas para TaskManager Pro en Supabase

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    area VARCHAR(255),
    telefono VARCHAR(50),
    fecha_creacion TIMESTAMP DEFAULT NOW()
);

-- Tabla de tipos de tarea
CREATE TABLE IF NOT EXISTS tipos_tarea (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    area VARCHAR(255),
    descripcion TEXT,
    color VARCHAR(7) DEFAULT '#3b82f6',
    fecha_creacion TIMESTAMP DEFAULT NOW()
);

-- Tabla de tareas
CREATE TABLE IF NOT EXISTS tareas (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    prioridad VARCHAR(20) DEFAULT 'Media' CHECK (prioridad IN ('Baja', 'Media', 'Alta', 'Urgente')),
    estado VARCHAR(20) DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'En Progreso', 'Completada', 'Cancelada')),
    usuario_asignado_id INTEGER REFERENCES usuarios(id),
    categoria VARCHAR(255),
    fecha_creacion TIMESTAMP DEFAULT NOW(),
    fecha_vencimiento TIMESTAMP,
    fecha_inicio TIMESTAMP,
    fecha_completado TIMESTAMP,
    tiempo_estimado INTEGER,
    tiempo_real INTEGER,
    notas TEXT,
    tipo_tarea_id INTEGER REFERENCES tipos_tarea(id),
    area VARCHAR(255)
);

-- Tabla de adjuntos
CREATE TABLE IF NOT EXISTS adjuntos (
    id SERIAL PRIMARY KEY,
    tarea_id INTEGER NOT NULL REFERENCES tareas(id) ON DELETE CASCADE,
    nombre_archivo VARCHAR(255) NOT NULL,
    ruta_archivo VARCHAR(500) NOT NULL,
    tamano BIGINT,
    tipo_archivo VARCHAR(100),
    fecha_subida TIMESTAMP DEFAULT NOW()
);

-- Tabla de comentarios
CREATE TABLE IF NOT EXISTS comentarios (
    id SERIAL PRIMARY KEY,
    tarea_id INTEGER NOT NULL REFERENCES tareas(id) ON DELETE CASCADE,
    usuario_id INTEGER REFERENCES usuarios(id),
    comentario TEXT NOT NULL,
    tipo VARCHAR(50) DEFAULT 'comentario',
    valor_anterior TEXT,
    valor_nuevo TEXT,
    fecha TIMESTAMP DEFAULT NOW()
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_tareas_estado ON tareas(estado);
CREATE INDEX IF NOT EXISTS idx_tareas_usuario ON tareas(usuario_asignado_id);
CREATE INDEX IF NOT EXISTS idx_tareas_fecha_vencimiento ON tareas(fecha_vencimiento);
CREATE INDEX IF NOT EXISTS idx_adjuntos_tarea ON adjuntos(tarea_id);
CREATE INDEX IF NOT EXISTS idx_comentarios_tarea ON comentarios(tarea_id);

-- Insertar algunos datos de ejemplo
INSERT INTO usuarios (nombre, email, area) VALUES
('Juan Pérez', 'juan@example.com', 'Desarrollo'),
('María García', 'maria@example.com', 'Diseño'),
('Carlos López', 'carlos@example.com', 'Marketing')
ON CONFLICT (email) DO NOTHING;

INSERT INTO tipos_tarea (nombre, area, descripcion, color) VALUES
('Desarrollo Frontend', 'Desarrollo', 'Tareas relacionadas con el desarrollo de interfaces', '#10b981'),
('Desarrollo Backend', 'Desarrollo', 'Tareas relacionadas con APIs y bases de datos', '#3b82f6'),
('Diseño UX/UI', 'Diseño', 'Tareas de diseño de experiencia de usuario', '#f59e0b'),
('Marketing Digital', 'Marketing', 'Tareas de marketing y promoción', '#ef4444')
ON CONFLICT (nombre) DO NOTHING;

-- Crear bucket de storage para adjuntos
INSERT INTO storage.buckets (id, name, public)
VALUES ('adjuntos', 'adjuntos', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de seguridad RLS (Row Level Security)
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE tipos_tarea ENABLE ROW LEVEL SECURITY;
ALTER TABLE tareas ENABLE ROW LEVEL SECURITY;
ALTER TABLE adjuntos ENABLE ROW LEVEL SECURITY;
ALTER TABLE comentarios ENABLE ROW LEVEL SECURITY;

-- Políticas simples (permitir todo para desarrollo - ajustar en producción)
CREATE POLICY "Permitir todo en usuarios" ON usuarios FOR ALL USING (true);
CREATE POLICY "Permitir todo en tipos_tarea" ON tipos_tarea FOR ALL USING (true);
CREATE POLICY "Permitir todo en tareas" ON tareas FOR ALL USING (true);
CREATE POLICY "Permitir todo en adjuntos" ON adjuntos FOR ALL USING (true);
CREATE POLICY "Permitir todo en comentarios" ON comentarios FOR ALL USING (true);

-- Políticas de storage
CREATE POLICY "Permitir subir adjuntos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'adjuntos');
CREATE POLICY "Permitir ver adjuntos" ON storage.objects FOR SELECT USING (bucket_id = 'adjuntos');
CREATE POLICY "Permitir eliminar adjuntos" ON storage.objects FOR DELETE USING (bucket_id = 'adjuntos');

-- Commit diario 16