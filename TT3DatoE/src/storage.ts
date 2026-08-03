import { DEFAULT_SETTINGS } from "./types";
import type { Conversation, Doc, Settings, Task } from "./types";

const KEYS = {
  settings: "tt3datoe.settings.v1",
  conversations: "tt3datoe.conversations.v1",
  tasks: "tt3datoe.tasks.v1",
  docs: "tt3datoe.docs.v1",
};

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // игнорируем ошибки записи
  }
}

export function loadSettings(): Settings {
  const s = loadJSON<Settings>(KEYS.settings, DEFAULT_SETTINGS);
  return { ...DEFAULT_SETTINGS, ...s };
}

export function saveSettings(s: Settings): void {
  saveJSON(KEYS.settings, s);
}

export function loadConversations(): Conversation[] {
  return loadJSON<Conversation[]>(KEYS.conversations, []);
}

export function saveConversations(list: Conversation[]): void {
  saveJSON(KEYS.conversations, list);
}

export function loadTasks(): Task[] {
  return loadJSON<Task[]>(KEYS.tasks, []);
}

export function saveTasks(list: Task[]): void {
  saveJSON(KEYS.tasks, list);
}

export function loadDocs(): Doc[] {
  return loadJSON<Doc[]>(KEYS.docs, []);
}

export function saveDocs(list: Doc[]): void {
  saveJSON(KEYS.docs, list);
}
