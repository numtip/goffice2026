#Requires -Version 5.1
<#
.SYNOPSIS
  Microsoft 365 session check for Green Office 2026 agent bootstrap.
#>
[CmdletBinding()]
param(
  [string] $Account = 'researchmju',
  [string] $Url,
  [switch] $NoLaunch,
  [switch] $VerifyAuth,
  [switch] $VerboseMode
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

. (Join-Path $PSScriptRoot 'm365-bootstrap-common.ps1')

if ($Account -notin @('researchmju', 'prinya')) {
  Write-Host 'STATUS=INVALID_ACCOUNT'
  Write-Host "Unknown account alias '$Account'. Use researchmju or prinya."
  exit 4
}

try {
  $repoRoot = Get-M365RepoRoot
  $config = Get-M365Config -RepoRoot $repoRoot
  $result = Get-M365SessionStatus -RepoRoot $repoRoot -Config $config -Account $Account -Url $Url -VerifyAuth:$VerifyAuth -NoLaunch:$NoLaunch -VerboseMode:$VerboseMode

  Write-M365BootstrapLog -RepoRoot $repoRoot -Config $config -Message 'session-check' -Fields @{
    alias       = $Account
    maskedUpn   = $result.MaskedUpn
    profilePath = $result.ProfilePath
    targetHost  = $result.TargetHost
    status      = $result.Status
    launched    = (-not $NoLaunch)
  }

  Write-M365StatusOutput -Result $result
  exit (Get-M365ExitCode -Status $result.Status)
} catch {
  Write-Host 'STATUS=CONFIGURATION_ERROR'
  Write-Host $_.Exception.Message
  exit 5
}
