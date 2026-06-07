#!/bin/sh
set -eu

/etc/init.d/telegram-max-bridge-poll stop 2>/dev/null || true
/etc/init.d/telegram-max-bridge-poll disable 2>/dev/null || true

ps w | awk '/\/usr\/bin\/telegram-max-bridge-poll/ && !/awk/ {print $1}' | while read P; do
  kill -9 "$P" 2>/dev/null || true
done

rm -f /etc/config/telegram_max_bridge
rm -f /etc/init.d/telegram-max-bridge-poll

rm -rf /usr/lib/telegram-max-bridge
rm -f /usr/bin/telegram-max-bridge-*
rm -f /www/cgi-bin/telegram-max-*

rm -f /www/luci-static/resources/view/telegram-max-bridge.js
rm -f /usr/share/luci/menu.d/luci-app-telegram-max-bridge.json
rm -f /usr/share/rpcd/acl.d/luci-app-telegram-max-bridge.json

rm -f /tmp/telegram-max-bridge-*
rm -rf /tmp/TELEGRAM-MAX-BRIDGE-OPENWRT-NOTOKENS-* 2>/dev/null || true
rm -rf /tmp/luci-indexcache* /tmp/luci-modulecache* /tmp/luci-*.json 2>/dev/null || true

/etc/init.d/rpcd restart 2>/dev/null || true
/etc/init.d/uhttpd restart 2>/dev/null || true

echo "OK: Telegram-MAX Bridge removed"
