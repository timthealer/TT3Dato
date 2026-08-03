import { useEffect, useState } from "react";
import { loadSettings, saveSettings } from "../storage";
import { Colors } from "../theme";
import { PRESET_MODELS } from "../types";
import type { Settings } from "../types";

export default function ModelsScreen() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [custom, setCustom] = useState("");

  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  if (!settings) return null;

  const models = [
    ...new Set([...PRESET_MODELS, ...(custom.trim() ? [custom.trim()] : [])]),
  ];

  const select = (model: string) => {
    const next = { ...settings, model };
    setSettings(next);
    saveSettings(next);
  };

  return (
    <div style={{ padding: 16 }}>
      <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>Модели</div>
      <div
        style={{
          background: Colors.surface,
          border: `1px solid ${Colors.border}`,
          borderRadius: 12,
          padding: 16,
          marginBottom: 12,
        }}
      >
        <div style={{ color: Colors.textDim, fontSize: 13 }}>Текущая модель</div>
        <div style={{ color: Colors.accent, fontSize: 18, fontWeight: 800 }}>
          {settings.model}
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <div style={{ color: Colors.textDim, fontSize: 13, marginBottom: 4, fontWeight: 600 }}>
          Своя модель
        </div>
        <input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          placeholder="например: my-omni-model"
          style={{
            background: Colors.surfaceAlt,
            border: `1px solid ${Colors.border}`,
            borderRadius: 8,
            color: Colors.text,
            padding: "11px 12px",
            fontSize: 15,
            width: "100%",
            outline: "none",
          }}
        />
        <div style={{ color: Colors.textDim, fontSize: 12, marginTop: 4 }}>
          Модель берётся из вашего omni-роутера. Лимит токенов можно отключить в настройках.
        </div>
      </div>

      {models.map((m) => {
        const isActive = m === settings.model;
        return (
          <button
            key={m}
            onClick={() => select(m)}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              background: Colors.surface,
              border: `1px solid ${isActive ? Colors.accent : Colors.border}`,
              borderRadius: 12,
              padding: "14px 16px",
              marginBottom: 8,
              cursor: "pointer",
            }}
          >
            <span style={{ color: isActive ? Colors.accent : Colors.text, fontWeight: 600 }}>
              {m}
            </span>
            {isActive ? <span style={{ color: Colors.accent, fontWeight: 800 }}>✓</span> : null}
          </button>
        );
      })}
    </div>
  );
}
