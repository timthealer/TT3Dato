# tools — MCP-инструменты

Источник: [atomic-agent](https://github.com/Doriandarko/atomic-agent) (local-first архитектура).

```
tools/
├── browser/      # Браузер с ARIA snapshots
├── filesystem/   # Работа с файлами
└── shell/        # Исполнение команд
```

## Что скопировано

- **browser/**: `read-aria.ts`, `aria-compressor.ts`, `capture-world-snapshot.ts`,
  `playwright-backend.ts`, `navigate.ts`, `click.ts`, `type.ts`, `tabs.ts`, `search.ts`, `spawn-chrome.ts`.
- **filesystem/**: `fs-*` (list/read/write/edit/patch/glob/grep/hash/diff/watch/trash),
  `read-document/` (pdf, docx, xlsx, pptx, odt, rtf), `web-fetch` (с SSRF-guard), `http-request`.
- **shell/**: `shell.ts`, `shell-command-guard/` (правила safe/hardline/dangerous),
  `proc/` (список и kill процессов), `git/`, `expand-shell-glob-args.ts`.

## ARIA snapshots

Браузерный инструмент делает ARIA-снимок страницы (доступность-дерево) вместо скриншотов —
экономно по токенам и надёжно для чтения состояния UI агентом.
