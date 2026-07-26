#Requires -Version 5.1
<#
.SYNOPSIS
  Reset local database: migrations 001–008 + seed.sql (no cloud).
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

Write-Host 'Resetting local database (migrations + seed)...'
supabase db reset
if ($LASTEXITCODE -ne 0) {
  Write-Host 'ERROR: supabase db reset failed.'
  exit 5
}

Write-Host 'Local database reset complete.'
exit 0
