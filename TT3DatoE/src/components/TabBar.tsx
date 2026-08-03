import { Colors, TABS } from "../theme";
import type { TabKey } from "../theme";

interface Props {
  active: TabKey;
  onChange: (key: TabKey) => void;
}

export default function TabBar({ active, onChange }: Props) {
  return (
    <nav
      style={{
        display: "flex",
        background: Colors.surface,
        borderTop: `1px solid ${Colors.border}`,
        padding: 8,
        gap: 4,
      }}
    >
      {TABS.map((t) => {
        const isActive = t.key === active;
        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            style={{
              flex: 1,
              padding: "10px 8px",
              borderRadius: 999,
              border: "none",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: 13,
              background: isActive ? Colors.accentDim : "transparent",
              color: isActive ? Colors.accent : Colors.textDim,
            }}
          >
            {t.label}
          </button>
        );
      })}
    </nav>
  );
}
