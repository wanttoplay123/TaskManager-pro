// Script para limpiar archivos huérfanos en Supabase Storage
// Ejecutar con: node limpiar-storage-huerfanos.js

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Configuración de Supabase
const supabaseUrl = 'https://xbbripsybpvbxbayooum.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhiYnJpcHN5YnB2YnhiYXlvb3VtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MTg1NjEsImV4cCI6MjA3NzQ5NDU2MX0.BiZsOy_qTUxalMjZcMYAEXO2XTHYjxFS2tOzrn54e6M';

const supabase = createClient(supabaseUrl, supabaseKey);

async function limpiarArchivosHuerfanos() {
    console.log('🔍 Buscando archivos huérfanos en Supabase Storage...\n');

    try {
        // 1. Obtener todos los archivos del Storage
        const { data: archivosStorage, error: storageError } = await supabase
            .storage
            .from('adjuntos')
            .list();

        if (storageError) {
            console.error('❌ Error obteniendo archivos del storage:', storageError);
            return;
        }

        if (!archivosStorage || archivosStorage.length === 0) {
            console.log('✅ No hay archivos en el storage.');
            return;
        }

        console.log(`📁 Archivos encontrados en storage: ${archivosStorage.length}`);

        // 2. Obtener todas las referencias en la base de datos
        const { data: adjuntosBD, error: bdError } = await supabase
            .from('adjuntos')
            .select('ruta_archivo');

        if (bdError) {
            console.error('❌ Error obteniendo adjuntos de la BD:', bdError);
            return;
        }

        console.log(`📊 Referencias en base de datos: ${adjuntosBD?.length || 0}\n`);

        // 3. Crear un Set con los nombres de archivos que están en la BD
        const archivosEnBD = new Set(
            adjuntosBD?.map(adj => adj.ruta_archivo.split('/').pop()) || []
        );

        // 4. Identificar archivos huérfanos
        const archivosHuerfanos = archivosStorage.filter(
            archivo => !archivosEnBD.has(archivo.name)
        );

        if (archivosHuerfanos.length === 0) {
            console.log('✅ No se encontraron archivos huérfanos. Todo está limpio!\n');
            return;
        }

        console.log(`🗑️  Archivos huérfanos encontrados: ${archivosHuerfanos.length}\n`);
        
        // Mostrar lista de archivos huérfanos
        archivosHuerfanos.forEach((archivo, index) => {
            const tamañoKB = (archivo.metadata?.size / 1024).toFixed(2);
            console.log(`   ${index + 1}. ${archivo.name} (${tamañoKB} KB)`);
        });

        console.log('\n⚠️  ADVERTENCIA: Estos archivos serán eliminados permanentemente.');
        console.log('   Para continuar con la eliminación, descomenta la sección de eliminación en el código.\n');

        // DESCOMENTA ESTA SECCIÓN PARA ELIMINAR LOS ARCHIVOS HUÉRFANOS
        /*
        console.log('\n🗑️  Eliminando archivos huérfanos...\n');
        
        const nombresArchivos = archivosHuerfanos.map(a => a.name);
        const { data: deleteData, error: deleteError } = await supabase
            .storage
            .from('adjuntos')
            .remove(nombresArchivos);

        if (deleteError) {
            console.error('❌ Error eliminando archivos:', deleteError);
            return;
        }

        console.log(`✅ ${archivosHuerfanos.length} archivos eliminados correctamente!\n`);
        
        // Calcular espacio liberado
        const espacioLiberado = archivosHuerfanos.reduce(
            (total, archivo) => total + (archivo.metadata?.size || 0), 
            0
        );
        const espacioLiberadoMB = (espacioLiberado / (1024 * 1024)).toFixed(2);
        console.log(`💾 Espacio liberado: ${espacioLiberadoMB} MB\n`);
        */

    } catch (error) {
        console.error('❌ Error en el proceso de limpieza:', error);
    }
}

// Ejecutar la limpieza
limpiarArchivosHuerfanos();
