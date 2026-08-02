import { Message, Settings } from "./types";

export interface ChatRequest {
  model: string;
  messages: { role: string; content: string }[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

function normalizeBase(url: string): string {
  let u = url.trim();
  if (!u) return "";
  while (u.endsWith("/")) u = u.slice(0, -1);
  return u;
}

export async function chatCompletion(
  settings: Settings,
  messages: Message[],
  opts?: { onDelta?: (text: string) => void; signal?: AbortSignal }
): Promise<string> {
  const base = normalizeBase(settings.baseUrl);
  if (!base) throw new Error("Не указан адрес роутера. Откройте «Настройки».");

  const body: ChatRequest = {
    model: settings.model || "deepseek-chat",
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
    temperature: settings.temperature,
  };
  const maxTokens = parseInt(settings.maxTokens, 10);
  if (!Number.isNaN(maxTokens) && maxTokens > 0) {
    body.max_tokens = maxTokens;
  }

  const useStream = typeof opts?.onDelta === "function";
  body.stream = useStream;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (settings.apiKey) headers.Authorization = `Bearer ${settings.apiKey}`;

  const url = `${base}/chat/completions`;

  if (!useStream) {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: opts?.signal,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Ошибка ${res.status}: ${text.slice(0, 300)}`);
    }
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (typeof content !== "string") {
      throw new Error("Роутер вернул пустой ответ.");
    }
    return content;
  }

  // Поточный ответ через SSE
  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    signal: opts?.signal,
  });
  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => "");
    throw new Error(`Ошибка ${res.status}: ${text.slice(0, 300)}`);
  }
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
          opts.onDelta?.(delta);
        }
      } catch {
        // пропускаем некорректные фрагменты
      }
    }
  }
  if (!full) throw new Error("Роутер вернул пустой ответ.");
  return full;
}
