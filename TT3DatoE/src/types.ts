export type Role = "user" | "assistant" | "system";

export interface Message {
  id: string;
  role: Role;
  content: string;
  ts: number;
}

export interface Conversation {
  id: string;
  title: string;
  model: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
}

export type TaskStatus = "new" | "in_progress" | "done" | "failed";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  result?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Doc {
  id: string;
  name: string;
  content: string;
  updatedAt: number;
}

// --- Мультипровайдерный бесплатный роутер ---

export type TaskMode = "auto" | "coding" | "chat" | "reasoning" | "fast";

export type ProviderId =
  | "gemini"
  | "openrouter"
  | "groq"
  | "cloudflare"
  | "custom";

export type ActiveProvider = ProviderId | "auto";

export interface ProviderConfig {
  id: ProviderId;
  enabled: boolean;
  apiKey: string;
  baseUrl: string; // для custom-роутера (OmniRoute)
  model: string; // для custom-роутера
  accountId: string; // для Cloudflare
}

export interface Settings {
  providers: ProviderConfig[];
  activeProvider: ActiveProvider; // "auto" = выбор лучшего бесплатного
  taskMode: TaskMode;
  temperature: number;
  maxTokens: string;
  systemPrompt: string;
}

export const OMNIROUTE_DEFAULT_URL = "/v1";

export const DEFAULT_PROVIDERS: ProviderConfig[] = [
  { id: "gemini", enabled: false, apiKey: "", baseUrl: "", model: "", accountId: "" },
  { id: "openrouter", enabled: false, apiKey: "", baseUrl: "", model: "", accountId: "" },
  { id: "groq", enabled: false, apiKey: "", baseUrl: "", model: "", accountId: "" },
  { id: "cloudflare", enabled: false, apiKey: "", baseUrl: "", model: "", accountId: "" },
  { id: "custom", enabled: false, apiKey: "", baseUrl: OMNIROUTE_DEFAULT_URL, model: "auto", accountId: "" },
];

export const DEFAULT_SETTINGS: Settings = {
  providers: DEFAULT_PROVIDERS,
  activeProvider: "auto",
  taskMode: "auto",
  temperature: 0.7,
  maxTokens: "",
  systemPrompt:
    "Ты — умный AI-ассистент. Отвечай подробно, по делу, на русском языке. Помогай с задачами, кодом, анализом и планированием.",
};

export interface FreeModel {
  id: string;
  label: string;
  tasks: TaskMode[];
  quality: number; // выше = лучше для своей задачи
}

export interface ProviderMeta {
  name: string;
  tagline: string;
  signup: string;
  baseUrl: string;
  models: FreeModel[];
}

export const PROVIDER_META: Record<Exclude<ProviderId, "custom">, ProviderMeta> = {
  gemini: {
    name: "Google Gemini",
    tagline: "Бесплатный ключ с AI Studio. Мощные модели для кода и рассуждений.",
    signup: "https://aistudio.google.com/apikey",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
    models: [
      { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash", tasks: ["coding", "chat", "reasoning", "fast"], quality: 5 },
      { id: "gemini-2.0-flash", label: "Gemini 2.0 Flash", tasks: ["chat", "fast", "coding"], quality: 3 },
    ],
  },
  openrouter: {
    name: "OpenRouter (бесплатные модели)",
    tagline: "Один ключ — десятки бесплатных моделей с суффиксом :free.",
    signup: "https://openrouter.ai/keys",
    baseUrl: "https://openrouter.ai/api/v1",
    models: [
      { id: "poolside/laguna-s-2.1:free", label: "Laguna S 2.1 (код)", tasks: ["coding", "chat"], quality: 5 },
      { id: "openai/gpt-oss-20b:free", label: "OpenAI gpt-oss-20b", tasks: ["coding", "chat", "reasoning"], quality: 4 },
      { id: "cohere/north-mini-code:free", label: "Cohere North Mini Code", tasks: ["coding", "chat"], quality: 4 },
      { id: "nvidia/nemotron-3-ultra-550b-a55b:free", label: "Nemotron 3 Ultra 550B", tasks: ["reasoning", "chat"], quality: 5 },
      { id: "nvidia/nemotron-3-super-120b-a12b:free", label: "Nemotron 3 Super 120B", tasks: ["reasoning", "chat"], quality: 4 },
      { id: "inclusionai/ling-3.0-flash:free", label: "Ling 3.0 Flash 124B", tasks: ["chat", "coding", "fast"], quality: 3 },
      { id: "google/gemma-4-31b-it:free", label: "Gemma 4 31B Instruct", tasks: ["chat", "fast"], quality: 3 },
      { id: "nvidia/nemotron-nano-9b-v2:free", label: "Nemotron Nano 9B (быстрый)", tasks: ["fast", "chat"], quality: 2 },
    ],
  },
  groq: {
    name: "Groq",
    tagline: "Самые быстрые ответы, бесплатный тир с лимитами.",
    signup: "https://console.groq.com/keys",
    baseUrl: "https://api.groq.com/openai/v1",
    models: [
      { id: "llama-3.3-70b-versatile", label: "Llama 3.3 70B", tasks: ["chat", "coding", "reasoning"], quality: 4 },
      { id: "llama-3.1-8b-instant", label: "Llama 3.1 8B (быстрый)", tasks: ["fast", "chat"], quality: 3 },
    ],
  },
  cloudflare: {
    name: "Cloudflare Workers AI",
    tagline: "Бесплатный ежедневный лимит. Требует Account ID.",
    signup: "https://dash.cloudflare.com",
    baseUrl: "https://api.cloudflare.com/client/v4/accounts",
    models: [
      { id: "@cf/meta/llama-3.3-70b-instruct-fp8-fast", label: "Llama 3.3 70B (CF)", tasks: ["chat", "coding"], quality: 3 },
      { id: "@cf/qwen/qwen2.5-coder-32b-instruct", label: "Qwen Coder 32B (CF)", tasks: ["coding", "chat"], quality: 4 },
    ],
  },
};

export const TASK_MODES: { id: TaskMode; label: string; hint: string }[] = [
  { id: "auto", label: "Авто", hint: "Приложение само выбирает модель по тексту задачи." },
  { id: "coding", label: "Код", hint: "Лучшие модели для написания и отладки кода." },
  { id: "reasoning", label: "Рассуждения", hint: "Сложный анализ, объяснения, планирование." },
  { id: "chat", label: "Чат", hint: "Обычный разговор, быстрые ответы." },
  { id: "fast", label: "Быстрый", hint: "Максимальная скорость ответа." },
];

export function providerLabel(id: ProviderId): string {
  if (id === "custom") return "Свой роутер (OmniRoute и др.)";
  return PROVIDER_META[id].name;
}

export function now(): number {
  return Date.now();
}

export function uid(prefix = "id"): string {
  return `${prefix}_${now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
