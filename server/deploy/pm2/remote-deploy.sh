#!/bin/bash
# =============================================================================
# gin-zone-server 远程部署（方案 B：releases + current，PM2 reload）
# =============================================================================

set -euo pipefail

: "${DEPLOY_REMOTE_DIR:?}"
: "${DEPLOY_PM2_APP:?}"
: "${DEPLOY_ECOSYSTEM_FILE:?}"
: "${DEPLOY_TAR_PATH:?}"

source /tmp/release-lib.sh

BACKUP_KEEP="${DEPLOY_BACKUP_KEEP:-5}"
BINARY_NAME="zone-server"

migrate_legacy_layout_if_needed() {
  if [[ -L "$CURRENT_LINK" || -e "$CURRENT_LINK" ]]; then
    return 0
  fi
  if [[ ! -f "${DEPLOY_REMOTE_DIR}/${BINARY_NAME}" && ! -f "${DEPLOY_REMOTE_DIR}/${DEPLOY_ECOSYSTEM_FILE}" ]]; then
    return 0
  fi

  local ts rid item
  ts="$(release_new_id)"
  rid="$(release_dir_for "$ts")"
  mkdir -p "$rid"

  for item in "${BINARY_NAME}" "${DEPLOY_ECOSYSTEM_FILE}" config public node_modules; do
    [[ -e "${DEPLOY_REMOTE_DIR}/${item}" ]] && mv "${DEPLOY_REMOTE_DIR}/${item}" "$rid/"
  done

  release_switch "$rid"
  link_shared_public "$rid"
  echo "==> migrated legacy layout -> ${rid}"
  if release_pm2 describe "${DEPLOY_PM2_APP}" >/dev/null 2>&1; then
    echo "==> pm2 reload after legacy migration"
    release_pm2_reload "${DEPLOY_PM2_APP}" "${DEPLOY_ECOSYSTEM_FILE}"
  fi
}

backup_before_deploy() {
  local active items=()
  active="$(release_get_active 2>/dev/null || true)"

  if [[ -z "$active" || ! -d "$active" ]]; then
    echo "==> skip backup (no active release)"
    return 0
  fi

  [[ -f "${active}/${BINARY_NAME}" ]] && items+=("${BINARY_NAME}")
  [[ -f "${active}/${DEPLOY_ECOSYSTEM_FILE}" ]] && items+=("${DEPLOY_ECOSYSTEM_FILE}")
  [[ -f "${active}/config/env.production" ]] && items+=("config/env.production")

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

link_shared_public() {
  local release_path="$1"
  # 共享 uploads 落在部署根；release 内只挂软链，发版/回滚不丢文件
  mkdir -p "${DEPLOY_REMOTE_DIR}/public/uploads"
  # 若 tar 解出了真实 public/（如 public/data），须先删掉再软链，否则 ln 会链进目录内
  if [[ -e "${release_path}/public" && ! -L "${release_path}/public" ]]; then
    rm -rf "${release_path}/public"
  fi
  ln -sfn "${DEPLOY_REMOTE_DIR}/public" "${release_path}/public"
}

source "$HOME/.nvm/nvm.sh"
nvm use default

mkdir -p "$RELEASES_ROOT" "$BACKUP_DIR" "${DEPLOY_REMOTE_DIR}/logs" "${DEPLOY_REMOTE_DIR}/public/uploads"

migrate_legacy_layout_if_needed
backup_before_deploy

local_ts="$(release_new_id)"
release_path="$(release_dir_for "$local_ts")"
mkdir -p "$release_path"

echo "==> extract: ${DEPLOY_TAR_PATH} -> ${release_path}"
tar -xzf "${DEPLOY_TAR_PATH}" -C "$release_path"

chmod +x "${release_path}/${BINARY_NAME}"

link_shared_public "$release_path"

echo "==> activate release (pm2 reload)"
release_switch "$release_path"
release_prune_legacy_root
release_pm2_reload "${DEPLOY_PM2_APP}" "${DEPLOY_ECOSYSTEM_FILE}"
release_cleanup

rm -f "${DEPLOY_TAR_PATH}"

echo "==> done"
release_pm2_verify "${DEPLOY_PM2_APP}"
