import type { RepoConfig, RepoFile } from "./types";

const API = "https://api.github.com";

const BINARY_EXT = new Set([
  "apk", "png", "jpg", "jpeg", "gif", "webp", "ico", "bmp", "svgz",
  "pdf", "zip", "gz", "tar", "7z", "rar", "wasm", "mp4", "mp3",
  "ogg", "wav", "woff", "woff2", "ttf", "otf", "exe", "dll", "so",
  "o", "a", "keystore", "jks", "der", "pyc", "class",
]);

const MAX_VIEW_SIZE = 300 * 1024; // 300 КБ — предел для просмотра/отправки в чат

export const REPO_VIEW_LIMIT_KB = MAX_VIEW_SIZE / 1024;

export function isViewableFile(size: number, path: string): boolean {
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  return size <= MAX_VIEW_SIZE && !BINARY_EXT.has(ext);
}

function headers(cfg: RepoConfig): Record<string, string> {
  const h: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (cfg.token.trim()) h.Authorization = `Bearer ${cfg.token.trim()}`;
  return h;
}

function friendly(status: number, msg: string, hasToken: boolean): string {
  if (status === 401 || status === 403) {
    return hasToken
      ? "Нет доступа (403). Проверьте токен и права на репозиторий (нужны Contents: Read)."
      : "Репозиторий приватный или недоступен. Добавьте GitHub-токен с правами Contents: Read.";
  }
  if (status === 404) {
    return hasToken
      ? "Репозиторий не найден или токен не даёт к нему доступ."
      : "Репозиторий не найден. Проверьте имя или добавьте токен для приватного репозитория.";
  }
  if (status === 429) return "Превышен лимит запросов к GitHub. Подождите минуту.";
  return `GitHub API: ${status} ${msg}`;
}

export async function fetchRepoTree(cfg: RepoConfig): Promise<RepoFile[]> {
  const url = `${API}/repos/${encodeURIComponent(cfg.owner)}/${encodeURIComponent(cfg.repo)}/git/trees/HEAD?recursive=1`;
  const res = await fetch(url, { headers: headers(cfg) });
  if (!res.ok) throw new Error(friendly(res.status, res.statusText, Boolean(cfg.token.trim())));
  const data = (await res.json()) as { tree?: RepoFile[] };
  const tree = data.tree ?? [];
  return tree
    .filter((f) => f.type === "blob")
    .filter((f) => !/^(node_modules|dist|build|\.git|\.gradle|\.idea|__pycache__|vendor)\//.test(f.path))
    .filter((f) => isViewableFile(f.size, f.path))
    .sort((a, b) => a.path.localeCompare(b.path));
}

export async function fetchRepoFile(cfg: RepoConfig, path: string): Promise<string> {
  const url = `${API}/repos/${encodeURIComponent(cfg.owner)}/${encodeURIComponent(cfg.repo)}/contents/${encodeURIComponent(path)}`;
  const res = await fetch(url, {
    headers: { ...headers(cfg), Accept: "application/vnd.github.raw" },
  });
  if (!res.ok) throw new Error(friendly(res.status, res.statusText, Boolean(cfg.token.trim())));
  return await res.text();
}

// --- Локальный доступ к репозиторию (через dev-сервер) ---

export async function fetchLocalRepoTree(): Promise<RepoFile[]> {
  const res = await fetch("/__repo/tree");
  if (!res.ok) throw new Error(`Не удалось получить список файлов репозитория (${res.status}).`);
  return (await res.json()) as RepoFile[];
}

export async function fetchLocalRepoFile(path: string): Promise<string> {
  const res = await fetch(`/__repo/file?path=${encodeURIComponent(path)}`);
  if (!res.ok) throw new Error(`Не удалось открыть файл (${res.status}).`);
  return await res.text();
}

// --- Проверка токена и поиск файлов ---

export async function verifyGithubToken(token: string): Promise<string> {
  if (!token.trim()) throw new Error("Введите GitHub-токен.");
  const res = await fetch(`${API}/user`, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      Authorization: `Bearer ${token.trim()}`,
    },
  });
  if (!res.ok) throw new Error(friendly(res.status, res.statusText, true));
  const data = (await res.json()) as { login?: string };
  if (!data.login) throw new Error("Не удалось определить пользователя.");
  return data.login;
}

// Ищет файлы репозитория по имени (без пути). Сначала локальное дерево,
// при недоступности — GitHub API.
export async function searchRepoFiles(
  fileName: string,
  cfg?: RepoConfig
): Promise<RepoFile[]> {
  const lower = fileName.toLowerCase();
  const filter = (f: RepoFile) => f.path.toLowerCase().split("/").pop() === lower;
  try {
    const tree = await fetchLocalRepoTree();
    const hits = tree.filter(filter);
    if (hits.length > 0) return hits;
  } catch {
    // локальное дерево недоступно — пробуем GitHub
  }
  if (cfg && cfg.owner && cfg.repo) {
    const tree = await fetchRepoTree(cfg);
    return tree.filter(filter);
  }
  return [];
}
