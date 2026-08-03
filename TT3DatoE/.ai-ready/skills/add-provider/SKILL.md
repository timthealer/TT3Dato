# Skill: add-provider

Добавить нового бесплатного LLM-провайдера в TT3DatoE.

## Когда использовать

Когда нужно подключить новый бесплатный сервис (например, новый провайдер
OpenAI-совместимого API) к роутеру приложения.

## Шаги

### 1. Определи параметры провайдера

- OpenAI-совместимый base URL (с `.../v1`).
- Список бесплатных моделей и их сильные стороны: coding / reasoning / chat / fast.
- Ссылка, где пользователь получает бесплатный ключ.

### 2. `src/types.ts`

- Добавь id в union `ProviderId` (или `Exclude<ProviderId, "custom">` где нужно).
- Добавь запись в `PROVIDER_META`: `name`, `tagline`, `signup`, `baseUrl`,
  `models` (каждая модель: `id`, `label`, `tasks`, `quality` 1-5).
- Добавь дефолтную запись в `DEFAULT_PROVIDERS` (apiKey: "", enabled: false).

### 3. `src/api.ts`

- Добавь ветку в `endpointFor(id, p)`. Обычно это:
  `{ base: trimSlash(PROVIDER_META.<id>.baseUrl), headers: { Authorization: \`Bearer ${p.apiKey}\` } }`.
- Если провайдер требует дополнительных полей (например, Cloudflare требует
  Account ID) — добавь поле в `ProviderConfig` и поле ввода в SettingsScreen.

### 4. Проверь

- `npm run build && npm run lint`.
- Убедись, что провайдер появился в SettingsScreen (карточка с тестом) и в
  ModelsScreen (список моделей).

## Важно

- Не хардкодь реальные ключи.
- Не делай новый провайдер единственным — маршрутизация должна оставаться
  с fallback между несколькими.
