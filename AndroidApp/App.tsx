import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import TabBar, { TabKey } from "./src/components/TabBar";
import ChatScreen from "./src/screens/ChatScreen";
import TasksScreen from "./src/screens/TasksScreen";
import ModelsScreen from "./src/screens/ModelsScreen";
import FilesScreen from "./src/screens/FilesScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import { Colors } from "./src/theme";

export default function App() {
  const [tab, setTab] = useState<TabKey>("chat");

  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        <View style={styles.content}>
          {tab === "chat" && <ChatScreen />}
          {tab === "tasks" && <TasksScreen />}
          {tab === "models" && <ModelsScreen />}
          {tab === "files" && <FilesScreen />}
          {tab === "settings" && <SettingsScreen />}
        </View>
        <TabBar active={tab} onChange={setTab} />
        <StatusBar style="light" />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  content: { flex: 1 },
});
