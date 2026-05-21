# Loads .env from repo root into the current PowerShell session (for local tests).
# Usage:  . .\scripts\load-marketing-env.ps1
# Then:   python scripts/test-syndication-secrets.py

$envFile = Join-Path (Split-Path $PSScriptRoot -Parent) ".env"
if (-not (Test-Path $envFile)) {
    Write-Error "Missing .env - copy .env.example to .env and add your keys."
    return
}

Get-Content $envFile | ForEach-Object {
    $line = $_.Trim()
    if ($line -eq "" -or $line.StartsWith("#")) { return }
    if ($line -match '^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$') {
        $name = $Matches[1]
        $value = $Matches[2].Trim().Trim('"').Trim("'")
        if ($name -eq "BLUESKY_HANDLE") { $value = $value.TrimStart("@") }
        Set-Item -Path "env:$name" -Value $value
    }
}

Write-Host "Loaded marketing env from .env"
