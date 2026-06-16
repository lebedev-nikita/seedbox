# Raspberry Pi Seedbox

Локальное веб-приложение для управления Transmission на Raspberry Pi.

## Требования

- Bun
- Transmission daemon с включенным RPC
- Директория для загрузок, например внешний диск в `/mnt/downloads`

## Переменные окружения сервера

```bash
export TRANS_RPC_URL="http://127.0.0.1:9091/transmission/rpc"
export TRANS_RPC_USERNAME=""
export TRANS_RPC_PASSWORD=""
export SEEDBOX_ALLOWED_DOWNLOAD_DIRS="/mnt/downloads,/media/pi/downloads"
export PORT="3000"
```

`SEEDBOX_ALLOWED_DOWNLOAD_DIRS` обязателен для выбора папки загрузок в интерфейсе.
Сервер не принимает произвольные пути, только значения из этого списка.

## Запуск для разработки

```bash
cd server
bun install
bun run dev
```

```bash
cd client
bun install
bun run dev
```

Клиент Vite проксирует `/api` на `http://localhost:3000`, включая tRPC endpoint
`/api/trpc`.
Если сервер запущен на другом порту, задайте:

```bash
SEEDBOX_SERVER_ORIGIN="http://localhost:49183" bun run dev
```

## Доступ

В приложении нет логина. Запускайте его только в доверенной локальной сети и не
публикуйте порт сервера или Vite напрямую в интернет.

## Диагностика Transmission RPC

Если интерфейс показывает, что Transmission RPC недоступен, проверьте с той же
машины или из того же контейнера, где запущен backend:

```bash
curl -i http://127.0.0.1:9091/transmission/rpc
```

Рабочий Transmission обычно отвечает `409 Conflict` и заголовком
`X-Transmission-Session-Id`. Если соединения нет, запустите
`transmission-daemon`, включите RPC и проверьте `TRANS_RPC_URL`.
