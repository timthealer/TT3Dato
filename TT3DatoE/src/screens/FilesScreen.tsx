import { useCallback, useEffect, useState } from "react";
import { loadDocs, saveDocs } from "../storage";
import { Colors } from "../theme";
import { uid, now } from "../types";
import type { Doc } from "../types";
import { Button, Card } from "../components/UI";

export default function FilesScreen() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [editing, setEditing] = useState<Doc | null>(null);
  const [content, setContent] = useState("");

  useEffect(() => {
    setDocs(loadDocs());
  }, []);

  const persist = useCallback((next: Doc[]) => {
    setDocs(next);
    saveDocs(next);
  }, []);

  const openNew = () => {
    setEditing({ id: "", name: "", content: "", updatedAt: now() });
    setContent("");
  };

  const open = (d: Doc) => {
    setEditing({ ...d });
    setContent(d.content);
  };

  const save = () => {
    if (!editing) return;
    const n = editing.name.trim();
    if (!n) return;
    if (editing.id) {
      persist(
        docs.map((d) =>
          d.id === editing.id ? { ...d, name: n, content, updatedAt: now() } : d
        )
      );
    } else {
      persist([{ id: uid("doc"), name: n, content, updatedAt: now() }, ...docs]);
    }
    setEditing(null);
  };

  const remove = (id: string) => {
    persist(docs.filter((d) => d.id !== id));
  };

  if (editing !== null) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <button
            onClick={() => setEditing(null)}
            style={{ background: "none", border: "none", color: Colors.accent, fontWeight: 700, cursor: "pointer" }}
          >
            ← Назад
          </button>
          <div style={{ fontSize: 20, fontWeight: 800 }}>Документ</div>
        </div>
        <input
          value={editing.name}
          onChange={(e) => setEditing({ ...editing, name: e.target.value })}
          placeholder="Название файла"
          style={inputStyle}
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Содержимое (поддерживается Markdown)…"
          style={{ ...inputStyle, flex: 1, minHeight: 200, marginTop: 12, resize: "none" }}
        />
        <div style={{ marginTop: 12 }}>
          <Button title="Сохранить" onClick={save} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 20, fontWeight: 800 }}>Файлы и проекты</div>
        <button
          onClick={openNew}
          style={{
            background: Colors.accent,
            border: "none",
            borderRadius: 999,
            padding: "8px 14px",
            color: "#fff",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          + Новый
        </button>
      </div>

      {docs.length === 0 ? (
        <div style={{ color: Colors.textDim, textAlign: "center", marginTop: 24 }}>
          Нет файлов. Создайте документ, план или заметку по проекту.
        </div>
      ) : (
        docs.map((d) => (
          <Card key={d.id}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <button
                onClick={() => open(d)}
                style={{ background: "none", border: "none", cursor: "pointer", textAlign: "left", flex: 1 }}
              >
                <div style={{ color: Colors.text, fontSize: 15, fontWeight: 700 }}>{d.name}</div>
                <div style={{ color: Colors.textDim, fontSize: 12, marginTop: 2 }}>
                  {new Date(d.updatedAt).toLocaleString("ru-RU")}
                </div>
              </button>
              <button
                onClick={() => remove(d.id)}
                style={{ background: "none", border: "none", color: Colors.danger, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
              >
                Удалить
              </button>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  background: Colors.surfaceAlt,
  border: `1px solid ${Colors.border}`,
  borderRadius: 8,
  color: Colors.text,
  padding: "11px 12px",
  fontSize: 15,
  width: "100%",
  outline: "none",
  fontFamily: "inherit",
};
