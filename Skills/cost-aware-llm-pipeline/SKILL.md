---
name: cost-aware-llm-pipeline
description: Паттерны оптимизации затрат при использовании LLM API — маршрутизация моделей по сложности задачи, отслеживание бюджета, логика повторов и кэширование промптов.
metadata:
  origin: ECC
---

> Источник: https://github.com/affaan-m/ECC (MIT). Адаптировано для TT3Dato.

# Cost-Aware LLM Pipeline

Паттерны контроля затрат на LLM API при сохранении качества. Сочетает маршрутизацию моделей, отслеживание бюджета, логику повторов и кэширование промптов в компонуемый конвейер.

## Когда активировать

- Создание приложений, вызывающих LLM API (Claude, GPT и т.д.)
- Обработка пакетов элементов с разной сложностью
- Необходимость уложиться в бюджет расходов на API
- Оптимизация затрат без потери качества на сложных задачах

## Основные концепции

### 1. Маршрутизация моделей по сложности задачи

Автоматически выбирайте более дешёвые модели для простых задач, оставляя дорогие для сложных.

```python
MODEL_SONNET = "claude-sonnet-4-6"
MODEL_HAIKU = "claude-haiku-4-5-20251001"

_SONNET_TEXT_THRESHOLD = 10_000  # chars
_SONNET_ITEM_THRESHOLD = 30     # items

def select_model(
    text_length: int,
    item_count: int,
    force_model: str | None = None,
) -> str:
    """Select model based on task complexity."""
    if force_model is not None:
        return force_model
    if text_length >= _SONNET_TEXT_THRESHOLD or item_count >= _SONNET_ITEM_THRESHOLD:
        return MODEL_SONNET  # Complex task
    return MODEL_HAIKU  # Simple task (3-4x cheaper)
```

### 2. Неизменяемое отслеживание затрат

Отслеживайте совокупные расходы с помощью замороженных dataclass'ов. Каждый вызов API возвращает новый трекер — состояние никогда не мутируется.

```python
from dataclasses import dataclass

@dataclass(frozen=True, slots=True)
class CostRecord:
    model: str
    input_tokens: int
    output_tokens: int
    cost_usd: float

@dataclass(frozen=True, slots=True)
class CostTracker:
    budget_limit: float = 1.00
    records: tuple[CostRecord, ...] = ()

    def add(self, record: CostRecord) -> "CostTracker":
        """Return new tracker with added record (never mutates self)."""
        return CostTracker(
            budget_limit=self.budget_limit,
            records=(*self.records, record),
        )

    @property
    def total_cost(self) -> float:
        return sum(r.cost_usd for r in self.records)

    @property
    def over_budget(self) -> bool:
        return self.total_cost > self.budget_limit
```

### 3. Узкая логика повторов

Повторяйте только при транзиентных ошибках. Быстро падайте при ошибках аутентификации или плохих запросов.

```python
from anthropic import (
    APIConnectionError,
    InternalServerError,
    RateLimitError,
)

_RETRYABLE_ERRORS = (APIConnectionError, RateLimitError, InternalServerError)
_MAX_RETRIES = 3

def call_with_retry(func, *, max_retries: int = _MAX_RETRIES):
    """Retry only on transient errors, fail fast on others."""
    for attempt in range(max_retries):
        try:
            return func()
        except _RETRYABLE_ERRORS:
            if attempt == max_retries - 1:
                raise
            time.sleep(2 ** attempt)  # Exponential backoff
    # AuthenticationError, BadRequestError etc. → raise immediately
```

### 4. Кэширование промптов

Кэшируйте длинные системные промпты, чтобы не отправлять их заново при каждом запросе.

```python
messages = [
    {
        "role": "user",
        "content": [
            {
                "type": "text",
                "text": system_prompt,
                "cache_control": {"type": "ephemeral"},  # Cache this
            },
            {
                "type": "text",
                "text": user_input,  # Variable part
            },
        ],
    }
]
```

## Композиция

Объедините все четыре техники в одной функции конвейера:

```python
def process(text: str, config: Config, tracker: CostTracker) -> tuple[Result, CostTracker]:
    # 1. Route model
    model = select_model(len(text), estimated_items, config.force_model)

    # 2. Check budget
    if tracker.over_budget:
        raise BudgetExceededError(tracker.total_cost, tracker.budget_limit)

    # 3. Call with retry + caching
    response = call_with_retry(lambda: client.messages.create(
        model=model,
        messages=build_cached_messages(system_prompt, text),
    ))

    # 4. Track cost (immutable)
    record = CostRecord(model=model, input_tokens=..., output_tokens=..., cost_usd=...)
    tracker = tracker.add(record)

    return parse_result(response), tracker
```

## Справочник цен (2025-2026)

| Модель | Вход ($/1M токенов) | Выход ($/1M токенов) | Относительная стоимость |
|-------|---------------------|----------------------|---------------|
| Haiku 4.5 | $0.80 | $4.00 | 1x |
| Sonnet 4.6 | $3.00 | $15.00 | ~4x |
| Opus 4.5 | $15.00 | $75.00 | ~19x |

## Лучшие практики

- **Начинайте с самой дешёвой модели** и маршрутизируйте на дорогие только при достижении порогов сложности
- **Устанавливайте явные лимиты бюджета** перед обработкой пакетов — падайте рано, а не перерасходуйте
- **Логируйте решения о выборе модели**, чтобы настраивать пороги на основе реальных данных
- **Используйте кэширование промптов** для системных промптов длиннее 1024 токенов — экономит и затраты, и задержку
- **Никогда не повторяйте при ошибках аутентификации или валидации** — только транзиентные сбои (сеть, rate limit, ошибка сервера)

## Анти-паттерны, которых следует избегать

- Использование самой дорогой модели для всех запросов независимо от сложности
- Повтор всех ошибок (тратит бюджет на постоянные сбои)
- Мутация состояния отслеживания затрат (затрудняет отладку и аудит)
- Хардкодинг имён моделей по всей кодовой базе (используйте константы или конфиг)
- Игнорирование кэширования промптов для повторяющихся системных промптов

## Когда использовать

- Любое приложение, вызывающее Claude, OpenAI или аналогичные LLM API
- Конвейеры пакетной обработки, где затраты быстро растут
- Многомодельные архитектуры, требующие интеллектуальной маршрутизации
- Продакшен-системы, которым нужны бюджетные ограничители
