# =============================================================================
# gin-zone-server Windows 本地部署入口
# 用法：make deploy  或  powershell -ExecutionPolicy Bypass -File deploy/pm2/deploy.ps1
#
# 流程：[1] 交叉编译 → [2] 打 tar（含 env.production）→ [3] 上传 → [4] 远程 PM2 reload → [5] 验证
# 生产配置：deploy/pm2/env.production（gitignore，本地打包进 release/config/env.production）
# =============================================================================

param(
  [string]$EnvFileName = 'deploy.local.env'
)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'ssh-lib.ps1')
Initialize-DeployConsoleEncoding

$Root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$EnvFile = Join-Path $PSScriptRoot $EnvFileName
$PackDir = Join-Path $PSScriptRoot '.pack'
$BinaryName = 'zone-server'
$EcosystemFile = 'ecosystem.config.js'

if (-not (Test-Path $EnvFile)) {
  throw "Missing $EnvFile - copy deploy.local.env.example to deploy.local.env"
}

$cfg = @{}
Get-Content $EnvFile | ForEach-Object {
  if ($_ -match '^\s*#' -or $_ -match '^\s*$') { return }
  $parts = $_ -split '=', 2
  if ($parts.Length -eq 2) {
    $cfg[$parts[0].Trim()] = $parts[1].Trim()
  }
}

$DeployHost = $cfg['DEPLOY_HOST']
$DeployUser = $cfg['DEPLOY_USER']
$DeployPort = if ($cfg['DEPLOY_PORT']) { $cfg['DEPLOY_PORT'] } else { '22' }
$DeployPassword = $cfg['DEPLOY_PASSWORD']
$RemoteDir = $cfg['DEPLOY_REMOTE_DIR']
$HostKey = $cfg['DEPLOY_HOSTKEY']
$Pm2App = if ($cfg['DEPLOY_PM2_APP']) { $cfg['DEPLOY_PM2_APP'] } else { 'gin-zone-server' }
$TarName = if ($cfg['DEPLOY_TAR_NAME']) { $cfg['DEPLOY_TAR_NAME'] } else { 'gin-zone-server.tar.gz' }
$DeployEnvFile = $cfg['DEPLOY_ENV_FILE']
Assert-SafeTarName $TarName

if (-not $DeployHost -or -not $DeployUser -or -not $RemoteDir) {
  throw 'deploy.local.env needs DEPLOY_HOST, DEPLOY_USER, DEPLOY_REMOTE_DIR'
}

$EcosystemPath = Join-Path $Root $EcosystemFile
if (-not (Test-Path $EcosystemPath)) {
  throw "Missing ecosystem file: $EcosystemPath"
}

function Find-Executable {
  param([string]$Name)
  $paths = @(
    $Name,
    "$env:ProgramFiles\PuTTY\$Name.exe",
    "${env:ProgramFiles(x86)}\PuTTY\$Name.exe"
  )
  foreach ($p in $paths) {
    if (Test-Path $p) { return $p }
    $cmd = Get-Command $p -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Source }
  }
  return $null
}

$Plink = Find-Executable -Name 'plink'
$Pscp = Find-Executable -Name 'pscp'
$usePlink = $DeployPassword -and $Plink -and $Pscp

$plinkArgs = @('-batch', '-P', $DeployPort)
if ($HostKey) { $plinkArgs += @('-hostkey', $HostKey) }
if ($usePlink) { $plinkArgs += @('-pw', $DeployPassword) }

$pscpArgs = @('-batch', '-P', $DeployPort)
if ($HostKey) { $pscpArgs += @('-hostkey', $HostKey) }
if ($usePlink) { $pscpArgs += @('-pw', $DeployPassword) }

function Invoke-Remote {
  param([string]$Command)
  if ($usePlink) {
    & $Plink @plinkArgs "$DeployUser@$DeployHost" $Command
    if ($LASTEXITCODE -ne 0) { throw 'plink failed' }
  } else {
    ssh -p $DeployPort -o BatchMode=yes -o StrictHostKeyChecking=accept-new "$DeployUser@$DeployHost" $Command
    if ($LASTEXITCODE -ne 0) { throw 'ssh failed' }
  }
}

function Copy-ToRemote {
  param([string]$LocalPath, [string]$RemotePath)
  if (-not (Test-Path -LiteralPath $LocalPath)) {
    throw "Local file not found: $LocalPath"
  }
  if ($usePlink) {
    & $Pscp @pscpArgs -scp "$LocalPath" "${DeployUser}@${DeployHost}:${RemotePath}"
    if ($LASTEXITCODE -ne 0) { throw "pscp failed: $LocalPath" }
  } else {
    scp -P $DeployPort -o BatchMode=yes -o StrictHostKeyChecking=accept-new "$LocalPath" "${DeployUser}@${DeployHost}:${RemotePath}"
    if ($LASTEXITCODE -ne 0) { throw 'scp failed' }
  }
}

function Resolve-DeployEnvPath {
  if (-not $DeployEnvFile) {
    return Join-Path $PSScriptRoot 'env.production'
  }
  if ([System.IO.Path]::IsPathRooted($DeployEnvFile)) {
    return $DeployEnvFile
  }
  $relPath = $DeployEnvFile -replace '/', '\'
  return Join-Path $Root $relPath
}

Write-Host "==> Remote: $RemoteDir | PM2: $Pm2App"

# ---------- [1/5] 交叉编译 Linux amd64 ----------
Write-Host '==> [1/5] Cross-compile linux/amd64'
$env:GOOS = 'linux'
$env:GOARCH = 'amd64'
$env:CGO_ENABLED = '0'
$buildOut = Join-Path $PackDir 'build-bin'
if (Test-Path $buildOut) { Remove-Item -Recurse -Force $buildOut }
New-Item -ItemType Directory -Path $buildOut | Out-Null
Push-Location $Root
go build -ldflags='-s -w' -o (Join-Path $buildOut $BinaryName) .
if ($LASTEXITCODE -ne 0) { throw 'go build failed' }
Pop-Location

# ---------- [2/5] 组装 staging 并打 tar ----------
Write-Host '==> [2/5] Pack tar'
$staging = Join-Path $PackDir 'staging'
if (Test-Path $staging) { Remove-Item -Recurse -Force $staging }
New-Item -ItemType Directory -Path $staging | Out-Null

Copy-Item (Join-Path $buildOut $BinaryName) (Join-Path $staging $BinaryName)
Copy-Item $EcosystemPath (Join-Path $staging $EcosystemFile)

$envPath = Resolve-DeployEnvPath
if (-not (Test-Path $envPath)) {
  throw "Missing $envPath - create deploy/pm2/env.production with real values (see deploy/pm2/env.production.example)"
}
$configDir = Join-Path $staging 'config'
New-Item -ItemType Directory -Path $configDir -Force | Out-Null
Copy-Item $envPath (Join-Path $configDir 'env.production')
Write-Host "==> Pack env: $envPath"

$publicData = Join-Path $Root 'public/data'
if (Test-Path $publicData) {
  $destData = Join-Path $staging 'public/data'
  New-Item -ItemType Directory -Path $destData -Force | Out-Null
  Copy-Item -Recurse (Join-Path $publicData '*') $destData
}

if (-not (Test-Path $PackDir)) { New-Item -ItemType Directory -Path $PackDir | Out-Null }
$tarLocal = Join-Path $PackDir $TarName
if (Test-Path $tarLocal) { Remove-Item -Force $tarLocal }

Push-Location $staging
tar -czf $tarLocal .
Pop-Location

$tarSize = [math]::Round((Get-Item $tarLocal).Length / 1MB, 2)
Write-Host "==> Tar: $tarLocal ($tarSize MB)"

# ---------- [3/5] 上传 ----------
Write-Host '==> [3/5] Upload'
$remoteTar = "/tmp/$TarName"
Invoke-Remote "mkdir -p $RemoteDir"
Copy-ToRemote -LocalPath $tarLocal -RemotePath $remoteTar
Copy-ToRemote -LocalPath (Join-Path $PSScriptRoot 'release-lib.sh') -RemotePath '/tmp/release-lib.sh'
Copy-ToRemote -LocalPath (Join-Path $PSScriptRoot 'remote-deploy.sh') -RemotePath '/tmp/remote-deploy.sh'

# ---------- [4/5] 远程部署 ----------
Write-Host '==> [4/5] Remote: release -> switch -> pm2 reload'
$eRemoteDir = Escape-ShellSingleQuoted $RemoteDir
$ePm2App = Escape-ShellSingleQuoted $Pm2App
$eEcosystemFile = Escape-ShellSingleQuoted $EcosystemFile
$eRemoteTar = Escape-ShellSingleQuoted $remoteTar
$remoteCmd = "chmod +x /tmp/remote-deploy.sh && DEPLOY_REMOTE_DIR='$eRemoteDir' DEPLOY_PM2_APP='$ePm2App' DEPLOY_ECOSYSTEM_FILE='$eEcosystemFile' DEPLOY_TAR_PATH='$eRemoteTar' bash /tmp/remote-deploy.sh"
Invoke-Remote $remoteCmd

# ---------- [5/5] 验证 PM2 ----------
Write-Host '==> [5/5] Verify'
Invoke-Remote "source ~/.nvm/nvm.sh && DEPLOY_REMOTE_DIR='$eRemoteDir' source /tmp/release-lib.sh && release_pm2_verify '$ePm2App'"

Write-Host '==> Deploy finished'
