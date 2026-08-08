# TT3Dato — структура системы

Параллельная структура, описывающая архитектуру TT3Dato по компонентам.
Каждый компонент — копия реального кода или документации из форков timthealer
(Aegis, Ruflo, OmniRoute, atomic-agent, awesome, ECC). Подробнее — `Repositories/` и `docs/awesome.md`.

```
TT3Dato/
├── core/              # Ядро системы
│   ├── trust-domains/ # Изоляция и безопасность (Aegis)
│   ├── memory/        # Верифицируемая память (Aegis + Ruflo/SONA)
│   ├── swarm/         # Координация роев (Ruflo/ECC)
│   └── federation/    # Zero-trust федерация (Ruflo/ECC)
├── llm-router/        # Маршрутизация LLM (OmniRoute + Aegis)
│   ├── auto-combo/    # Автоматический выбор провайдера
│   ├── rotation/      # Ротация аккаунтов
│   └── budget/        # Управление бюджетом (Aegis)
├── tools/             # MCP-инструменты (atomic-agent)
│   ├── browser/       # Браузер с ARIA snapshots
│   ├── filesystem/    # Работа с файлами
│   └── shell/         # Исполнение команд
├── agents/            # Агенты и навыки (atomic-agent, ECC, Ruflo)
├── docs/              # Документация
│   └── awesome.md     # Курируемый каталог (awesome-методология)
└── traces/            # Append-only логи (atomic-agent)
```

## Маппинг источников

| Компонент | Источник | Что скопировано |
|---|---|---|
| `core/trust-domains` | Aegis | ADR 0001/0005, SECURITY_MODEL, THREAT_MODEL, quarantine/, gate/ |
| `core/memory` | Aegis | ADR 0002, verifiable memory (verifier, promotion, consolidation) |
| `core/swarm` | Ruflo | SWARM-OVERVIEW, AGENT-SPECIFICATIONS, ADR-369 inter-agent messaging |
| `core/federation` | Ruflo | Federation user guide, phase7 mesh, ADR-097 circuit breaker |
| `llm-router/auto-combo` | OmniRoute | routingStrategies.ts, combo.ts, freeModels.ts |
| `llm-router/rotation` | OmniRoute | apiKeyPolicy.ts, peerRouting.ts |
| `llm-router/budget` | Aegis | budget/engine.ts, ADR-0009 LOC budget |
| `tools/browser` | atomic-agent | ARIA snapshots (read-aria, aria-compressor, capture-world-snapshot) |
| `tools/filesystem` | atomic-agent | fs-* tools, read-document, web-fetch |
| `tools/shell` | atomic-agent | shell.ts, shell-command-guard, proc, git |
| `agents/` | atomic-agent/ECC/Ruflo | SKILL.md формат, skill-creator, github skill, agent specs |
| `docs/awesome.md` | awesome | Курируемый каталог |
| `traces/` | atomic-agent | trace-bus, trace-recorder, trace-sink, NDJSON sinks |
