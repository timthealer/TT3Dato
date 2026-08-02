import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { loadSettings, saveSettings } from "../storage";
import { Settings } from "../types";
import { Button, Card, Field } from "../components/UI";
import { Colors, Spacing } from "../theme";

export default function SettingsScreen() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings().then((s) => {
      setSettings(s);
      setLimited(s.maxTokens !== "");
    });
  }, []);

  const [limited, setLimited] = useState(false);

  if (!settings) return null;

  const update = (patch: Partial<Settings>) => {
    setSettings({ ...settings, ...patch });
    setSaved(false);
  };

  const save = () => {
    void saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Подключение к omni-роутеру</Text>
        <Card>
          <Field
            label="Адрес роутера (base URL)"
            placeholder="https://ваш-роутер.example.com/v1"
            placeholderTextColor={Colors.textDim}
            value={settings.baseUrl}
            onChangeText={(t) => update({ baseUrl: t })}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Field
            label="API-ключ"
            placeholder="введите ваш ключ"
            placeholderTextColor={Colors.textDim}
            value={settings.apiKey}
            onChangeText={(t) => update({ apiKey: t })}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
          />
          <Field
            label="Модель по умолчанию"
            placeholder="deepseek-chat"
            placeholderTextColor={Colors.textDim}
            value={settings.model}
            onChangeText={(t) => update({ model: t })}
            autoCapitalize="none"
          />
        </Card>

        <Text style={styles.sectionTitle}>Параметры генерации</Text>
        <Card>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>Ограничение токенов</Text>
              <Text style={styles.rowHint}>
                Выключено — лимит отключён, роутер отвечает без обрезки.
              </Text>
            </View>
            <Switch
              value={limited}
              onValueChange={(v) => {
                setLimited(v);
                update({ maxTokens: v ? "4096" : "" });
              }}
              trackColor={{ false: Colors.surfaceAlt, true: Colors.accentDim }}
              thumbColor={limited ? Colors.accent : Colors.textDim}
            />
          </View>
          {limited ? (
            <Field
              label="Максимум токенов"
              keyboardType="numeric"
              value={settings.maxTokens}
              onChangeText={(t) => update({ maxTokens: t.replace(/[^0-9]/g, "") })}
            />
          ) : null}
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>Температура</Text>
              <Text style={styles.rowHint}>{settings.temperature.toFixed(1)}</Text>
            </View>
          </View>
          <Field
            label="Температура (0.0 – 2.0)"
            keyboardType="numeric"
            value={String(settings.temperature)}
            onChangeText={(t) => {
              const v = parseFloat(t);
              update({ temperature: Number.isNaN(v) ? 0 : Math.max(0, Math.min(2, v)) });
            }}
          />
          <Field
            label="Системный промпт"
            multiline
            style={{ minHeight: 90, textAlignVertical: "top" }}
            value={settings.systemPrompt}
            onChangeText={(t) => update({ systemPrompt: t })}
          />
        </Card>

        <Button title="Сохранить настройки" onPress={save} />
        {saved ? <Text style={styles.saved}>Настройки сохранены</Text> : null}

        <Text style={styles.footer}>
          Приложение-ассистент для вашего omni-роутера. Ключ хранится только на
          устройстве. Роутер вы выбираете сами.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xl },
  sectionTitle: {
    color: Colors.textDim,
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  rowText: { flex: 1, marginRight: Spacing.md },
  rowLabel: { color: Colors.text, fontSize: 15, fontWeight: "600" },
  rowHint: { color: Colors.textDim, fontSize: 12, marginTop: 2, lineHeight: 16 },
  saved: { color: Colors.ok, textAlign: "center", marginTop: Spacing.md, fontWeight: "600" },
  footer: {
    color: Colors.textDim,
    fontSize: 12,
    lineHeight: 17,
    marginTop: Spacing.xl,
    textAlign: "center",
  },
});
