# Pushes .env values to GitHub Actions secrets (repo: agentic-architect).
# Requires: gh auth as agenticstandardcontact-byte, .env filled in.
# Usage:  . .\scripts\sync-marketing-secrets-to-github.ps1

$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "load-marketing-env.ps1")

$repo = "agenticstandardcontact-byte/agentic-architect"
$names = @(
    "DEVTO_API_KEY",
    "BLUESKY_HANDLE",
    "BLUESKY_APP_PASSWORD",
    "MASTODON_TOKEN",
    "MASTODON_INSTANCE"
)

foreach ($name in $names) {
    $value = [Environment]::GetEnvironmentVariable($name)
    if ([string]::IsNullOrWhiteSpace($value)) {
        Write-Host "skip $name (empty)"
        continue
    }
    $value | gh secret set $name --repo $repo
    Write-Host "set  $name"
}

Write-Host ""
Write-Host "Done. Run workflows:"
Write-Host "  gh workflow run devto-draft.yml --repo $repo"
Write-Host "  gh workflow run bluesky-post.yml --repo $repo"
Write-Host "Hashnode: manual cross-post only (workflow disabled)."
