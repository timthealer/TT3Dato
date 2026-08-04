import type { RepoConfig, RepoFile } from "./types";

const API = "https://api.github.com";

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
