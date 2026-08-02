# Skills

Каталог навыков TT3Dato. Навыки — переиспользуемые рабочие процессы, загружаемые по задаче (модель ECC). Активируются HuckleberryFinn в зависимости от режима (research, audit, review, plan, docs и т.д.).

> Источник большинства навыков: affaan-m/ECC (MIT) и ruvnet/ruflo (MIT) — адаптировано для TT3Dato.

## Правила

- Навык = папка с `SKILL.md` (формат: цель, входы, шаги, выходы, запреты).
- Правила (обязательные стандарты) живут в `Skills/rules/` и всегда загружены.
- Навыки не добавляются без регистрации в `Repositories/inventory.json`.
- Использование навыка не расширяет права агента — права определяет `Docs/Agent_Permissions`.

## Каталог

| Навык | Назначение | Источник |
|---|---|---|
| `tdd-workflow` | Цикл RED→GREEN→REFACTOR с фиксацией свидетельств | ECC |
| `deep-research` | Многоисточниковое исследование (режим research) | Ruflo / ECC |
| `security-review` | Проверка кода и конфигов на уязвимости (режим review) | ECC |
| `unified-memory` | Формат памяти `ecc.memory.v1`, продвижение unverified→verified | ECC |
| `context-budget` | Контроль объёма контекста и сессий | ECC |
| `cost-aware-llm-pipeline` | Учёт стоимости LLM-запросов (связь с OmniRoute) | ECC |
| `search-first` | Поиск существующего решения перед созданием (Open Source First) | ECC |
| `documentation-lookup` | Поиск и верификация документации | ECC |
| `agent-eval` | Оценка качества результата (5-осевой рубрик) | ECC |
| `market-research` | Исследование рынка (для бизнес-задач владельца) | ECC |
| `parallel-execution-optimizer` | Оптимизация параллельного выполнения | ECC |
| `agent-harness-construction` | Сборка агентной среды из компонентов | ECC |

## Правила (Skills/rules/)

- `agents.md` — стандарты описания агентов/режимов.
- `code-review.md` — критерии ревью кода.
- `coding-style.md` — стиль кода.
- `development-workflow.md` — цикл разработки.
- `git-workflow.md` — работа с Git (ветки, PR, approval).
- `hooks.md` — детерминированные проверки.
