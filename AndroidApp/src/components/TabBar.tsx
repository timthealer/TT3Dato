import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, Spacing, Radius } from "../theme";

export type TabKey = "chat" | "tasks" | "models" | "files" | "settings";

const TABS: { key: TabKey; label: string }[] = [
  { key: "chat", label: "Чат" },
  { key: "tasks", label: "Задачи" },
  { key: "models", label: "Модели" },
  { key: "files", label: "Файлы" },
  { key: "settings", label: "Настройки" },
];

interface Props {
  active: TabKey;
  onChange: (key: TabKey) => void;
}

export default function TabBar({ active, onChange }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom + Spacing.sm }]}>
      {TABS.map((t) => {
        const isActive = t.key === active;
        return (
          <Pressable
            key={t.key}
            style={styles.item}
            onPress={() => onChange(t.key)}
          >
            <View style={[styles.pill, isActive && styles.pillActive]}>
              <Text style={[styles.label, isActive && styles.labelActive]}>
                {t.label}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  item: { flex: 1, alignItems: "center" },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.full,
    minWidth: 68,
    alignItems: "center",
  },
  pillActive: { backgroundColor: Colors.accentDim },
  label: { color: Colors.textDim, fontSize: 13, fontWeight: "600" },
  labelActive: { color: Colors.accent },
});
