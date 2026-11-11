# Деплой на Cloudflare Pages

Пошагово, от пустого аккаунта до работающего сайта. Всё на бесплатном тарифе.

## 0. Что понадобится

- аккаунт GitHub (бесплатный);
- аккаунт Cloudflare (бесплатный);
- бот Telegram — уже есть, ключи в `site/.env`.

## 1. Репозиторий на GitHub

```bash
cd "C:\Users\abc\Documents\Little Yard 2"
git remote add origin https://github.com/ВАШ_ЛОГИН/little-yard.git
git branch -M main
git push -u origin main
```

Если репозиторий создан с README, сначала `git pull --rebase origin main`.

## 2. Проект в Cloudflare Pages

1. Cloudflare → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Выбрать репозиторий, ветку `main`.
3. Настройки сборки:

| Параметр | Значение |
| --- | --- |
| Framework preset | Astro |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | `site` |

Root directory важен: проект лежит в подпапке `site`, а Cloudflare иначе не найдёт `package.json`.

4. **Environment variables** (до первого деплоя):

| Имя | Тип | Значение |
| --- | --- | --- |
| `NODE_VERSION` | Text | `22` |
| `TELEGRAM_BOT_TOKEN` | Secret | токен бота |
| `TELEGRAM_CHAT_ID` | Text | id чата |
| `GITHUB_TOKEN` | Secret | fine-grained token, Contents: Read and write |
| `GITHUB_REPO` | Text | `ВАШ_ЛОГИН/little-yard` |
| `GITHUB_BRANCH` | Text | `main` |

`HTTPS_PROXY` в Cloudflare **не добавлять** — запросы идут из сети Cloudflare, где Telegram доступен.

5. **Save and Deploy**. Первая сборка займёт 1–2 минуты.

После деплоя сайт живёт на `https://little-yard.pages.dev` (или другом имени проекта).

## 3. Проверка после деплоя

1. Открыть сайт, прокрутить к бронированию.
2. Выбрать свободные даты, отправить заявку.
3. Убедиться, что:
   - в Telegram пришло сообщение;
   - в репозитории появился новый коммит от Cloudflare с изменённым `site/src/data/bookings.json`;
   - в админке заявка на месте.

Если Telegram-сообщения нет, а заявка сохранилась — посмотрите в админке поле **Доставка в Telegram**: там будет причина.

## 4. Админка на боевом сайте

Сейчас в `site/public/admin/config.yml` стоит `local_backend: true` и заглушки `repo` / `base_url`. Для входа через GitHub:

1. Развернуть Worker-OAuth (код и шаги — в `docs/CMS.md`).
2. Создать GitHub OAuth App, callback — адрес Worker'а.
3. В `config.yml` заменить:

```yaml
backend:
  name: github
  repo: ВАШ_ЛОГИН/little-yard
  branch: main
  base_url: https://ваш-worker.workers.dev
  auth_endpoint: auth

# local_backend: true   ← закомментировать
```

4. Закоммитить — Cloudflare пересоберёт сайт, вход в `/admin/` пойдёт через GitHub.

## 5. Домен (позже)

Требования позволяют жить на `*.pages.dev`. Когда купите домен: Cloudflare → проект → **Custom domains** → добавить, затем переключить NS у регистратора на Cloudflare. После этого поменять `site` в `site/astro.config.mjs` на новый адрес — от него зависят canonical и sitemap.

## 6. Что обновляется само

- **Контент из админки** — коммит в репозиторий → Cloudflare пересобирает сайт автоматически (обычно 1–2 минуты).
- **Заявки с сайта** — коммит из Pages Function, сайт пересобирается так же.

То есть после публикации любой правке достаточно сохранения в админке.

## 7. Откат

Cloudflare хранит все деплои: **Deployments** → нужная сборка → **Rollback**. Репозиторий — вторая страховка: `git revert` нужного коммита.

## Известные ограничения бесплатного тарифа

- 500 сборок в месяц — при правках несколько раз в день с запасом;
- 100 000 запросов к Function в сутки — для четырёх домов недостижимо;
- функции имеют лимит времени 10 мс CPU (наш обработчик укладывается с запасом).
