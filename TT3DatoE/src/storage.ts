import { DEFAULT_PROVIDERS, DEFAULT_SETTINGS, now, uid } from "./types";
import type { Conversation, Doc, ProviderConfig, RepoConfig, Settings, Task } from "./types";

const KEYS = {
  settings: "tt3datoe.settings.v1",
  conversations: "tt3datoe.conversations.v1",
  tasks: "tt3datoe.tasks.v1",
  docs: "tt3datoe.docs.v1",
  activeConv: "tt3datoe.activeConv.v1",
  draft: "tt3datoe.draft.v1",
  tab: "tt3datoe.tab.v1",
  repo: "tt3datoe.repo.v1",
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

function migrateProviders(providers: ProviderConfig[] | undefined): ProviderConfig[] {
  if (Array.isArray(providers) && providers.length > 0) {
    const known = DEFAULT_PROVIDERS.map((p) => p.id);
    const result = DEFAULT_PROVIDERS.map(
      (dp) => providers.find((p) => p.id === dp.id) ?? dp
    );
    for (const extra of providers) {
      if (!known.includes(extra.id)) result.push(extra);
    }
    return result;
  }
  return DEFAULT_PROVIDERS;
}

export function loadSettings(): Settings {
  const raw = loadJSON<Record<string, unknown>>(KEYS.settings, {});
  if (raw.providers) {
    const s = raw as unknown as Settings;
    return {
      ...DEFAULT_SETTINGS,
      ...s,
      providers: migrateProviders(s.providers),
    };
  }
  // Миграция старого формата (baseUrl / apiKey / model) в custom-провайдер
  const legacy = raw as Record<string, unknown>;
  if (!legacy.baseUrl) return DEFAULT_SETTINGS;
  const custom = DEFAULT_PROVIDERS.find((p) => p.id === "custom");
  const providers = DEFAULT_PROVIDERS.map((p) =>
    p.id === "custom"
      ? {
          ...p,
          enabled: Boolean(legacy.baseUrl),
          baseUrl: String(legacy.baseUrl ?? custom?.baseUrl ?? ""),
          apiKey: String(legacy.apiKey ?? ""),
          model: String(legacy.model ?? "auto"),
        }
      : p
  );
  return {
    providers,
    activeProvider: legacy.baseUrl ? "custom" : "auto",
    taskMode: "auto",
    temperature: typeof legacy.temperature === "number" ? legacy.temperature : 0.7,
    maxTokens: String(legacy.maxTokens ?? ""),
    systemPrompt: String(legacy.systemPrompt ?? DEFAULT_SETTINGS.systemPrompt),
  };
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

// --- Персистентность интерфейса (активный чат, черновик, вкладка) ---

export function loadActiveConv(): string | null {
  return loadJSON<string | null>(KEYS.activeConv, null);
}

export function saveActiveConv(id: string | null): void {
  saveJSON(KEYS.activeConv, id);
}

export function loadDraft(): string {
  return loadJSON<string>(KEYS.draft, "");
}

export function saveDraft(text: string): void {
  saveJSON(KEYS.draft, text);
}

const TABS = ["chat", "tasks", "models", "files", "settings"];

export function loadTab(): string {
  const t = loadJSON<string>(KEYS.tab, "chat");
  return TABS.includes(t) ? t : "chat";
}

export function saveTab(tab: string): void {
  saveJSON(KEYS.tab, tab);
}

// --- Репозиторий (GitHub) ---

export function loadRepo(): RepoConfig {
  return loadJSON<RepoConfig>(KEYS.repo, {
    owner: "timthealer",
    repo: "TT3Dato",
    token: "",
  });
}

export function saveRepo(cfg: RepoConfig): void {
  saveJSON(KEYS.repo, cfg);
}

// Добавляет сообщение-контекст (например, содержимое файла из репозитория)
// в активный чат; если чата нет — создаёт новый и делает его активным.
export function addContextToActiveConversation(content: string): Conversation | null {
  let list = loadConversations();
  let convId = loadActiveConv();
  if (convId && !list.some((c) => c.id === convId)) convId = null;
  let conv: Conversation | null = convId
    ? list.find((c) => c.id === convId) ?? null
    : null;
  if (!conv) {
    conv = {
      id: uid("conv"),
      title: "Контекст",
      model: "auto",
      createdAt: now(),
      updatedAt: now(),
      messages: [],
    };
    list = [conv, ...list];
  }
  conv = {
    ...conv,
    updatedAt: now(),
    messages: [...conv.messages, { id: uid("m"), role: "user", content, ts: now() }],
  };
  list = list.map((c) => (c.id === conv!.id ? conv! : c));
  saveConversations(list);
  saveActiveConv(conv.id);
  return conv;
}
