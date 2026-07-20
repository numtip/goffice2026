#Requires -Version 5.1
<#
.SYNOPSIS
  Persistent Microsoft 365 / Edge bootstrap for Green Office 2026 agents.
.DESCRIPTION
  Opens Microsoft Edge with a dedicated persistent profile per authorized account.
  Never clears cookies, never switches accounts silently, never logs out.
.PARAMETER Account
  Account alias: researchmju (default) or prinya.
.PARAMETER Url
  Override landing URL (host/path only logged; query tokens not logged).
.PARAMETER CheckOnly
  Validate environment and profile state without launching Edge (unless -VerifyAuth used with session-check).
.PARAMETER NoLaunch
  Do not start Edge; report status only.
.PARAMETER VerboseMode
  Print additional non-sensitive operational detail.
.EXAMPLE
  .\scripts\m365-agent-bootstrap.ps1
.EXAMPLE
  .\scripts\m365-agent-bootstrap.ps1 -Account prinya -Url "https://maejo365-my.sharepoint.com/"
.EXAMPLE
  .\scripts\m365-agent-bootstrap.ps1 -Account researchmju -CheckOnly
#>
[CmdletBinding()]
param(
  [string] $Account,

  [string] $Url,

  [switch] $CheckOnly,

  [switch] $NoLaunch,

  [switch] $VerboseMode
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$commonPath = Join-Path $PSScriptRoot 'm365-bootstrap-common.ps1'
if (-not (Test-Path $commonPath)) {
  Write-Host 'STATUS=CONFIGURATION_ERROR'
  Write-Host 'Missing scripts/m365-bootstrap-common.ps1'
  exit 5
}

. $commonPath

try {
  $repoRoot = Get-M365RepoRoot
  $config = Get-M365Config -RepoRoot $repoRoot

  if (-not $Account) {
    $Account = if ($config.defaultAccount) { $config.defaultAccount } else { 'researchmju' }
  }

  if ($Account -notin @('researchmju', 'prinya')) {
    Write-Host 'STATUS=INVALID_ACCOUNT'
    Write-Host "Unknown account alias '$Account'. Use researchmju or prinya."
    exit 4
  }

  $entry = Get-M365AccountEntry -Config $config -Alias $Account
  $profilePath = Get-M365ProfilePath -Config $config -Alias $Account
  $targetUrl = if ($Url) { $Url } else { $entry.DefaultUrl }

  if ($VerboseMode) {
    Write-Host "Repository: $repoRoot"
    Write-Host "Account alias: $Account"
    Write-Host "Masked UPN: $(Format-M365MaskedEmail -Email $entry.Upn)"
    Write-Host "Profile: $profilePath"
    Write-Host "Target: $(Format-M365SafeUrl -RawUrl $targetUrl)"
  }

  $launch = -not ($CheckOnly -or $NoLaunch)
  $verify = $false

  if ($Account -eq 'researchmju' -and -not $Url) {
    $raeDoc = Join-Path $repoRoot 'docs/sharepoint/GO-SP1-site-assessment.md'
    if (Test-Path $raeDoc) {
      if ($VerboseMode) { Write-Host 'RAE site URL sourced from docs/sharepoint/GO-SP1-site-assessment.md (maejo365.sharepoint.com).' }
    } else {
      if ($VerboseMode) { Write-Host 'RAE site URL not resolved in docs; using config defaultUrl.' }
    }
  }

  New-Item -ItemType Directory -Force -Path $profilePath | Out-Null

  $result = Get-M365SessionStatus `
    -RepoRoot $repoRoot `
    -Config $config `
    -Account $Account `
    -Url $targetUrl `
    -VerifyAuth:$verify `
    -NoLaunch:(-not $launch) `
    -VerboseMode:$VerboseMode

  Write-M365BootstrapLog -RepoRoot $repoRoot -Config $config -Message 'bootstrap' -Fields @{
    alias       = $Account
    maskedUpn   = $result.MaskedUpn
    profilePath = $result.ProfilePath
    targetHost  = $result.TargetHost
    status      = $result.Status
    checkOnly   = [bool]$CheckOnly
    launched    = $launch
  }

  Write-M365StatusOutput -Result $result

  if ($result.Status -eq 'LOGIN_REQUIRED' -and $launch) {
    Write-Host ''
    Write-Host 'ACTION REQUIRED: Complete Microsoft login or MFA in the Edge window for Product Owner.'
    Write-Host 'Do not switch accounts. Use the account shown above.'
  }

  if ($result.Status -eq 'PROFILE_IN_USE') {
    Write-Host ''
    Write-Host 'RECOVERY: Reuse the existing Edge window for this profile, or close that Edge instance before relaunching.'
  }

  exit (Get-M365ExitCode -Status $result.Status)
} catch {
  if ($_.Exception.Message -match '^INVALID_ACCOUNT:') {
    Write-Host 'STATUS=INVALID_ACCOUNT'
    Write-Host $_.Exception.Message
    exit 4
  }
  Write-Host 'STATUS=CONFIGURATION_ERROR'
  Write-Host $_.Exception.Message
  exit 5
}
