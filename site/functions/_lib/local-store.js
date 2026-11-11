// Локальное хранилище заявок для dev-сервера: пишет прямо в src/data/bookings.json.
// Нужно только для разработки; в продакшене заявку коммитит Pages Function.

import { readFile, writeFile, rename } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const BOOKINGS_PATH = fileURLToPath(new URL('../../src/data/bookings.json', import.meta.url));

async function readRaw() {
  const text = await readFile(BOOKINGS_PATH, 'utf8');
  return JSON.parse(text);
}

export async function readBookings() {
  const data = await readRaw();
  return Array.isArray(data.bookings) ? data.bookings : [];
}

/**
 * Добавляет заявку в конец списка. Пишет через временный файл и rename,
 * чтобы прерванная запись не оставила битый JSON.
 */
export async function appendBooking(booking) {
  const data = await readRaw();
  const list = Array.isArray(data.bookings) ? data.bookings : [];
  list.push(booking);
  const tmp = `${BOOKINGS_PATH}.tmp`;
  await writeFile(tmp, JSON.stringify({ bookings: list }, null, 2) + '\n', 'utf8');
  await rename(tmp, BOOKINGS_PATH);
  return booking;
}
