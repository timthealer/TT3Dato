# OpenSourceRegistry и модель «один агент + режимы»

> Источник: https://github.com/affaan-m/ECC (MIT). Адаптировано для TT3Dato.

---

- id: MEM-0002
- date: 2026-08-02
- scope: project
- source: Docs/предложение по развитию.md, Docs/OpenSourceRegistry.md, выгрузка GPT-чата владельца
- status: verified
- tags: [architecture, agent-registry, open-source-first, modes]

---

# Модель системы и энциклопедия решений

TT3Dato развивается не через создание отдельных агентов, а через конвейер импорта проверенных open-source компонентов. Один агент — HuckleberryFinn; Researcher и Auditor — его режимы; ECC-роли — кандидаты в режимы.

## Контекст

Владелец зафиксировал (GPT-чат): «настоящий MVP — HuckleberryFinn, который умеет искать/читать/думать/писать; Researcher и Auditor — режимы работы, не агенты; TT3Dato никогда не создаёт агента первым». Из этого выведено: создать `Docs/OpenSourceRegistry.md` (энциклопедия решений по методологии sindresorhus/awesome) и привести `Agents/` к модели «один агент + режимы».

## Подтверждение

- Решение зафиксировано в `Docs/предложение по развитию.md` и принято владельцем («выполняй пункты 1-4»).
- `Docs/OpenSourceRegistry.md` создан: первые записи ruflo/ecc/omniroute/aegis/awesome.
- `Agents/` приведены в соответствие: HF единственный ACTIVE, Researcher/Auditor — MODE, ECC-роли — mode_candidate/PLANNED (state.json, Agent Registry, Agent_Permissions, inventory.json).

## Последствия

- Новые роли появляются только через конвейер: OpenSourceRegistry → совместимость → согласование → импорт как режим/навык.
- Не создавать папок-агентов «на будущее».
- Источник истины по ролям: `Docs/Agent Registry`; по решениям: `Docs/OpenSourceRegistry.md`.

## Продвижение

- `Docs/Agent Registry` (раздел «Модель системы», статусы MODE).
- `Docs/OpenSourceRegistry.md` (реестр решений).
- `Docs/предложение по развитию.md` (план).
