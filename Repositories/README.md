# Repositories

Библиотека системы TT3Dato — каталог open-source репозиториев, используемых как источники методологий и решений (Конституция, раздел 10: «GitHub является библиотекой системы»).

## Структура

```
Repositories/
  README.md               # этот файл
  stack-mappings.json     # маппинг «задача TT3Dato -> репозиторий-решение»
  inventory.json          # инвентарь агентов и навыков TT3Dato
  <RepoName>/             # досье на репозиторий (метаданные + статус)
```

## Статусы репозиториев

- ACTIVE — используется как источник и поддерживается;
- CANDIDATE — рассматривается для интеграции;
- MONITORING — наблюдаем, внедрение отложено;
- RETIRED — отклонено.

## Текущий каталог

| Репозиторий | Статус | Что взяли |
|---|---|---|
| `Ruflo` | ACTIVE | Методология Researcher и Auditor (агенты), федерация, рои, SONA-память (core/swarm, core/federation) |
| `ECC` | ACTIVE | Цикл, skills, агенты, rules, memory, security (см. Docs/ATTRIBUTIONS.md) |
| `OmniRoute` | CANDIDATE | AI-шлюз, стратегии маршрутизации, комбо, ротация (llm-router/) |
| `Aegis` | MONITORING | Trust-домены, верифицируемая память, бюджет-контракты (core/trust-domains, core/memory, llm-router/budget) |
| `atomic-agent` | CANDIDATE | Local-first, ARIA-браузер, tracing (tools/browser, tools/filesystem, tools/shell, traces/) |
| `awesome` | ACTIVE | Методология курируемых списков (docs/awesome.md) |

## Правила добавления

1. Новый репозиторий добавляется только после исследования (минимум 5 альтернатив, Конституция, раздел 4).
2. Запись вносится в `stack-mappings.json` и создаётся досье `<RepoName>/`.
3. Все заимствования фиксируются в `Docs/ATTRIBUTIONS.md`.
