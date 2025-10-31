-- ============================================
-- SCRIPT DE POLÍTICAS DE STORAGE
-- Ejecutar DESPUÉS de crear el bucket 'adjuntos'
-- ============================================

-- 1. Eliminar políticas anteriores si existen
DROP POLICY IF EXISTS "Permitir subir adjuntos" ON storage.objects;
DROP POLICY IF EXISTS "Permitir ver adjuntos" ON storage.objects;
DROP POLICY IF EXISTS "Permitir eliminar adjuntos" ON storage.objects;

-- 2. Crear políticas para el bucket 'adjuntos'
CREATE POLICY "Permitir subir adjuntos" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'adjuntos');

CREATE POLICY "Permitir ver adjuntos" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'adjuntos');

CREATE POLICY "Permitir eliminar adjuntos"
ON storage.objects FOR DELETE
USING (bucket_id = 'adjuntos');

-- Commit diario 17