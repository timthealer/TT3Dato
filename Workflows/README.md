# Workflows

Каталог агентных рабочих процессов TT3Dato. Каждый workflow реализует цикл из Конституции, раздел 15:

`plan -> test -> implement -> review -> verify -> remember -> improve`

## Правила создания workflow

1. Каждый workflow — Markdown-файл с последовательностью шагов, владельцем (агент) и выходным артефактом.
2. Выходной артефакт фиксируется по правилам Evidence Trail (см. `Logs/README.md`, `Tests/README.md`).
3. Итоги каждого шага сохраняются в `Memory/` (формат `ecc.memory.v1`, статус unverified/verified).
4. Источники методологии указываются в шапке файла (атрибуция, см. `Docs/ATTRIBUTIONS.md`).

## Список

| Workflow | Назначение | Владелец | Статус |
|---|---|---|---|
| `development.md` | Разработка и улучшение кода/конфигурации | Planner, CodeReviewer | ACTIVE |
| `research.md` | Многоисточниковое исследование | Researcher | ACTIVE |
| `review.md` | Оркестрация критического анализа | CodeReviewer | ACTIVE |
