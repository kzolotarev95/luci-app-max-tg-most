'use strict';
'require view';
'require form';
'require fs';
'require ui';

/* TELEGRAM_MAX_BRIDGE_COLLAPSE_CARDS_V1 */

return view.extend({
load: function() {
return Promise.all([
fs.exec('/usr/bin/telegram-max-bridge-control', ['status']).catch(function(e) { return { stdout: '', stderr: String(e) }; }),
fs.exec('/usr/bin/telegram-max-bridge-control', ['urls']).catch(function(e) { return { stdout: '', stderr: String(e) }; }),
fs.exec('/usr/bin/telegram-max-bridge-control', ['logs', '80']).catch(function(e) { return { stdout: '', stderr: String(e) }; }),
fs.exec('/usr/bin/telegram-max-bridge-poll-ui', ['status']).catch(function(e) { return { stdout: '', stderr: String(e) }; })
]);
},

handleAction: function(action) {
return fs.exec('/usr/bin/telegram-max-bridge-control', [action]).then(function(res) {
ui.addNotification(null, E('pre', { 'style': 'white-space:pre-wrap' }, res.stdout || _('Готово')), 'info');
window.setTimeout(function() { window.location.reload(); }, 1000);
}).catch(function(e) {
ui.addNotification(null, E('p', {}, _('Команда не выполнена: ') + (e.message || e)), 'danger');
});
},

handlePoll: function(action) {
return fs.exec('/usr/bin/telegram-max-bridge-poll-ui', [action]).then(function(res) {
ui.addNotification(null, E('pre', { 'style': 'white-space:pre-wrap' }, res.stdout || _('Готово')), 'info');
window.setTimeout(function() { window.location.reload(); }, 1000);
}).catch(function(e) {
ui.addNotification(null, E('p', {}, _('Polling-команда не выполнена: ') + (e.message || e)), 'danger');
});
},

render: function(data) {
var status = (data[0].stdout || data[0].stderr || '').trim();
var urls = (data[1].stdout || data[1].stderr || '').trim();
var logs = (data[2].stdout || data[2].stderr || '').trim();
var pollStatus = (data[3].stdout || data[3].stderr || '').trim();

var m = new form.Map('telegram_max_bridge', _('Мост Telegram MAX'));

function card(title, desc, bodyNodes, open) {
var body = E('div', {
'style': open ? 'display:block;margin-top:12px' : 'display:none;margin-top:12px'
}, bodyNodes);

var btn = E('button', {
'class': 'btn cbi-button cbi-button-action',
'style': 'font-weight:700;border-radius:10px;min-width:110px;padding:9px 16px',
'click': function(ev) {
ev.preventDefault();
var show = body.style.display === 'none';
body.style.display = show ? 'block' : 'none';
ev.target.textContent = show ? _('Закрыть') : _('Открыть');
}
}, open ? _('Закрыть') : _('Открыть'));

return E('div', {
'class': 'cbi-section',
'style': 'margin-top:0;margin-bottom:16px;border:1px solid rgba(127,127,127,.25);border-radius:14px;padding:14px;background:rgba(127,127,127,.05)'
}, [
E('div', { 'style': 'display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap' }, [
E('div', {}, [
E('h3', { 'style': 'margin:0 0 4px 0' }, title),
desc ? E('div', { 'class': 'cbi-value-description' }, desc) : ''
]),
btn
]),
body
]);
}

var manualBox = E('div', {
'class': 'cbi-section',
'style': 'display:none;margin-top:12px'
}, [
E('h3', {}, _('📘 Мануал: что где взять')),
E('div', { 'style': 'line-height:1.55' }, [
E('h4', {}, _('1. Telegram Bot Token')),
E('p', {}, [
_('Открой '),
E('a', { 'href': 'https://t.me/BotFather', 'target': '_blank', 'rel': 'noreferrer noopener' }, '@BotFather'),
_(' → /newbot → создай бота → скопируй токен.')
]),
E('p', {}, [ _('Вставить в поле: '), E('b', {}, _('Токен Telegram-бота')) ]),

E('h4', {}, _('2. Telegram chat ID')),
E('p', {}, _('Открой своего бота, нажми Start, напиши ему любое сообщение. Потом открой:')),
E('pre', { 'style': 'white-space:pre-wrap' }, 'https://api.telegram.org/botТОКЕН/getUpdates'),
E('p', {}, [
_('Найди '),
E('code', {}, '"chat":{"id":TELEGRAM_CHAT_ID}'),
_(' и вставь число в поле: '),
E('b', {}, _('Telegram-чат, группа или канал'))
]),

E('h4', {}, _('3. GREEN-API Instance ID и API Token')),
E('p', {}, [
_('Открой кабинет GREEN-API: '),
E('a', { 'href': 'https://console.green-api.com/', 'target': '_blank', 'rel': 'noreferrer noopener' }, 'console.green-api.com')
]),
E('p', {}, _('Создай/открой MAX-инстанс, скопируй idInstance и apiTokenInstance.')),

])
]);

var manualBtn = E('button', {
'class': 'btn cbi-button cbi-button-action',
'style': 'font-weight:700;border-radius:10px;min-width:110px;padding:9px 16px',
'click': function(ev) {
ev.preventDefault();
var show = manualBox.style.display === 'none';
manualBox.style.display = show ? 'block' : 'none';
ev.target.textContent = show ? _('📕 Скрыть мануал') : _('Открыть');
}
}, _('Открыть'));

var topManualCard = E('div', {
'class': 'cbi-section',
'style': 'margin-top:0;margin-bottom:16px;border:1px solid rgba(127,127,127,.25);border-radius:14px;padding:14px;background:rgba(127,127,127,.05)'
}, [
E('div', { 'style': 'display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap' }, [
E('div', {}, [
E('h3', { 'style': 'margin:0 0 4px 0' }, _('📘 Мануал по настройке')),
E('div', { 'class': 'cbi-value-description' }, _(''))
]),
manualBtn
]),
manualBox
]);

var backupRestoreInput = E('input', {
'type': 'file',
'accept': '.tar.gz,application/gzip,application/x-gzip',
'style': 'display:none',
'change': function(ev) {
var file = ev.target.files && ev.target.files[0];
if (!file) return;
if (!window.confirm('Применить backup: ' + file.name + ' ? LuCI перезапустится.')) return;
return fetch('/cgi-bin/telegram-max-backup-upload?t=' + Date.now(), { method: 'POST', body: file }).then(function(r) {
return r.text().then(function(t) { if (!r.ok) throw new Error(t); return t; });
}).then(function(t) {
ui.addNotification(null, E('pre', { 'style': 'white-space:pre-wrap;overflow-wrap:anywhere;word-break:break-word;max-width:100%;overflow:auto' }, t.trim()), 'info');
window.setTimeout(function() { window.location.reload(); }, 3500);
}).catch(function(e) { ui.addNotification(null, E('pre', { 'style': 'white-space:pre-wrap;overflow-wrap:anywhere;word-break:break-word;max-width:100%;overflow:auto' }, 'Ошибка import: ' + (e.message || e)), 'danger'); });
}
});

var backupCard = card(
_('Бэкапы / Восстановление'),
_('Создать, скачать или импортировать полный backup Telegram-MAX Bridge.'),
[
E('div', { 'style': 'display:flex;gap:8px;flex-wrap:wrap' }, [
E('button', {
'class': 'btn cbi-button cbi-button-positive',
'style': 'font-weight:700;border-radius:10px;min-width:170px;padding:9px 16px',
'click': function() {
return fs.exec('/usr/bin/telegram-max-bridge-backup', ['create']).then(function(res) {
ui.addNotification(null, E('pre', { 'style': 'white-space:pre-wrap;overflow-wrap:anywhere;word-break:break-word;max-width:100%;overflow:auto' }, (res.stdout || res.stderr || 'Backup создан').trim()), 'info');
window.setTimeout(function() { window.location.href = '/cgi-bin/telegram-max-backup-download?t=' + Date.now(); }, 700);
}).catch(function(e) { ui.addNotification(null, E('p', {}, 'Ошибка backup/download: ' + (e.message || e)), 'danger'); });
}
}, _('Создать и скачать')),
backupRestoreInput,
E('button', {
'class': 'btn cbi-button cbi-button-action',
'style': 'font-weight:700;border-radius:10px;min-width:170px;padding:9px 16px',
'click': function() { backupRestoreInput.click(); }
}, _('Импорт backup и применить'))
])
], false
);
// TMB_WEB_BACKUP_IMPORT_V1

var testTelegramCard = card(
_('Проверка Telegram-бота'),
_('Отправляет тестовое сообщение в Telegram-чат из текущих настроек.'),
[
E('button', {
'class': 'btn cbi-button cbi-button-action',
'style': 'font-weight:700;border-radius:10px;min-width:110px;padding:9px 16px',
'click': function() {
var txt = 'WEB_TEST_TELEGRAM_BOT_' + Math.floor(Date.now() / 1000);
return fs.exec('/usr/bin/telegram-max-bridge-control', ['test-telegram', txt]).then(function(res) {
ui.addNotification(null, E('pre', { 'style': 'white-space:pre-wrap;overflow-wrap:anywhere;word-break:break-word;max-width:100%;overflow:auto' }, (res.stdout || res.stderr || 'Команда выполнена').trim()), 'info');
}).catch(function(e) {
ui.addNotification(null, E('p', {}, 'Ошибка проверки Telegram-бота: ' + (e.message || e)), 'danger');
});
}
}, _('Проверить бота'))
],
false
);
// TMB_WEB_TEST_BOT_V1

var pollBox = card(
_('🔁 Polling MAX → Telegram без белого IP'),
_('Роутер сам забирает новые сообщения из GREEN-API. Внешний IP и проброс портов не нужны.'),
[
E('pre', { 'style': 'white-space:pre-wrap;max-height:260px;overflow:auto' }, pollStatus || _('Polling-статус пока пустой')),
E('div', { 'style': 'display:flex;gap:8px;flex-wrap:wrap;margin-top:10px' }, [
E('button', {
'class': 'btn cbi-button cbi-button-apply',
'click': ui.createHandlerFn(this, 'handlePoll', 'enable')
}, _('Включить polling')),
E('button', {
'class': 'btn cbi-button cbi-button-remove',
'click': ui.createHandlerFn(this, 'handlePoll', 'disable')
}, _('Выключить polling')),
E('button', {
'class': 'btn cbi-button cbi-button-reload',
'click': ui.createHandlerFn(this, 'handlePoll', 'restart')
}, _('Перезапустить polling'))
])
],
false
);

var statusBox = card(
_('Состояние'),
_('Статус моста и реальные кнопки управления. Рабочий режим: polling без белого IP.'),
[
E('pre', { 'style': 'white-space:pre-wrap;max-height:260px;overflow:auto' }, status || _('Статус пока пустой')),
E('div', { 'style': 'display:flex;gap:8px;flex-wrap:wrap;margin-top:10px' }, [
E('button', {
'class': 'btn cbi-button cbi-button-apply',
'click': ui.createHandlerFn(this, 'handleAction', 'enable')
}, _('Включить')),
E('button', {
'class': 'btn cbi-button cbi-button-remove',
'click': ui.createHandlerFn(this, 'handleAction', 'disable')
}, _('Выключить')),
E('button', {
'class': 'btn cbi-button cbi-button-reload',
'click': ui.createHandlerFn(this, 'handleAction', 'restart-uhttpd')
}, _('Перезапустить веб-интерфейс')),
E('button', {
'class': 'btn cbi-button cbi-button-action',
'click': ui.createHandlerFn(this, 'handleAction', 'set-telegram-webhook')
}, _('Установить Telegram webhook')),
E('button', {
'class': 'btn cbi-button cbi-button-neutral',
'click': ui.createHandlerFn(this, 'handleAction', 'delete-telegram-webhook')
}, _('Удалить Telegram webhook'))
]),
E('div', { 'style': 'display:none' }, ''),
E('div', { 'style': 'display:none' }, ''),
],
false
);

var quotaMiniStatusText = E('div', {
'style': 'font-size:14px;font-weight:700;margin-top:6px;white-space:pre-wrap;overflow-wrap:anywhere'
}, _('Проверка лимита...'));

var quotaMiniStatusBlock = E('div', {
'style': 'margin:8px 0 12px 0;padding:10px 12px;border-radius:12px;border:1px solid rgba(127,127,127,.35);background:rgba(127,127,127,.07)'
}, [
E('div', { 'style': 'font-size:16px;font-weight:800;margin-bottom:4px' }, _('Лимит SMS GREEN-API / console.green-api.com')),
quotaMiniStatusText
]);

function updateQuotaMiniStatusV2() {
return fs.exec('/usr/bin/telegram-max-bridge-quota-status', ['status']).then(function(res) {
var txt = (res.stdout || res.stderr || '').trim();
var limit = /STATUS=LIMIT/.test(txt);
var warn = /STATUS=WARN/.test(txt);
var inst = (txt.match(/INSTANCE=([^\n]+)/) || [,'?'])[1];
var api = (txt.match(/API_STATUS=([^\n]+)/) || [,'OK'])[1];
var apiUsed = (txt.match(/API_USED=([^\n]+)/) || [,'?'])[1];
var apiTotal = (txt.match(/API_TOTAL=([^\n]+)/) || [,'?'])[1];
var chat = (txt.match(/CHAT_STATUS=([^\n]+)/) || [,'OK'])[1];
var chatUsed = (txt.match(/CHAT_USED=([^\n]+)/) || txt.match(/LOCAL_CHAT_USED=([^\n]+)/) || [,'0'])[1];
var chatTotal = (txt.match(/CHAT_TOTAL=([^\n]+)/) || txt.match(/LOCAL_CHAT_TOTAL=([^\n]+)/) || [,'3'])[1];
var desc = (txt.match(/DESC=([^\n]+)/) || [,''])[1];
var time = (txt.match(/TIME=([^\n]+)/) || [,'?'])[1];

if (limit) {
quotaMiniStatusText.textContent =
'ЛИМИТ ЕСТЬ | Instance: ' + inst +
'\nЧаты GREEN: ' + chat + ' ' + chatUsed + '/' + chatTotal +
'\nAPI GREEN: ' + api + ' ' + apiUsed + '/' + apiTotal +
'\nПричина: ' + desc +
'\nВремя: ' + time;
quotaMiniStatusBlock.style.background = 'rgba(248,81,73,.16)';
quotaMiniStatusBlock.style.border = '1px solid rgba(248,81,73,.45)';
} else if (warn) {
quotaMiniStatusText.textContent =
'Лимит не подтверждён GREEN | Instance: ' + inst +
'\nЧаты локально: ' + chatUsed + '/' + chatTotal +
'\nAPI GREEN: ' + apiUsed + '/' + apiTotal + ' — точные цифры будут при 466/QUOTE_EXCEEDED' +
'\nВремя: ' + time;
quotaMiniStatusBlock.style.background = 'rgba(187,128,9,.18)';
quotaMiniStatusBlock.style.border = '1px solid rgba(187,128,9,.55)';
} else {
quotaMiniStatusText.textContent =
'Лимит не обнаружен | Instance: ' + inst +
'\nЧаты локально: ' + chatUsed + '/' + chatTotal +
'\nAPI GREEN: ' + apiUsed + '/' + apiTotal + ' — точные цифры будут при 466/QUOTE_EXCEEDED' +
'\nВремя: ' + time;
quotaMiniStatusBlock.style.background = 'rgba(46,160,67,.16)';
quotaMiniStatusBlock.style.border = '1px solid rgba(46,160,67,.45)';
}
}).catch(function(e) {
quotaMiniStatusText.textContent = 'Ошибка проверки лимита GREEN-API';
quotaMiniStatusBlock.style.background = 'rgba(248,81,73,.16)';
quotaMiniStatusBlock.style.border = '1px solid rgba(248,81,73,.45)';
});
}
// TMB_GREEN_QUOTA_STATUS_BLOCK_V2
window.setInterval(updateQuotaMiniStatusV2, 5000);
window.setTimeout(updateQuotaMiniStatusV2, 300);


var pollStatusPre = E('pre', {
'style': 'white-space:pre-wrap;overflow-wrap:anywhere;word-break:break-word;max-width:100%;overflow:auto;padding:10px;border-radius:10px'
}, _('Загрузка статуса...'));

function updatePollStatusV1() {
return fs.exec('/usr/bin/telegram-max-bridge-poll-web', ['status']).then(function(res) {
var txt = (res.stdout || res.stderr || '').trim();
pollStatusPre.textContent = txt || 'Нет ответа';
if (/status=ONLINE/.test(txt)) {
pollStatusPre.style.background = 'rgba(46,160,67,.16)';
pollStatusPre.style.border = '1px solid rgba(46,160,67,.45)';
} else {
pollStatusPre.style.background = 'rgba(248,81,73,.16)';
pollStatusPre.style.border = '1px solid rgba(248,81,73,.45)';
}
}).catch(function(e) {
pollStatusPre.textContent = 'status=OFFLINE\nerror=' + (e.message || e);
pollStatusPre.style.background = 'rgba(248,81,73,.16)';
pollStatusPre.style.border = '1px solid rgba(248,81,73,.45)';
});
}

var pollStatusCard = card(
_('Статус polling OpenWrt'),
_('Онлайн-статус моста и быстрый перезапуск polling. Обновляется автоматически.'),
[
E('div', { 'style': 'display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px' }, [
E('button', {
'class': 'btn cbi-button cbi-button-action',
'style': 'font-weight:700;border-radius:10px;min-width:170px;padding:9px 16px',
'click': function() {
pollStatusPre.textContent = 'Перезапуск polling...';
return fs.exec('/usr/bin/telegram-max-bridge-poll-web', ['restart']).then(function(res) {
pollStatusPre.textContent = (res.stdout || res.stderr || 'Готово').trim();
window.setTimeout(updatePollStatusV1, 1500);
}).catch(function(e) {
ui.addNotification(null, E('p', {}, 'Ошибка restart polling: ' + (e.message || e)), 'danger');
updatePollStatusV1();
});
}
}, _('Перезапустить polling'))
]),
pollStatusPre
],
false
);
// TMB_WEB_POLL_STATUS_V1
window.setInterval(updatePollStatusV1, 5000);
window.setTimeout(updatePollStatusV1, 300);


var greenMiniStatusText = E('div', { 'style': 'font-size:15px;font-weight:700;margin-top:6px;white-space:pre-wrap;overflow-wrap:anywhere' }, 'GREEN-API: проверка...');

var greenMiniStatusBlock = E('div', { 'style': 'margin:8px 0 12px 0;padding:10px 12px;border-radius:12px;border:1px solid rgba(127,127,127,.35);background:rgba(127,127,127,.07)' }, [
E('div', { 'style': 'font-size:16px;font-weight:800;margin-bottom:4px' }, 'Статус смс MAX - Telegram / console.green-api.com'),
greenMiniStatusText
]);

function updateGreenMiniStatusBlockV4() {
return fs.exec('/usr/bin/telegram-max-bridge-green-status', []).then(function(res) {
var txt = (res.stdout || res.stderr || '' ).trim();
var online = /STATUS=ONLINE/.test(txt);
var inst = (txt.match(/INSTANCE=([^\n]+)/) || [,'?'])[1];
var phone = (txt.match(/PHONE=([^\n]+)/) || [,'?'])[1];
var green = (txt.match(/GREEN=([^\n]+)/) || [,'?'])[1];
var hook = (txt.match(/WEBHOOK_IN=([^\n]+)/) || [,'?'])[1];
var poll = (txt.match(/POLLING=([^\n]+)/) || [,'?'])[1];
greenMiniStatusText.textContent = (online ? 'ONLINE' : 'OFFLINE') + ' | Instance: ' + inst + ' | Телефон: ' + phone + ' | GREEN: ' + green + ' | webhook: ' + hook + ' | polling: ' + poll;
greenMiniStatusBlock.style.background = online ? 'rgba(46,160,67,.16)' : 'rgba(248,81,73,.16)';
greenMiniStatusBlock.style.border = online ? '1px solid rgba(46,160,67,.45)' : '1px solid rgba(248,81,73,.45)';
}).catch(function(e) {
greenMiniStatusText.textContent = 'OFFLINE | ошибка проверки GREEN-API';
greenMiniStatusBlock.style.background = 'rgba(248,81,73,.16)';
greenMiniStatusBlock.style.border = '1px solid rgba(248,81,73,.45)';
});
}
// TMB_GREEN_MINI_STATUS_BLOCK_V4
window.setInterval(updateGreenMiniStatusBlockV4, 5000);
window.setTimeout(updateGreenMiniStatusBlockV4, 300);


var logsBox = card(
_('Последние логи'),
_('Живые логи обновляются каждые 2 секунды. Время в логах: UTC.'),
[
E('pre', { 'style': 'white-space:pre-wrap;max-height:360px;overflow:auto' }, logs || _('Логов пока нет'))
],
false
);

var s = m.section(form.NamedSection, 'main', 'bridge', _('Настройки моста'));
s.anonymous = true;

var o;

o = s.option(form.Flag, 'enabled', _('Включить мост'));
o.description = _('Если включено, webhook/polling будет принимать и пересылать сообщения.');
o.default = '0';
o.rmempty = false;

o = s.option(form.ListValue, 'direction', _('Направление пересылки'));
o.value('max_to_telegram', _('MAX → Telegram'));
o.value('telegram_to_max', _('Telegram → MAX'));
o.default = 'max_to_telegram';
o.rmempty = false;

o = s.option(form.Flag, 'poll_enabled', _('Polling без белого IP'));
o.description = _('Включить автоматический забор сообщений из GREEN-API без внешнего webhook.');
o.default = '1';
o.rmempty = false;
o.depends('direction', 'max_to_telegram');

o = s.option(form.Value, 'poll_interval', _('Интервал polling, сек.'));
o.placeholder = '3';
o.datatype = 'uinteger';
o.depends('direction', 'max_to_telegram');

o = s.option(form.Value, 'max_instance_id', _('GREEN-API Instance ID'));
o.description = _('ID инстанса GREEN-API для работы с MAX.');
o.password = true;

o = s.option(form.Value, 'max_api_token', _('GREEN-API API Token'));
o.description = _('API Token из личного кабинета GREEN-API.');
o.password = true;

o = s.option(form.Value, 'telegram_bot_token', _('Токен Telegram-бота'));
o.description = _('Токен Telegram-бота от BotFather.');
o.password = true;

o = s.option(form.Value, 'telegram_channel_id', _('Telegram-чат, группа или канал'));
o.placeholder = '@channel_name или TELEGRAM_CHAT_ID или -1001234567890';
o.description = _('Куда пересылать сообщения из MAX.');
o.depends('direction', 'max_to_telegram');

o = s.option(form.Value, 'max_chat_id', _('Фильтр чата MAX'));
o.placeholder = _('Пусто = принимать все чаты MAX');
o.description = _('Если указать chatId MAX, модуль будет принимать сообщения только из этого чата.');
o.depends('direction', 'max_to_telegram');

o = s.option(form.Value, 'webhook_secret', _('Секрет GREEN-API webhook'));
o.password = true;
o.placeholder = _('Необязательно');
o.description = _('Для webhook-режима. В polling-режиме не нужен.');
o.depends('direction', 'max_to_telegram');

o = s.option(form.Value, 'max_target_chat_id', _('MAX chat ID'));
o.placeholder = '-69020002426896';
o.description = _('Куда пересылать сообщения из Telegram.');
o.depends('direction', 'telegram_to_max');

o = s.option(form.Value, 'telegram_chat_id', _('Фильтр чата Telegram'));
o.placeholder = _('Пусто = принимать все Telegram-чаты');
o.description = _('Если указать Telegram chat_id, модуль будет принимать сообщения только из этого чата.');
o.depends('direction', 'telegram_to_max');

o = s.option(form.Value, 'telegram_webhook_url', _('Webhook URL для Telegram'));
o.placeholder = 'https://your-domain.com/cgi-bin/telegram-max-telegram';
o.description = _('Внешний HTTPS-адрес роутера для приёма webhook от Telegram.');
o.depends('direction', 'telegram_to_max');

o = s.option(form.Value, 'telegram_webhook_secret', _('Секрет Telegram webhook'));
o.password = true;
o.placeholder = _('Необязательно');
o.description = _('Секретный токен Telegram webhook.');
o.depends('direction', 'telegram_to_max');

o = s.option(form.Flag, 'prefix_sender', _('Добавлять имя отправителя'));
o.description = _('Если включено, к пересланному сообщению добавляется имя отправителя.');
o.default = '1';
o.rmempty = false;

return m.render().then(function(mapNode) {
			// TELEGRAM_MAX_BRIDGE_WEB_LIVE_LOGS_V1
			var settingsCard = E('div', { 'class': 'cbi-section', 'style': 'padding:18px;margin-top:14px;margin-bottom:14px;border-radius:14px;border:1px solid rgba(127,127,127,.35);background:rgba(127,127,127,.07);box-shadow:0 2px 10px rgba(0,0,0,.10)' }, [
				E('h3', { 'style': 'margin-top:0' }, _('Настройки моста')),
				E('p', { 'style': 'opacity:.75;margin-bottom:14px' }, _('Основные параметры Telegram-MAX Bridge: токены, chat ID, polling и фильтры.')),
				mapNode
			]);
			// TMB_SETTINGS_CARD_NO_COLLAPSE_V2




// TMB_LOGS_INPLACE_VIEWER_V7_BEGIN
function tmbLogsEscV7(s) {
return String(s || '').replace(/[&<>"']/g, function(c) {
return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c];
});
}

function tmbLogsLevelV7(line) {
if (/(user\.err|daemon\.err|kern\.err|ERROR color test red|ReferenceError|TypeError|SyntaxError|error|failed|fail|fatal|OFFLINE|QUOTE_EXCEEDED|QUOTA_EXCEEDED|quotaExceeded|Monthly quota|CORRESPONDENTS_QU|466|unauthorized|denied|invalid|not found|Permission denied)/i.test(line))
return 'RED';

if (/(user\.warn|daemon\.warn|WARN color test yellow|warn|warning|unknown|skipped|skip|retry|timeout|null|no process|none killed|reset|не подтвержд)/i.test(line))
return 'YELLOW';

if (/(user\.notice|daemon\.notice|OK color test green|telegram-max-bridge:| ok\b|OK\b|ONLINE|authorized|idMessage|sent|success|created|polling started|Telegram->MAX reply ok|GREEN->Telegram ok|poll GREEN->Telegram ok|selected MAX chat|не обнаружен)/i.test(line))
return 'GREEN';

return 'INFO';
}

function tmbLogsStyleV7(level) {
var base = 'display:block;margin:3px 0;padding:5px 8px;border-radius:8px;font-weight:800;font-family:monospace;font-size:12px;line-height:1.35;';
if (level === 'RED')
return base + 'color:#ffffff;background:#8b1e1e;border-left:7px solid #ff4d4f;';
if (level === 'YELLOW')
return base + 'color:#fff8c5;background:#6b4a00;border-left:7px solid #d29922;';
if (level === 'GREEN')
return base + 'color:#d2ffd2;background:#145c26;border-left:7px solid #3fb950;';
return base + 'color:#d0d7de;background:#30363d;border-left:7px solid #6e7681;';
}

function tmbLogsLabelV11(line, level) {
if (level === 'RED') return '🔴 ERROR ';
if (level === 'YELLOW') return '🟡 WARN ';
if (level === 'GREEN') return '🟢 OK ';
return '⚪ INFO ';
}

function tmbFindRawLogsV7() {
var nodes = document.querySelectorAll('textarea, pre, code, div[style*="white-space"]');

for (var i = 0; i < nodes.length; i++) {
var el = nodes[i];
if (el.id === 'tmb-logs-colored-v7')
continue;

var txt = (typeof el.value === 'string') ? el.value : (el.textContent || '');
if (txt.length < 20)
continue;

if (
txt.indexOf('telegram-max-bridge') >= 0 ||
txt.indexOf('Telegram->MAX') >= 0 ||
txt.indexOf('GREEN->Telegram') >= 0 ||
txt.indexOf('GREEN quota') >= 0 ||
txt.indexOf('polling started') >= 0 ||
txt.indexOf('color test') >= 0
)
return el;
}

return null;
}

function tmbRenderLogsV7() {
var rawEl = tmbFindRawLogsV7();
if (!rawEl)
return;

var raw = (typeof rawEl.value === 'string') ? rawEl.value : (rawEl.textContent || '');
if (!raw || raw.length < 20)
return;

var viewer = document.getElementById('tmb-logs-colored-v7');
if (!viewer) {
viewer = document.createElement('div');
viewer.id = 'tmb-logs-colored-v7';
rawEl.parentNode.insertBefore(viewer, rawEl.nextSibling);
}

rawEl.style.display = 'none';

var oldTop = viewer.scrollTop || 0;
var winX = window.scrollX || 0;
var winY = window.scrollY || 0;

if (viewer.getAttribute('data-raw') !== raw) {
viewer.innerHTML = raw.split(/\r?\n/).map(function(line) {
if (!line)
return '<span style="display:block;height:4px"></span>';

var level = tmbLogsLevelV7(line);
return '<span style="' + tmbLogsStyleV7(level) + '"><span style="display:inline-block;min-width:150px">' +
tmbLogsLabelV11(line, level) + '</span>' + tmbLogsEscV7(line) + '</span>';
}).join('');

viewer.setAttribute('data-raw', raw);
}

viewer.style.height = '320px';
viewer.style.overflow = 'auto';
viewer.style.overscrollBehavior = 'contain';
viewer.style.padding = '8px';
viewer.style.borderRadius = '10px';
viewer.style.background = 'rgba(0,0,0,.20)';
viewer.style.whiteSpace = 'pre-wrap';
viewer.style.overflowWrap = 'anywhere';

viewer.scrollTop = oldTop;
window.scrollTo(winX, winY);
}

window.setInterval(tmbRenderLogsV7, 1000);
window.setTimeout(tmbRenderLogsV7, 400);
// TMB_LOGS_INPLACE_VIEWER_V7_END
// TMB_LOGS_CLASSIFY_V10_BEGIN
function tmbLogsLevelV7(line) {
/* LuCI login: пишет daemon.err, но внутри [info]. Делаем ЖЁЛТЫМ, чтобы было видно, но не как авария */
if (/(uhttpd.*\[info\].*accepted login|luci: accepted login|accepted login on)/i.test(line))
return 'YELLOW';

/* реальные ошибки моста */
if (/(ReferenceError|TypeError|SyntaxError|user\.err .*telegram-max-bridge|failed|fail|fatal|OFFLINE|QUOTE_EXCEEDED|QUOTA_EXCEEDED|quotaExceeded|Monthly quota|CORRESPONDENTS_QU|466|unauthorized|denied|invalid|not found|Permission denied)/i.test(line))
return 'RED';

/* предупреждения */
if (/(user\.warn|daemon\.warn|warn|warning|unknown|skipped|skip|retry|timeout|null|no process|none killed|reset|не подтвержд)/i.test(line))
return 'YELLOW';

/* нормальная работа */
if (/(GREEN quota notice sent|poll GREEN->Telegram ok|Telegram->MAX .* ok|Telegram menu selected|polling started|user\.notice|daemon\.notice|idMessage|ONLINE|authorized|success|created|не обнаружен)/i.test(line))
return 'GREEN';

return 'GREEN';
}
// TMB_LOGS_CLASSIFY_V10_END
// TMB_LOGS_GROUP_LABELS_V11_BEGIN
function tmbLogsLabelV11(line, level) {
if (/(uhttpd.*\[info\].*accepted login|luci: accepted login|accepted login on)/i.test(line))
return '🟡 WEB/LuCI';

if (/poll GREEN->Telegram ok/i.test(line)) {
var type = (line.match(/type=([^ ]+)/) || [,'msg'])[1];
return '🟢 MAX→TG ' + type;
}

if (/Telegram->MAX media ok/i.test(line))
return '🟢 TG→MAX media';

if (/Telegram->MAX reply ok/i.test(line))
return '🟢 TG→MAX text';

if (/Telegram menu selected MAX chat/i.test(line))
return '🟢 ЧАТ выбран';

if (/polling started/i.test(line))
return '🟢 POLLING';

if (/GREEN quota notice sent/i.test(line))
return '🟡 GREEN лимит';

if (/(ReferenceError|TypeError|SyntaxError)/i.test(line))
return '🔴 JS/LuCI';

if (/(QUOTE_EXCEEDED|QUOTA_EXCEEDED|quotaExceeded|Monthly quota|CORRESPONDENTS_QU|466)/i.test(line))
return '🔴 GREEN лимит';

if (/(failed|fail|fatal|OFFLINE|unauthorized|denied|invalid|not found|Permission denied)/i.test(line))
return '🔴 ERROR';

if (level === 'YELLOW')
return '🟡 WARN';

if (level === 'RED')
return '🔴 ERROR';

if (level === 'GREEN')
return '🟢 OK';

return '⚪ INFO';
}
// TMB_LOGS_GROUP_LABELS_V11_END



// TMB_LOGS_COPY_BUTTONS_V8_BEGIN
function tmbLogsCopyTextV8(text, btn) {
function done(ok) {
btn.textContent = ok ? 'Скопировано ✓' : 'Не скопировано';
window.setTimeout(function() { btn.textContent = 'Копировать логи'; }, 1400);
}

if (navigator.clipboard && navigator.clipboard.writeText) {
navigator.clipboard.writeText(text).then(function() {
done(true);
}).catch(function() {
tmbLogsCopyFallbackV8(text, done);
});
} else {
tmbLogsCopyFallbackV8(text, done);
}
}

function tmbLogsCopyFallbackV8(text, cb) {
var ta = document.createElement('textarea');
ta.value = text;
ta.style.position = 'fixed';
ta.style.left = '-9999px';
ta.style.top = '0';
document.body.appendChild(ta);
ta.focus();
ta.select();

var ok = false;
try { ok = document.execCommand('copy'); } catch(e) { ok = false; }

document.body.removeChild(ta);
cb(ok);
}

function tmbLogsSelectViewerV8(viewer) {
var range = document.createRange();
range.selectNodeContents(viewer);

var sel = window.getSelection();
sel.removeAllRanges();
sel.addRange(range);
}

function tmbEnsureLogsCopyButtonsV8() {
var viewer = document.getElementById('tmb-logs-colored-v7');
if (!viewer || !viewer.parentNode)
return;

viewer.style.userSelect = 'text';
viewer.style.webkitUserSelect = 'text';

if (document.getElementById('tmb-logs-copybar-v8'))
return;

var bar = document.createElement('div');
bar.id = 'tmb-logs-copybar-v8';
bar.style.margin = '8px 0';
bar.style.display = 'flex';
bar.style.gap = '8px';
bar.style.flexWrap = 'wrap';

var copyBtn = document.createElement('button');
copyBtn.className = 'btn cbi-button cbi-button-action';
copyBtn.textContent = 'Копировать логи';
copyBtn.onclick = function() {
var raw = viewer.getAttribute('data-raw') || viewer.innerText || viewer.textContent || '';
tmbLogsCopyTextV8(raw, copyBtn);
};

var selectBtn = document.createElement('button');
selectBtn.className = 'btn cbi-button';
selectBtn.textContent = 'Выделить логи';
selectBtn.onclick = function() {
tmbLogsSelectViewerV8(viewer);
};

bar.appendChild(copyBtn);
bar.appendChild(selectBtn);
viewer.parentNode.insertBefore(bar, viewer);
}

window.setInterval(tmbEnsureLogsCopyButtonsV8, 1000);
window.setTimeout(tmbEnsureLogsCopyButtonsV8, 500);
// TMB_LOGS_COPY_BUTTONS_V8_END


// TMB_BOT_CONTROL_CARD_V12_BEGIN
var botControlStatusV12 = E('pre', {
'style': 'white-space:pre-wrap;overflow-wrap:anywhere;word-break:break-word;max-width:100%;overflow:auto;padding:10px;border-radius:10px;background:rgba(0,0,0,.20);font-family:monospace'
}, _('Загрузка статуса...'));

function updateBotControlStatusV12() {
return fs.exec('/usr/bin/telegram-max-bridge-bot-control', ['status']).then(function(res) {
botControlStatusV12.textContent = res.stdout || '';
}).catch(function(e) {
botControlStatusV12.textContent = 'Ошибка статуса: ' + e;
});
}

function runBotControlV12(action) {
if (action === 'revoke') {
if (!confirm('Стереть локальные токены Telegram/GREEN в OpenWrt и отключить мост? Это действие нельзя отменить без бэкапа.'))
return;
}

botControlStatusV12.textContent = 'Выполняю: ' + action + ' ...';

return fs.exec('/usr/bin/telegram-max-bridge-bot-control', [action]).then(function(res) {
botControlStatusV12.textContent = res.stdout || 'OK';
window.setTimeout(updateBotControlStatusV12, 1200);
}).catch(function(e) {
botControlStatusV12.textContent = 'Ошибка команды ' + action + ': ' + e;
});
}

var botControlCardV12 = E('div', {
'class': 'cbi-section',
'style': 'border:1px solid rgba(100,160,255,.35);border-radius:14px;padding:14px;margin:12px 0;background:rgba(40,80,140,.10)'
}, [
E('h3', { 'style': 'margin-top:0' }, _('Управление ботом OpenWrt')),
E('p', { 'style': 'opacity:.78;margin-top:0' }, _('Рестарт/стоп polling-сервиса и локальное отключение токенов.')),
E('div', { 'style': 'display:flex;gap:8px;flex-wrap:wrap;margin:10px 0' }, [
E('button', {
'class': 'btn cbi-button cbi-button-action',
'click': function(ev) { ev.preventDefault(); runBotControlV12('restart'); }
}, _('Перезапустить бота')),
E('button', {
'class': 'btn cbi-button',
'style': 'border-color:#d29922;color:#d29922',
'click': function(ev) { ev.preventDefault(); runBotControlV12('stop'); }
}, _('Остановить бота')),
E('button', {
'class': 'btn cbi-button-negative',
'click': function(ev) { ev.preventDefault(); runBotControlV12('revoke'); }
}, _('Отвязать/стереть токены'))
]),
botControlStatusV12
]);

window.setTimeout(updateBotControlStatusV12, 500);
window.setInterval(updateBotControlStatusV12, 5000);
// TMB_BOT_CONTROL_CARD_V12_END
// TMB_BOT_CONTROL_COLLAPSE_V13_BEGIN
function tmbMakeBotControlCollapseV13() {
if (typeof botControlCardV12 === 'undefined' || !botControlCardV12)
return;

if (botControlCardV12.getAttribute && botControlCardV12.getAttribute('data-tmb-collapse-v13') === '1')
return;

botControlCardV12.setAttribute('data-tmb-collapse-v13', '1');

var oldChildren = [];
while (botControlCardV12.firstChild)
oldChildren.push(botControlCardV12.removeChild(botControlCardV12.firstChild));

var body = E('div', {
'id': 'tmb-bot-control-body-v13',
'style': 'display:none;margin-top:10px'
}, []);

for (var i = 0; i < oldChildren.length; i++) {
if (oldChildren[i].tagName && oldChildren[i].tagName.toLowerCase() === 'h3')
continue;
body.appendChild(oldChildren[i]);
}

var arrow = E('span', {
'style': 'display:inline-block;width:22px;font-weight:900'
}, '▶');

var title = E('span', {
'style': 'font-weight:800;font-size:16px'
}, _('Управление ботом OpenWrt'));

// TMB_BOT_CONTROL_OPEN_BUTTON_V14_BEGIN
var hint = E('button', {
'class': 'btn cbi-button cbi-button-action',
'style': 'font-weight:700;border-radius:10px;min-width:110px;padding:9px 16px;margin-left:auto'
}, _('Открыть'));
// TMB_BOT_CONTROL_OPEN_BUTTON_V14_END

var header = E('div', {
'style': 'display:flex;align-items:center;gap:4px;cursor:pointer;user-select:none;padding:4px 0'
}, [arrow, title, hint]);

header.onclick = function(ev) {
ev.preventDefault();
var open = body.style.display === 'none';
body.style.display = open ? 'block' : 'none';
arrow.textContent = open ? '▼' : '▶'; hint.textContent = open ? 'Закрыть' : 'Открыть';
};

botControlCardV12.appendChild(header);
botControlCardV12.appendChild(body);
}

tmbMakeBotControlCollapseV13();
// TMB_BOT_CONTROL_COLLAPSE_V13_END



// TMB_MANUAL_FONT_SIZE_V20_BEGIN
function tmbManualFontSizeV20() {
var cards = document.querySelectorAll('div.cbi-section, div');

for (var i = 0; i < cards.length; i++) {
var card = cards[i];
var txt = card.innerText || '';

if (txt.indexOf('Мануал по настройке') < 0)
continue;

/* только внешний manual-блок */
var h3 = card.querySelector('h3');
if (!h3 || (h3.textContent || '').indexOf('Мануал по настройке') < 0)
continue;

card.style.fontFamily = 'inherit';
card.style.fontSize = '14px';
card.style.lineHeight = '1.45';

h3.style.fontSize = '16px';
h3.style.fontWeight = '800';
h3.style.lineHeight = '1.25';
h3.style.margin = '0 0 4px 0';

var desc = card.querySelector('.cbi-value-description');
if (desc) {
desc.style.fontSize = '13px';
desc.style.lineHeight = '1.45';
}

var inner = card.querySelectorAll('p, a, b, code, pre, h4, div');
for (var j = 0; j < inner.length; j++) {
var el = inner[j];

if (el.tagName === 'H3') {
el.style.fontSize = '16px';
el.style.lineHeight = '1.25';
} else if (el.tagName === 'H4') {
el.style.fontSize = '14px';
el.style.lineHeight = '1.35';
el.style.margin = '10px 0 6px 0';
} else if (el.tagName === 'PRE' || el.tagName === 'CODE') {
el.style.fontSize = '13px';
el.style.lineHeight = '1.35';
} else {
el.style.fontSize = '13px';
el.style.lineHeight = '1.45';
}
}

return;
}
}

window.setInterval(tmbManualFontSizeV20, 1000);
window.setTimeout(tmbManualFontSizeV20, 300);
// TMB_MANUAL_FONT_SIZE_V20_END

// TMB_UI_FONT_UNIFORM_V21_BEGIN
function tmbUiFontUniformV21() {
if (document.getElementById('tmb-ui-font-uniform-v21'))
return;

var css = `
/* Telegram MAX Bridge: общий размер шрифта страницы */
.cbi-section,
.cbi-section div,
.cbi-section p,
.cbi-section a,
.cbi-section b,
.cbi-section span,
.cbi-section label,
.cbi-section input,
.cbi-section select,
.cbi-section textarea,
.cbi-value,
.cbi-value-field,
.cbi-value-description {
font-size: 13px !important;
line-height: 1.45 !important;
}

.cbi-section h3 {
font-size: 16px !important;
font-weight: 800 !important;
line-height: 1.25 !important;
margin: 0 0 4px 0 !important;
}

.cbi-section h4 {
font-size: 14px !important;
font-weight: 800 !important;
line-height: 1.35 !important;
margin: 10px 0 6px 0 !important;
}

.cbi-section pre,
.cbi-section code,
#tmb-logs-colored-v7,
#tmb-logs-colored-v7 div,
#tmb-quota-real-body-v18 {
font-size: 13px !important;
line-height: 1.35 !important;
}

.cbi-section .btn,
.cbi-section button,
.btn.cbi-button,
button.cbi-button {
font-size: 13px !important;
font-weight: 700 !important;
border-radius: 10px !important;
min-width: 110px;
padding: 9px 16px !important;
line-height: 1.2 !important;
}
`;

var st = document.createElement('style');
st.id = 'tmb-ui-font-uniform-v21';
st.textContent = css;
document.head.appendChild(st);
}

tmbUiFontUniformV21();
window.setTimeout(tmbUiFontUniformV21, 300);
// TMB_UI_FONT_UNIFORM_V21_END

// TMB_REMOVE_QUOTA_BLOCK_V22_BEGIN
function tmbRemoveQuotaBlockV22() {
var byId = document.getElementById('tmb-quota-real-v18');
if (byId && byId.parentNode)
byId.parentNode.removeChild(byId);

var title = 'Лимит SMS GREEN-API / console.green-api.com';
var divs = document.querySelectorAll('div');

for (var i = 0; i < divs.length; i++) {
var first = divs[i].firstElementChild;
if (first && (first.textContent || '').trim() === title) {
divs[i].style.display = 'none';
divs[i].remove();
return;
}
}
}

window.setInterval(tmbRemoveQuotaBlockV22, 1000);
window.setTimeout(tmbRemoveQuotaBlockV22, 300);
// TMB_REMOVE_QUOTA_BLOCK_V22_END

// TMB_BOT_CONTROL_FONT_V24_BEGIN
function tmbBotControlFontV24() {
var titleText = 'Управление ботом OpenWrt';

var nodes = document.querySelectorAll('div, span, h3, b, strong');
var titleEl = null;

for (var i = 0; i < nodes.length; i++) {
var t = (nodes[i].textContent || '').trim();
if (t.indexOf(titleText) >= 0 && t.length < 80) {
titleEl = nodes[i];
break;
}
}

if (!titleEl)
return;

var card = titleEl;
for (var up = 0; up < 8 && card.parentElement; up++) {
var s = card.getAttribute('style') || '';
if ((card.classList && card.classList.contains('cbi-section')) || s.indexOf('border-radius') >= 0 || s.indexOf('border') >= 0) {
if ((card.textContent || '').indexOf(titleText) >= 0)
break;
}
card = card.parentElement;
}

card.classList.add('cbi-section');

card.style.setProperty('margin-top', '0px', 'important');
card.style.setProperty('margin-bottom', '16px', 'important');
card.style.setProperty('border', '1px solid rgba(127,127,127,.25)', 'important');
card.style.setProperty('border-radius', '14px', 'important');
card.style.setProperty('padding', '14px', 'important');
card.style.setProperty('background', 'rgba(127,127,127,.05)', 'important');
card.style.setProperty('font-size', '13px', 'important');
card.style.setProperty('line-height', '1.45', 'important');

var all = card.querySelectorAll('div, span, p, b, a, label');
for (var j = 0; j < all.length; j++) {
all[j].style.setProperty('font-size', '13px', 'important');
all[j].style.setProperty('line-height', '1.45', 'important');
}

titleEl.style.setProperty('font-size', '16px', 'important');
titleEl.style.setProperty('font-weight', '800', 'important');
titleEl.style.setProperty('line-height', '1.25', 'important');
titleEl.style.setProperty('margin', '0 0 4px 0', 'important');

var row = titleEl.parentElement;
for (var r = 0; r < 4 && row && row !== card; r++) {
if (row.querySelector && row.querySelector('button')) {
row.style.setProperty('display', 'flex', 'important');
row.style.setProperty('align-items', 'center', 'important');
row.style.setProperty('justify-content', 'space-between', 'important');
row.style.setProperty('gap', '14px', 'important');
row.style.setProperty('flex-wrap', 'wrap', 'important');
break;
}
row = row.parentElement;
}

var btns = card.querySelectorAll('button, .btn, .cbi-button');
for (var b = 0; b < btns.length; b++) {
btns[b].style.setProperty('font-size', '13px', 'important');
btns[b].style.setProperty('font-weight', '700', 'important');
btns[b].style.setProperty('border-radius', '10px', 'important');
btns[b].style.setProperty('min-width', '110px', 'important');
btns[b].style.setProperty('padding', '9px 16px', 'important');
btns[b].style.setProperty('line-height', '1.2', 'important');
}
}

window.setInterval(tmbBotControlFontV24, 700);
window.setTimeout(tmbBotControlFontV24, 200);
// TMB_BOT_CONTROL_FONT_V24_END

			var root = E('div', {}, [ topManualCard, botControlCardV12, greenMiniStatusBlock, quotaMiniStatusBlock, pollStatusCard, logsBox,testTelegramCard, settingsCard, backupCard ]);
			// TMB_HIDE_PAGE_H2_V1
			window.setTimeout(function() {
				var h = document.querySelector('h2[name="content"]');
				if (h && h.textContent && h.textContent.trim() === 'Мост Telegram MAX') h.style.display = 'none';
			}, 0);
			window.setTimeout(function() {
				var boxes = root.querySelectorAll('pre');
				var logBox = boxes && boxes.length ? boxes[boxes.length - 1] : null;
				if (!logBox) return;
				var upd = function() {
					fs.exec('/usr/bin/telegram-max-bridge-control', ['logs', '120']).then(function(r) {
						var t = (r.stdout || r.stderr || '').trim();
						logBox.textContent = t || 'Нет логов';
					}).catch(function(e) { logBox.textContent = String(e); });
				};
				upd();
				if (window.tmbLiveLogsTimerV1) window.clearInterval(window.tmbLiveLogsTimerV1);
				window.tmbLiveLogsTimerV1 = window.setInterval(upd, 2000);
			}, 0);
			return root;
});
}
});
