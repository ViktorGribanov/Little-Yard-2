import test from 'node:test';
import assert from 'node:assert/strict';

import {
  eachNight,
  hasConflict,
  nightsBetween,
  rangesOverlap,
  validateBooking,
  availabilityMap,
  STATUS,
} from '../functions/_lib/booking-core.js';

test('ночи считаются без дня выезда', () => {
  assert.equal(nightsBetween('2026-11-14', '2026-11-17'), 3);
  assert.deepEqual(eachNight('2026-11-14', '2026-11-17'), [
    '2026-11-14',
    '2026-11-15',
    '2026-11-16',
  ]);
});

test('смежные брони не конфликтуют, пересекающиеся — да', () => {
  assert.equal(rangesOverlap('2026-11-10', '2026-11-14', '2026-11-14', '2026-11-16'), false);
  assert.equal(rangesOverlap('2026-11-10', '2026-11-14', '2026-11-13', '2026-11-16'), true);
});

test('отклонённая заявка не занимает даты', () => {
  const bookings = [
    { house: 'house-1', checkin: '2026-11-10', checkout: '2026-11-12', status: STATUS.DECLINED },
  ];
  assert.equal(hasConflict(bookings, 'house-1', '2026-11-10', '2026-11-12'), false);
  assert.equal(availabilityMap(bookings, 'house-1').size, 0);
});

test('подтверждённая заявка блокирует даты, ожидающая — помечает', () => {
  const bookings = [
    { house: 'house-1', checkin: '2026-11-10', checkout: '2026-11-12', status: STATUS.CONFIRMED },
    { house: 'house-1', checkin: '2026-11-20', checkout: '2026-11-21', status: STATUS.NEW },
  ];
  const map = availabilityMap(bookings, 'house-1');
  assert.equal(map.get('2026-11-10'), 'booked');
  assert.equal(map.get('2026-11-11'), 'booked');
  assert.equal(map.get('2026-11-12'), undefined, 'день выезда свободен');
  assert.equal(map.get('2026-11-20'), 'pending');
});

test('заявки разных домов не мешают друг другу', () => {
  const bookings = [
    { house: 'house-2', checkin: '2026-11-10', checkout: '2026-11-12', status: STATUS.CONFIRMED },
  ];
  assert.equal(hasConflict(bookings, 'house-1', '2026-11-10', '2026-11-12'), false);
  assert.equal(hasConflict(bookings, 'house-2', '2026-11-11', '2026-11-13'), true);
});

test('валидация отсекает пустые и некорректные заявки', () => {
  const errors = validateBooking(
    { house: '', name: 'А', phone: '123', checkin: '2026-11-17', checkout: '2026-11-14' },
    { today: '2026-11-07' }
  );
  assert.ok(errors.length >= 3, 'должно быть несколько ошибок: ' + errors.join('; '));
  assert.ok(errors.some((e) => e.includes('имя')));
  assert.ok(errors.some((e) => e.includes('телефон')));
  assert.ok(errors.some((e) => e.includes('позже')));
});

test('корректная заявка проходит без ошибок', () => {
  const errors = validateBooking(
    {
      house: 'house-1',
      name: 'Елена',
      phone: '+7 916 000-11-22',
      checkin: '2026-11-14',
      checkout: '2026-11-17',
      comment: 'Приедем с собакой',
    },
    { today: '2026-11-07' }
  );
  assert.deepEqual(errors, []);
});

test('заезд в прошлом не принимается', () => {
  const errors = validateBooking(
    { house: 'house-1', name: 'Елена', phone: '+79160001122', checkin: '2026-11-01', checkout: '2026-11-03' },
    { today: '2026-11-07' }
  );
  assert.ok(errors.some((e) => e.includes('прошла')));
});
