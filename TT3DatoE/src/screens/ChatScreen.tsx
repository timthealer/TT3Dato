import { useCallback, useEffect, useRef, useState } from "react";
import { chatCompletion, friendlyError } from "../api";
import {
  loadActiveConv,
  loadConversations,
  loadDraft,
  loadSettings,
  saveActiveConv,
  saveConversations,
  saveDraft,
} from "../storage";
import { Colors } from "../theme";
import { uid, now } from "../types";
import type { Conversation, Message, Settings } from "../types";

export default function ChatScreen() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSettings(loadSettings());
    const list = loadConversations();
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

  const send = async () => {
    const text = draft.trim();
    if (!text || !settings || busy || !active) return;
    setDraft("");
    setError(null);

    const userMsg: Message = { id: uid("m"), role: "user", content: text, ts: now() };
    const usedModel = settings.taskMode === "auto" ? "auto" : settings.taskMode;
    patchActive((c) => ({ ...c, model: usedModel }));
    const systemMsg: Message = {
      id: uid("m"),
      role: "system",
      content: settings.systemPrompt,
      ts: now(),
    };
    const history = active.messages;
    const apiMessages = [systemMsg, ...history, userMsg];
    patchActive((c) => ({
      ...c,
      title: c.title === "Новый чат" ? text.slice(0, 40) : c.title,
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
            лучшую бесплатную модель под задачу. Добавьте бесплатные ключи во вкладке
            «Настройки», если ещё этого не сделали.
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
                    {m.content || "…"}
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          <div
            style={{
              display: "flex",
              gap: 8,
              padding: 12,
              borderTop: `1px solid ${Colors.border}`,
              background: Colors.surface,
            }}
          >
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
              placeholder="Сообщение… (Enter — отправить)"
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
                disabled={!draft.trim()}
                style={{
                  background: Colors.accent,
                  border: "none",
                  borderRadius: 12,
                  padding: "10px 18px",
                  color: "#fff",
                  fontWeight: 700,
                  cursor: draft.trim() ? "pointer" : "not-allowed",
                  opacity: draft.trim() ? 1 : 0.5,
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
