# Development Workflow

> Источник методологии: https://github.com/ruvnet/ruflo (MIT, `.claude/commands/workflows/development.md`) + https://github.com/affaan-m/ECC (MIT). Адаптировано для TT3Dato.

Реализует цикл Конституции (раздел 15): plan -> test -> implement -> review -> verify -> remember -> improve.

## Шаги

### 1. Plan (агент Planner)

- Получить или создать PRD (`Blueprint/prds/{name}.prd.md`) по шаблону `Blueprint/PLAN-PRD-PATTERN.md`;
- Создать план (`Blueprint/plans/{name}.plan.md`): файлы, паттерны, задачи, команды валидации.

Артефакт: `Blueprint/plans/*.plan.md`

### 2. Test (Skills/tdd-workflow)

- Написать падающий тест (RED) до реализации;
- Зафиксировать свидетельство RED в `Tests/`.

Артефакт: `Tests/` + evidence RED.

### 3. Implement

- Реализовать минимальный diff до прохождения теста (GREEN);
- Зафиксировать свидетельство GREEN.

### 4. Review (агент CodeReviewer)

- Свежий контекст, не автор;
- Находки только с уверенностью выше 80%, с доказательствами;
- Вердикт Approve / Warning / Block (Workflow `review.md`).

### 5. Verify

- Прогнать build, lint, typecheck, тесты (детерминированные проверки, `Tests/README.md`);
- Подтвердить корректность.

### 6. Remember

- Сохранить решение и опыт в `Memory/` (формат `ecc.memory.v1`, статус unverified);
- Верифицированные знания продвигаются в документы (ADR-0002).

### 7. Improve

- На основе опыта улучшить workflow/навыки;
- Обновить инвентарь (`Repositories/inventory.json`).

## Связь с агентами

| Шаг | Агент | Выход |
|---|---|---|
| plan | Planner | `Blueprint/plans/*.plan.md` |
| test/implement | tdd-workflow | код + тесты |
| review | CodeReviewer | вердикт |
| remember | Memory Vault | `Memory/*` |
