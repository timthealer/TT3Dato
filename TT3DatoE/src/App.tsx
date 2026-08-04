import { useEffect, useState } from "react";
import TabBar from "./components/TabBar";
import ChatScreen from "./screens/ChatScreen";
import TasksScreen from "./screens/TasksScreen";
import ModelsScreen from "./screens/ModelsScreen";
import FilesScreen from "./screens/FilesScreen";
import SettingsScreen from "./screens/SettingsScreen";
import { loadTab, saveTab } from "./storage";
import type { TabKey } from "./theme";

export default function App() {
  const [tab, setTab] = useState<TabKey>(() => loadTab() as TabKey);

  useEffect(() => {
    saveTab(tab);
  }, [tab]);

  return (
    <div className="app">
      <div className="content">
        {tab === "chat" && <ChatScreen />}
        {tab === "tasks" && <TasksScreen />}
        {tab === "models" && <ModelsScreen />}
        {tab === "files" && <FilesScreen onNavigate={setTab} />}
        {tab === "settings" && <SettingsScreen />}
      </div>
      <TabBar active={tab} onChange={setTab} />
    </div>
  );
}
