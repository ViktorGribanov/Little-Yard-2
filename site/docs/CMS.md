# Админка (Decap CMS)

Админка — статическая страница `/admin/`, которая читает и правит те же JSON-файлы,
что импортирует сайт (`src/data/*.json`). Отдельной базы данных нет: каждая правка —
это коммит в репозиторий, а сайт пересобирается из изменившихся файлов.

## Что где

| Что | Где |
| --- | --- |
| Страница админки | `public/admin/index.html` |
| Описание разделов и полей | `public/admin/config.yml` |
| Контент, который она правит | `src/data/houses.json`, `site.json`, `sections.json`, `faq.json` |
| Загруженные фото | `public/images/uploads/` → на сайте `/images/uploads/…` |

Разделы админки: **Дома**, **Сайт** (первый экран, меню, контакты, подвал, SEO),
**Тексты секций**, **Частые вопросы**, плюс **Media** для загрузки фотографий.

## Локально (без аккаунтов)

Пока репозиторий и OAuth не настроены, админка работает через локальный прокси
`decap-server`, который пишет прямо в файлы проекта.

Терминал 1:

    npm run dev        # сайт на http://localhost:4321

Терминал 2:

    npm run cms        # прокси на http://localhost:8081

Открыть <http://localhost:4321/admin/> и нажать **Login** — учётная запись не нужна,
вход идёт в локальный прокси. Правки сразу попадают в `src/data/*.json`; чтобы
увидеть их на сайте, пересоберите страницу или перезагрузите dev-сервер.

## На сервере (GitHub + Cloudflare, бесплатно)

1. Репозиторий на GitHub, проект в нём (`site/` можно сделать корнем или оставить папкой).
2. Cloudflare Pages подключается к репозиторию, build command `npm run build`, output `dist`.
3. Создать GitHub OAuth App: callback URL — адрес Worker'а (шаг 4).
4. Развернуть Cloudflare Worker — прокси, который обменивает код GitHub на токен:

```js
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/auth') {
      const redirect = `https://github.com/login/oauth/authorize?client_id=${env.GITHUB_CLIENT_ID}` +
        `&scope=repo&redirect_uri=${encodeURIComponent(url.origin + '/callback')}`;
      return Response.redirect(redirect, 302);
    }
    if (url.pathname === '/callback') {
      const res = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code: url.searchParams.get('code'),
        }),
      });
      const { access_token } = await res.json();
      const body = `<!doctype html><script>
        window.opener.postMessage('authorization:github:success:${JSON.stringify({ token: access_token, provider: 'github' })}', '*');
      </script>`;
      return new Response(body, { headers: { 'Content-Type': 'text/html' } });
    }
    return new Response('Not found', { status: 404 });
  },
};
```

5. В `public/admin/config.yml` заменить `repo` на свой (`владелец/репозиторий`),
   `base_url` — на адрес Worker'а, и убрать `local_backend: true`.

Секреты (`GITHUB_CLIENT_SECRET`) живут в переменных окружения Worker'а, в репозиторий
не попадают.

## Безопасность

- Админка — публичный URL; доступ даёт только вход через GitHub, у которого включена
  2FA на аккаунте владельца.
- Своего сервера и базы нет — нечего патчить и бэкапить: история правок и есть бэкап.
- Фото в медиатеке коммитятся в репозиторий; для десятков снимков это нормально,
  для сотен мегабайт — повод перейти на внешнее хранилище.

## Что проверить после настройки

- Правка цены в «Домах» → сохранение → в `src/data/houses.json` изменилось значение.
- Загрузка фото в медиатеку → файл появился в `public/images/uploads/`.
- Пересборка сайта показывает изменения.
