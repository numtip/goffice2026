#Requires -Version 5.1
# Shared functions for M365 agent bootstrap (no param block — safe to dot-source).

function Get-M365RepoRoot {
  $dir = Split-Path -Parent $PSScriptRoot
  if (Test-Path (Join-Path $dir '.git')) { return (Resolve-Path $dir).Path }
  throw 'CONFIGURATION_ERROR: Cannot resolve repository root from scripts folder.'
}

function Get-M365Config {
  param([string] $RepoRoot)
  $localPath = Join-Path $RepoRoot 'config/m365-bootstrap.json'
  $examplePath = Join-Path $RepoRoot 'config/m365-bootstrap.example.json'
  $path = if (Test-Path $localPath) { $localPath } elseif (Test-Path $examplePath) { $examplePath } else {
    throw 'CONFIGURATION_ERROR: Missing config/m365-bootstrap.example.json'
  }
  $raw = Get-Content -Raw -Path $path | ConvertFrom-Json
  return $raw
}

function Get-M365TargetHost {
  param([string] $RawUrl)
  if (-not $RawUrl) { return '' }
  try { return ([Uri]$RawUrl).Host } catch { return '' }
}

function Get-M365EdgePath {
  $candidates = @(
    "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
    "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe",
    "$env:LocalAppData\Microsoft\Edge\Application\msedge.exe"
  )
  foreach ($p in $candidates) {
    if ($p -and (Test-Path $p)) { return (Resolve-Path $p).Path }
  }
  return $null
}

function Get-M365AccountEntry {
  param($Config, [string] $Alias)
  if (-not $Config.accounts.PSObject.Properties.Name.Contains($Alias)) {
    throw "INVALID_ACCOUNT: Unknown alias '$Alias'. Use researchmju or prinya."
  }
  return [PSCustomObject]@{
    Alias         = $Alias
    Upn           = $Config.accounts.$Alias.upn
    DisplayName   = $Config.accounts.$Alias.displayName
    DefaultUrl    = $Config.accounts.$Alias.defaultUrl
    LoginHintUrl  = $Config.accounts.$Alias.loginHintUrl
    ExpectedHosts = @($Config.accounts.$Alias.expectedHosts)
  }
}

function Get-M365ProfilePath {
  param($Config, [string] $Alias)
  $root = $Config.profileRoot
  if (-not $root) { throw 'CONFIGURATION_ERROR: profileRoot missing in config.' }
  return Join-Path $root $Alias
}

function Format-M365MaskedEmail {
  param([string] $Email)
  if (-not $Email) { return 'unknown' }
  $parts = $Email -split '@', 2
  if ($parts.Count -lt 2) { return '***' }
  $local = $parts[0]
  $mask = if ($local.Length -le 4) { $local.Substring(0, [Math]::Min(1, $local.Length)) + '***' } else { $local.Substring(0, 4) + '***' }
  return "$mask@$($parts[1])"
}

function Format-M365SafeUrl {
  param([string] $RawUrl)
  if (-not $RawUrl) { return '' }
  try {
    $u = [Uri]$RawUrl
    return "$($u.Scheme)://$($u.Host)$($u.AbsolutePath)"
  } catch {
    return ($RawUrl -replace '\?.*$', '')
  }
}

function Write-M365BootstrapLog {
  param(
    [string] $RepoRoot,
    $Config,
    [string] $Message,
    [hashtable] $Fields = @{}
  )
  $logRel = if ($Config.logDirectory) { $Config.logDirectory } else { '.local/m365-bootstrap/logs' }
  $logDir = Join-Path $RepoRoot ($logRel -replace '/', [IO.Path]::DirectorySeparatorChar)
  New-Item -ItemType Directory -Force -Path $logDir | Out-Null
  $logFile = Join-Path $logDir ("bootstrap-{0:yyyyMMdd}.log" -f (Get-Date))
  $payload = @{
    timestamp = (Get-Date).ToString('o')
    message   = $Message
  }
  foreach ($k in $Fields.Keys) { $payload[$k] = $Fields[$k] }
  try {
    ($payload | ConvertTo-Json -Compress) | Add-Content -Path $logFile -Encoding UTF8 -ErrorAction Stop
  } catch {
    # Non-fatal: log file may be locked by concurrent bootstrap run
  }
}

function Test-M365ProfileInUse {
  param([string] $ProfilePath)
  if (-not (Test-Path $ProfilePath)) { return $false }

  $lockFiles = @('SingletonLock', 'SingletonCookie', 'lockfile')
  foreach ($name in $lockFiles) {
    $fp = Join-Path $ProfilePath $name
    if (Test-Path $fp) {
      try {
        $stream = [IO.File]::Open($fp, 'Open', 'Read', 'None')
        $stream.Close()
      } catch {
        return $true
      }
    }
  }

  try {
    $procs = Get-CimInstance Win32_Process -Filter "Name='msedge.exe'" -ErrorAction SilentlyContinue
    foreach ($proc in $procs) {
      $cmd = $proc.CommandLine
      if ($cmd -and ($cmd -like "*--user-data-dir=$ProfilePath*" -or $cmd -like "*--user-data-dir=`"$ProfilePath`"*")) {
        return $true
      }
    }
  } catch {
    # Non-fatal: cannot inspect processes
  }
  return $false
}

function Get-M365NodePath {
  $node = Get-Command node -ErrorAction SilentlyContinue
  if ($node) { return $node.Source }
  return $null
}

function Invoke-M365AuthProbe {
  param(
    [string] $RepoRoot,
    [string] $ProfilePath,
    [string] $TargetUrl,
    [string] $ExpectedHost
  )
  $node = Get-M365NodePath
  $probe = Join-Path $RepoRoot 'scripts/m365-auth-probe.mjs'
  if (-not $node -or -not (Test-Path $probe)) {
    return [PSCustomObject]@{ Status = 'SESSION_PRESENT_AUTH_UNVERIFIED'; Reason = 'auth_probe_unavailable' }
  }
  try {
    $playwrightDir = Join-Path $RepoRoot 'node_modules/playwright-core'
    if (-not (Test-Path $playwrightDir)) {
      return [PSCustomObject]@{ Status = 'SESSION_PRESENT_AUTH_UNVERIFIED'; Reason = 'playwright_core_missing' }
    }
    $output = & $node $probe --user-data-dir $ProfilePath --url $TargetUrl --expected-host $ExpectedHost 2>&1 | Out-String
    if ($output -match 'existing browser session') {
      return [PSCustomObject]@{ Status = 'PROFILE_IN_USE'; Reason = 'profile_in_use_by_edge' }
    }
    $jsonLine = ($output -split "`n" | Where-Object { $_ -match '^\{' } | Select-Object -Last 1)
    if ($jsonLine) {
      return ($jsonLine | ConvertFrom-Json)
    }
  } catch {
    return [PSCustomObject]@{ Status = 'SESSION_PRESENT_AUTH_UNVERIFIED'; Reason = 'auth_probe_failed' }
  }
  return [PSCustomObject]@{ Status = 'SESSION_PRESENT_AUTH_UNVERIFIED'; Reason = 'auth_probe_no_output' }
}

function Start-M365EdgeSession {
  param(
    [string] $EdgePath,
    [string] $ProfilePath,
    [string] $TargetUrl,
    [string[]] $ExtraArgs
  )
  New-Item -ItemType Directory -Force -Path $ProfilePath | Out-Null
  $argsList = @(
    "--user-data-dir=$ProfilePath",
    '--profile-directory=Default',
    '--no-first-run',
    '--no-default-browser-check'
  ) + $ExtraArgs + @($TargetUrl)
  Start-Process -FilePath $EdgePath -ArgumentList $argsList | Out-Null
}

function Get-M365SessionStatus {
  param(
    [string] $RepoRoot,
    $Config,
    [string] $Account,
    [string] $Url,
    [switch] $VerifyAuth,
    [switch] $NoLaunch,
    [switch] $VerboseMode
  )

  $edgePath = Get-M365EdgePath
  if (-not $edgePath) {
    return [PSCustomObject]@{
      Status  = 'EDGE_NOT_FOUND'
      Account = $Account
      Message = 'Microsoft Edge executable not found in standard locations.'
    }
  }

  try {
    $entry = Get-M365AccountEntry -Config $Config -Alias $Account
  } catch {
    return [PSCustomObject]@{ Status = 'INVALID_ACCOUNT'; Account = $Account; Message = $_.Exception.Message }
  }

  $profilePath = Get-M365ProfilePath -Config $Config -Alias $Account
  $targetUrl = if ($Url) { $Url } else { $entry.DefaultUrl }
  $safeUrl = Format-M365SafeUrl -RawUrl $targetUrl
  $expectedHost = ($entry.ExpectedHosts | Select-Object -First 1)
  $targetHost = Get-M365TargetHost -RawUrl $targetUrl

  if (Test-M365ProfileInUse -ProfilePath $profilePath) {
    return [PSCustomObject]@{
      Status      = 'PROFILE_IN_USE'
      Account     = $Account
      MaskedUpn   = (Format-M365MaskedEmail -Email $entry.Upn)
      ProfilePath = $profilePath
      TargetHost  = $targetHost
      Message     = 'Edge appears to be using this profile already. Reuse the open window or close it before relaunching.'
    }
  }

  $profileExists = Test-Path $profilePath

  if ($VerifyAuth -or -not $NoLaunch) {
    if (-not $profileExists) {
      if ($NoLaunch) {
        return [PSCustomObject]@{
          Status      = 'LOGIN_REQUIRED'
          Account     = $Account
          MaskedUpn   = (Format-M365MaskedEmail -Email $entry.Upn)
          ProfilePath = $profilePath
          TargetHost  = $targetHost
          Message     = 'Profile directory not found. First launch requires Product Owner login or MFA.'
        }
      }
    }
  }

  if (-not $NoLaunch) {
    Start-M365EdgeSession -EdgePath $edgePath -ProfilePath $profilePath -TargetUrl $targetUrl -ExtraArgs @()
    Start-Sleep -Seconds 2
    if ($VerboseMode) {
      Write-Host "Launched Edge with persistent profile for account alias '$Account'."
    }
  }

  if ($VerifyAuth) {
    if (Test-M365ProfileInUse -ProfilePath $profilePath) {
      return [PSCustomObject]@{
        Status      = 'PROFILE_IN_USE'
        Account     = $Account
        MaskedUpn   = (Format-M365MaskedEmail -Email $entry.Upn)
        ProfilePath = $profilePath
        TargetHost  = $targetHost
        SafeUrl     = $safeUrl
        Message     = 'Profile in use by Edge; auth probe skipped. Reuse open window or close Edge before verify.'
      }
    }
    Start-Sleep -Seconds 1
    $probe = Invoke-M365AuthProbe -RepoRoot $RepoRoot -ProfilePath $profilePath -TargetUrl $targetUrl -ExpectedHost $expectedHost
    $status = if ($probe.Status) { $probe.Status } else { 'SESSION_PRESENT_AUTH_UNVERIFIED' }
    $reason = if ($probe.PSObject.Properties.Name -contains 'Reason') { $probe.Reason } elseif ($probe.PSObject.Properties.Name -contains 'reason') { $probe.reason } else { 'Auth probe completed.' }
    return [PSCustomObject]@{
      Status      = $status
      Account     = $Account
      MaskedUpn   = (Format-M365MaskedEmail -Email $entry.Upn)
      ProfilePath = $profilePath
      TargetHost  = $targetHost
      SafeUrl     = $safeUrl
      Message     = $reason
    }
  }

  if (-not $profileExists -and $NoLaunch) {
    return [PSCustomObject]@{
      Status      = 'LOGIN_REQUIRED'
      Account     = $Account
      MaskedUpn   = (Format-M365MaskedEmail -Email $entry.Upn)
      ProfilePath = $profilePath
      TargetHost  = $targetHost
      Message     = 'Profile not initialized. Run bootstrap without -CheckOnly to open login page for Product Owner.'
    }
  }

  if ($profileExists) {
    return [PSCustomObject]@{
      Status      = 'SESSION_PRESENT_AUTH_UNVERIFIED'
      Account     = $Account
      MaskedUpn   = (Format-M365MaskedEmail -Email $entry.Upn)
      ProfilePath = $profilePath
      TargetHost  = $targetHost
      SafeUrl     = $safeUrl
      Message     = 'Persistent profile present. Run with -VerifyAuth or complete PO login in Edge to confirm READY.'
    }
  }

  return [PSCustomObject]@{
    Status      = 'LOGIN_REQUIRED'
    Account     = $Account
    MaskedUpn   = (Format-M365MaskedEmail -Email $entry.Upn)
    ProfilePath = $profilePath
    TargetHost  = $targetHost
    Message     = 'Edge launched for first-time Product Owner authentication. Complete login or MFA in the browser window.'
  }
}

function Write-M365StatusOutput {
  param($Result)
  $Result | Select-Object Status, Account, MaskedUpn, ProfilePath, TargetHost, SafeUrl, Message | Format-List
  Write-Host "STATUS=$($Result.Status)"
}

function Get-M365ExitCode {
  param([string] $Status)
  switch ($Status) {
    'READY' { return 0 }
    'LOGIN_REQUIRED' { return 1 }
    'PROFILE_IN_USE' { return 2 }
    'EDGE_NOT_FOUND' { return 3 }
    'INVALID_ACCOUNT' { return 4 }
    'CONFIGURATION_ERROR' { return 5 }
    'SESSION_PRESENT_AUTH_UNVERIFIED' { return 6 }
    default { return 5 }
  }
}
