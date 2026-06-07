#!/bin/sh
# telegram-max-bridge OpenWrt slim common helpers
# No Python, no venv, no pip. Uses uhttpd CGI + uclient-fetch + jsonfilter.

TMB_NAME="telegram-max-bridge"
TMB_VERSION="slim-1"

log_tmb() {
	logger -t "$TMB_NAME" "$*"
}

load_tmb_config() {
	. /lib/functions.sh
	config_load telegram_max_bridge
	config_get enabled main enabled '0'
	config_get direction main direction 'max_to_telegram'
	config_get max_instance_id main max_instance_id ''
	config_get max_api_token main max_api_token ''
	config_get max_chat_id main max_chat_id ''
	config_get max_target_chat_id main max_target_chat_id ''
	config_get telegram_bot_token main telegram_bot_token ''
	config_get telegram_channel_id main telegram_channel_id ''
	config_get telegram_chat_id main telegram_chat_id ''
	config_get telegram_webhook_url main telegram_webhook_url ''
	config_get telegram_webhook_secret main telegram_webhook_secret ''
	config_get webhook_secret main webhook_secret ''
	config_get prefix_sender main prefix_sender '1'
	config_get log_level main log_level 'info'
}

json_escape() {
	awk 'BEGIN{ORS=""}{gsub(/\\/,"\\\\");gsub(/\"/,"\\\"");gsub(/\r/,"\\r");gsub(/\t/,"\\t");if(NR>1)printf "\\n";printf "%s",$0}'
}

jget() {
	# Usage: jget "$json" '@.path'
	jsonfilter -s "$1" -e "$2" 2>/dev/null | head -n 1
}

jget_last() {
	jsonfilter -s "$1" -e "$2" 2>/dev/null | tail -n 1
}

http_json_post() {
	_url="$1"
	_payload="$2"
	uclient-fetch -q -T 25 -O - \
		--header='Content-Type: application/json' \
		--post-data="$_payload" \
		"$_url" 2>&1
}

telegram_api() {
	_method="$1"
	_payload="$2"
	http_json_post "https://api.telegram.org/bot${telegram_bot_token}/${_method}" "$_payload"
}

green_base_url() {
	_server_id="$(printf '%s' "$max_instance_id" | cut -c1-4)"
	printf 'https://%s.api.green-api.com/v3/waInstance%s' "$_server_id" "$max_instance_id"
}

# TMB_GREEN_QUOTA_BOT_NOTICE_V2_BEGIN
green_quota_status_write_ok() {
{
echo "STATUS=OK"
echo "INSTANCE=${max_instance_id:-unknown}"
echo "TEXT=Лимит GREEN-API не обнаружен"
echo "TIME=$(date '+%Y-%m-%d %H:%M:%S')"
} > /tmp/telegram-max-bridge-green-quota-status 2>/dev/null || true
}

green_quota_status_write_limit() {
_method="$1"
_api_status="$2"
_api_used="$3"
_api_total="$4"
_chat_status="$5"
_chat_used="$6"
_chat_total="$7"
_desc="$8"

{
echo "STATUS=LIMIT"
echo "INSTANCE=${max_instance_id:-unknown}"
echo "METHOD=${_method}"
echo "API_STATUS=${_api_status:-unknown}"
echo "API_USED=${_api_used:-?}"
echo "API_TOTAL=${_api_total:-?}"
echo "CHAT_STATUS=${_chat_status:-unknown}"
echo "CHAT_USED=${_chat_used:-?}"
echo "CHAT_TOTAL=${_chat_total:-?}"
echo "DESC=$(printf '%s' "$_desc" | tr '\n' ' ' | cut -c1-500)"
echo "TIME=$(date '+%Y-%m-%d %H:%M:%S')"
} > /tmp/telegram-max-bridge-green-quota-status 2>/dev/null || true
}

green_quota_bot_notice() {
_method="$1"
_response="$2"

printf '%s' "$_response" | grep -Eiq 'QUOTE_EXCEEDED|QUOTA_EXCEEDED|quotaExceeded|Monthly quota|CORRESPONDENTS_QU|466' || return 0

_now="$(date +%s 2>/dev/null || echo 0)"
_last="$(cat /tmp/telegram-max-bridge-green-quota-last 2>/dev/null || echo 0)"
if [ "$_now" -gt 0 ] && [ "$_last" -gt 0 ] && [ $((_now - _last)) -lt 300 ]; then
return 0
fi
echo "$_now" > /tmp/telegram-max-bridge-green-quota-last 2>/dev/null || true

_tg="${telegram_channel_id:-}"
[ -n "$_tg" ] || _tg="${telegram_chat_id:-}"
[ -n "$_tg" ] || return 0

_inv_used="$(printf '%s' "$_response" | jsonfilter -e '@.invokeStatus.used' 2>/dev/null | head -1)"
_inv_total="$(printf '%s' "$_response" | jsonfilter -e '@.invokeStatus.total' 2>/dev/null | head -1)"
_inv_status="$(printf '%s' "$_response" | jsonfilter -e '@.invokeStatus.status' 2>/dev/null | head -1)"

_cor_used="$(printf '%s' "$_response" | jsonfilter -e '@.correspondentsStatus.used' 2>/dev/null | head -1)"
_cor_total="$(printf '%s' "$_response" | jsonfilter -e '@.correspondentsStatus.total' 2>/dev/null | head -1)"
_cor_status="$(printf '%s' "$_response" | jsonfilter -e '@.correspondentsStatus.status' 2>/dev/null | head -1)"

_desc="$(printf '%s' "$_response" | jsonfilter -e '@.correspondentsStatus.description' 2>/dev/null | head -1)"
[ -n "$_desc" ] || _desc="$(printf '%s' "$_response" | jsonfilter -e '@.invokeStatus.description' 2>/dev/null | head -1)"
[ -n "$_desc" ] || _desc="$(printf '%s' "$_response" | tr '\n' ' ' | cut -c1-500)"

green_quota_status_write_limit "$_method" "$_inv_status" "$_inv_used" "$_inv_total" "$_cor_status" "$_cor_used" "$_cor_total" "$_desc"

_msg="⚠️ GREEN-API лимит

Отправка MAX не прошла.
Instance: ${max_instance_id}
Метод: ${_method}

Лимит API: ${_inv_status:-unknown} ${_inv_used:-?}/${_inv_total:-?}
Лимит чатов: ${_cor_status:-unknown} ${_cor_used:-?}/${_cor_total:-?}

Причина:
${_desc}

Когда закончится:
GREEN-API не прислал точную дату сброса в ответе. Это месячный лимит тарифа/Developer. Проверь console.green-api.com → instance → тариф/лимиты.

Что делать:
сменить/оплатить тариф или ждать сброса месячного лимита."

send_telegram_text "$_tg" "$_msg" >/dev/null 2>&1 || true
log_tmb "GREEN quota notice sent to Telegram method=$_method"
}

green_api() {
_method="$1"
_payload="$2"
_base="$(green_base_url)"
_res="$(http_json_post "${_base}/${_method}/${max_api_token}" "$_payload" 2>&1)"
_rc=$?

_is_send=0
case "$_method" in
sendMessage|sendFileByUrl|sendFileByUpload|sendLocation|sendContact|sendPoll|sendButtons|sendTemplateButtons)
_is_send=1
;;
esac

if [ "$_is_send" = "1" ]; then
if printf '%s' "$_res" | grep -Eiq 'QUOTE_EXCEEDED|QUOTA_EXCEEDED|quotaExceeded|Monthly quota|CORRESPONDENTS_QU|466'; then
green_quota_bot_notice "$_method" "$_res" || true
elif printf '%s' "$_res" | grep -q '"idMessage"'; then
green_quota_status_write_ok || true
fi
fi

printf '%s\n' "$_res"
return "$_rc"
}
# TMB_GREEN_QUOTA_BOT_NOTICE_V2_END

format_sender_block() {
	_name="$1"
	_user="$2"
	_phone="$3"
	out=""
	[ "$prefix_sender" = "1" ] || return 0
	[ -n "$_name" ] && out="👤 $_name"
	[ -n "$_user" ] && out="${out}${out:+ }@$_user"
	[ -n "$_phone" ] && out="${out}${out:+ }($_phone)"
	printf '%s' "$out"
}

send_telegram_text() {
	_chat="$1"
	_text="$2"
	[ -n "$telegram_bot_token" ] || { echo '{"ok":false,"description":"telegram_bot_token empty"}'; return 1; }
	[ -n "$_chat" ] || { echo '{"ok":false,"description":"telegram target chat empty"}'; return 1; }
	_chat_e="$(printf '%s' "$_chat" | json_escape)"
	_text_e="$(printf '%s' "$_text" | json_escape)"
	telegram_api "sendMessage" "{\"chat_id\":\"${_chat_e}\",\"text\":\"${_text_e}\",\"disable_web_page_preview\":false}"
}

send_telegram_file_by_url() {
	_method="$1"   # sendPhoto/sendVideo/sendDocument
	_field="$2"    # photo/video/document
	_chat="$3"
	_url="$4"
	_caption="$5"
	[ -n "$telegram_bot_token" ] || { echo '{"ok":false,"description":"telegram_bot_token empty"}'; return 1; }
	_chat_e="$(printf '%s' "$_chat" | json_escape)"
	_url_e="$(printf '%s' "$_url" | json_escape)"
	_caption_e="$(printf '%s' "$_caption" | json_escape)"
	telegram_api "$_method" "{\"chat_id\":\"${_chat_e}\",\"${_field}\":\"${_url_e}\",\"caption\":\"${_caption_e}\"}"
}

send_green_text() {
	_chat="$1"
	_text="$2"
	[ -n "$max_instance_id" ] || { echo '{"ok":false,"description":"max_instance_id empty"}'; return 1; }
	[ -n "$max_api_token" ] || { echo '{"ok":false,"description":"max_api_token empty"}'; return 1; }
	[ -n "$_chat" ] || { echo '{"ok":false,"description":"max target chat empty"}'; return 1; }
	_chat="$(printf '%s' "$_chat" | sed 's/@c\.us//g;s/@g\.us//g')"
	_chat_e="$(printf '%s' "$_chat" | json_escape)"
	_text_e="$(printf '%s' "$_text" | json_escape)"
	green_api "sendMessage" "{\"chatId\":\"${_chat_e}\",\"message\":\"${_text_e}\"}"
}

send_green_file_by_url() {
	_chat="$1"
	_url="$2"
	_filename="$3"
	_caption="$4"
	_chat="$(printf '%s' "$_chat" | sed 's/@c\.us//g;s/@g\.us//g')"
	_chat_e="$(printf '%s' "$_chat" | json_escape)"
	_url_e="$(printf '%s' "$_url" | json_escape)"
	_file_e="$(printf '%s' "$_filename" | json_escape)"
	_caption_e="$(printf '%s' "$_caption" | json_escape)"
	green_api "sendFileByUrl" "{\"chatId\":\"${_chat_e}\",\"urlFile\":\"${_url_e}\",\"fileName\":\"${_file_e}\",\"caption\":\"${_caption_e}\"}"
}

read_cgi_body() {
	# uhttpd CGI sends request body to stdin.
	cat
}

cgi_json_header() {
	printf 'Status: %s\r\nContent-Type: application/json\r\nCache-Control: no-store\r\n\r\n' "${1:-200 OK}"
}

cgi_ok() {
	msg="$(printf '%s' "$1" | json_escape)"
	printf '{"status":"ok","message":"%s"}\n' "$msg"
}

cgi_error() {
	msg="$(printf '%s' "$1" | json_escape)"
	printf '{"status":"error","message":"%s"}\n' "$msg"
}
