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
import { loadTasks, saveTasks } from "../storage";
import { Task, TaskStatus, uid, now } from "../types";
import { Button, Card } from "../components/UI";
import { Colors, Radius, Spacing } from "../theme";

const STATUS_LABEL: Record<TaskStatus, string> = {
  new: "Новая",
  in_progress: "В работе",
  done: "Готово",
  failed: "Ошибка",
};

const STATUS_COLOR: Record<TaskStatus, string> = {
  new: Colors.textDim,
  in_progress: Colors.warn,
  done: Colors.ok,
  failed: Colors.danger,
};

export default function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");

  useEffect(() => {
    loadTasks().then(setTasks);
  }, []);

  const persist = useCallback((next: Task[]) => {
    setTasks(next);
    void saveTasks(next);
  }, []);

  const add = () => {
    const t = title.trim();
    if (!t) return;
    const task: Task = {
      id: uid("task"),
      title: t,
      description: desc.trim(),
      status: "new",
      createdAt: now(),
      updatedAt: now(),
    };
    persist([task, ...tasks]);
    setTitle("");
    setDesc("");
  };

  const setStatus = (id: string, status: TaskStatus) => {
    persist(
      tasks.map((t) => (t.id === id ? { ...t, status, updatedAt: now() } : t))
    );
  };

  const renderItem = ({ item }: { item: Task }) => (
    <Card>
      <View style={styles.row}>
        <View style={styles.taskInfo}>
          <Text style={styles.taskTitle}>{item.title}</Text>
          {item.description ? (
            <Text style={styles.taskDesc}>{item.description}</Text>
          ) : null}
        </View>
        <View style={styles.statusWrap}>
          <View
            style={[
              styles.statusPill,
              { backgroundColor: STATUS_COLOR[item.status] + "22" },
            ]}
          >
            <Text style={{ color: STATUS_COLOR[item.status], fontSize: 12, fontWeight: "700" }}>
              {STATUS_LABEL[item.status]}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.actions}>
        <Pressable style={styles.actionBtn} onPress={() => setStatus(item.id, "in_progress")}>
          <Text style={styles.actionText}>В работу</Text>
        </Pressable>
        <Pressable style={styles.actionBtn} onPress={() => setStatus(item.id, "done")}>
          <Text style={styles.actionTextOk}>Готово</Text>
        </Pressable>
        <Pressable style={styles.actionBtn} onPress={() => setStatus(item.id, "failed")}>
          <Text style={styles.actionTextDanger}>Ошибка</Text>
        </Pressable>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Задачи</Text>
      </View>
      <Card style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Название задачи"
          placeholderTextColor={Colors.textDim}
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="Описание (необязательно)"
          placeholderTextColor={Colors.textDim}
          value={desc}
          onChangeText={setDesc}
          multiline
        />
        <Button title="Добавить задачу" onPress={add} disabled={!title.trim()} />
      </Card>
      <FlatList
        data={tasks}
        keyExtractor={(t) => t.id}
        renderItem={renderItem}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.empty}>Пока нет задач. Создайте первую.</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: { color: Colors.text, fontSize: 20, fontWeight: "800" },
  form: { marginHorizontal: Spacing.lg, marginTop: Spacing.md },
  input: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 11,
    color: Colors.text,
    fontSize: 15,
    marginBottom: Spacing.sm,
  },
  textarea: { minHeight: 60, textAlignVertical: "top" },
  list: { flex: 1 },
  listContent: { padding: Spacing.lg, paddingTop: 0 },
  row: { flexDirection: "row", alignItems: "flex-start" },
  taskInfo: { flex: 1 },
  taskTitle: { color: Colors.text, fontSize: 15, fontWeight: "700" },
  taskDesc: { color: Colors.textDim, fontSize: 13, marginTop: Spacing.xs },
  statusWrap: { marginLeft: Spacing.sm },
  statusPill: {
    borderRadius: Radius.full,
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
  },
  actions: {
    flexDirection: "row",
    marginTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
  },
  actionBtn: { marginRight: Spacing.lg },
  actionText: { color: Colors.warn, fontWeight: "600", fontSize: 13 },
  actionTextOk: { color: Colors.ok, fontWeight: "600", fontSize: 13 },
  actionTextDanger: { color: Colors.danger, fontWeight: "600", fontSize: 13 },
  empty: { color: Colors.textDim, textAlign: "center", marginTop: Spacing.xl },
});
