#!/bin/bash
# =============================================================================
# gin-zone-client H5 远程部署（方案 B：releases + current，Nginx 指向 current/）
# =============================================================================

set -euo pipefail

: "${DEPLOY_REMOTE_DIR:?}"
: "${DEPLOY_TAR_PATH:?}"

source /tmp/release-lib.sh

BACKUP_KEEP="${DEPLOY_BACKUP_KEEP:-5}"

migrate_legacy_layout_if_needed() {
  if [[ -L "$CURRENT_LINK" || -e "$CURRENT_LINK" ]]; then
    return 0
  fi
  if [[ ! -f "${DEPLOY_REMOTE_DIR}/index.html" ]]; then
    return 0
  fi

  local ts rid name
  ts="$(release_new_id)"
  rid="$(release_dir_for "$ts")"
  mkdir -p "$rid"

  for name in "${DEPLOY_REMOTE_DIR}"/*; do
    [[ "$(basename "$name")" == "releases" ]] && continue
    [[ "$(basename "$name")" == "current" ]] && continue
    mv "$name" "$rid/"
  done

  release_switch "$rid"
  echo "==> migrated legacy layout -> ${rid}"
}

backup_before_deploy() {
  local active items=() name
  active="$(release_get_active 2>/dev/null || true)"

  if [[ -z "$active" || ! -f "${active}/index.html" ]]; then
    echo "==> skip backup (no active release)"
    return 0
  fi

  for name in "${active}"/*; do
    items+=("$(basename "$name")")
  done

  if ((${#items[@]} == 0)); then
    echo "==> skip backup (empty active release)"
    return 0
  fi

  mkdir -p "$BACKUP_DIR"
  local ts backup_file
  ts="$(release_new_id)"
  backup_file="${BACKUP_DIR}/backup-${ts}.tar.gz"
  echo "==> backup: ${backup_file}"
  tar -czf "$backup_file" -C "$active" "${items[@]}"
  release_prune_backups
  echo "==> backup kept: latest ${BACKUP_KEEP}"
}

mkdir -p "$RELEASES_ROOT" "$BACKUP_DIR"

migrate_legacy_layout_if_needed
backup_before_deploy

local_ts="$(release_new_id)"
release_path="$(release_dir_for "$local_ts")"
mkdir -p "$release_path"

echo "==> extract: ${DEPLOY_TAR_PATH} -> ${release_path}"
tar -xzf "${DEPLOY_TAR_PATH}" -C "$release_path"

echo "==> activate release (atomic symlink switch)"
release_switch "$release_path"
release_cleanup

rm -f "${DEPLOY_TAR_PATH}"

echo "==> done"
test -f "${CURRENT_LINK}/index.html" && echo "index.html OK"
