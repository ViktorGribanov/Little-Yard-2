// Ядро бронирования: чистые функции без побочных эффектов.
// Используется тремя потребителями — API приёма заявок, страницей сайта
// (через данные) и тестами. Ничего не знает про файлы, сеть и Telegram.

export const STATUS = {
  NEW: 'new',
  CONFIRMED: 'confirmed',
  DECLINED: 'declined',
};

/** '2026-11-14' → Date в локальной зоне (полночь), без сдвигов UTC. */
export function parseISO(iso) {
  // Админка может сохранить как "2026-11-14", так и полный ISO с временем —
  // берём только календарную часть, чтобы сравнение дат не ломалось.
  const match = String(iso ?? '').match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  const [, y, m, d] = match.map(Number);
  const date = new Date(y, m - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
  return date;
}

/** Date → 'YYYY-MM-DD' */
export function toISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDays(date, days) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

/**
 * Ночи между заездом и выездом. Заезд входит, выезд — нет: гость,
 * выехавший 17-го, освобождает ночь с 17 на 18 для следующего.
 */
export function nightsBetween(checkinISO, checkoutISO) {
  const a = parseISO(checkinISO);
  const b = parseISO(checkoutISO);
  if (!a || !b) return 0;
  return Math.round((b - a) / 86400000);
}

export function eachNight(checkinISO, checkoutISO) {
  const nights = [];
  const total = nightsBetween(checkinISO, checkoutISO);
  const start = parseISO(checkinISO);
  if (!start || total <= 0) return nights;
  for (let i = 0; i < total; i++) nights.push(toISO(addDays(start, i)));
  return nights;
}

/** Диапазоны пересекаются, если делят хотя бы одну ночь. Смежные — нет. */
export function rangesOverlap(aFrom, aTo, bFrom, bTo) {
  const a1 = parseISO(aFrom), a2 = parseISO(aTo);
  const b1 = parseISO(bFrom), b2 = parseISO(bTo);
  if (!a1 || !a2 || !b1 || !b2) return false;
  return a1 < b2 && b1 < a2;
}

/** Заявки, которые занимают даты: новые и подтверждённые. Отклонённые — нет. */
export function activeBookings(bookings, houseSlug) {
  return (bookings || []).filter(
    (b) =>
      b.house === houseSlug &&
      (b.status === STATUS.NEW || b.status === STATUS.CONFIRMED)
  );
}

/**
 * Карта статусов по дням для дома: 'booked' | 'pending'.
 * Подтверждённая заявка важнее ожидающей, если они почему-то пересеклись.
 */
export function availabilityMap(bookings, houseSlug) {
  const map = new Map();
  for (const booking of activeBookings(bookings, houseSlug)) {
    const state = booking.status === STATUS.CONFIRMED ? 'booked' : 'pending';
    for (const night of eachNight(booking.checkin, booking.checkout)) {
      if (map.get(night) === 'booked') continue;
      map.set(night, state);
    }
  }
  return map;
}

/** Проверка перед сохранением: пустой массив — заявку можно принимать. */
export function validateBooking(input, options = {}) {
  const errors = [];
  const today = options.today || toISO(new Date());

  if (!input || typeof input !== 'object') return ['Пустой запрос.'];

  if (!String(input.house ?? '').trim()) errors.push('Не выбран дом.');

  const name = String(input.name ?? '').trim();
  if (name.length < 2) errors.push('Укажите имя.');
  if (name.length > 80) errors.push('Слишком длинное имя.');

  const digits = String(input.phone ?? '').replace(/\D/g, '');
  if (digits.length < 10) errors.push('Укажите телефон для связи.');

  const checkin = input.checkin;
  const checkout = input.checkout;
  if (!parseISO(checkin)) errors.push('Некорректная дата заезда.');
  if (!parseISO(checkout)) errors.push('Некорректная дата выезда.');

  if (parseISO(checkin) && parseISO(checkout)) {
    const nights = nightsBetween(checkin, checkout);
    if (nights < 1) errors.push('Выезд должен быть позже заезда.');
    if (nights > 30) errors.push('Слишком длинный срок — напишите менеджеру.');
    if (checkin < today) errors.push('Дата заезда уже прошла.');
  }

  if (String(input.comment ?? '').length > 2000) errors.push('Комментарий слишком длинный.');

  return errors;
}

/** Свободен ли диапазон у дома с учётом новых и подтверждённых заявок. */
export function hasConflict(bookings, houseSlug, checkin, checkout) {
  return activeBookings(bookings, houseSlug).some((b) =>
    rangesOverlap(checkin, checkout, b.checkin, b.checkout)
  );
}

let seq = 0;
/** Идентификатор заявки: дата + случайный хвост, читаемый в админке. */
export function makeBookingId(now = new Date(), random = Math.random) {
  seq = (seq + 1) % 100;
  const stamp = toISO(now).replace(/-/g, '');
  const tail = String(Math.floor(random() * 1000)).padStart(3, '0');
  return `LY-${stamp}-${tail}${String(seq).padStart(2, '0')}`;
}
