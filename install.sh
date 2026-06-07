#!/bin/sh
set -eu

REPO_OWNER="${REPO_OWNER:-kzolotarev95}"
REPO_NAME="${REPO_NAME:-luci-app-max-tg-most}"
REPO_REF="${REPO_REF:-main}"

TMP="/tmp/${REPO_NAME}-install-$$"
ARCHIVE="$TMP/repo.tar.gz"

rm -rf "$TMP"
mkdir -p "$TMP"

fetch_url() {
  URL="$1"
  OUT="$2"

  if command -v wget >/dev/null 2>&1; then
    wget -O "$OUT" "$URL"
  elif command -v uclient-fetch >/dev/null 2>&1; then
    uclient-fetch -O "$OUT" "$URL"
  elif command -v curl >/dev/null 2>&1; then
    curl -L -o "$OUT" "$URL"
  else
    echo "ERR: wget/uclient-fetch/curl not found"
    exit 1
  fi
}

echo "== download Telegram-MAX Bridge =="
fetch_url "https://github.com/${REPO_OWNER}/${REPO_NAME}/archive/refs/heads/${REPO_REF}.tar.gz" "$ARCHIVE" || \
fetch_url "https://codeload.github.com/${REPO_OWNER}/${REPO_NAME}/tar.gz/${REPO_REF}" "$ARCHIVE"

tar -xzf "$ARCHIVE" -C "$TMP"

ROOT="$(find "$TMP" -maxdepth 2 -type d -name rootfs | head -1)"
[ -d "$ROOT" ] || {
  echo "ERR: rootfs not found in archive"
  exit 1
}

echo "== install files =="
tar -cf - -C "$ROOT" . | tar -xf - -C /

chmod +x /etc/init.d/telegram-max-bridge-poll 2>/dev/null || true
chmod +x /usr/bin/telegram-max-bridge-* 2>/dev/null || true
chmod +x /www/cgi-bin/telegram-max-* 2>/dev/null || true

uci set telegram_max_bridge.main.enabled='0' 2>/dev/null || true
uci set telegram_max_bridge.main.poll_enabled='0' 2>/dev/null || true
uci set telegram_max_bridge.main.max_instance_id='' 2>/dev/null || true
uci set telegram_max_bridge.main.max_api_token='' 2>/dev/null || true
uci set telegram_max_bridge.main.telegram_bot_token='' 2>/dev/null || true
uci set telegram_max_bridge.main.telegram_channel_id='' 2>/dev/null || true
uci set telegram_max_bridge.main.telegram_chat_id='' 2>/dev/null || true
uci commit telegram_max_bridge 2>/dev/null || true

/etc/init.d/telegram-max-bridge-poll disable 2>/dev/null || true
/etc/init.d/telegram-max-bridge-poll stop 2>/dev/null || true

rm -f /tmp/telegram-max-bridge-* 2>/dev/null || true
rm -rf /tmp/luci-indexcache* /tmp/luci-modulecache* /tmp/luci-*.json 2>/dev/null || true

/etc/init.d/rpcd restart 2>/dev/null || true
/etc/init.d/uhttpd restart 2>/dev/null || true

echo
echo "OK: Telegram-MAX Bridge installed WITHOUT TOKENS"
echo "Open LuCI: Services -> Мост Telegram MAX"
echo "Enter GREEN Instance ID, GREEN API token, Telegram bot token, chat ID, then enable polling."
