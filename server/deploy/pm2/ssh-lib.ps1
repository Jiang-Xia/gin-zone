# 本地 deploy/rollback 共用：控制台 UTF-8 + 防 SSH 远程 shell 注入

function Initialize-DeployConsoleEncoding {
  # 中文 Windows 默认 GBK；plink 远程输出为 UTF-8，不切换则 PM2 表格/中文均乱码
  try { chcp 65001 | Out-Null } catch {}
  $utf8 = [System.Text.Encoding]::UTF8
  [Console]::OutputEncoding = $utf8
  [Console]::InputEncoding = $utf8
  $OutputEncoding = $utf8
}

function Escape-ShellSingleQuoted {
  param([AllowNull()][string]$Value)
  if ($null -eq $Value) { return '' }
  if (-not $Value.Contains([char]39)) { return $Value }
  # bash 单引号字符串内嵌单引号：'\'''
  $sq = [string][char]39
  $bashEscapedSq = $sq + [string][char]92 + $sq + $sq
  return $Value.Replace($sq, $bashEscapedSq)
}

function Assert-BackupFileName {
  param([string]$Name)
  if (-not $Name) { return }
  if ($Name -notmatch '^backup-\d{8}-\d{6}\.tar\.gz$') {
    throw "Invalid backup name (expected backup-YYYYMMDD-HHMMSS.tar.gz): $Name"
  }
}

function Assert-SafeTarName {
  param([string]$Name)
  if ($Name -match '[/\\]' -or $Name -match '\.\.') {
    throw "Invalid DEPLOY_TAR_NAME (must be a plain filename): $Name"
  }
}
