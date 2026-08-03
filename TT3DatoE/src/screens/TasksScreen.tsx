import { useCallback, useEffect, useState } from "react";
import { loadTasks, saveTasks } from "../storage";
import { Colors } from "../theme";
import { uid, now } from "../types";
import type { Task, TaskStatus } from "../types";
import { Button, Card } from "../components/UI";

const STATUS_LABEL: Record<TaskStatus, string> = {
  new: "Новая",
  in_progress: "В работе",
  done: "Готово",
  failed: "Ошибка",
};

const STATUS_COLOR: Record<TaskStatus, string> = {
  new: Colors.textDim,
  in_progress: Colors.warn,
  done: Colors.ok,
  failed: Colors.danger,
};

export default function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");

  useEffect(() => {
    setTasks(loadTasks());
  }, []);

  const persist = useCallback((next: Task[]) => {
    setTasks(next);
    saveTasks(next);
  }, []);

  const add = () => {
    const t = title.trim();
    if (!t) return;
    const task: Task = {
      id: uid("task"),
      title: t,
      description: desc.trim(),
      status: "new",
      createdAt: now(),
      updatedAt: now(),
    };
    persist([task, ...tasks]);
    setTitle("");
    setDesc("");
  };

  const setStatus = (id: string, status: TaskStatus) => {
    persist(tasks.map((t) => (t.id === id ? { ...t, status, updatedAt: now() } : t)));
  };

  return (
    <div style={{ padding: 16 }}>
      <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>Задачи</div>
      <Card>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Название задачи"
          style={inputStyle}
        />
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Описание (необязательно)"
          rows={2}
          style={{ ...inputStyle, marginTop: 8 }}
        />
        <Button title="Добавить задачу" onClick={add} disabled={!title.trim()} />
      </Card>

      {tasks.length === 0 ? (
        <div style={{ color: Colors.textDim, textAlign: "center", marginTop: 24 }}>
          Пока нет задач. Создайте первую.
        </div>
      ) : (
        tasks.map((item) => (
          <Card key={item.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{item.title}</div>
                {item.description ? (
                  <div style={{ color: Colors.textDim, fontSize: 13, marginTop: 4 }}>
                    {item.description}
                  </div>
                ) : null}
              </div>
              <span
                style={{
                  background: STATUS_COLOR[item.status] + "22",
                  color: STATUS_COLOR[item.status],
                  fontSize: 12,
                  fontWeight: 700,
                  padding: "4px 10px",
                  borderRadius: 999,
                  whiteSpace: "nowrap",
                }}
              >
                {STATUS_LABEL[item.status]}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                gap: 16,
                marginTop: 12,
                borderTop: `1px solid ${Colors.border}`,
                paddingTop: 10,
              }}
            >
              <button style={linkStyle(Colors.warn)} onClick={() => setStatus(item.id, "in_progress")}>
                В работу
              </button>
              <button style={linkStyle(Colors.ok)} onClick={() => setStatus(item.id, "done")}>
                Готово
              </button>
              <button style={linkStyle(Colors.danger)} onClick={() => setStatus(item.id, "failed")}>
                Ошибка
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
  resize: "none",
};

const linkStyle = (color: string): React.CSSProperties => ({
  background: "none",
  border: "none",
  color,
  fontWeight: 600,
  fontSize: 13,
  cursor: "pointer",
  padding: 0,
});
