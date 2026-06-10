<div align="center">

#  LuCI App MAX  Telegram Bridge

### Мост сообщений между **MAX** и **Telegram** для OpenWrt

Работает прямо на роутере через **LuCI**, **GREEN-API** и **Telegram Bot API**.  
Не нужен белый IP. Не нужен внешний сервер. Подходит для CG-NAT.

<br>

![OpenWrt](https://img.shields.io/badge/OpenWrt-24.x-00A3E0?style=for-the-badge&logo=openwrt&logoColor=white)
![LuCI](https://img.shields.io/badge/LuCI-Web_Interface-orange?style=for-the-badge)
![Telegram](https://img.shields.io/badge/Telegram-Bot-229ED9?style=for-the-badge&logo=telegram&logoColor=white)
![GREEN API](https://img.shields.io/badge/GREEN--API-MAX-green?style=for-the-badge)
![No Tokens](https://img.shields.io/badge/No_Tokens_In_Repo-safe-brightgreen?style=for-the-badge)

<br>

**MAX  Telegram bridge for OpenWrt with LuCI web interface**

</div>

---

<img width="1920" height="1689" alt="11111111111111111111111111111111122222222222222222" src="https://github.com/user-attachments/assets/dad7c198-5add-4ae9-af55-de60d5a85067" />



##  Описание

**LuCI App MAX  Telegram Bridge** — это модуль для OpenWrt, который позволяет пересылать сообщения между **MAX** и **Telegram** прямо с роутера.

Модуль использует:

- **GREEN-API** для работы с MAX;
- **Telegram Bot API** для работы с Telegram;
- **polling**, поэтому белый IP не требуется;
- **LuCI web-интерфейс** для настройки и управления.

---

##  Возможности

-  MAX → Telegram
-  Telegram → MAX
-  Текстовые сообщения
-  Фото
-  Видео
- ✅ Файлы
- ✅ Работа без белого IP
- ✅ Работа через polling
- ✅ Web-интерфейс LuCI
- ✅ Управление мостом из браузера
- ✅ Проверка статуса GREEN-API
- ✅ Проверка Telegram-бота
- ✅ Цветные live-логи
- ✅ Кнопка копирования логов
- ✅ Backup / Restore через LuCI
- ✅ Полное удаление одной командой
- ✅ Установка без токенов

---

## 📸 Интерфейс LuCI

После установки модуль появится в меню OpenWrt LuCI:

```text
Services → Мост Telegram MAX
```

В интерфейсе можно:

- ввести GREEN Instance ID;
- ввести GREEN API Token;
- ввести Telegram Bot Token;
- ввести Telegram Chat ID;
- включить или выключить мост;
- включить или выключить polling;
- проверить статус GREEN-API;
- проверить Telegram-бота;
- посмотреть последние live-логи;
- скопировать логи;
- сделать backup;
- восстановить backup;
- управлять ботом OpenWrt.

---

## ⚡ Быстрая установка

Выполни на роутере OpenWrt:

```sh
wget -O /tmp/install-max-tg-most.sh "https://raw.githubusercontent.com/kzolotarev95/luci-app-max-tg-most/main/install.sh?v=$(date +%s)" && sh /tmp/install-max-tg-most.sh
```

После установки открой LuCI:

```text
Services → Мост Telegram MAX
```

Затем заполни свои данные:

```text
GREEN Instance ID
GREEN API Token
Telegram Bot Token
Telegram Chat ID
```

После этого включи мост и polling.

---

## 🗑 Удаление

Выполни на роутере:

```sh
wget -O /tmp/uninstall-max-tg-most.sh "https://raw.githubusercontent.com/kzolotarev95/luci-app-max-tg-most/main/uninstall.sh?v=$(date +%s)" && sh /tmp/uninstall-max-tg-most.sh
```

Удаление очищает:

- LuCI-модуль;
- helper-скрипты;
- CGI-файлы;
- ACL;
- конфиг;
- временные файлы;
- polling-процесс.

---

## 🔐 Безопасность

В репозитории **нет токенов и личных данных**.

После установки по умолчанию:

```text
enabled = 0
poll_enabled = 0
telegram_bot_token = empty
telegram_channel_id = empty
max_instance_id = empty
max_api_token = empty
```

Все токены вводятся вручную только на твоём роутере через LuCI.

---

##  Требования

- OpenWrt 24.x
- LuCI
- GREEN-API аккаунт
- Telegram Bot Token
- Telegram Chat ID
- Интернет на роутере

---

##  Как работает

MAX → Telegram:

```text
MAX
 ↓
GREEN-API
 ↓
OpenWrt Router
 ↓
Telegram Bot
 ↓
Telegram
```

Telegram → MAX:

```text
Telegram
 ↓
Telegram Bot API
 ↓
OpenWrt Router
 ↓
GREEN-API
 ↓
MAX
```

---

##  Особенности

Модуль специально сделан для OpenWrt:

- не требует отдельного сервера;
- не требует белого IP;
- работает через polling;
- подходит для CG-NAT;
- управляется из LuCI;
- можно быстро перенести на другой роутер;
- можно полностью удалить одной командой;
- токены не хранятся в GitHub.

---

##  Статус

Проверено на:

```text
OpenWrt 24.10.x
LuCI
```

Работает:

- текст;
- фото;
- видео;
- файлы;
- live-логи;
- управление ботом;
- backup / restore;
- polling без белого IP.

> Голосовые сообщения Telegram → MAX могут требовать отдельной доработки.

**Full Changelog**: https://github.com/kzolotarev95/luci-app-max-tg-most/commits/v1
