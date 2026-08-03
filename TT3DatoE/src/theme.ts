export const Colors = {
  bg: "#0F1117",
  surface: "#1A1D27",
  surfaceAlt: "#232734",
  border: "#2C3142",
  text: "#EDEFF5",
  textDim: "#9AA1B5",
  accent: "#4C7DFF",
  accentDim: "#2A4ABF",
  ok: "#34C77B",
  warn: "#F5B041",
  danger: "#E74C3C",
  userBubble: "#2A4ABF",
  botBubble: "#232734",
};

export type TabKey = "chat" | "tasks" | "models" | "files" | "settings";

export const TABS: { key: TabKey; label: string }[] = [
  { key: "chat", label: "Чат" },
  { key: "tasks", label: "Задачи" },
  { key: "models", label: "Модели" },
  { key: "files", label: "Файлы" },
  { key: "settings", label: "Настройки" },
];
