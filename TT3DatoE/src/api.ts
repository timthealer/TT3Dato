import type { Message, ProviderId, Settings, TaskMode } from "./types";
import { PROVIDER_META } from "./types";

export interface ChatResult {
  text: string;
  provider: string;
  model: string;
}

interface Endpoint {
  base: string; // без trailing slash
  headers: Record<string, string>;
}

// --- Нормализация адресов ---

function trimSlash(u: string): string {
  let s = u.trim();
  while (s.endsWith("/")) s = s.slice(0, -1);
  return s;
}

function endpointFor(
  id: ProviderId,
  p: { apiKey: string; baseUrl: string; accountId: string }
): Endpoint | null {
  switch (id) {
    case "gemini":
      return p.apiKey
        ? { base: trimSlash(PROVIDER_META.gemini.baseUrl), headers: { Authorization: `Bearer ${p.apiKey}` } }
        : null;
    case "openrouter":
      return p.apiKey
        ? { base: trimSlash(PROVIDER_META.openrouter.baseUrl), headers: { Authorization: `Bearer ${p.apiKey}` } }
        : null;
    case "groq":
      return p.apiKey
        ? { base: trimSlash(PROVIDER_META.groq.baseUrl), headers: { Authorization: `Bearer ${p.apiKey}` } }
        : null;
    case "cloudflare": {
      if (!p.apiKey || !p.accountId) return null;
      const base = `${trimSlash(PROVIDER_META.cloudflare.baseUrl)}/${trimSlash(p.accountId)}/ai/v1`;
      return { base, headers: { Authorization: `Bearer ${p.apiKey}` } };
    }
    case "custom":
      return p.baseUrl
        ? {
            base: trimSlash(p.baseUrl),
            headers: p.apiKey ? { Authorization: `Bearer ${p.apiKey}` } : {},
          }
        : null;
  }
}

// --- Выбор модели под задачу ---

const TASK_HINTS: Record<TaskMode, RegExp[]> = {
  auto: [],
  coding: [
    /```/,
    /\b(function|const|let|var|class|import|export|def |return |async|await)\b/i,
    /\b(код|кода|функци|ошибк|баг|отлад|debug|рефактор|api|компонент)\b/i,
  ],
  reasoning: [
    /(почему|объясн|проанализ|план|спроектиру|придумай|стратеги|сравн)\b/i,
    /\b(архитектур|оптимизац|исследов|рассужд|обоснуй)\b/i,
  ],
  chat: [/\b(привет|как дела|расскажи|помоги|что такое)\b/i],
  fast: [/\b(кратко|коротко|срочно|одним словом|да или нет)\b/i],
};

function detectTask(messages: Message[]): TaskMode {
  const last = [...messages].reverse().find((m) => m.role === "user");
  const text = last?.content ?? "";
  if (TASK_HINTS.coding.some((r) => r.test(text))) return "coding";
  if (TASK_HINTS.reasoning.some((r) => r.test(text))) return "reasoning";
  if (TASK_HINTS.fast.some((r) => r.test(text))) return "fast";
  if (TASK_HINTS.chat.some((r) => r.test(text))) return "chat";
  return "coding";
}

interface Candidate {
  id: ProviderId;
  providerName: string;
  model: string;
  base: string;
  headers: Record<string, string>;
}

function buildCandidates(settings: Settings, messages: Message[]): Candidate[] {
  const task = settings.taskMode === "auto" ? detectTask(messages) : settings.taskMode;
  const out: Candidate[] = [];

  const freeEnabled = settings.providers.filter(
    (p) => p.id !== "custom" && p.enabled
  );

  // Если выбран конкретный провайдер — используем только его
  const pinned =
    settings.activeProvider !== "auto" && settings.activeProvider !== "custom"
      ? settings.activeProvider
      : null;
  const pool = pinned
    ? freeEnabled.filter((p) => p.id === pinned)
    : freeEnabled;

  const scored: { score: number; c: Candidate }[] = [];
  for (const p of pool) {
    const ep = endpointFor(p.id, p);
    if (!ep) continue;
    const meta = PROVIDER_META[p.id as Exclude<ProviderId, "custom">];
    for (const m of meta.models) {
      if (!m.tasks.includes(task)) continue;
      // поощряем качество + провайдера с настроенным ключом
      const score = m.quality;
      scored.push({
        score,
        c: {
          id: p.id,
          providerName: meta.name,
          model: m.id,
          base: ep.base,
          headers: ep.headers,
        },
      });
    }
  }
  scored.sort((a, b) => b.score - a.score);
  for (const s of scored) out.push(s.c);

  // custom-роутер (OmniRoute) — в конце как явно выбранный, либо если activeProvider=custom
  const custom = settings.providers.find((p) => p.id === "custom");
  if (custom?.enabled) {
    const ep = endpointFor("custom", custom);
    if (ep) {
      const candidate: Candidate = {
        id: "custom",
        providerName: "Свой роутер",
        model: custom.model || "auto",
        base: ep.base,
        headers: ep.headers,
      };
      if (settings.activeProvider === "custom") out.unshift(candidate);
      else out.push(candidate);
    }
  }

  return out;
}

// --- Выполнение запроса (одна попытка) ---

async function attempt(
  c: Candidate,
  body: Record<string, unknown>,
  stream: boolean,
  signal?: AbortSignal
): Promise<Response> {
  return fetch(`${c.base}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...c.headers,
    },
    body: JSON.stringify({ ...body, stream }),
    signal,
  });
}

async function readStream(
  res: Response,
  onDelta?: (text: string) => void
): Promise<string> {
  if (!res.body) throw new Error("Роутер вернул пустой ответ.");
  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";
  let full = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const payload = trimmed.slice(5).trim();
      if (payload === "[DONE]") continue;
      try {
        const obj = JSON.parse(payload);
        const delta = obj?.choices?.[0]?.delta?.content;
        if (typeof delta === "string" && delta.length > 0) {
          full += delta;
          onDelta?.(delta);
        }
      } catch {
        // пропускаем некорректные фрагменты
      }
    }
  }
  if (!full) throw new Error("Роутер вернул пустой ответ.");
  return full;
}

// --- Публичный API: чат с авто-fallback ---

export async function chatCompletion(
  settings: Settings,
  messages: Message[],
  opts?: { onDelta?: (text: string) => void; signal?: AbortSignal }
): Promise<ChatResult> {
  const candidates = buildCandidates(settings, messages);
  if (candidates.length === 0) {
    throw new Error(
      "Не настроено ни одной модели. Откройте «Настройки» и добавьте бесплатный API-ключ."
    );
  }

  const body: Record<string, unknown> = {
    model: candidates[0].model,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
    temperature: settings.temperature,
  };
  const maxTokens = parseInt(settings.maxTokens, 10);
  if (!Number.isNaN(maxTokens) && maxTokens > 0) body.max_tokens = maxTokens;

  const stream = typeof opts?.onDelta === "function";
  let lastError: unknown = null;

  for (const c of candidates) {
    try {
      body.model = c.model;
      const res = await attempt(c, body, stream, opts?.signal);
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        const err = new Error(`Ошибка ${res.status}: ${text.slice(0, 300)}`);
        lastError = err;
        continue; // пробуем следующего провайдера
      }
      if (!stream) {
        const data = await res.json();
        const content = data?.choices?.[0]?.message?.content;
        if (typeof content !== "string") {
          lastError = new Error("Роутер вернул пустой ответ.");
          continue;
        }
        return { text: content, provider: c.providerName, model: c.model };
      }
      const text = await readStream(res, opts.onDelta);
      return { text, provider: c.providerName, model: c.model };
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") throw e;
      lastError = e;
      // пробуем следующего провайдера
    }
  }
  throw lastError ?? new Error("Нет доступных моделей.");
}

// --- Проверка подключения провайдера ---

export interface TestResult {
  ok: boolean;
  message: string;
  models?: string[];
}

export async function testProvider(
  id: ProviderId,
  cfg: { apiKey: string; baseUrl: string; accountId: string; model: string }
): Promise<TestResult> {
  const ep = endpointFor(id, cfg);
  if (!ep) {
    return { ok: false, message: "Введите API-ключ" };
  }
  try {
    const res = await fetch(`${ep.base}/models`, { headers: ep.headers });
    if (res.ok) {
      const data = await res.json().catch(() => null);
      const models = Array.isArray(data?.data)
        ? (data.data as { id?: string }[]).map((m) => m.id ?? "").filter(Boolean)
        : undefined;
      return { ok: true, message: "Подключение работает. Ключ принят.", models };
    }
    // /models может быть недоступен, пробуем лёгкий chat-completions
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 5000);
    try {
      const chatRes = await fetch(`${ep.base}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...ep.headers },
        body: JSON.stringify({
          model: cfg.model || "auto",
          messages: [{ role: "user", content: "ping" }],
          max_tokens: 1,
        }),
        signal: ctrl.signal,
      });
      if (chatRes.ok) return { ok: true, message: "Подключение работает." };
      return { ok: false, message: `Роутер ответил ошибкой ${chatRes.status}.` };
    } finally {
      clearTimeout(timer);
    }
  } catch (e) {
    return { ok: false, message: friendlyError(e) };
  }
}

export function friendlyError(e: unknown): string {
  const msg =
    typeof e === "object" && e && "message" in e
      ? String((e as { message: string }).message)
      : String(e ?? "");
  if (msg.includes("AbortError")) return "Отправка прервана.";
  if (msg.includes("Failed to fetch"))
    return "Не удалось подключиться. Проверьте адрес, интернет и CORS.";
  if (msg.includes("UnknownHostException"))
    return "Не удаётся найти сервер. Проверьте адрес в «Настройках» и интернет.";
  if (msg.includes("timeout") || msg.includes("timed out"))
    return "Провайдер не ответил вовремя. Попробуйте ещё раз.";
  if (msg.includes("401") || msg.includes("403"))
    return "Провайдер отклонил запрос. Проверьте API-ключ в «Настройках».";
  if (msg.startsWith("Ошибка ")) return msg;
  return msg || "Неизвестная ошибка.";
}
