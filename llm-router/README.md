# llm-router — маршрутизация LLM

Источники: [OmniRoute](https://github.com/diegosouzapw/OmniRoute), [Aegis](https://github.com/DukeDeSouth/aegis).

```
llm-router/
├── auto-combo/   # Автоматический выбор провайдера (OmniRoute)
├── rotation/     # Ротация аккаунтов (OmniRoute)
└── budget/       # Управление бюджетом (Aegis)
```

## Что скопировано

- **auto-combo**: `routingStrategies.ts` (19 стратегий, ACCOUNT_FALLBACK_STRATEGY_VALUES),
  `combo.ts` (схема комбо), `freeModels.ts` (бесплатные модели).
- **rotation**: `apiKeyPolicy.ts` (политика ключей), `peerRouting.ts` (устойчивость пиринговой маршрутизации).
- **budget**: `engine.ts` (бюджет как контракт из Aegis), `0009-post-mvp-core-loc-budget.md` (ADR).

## Интеграция с TT3Dato

- Рабочий роутер подключён в `TT3DatoE` (вкладка Модели → Свой роутер, OmniRoute `/v1`).
- Алиасы: `auto/best-chat` (стабильный), `auto/best-coding`, fallback на `auto/best-coding` при пустом ответе.
