# Команды

Все команды выполняются из корня проекта `TT3DatoE/`.

## Установка

```bash
npm install
```

## Разработка

```bash
npm run dev
```

Запускает Vite dev-сервер с hot-reload на :5173. В этой среде адрес должен быть
доступен через превью (см. скилл `deploy-preview`). `vite.config.ts` уже содержит
`allowedHosts` для `.monkeycode-ai.live` и прокси `/v1` → `http://localhost:20128`.

## Проверка (обязательно после изменений)

```bash
npm run build
npm run lint
```

- `npm run build` — `tsc -b && vite build`. Если есть ошибки типов — исправь их.
- `npm run lint` — `oxlint`. Ошибки правил тоже нужно исправлять.

## Продакшн-сборка

```bash
npm run preview
```

Показывает собранную `dist/` локально.

## Быстрая проверка

```bash
npm run build && npm run lint
```
