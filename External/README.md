# External

Каталог внешних интеграций и коннекторов TT3Dato.

## Формат коннектора

Декларативный формат (адаптирован из Aegis `connectors/`, см. https://github.com/DukeDeSouth/aegis, MIT):

```
External/<name>/
  manifest.json    # метаданные коннектора (id, name, version, entrypoints)
  SKILL.md         # инструкция по использованию (опционально)
  connector.json   # конфигурация (опционально)
```

Каждая интеграция сопровождается моделью угроз (по образцу ECC `integrations/aura/THREAT_MODEL.md`).

## Политика интеграций

1. Внешняя интеграция добавляется только после исследования и одобрения владельца (Decision Protocol).
2. Интеграция фиксируется в `Repositories/stack-mappings.json` и `Docs/ATTRIBUTIONS.md`.
3. Данные внешних источников обрабатываются как домен Untrusted (ADR-0001) до верификации.
4. Ключи и секреты хранятся только в переменных окружения, никогда в конфигурации (Security Checklist).

## Текущие интеграции

| Интеграция | Статус | Описание |
|---|---|---|
| `omniroute-gateway` | CANDIDATE | AI-шлюз к LLM (после MVP, ADR-0004) |
| `telegram` | CANDIDATE | Канал коммуникации (паттерн Aegis deploy/broker) |

## Аналоги в репозиториях

- Aegis: `connectors/` (bookmarks, caldav, content-calendar) — декларативный формат;
- ECC: `integrations/aura` — адаптер + README + THREAT_MODEL + tests;
- Ruflo: `services/cognitum-analytics` — сервис аналитики.
