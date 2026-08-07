<#
    sync-scheduled.ps1 — GO-DATA-4 Windows Scheduled Auto Sync wrapper
    =================================================================
    Minimal Task Scheduler wrapper around the existing pipeline:
        npm run data:sync          (OneDrive -> staging -> detect -> extract -> build -> validate)

    Features:
      - Runs from the repo root with the verified Node/npm environment
        (PATH rebuilt from the registry — fresh scheduled processes and
        long-running editor sessions both work).
      - Logs timestamp, exit code, changed/no-change, dataset states, failures
        to logs\data-sync.log (append-only; *.log is gitignored).
      - Prevents overlapping runs with a simple pid lock (logs\.sync.lock);
        stale locks from crashed runs are auto-cleared.
      - OneDrive source is strictly read-only (only sync-workbooks.mjs copies
        into data\staging\source).

    Usage:
      powershell -NoProfile -ExecutionPolicy Bypass -File "G:\ProjectAI\goffice2026\scripts\sync-scheduled.ps1"

    Optional parameters (forwarded to sync-all.mjs / sync-workbooks.mjs):
      -Source <dir>    override OneDrive source (e.g. offline rehearsal)
      -Out <dir>       override staging out dir
      -Manifest <path> override manifest path
      -Force           force full flow even without detected changes
      -LogPath <path>  override log file

    Exit codes: 0 = OK (synced or no-change or skipped-overlap)
                1 = pipeline failure (data NOT publishable)
                2 = npm/node environment failure
#>
param(
  [string]$Source,
  [string]$Out,
  [string]$Manifest,
  [switch]$Force,
  [string]$LogPath = ""
)

$ErrorActionPreference = 'Continue'
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
if (-not $LogPath) { $LogPath = Join-Path $repoRoot 'logs\data-sync.log' }
$lockPath = Join-Path (Split-Path $LogPath) '.sync.lock'
$logDir = Split-Path $LogPath

# ── 1. Verified Node/npm environment (registry PATH) ─────────────────────
$env:Path = [Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' + [Environment]::GetEnvironmentVariable('Path', 'User')

function Write-Log($msg) {
  $line = "[{0}] {1}" -f (Get-Date -Format 'yyyy-MM-ddTHH:mm:sszzz'), $msg
  Add-Content -Path $LogPath -Value $line -Encoding utf8
  Write-Host $line
}

function Invoke-Sync {
  # ── 2. Overlap lock ───────────────────────────────────────────────────
  if (Test-Path $lockPath) {
    $alive = $null
    try {
      $lock = Get-Content $lockPath -Raw | ConvertFrom-Json
      $alive = Get-Process -Id ([int]$lock.pid) -ErrorAction SilentlyContinue
    } catch { $alive = $null }
    if ($alive) {
      Write-Log "SKIP overlapping run detected (pid $($lock.pid)); exiting 0."
      return 0
    }
    Remove-Item $lockPath -Force -ErrorAction SilentlyContinue
    Write-Log "INFO removed stale lock (pid $($lock.pid))."
  }
  $lockJson = @{ pid = $PID; started = (Get-Date -Format 'yyyy-MM-ddTHH:mm:sszzz') } | ConvertTo-Json
  Set-Content -Path $lockPath -Value $lockJson -Encoding utf8
  Write-Log "START sync (pid=$PID force=$($Force.IsPresent))"

  try {
    # ── 3. Run existing pipeline: npm run data:sync (args forwarded) ─────
    $npmArgs = @('run', 'data:sync')
    if ($Source -or $Out -or $Manifest -or $Force) {
      $npmArgs += '--'
      if ($Source)  { $npmArgs += "--source=$Source" }
      if ($Out)     { $npmArgs += "--out=$Out" }
      if ($Manifest){ $npmArgs += "--manifest=$Manifest" }
      if ($Force)   { $npmArgs += '--force' }
    }

    Set-Location $repoRoot
    if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
      Write-Log "FAIL npm not found on PATH (registry PATH rebuilt). Exit code 2."
      return 2
    }

    # Capture full output; write it to the log in UTF-8 (single encoding — PS 5.1
    # Tee-Object appends UTF-16, which would corrupt the UTF-8 log).
    $syncOut = (& npm @npmArgs 2>&1 | Out-String)
    Add-Content -Path $LogPath -Value $syncOut -Encoding utf8
    Write-Host $syncOut
    $exitCode = $LASTEXITCODE
    $syncText = $syncOut

    # ── 4. Log result: exit code, changed/no-change, dataset states ──────
    $noChange = $syncText -match 'No meaningful change detected'
    $change = if ($noChange) { 'NO' } else { 'YES' }
    if ($exitCode -eq 0 -and -not $noChange) { $change = 'YES(synced)' }

    $states = 'n/a'
    $mf = if ($Manifest) { $Manifest } else { Join-Path $repoRoot 'data\staging\manifest.json' }
    if (Test-Path $mf) {
      try {
        $m = Get-Content $mf -Raw | ConvertFrom-Json
        $states = (($m.files | ForEach-Object { "$($_.metric)[$($_.yearBE)]:$($_.datasetState)" }) -join ',')
      } catch { $states = 'unreadable' }
    }

    if ($exitCode -eq 0) {
      Write-Log "RESULT exit=0 change=$change states=$states"
    } else {
      Write-Log "RESULT exit=$exitCode change=$change states=$states FAILED"
    }
    return $exitCode
  }
  finally {
    Remove-Item $lockPath -Force -ErrorAction SilentlyContinue
    Write-Log "END sync (pid=$PID)"
  }
}

# ── Entry ──────────────────────────────────────────────────────────────────
if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir -Force | Out-Null }
$code = Invoke-Sync
exit $code
