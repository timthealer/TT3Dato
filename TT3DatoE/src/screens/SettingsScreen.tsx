import { useEffect, useState } from "react";
import { testProvider } from "../api";
import { loadSettings, saveSettings } from "../storage";
import { Colors } from "../theme";
import { Button, Card, Field } from "../components/UI";
import { DEFAULT_PROVIDERS, PROVIDER_META, TASK_MODES } from "../types";
import type { ProviderConfig, ProviderId, Settings, TaskMode } from "../types";

type TestState =
  | { id: ProviderId; status: "idle" }
  | { id: ProviderId; status: "checking" }
  | { id: ProviderId; status: "ok"; message: string }
  | { id: ProviderId; status: "fail"; message: string };

export default function SettingsScreen() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saved, setSaved] = useState(false);
  const [test, setTest] = useState<TestState>({ id: "gemini", status: "idle" });

  useEffect(() => {
    const s = loadSettings();
    setSettings(s);
    setLimited(s.maxTokens !== "");
  }, []);

  const [limited, setLimited] = useState(false);

  if (!settings) return null;

  const save = (next: Settings) => {
    setSettings(next);
    saveSettings(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const patchProvider = (id: ProviderId, patch: Partial<ProviderConfig>) => {
    save({
      ...settings,
      providers: settings.providers.map((p) =>
        p.id === id ? { ...p, ...patch } : p
      ),
    });
  };

  const toggleProvider = (id: ProviderId, on: boolean) => {
    const p = settings.providers.find((x) => x.id === id);
    if (!p) return;
    if (on && !p.apiKey) {
      // без ключа нельзя включить
      setTest({ id, status: "fail", message: "Сначала введите API-ключ." });
      return;
    }
    patchProvider(id, { enabled: on });
  };

  const runTest = async (id: ProviderId) => {
    const p = settings.providers.find((x) => x.id === id);
    if (!p) return;
    if (!p.apiKey && id !== "custom") {
      setTest({ id, status: "fail", message: "Введите API-ключ." });
      return;
    }
    setTest({ id, status: "checking" });
    const r = await testProvider(id, p);
    setTest({
      id,
      status: r.ok ? "ok" : "fail",
      message: r.message,
    });
  };

  const renderTest = (id: ProviderId) =>
    test.id === id && test.status !== "idle" ? (
      test.status === "checking" ? (
        <div style={{ color: Colors.textDim, fontSize: 13, marginTop: 8 }}>
          Проверяю…
        </div>
      ) : (
        <div
          style={{
            color: test.status === "ok" ? Colors.ok : Colors.danger,
            fontSize: 13,
            marginTop: 8,
            lineHeight: 1.5,
            fontWeight: test.status === "ok" ? 600 : 400,
          }}
        >
          {test.message}
        </div>
      )
    ) : null;

  const freeProviderIds = DEFAULT_PROVIDERS.map((p) => p.id).filter(
    (id): id is Exclude<ProviderId, "custom"> => id !== "custom"
  );

  const freeCards = freeProviderIds.map((id) => {
      const p = settings.providers.find((x) => x.id === id);
      const meta = PROVIDER_META[id as Exclude<ProviderId, "custom">];
      if (!p || !meta) return null;
      return (
        <Card key={id} style={{ borderColor: p.enabled ? Colors.ok : Colors.border }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 6,
            }}
          >
            <div style={{ color: Colors.text, fontSize: 15, fontWeight: 700 }}>{meta.name}</div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <span style={{ color: Colors.textDim, fontSize: 13 }}>{p.enabled ? "Вкл" : "Выкл"}</span>
              <input
                type="checkbox"
                checked={p.enabled}
                onChange={(e) => toggleProvider(id, e.target.checked)}
              />
            </label>
          </div>
          <div style={{ color: Colors.textDim, fontSize: 12, marginBottom: 10, lineHeight: 1.4 }}>
            {meta.tagline}{" "}
            <a href={meta.signup} target="_blank" rel="noreferrer" style={{ color: Colors.accent }}>
              Получить ключ
            </a>
          </div>
          <Field
            label="API-ключ"
            type="password"
            placeholder="бесплатный ключ"
            value={p.apiKey}
            onChange={(e) => patchProvider(id, { apiKey: e.target.value })}
            autoComplete="off"
          />
          {id === "cloudflare" ? (
            <Field
              label="Account ID"
              placeholder="ваш Cloudflare Account ID"
              value={p.accountId}
              onChange={(e) => patchProvider(id, { accountId: e.target.value })}
              autoComplete="off"
            />
          ) : null}
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <Button
              title="Проверить"
              onClick={() => void runTest(id)}
              variant="ghost"
              disabled={test.id === id && test.status === "checking"}
            />
            <span style={{ color: Colors.textDim, fontSize: 12 }}>
              Модели: {meta.models.map((m) => m.label).join(", ")}
            </span>
          </div>
          {renderTest(id)}
        </Card>
      );
    }
  );

  const custom = settings.providers.find((p) => p.id === "custom");

  return (
    <div style={{ padding: 16, maxWidth: 720, margin: "0 auto" }}>
      <div
        style={{
          fontSize: 13,
          fontWeight: 800,
          textTransform: "uppercase",
          color: Colors.textDim,
          marginBottom: 8,
          marginTop: 8,
        }}
      >
        Бесплатные провайдеры
      </div>
      <div style={{ color: Colors.textDim, fontSize: 13, marginBottom: 12, lineHeight: 1.5 }}>
        Приложение полностью бесплатно: введите бесплатные ключи (получаются за минуту) —
        и приложение само выберет лучшую модель под задачу, с автоматическим переключением
        при ошибках или лимитах.
      </div>
      {freeCards}

      <div
        style={{
          fontSize: 13,
          fontWeight: 800,
          textTransform: "uppercase",
          color: Colors.textDim,
          marginBottom: 8,
          marginTop: 16,
        }}
      >
        Активный провайдер
      </div>
      <Card>
        <div style={{ color: Colors.textDim, fontSize: 13, marginBottom: 10 }}>
          «Авто» — приложение само выбирает лучшую модель среди включённых провайдеров
          под задачу. Можно закрепить конкретный провайдер.
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <button
            onClick={() => save({ ...settings, activeProvider: "auto" })}
            style={{
              background: settings.activeProvider === "auto" ? Colors.accent : Colors.surfaceAlt,
              border: "none",
              borderRadius: 999,
              padding: "8px 14px",
              color: settings.activeProvider === "auto" ? "#fff" : Colors.text,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Авто
          </button>
          {DEFAULT_PROVIDERS.filter((p) => p.id !== "custom").map((d) => {
            const p = settings.providers.find((x) => x.id === d.id);
            if (!p || !p.enabled) return null;
            const meta = PROVIDER_META[d.id as Exclude<ProviderId, "custom">];
            const active = settings.activeProvider === d.id;
            return (
              <button
                key={d.id}
                onClick={() => save({ ...settings, activeProvider: d.id })}
                style={{
                  background: active ? Colors.accent : Colors.surfaceAlt,
                  border: "none",
                  borderRadius: 999,
                  padding: "8px 14px",
                  color: active ? "#fff" : Colors.text,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {meta.name.split(" ")[0]}
              </button>
            );
          })}
        </div>
      </Card>

      <div
        style={{
          fontSize: 13,
          fontWeight: 800,
          textTransform: "uppercase",
          color: Colors.textDim,
          marginBottom: 8,
          marginTop: 16,
        }}
      >
        Свой роутер (необязательно)
      </div>
      <Card>
        <div style={{ color: Colors.textDim, fontSize: 12, marginBottom: 10, lineHeight: 1.4 }}>
          Поддержка OmniRoute и любых OpenAI-совместимых шлюзов. Используется как
          дополнительный источник, если он включён.
        </div>
        <Field
          label="Адрес (base URL)"
          placeholder="http://localhost:20128/v1"
          value={custom?.baseUrl ?? ""}
          onChange={(e) => patchProvider("custom", { baseUrl: e.target.value })}
          autoComplete="off"
        />
        <Field
          label="API-ключ (если нужен)"
          type="password"
          placeholder="оставьте пустым, если не нужен"
          value={custom?.apiKey ?? ""}
          onChange={(e) => patchProvider("custom", { apiKey: e.target.value })}
          autoComplete="off"
        />
        <Field
          label="Модель"
          placeholder="auto"
          value={custom?.model ?? ""}
          onChange={(e) => patchProvider("custom", { model: e.target.value })}
          autoComplete="off"
        />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={custom?.enabled ?? false}
              onChange={(e) => patchProvider("custom", { enabled: e.target.checked })}
            />
            <span style={{ color: Colors.text, fontSize: 14 }}>Использовать этот роутер</span>
          </label>
          <Button
            title="Проверить"
            onClick={() => void runTest("custom")}
            variant="ghost"
            disabled={test.id === "custom" && test.status === "checking"}
          />
        </div>
        {renderTest("custom")}
      </Card>

      <div
        style={{
          fontSize: 13,
          fontWeight: 800,
          textTransform: "uppercase",
          color: Colors.textDim,
          marginBottom: 8,
          marginTop: 16,
        }}
      >
        Репозиторий
      </div>
      <Card>
        <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={settings.autoRepoContext}
            onChange={(e) => save({ ...settings, autoRepoContext: e.target.checked })}
          />
          <span>
            <span style={{ display: "block", color: Colors.text, fontSize: 15, fontWeight: 600 }}>
              Автозагрузка файлов из репозитория
            </span>
            <span style={{ display: "block", color: Colors.textDim, fontSize: 12, marginTop: 2 }}>
              Если упомянуть имя файла (например, «api.ts») — его содержимое автоматически
              добавится в контекст для анализа.
            </span>
          </span>
        </label>
      </Card>

      <div
        style={{
          fontSize: 13,
          fontWeight: 800,
          textTransform: "uppercase",
          color: Colors.textDim,
          marginBottom: 8,
          marginTop: 16,
        }}
      >
        Режим выбора модели
      </div>
      <Card>
        <div style={{ color: Colors.textDim, fontSize: 13, marginBottom: 10 }}>
          Какую модель выбирать под задачу:
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {TASK_MODES.map((t) => {
            const active = settings.taskMode === t.id;
            return (
              <button
                key={t.id}
                onClick={() => save({ ...settings, taskMode: t.id as TaskMode })}
                style={{
                  background: active ? Colors.accent : Colors.surfaceAlt,
                  border: "none",
                  borderRadius: 999,
                  padding: "8px 14px",
                  color: active ? "#fff" : Colors.text,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>
        <div style={{ color: Colors.textDim, fontSize: 12, marginTop: 10 }}>
          {TASK_MODES.find((t) => t.id === settings.taskMode)?.hint}
        </div>
      </Card>

      <div
        style={{
          fontSize: 13,
          fontWeight: 800,
          textTransform: "uppercase",
          color: Colors.textDim,
          marginBottom: 8,
          marginTop: 8,
        }}
      >
        Параметры генерации
      </div>
      <Card>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <div>
            <div style={{ color: Colors.text, fontSize: 15, fontWeight: 600 }}>
              Ограничение токенов
            </div>
            <div style={{ color: Colors.textDim, fontSize: 12, marginTop: 2 }}>
              Выключено — ответ без обрезки.
            </div>
          </div>
          <label style={{ position: "relative", display: "inline-block", width: 48, height: 26 }}>
            <input
              type="checkbox"
              checked={limited}
              onChange={(e) => {
                const v = e.target.checked;
                setLimited(v);
                save({ ...settings, maxTokens: v ? "4096" : "" });
              }}
              style={{ opacity: 0, width: 0, height: 0 }}
            />
            <span
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: 999,
                background: limited ? Colors.accent : Colors.surfaceAlt,
                transition: "0.2s",
                cursor: "pointer",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: 3,
                  left: limited ? 24 : 3,
                  width: 20,
                  height: 20,
                  borderRadius: 999,
                  background: "#fff",
                  transition: "0.2s",
                }}
              />
            </span>
          </label>
        </div>
        {limited ? (
          <Field
            label="Максимум токенов"
            type="number"
            value={settings.maxTokens}
            onChange={(e) =>
              save({
                ...settings,
                maxTokens: e.target.value.replace(/[^0-9]/g, ""),
              })
            }
          />
        ) : null}
        <Field
          label={`Температура (0.0 – 2.0): ${settings.temperature.toFixed(1)}`}
          type="number"
          step="0.1"
          min="0"
          max="2"
          value={String(settings.temperature)}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            save({
              ...settings,
              temperature: Number.isNaN(v) ? 0 : Math.max(0, Math.min(2, v)),
            });
          }}
        />
        <Field
          label="Системный промпт"
          multiline
          rows={4}
          value={settings.systemPrompt}
          onChange={(e) => save({ ...settings, systemPrompt: e.target.value })}
        />
      </Card>

      {saved ? (
        <div style={{ color: Colors.ok, textAlign: "center", marginTop: 12, fontWeight: 600 }}>
          Настройки сохранены
        </div>
      ) : null}

      <div
        style={{
          color: Colors.textDim,
          fontSize: 12,
          marginTop: 24,
          textAlign: "center",
          lineHeight: 1.5,
        }}
      >
        TT3DatoE — полностью бесплатный AI-ассистент. Ключи хранятся только на этом
        устройстве (localStorage). Выбирайте бесплатные модели — никаких оплат.
      </div>
    </div>
  );
}
