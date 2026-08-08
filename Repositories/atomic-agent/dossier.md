# Досье: atomic-agent

**Статус:** CANDIDATE
**Источник:** https://github.com/Doriandarko/atomic-agent
**Лицензия:** MIT
**Язык:** TypeScript

## Метрики (GitHub API, 2026-08-08)

- Форк в timthealer: `timthealer/atomic-agent`
- Размер: ~22 MB (src/)

## Что взяли

- Local-first архитектура (src/local-llm, src/runtime);
- ARIA-based браузер (src/tools/browser/ — read-aria, aria-compressor, capture-world-snapshot);
- MCP-инструменты: filesystem (fs-*, read-document), shell (shell.ts, shell-command-guard, proc);
- Tracing система (src/tracing/ — trace-bus, trace-recorder, trace-sink, NDJSON);
- Формат навыков SKILL.md + skill-creator (agents/atomic-agent-skill-format, agents/skill-creator).

## Интеграция

- Скопировано в `tools/`, `traces/`, `agents/`;
- TurboQuant / локальные LLM (src/local-llm) — паттерн для локальных провайдеров TT3Dato.

## Анализ

`Docs/Research/` — анализ не создан (поставлен в CANDIDATE по прямому указанию владельца, код перенесён).

## Решение

CANDIDATE — код компонентов перенесён; локальные LLM (TurboQuant) — после стабилизации OmniRoute-интеграции.
