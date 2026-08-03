import { useEffect, useState } from "react";
import { loadSettings, saveSettings } from "../storage";
import { Colors } from "../theme";
import { Button, Card, Field } from "../components/UI";
import type { Settings } from "../types";

export default function SettingsScreen() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const s = loadSettings();
    setSettings(s);
    setLimited(s.maxTokens !== "");
  }, []);

  const [limited, setLimited] = useState(false);

  if (!settings) return null;

  const update = (patch: Partial<Settings>) => {
    setSettings({ ...settings, ...patch });
    setSaved(false);
  };

  const save = () => {
    saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ padding: 16, maxWidth: 720, margin: "0 auto" }}>
      <div style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", color: Colors.textDim, marginBottom: 8, marginTop: 8 }}>
        Подключение к omni-роутеру
      </div>
      <Card>
        <Field
          label="Адрес роутера (base URL)"
          placeholder="https://ваш-роутер.example.com/v1"
          value={settings.baseUrl}
          onChange={(e) => update({ baseUrl: e.target.value })}
          autoComplete="off"
        />
        <Field
          label="API-ключ"
          placeholder="введите ваш ключ"
          type="password"
          value={settings.apiKey}
          onChange={(e) => update({ apiKey: e.target.value })}
          autoComplete="off"
        />
        <Field
          label="Модель по умолчанию"
          placeholder="deepseek-chat"
          value={settings.model}
          onChange={(e) => update({ model: e.target.value })}
          autoComplete="off"
        />
      </Card>

      <div style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", color: Colors.textDim, marginBottom: 8, marginTop: 8 }}>
        Параметры генерации
      </div>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <div style={{ color: Colors.text, fontSize: 15, fontWeight: 600 }}>
              Ограничение токенов
            </div>
            <div style={{ color: Colors.textDim, fontSize: 12, marginTop: 2 }}>
              Выключено — лимит отключён, роутер отвечает без обрезки.
            </div>
          </div>
          <label style={{ position: "relative", display: "inline-block", width: 48, height: 26 }}>
            <input
              type="checkbox"
              checked={limited}
              onChange={(e) => {
                const v = e.target.checked;
                setLimited(v);
                update({ maxTokens: v ? "4096" : "" });
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
            onChange={(e) => update({ maxTokens: e.target.value.replace(/[^0-9]/g, "") })}
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
            update({ temperature: Number.isNaN(v) ? 0 : Math.max(0, Math.min(2, v)) });
          }}
        />
        <Field
          label="Системный промпт"
          multiline
          rows={4}
          value={settings.systemPrompt}
          onChange={(e) => update({ systemPrompt: e.target.value })}
        />
      </Card>

      <Button title="Сохранить настройки" onClick={save} />
      {saved ? (
        <div style={{ color: Colors.ok, textAlign: "center", marginTop: 12, fontWeight: 600 }}>
          Настройки сохранены
        </div>
      ) : null}

      <div style={{ color: Colors.textDim, fontSize: 12, marginTop: 24, textAlign: "center", lineHeight: 1.5 }}>
        TT3DatoE — веб-интерфейс для вашего omni-роутера. Ключ хранится только на этом
        устройстве (localStorage). Роутер вы выбираете сами.
      </div>
    </div>
  );
}
