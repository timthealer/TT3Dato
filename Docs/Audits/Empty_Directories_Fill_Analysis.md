# Empty Directories Fill Analysis

**Репозитории сравнения:** ECC (affaan-m/ECC), Aegis (DukeDeSouth/aegis), Ruflo (ruvnet/ruflo)
**Дата анализа:** 2026-08-01
**Аудитор:** Huckleberry Finn (архитектор TT3Dato)
**Статус:** Ожидает решения пользователя (Decision Protocol)

---

# 1. Наши пустые папки и их предназначение

| Папка | Предназначение (из структуры TT3Dato) |
|---|---|
| `Blueprint/` | Архитектурные чертежи, ADR, планы развития |
| `Repositories/` | Библиотека системы: каталог и досье open-source репозиториев (Конституция, раздел 10) |
| `External/` | Внешние интеграции и коннекторы |
| `Workflows/` | Определения агентных рабочих процессов |
| `Temp/` | Временные данные/эксперименты |

---

# 2. Схожие директории в ECC, Aegis, Ruflo

## 2.1. Аналог Blueprint/

| Репозиторий | Директория | Содержимое |
|---|---|---|
| Aegis | `docs/adr/` | ADR 0001-0006: four-trust-domains, verifiable-memory, declarative-skills-first, credential-broker, quarantine-untrusted-input, core-language-and-sandbox-runtime |
| Aegis | `docs/` | ARCHITECTURE.md, TRUST_DOMAINS.md, MEMORY_SCHEMA.md, THREAT_MODEL.md, TOKEN_ECONOMY.md, MVP_SCOPE.md, BACKLOG.md |
| ECC | `docs/design/` | ecc-memory-vault.md, plan-canvas.md, agent-proximity.md |
| ECC | `docs/` | PLAN-PRD-PATTERN.md, SELECTIVE-INSTALL-DESIGN.md, ECC-2.0-REFERENCE-ARCHITECTURE.md |
| Ruflo | `docs/` | IMPROVEMENT-ROADMAP.md, STATUS.md, benchmarks/ |

## 2.2. Аналог Repositories/

| Репозиторий | Директория | Содержимое |
|---|---|---|
| ECC | `research/` | ecc2-codebase-analysis.md (анализ кодовой базы) |
| ECC | `config/` | project-stack-mappings.json (маппинг стек->проекты), github-native-coordination.json |
| Ruflo | `verification/` | inventory.json, CAPABILITIES.md, cli-mcp-tool-baseline.json (инвентарь возможностей) |
| Ruflo | `data/` | clone-data.ledger.json, clone-data.proof.json |
| Aegis | `docs/` | REPO_LAYOUT.md (карта структуры репозитория) |

## 2.3. Аналог External/

| Репозиторий | Директория | Содержимое |
|---|---|---|
| Aegis | `connectors/` | Формат коннектора: `SKILL.md` + `manifest.json` + `connector.json` + `server/server.mjs`. Примеры: bookmarks, caldav, content-calendar |
| ECC | `integrations/` | aura: `adapter.py` + `README.md` + `THREAT_MODEL.md` + `tests/` |
| Ruflo | `services/` | cognitum-analytics (сервис аналитики) |

## 2.4. Аналог Workflows/

| Репозиторий | Директория | Содержимое |
|---|---|---|
| Ruflo | `.claude/commands/workflows/` | development.md, research.md, workflow-create.md, workflow-execute.md, workflow-export.md |
| Ruflo | `.claude/workflows/` | full-system-test.js |
| Ruflo | `v3/@claude-flow/agents/` | Готовые процессы: architect.yaml, coder.yaml, reviewer.yaml, tester.yaml, security-architect.yaml |
| ECC | `workflows/` | orch-review.workflow.js + README.md |
| Aegis | `docs/` | LEARNING_LOOP.md (цикл обучения), SKILLS_MODEL.md |

## 2.5. Аналог Temp/

| Репозиторий | Директория | Содержимое |
|---|---|---|
| ECC | `examples/` | Сценарии проверки: evaluator-rag-prototype (candidate-playbook.md, report.json, trace.json) |
| Ruflo | `data/` | ledgers/proof-файлы (временные данные) |
| Aegis | `docs/` | BACKLOG.md (идеи на потом) |

Прямого аналога «Temp» нет ни у одного — по определению это временная область.

---

# 3. Сопоставление с целями TT3Dato

Миссия TT3Dato (Конституция, раздел 1): аудит компаний, поиск рутинных процессов, автоматизация, проектирование AI-агентов, управление знаниями, саморазвитие.

| Наша папка | Какая цель TT3Dato закрывается | Наиболее подходящий источник |
|---|---|---|
| `Blueprint/` | Архитектурные решения и планы | Aegis `docs/adr/` (ADR-формат) + ECC `docs/PLAN-PRD-PATTERN.md` |
| `Repositories/` | Управление знаниями / библиотека open-source | ECC `config/project-stack-mappings.json` + Ruflo `verification/inventory.json` |
| `External/` | Интеграция внешних решений (OmniRoute, GitHub App, Telegram) | Aegis `connectors/` (декларативный формат) + ECC `integrations/` |
| `Workflows/` | Автоматизация процессов и аудита | Ruflo `.claude/commands/workflows/` + ECC `workflows/orch-review.workflow.js` |
| `Temp/` | Временные данные экспериментов | Не заполнять; добавить в `.gitignore` |

---

# 4. Предложения, чем заполнить папки

## Blueprint/ — ADR + шаблоны планов

1. Ввести формат ADR (из Aegis `docs/adr/`) и создать первые записи:
   - `0001-четыре-домена-доверия.md` (trust-домены, кандидат Aegis);
   - `0002-верифицируемая-память.md`;
   - `0003-цикл-ECC.md` (уже в Конституции, раздел 15);
   - `0004-интеграция-OmniRoute.md` (после MVP).
2. Скопировать и адаптировать `PLAN-PRD-PATTERN.md` (ECC) как шаблон планов для агента Planner.

## Repositories/ — каталог библиотеки

1. `Repositories/README.md` — описание каталога.
2. `Repositories/stack-mappings.json` — адаптация `project-stack-mappings.json` (ECC): маппинг «задача TT3Dato -> репозиторий-решение».
3. `Repositories/inventory.json` — адаптация Ruflo `verification/inventory.json`: инвентарь доступных агентов и навыков TT3Dato.
4. Папки-досье кандидатов: `Repositories/ECC/`, `Repositories/OmniRoute/`, `Repositories/Aegis/`, `Repositories/Ruflo/` — ссылки на `Docs/Research/*` + статус (ACTIVE/CANDIDATE/MONITORING).

## External/ — коннекторы и интеграции

1. Принять декларативный формат коннектора Aegis (`manifest.json` + `SKILL.md` + `connector.json`).
2. Создать `External/README.md` с политикой интеграций (по образцу ECC `integrations/aura/README.md` + `THREAT_MODEL.md`).
3. Первые заготовки-манифесты: `External/omniroute-gateway/manifest.json` (после MVP), `External/telegram/` (кандидат, по Aegis `deploy/broker/telegram`-паттерну).

## Workflows/ — агентные процессы

1. Адаптировать цикл из Конституции (раздел 15) в конкретные workflow-файлы:
   - `Workflows/development.md` (из Ruflo `.claude/commands/workflows/development.md`);
   - `Workflows/research.md` (из Ruflo `.claude/commands/workflows/research.md`);
   - `Workflows/review.md` (из ECC `workflows/orch-review.workflow.js` — оркестрация ревью).
2. `Workflows/README.md` — описание и правила создания workflow.

## Temp/ — не заполнять

- Добавить `Temp/` в `.gitignore` (временная область). Ни у одного из репозиториев нет смыслового аналога.

---

# 5. Оценка достоверности

**High** — структуры директорий получены напрямую из GitHub API (recursive trees) трёх репозиториев; соответствие целям TT3Dato выверено по Конституции.

---

# 6. Варианты объёма (Decision Protocol)

## Вариант A — Заполнить все 5 папок (рекомендуется)

Blueprint (4 ADR + шаблон плана), Repositories (README + 2 JSON-каталога + 4 досье), External (README + политика), Workflows (3 workflow + README), Temp в .gitignore.

- Плюсы: структура становится осмысленной; закрыты роли Planner, ChiefOfStaff, DocumentationManager.
- Минусы: ~15-20 файлов, требуется адаптация каждого.

## Вариант B — Минимальный (Blueprint + Workflows)

Заполнить только Blueprint (ADR-формат) и Workflows (цикл ECC в файлах). Остальное — в Roadmap.

- Плюсы: сразу фиксирует решения и процесс; мало файлов.
- Минусы: Repositories и External остаются пустыми.

## Вариант C — Только README-заглушки

В каждую папку — только README с описанием назначения и ссылкой на источники.

- Плюсы: минимум работы, структура документирована.
- Минусы: не перенимается содержимое.

---

# 7. Источники

1. https://github.com/affaan-m/ECC (tree: docs/design, workflows, integrations, config, examples, research)
2. https://github.com/DukeDeSouth/aegis (tree: docs/adr, connectors, deploy, docs, skills)
3. https://github.com/ruvnet/ruflo (tree: .claude/workflows, .claude/commands/workflows, v3/@claude-flow/agents, verification, plugins)
