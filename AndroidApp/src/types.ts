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

export interface Settings {
  baseUrl: string;
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: string;
  systemPrompt: string;
}

export const DEFAULT_SETTINGS: Settings = {
  baseUrl: "https://ваш-роутер.example.com/v1",
  apiKey: "",
  model: "deepseek-chat",
  temperature: 0.7,
  maxTokens: "",
  systemPrompt:
    "Ты — умный AI-ассистент. Отвечай подробно, по делу, на русском языке. Помогай с задачами, кодом, анализом и планированием.",
};

export const PRESET_MODELS = [
  "deepseek-chat",
  "deepseek-reasoner",
  "qwen-plus",
  "qwen-max",
  "glm-4-plus",
  "glm-4-flash",
  "kimi-latest",
  "moonshot-v1-8k",
  "minimax-text-01",
  "gpt-4o-mini",
  "gpt-4o",
  "claude-3-5-sonnet",
];

export function now(): number {
  return Date.now();
}

export function uid(prefix = "id"): string {
  return `${prefix}_${now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
