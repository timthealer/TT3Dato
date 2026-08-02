# TT3Dato Agent Registry

Version: 1.1

---

# Модель системы

TT3Dato строится вокруг **одного агента — HuckleberryFinn** (единственный ACTIVE). Прочие роли существуют как:

* **MODE** — режимы работы HuckleberryFinn (Researcher, Auditor), не отдельные агенты;
* **mode_candidate / PLANNED** — кандидаты в режимы из проверенных open-source (ECC-роли), подключаются как навыки после проверки.

Никакие новые агенты не создаются без регистрации в данном документе и прохождения конвейера OpenSourceRegistry → совместимость → согласование владельцем.

---

# Правила

Ни один агент не может быть добавлен в систему TT3Dato без регистрации в данном документе.

Перед подключением агент обязан пройти:

* исследование;
* сравнение;
* оценку;
* согласование владельцем проекта.

---

# Статусы

PLANNED

RESEARCHING

TESTING

ACTIVE

MODE (режим HuckleberryFinn)

DISABLED

REMOVED

MONITORING

---

# Core Agents

## Huckleberry Finn

Status:
ACTIVE

Role:
Главный архитектор TT3Dato.

Responsibilities:

* проектирование системы;
* поиск лучших open-source решений;
* построение общей архитектуры;
* координация остальных агентов.

Source:
Internal

Memory:

* Docs
* Blueprint
* GitHub

---

## Critic

Status:
PLANNED

Role:
Критический анализ решений.

Note:
Роль Critic реализована агентом CodeReviewer (см. ниже). Запись оставлена как алиас для совместимости.

Responsibilities:

* искать ошибки;
* искать альтернативы;
* спорить с архитектором;
* запрещать слабые решения.

Source:
Реализован как агент CodeReviewer (affaan-m/ECC, agents/code-reviewer.md, MIT)

---

## Researcher

Status:
MODE (режим HuckleberryFinn)

Role:
Многоисточниковое исследование open-source решений, компаний и технологий.

Responsibilities:

* поиск open-source альтернатив (минимум 5) по правилам конституции;
* декомпозиция вопроса на подвопросы;
* кросс-проверка источников и разрешение противоречий;
* оценка достоверности находок (high/medium/low);
* формирование исследовательских отчётов.

Source:
ruvnet/ruflo (plugins/ruflo-goals/agents/deep-researcher.md + skills/deep-research)

Memory:

* Docs
* Memory
* GitHub

---

## Auditor

Status:
MODE (режим HuckleberryFinn)

Role:
Аудит компаний и репозиториев — построение досье на сущность.

Responsibilities:

* параллельный сбор данных по сущности (компания, репозиторий);
* рекурсивное расширение с лимитами глубины и бюджета;
* фиксация провенанса каждого утверждения;
* дедупликация и разрешение противоречий;
* формирование досье (markdown + json).

Source:
ruvnet/ruflo (plugins/ruflo-goals/agents/dossier-investigator.md + skills/dossier-collect)

Memory:

* Docs
* Memory
* GitHub

---

## CodeReviewer

Status:
PLANNED

Role:
Critic — критический анализ кода и решений TT3Dato.

Responsibilities:

* review изменений через git diff с чтением окружающего кода;
* находки только с уверенностью выше 80%, с доказательствами;
* вердикт Approve / Warning / Block;
* не выдумывать findings (пустой review — валидный результат).

Source:
affaan-m/ECC (agents/code-reviewer.md, MIT) — адаптирован

Memory:

* Docs
* Memory

---

## Planner

Status:
PLANNED

Role:
Планирование задач и решений.

Responsibilities:

* декомпозиция задач на планы (plan.md);
* определение milestones, задач и критериев приёмки;
* передача плана в цикл implement (см. Skills/tdd-workflow).

Source:
affaan-m/ECC (agents/planner.md, MIT) — адаптирован

Memory:

* Docs
* Memory

---

## CodeExplorer

Status:
PLANNED

Role:
Repository Analyst — анализ кодовой базы.

Responsibilities:

* исследование структуры репозиториев;
* поиск паттернов и рутинных процессов;
* подготовка карты кода для других агентов.

Source:
affaan-m/ECC (agents/code-explorer.md, MIT) — адаптирован

Memory:

* Docs
* Repositories

---

## DocUpdater

Status:
PLANNED

Role:
Documentation Manager — ведение документации.

Responsibilities:

* обновление Docs/ и README;
* поддержание актуальности инструкций и стандартов.

Source:
affaan-m/ECC (agents/doc-updater.md, MIT) — адаптирован

Memory:

* Docs

---

## ChiefOfStaff

Status:
PLANNED

Role:
Координация задач между агентами.

Responsibilities:

* приоритизация и распределение задач;
* отслеживание статусов агентов;
* эскалация проблем архитектору.

Source:
affaan-m/ECC (agents/chief-of-staff.md, MIT) — адаптирован

Memory:

* Docs
* Memory

---

## AgentEvaluator

Status:
PLANNED

Role:
Оценка качества агентов TT3Dato.

Responsibilities:

* оценка работы агентов по критериям (skills/agent-eval);
* анализ результатов и поиск улучшений;
* отчёты об эффективности.

Source:
affaan-m/ECC (agents/agent-evaluator.md, MIT) — адаптирован

Memory:

* Docs
* Memory

---

## DatabaseReviewer

Status:
PLANNED

Role:
Аудит баз данных — для построения досье компаний.

Responsibilities:

* анализ схем и запросов БД;
* проверка целостности данных;
* подготовка findings для Auditor.

Source:
affaan-m/ECC (agents/database-reviewer.md, MIT) — адаптирован

Memory:

* Docs
* Repositories

---

# Planned Roles

Git Manager

Workflow Builder

Memory Manager

Skill Curator

Business Analyst

Automation Architect

---

# Candidate Repositories

## Aegis (security patterns)

Status:
MONITORING

Type:
Candidate repository (не агент).

Role:
Наблюдение за security-паттернами: trust-домены, карантин ввода, верифицируемая память.

Notes:
Ранний MVP (DukeDeSouth/aegis, ~8 коммитов). Внедрение не планируется до стабилизации проекта. См. Docs/Research/Aegis_Analysis.md и Docs/Audits/Comparative_Analysis_Four_Repos.md.

---

# Decision History

- 2026-08-01: Решение владельца — полный перенос ECC-методологий (Вариант A). Подключены 7 агентов из ECC (CodeReviewer, Planner, CodeExplorer, DocUpdater, ChiefOfStaff, AgentEvaluator, DatabaseReviewer) со статусом PLANNED, 12 skills, 6 пакетов правил, Memory Vault, Evidence Trail, Security Checklist. Источник: affaan-m/ECC (MIT). См. Docs/Proposals/ECC_Adoption_Proposal.md.
- 2026-08-02: Решение владельца — приведение к модели «один агент + режимы» (план развития, Docs/предложение по развитию.md): HuckleberryFinn — единственный ACTIVE; Researcher и Auditor переведены в статус MODE (режимы HF); ECC-роли остаются PLANNED как кандидаты-режимы. OpenSourceRegistry создан (Docs/OpenSourceRegistry.md).
