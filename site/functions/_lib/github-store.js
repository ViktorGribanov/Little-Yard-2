// Хранилище заявок для продакшена: заявка коммитится в репозиторий через
// GitHub API. Отдельной базы нет — история правок и есть журнал заявок.
//
// Переменные окружения Cloudflare Pages:
//   GITHUB_TOKEN  — fine-grained token с правом Contents: write
//   GITHUB_REPO   — owner/repo
//   GITHUB_BRANCH — ветка, по умолчанию main

const API = 'https://api.github.com';

export class StorageNotConfigured extends Error {}

function config(env) {
  const token = env?.GITHUB_TOKEN;
  const repo = env?.GITHUB_REPO;
  if (!token || !repo) {
    throw new StorageNotConfigured(
      'Хранилище заявок не настроено: задайте GITHUB_TOKEN и GITHUB_REPO в переменных Cloudflare Pages.'
    );
  }
  return { token, repo, branch: env.GITHUB_BRANCH || 'main', path: env.BOOKINGS_PATH || 'site/src/data/bookings.json' };
}

async function githubFetch(env, url, init = {}, fetchImpl = fetch) {
  const { token } = config(env);
  const response = await fetchImpl(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'little-yard-booking',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(init.headers || {}),
    },
  });
  return response;
}

/** Читает bookings.json из репозитория вместе с sha (нужен для записи). */
export async function readBookingsFromRepo(env, fetchImpl = fetch) {
  const { repo, branch, path } = config(env);
  const response = await githubFetch(
    env,
    `${API}/repos/${repo}/contents/${encodeURIComponent(path)}?ref=${branch}`,
    {},
    fetchImpl
  );
  if (response.status === 404) {
    return { bookings: [], sha: null };
  }
  if (!response.ok) {
    throw new Error(`Не удалось прочитать заявки из GitHub: ${response.status}`);
  }
  const data = await response.json();
  const bytes = Uint8Array.from(atob(data.content.replace(/\s/g, '')), (c) => c.charCodeAt(0));
  const parsed = JSON.parse(new TextDecoder('utf-8').decode(bytes));
  return { bookings: Array.isArray(parsed.bookings) ? parsed.bookings : [], sha: data.sha };
}

/** Коммитит обновлённый список заявок. */
export async function commitBookings(env, bookings, sha, fetchImpl = fetch) {
  const { repo, branch, path } = config(env);
  const encoded = new TextEncoder().encode(JSON.stringify({ bookings }, null, 2) + '\n');
  let binary = '';
  for (const byte of encoded) binary += String.fromCharCode(byte);
  const content = btoa(binary);
  const response = await githubFetch(
    env,
    `${API}/repos/${repo}/contents/${encodeURIComponent(path)}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `Заявка с сайта (${new Date().toISOString().slice(0, 10)})`,
        content,
        branch,
        ...(sha ? { sha } : {}),
      }),
    },
    fetchImpl
  );
  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`Не удалось сохранить заявку в GitHub: ${response.status} ${detail.slice(0, 200)}`);
  }
  return response.json();
}
