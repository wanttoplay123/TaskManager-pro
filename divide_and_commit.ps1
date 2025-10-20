# Script para dividir archivos en 3 partes y hacer commits separados
param(
    [string]$FilePath
)

$git = "C:\Program Files\Git\bin\git.exe"

# Leer el contenido del archivo
$content = Get-Content $FilePath -Raw

# Dividir en 3 partes aproximadamente iguales
$lines = $content -split "`n"
$totalLines = $lines.Length
$partSize = [math]::Ceiling($totalLines / 3)

for ($i = 1; $i -le 3; $i++) {
    $start = ($i - 1) * $partSize
    $end = [math]::Min($i * $partSize, $totalLines) - 1
    $partContent = $lines[$start..$end] -join "`n"
    
    # Escribir la parte al archivo
    $partContent | Out-File $FilePath -Encoding UTF8
    
    # Hacer commit
    & $git add $FilePath
    & $git commit -m "Parte $i de 3 del archivo $(Split-Path $FilePath -Leaf)"
}

# Finalmente, escribir el contenido completo
$content | Out-File $FilePath -Encoding UTF8
& $git add $FilePath
& $git commit -m "Archivo completo: $(Split-Path $FilePath -Leaf)"

# Commit diario 6