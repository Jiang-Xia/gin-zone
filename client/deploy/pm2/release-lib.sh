#!/bin/bash
# =============================================================================
# 方案 B：releases/ 版本目录 + current 软链（H5 静态 remote 脚本共用）
# =============================================================================

: "${DEPLOY_REMOTE_DIR:?}"

RELEASES_ROOT="${DEPLOY_REMOTE_DIR}/releases"
BACKUP_DIR="${RELEASES_ROOT}/backups"
CURRENT_LINK="${DEPLOY_REMOTE_DIR}/current"
RELEASE_ID_PATTERN='^[0-9]{8}-[0-9]{6}$'

release_new_id() {
  date +%Y%m%d-%H%M%S
}

release_dir_for() {
  echo "${RELEASES_ROOT}/$1"
}

release_get_active() {
  if [[ -L "$CURRENT_LINK" ]]; then
    readlink -f "$CURRENT_LINK"
    return 0
  fi
  return 1
}

release_switch() {
  local release_path="$1"
  ln -sfn "$release_path" "$CURRENT_LINK"
  echo "==> switch current -> ${release_path}"
}

release_cleanup() {
  local keep="${DEPLOY_RELEASE_KEEP:-5}"
  local count=0 name
  for name in $(ls -1t "$RELEASES_ROOT" 2>/dev/null); do
    [[ "$name" == "backups" ]] && continue
    [[ "$name" =~ $RELEASE_ID_PATTERN ]] || continue
    count=$((count + 1))
    if (( count > keep )); then
      echo "==> remove old release: ${RELEASES_ROOT}/${name}"
      rm -rf "${RELEASES_ROOT}/${name}"
    fi
  done
}

release_prune_backups() {
  local keep="${DEPLOY_BACKUP_KEEP:-5}"
  ls -1t "$BACKUP_DIR"/backup-*.tar.gz 2>/dev/null | tail -n +$((keep + 1)) | while IFS= read -r f; do
    [[ -n "$f" ]] && rm -f "$f"
  done
}
