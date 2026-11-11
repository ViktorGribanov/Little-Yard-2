// POST /api/booking — приём заявки с сайта.
//
// Работает на Cloudflare Pages как Function. Заявка проверяется, проверяется
// на конфликт дат, коммитится в src/data/bookings.json и уходит в Telegram
// (если заданы TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID).
//
// Ответ: { ok, booking?, errors?, telegram? }

import { createBooking } from '../_lib/create-booking.js';
import { commitBookings, readBookingsFromRepo, StorageNotConfigured } from '../_lib/github-store.js';
import housesData from '../../src/data/houses.json';

const MAX_BODY = 8 * 1024;

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

export async function onRequestPost({ request, env }) {
  let payload;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY) return json({ ok: false, errors: ['Слишком большой запрос.'] }, 413);
    payload = JSON.parse(raw || '{}');
  } catch {
    return json({ ok: false, errors: ['Некорректный запрос.'] }, 400);
  }

  try {
    const { bookings, sha } = await readBookingsFromRepo(env);
    const houses = housesData.houses;

    const result = await createBooking({
      input: payload,
      bookings,
      houses,
      env,
      siteUrl: env.SITE_URL || new URL(request.url).origin,
    });
    if (!result.ok) return json({ ok: false, errors: result.errors }, result.status);

    await commitBookings(env, [...bookings, result.booking], sha);

    return json(
      {
        ok: true,
        booking: { id: result.booking.id, checkin: result.booking.checkin, checkout: result.booking.checkout },
        telegram: result.telegram,
      },
      201
    );
  } catch (error) {
    if (error instanceof StorageNotConfigured) {
      console.error(error.message);
      return json(
        { ok: false, errors: ['Приём заявок ещё не настроен. Напишите нам напрямую.'] },
        503
      );
    }
    console.error('booking error', error);
    return json({ ok: false, errors: ['Не удалось сохранить заявку. Попробуйте позже.'] }, 500);
  }
}

export async function onRequestGet() {
  return json({ ok: false, errors: ['Используйте POST.'] }, 405);
}
