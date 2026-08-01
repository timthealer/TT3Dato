---
name: agent-eval
description: Попарное сравнение агентов кодирования (Claude Code, Aider, Codex и т.д.) на собственных задачах с метриками pass rate, стоимости, времени и стабильности.
license: MIT
metadata:
  origin: ECC
tools: Read, Write, Edit, Bash, Grep, Glob
---

> Источник: https://github.com/affaan-m/ECC (MIT). Адаптировано для TT3Dato.

# Skill Agent Eval

Лёгкий CLI-инструмент для попарного сравнения агентов кодирования на воспроизводимых задачах. Каждое сравнение "какой агент кодирования лучший?" основано на ощущениях — этот инструмент его систематизирует.

## Когда активировать

- Сравнение агентов кодирования (Claude Code, Aider, Codex и т.д.) на вашей собственной кодовой базе
- Измерение производительности агента перед принятием нового инструмента или модели
- Запуск регрессионных проверок, когда агент обновляет свою модель или инструментарий
- Создание обоснованных данными решений о выборе агента для команды

## Установка

> **Примечание:** Установите agent-eval из его репозитория после просмотра исходного кода.

## Основные концепции

### YAML Task Definitions

Определяйте задачи декларативно. Каждая задача задаёт, что делать, какие файлы затрагивать и как судить об успехе:

```yaml
name: add-retry-logic
description: Add exponential backoff retry to the HTTP client
repo: ./my-project
files:
  - src/http_client.py
prompt: |
  Add retry logic with exponential backoff to all HTTP requests.
  Max 3 retries. Initial delay 1s, max delay 30s.
judge:
  - type: pytest
    command: pytest tests/test_http_client.py -v
  - type: grep
    pattern: "exponential_backoff|retry"
    files: src/http_client.py
commit: "abc1234"  # pin to specific commit for reproducibility
```

### Изоляция через Git Worktree

Каждый запуск агента получает собственный git worktree — Docker не требуется. Это обеспечивает изоляцию для воспроизводимости: агенты не могут мешать друг другу или повредить базовый репозиторий.

### Собираемые метрики

| Метрика | Что измеряет |
|-----------------|-----------------|
| Pass rate | Произвёл ли агент код, проходящий судью? |
| Cost | Расходы на API на задачу (когда доступно) |
| Time | Секунды до завершения (wall-clock) |
| Consistency | Pass rate по повторным запускам (например, 3/3 = 100%) |

## Рабочий процесс

### 1. Определите задачи

Создайте каталог `tasks/` с YAML-файлами, по одному на задачу:

```bash
mkdir tasks
# Write task definitions (see template above)
```

### 2. Запустите агентов

Выполните агентов против ваших задач:

```bash
agent-eval run --task tasks/add-retry-logic.yaml --agent claude-code --agent aider --runs 3
```

Каждый запуск:
1. Создаёт свежий git worktree из указанного коммита
2. Передаёт промпт агенту
3. Запускает критерии судьи
4. Записывает pass/fail, cost и time

### 3. Сравните результаты

Сгенерируйте отчёт сравнения:

```bash
agent-eval report --format table
```

```
Task: add-retry-logic (3 runs each)
┌──────────────┬───────────┬────────┬────────┬─────────────┐
│ Agent        │ Pass Rate │ Cost   │ Time   │ Consistency │
├──────────────┼───────────┼────────┼────────┼─────────────┤
│ claude-code  │ 3/3       │ $0.12  │ 45s    │ 100%        │
│ aider        │ 2/3       │ $0.08  │ 38s    │  67%        │
└──────────────┴───────────┴────────┴────────┴─────────────┘
```

## Типы судей

### Кодовые (детерминированные)

```yaml
judge:
  - type: pytest
    command: pytest tests/ -v
  - type: command
    command: npm run build
```

### Паттерн-основанные

```yaml
judge:
  - type: grep
    pattern: "class.*Retry"
    files: src/**/*.py
```

### Модельные (LLM-as-judge)

```yaml
judge:
  - type: llm
    prompt: |
      Does this implementation correctly handle exponential backoff?
      Check for: max retries, increasing delays, jitter.
```

## Лучшие практики

- **Начните с 3-5 задач**, представляющих вашу реальную нагрузку, а не игрушечные примеры
- **Запускайте минимум 3 пробы** на агента, чтобы уловить вариативность — агенты недетерминированы
- **Зафиксируйте коммит** в вашем task YAML, чтобы результаты были воспроизводимы через дни/недели
- **Включите минимум одного детерминированного судью** (тесты, сборку) на задачу — LLM-судьи добавляют шум
- **Отслеживайте cost наряду с pass rate** — агент с 95% при 10-кратной стоимости может быть неверным выбором
- **Версионируйте ваши task definitions** — это тестовые фикстуры, обращайтесь с ними как с кодом

## Ссылки

- Repository: [github.com/joaquinhuigomez/agent-eval](https://github.com/joaquinhuigomez/agent-eval)
