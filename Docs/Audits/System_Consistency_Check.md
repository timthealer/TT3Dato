# System Consistency Check

**Проверка:** внутренняя непротиворечивость системы TT3Dato
**Дата:** 2026-08-01
**Аудитор:** Huckleberry Finn
**Метод:** перекрёстная сверка всех файлов: Agent Registry, Agent_Permissions, state.json/config.yaml агентов, каталоги Repositories/External/Workflows/Skills/Blueprint, Docs/*, Memory/README.

## Статус исправлений

По решению владельца (2026-08-01) устранены противоречия 1-7:

- П1: запись Critic отмечена как алиас агента CodeReviewer;
- П2: Agent_Permissions дополнен 7 новыми агентами;
- П3: ATTRIBUTIONS дополнен недостающими кластерами (Blueprint, Workflows, Repositories, External), подсчёт исправлен на 56 файлов;
- П4: «Planned Roles» очищен от уже зарегистрированных агентов;
- П5: «Missing Roles» удалён (Ruflo исследован и занесён);
- П6: статусы Researcher и Auditor изменены на ACTIVE;
- П7: state.json HuckleberryFinn обновлён (все агенты и репозитории).

Противоречия 8-12 (слабые) остаются открытыми по решению владельца.

---

# Часть 1. Описание системы (что у нас есть)

## Общая картина

TT3Dato — конфигурационная база знаний и методологий (Markdown + JSON), а не исполняемый код. Ни один файл не запускается как программа; это «чертежи» для построения интеллектуальной операционной системы TOS (Конституция).

## 1.1. Ядро

| Файл | Назначение |
|---|---|
| `Docs/TT3Dato_Constitution.md` | Конституция: миссия, принципы, 15 разделов (включая цикл ECC, раздел 15) |
| `Docs/Agent Registry` | Реестр: 11 записей Core Agents + статусы + кандидаты + Decision History |
| `Docs/Agent_Permissions` | Права доступа агентов (READ/WRITE/FORBIDDEN) |
| `Docs/Roadmap.md` | Дорожная карта: MVP / После MVP / Исследование |

## 1.2. Агенты (10 директорий, 30 файлов)

| Агент | Роль | Статус (реестр) | Статус (state.json) | Источник |
|---|---|---|---|---|
| HuckleberryFinn | Архитектор | ACTIVE | idle | Internal |
| Researcher | Исследование | PLANNED | idle | ruvnet/ruflo |
| Auditor | Аудит компаний | PLANNED | idle | ruvnet/ruflo |
| CodeReviewer | Critic | PLANNED | PLANNED | affaan-m/ECC |
| Planner | Планирование | PLANNED | PLANNED | affaan-m/ECC |
| CodeExplorer | Repository Analyst | PLANNED | PLANNED | affaan-m/ECC |
| DocUpdater | Documentation Manager | PLANNED | PLANNED | affaan-m/ECC |
| ChiefOfStaff | Координация | PLANNED | PLANNED | affaan-m/ECC |
| AgentEvaluator | Оценка агентов | PLANNED | PLANNED | affaan-m/ECC |
| DatabaseReviewer | Аудит БД | PLANNED | PLANNED | affaan-m/ECC |

Каждый агент: `system.md` + `config.yaml` (включая permissions) + `state.json`.

## 1.3. Навыки и правила

- 12 навыков в `Skills/<name>/SKILL.md` (tdd-workflow, deep-research, security-review, context-budget, unified-memory, search-first, cost-aware-llm-pipeline, documentation-lookup, agent-eval, market-research, parallel-execution-optimizer, agent-harness-construction);
- 6 пакетов правил в `Skills/rules/` (agents, code-review, coding-style, development-workflow, git-workflow, hooks).

## 1.4. Рабочие процессы

`Workflows/`: README + development.md, research.md, review.md (цикл ECC: plan->test->implement->review->verify->remember->improve).

## 1.5. Память

`Memory/`: README.md (стандарт `ecc.memory.v1`, статусы unverified/verified) + шаблон записи. Продвижение знаний в governed-документы (Конституция, раздел 9).

## 1.6. Blueprint (архитектурные решения)

4 ADR (четыре домена доверия, верифицируемая память, цикл ECC, интеграция OmniRoute) + шаблон PLAN-PRD-PATTERN.

## 1.7. Библиотека репозиториев

`Repositories/`: README (статусы), stack-mappings.json, inventory.json, досье Ruflo/ECC/OmniRoute/Aegis.

## 1.8. Интеграции

`External/`: README (политика + формат коннектора), манифесты omniroute-gateway (CANDIDATE) и telegram (CANDIDATE).

## 1.9. Документация исследований и аудитов

- `Docs/Research/`: Ruflo, ECC, OmniRoute, Aegis (4 отчёта);
- `Docs/Audits/`: Comparative_Analysis_Four_Repos, Agent_Config_Security_Checklist, Empty_Directories_Fill_Analysis, System_Consistency_Check (этот);
- `Docs/Proposals/`: Integration_Proposals, ECC_Adoption_Proposal;
- `Docs/ATTRIBUTIONS.md`: реестр заимствований из ECC/Ruflo/Aegis.

## 1.10. Инфраструктурные

- `Logs/README.md` — evidence trail (процессные следы);
- `Tests/README.md` — детерминированные проверки (концепция hooks);
- `.gitignore` — Temp/, node_modules, секреты.

---

# Часть 2. Найденные противоречия

## Противоречие 1 (критичное). Дублирование роли Critic

- В `Docs/Agent Registry` есть Core Agent **Critic** (Status: PLANNED, Source: «To be selected») — БЕЗ директории `Agents/Critic/`.
- Агент **CodeReviewer** (директория существует) имеет role «Critic».
- Два агента претендуют на одну роль; запись Critic «висит» без реализации.

## Противоречие 2 (критичное). Agent_Permissions не покрывает 7 новых агентов

- `Docs/Agent_Permissions` описывает только Huckleberry Finn, Researcher, Auditor.
- 7 новых агентов имеют permissions в `config.yaml`, но отсутствуют в документе прав.

## Противоречие 3 (среднее). ATTRIBUTIONS: арифметика не сходится

- Заявлено «Создано 30 файлов», но по списку самого документа: 6 правил + 12 навыков + 7 агентов × 3 файла + 2 Memory + 2 Evidence + 1 checklist = **44 файла**.

## Противоречие 4 (среднее). «Planned Roles» дублирует Core Agents

- В `Docs/Agent Registry` раздел «Planned Roles» повторяет уже зарегистрированных агентов: Researcher, Auditor, CodeReviewer, Planner, CodeExplorer, DocUpdater, ChiefOfStaff, AgentEvaluator, DatabaseReviewer, Repository Analyst, Documentation Manager.

## Противоречие 5 (среднее). Устаревший плейсхолдер «Missing Roles»

- «(будет заполняться после исследования Ruflo)» — Ruflo давно исследован (Docs/Research/Ruflo_Analysis.md).

## Противоречие 6 (среднее). Статусы Researcher/Auditor занижены

- В реестре Researcher/Auditor = PLANNED, в state.json = idle, но фактически оба агента использованы (создали 4 исследовательских отчёта). Статусы не отражают реальность.

## Противоречие 7 (среднее). state.json HuckleberryFinn устарел

- `known_agents` содержит только Researcher/Auditor (нет 7 новых агентов);
- `known_repositories` пуст, хотя `Repositories/` заполнен.

## Противоречие 8 (слабое). Workflows ACTIVE, владельцы PLANNED

- `Workflows/README` помечает development/research/review как ACTIVE, но агенты-владельцы (Planner, CodeReviewer, Researcher) — PLANNED.

## Противоречие 9 (слабое). Разные словари статусов

- state.json использует «idle», реестр — PLANNED/ACTIVE/MONITORING. Словари не унифицированы.

## Противоречие 10 (слабое). Permissions ссылаются на несуществующие каталоги

- READ «Projects» и «Knowledge» — таких директорий нет (реально есть Docs, Memory, Skills, Repositories, Blueprint, External, Workflows, Tests, Logs).

## Противоречие 11 (слабое). Roadmap MVP не отражает полный перенос ECC

- Раздел MVP упоминает только «Researcher, Auditor, Huckleberry Finn» и 4 отчёта; полный перенос ECC (7 агентов, 12 навыков, правила, память) не зафиксирован.

## Противоречие 12 (слабое). Decision History неполный

- Зафиксировано только решение по ECC; не зафиксированы: наблюдение Aegis, заполнение пустых папок (Вариант A).

---

# Часть 3. Рекомендации

| # | Противоречие | Рекомендация | Приоритет |
|---|---|---|---|
| 1 | Critic vs CodeReviewer | Связать: обновить запись Critic (Source: CodeReviewer, affaan-m/ECC) или удалить дубль | Высокий |
| 2 | Agent_Permissions | Добавить секции для 7 новых агентов (взять из config.yaml) | Высокий |
| 3 | ATTRIBUTIONS подсчёт | Исправить на 44 файла | Средний |
| 4 | Planned Roles дубль | Очистить раздел от уже зарегистрированных агентов | Средний |
| 5 | Missing Roles | Заполнить актуальными ролями (Git Manager, Skill Curator, Business Analyst...) или удалить | Средний |
| 6 | Статусы Researcher/Auditor | Проставить ACTIVE или TESTING | Средний |
| 7 | state.json HuckleberryFinn | Обновить known_agents (10 агентов) и known_repositories | Средний |
| 8 | Workflows vs владельцы | Согласовать статусы (например, ACTIVE — методология внедрена, агенты PLANNED) | Слабый |
| 9 | Словари статусов | Унифицировать или задокументировать (registry=lifecycle, state=runtime) | Слабый |
| 10 | Permissions каталоги | Привести к фактическим каталогам или задокументировать как абстракции | Слабый |
| 11 | Roadmap MVP | Добавить пункт «Полный перенос ECC-методологий (выполнено)» | Слабый |
| 12 | Decision History | Дополнить записями по Aegis и заполнению папок | Слабый |

---

# Заключение

Система в целом непротиворечива по данным (метрики репозиториев, статусы кандидатов, атрибуция источников сходятся). Найдены 12 противоречий документации: 2 критичных (дубль Critic, неполный Agent_Permissions), 5 средних, 5 слабых. Противоречий данных (метрики/факты) не обнаружено.

Ожидается решение: исправить все 12 / только критичные / оставить как есть.
