import React, { useEffect, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { loadSettings, saveSettings } from "../storage";
import { PRESET_MODELS, Settings } from "../types";
import { Field } from "../components/UI";
import { Colors, Radius, Spacing } from "../theme";

export default function ModelsScreen() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [custom, setCustom] = useState("");

  useEffect(() => {
    loadSettings().then(setSettings);
  }, []);

  if (!settings) return null;

  const models = [...new Set([...PRESET_MODELS, ...(custom ? [custom.trim()] : [])])];

  const select = (model: string) => {
    const next = { ...settings, model };
    setSettings(next);
    void saveSettings(next);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Модели</Text>
      </View>
      <View style={styles.current}>
        <Text style={styles.currentLabel}>Текущая модель</Text>
        <Text style={styles.currentModel}>{settings.model}</Text>
      </View>
      <FlatList
        data={models}
        keyExtractor={(m) => m}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const isActive = item === settings.model;
          return (
            <Pressable
              style={[styles.item, isActive && styles.itemActive]}
              onPress={() => select(item)}
            >
              <Text style={[styles.itemText, isActive && styles.itemTextActive]}>
                {item}
              </Text>
              {isActive ? <Text style={styles.check}>✓</Text> : null}
            </Pressable>
          );
        }}
        ListHeaderComponent={
          <View style={styles.customWrap}>
            <Field
              label="Своя модель"
              placeholder="например: my-omni-model"
              placeholderTextColor={Colors.textDim}
              value={custom}
              onChangeText={setCustom}
              autoCapitalize="none"
            />
            <Text style={styles.hint}>
              Модель берётся из вашего omni-роутера. Лимит токенов можно отключить в
              настройках.
            </Text>
          </View>
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
  current: {
    backgroundColor: Colors.surface,
    margin: Spacing.lg,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    marginBottom: 0,
  },
  currentLabel: { color: Colors.textDim, fontSize: 13 },
  currentModel: { color: Colors.accent, fontSize: 18, fontWeight: "800", marginTop: Spacing.xs },
  list: { flex: 1 },
  listContent: { padding: Spacing.lg, paddingTop: Spacing.md },
  customWrap: { marginBottom: Spacing.sm },
  hint: { color: Colors.textDim, fontSize: 12, marginTop: -Spacing.xs, lineHeight: 17 },
  item: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 14,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemActive: { borderColor: Colors.accent, backgroundColor: Colors.accentDim + "33" },
  itemText: { color: Colors.text, fontSize: 15, fontWeight: "600" },
  itemTextActive: { color: Colors.accent },
  check: { color: Colors.accent, fontWeight: "800", fontSize: 16 },
});
