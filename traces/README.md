# traces — append-only логи

Источник: [atomic-agent](https://github.com/Doriandarko/atomic-agent) (tracing система).

Append-only трассировка: записи только добавляются, никогда не перезаписываются.
Каждая трасса — неизменяемая последовательность событий для аудита и отладки агента.

## Что скопировано

- `trace-bus.ts` — шина событий трассировки;
- `trace-recorder.ts` — запись событий;
- `trace-sink.ts` — приёмники (куда пишутся события);
- `trace-event.ts` — тип события;
- `structured-logger.ts` — структурированный логгер;
- `ndjson-sinks.ts` — NDJSON-приёмники;
- `metrics-collector.ts`, `agent-metrics.ts` — метрики агента.

## Интеграция

Логи-процессы TT3Dato исторически живут в `Logs/` (см. `Logs/README.md` политику).
`traces/` — это runtime-слой трассировки агента, совместимый с append-only политикой.
