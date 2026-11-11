// Приём заявки: общая логика для локального dev-сервера и для Cloudflare
// Pages Function. Отличие только в хранилище — файл против GitHub-коммита.

import {
  STATUS,
  hasConflict,
  makeBookingId,
  nightsBetween,
  validateBooking,
} from './booking-core.js';
import { formatBookingMessage, sendTelegramNotification } from './telegram.js';

/** Приводит входные данные к безопасному виду, отбрасывая лишние поля. */
function normalizeInput(input) {
  return {
    house: String(input.house ?? '').trim(),
    checkin: String(input.checkin ?? '').trim(),
    checkout: String(input.checkout ?? '').trim(),
    name: String(input.name ?? '').trim(),
    phone: String(input.phone ?? '').trim(),
    comment: String(input.comment ?? '').trim().slice(0, 2000),
    pet: Boolean(input.pet),
    guests: Number(input.guests) > 0 ? Math.min(Number(input.guests), 8) : null,
  };
}

/**
 * Создаёт запись заявки.
 *
 * @returns {Promise<{ok: boolean, status: number, errors?: string[],
 *   booking?: object, telegram?: object}>}
 */
export async function createBooking({ input, bookings, houses, env = {}, fetchImpl, now = new Date(), siteUrl = '' }) {
  const clean = normalizeInput(input || {});
  const errors = validateBooking(clean, { today: toISODate(now) });
  if (errors.length) {
    return { ok: false, status: 422, errors };
  }

  const house = (houses || []).find((h) => h.slug === clean.house);
  if (!house) {
    return { ok: false, status: 422, errors: ['Такого дома нет в списке.'] };
  }
  if (house.status && house.status !== 'bookable') {
    return { ok: false, status: 422, errors: ['Этот дом сейчас не принимает брони.'] };
  }

  if (hasConflict(bookings || [], clean.house, clean.checkin, clean.checkout)) {
    return {
      ok: false,
      status: 409,
      errors: ['Эти даты уже заняты или заняты другой заявкой. Выберите другие.'],
    };
  }

  const booking = {
    id: makeBookingId(now),
    house: clean.house,
    checkin: clean.checkin,
    checkout: clean.checkout,
    name: clean.name,
    phone: clean.phone,
    comment: clean.comment,
    pet: clean.pet,
    guests: clean.guests,
    status: STATUS.NEW,
    source: 'site',
    createdAt: now.toISOString(),
    managerNote: '',
  };

  // Ссылка на админку: в dev это localhost, в продакшене — адрес сайта из запроса.
  const adminUrl = siteUrl ? `${siteUrl.replace(/\/+$/, '')}/admin/#/collections/bookings` : '';
  const telegram = await sendTelegramNotification(
    env,
    formatBookingMessage(booking, house.name, { adminUrl }),
    { fetch: fetchImpl }
  );
  // Результат доставки сохраняем в заявке: менеджер в админке сразу видит,
  // ушло уведомление или нет — без этого сбой Telegram остаётся невидимым.
  booking.telegramStatus = telegram.sent ? 'отправлено' : `не отправлено: ${telegram.reason || 'причина неизвестна'}`;

  return { ok: true, status: 201, booking, telegram };
}

/** Локальная дата без сдвига часового пояса. */
function toISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Сколько ночей в заявке — удобно для логов и админки. */
export function bookingNights(booking) {
  return nightsBetween(booking.checkin, booking.checkout);
}
