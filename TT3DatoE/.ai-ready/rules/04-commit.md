# Коммиты и пуши

## Когда коммитить

- Только по явной просьбе пользователя. Не коммить «на всякий случай».

## Перед коммитом

- `git status` и `git diff` — убедись, что добавляешь только нужные файлы.
- `npm run build && npm run lint` — должно быть чисто.

## Формат сообщения

Короткое, по делу, в стиле репозитория. Примеры:

```
feat: add free providers routing (Gemini, OpenRouter, Groq)

fix: migrate legacy router settings to providers

chore: update .ai-ready autopilot rules
```

## Правила

- Не коммить: секреты, ключи, `node_modules/`, `dist/`, файлы логов.
- Не коммить чужие/несвязанные изменения в одном коммите с задачей.
- Пуш в `origin` — по явной просьбе. После пуша сообщи результат.
