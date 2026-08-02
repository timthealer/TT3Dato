import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { loadDocs, saveDocs } from "../storage";
import { Doc, uid, now } from "../types";
import { Button, Card } from "../components/UI";
import { Colors, Radius, Spacing } from "../theme";

export default function FilesScreen() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [editing, setEditing] = useState<Doc | null>(null);

  useEffect(() => {
    loadDocs().then(setDocs);
  }, []);

  const persist = useCallback((next: Doc[]) => {
    setDocs(next);
    void saveDocs(next);
  }, []);

  const openNew = () => {
    setEditing({ id: "", name: "", content: "", updatedAt: now() });
  };

  const save = () => {
    const n = (editing?.name ?? name).trim();
    if (!n) return;
    if (editing && editing.id) {
      persist(
        docs.map((d) =>
          d.id === editing.id
            ? { ...d, name: n, content, updatedAt: now() }
            : d
        )
      );
    } else {
      persist([
        { id: uid("doc"), name: n, content, updatedAt: now() },
        ...docs,
      ]);
    }
    setEditing(null);
    setName("");
    setContent("");
  };

  const remove = (id: string) => {
    persist(docs.filter((d) => d.id !== id));
  };

  const renderItem = ({ item }: { item: Doc }) => (
    <Card style={styles.docCard}>
      <Pressable
        style={styles.docRow}
        onPress={() => {
          setEditing(item);
          setContent(item.content);
        }}
      >
        <View style={styles.docInfo}>
          <Text style={styles.docName}>{item.name}</Text>
          <Text style={styles.docMeta}>
            {new Date(item.updatedAt).toLocaleString("ru-RU")}
          </Text>
        </View>
      </Pressable>
      <Pressable onPress={() => remove(item.id)} style={styles.delBtn}>
        <Text style={styles.delText}>Удалить</Text>
      </Pressable>
    </Card>
  );

  if (editing !== null) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.header}>
          <Pressable onPress={() => setEditing(null)}>
            <Text style={styles.back}>← Назад</Text>
          </Pressable>
          <Text style={styles.title}>Документ</Text>
        </View>
        <View style={styles.editorWrap}>
          <TextInput
            style={styles.editorName}
            placeholder="Название файла"
            placeholderTextColor={Colors.textDim}
            value={editing.name}
            onChangeText={(t) => setEditing({ ...editing, name: t })}
          />
          <TextInput
            style={styles.editor}
            placeholder="Содержимое (поддерживается Markdown)…"
            placeholderTextColor={Colors.textDim}
            value={content}
            onChangeText={setContent}
            multiline
          />
          <Button title="Сохранить" onPress={save} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Файлы и проекты</Text>
        <Pressable style={styles.newBtn} onPress={openNew}>
          <Text style={styles.newBtnText}>+ Новый</Text>
        </Pressable>
      </View>
      <FlatList
        data={docs}
        keyExtractor={(d) => d.id}
        renderItem={renderItem}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.empty}>
            Нет файлов. Создайте документ, план или заметку по проекту.
          </Text>
        }
      />
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
  back: { color: Colors.accent, fontWeight: "700", fontSize: 15 },
  title: { color: Colors.text, fontSize: 20, fontWeight: "800" },
  newBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.full,
    paddingVertical: 8,
    paddingHorizontal: Spacing.md,
  },
  newBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  list: { flex: 1 },
  listContent: { padding: Spacing.lg },
  docCard: { flexDirection: "row", alignItems: "center" },
  docRow: { flex: 1 },
  docInfo: { flex: 1 },
  docName: { color: Colors.text, fontSize: 15, fontWeight: "700" },
  docMeta: { color: Colors.textDim, fontSize: 12, marginTop: Spacing.xs },
  delBtn: { marginLeft: Spacing.sm, padding: Spacing.sm },
  delText: { color: Colors.danger, fontSize: 13, fontWeight: "600" },
  empty: { color: Colors.textDim, textAlign: "center", marginTop: Spacing.xl },
  editorWrap: { flex: 1, padding: Spacing.lg },
  editorName: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 11,
    color: Colors.text,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: Spacing.md,
  },
  editor: {
    flex: 1,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    color: Colors.text,
    fontSize: 15,
    textAlignVertical: "top",
    marginBottom: Spacing.md,
  },
});
