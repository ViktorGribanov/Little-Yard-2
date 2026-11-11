import test from 'node:test';
import assert from 'node:assert/strict';

import { formatBookingMessage } from '../functions/_lib/telegram.js';

const booking = {
  id: 'LY-20261107-12345',
  house: 'house-1',
  checkin: '2026-12-20',
  checkout: '2026-12-22',
  name: 'Елена',
  phone: '+7 916 240-18-73',
  guests: 2,
  pet: true,
  comment: 'С собакой',
};

test('номер заявки становится ссылкой на админку', () => {
  const text = formatBookingMessage(booking, 'Дом 1', {
    adminUrl: 'https://little-yard.pages.dev/admin/#/collections/bookings',
  });
  assert.match(text, /<a href="https:\/\/little-yard\.pages\.dev\/admin\/#\/collections\/bookings">LY-20261107-12345<\/a>/);
  assert.match(text, /Нажмите номер/);
});

test('без адреса админки остаётся обычный номер', () => {
  const text = formatBookingMessage(booking, 'Дом 1');
  assert.match(text, /Номер заявки: <code>LY-20261107-12345<\/code>/);
  assert.doesNotMatch(text, /admin/);
});

test('телефон — кликабельная ссылка tel:', () => {
  const text = formatBookingMessage(booking, 'Дом 1');
  assert.match(text, /<a href="tel:\+79162401873">/);
});

test('опасные символы в имени экранируются', () => {
  const text = formatBookingMessage({ ...booking, name: '<b>взлом</b>' }, 'Дом 1');
  assert.match(text, /&lt;b&gt;взлом&lt;\/b&gt;/);
  assert.doesNotMatch(text, /<b>взлом<\/b>/);
});
