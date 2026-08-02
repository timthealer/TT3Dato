# Telegram

Канал связи владельца с HuckleberryFinn через Telegram.

Бот `HuckleberryFinnBot` (@HuckleberryFinn18Bot) задеплоен на Vercel (webhook) и работает как «тупой приёмник»:

- каждое сообщение владельца дописывается в `Telegram/inbox/YYYY-MM-DD.md` этого репозитория;
- бот отвечает подтверждением;
- никаких LLM в боте: извлечение сущностей и обработку выполняет агент HuckleberryFinn, когда запущен.

## Inbox формат

Каждая запись:

```
- **<ISO-время>** | chat <chat_id> | @<username> (id <user_id>)
  <текст сообщения>
```

HuckleberryFinn: при запуске прочитать свежие файлы `Telegram/inbox/*.md`, обработать и переместить обработанное в `Memory/unverified/` (по политике ecc.memory.v1).

## Конфигурация Vercel

- `BOT_TOKEN` — токен бота (@BotFather)
- `OWNER_CHAT_ID` — числовой chat_id владельца (5255559756, @klysheuski)
- `GITHUB_TOKEN` — токен GitHub с правом записи в `timthealer/TT3Dato`

`GEMINI_API_KEY` больше не нужен.

Источник паттерна: https://github.com/DukeDeSouth/aegis (MIT). Адаптировано для TT3Dato.
