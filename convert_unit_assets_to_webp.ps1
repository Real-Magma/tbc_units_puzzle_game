param(
    [ValidateRange(1, 8)]
    [int]$Parallelism = 4
)

$projectRoot = $PSScriptRoot
$unitsRoot = Join-Path $projectRoot "assets\units"
$folders = Get-ChildItem -LiteralPath $unitsRoot -Recurse -Directory |
    Where-Object { (Get-ChildItem -LiteralPath $_.FullName -Filter "*.png" -File).Count -gt 0 }
$totalImages = (Get-ChildItem -LiteralPath $unitsRoot -Filter "*.png" -Recurse -File | Measure-Object).Count
$worker = {
    param([string]$folderList)
    foreach ($folderPath in $folderList -split "`n") {
        $pending = Get-ChildItem -LiteralPath $folderPath -Filter "*.png" -File |
            Where-Object { -not (Test-Path -LiteralPath (Join-Path $_.DirectoryName ($_.BaseName + ".webp"))) }

        if (@($pending).Count -gt 0) {
            & magick mogrify -format webp -define webp:lossless=true -quality 100 -define webp:method=4 -- @($pending.FullName)
            if ($LASTEXITCODE -ne 0) {
                throw "WebP conversion failed: $folderPath"
            }
        }
    }
}

$jobs = for ($workerIndex = 0; $workerIndex -lt $Parallelism; $workerIndex++) {
    $workerFolders = @()
    for ($folderIndex = $workerIndex; $folderIndex -lt $folders.Count; $folderIndex += $Parallelism) {
        $workerFolders += $folders[$folderIndex].FullName
    }
    Start-Job -ScriptBlock $worker -ArgumentList ($workerFolders -join "`n")
}

while (@($jobs | Where-Object State -eq "Running").Count -gt 0) {
    $done = $totalImages - (Get-ChildItem -LiteralPath $unitsRoot -Filter "*.png" -Recurse -File |
        Where-Object { -not (Test-Path -LiteralPath (Join-Path $_.DirectoryName ($_.BaseName + ".webp"))) } |
        Measure-Object).Count
    Write-Host "Processed images: $done / $totalImages"
    Start-Sleep -Seconds 10
}

$jobs | Receive-Job
$jobs | Remove-Job
node (Join-Path $projectRoot "switch_unit_catalog_to_webp.mjs")
Write-Host "Done: website unit assets now use WebP."
