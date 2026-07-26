#Requires -Version 5.1
<#
.SYNOPSIS
  Verify local development prerequisites for Green Office 2026 (GO-INFRA-1).
.DESCRIPTION
  Checks Node, npm, Git, PowerShell, Docker Desktop, and Supabase CLI.
  Does not install tools or require cloud login.
.PARAMETER RequireDocker
  Exit non-zero when Docker is missing (for start/reset scripts).
.PARAMETER RequireSupabase
  Exit non-zero when Supabase CLI is missing.
#>
[CmdletBinding()]
param(
  [switch] $RequireDocker,
  [switch] $RequireSupabase
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Continue'

$script:HasFailure = $false
$script:Results = @()

function Add-CheckResult {
  param(
    [string] $Name,
    [string] $Status,
    [string] $Detail = ''
  )
  $script:Results += [PSCustomObject]@{ Name = $Name; Status = $Status; Detail = $Detail }
  if ($Status -eq 'NOT_INSTALLED' -or $Status -eq 'VERSION_MISMATCH') {
    $script:HasFailure = $true
  }
}

function Get-CommandVersion {
  param([string] $Command, [string] $VersionArgs = '--version')
  $cmd = Get-Command $Command -ErrorAction SilentlyContinue
  if (-not $cmd) { return $null }
  try {
    $raw = & $Command $VersionArgs.Split(' ') 2>&1 | Select-Object -First 1
    return ($raw | Out-String).Trim()
  } catch {
    return $null
  }
}

function Test-Node {
  $versionText = Get-CommandVersion -Command 'node' -VersionArgs '-v'
  if (-not $versionText) {
    Add-CheckResult -Name 'Node.js' -Status 'NOT_INSTALLED' -Detail 'Required >= 20 (see package.json engines)'
    return
  }
  $major = 0
  if ($versionText -match 'v?(\d+)') { $major = [int]$Matches[1] }
  if ($major -ge 20) {
    Add-CheckResult -Name 'Node.js' -Status 'READY' -Detail $versionText
  } else {
    Add-CheckResult -Name 'Node.js' -Status 'VERSION_MISMATCH' -Detail "$versionText (need >= 20)"
  }
}

function Test-Npm {
  $versionText = Get-CommandVersion -Command 'npm' -VersionArgs '-v'
  if (-not $versionText) {
    Add-CheckResult -Name 'npm' -Status 'NOT_INSTALLED'
  } else {
    Add-CheckResult -Name 'npm' -Status 'READY' -Detail $versionText
  }
}

function Test-Git {
  $versionText = Get-CommandVersion -Command 'git'
  if (-not $versionText) {
    Add-CheckResult -Name 'Git' -Status 'NOT_INSTALLED'
  } else {
    Add-CheckResult -Name 'Git' -Status 'READY' -Detail $versionText
  }
}

function Test-PowerShellHost {
  $ver = $PSVersionTable.PSVersion.ToString()
  $edition = $PSVersionTable.PSEdition
  if ($PSVersionTable.PSVersion.Major -ge 5) {
    Add-CheckResult -Name 'PowerShell' -Status 'READY' -Detail "$edition $ver"
  } else {
    Add-CheckResult -Name 'PowerShell' -Status 'VERSION_MISMATCH' -Detail "$edition $ver (need >= 5.1)"
  }
}

function Test-Docker {
  $versionText = Get-CommandVersion -Command 'docker'
  if (-not $versionText) {
    Add-CheckResult -Name 'Docker Desktop' -Status 'NOT_INSTALLED' -Detail 'Required for local Supabase stack'
    return
  }
  try {
    docker info 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
      Add-CheckResult -Name 'Docker Desktop' -Status 'READY' -Detail $versionText
    } else {
      Add-CheckResult -Name 'Docker Desktop' -Status 'NOT_INSTALLED' -Detail 'CLI found but daemon not running'
    }
  } catch {
    Add-CheckResult -Name 'Docker Desktop' -Status 'NOT_INSTALLED' -Detail 'Daemon not reachable'
  }
}

function Test-SupabaseCli {
  $versionText = Get-CommandVersion -Command 'supabase' -VersionArgs '--version'
  if (-not $versionText) {
    Add-CheckResult -Name 'Supabase CLI' -Status 'NOT_INSTALLED' -Detail 'https://supabase.com/docs/guides/cli'
  } else {
    Add-CheckResult -Name 'Supabase CLI' -Status 'READY' -Detail $versionText
  }
}

Test-Node
Test-Npm
Test-Git
Test-PowerShellHost
Test-Docker
Test-SupabaseCli

Write-Host ''
Write-Host '=== Local prerequisite check (GO-INFRA-1) ==='
foreach ($r in $script:Results) {
  $line = ('{0,-18} {1}' -f $r.Name, $r.Status)
  if ($r.Detail) { $line += " - $($r.Detail)" }
  Write-Host $line
}
Write-Host ''

$dockerMissing = ($script:Results | Where-Object { $_.Name -eq 'Docker Desktop' -and $_.Status -ne 'READY' })
$supabaseMissing = ($script:Results | Where-Object { $_.Name -eq 'Supabase CLI' -and $_.Status -ne 'READY' })

if ($RequireDocker -and $dockerMissing) {
  Write-Host 'ERROR: Docker Desktop is required for this command.'
  exit 2
}
if ($RequireSupabase -and $supabaseMissing) {
  Write-Host 'ERROR: Supabase CLI is required for this command.'
  exit 3
}

if ($script:HasFailure -and -not $RequireDocker -and -not $RequireSupabase) {
  Write-Host 'NOTE: Some optional tools are missing. Static frontend work (npm run dev/build) may still succeed.'
  exit 0
}

if ($script:HasFailure) { exit 1 }
exit 0
