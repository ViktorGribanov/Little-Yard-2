# Little Yard — site

The Astro project for the landing page. This is the Phase 2 build; the Phase 1
review prototype (`../prototype/index.html`) stays untouched next to it as the
visual reference.

## Requirements

Node.js 22.23.4 or newer (Astro 7 requirement). Check with `node --version`.

## Commands

    npm install     # once, after cloning or after pulling dependency changes
    npm run dev     # http://localhost:4321 — live reload while editing
    npm run build   # static output into dist/
    npm run preview # serve the built dist/ locally

`npm run dev` is the working loop: edit `src/`, the browser reloads itself.

## What is where

    src/pages/index.astro   the single landing page
    src/layouts/            shared page shell (head, meta, header, footer)
    src/components/         section and UI components
    src/content/            content collections (houses, FAQ, section copy)
    public/                 static assets copied as-is (images, icons)
    docs/CONTENT-MODEL.md   what fields exist and what they mean

Copy and data never live inside components: a component reads a house, an FAQ
item or a section record and renders it. The content model is the contract — see
`docs/CONTENT-MODEL.md`.

## Notes

- The site is fully static (`output: 'static'`). Only the booking widget and the
  contact form do anything at runtime.
- `site` in `astro.config.mjs` is a placeholder until a domain is bought; the
  real address is set at deploy time.
- Images: `sharp`-based optimisation is Astro's default; source photos live in
  `public/images/` for now and move to the CMS media library when the CMS is
  wired in.

## Заявки и календарь

Форма на сайте отправляет заявку на `POST /api/booking`. Локально её принимает
dev-сервер и пишет в `src/data/bookings.json`; на Cloudflare Pages — одноимённая
Function, которая коммитит файл в репозиторий. Уведомления в Telegram включаются
переменными окружения. Подробности, статусы и ключи: `docs/BOOKING.md`.

Тесты логики бронирования: `npm test`.
