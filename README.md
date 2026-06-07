# Telegram-MAX Bridge for OpenWrt

LuCI модуль моста Telegram ↔ MAX через GREEN-API.

## Установка

```sh
wget -O /tmp/install-max-tg-most.sh "https://raw.githubusercontent.com/kzolotarev95/luci-app-max-tg-most/main/install.sh?v=$(date +%s)" && sh /tmp/install-max-tg-most.sh
```

После установки токены пустые, polling выключен. Открой LuCI и введи свои токены.

## Удаление

```sh
wget -O /tmp/uninstall-max-tg-most.sh "https://raw.githubusercontent.com/kzolotarev95/luci-app-max-tg-most/main/uninstall.sh?v=$(date +%s)" && sh /tmp/uninstall-max-tg-most.sh
```
