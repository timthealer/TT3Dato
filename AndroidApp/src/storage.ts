import AsyncStorage from "@react-native-async-storage/async-storage";
import { Conversation, Doc, Settings, Task, DEFAULT_SETTINGS } from "./types";

const KEYS = {
  settings: "assistant.settings.v1",
  conversations: "assistant.conversations.v1",
  tasks: "assistant.tasks.v1",
  docs: "assistant.docs.v1",
};

async function loadJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function saveJSON(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // игнорируем ошибки записи
  }
}

export async function loadSettings(): Promise<Settings> {
  const s = await loadJSON<Settings>(KEYS.settings, DEFAULT_SETTINGS);
  return { ...DEFAULT_SETTINGS, ...s };
}

export async function saveSettings(s: Settings): Promise<void> {
  await saveJSON(KEYS.settings, s);
}

export async function loadConversations(): Promise<Conversation[]> {
  return loadJSON<Conversation[]>(KEYS.conversations, []);
}

export async function saveConversations(list: Conversation[]): Promise<void> {
  await saveJSON(KEYS.conversations, list);
}

export async function loadTasks(): Promise<Task[]> {
  return loadJSON<Task[]>(KEYS.tasks, []);
}

export async function saveTasks(list: Task[]): Promise<void> {
  await saveJSON(KEYS.tasks, list);
}

export async function loadDocs(): Promise<Doc[]> {
  return loadJSON<Doc[]>(KEYS.docs, []);
}

export async function saveDocs(list: Doc[]): Promise<void> {
  await saveJSON(KEYS.docs, list);
}
