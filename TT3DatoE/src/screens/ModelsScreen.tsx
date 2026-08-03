import { useEffect, useState } from "react";
import { loadSettings } from "../storage";
import { Colors } from "../theme";
import { PROVIDER_META } from "../types";
import type { ProviderId, Settings } from "../types";

export default function ModelsScreen() {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  if (!settings) return null;

  const enabled = settings.providers.filter((p) => p.enabled);
  const active = settings.activeProvider === "auto" ? "auto" : settings.activeProvider;

  return (
    <div style={{ padding: 16, maxWidth: 720, margin: "0 auto" }}>
      <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Модели</div>
      <div style={{ color: Colors.textDim, fontSize: 13, marginBottom: 12 }}>
        Бесплатные модели автоматически выбираются под тип задачи. Добавьте ключи во
        вкладке «Настройки».
      </div>

      <div
        style={{
          background: Colors.surface,
          border: `1px solid ${Colors.border}`,
          borderRadius: 12,
          padding: 16,
          marginBottom: 12,
        }}
      >
        <div style={{ color: Colors.textDim, fontSize: 13 }}>Режим</div>
        <div style={{ color: Colors.accent, fontSize: 18, fontWeight: 800 }}>
          {active === "auto"
            ? "Авто (по задаче)"
            : active === "custom"
            ? "Свой роутер"
            : PROVIDER_META[active as Exclude<ProviderId, "custom">]?.name ?? active}
        </div>
      </div>

      {enabled.length === 0 ? (
        <div
          style={{
            background: "rgba(231,76,60,0.12)",
            border: `1px solid ${Colors.danger}`,
            borderRadius: 12,
            padding: 16,
            color: Colors.danger,
            fontSize: 14,
            lineHeight: 1.5,
          }}
        >
          Ни один провайдер не включён. Откройте «Настройки» и добавьте хотя бы один
          бесплатный API-ключ.
        </div>
      ) : null}

      {(Object.keys(PROVIDER_META) as Exclude<ProviderId, "custom">[]).map((pid) => {
        const p = settings.providers.find((x) => x.id === pid);
        if (!p || !p.enabled) return null;
        const meta = PROVIDER_META[pid];
        return (
          <div key={pid} style={{ marginBottom: 12 }}>
            <div
              style={{
                color: Colors.textDim,
                fontSize: 13,
                fontWeight: 700,
                marginBottom: 6,
                textTransform: "uppercase",
              }}
            >
              {meta.name}
            </div>
            {meta.models.map((m) => (
              <div
                key={m.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: Colors.surface,
                  border: `1px solid ${Colors.border}`,
                  borderRadius: 12,
                  padding: "12px 16px",
                  marginBottom: 6,
                }}
              >
                <div>
                  <div style={{ color: Colors.text, fontWeight: 600, fontSize: 15 }}>
                    {m.label}
                  </div>
                  <div style={{ color: Colors.textDim, fontSize: 12 }}>{m.id}</div>
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  {m.tasks.map((t) => (
                    <span
                      key={t}
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: 999,
                        background: Colors.surfaceAlt,
                        color: Colors.textDim,
                      }}
                    >
                      {t === "coding" ? "код" : t === "chat" ? "чат" : t === "fast" ? "быстро" : "рассуждения"}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
