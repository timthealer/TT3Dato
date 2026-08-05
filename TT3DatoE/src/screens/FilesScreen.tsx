import { useCallback, useEffect, useState } from "react";
import {
  fetchLocalRepoFile,
  fetchLocalRepoTree,
  fetchRepoFile,
  fetchRepoTree,
  verifyGithubToken,
} from "../github";
import {
  loadDocs,
  loadRepo,
  saveDocs,
  savePendingContext,
  saveRepo,
} from "../storage";
import { Colors } from "../theme";
import { uid, now } from "../types";
import type { Doc, RepoConfig, RepoFile } from "../types";
import { Button, Card, Field } from "../components/UI";
import type { TabKey } from "../theme";

type RepoMode = "local" | "github";

function Spinner() {
  return (
    <div
      style={{
        display: "inline-block",
        width: 16,
        height: 16,
        border: `2px solid ${Colors.surfaceAlt}`,
        borderTopColor: Colors.accent,
        borderRadius: "50%",
        animation: "tt3spin 0.8s linear infinite",
        verticalAlign: "middle",
        marginRight: 6,
      }}
    />
  );
}

export default function FilesScreen({ onNavigate }: { onNavigate: (t: TabKey) => void }) {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [editing, setEditing] = useState<Doc | null>(null);
  const [content, setContent] = useState("");
  const [repo, setRepo] = useState<RepoConfig>(() => loadRepo());
  const [mode, setMode] = useState<RepoMode>("local");
  const [files, setFiles] = useState<RepoFile[] | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [repoError, setRepoError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<string | null>(null);
  const [viewing, setViewing] = useState<{ path: string; text: string } | null>(null);
  const [viewLoading, setViewLoading] = useState(false);

  useEffect(() => {
    setDocs(loadDocs());
  }, []);

  const persist = useCallback((next: Doc[]) => {
    setDocs(next);
    saveDocs(next);
  }, []);

  const patchRepo = (patch: Partial<RepoConfig>) => {
    const next = { ...repo, ...patch };
    setRepo(next);
    saveRepo(next);
  };

  const loadTree = async () => {
    setLoading(true);
    setRepoError(null);
    setViewing(null);
    try {
      if (mode === "local") {
        const tree = await fetchLocalRepoTree();
        setFiles(tree);
      } else {
        if (!repo.owner.trim() || !repo.repo.trim()) {
          setRepoError("Укажите владельца и имя репозитория.");
          return;
        }
        const tree = await fetchRepoTree(repo);
        setFiles(tree);
      }
    } catch (e) {
      setFiles(null);
      setRepoError(e instanceof Error ? e.message : "Не удалось загрузить репозиторий.");
    } finally {
      setLoading(false);
    }
  };

  const checkToken = async () => {
    setVerifying(true);
    setVerifyResult(null);
    try {
      const login = await verifyGithubToken(repo.token);
      setVerifyResult(`Токен рабочий. Владелец: ${login}`);
    } catch (e) {
      setVerifyResult(e instanceof Error ? e.message : "Не удалось проверить токен.");
    } finally {
      setVerifying(false);
    }
  };

  const openFile = async (path: string) => {
    setViewLoading(true);
    setRepoError(null);
    try {
      const text =
        mode === "local" ? await fetchLocalRepoFile(path) : await fetchRepoFile(repo, path);
      setViewing({ path, text });
    } catch (e) {
      setViewing({ path, text: e instanceof Error ? e.message : "Не удалось открыть файл." });
    } finally {
      setViewLoading(false);
    }
  };

  const sendToChat = (path: string, text: string) => {
    savePendingContext({
      content: `[Файл из репозитория: ${path}]\n\n${text}`,
      title: path,
      ts: now(),
    });
    setViewing(null);
    onNavigate("chat");
  };

  const openNew = () => {
    setEditing({ id: "", name: "", content: "", updatedAt: now() });
    setContent("");
  };

  const open = (d: Doc) => {
    setEditing({ ...d });
    setContent(d.content);
  };

  const save = () => {
    if (!editing) return;
    const n = editing.name.trim();
    if (!n) return;
    if (editing.id) {
      persist(
        docs.map((d) =>
          d.id === editing.id ? { ...d, name: n, content, updatedAt: now() } : d
        )
      );
    } else {
      persist([{ id: uid("doc"), name: n, content, updatedAt: now() }, ...docs]);
    }
    setEditing(null);
  };

  const remove = (id: string) => {
    persist(docs.filter((d) => d.id !== id));
  };

  if (editing !== null) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <button
            onClick={() => setEditing(null)}
            style={{ background: "none", border: "none", color: Colors.accent, fontWeight: 700, cursor: "pointer" }}
          >
            ← Назад
          </button>
          <div style={{ fontSize: 20, fontWeight: 800 }}>Документ</div>
        </div>
        <input
          value={editing.name}
          onChange={(e) => setEditing({ ...editing, name: e.target.value })}
          placeholder="Название файла"
          style={inputStyle}
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Содержимое (поддерживается Markdown)…"
          style={{ ...inputStyle, flex: 1, minHeight: 200, marginTop: 12, resize: "none" }}
        />
        <div style={{ marginTop: 12 }}>
          <Button title="Сохранить" onClick={save} />
        </div>
      </div>
    );
  }

  const filtered = files
    ? query.trim()
      ? files.filter((f) => f.path.toLowerCase().includes(query.trim().toLowerCase()))
      : files
    : null;

  return (
    <div style={{ padding: 16 }}>
      <style>{`@keyframes tt3spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 20, fontWeight: 800 }}>Файлы и проекты</div>
        <button
          onClick={openNew}
          style={{
            background: Colors.accent,
            border: "none",
            borderRadius: 999,
            padding: "8px 14px",
            color: "#fff",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          + Новый
        </button>
      </div>

      <Card>
        <div style={{ color: Colors.text, fontSize: 15, fontWeight: 700, marginBottom: 6 }}>
          Репозиторий
        </div>
        <div style={{ color: Colors.textDim, fontSize: 13, marginBottom: 10, lineHeight: 1.4 }}>
          Доступ к репозиторию проекта. Открывайте файлы и отправляйте их агенту в чат,
          чтобы он помогал по вашему коду.
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <button
            onClick={() => setMode("local")}
            style={{
              background: mode === "local" ? Colors.accent : Colors.surfaceAlt,
              border: "none",
              borderRadius: 999,
              padding: "6px 12px",
              color: mode === "local" ? "#fff" : Colors.text,
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Локально (с сервера)
          </button>
          <button
            onClick={() => setMode("github")}
            style={{
              background: mode === "github" ? Colors.accent : Colors.surfaceAlt,
              border: "none",
              borderRadius: 999,
              padding: "6px 12px",
              color: mode === "github" ? "#fff" : Colors.text,
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            GitHub
          </button>
        </div>
        {mode === "local" ? (
          <div style={{ color: Colors.textDim, fontSize: 13, marginBottom: 10, lineHeight: 1.4 }}>
            Файлы читаются напрямую с сервера, где развёрнут репозиторий. Токен не нужен.
          </div>
        ) : (
          <>
            <Field
              label="Владелец"
              value={repo.owner}
              onChange={(e) => patchRepo({ owner: e.target.value })}
              autoComplete="off"
            />
            <Field
              label="Репозиторий"
              value={repo.repo}
              onChange={(e) => patchRepo({ repo: e.target.value })}
              autoComplete="off"
            />
            <Field
              label="GitHub-токен (для приватных репозиториев)"
              type="password"
              value={repo.token}
              onChange={(e) => patchRepo({ token: e.target.value })}
              placeholder="github_pat_… или ghp_…"
              autoComplete="off"
            />
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <Button
                title={verifying ? "Проверяю…" : "Проверить токен"}
                onClick={() => void checkToken()}
                variant="ghost"
                disabled={verifying || !repo.token.trim()}
              />
              <a
                href="https://github.com/settings/tokens"
                target="_blank"
                rel="noreferrer"
                style={{ color: Colors.accent, fontSize: 13 }}
              >
                Как получить токен
              </a>
            </div>
            {verifyResult ? (
              <div
                style={{
                  color: verifyResult.startsWith("Токен рабочий") ? Colors.ok : Colors.danger,
                  fontSize: 13,
                  marginTop: 8,
                  lineHeight: 1.5,
                }}
              >
                {verifyResult}
              </div>
            ) : null}
          </>
        )}
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginTop: mode === "github" ? 12 : 0 }}>
          <Button title={loading ? "Загружаю…" : "Загрузить файлы"} onClick={() => void loadTree()} disabled={loading} />
          {loading ? <Spinner /> : null}
        </div>
        {repoError ? (
          <div style={{ color: Colors.danger, fontSize: 13, marginTop: 10, lineHeight: 1.5 }}>{repoError}</div>
        ) : null}
        {files && files.length > 0 ? (
          <div style={{ marginTop: 12 }}>
            <div style={{ color: Colors.textDim, fontSize: 12, marginBottom: 6 }}>
              Файлов: {filtered?.length ?? 0} / {files.length}
            </div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск по файлам…"
              style={{ ...inputStyle, marginBottom: 6 }}
            />
            <div style={{ maxHeight: 260, overflowY: "auto", border: `1px solid ${Colors.border}`, borderRadius: 8 }}>
              {filtered && filtered.length > 0 ? (
                filtered.map((f) => (
                  <div
                    key={f.path}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 8,
                      padding: "6px 10px",
                      borderBottom: `1px solid ${Colors.border}`,
                      fontSize: 13,
                    }}
                  >
                    <button
                      onClick={() => void openFile(f.path)}
                      style={{
                        background: "none",
                        border: "none",
                        color: Colors.text,
                        cursor: "pointer",
                        textAlign: "left",
                        flex: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {f.path}
                    </button>
                    <span style={{ color: Colors.textDim, fontSize: 11, flexShrink: 0 }}>
                      {f.size > 1024 ? `${Math.round(f.size / 1024)} КБ` : `${f.size} Б`}
                    </span>
                  </div>
                ))
              ) : (
                <div style={{ color: Colors.textDim, fontSize: 12, padding: 10 }}>
                  Ничего не найдено
                </div>
              )}
            </div>
          </div>
        ) : null}
      </Card>

      {viewing ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: 16,
          }}
          onClick={() => setViewing(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: Colors.surface,
              border: `1px solid ${Colors.border}`,
              borderRadius: 12,
              maxWidth: 860,
              width: "100%",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
              padding: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <div style={{ color: Colors.text, fontSize: 14, fontWeight: 700, wordBreak: "break-all" }}>
                {viewing.path}
              </div>
              <button
                onClick={() => setViewing(null)}
                style={{ background: "none", border: "none", color: Colors.textDim, fontSize: 14, cursor: "pointer" }}
              >
                Закрыть
              </button>
            </div>
            {viewLoading ? (
              <div style={{ color: Colors.textDim, padding: 16 }}>
                <Spinner />
                Открываю файл…
              </div>
            ) : (
              <pre
                style={{
                  background: Colors.surfaceAlt,
                  borderRadius: 8,
                  padding: 12,
                  color: Colors.text,
                  fontSize: 12,
                  lineHeight: 1.5,
                  overflowX: "auto",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  flex: 1,
                  overflowY: "auto",
                  margin: 0,
                  marginBottom: 12,
                }}
              >
                {viewing.text}
              </pre>
            )}
            <div style={{ display: "flex", gap: 8 }}>
              <Button title="Отправить в чат" onClick={() => sendToChat(viewing.path, viewing.text)} />
            </div>
          </div>
        </div>
      ) : null}

      <div
        style={{
          fontSize: 13,
          fontWeight: 800,
          textTransform: "uppercase",
          color: Colors.textDim,
          marginBottom: 8,
          marginTop: 8,
        }}
      >
        Заметки и документы
      </div>

      {docs.length === 0 ? (
        <div style={{ color: Colors.textDim, textAlign: "center", marginTop: 24 }}>
          Нет файлов. Создайте документ, план или заметку по проекту.
        </div>
      ) : (
        docs.map((d) => (
          <Card key={d.id}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <button
                onClick={() => open(d)}
                style={{ background: "none", border: "none", cursor: "pointer", textAlign: "left", flex: 1 }}
              >
                <div style={{ color: Colors.text, fontSize: 15, fontWeight: 700 }}>{d.name}</div>
                <div style={{ color: Colors.textDim, fontSize: 12, marginTop: 2 }}>
                  {new Date(d.updatedAt).toLocaleString("ru-RU")}
                </div>
              </button>
              <button
                onClick={() => remove(d.id)}
                style={{ background: "none", border: "none", color: Colors.danger, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
              >
                Удалить
              </button>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  background: Colors.surfaceAlt,
  border: `1px solid ${Colors.border}`,
  borderRadius: 8,
  color: Colors.text,
  padding: "11px 12px",
  fontSize: 15,
  width: "100%",
  outline: "none",
  fontFamily: "inherit",
};
