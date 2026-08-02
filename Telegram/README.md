# Telegram

Канал связи владельца с HuckleberryFinn через Telegram.

Бот `HuckleberryFinnBot` (@HuckleberryFinn18Bot) задеплоен на Vercel (webhook) и работает как «тупой приёмник»:

- каждое текстовое сообщение владельца дописывается в `Telegram/inbox/YYYY-MM-DD.md` этого репозитория;
- каждый файл (документ) владельца сохраняется в `Don'tReadMe/` (личное досье);
- бот отвечает подтверждением;
- никаких LLM в боте: понимание, сортировку и обработку выполняет агент HuckleberryFinn, когда запущен.

## Inbox формат

Каждая запись:

```
- **<ISO-время>** | chat <chat_id> | @<username> (id <user_id>)
  <текст сообщения>
```

HuckleberryFinn: при запуске прочитать свежие файлы `Telegram/inbox/*.md`, классифицировать (идея/задача/вопрос/заметка), при необходимости уточнить у владельца (через бота) и отсортировать в соответствующие папки (Ideas/, Tasks/, Memory/unverified/ и т.п.). См. `Workflows/telegram-inbox-processing.md`.

## Конфигурация Vercel

- `BOT_TOKEN` — токен HuckleberryFinnBot (@BotFather)
- `OWNER_CHAT_ID` — числовой chat_id владельца (5255559756, @klysheuski)
- `CLIENT_BOT_TOKEN` — токен клиентского бота @Audit_TT3dato_bot
- `GITHUB_TOKEN` — токен GitHub с правом записи в `timthealer/TT3Dato`

`GEMINI_API_KEY` больше не нужен.

Источник паттерна: https://github.com/DukeDeSouth/aegis (MIT). Адаптировано для TT3Dato.
