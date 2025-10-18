# 🗑️ Limpieza de Archivos Huérfanos en Supabase Storage

## 📋 Problema Solucionado

**ANTES:** Cuando eliminabas una tarea con archivos adjuntos, solo se borraba el registro de la base de datos pero los archivos quedaban en Supabase Storage ocupando espacio innecesariamente.

**AHORA:** Al eliminar una tarea, se eliminan automáticamente:
- ✅ Los archivos del Storage de Supabase
- ✅ Los registros de la tabla `adjuntos`
- ✅ Los comentarios asociados
- ✅ Las notificaciones de email asociadas
- ✅ El registro de la tarea

---

## 🔧 Qué se Arregló

### 1. Función `eliminarTarea()` Mejorada
```javascript
// Ahora elimina en orden:
1. Archivos del Storage
2. Registros de adjuntos
3. Comentarios
4. Notificaciones
5. La tarea en sí
```

### 2. Función `eliminarAdjunto()` Mejorada
- Extrae correctamente el nombre del archivo de la ruta completa
- Logs detallados para debugging
- Mejor manejo de errores

---

## 🧹 Script de Limpieza Manual

Si tienes archivos huérfanos de antes del fix, usa el script:

### Paso 1: Ejecutar el script de análisis
```bash
node limpiar-storage-huerfanos.js
```

Este comando mostrará:
- Cantidad de archivos en Storage
- Cantidad de referencias en BD
- Lista de archivos huérfanos
- Tamaño de cada archivo

### Paso 2: Eliminar archivos huérfanos (si quieres)
1. Abre `limpiar-storage-huerfanos.js`
2. Busca la sección comentada que dice:
   ```javascript
   // DESCOMENTA ESTA SECCIÓN PARA ELIMINAR LOS ARCHIVOS HUÉRFANOS
   ```
3. Descomenta esa sección (quita los `/*` y `*/`)
4. Guarda y ejecuta nuevamente:
   ```bash
   node limpiar-storage-huerfanos.js
   ```

---

## 📊 Verificar Storage en Supabase

1. Ve a: https://supabase.com/dashboard/project/xbbripsybpvbxbayooum/storage/buckets
2. Entra al bucket `adjuntos`
3. Verás solo los archivos que tienen referencia en la BD

---

## ⚠️ Recomendaciones

- **Ejecuta el script de análisis** periódicamente (cada mes)
- **Haz backup antes de eliminar** archivos masivamente
- El sistema ahora limpia automáticamente, pero este script es útil para archivos antiguos

---

## 🎯 Resultado

Tu aplicación ahora:
- ✅ No deja archivos huérfanos
- ✅ Libera espacio en Storage automáticamente
- ✅ Mantiene la integridad de datos
- ✅ Limpia referencias en cascada

---

## 📝 Notas Técnicas

### Storage Path
Los archivos se guardan como: `{timestamp}_{nombre_original}`

Ejemplo: `1730405232156_documento.pdf`

### Bucket de Supabase
- **Nombre**: `adjuntos`
- **Público**: No (requiere autenticación)
- **Políticas**: Definidas en `supabase_storage_policies.sql`

---

**Desplegado en producción:** ✅ https://srwilltask.netlify.app

# Commit diario 4
