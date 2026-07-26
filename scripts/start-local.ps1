#Requires -Version 5.1
<#
.SYNOPSIS
  Start local Supabase stack for Green Office 2026 (no cloud login).
#>
[CmdletBinding()]
param(
  [switch] $SkipCheck
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
Set-Location $repoRoot

if (-not $SkipCheck) {
  & (Join-Path $PSScriptRoot 'check-local.ps1') -RequireDocker -RequireSupabase
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

$configToml = Join-Path $repoRoot 'supabase\config.toml'
if (-not (Test-Path $configToml)) {
  Write-Host 'ERROR: supabase/config.toml not found. Repository should include GO-INFRA-1 config.'
  exit 4
}

Write-Host 'Starting local Supabase (Docker)...'
supabase start
if ($LASTEXITCODE -ne 0) {
  Write-Host 'ERROR: supabase start failed. Is Docker Desktop running?'
  exit 5
}

Write-Host ''
Write-Host '=== Supabase local status ==='
supabase status

Write-Host ''
Write-Host 'Next steps:'
Write-Host '  1. Copy .env.example to .env'
Write-Host '  2. Run: supabase status -o env  (paste PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY)'
Write-Host '  3. Keep PUBLIC_DASHBOARD_DATA_MODE=static until PO approves live mode'
Write-Host '  4. npm run dev'

exit 0
