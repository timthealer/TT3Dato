import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { chatCompletion } from "../api";
import { loadConversations, loadSettings, saveConversations } from "../storage";
import { Conversation, Message, Settings, uid, now } from "../types";
import { Colors, Radius, Spacing } from "../theme";

export default function ChatScreen() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<FlatList<Message>>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    (async () => {
      const [s, c] = await Promise.all([loadSettings(), loadConversations()]);
      setSettings(s);
      setConvs(c);
    })();
  }, []);

  const active = convs.find((c) => c.id === activeId) ?? null;

  const persist = useCallback(
    (next: Conversation[]) => {
      setConvs(next);
      void saveConversations(next);
    },
    []
  );

  const newChat = () => {
    const c: Conversation = {
      id: uid("conv"),
      title: "Новый чат",
      model: settings?.model ?? "deepseek-chat",
      createdAt: now(),
      updatedAt: now(),
      messages: [],
    };
    persist([c, ...convs]);
    setActiveId(c.id);
    setError(null);
  };

  const patchActive = useCallback(
    (fn: (c: Conversation) => Conversation) => {
      setConvs((prev) => {
        const next = prev.map((c) =>
          c.id === activeId ? fn(c) : c
        );
        void saveConversations(next);
        return next;
      });
    },
    [activeId]
  );

  const send = async () => {
    const text = draft.trim();
    if (!text || !settings || busy) return;
    if (!active) return;
    setDraft("");
    setError(null);

    const userMsg: Message = { id: uid("m"), role: "user", content: text, ts: now() };
    const systemMsg: Message = {
      id: uid("m"),
      role: "system",
      content: settings.systemPrompt,
      ts: now(),
    };
    const history = active.messages;
    const fullHistory = history.length > 0 ? history : [systemMsg];
    const nextMessages = [...fullHistory, userMsg];
    patchActive((c) => ({
      ...c,
      title: c.title === "Новый чат" ? text.slice(0, 40) : c.title,
      updatedAt: now(),
      messages: nextMessages,
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
      const reply = await chatCompletion(settings, nextMessages, {
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
        messages: c.messages.map((m) =>
          m.id === assistantMsg.id ? { ...m, content: reply } : m
        ),
      }));
    } catch (e: any) {
      if (e?.name === "AbortError") return;
      setError(e?.message ?? "Не удалось получить ответ.");
      patchActive((c) => ({
        ...c,
        updatedAt: now(),
        messages: c.messages.map((m) =>
          m.id === assistantMsg.id
            ? { ...m, content: "⚠ Ошибка: " + (e?.message ?? "нет ответа") }
            : m
        ),
      }));
    } finally {
      setBusy(false);
      abortRef.current = null;
    }
  };

  const stop = () => abortRef.current?.abort();

  const renderItem = ({ item }: { item: Message }) => {
    const isUser = item.role === "user";
    return (
      <View style={[styles.bubbleWrap, isUser ? styles.rowRight : styles.rowLeft]}>
        <View style={[styles.bubble, isUser ? styles.userBubble : styles.botBubble]}>
          <Text style={styles.bubbleText}>{item.content || "…"}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>AI-ассистент</Text>
        <Pressable style={styles.newBtn} onPress={newChat}>
          <Text style={styles.newBtnText}>+ Новый чат</Text>
        </Pressable>
      </View>
      {error ? (
        <View style={styles.errorBar}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
      {!active ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Начните новый чат</Text>
          <Text style={styles.emptySub}>
            Задайте вопрос или опишите задачу. Ответы придут через ваш omni-роутер.
          </Text>
          <Pressable style={styles.emptyBtn} onPress={newChat}>
            <Text style={styles.emptyBtnText}>Создать чат</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <FlatList
            ref={listRef}
            data={active.messages}
            keyExtractor={(m) => m.id}
            renderItem={renderItem}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          />
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="Сообщение…"
                placeholderTextColor={Colors.textDim}
                value={draft}
                onChangeText={setDraft}
                multiline
                editable={!busy}
              />
              {busy ? (
                <Pressable style={styles.sendBtn} onPress={stop}>
                  <Text style={styles.sendBtnText}>Стоп</Text>
                </Pressable>
              ) : (
                <Pressable
                  style={[styles.sendBtn, !draft.trim() && styles.sendBtnOff]}
                  onPress={send}
                  disabled={!draft.trim()}
                >
                  <Text style={styles.sendBtnText}>Отправить</Text>
                </Pressable>
              )}
            </View>
          </KeyboardAvoidingView>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: { color: Colors.text, fontSize: 20, fontWeight: "800" },
  newBtn: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.full,
    paddingVertical: 8,
    paddingHorizontal: Spacing.md,
  },
  newBtnText: { color: Colors.accent, fontWeight: "700", fontSize: 13 },
  errorBar: {
    backgroundColor: "rgba(231,76,60,0.15)",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  errorText: { color: Colors.danger, fontSize: 13 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: Spacing.xl },
  emptyTitle: { color: Colors.text, fontSize: 18, fontWeight: "700", marginBottom: Spacing.sm },
  emptySub: {
    color: Colors.textDim,
    fontSize: 14,
    textAlign: "center",
    marginBottom: Spacing.xl,
    lineHeight: 20,
  },
  emptyBtn: {
    backgroundColor: Colors.accent,
    paddingVertical: 12,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.full,
  },
  emptyBtnText: { color: "#fff", fontWeight: "700" },
  list: { flex: 1 },
  listContent: { padding: Spacing.md, paddingBottom: Spacing.xl },
  rowLeft: { alignItems: "flex-start" },
  rowRight: { alignItems: "flex-end" },
  bubbleWrap: { marginBottom: Spacing.sm, width: "100%" },
  bubble: {
    maxWidth: "88%",
    borderRadius: Radius.lg,
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
  },
  userBubble: { backgroundColor: Colors.userBubble, borderBottomRightRadius: 4 },
  botBubble: { backgroundColor: Colors.botBubble, borderBottomLeftRadius: 4 },
  bubbleText: { color: Colors.text, fontSize: 15, lineHeight: 21 },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.lg,
    color: Colors.text,
    paddingHorizontal: Spacing.md,
    paddingTop: 10,
    paddingBottom: 10,
    maxHeight: 140,
    fontSize: 15,
    marginRight: Spacing.sm,
  },
  sendBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.lg,
    paddingVertical: 12,
    paddingHorizontal: Spacing.lg,
    justifyContent: "center",
  },
  sendBtnOff: { opacity: 0.5 },
  sendBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
