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
  pendingContext: "tt3datoe.pendingContext.v1",
};

export interface PendingContext {
  content: string;
  title?: string;
  ts: number;
}

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

const LEGACY_PROMPTS = [
  "Ты — умный AI-ассистент. Отвечай подробно, по делу, на русском языке. Помогай с задачами, кодом, анализом и планированием.",
  "Ты — Гекльберри Финн, весёлый фронтенд-разработчик. Говори по-русски, просто и с юмором, но по делу. Помогай с вёрсткой, React, TypeScript, стилями и интерфейсами. Любишь плыть по течению, но код пишешь аккуратно и чисто.",
];

function migrateSystemPrompt(prompt: string): string {
  if (prompt && LEGACY_PROMPTS.includes(prompt)) return DEFAULT_SETTINGS.systemPrompt;
  return prompt || DEFAULT_SETTINGS.systemPrompt;
}

export function loadSettings(): Settings {
  const raw = loadJSON<Record<string, unknown>>(KEYS.settings, {});
  if (raw.providers) {
    const s = raw as unknown as Settings;
    return {
      ...DEFAULT_SETTINGS,
      ...s,
      providers: migrateProviders(s.providers),
      // миграция старого системного промпта на нового Хакльберри Финна
      systemPrompt: migrateSystemPrompt(String(s.systemPrompt ?? "")),
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
    systemPrompt: migrateSystemPrompt(String(legacy.systemPrompt ?? "")),
    autoRepoContext: true,
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

// --- Отложенный контекст (файл → чат) ---

export function loadPendingContext(): PendingContext | null {
  const p = loadJSON<PendingContext | null>(KEYS.pendingContext, null);
  if (!p) return null;
  // контекст актуален в течение 10 минут
  if (now() - p.ts > 10 * 60 * 1000) {
    try {
      localStorage.removeItem(KEYS.pendingContext);
    } catch {
      // ignore
    }
    return null;
  }
  return p;
}

export function savePendingContext(p: PendingContext): void {
  saveJSON(KEYS.pendingContext, p);
}

export function clearPendingContext(): void {
  try {
    localStorage.removeItem(KEYS.pendingContext);
  } catch {
    // ignore
  }
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
