# ECC Analysis

**Репозиторий:** `affaan-m/ECC`
**Дата исследования:** 2026-08-01
**Исследователь:** Researcher (deep-researcher, адаптация из ruvnet/ruflo)
**Способ получения данных:** GitHub REST API + README (без клонирования)

---

# 1. Метаданные (GitHub API, 2026-08-01)

| Параметр | Значение |
|---|---|
| Stars | 236 636 |
| Forks | 35 983 |
| Open issues | 114 |
| Коммиты | ~2 335 |
| Лицензия | MIT |
| Язык | JavaScript |
| Repo ID | 1136590548 |
| Homepage | ecc.tools |

---

# 2. Что это

ECC (Enterprise Code Companion) — агентный харнесс и фреймворк для разработки через AI-агентов. Работает как CLI-инструмент и как GitHub App (`ecc-tools`), поддерживает основные агентные среды (Claude Code, Codex, OpenCode, Cursor).

---

# 3. Ключевые возможности

- **Цикл разработки:** `plan -> test -> implement -> review -> verify -> remember -> improve`. Ключевая особенность — память о прошлых решениях и улучшение процесса на основе опыта.
- **Память и контекст:** сохраняет решения, шаблоны и ошибки между сессиями.
- **Режимы:** локальный CLI и удалённый GitHub App (`ECC Pro`).
- **ECC Pro:** приватные репозитории, ~$19/место/мес.
- **Компоненты:** 67 агентов, 281 навык (skill), 94 команды; языки контекста — Shell, TypeScript, Python, Go, Java, Perl.
- **Интеграции:** Claude Code, Codex, OpenCode, Cursor.
- **Пакеты:** `ecc-universal`, `ecc-agentshield`.

---

# 3.1. Детальные особенности (полный README, 2026-08-01)

## Философия

> «Optimize the context window. Persist everything else.»

Цикл — это работающая система со «следом доказательств» (evidence trail): план, падающий тест, прошедший тест, находки ревью, финальная проверка. Результат — не только код, а вся цепочка доказательств.

## Компоненты

| Компонент | Что даёт | Поведение контекста |
|---|---|---|
| Skills | Переиспользуемые рабочие процессы (TDD, security review, deep research) | Загружаются по задаче |
| Agents | Ограниченные исполнители со своими правами и контекстом | Изолируют plan/implement/review |
| Rules | Постоянные стандарты по языку или проекту | Всегда загружены — ставить выборочно |
| Hooks | Скрипты на событиях харнесса | Работают вне контекста модели |
| Instincts | Паттерны из реальных сессий с confidence-оценкой | Вызываются по релевантности |

## Ключевые подсистемы

- **AgentShield** — аудитор безопасности конфигов агентов (создан на Claude Code Hackathon, Cerebral Valley x Anthropic, Feb 2026): 1282 теста, 98% покрытия, 102 правила стат. анализа. Сканирует CLAUDE.md, settings.json, MCP-конфиги, hooks, agent definitions по 5 категориям: секреты (14 паттернов), permission-аудит, hook-инъекции, MCP-риски, конфиг агентов. Флаг `--opus` запускает 3 агентов Opus 4.6 в конвейере red-team / blue-team / auditor.
- **Memory Vault** — единый inspectable Markdown-формат памяти между харнессами (`ecc.memory.v1`), сценарии handoff (Claude <-> Codex <-> Hermes). Проектная память в `.ecc/memory/`, пользовательская в `~/.ecc/memory/`. Память — «unreviewed context», не исполнимая политика.
- **Plan Canvas** (ECC 2.1) — ревью планов в браузере: клик по части плана, аннотации, чат, Approve / Request changes; Mermaid-диаграммы рендерятся вживую. Харнесс-агностичный CLI.
- **TDD workflow** — gated RED -> GREEN -> REFACTOR с фиксацией свидетельств.
- **Cross-harness** — установка в 12+ харнессов (Claude Code, Codex, Cursor, OpenCode, Gemini, Zed, Kimi, Hermes, OpenClaw, Copilot, Qwen, Antigravity...).
- **Непрерывное обучение v2 (instincts)** — confidence-оценка, импорт/экспорт, эволюция.
- **Selective install** — манифест-driven установка только нужных компонентов.
- **Self-hosted compute** — запуск моделей на GPU через спонсора Itô Markets.

## Монетизация OSS

Репозиторий вечно MIT. Платный только hosted GitHub App `ECC Pro` (приватные репо, $19/место/мес). Спонсоры: CodeRabbit, Greptile, Atlas Cloud, Moonshot AI (Kimi), Itô Markets.

---

# 3.2. Чем отличается от похожих репозиториев

| Критерий | ECC | Типичные аналоги (в т.ч. Ruflo) |
|---|---|---|
| Целостность | Полная система plan->test->implement->review->verify->remember->improve с evidence-трейлом | Набор инструментов/агентов без цельного цикла |
| Ревью | Свежий контекст ревьюера, отдельный от автора | Код пишет и ревьюит одна сессия |
| Память | First-class: instincts + Memory Vault + remember->improve | Часто просто сохранение транскрипта |
| Безопасность | AgentShield сканирует сам харнесс как attack surface | Не рассматривают конфиг агента как поверхность атаки |
| Hooks | Детерминированные проверки вне промпта | Нет |
| Портативность | 12+ харнессов | Обычно заточен под одну среду |
| Контекст | Rules выборочно + Skills по требованию | Зачастую «всё в сессию» |

# 3.3. Хакатон и автор

- **AgentShield** построен на Claude Code Hackathon (Cerebral Valley x Anthropic, Feb 2026). 1282 теста, 98% покрытия, 102 правила.
- Автор (affaan-m) ранее выиграл Anthropic x Forum Ventures hackathon (Sep 2025) с проектом zenith.chat, построенным целиком на agentic-процессах.
- Причины успеха AgentShield: новая ниша (безопасность конфигов агентов), продакшен-качество (тесты + CI + exit code для build gates), работа из коробки (`npx ... scan`), адверсариальный подход (3 агента Opus), трек-рекорд автора.

---

# 4. Архитектура (в контексте TT3Dato)

- Цикл `plan -> test -> implement -> review -> verify -> remember -> improve` напрямую повторяет идею TT3Dato «постоянное самоулучшение» (Конституция, раздел 11).
- Концепция «remember -> improve» совпадает с памятью TT3Dato (Obsidian + GitHub + Agent Registry).
- Установка всего ECC не требуется — ценно заимствование цикла и структуры навыков (skills/).

---

# 5. Метрики активности

- Очень высокая популярность: 236.6k звёзд, 35.9k форков — один из самых популярных агентных харнессов.
- ~2 335 коммитов, 114 открытых issues — активная, но более стабильная фаза.
- MIT-лицензия — свободная адаптация.

---

# 6. Релевантность для TT3Dato

| Аспект | Оценка |
|---|---|
| Цикл plan->test->implement->review->verify->remember->improve | Высокая — методологическая основа |
| Концепция памяти и «remember -> improve» | Высокая — совпадает с идеей TT3Dato |
| ECC Pro / GitHub App | Средняя — платная модель, для TT3Dato не критична |
| Полная установка | Низкая — не требуется, ценность в методологии |

---

# 7. Оценка достоверности (Research)

**High** — данные получены из официального GitHub API и README репозитория; метрики подтверждаются двумя независимыми источниками.

---

# 8. Источники

1. https://github.com/affaan-m/ECC
2. https://api.github.com/repos/affaan-m/ECC (метаданные, commits)
3. https://ecc.tools
