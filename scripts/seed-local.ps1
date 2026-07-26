#Requires -Version 5.1
<#
.SYNOPSIS
  Re-apply supabase/seed.sql to the local database (no cloud).
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

$seedFile = Join-Path $repoRoot 'supabase\seed.sql'
if (-not (Test-Path $seedFile)) {
  Write-Host "ERROR: Seed file not found: $seedFile"
  exit 4
}

Write-Host 'Applying seed.sql to local database...'
supabase db execute --local --file $seedFile
if ($LASTEXITCODE -ne 0) {
  Write-Host 'ERROR: supabase db execute failed. Try scripts/reset-local.ps1 for full migration + seed.'
  exit 5
}

Write-Host 'Seed applied successfully.'
exit 0
