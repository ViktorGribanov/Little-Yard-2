// @ts-check
import { defineConfig } from 'astro/config';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import { createBooking } from './functions/_lib/create-booking.js';
import { appendBooking, readBookings } from './functions/_lib/local-store.js';

const HOUSES_PATH = fileURLToPath(new URL('./src/data/houses.json', import.meta.url));

/**
 * Подхватывает site/.env для локального запуска: Astro кладёт .env только в
 * import.meta.env, а серверной части (приём заявок, Telegram) нужен process.env.
 * Существующие переменные окружения имеют приоритет и не перезаписываются.
 */
try {
  const envPath = fileURLToPath(new URL('./.env', import.meta.url));
  const text = await readFile(envPath, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (!match) continue;
    const key = match[1];
    const value = match[2].replace(/^["']|["']$/g, '');
    if (!(key in process.env)) process.env[key] = value;
  }
  console.log('[env] переменные из .env загружены');
} catch {
  /* .env нет — работаем на переменных окружения */
}
const MAX_BODY = 8 * 1024;

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY) {
        reject(new Error('body too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

/**
 * Приём заявок на dev-сервере. В продакшене тот же контракт реализует
 * Cloudflare Pages Function (functions/api/booking.js): разница только в
 * хранилище — локальный файл против коммита в GitHub.
 */
function bookingDevApi() {
  return {
    name: 'little-yard-booking-api',
    configureServer(server) {
      server.middlewares.use('/api/booking', async (req, res) => {
        const send = (status, body) => {
          res.statusCode = status;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.setHeader('Cache-Control', 'no-store');
          res.end(JSON.stringify(body));
        };

        if (req.method !== 'POST') {
          return send(405, { ok: false, errors: ['Используйте POST.'] });
        }

        try {
          const payload = JSON.parse((await readBody(req)) || '{}');
          const bookings = await readBookings();
          const houses = JSON.parse(await readFile(HOUSES_PATH, 'utf8')).houses;

          // SITE_URL задаёт публичный адрес для ссылок в уведомлениях: локально
          // Telegram не делает кликабельными ссылки на localhost.
          const origin = process.env.SITE_URL || 'http://' + (req.headers.host || 'localhost:4321');
          const result = await createBooking({ input: payload, bookings, houses, env: process.env, siteUrl: origin });
          if (!result.ok) return send(result.status, { ok: false, errors: result.errors });

          await appendBooking(result.booking);
          console.log(
            `[booking] ${result.booking.id} ${result.booking.house} ` +
              `${result.booking.checkin}→${result.booking.checkout}; telegram: ` +
              (result.telegram?.sent ? 'sent' : result.telegram?.reason)
          );

          return send(201, {
            ok: true,
            booking: {
              id: result.booking.id,
              checkin: result.booking.checkin,
              checkout: result.booking.checkout,
            },
            telegram: result.telegram,
          });
        } catch (error) {
          console.error('[booking] error', error);
          return send(500, { ok: false, errors: ['Не удалось сохранить заявку. Попробуйте позже.'] });
        }
      });
    },
  };
}

export default defineConfig({
  site: 'https://little-yard.pages.dev',
  build: {
    inlineStylesheets: 'auto',
  },
  vite: {
    plugins: [bookingDevApi()],
  },
});
