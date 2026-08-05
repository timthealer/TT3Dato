import { useCallback, useEffect, useRef, useState } from "react";
import { chatCompletion, friendlyError } from "../api";
import { searchRepoFiles } from "../github";
import {
  clearPendingContext,
  loadActiveConv,
  loadConversations,
  loadDraft,
  loadPendingContext,
  loadRepo,
  loadSettings,
  saveActiveConv,
  saveConversations,
  saveDraft,
} from "../storage";
import { Colors } from "../theme";
import { uid, now } from "../types";
import type { Conversation, Message, Settings } from "../types";

const MAX_IMG_DIM = 1600;
const IMG_QUALITY = 0.85;

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function compressImage(dataUrl: string): Promise<string> {
  try {
    const img = new Image();
    img.src = dataUrl;
    await img.decode();
    const scale = Math.min(1, MAX_IMG_DIM / Math.max(img.width, img.height));
    if (scale >= 1 && !img.src.startsWith("data:image/png")) return dataUrl;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return dataUrl;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", IMG_QUALITY);
  } catch {
    return dataUrl;
  }
}

const FILE_RE = /\b[\w.-]+\.(ts|tsx|js|jsx|md|json|css|html|py|go|rs|java|sh|yaml|yml|sql|xml|env)\b/g;
const MAX_CTX_FILES = 5;

async function buildAutoContext(
  text: string,
  enabled: boolean,
  maxFiles: number
): Promise<string> {
  if (!enabled || !text) return "";
  const names = new Set<string>();
  for (const m of text.matchAll(FILE_RE)) names.add(m[0]);
  if (names.size === 0) return "";
  const cfg = loadRepo();
  const parts: string[] = [];
  for (const name of [...names].slice(0, maxFiles)) {
    try {
      const hits = await searchRepoFiles(name, cfg.owner && cfg.repo ? cfg : undefined);
      for (const f of hits.slice(0, 3)) {
        try {
          const res = await fetch(`/__repo/file?path=${encodeURIComponent(f.path)}`);
          if (!res.ok) continue;
          const text = await res.text();
          parts.push(`--- ${f.path} ---\n${text.slice(0, 12000)}`);
        } catch {
          // файл недоступен — пропускаем
        }
      }
    } catch {
      // поиск не удался — пропускаем
    }
  }
  return parts.length > 0 ? `\n\nКонтекст из репозитория:\n${parts.join("\n\n")}` : "";
}

export default function ChatScreen() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSettings(loadSettings());
    let list = loadConversations();
    const pending = loadPendingContext();
    if (pending) {
      clearPendingContext();
      const convId = loadActiveConv();
      let conv: Conversation | null = convId
        ? list.find((c) => c.id === convId) ?? null
        : null;
      if (!conv) {
        conv = {
          id: uid("conv"),
          title: pending.title ?? "Контекст",
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
        messages: [
          ...conv.messages,
          { id: uid("m"), role: "user", content: pending.content, ts: now() },
        ],
      };
      list = list.map((c) => (c.id === conv!.id ? conv! : c));
      saveConversations(list);
      saveActiveConv(conv.id);
    }
    setConvs(list);
    const saved = loadActiveConv();
    if (saved && list.some((c) => c.id === saved)) {
      setActiveId(saved);
    } else if (list.length > 0) {
      setActiveId(list[0].id);
    }
    setDraft(loadDraft());
  }, []);

  useEffect(() => {
    if (activeId) saveActiveConv(activeId);
  }, [activeId]);

  useEffect(() => {
    saveDraft(draft);
  }, [draft]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [convs, activeId]);

  const active = convs.find((c) => c.id === activeId) ?? null;

  const persist = useCallback((next: Conversation[]) => {
    setConvs(next);
    saveConversations(next);
  }, []);

  const newChat = () => {
    const c: Conversation = {
      id: uid("conv"),
      title: "Новый чат",
      model: "auto",
      createdAt: now(),
      updatedAt: now(),
      messages: [],
    };
    persist([c, ...convs]);
    setActiveId(c.id);
    setError(null);
  };

  const switchChat = (id: string) => {
    setActiveId(id);
    setError(null);
  };

  const removeChat = (id: string) => {
    const next = convs.filter((c) => c.id !== id);
    persist(next);
    if (activeId === id) {
      setActiveId(next.length > 0 ? next[0].id : null);
    }
  };

  const patchActive = useCallback(
    (fn: (c: Conversation) => Conversation) => {
      setConvs((prev) => {
        const next = prev.map((c) => (c.id === activeId ? fn(c) : c));
        saveConversations(next);
        return next;
      });
    },
    [activeId]
  );

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const imgs: string[] = [];
    for (const f of Array.from(files)) {
      if (!f.type.startsWith("image/")) continue;
      try {
        const raw = await fileToDataUrl(f);
        const comp = await compressImage(raw);
        imgs.push(comp);
      } catch {
        // пропускаем нечитаемый файл
      }
    }
    if (imgs.length > 0) setAttachments((prev) => [...prev, ...imgs]);
  }, []);

  const send = async () => {
    const text = draft.trim();
    if ((!text && attachments.length === 0) || !settings || busy || !active) return;
    const usedAttachments = attachments.length > 0 ? [...attachments] : undefined;
    setDraft("");
    setAttachments([]);
    setError(null);

    const userMsg: Message = {
      id: uid("m"),
      role: "user",
      content: text,
      images: usedAttachments,
      ts: now(),
    };
    const usedModel = settings.taskMode === "auto" ? "auto" : settings.taskMode;
    patchActive((c) => ({ ...c, model: usedModel }));
    const autoCtx = await buildAutoContext(text, settings.autoRepoContext, MAX_CTX_FILES);
    const systemMsg: Message = {
      id: uid("m"),
      role: "system",
      content: settings.systemPrompt + autoCtx,
      ts: now(),
    };
    const history = active.messages;
    const apiMessages = [systemMsg, ...history, userMsg];
    patchActive((c) => ({
      ...c,
      title: c.title === "Новый чат" ? (text || "Изображение").slice(0, 40) : c.title,
      updatedAt: now(),
      messages: [...c.messages, userMsg],
    }));

    const assistantMsg: Message = {
      id: uid("m"),
      role: "assistant",
      content: "",
      ts: now(),
    };
    patchActive((c) => ({ ...c, messages: [...c.messages, assistantMsg] }));

    setBusy(true);
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      const reply = await chatCompletion(settings, apiMessages, {
        signal: ctrl.signal,
        onDelta: (delta) => {
          patchActive((c) => ({
            ...c,
            updatedAt: now(),
            messages: c.messages.map((m) =>
              m.id === assistantMsg.id ? { ...m, content: m.content + delta } : m
            ),
          }));
        },
      });
      patchActive((c) => ({
        ...c,
        updatedAt: now(),
        model: `${reply.provider} · ${reply.model}`,
        messages: c.messages.map((m) =>
          m.id === assistantMsg.id ? { ...m, content: reply.text } : m
        ),
      }));
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") return;
      const friendly = friendlyError(e);
      setError(friendly);
      patchActive((c) => ({
        ...c,
        updatedAt: now(),
        messages: c.messages.map((m) =>
          m.id === assistantMsg.id ? { ...m, content: "Ошибка: " + friendly } : m
        ),
      }));
    } finally {
      setBusy(false);
      abortRef.current = null;
    }
  };

  const stop = () => abortRef.current?.abort();

  const canSend = draft.trim().length > 0 || attachments.length > 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          borderBottom: `1px solid ${Colors.border}`,
        }}
      >
        <div style={{ fontSize: 20, fontWeight: 800 }}>TT3DatoE — чат</div>
        <button
          onClick={newChat}
          style={{
            background: Colors.surfaceAlt,
            border: "none",
            borderRadius: 999,
            padding: "8px 14px",
            color: Colors.accent,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          + Новый чат
        </button>
      </div>

      {convs.length > 0 ? (
        <div
          style={{
            display: "flex",
            gap: 8,
            overflowX: "auto",
            padding: "10px 16px",
            borderBottom: `1px solid ${Colors.border}`,
            background: Colors.surface,
          }}
        >
          {convs.map((c) => {
            const active = c.id === activeId;
            return (
              <div
                key={c.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: active ? Colors.accent : Colors.surfaceAlt,
                  borderRadius: 999,
                  padding: "6px 12px",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
                onClick={() => switchChat(c.id)}
              >
                <span
                  style={{
                    color: active ? "#fff" : Colors.text,
                    fontSize: 13,
                    fontWeight: 600,
                    maxWidth: 140,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {c.title}
                </span>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    removeChat(c.id);
                  }}
                  style={{
                    color: active ? "rgba(255,255,255,0.8)" : Colors.textDim,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                  title="Удалить чат"
                >
                  ✕
                </span>
              </div>
            );
          })}
        </div>
      ) : null}

      {error ? (
        <div
          style={{
            background: "rgba(231,76,60,0.15)",
            padding: "8px 16px",
            color: Colors.danger,
            fontSize: 13,
          }}
        >
          {error}
        </div>
      ) : null}

      {!active ? (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
            Начните новый чат
          </div>
          <div
            style={{
              color: Colors.textDim,
              fontSize: 14,
              textAlign: "center",
              marginBottom: 24,
              maxWidth: 420,
            }}
          >
            Полностью бесплатный AI-ассистент. Задайте вопрос — приложение само выберет
            лучшую бесплатную модель под задачу. Можно прикрепить изображения (PNG, JPEG)
            и файлы из репозитория.
          </div>
          <button
            onClick={newChat}
            style={{
              background: Colors.accent,
              border: "none",
              borderRadius: 999,
              padding: "12px 24px",
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Создать чат
          </button>
        </div>
      ) : (
        <>
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {active.messages.map((m) => {
              const isUser = m.role === "user";
              return (
                <div
                  key={m.id}
                  style={{
                    display: "flex",
                    justifyContent: isUser ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "80%",
                      borderRadius: 16,
                      padding: "10px 14px",
                      background: isUser ? Colors.userBubble : Colors.botBubble,
                      color: Colors.text,
                      fontSize: 15,
                      lineHeight: 1.5,
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    {m.images && m.images.length > 0 ? (
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 6,
                          marginBottom: m.content ? 8 : 0,
                        }}
                      >
                        {m.images.map((src, i) => (
                          <img
                            key={i}
                            src={src}
                            alt=""
                            style={{
                              maxWidth: 200,
                              maxHeight: 200,
                              borderRadius: 10,
                              objectFit: "cover",
                              display: "block",
                            }}
                          />
                        ))}
                      </div>
                    ) : null}
                    {m.content || "…"}
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {attachments.length > 0 ? (
            <div
              style={{
                display: "flex",
                gap: 8,
                padding: "8px 12px",
                borderTop: `1px solid ${Colors.border}`,
                background: Colors.surface,
                overflowX: "auto",
              }}
            >
              {attachments.map((src, i) => (
                <div key={i} style={{ position: "relative", flexShrink: 0 }}>
                  <img
                    src={src}
                    alt=""
                    style={{
                      width: 56,
                      height: 56,
                      objectFit: "cover",
                      borderRadius: 8,
                      border: `1px solid ${Colors.border}`,
                    }}
                  />
                  <button
                    onClick={() => setAttachments(attachments.filter((_, j) => j !== i))}
                    style={{
                      position: "absolute",
                      top: -6,
                      right: -6,
                      width: 20,
                      height: 20,
                      borderRadius: 999,
                      background: Colors.danger,
                      color: "#fff",
                      border: "none",
                      fontSize: 12,
                      lineHeight: 1,
                      cursor: "pointer",
                    }}
                    title="Убрать"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          <div
            style={{
              display: "flex",
              gap: 8,
              padding: 12,
              borderTop: `1px solid ${Colors.border}`,
              background: Colors.surface,
            }}
          >
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              multiple
              hidden
              onChange={(e) => {
                if (e.target.files) void handleFiles(e.target.files);
                e.target.value = "";
              }}
            />
            <button
              onClick={() => fileRef.current?.click()}
              title="Прикрепить изображение"
              style={{
                background: Colors.surfaceAlt,
                border: "none",
                borderRadius: 12,
                padding: "10px 12px",
                color: Colors.accent,
                cursor: "pointer",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </button>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
              onPaste={(e) => {
                const items = e.clipboardData?.items;
                if (!items) return;
                const files: File[] = [];
                for (const it of Array.from(items)) {
                  if (it.type.startsWith("image/")) {
                    const f = it.getAsFile();
                    if (f) files.push(f);
                  }
                }
                if (files.length > 0) {
                  e.preventDefault();
                  void handleFiles(files);
                }
              }}
              placeholder="Сообщение… (Enter — отправить, можно вставить скриншот)"
              rows={1}
              style={{
                flex: 1,
                background: Colors.surfaceAlt,
                border: `1px solid ${Colors.border}`,
                borderRadius: 12,
                color: Colors.text,
                padding: "10px 12px",
                fontSize: 15,
                resize: "none",
                outline: "none",
                fontFamily: "inherit",
              }}
            />
            {busy ? (
              <button
                onClick={stop}
                style={{
                  background: Colors.danger,
                  border: "none",
                  borderRadius: 12,
                  padding: "10px 18px",
                  color: "#fff",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Стоп
              </button>
            ) : (
              <button
                onClick={() => void send()}
                disabled={!canSend}
                style={{
                  background: Colors.accent,
                  border: "none",
                  borderRadius: 12,
                  padding: "10px 18px",
                  color: "#fff",
                  fontWeight: 700,
                  cursor: canSend ? "pointer" : "not-allowed",
                  opacity: canSend ? 1 : 0.5,
                }}
              >
                Отправить
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
