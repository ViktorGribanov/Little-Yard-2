// Отправка уведомления в Telegram.
//
// Ключи приходят из окружения и нигде не хранятся в коде:
//   TELEGRAM_BOT_TOKEN — токен бота от @BotFather
//   TELEGRAM_CHAT_ID   — id чата/канала, куда бот пишет заявки
// Если переменные не заданы, отправка молча пропускается: заявка всё равно
// сохраняется, а сайт продолжает работать.

/** Экранирование для parse_mode=HTML. */
function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Текст заявки в человеческом виде — то, что увидит менеджер в Telegram.
 * adminUrl — адрес списка заявок в админке; если он передан, номер заявки
 * становится ссылкой, чтобы менеджер открывал её одним нажатием с телефона.
 */
export function formatBookingMessage(booking, houseName, options = {}) {
  const adminUrl = options.adminUrl || '';
  const phone = String(booking.phone ?? '').replace(/[^\d+]/g, '');

  const lines = [
    '🏡 <b>Новая заявка</b>',
    '',
    `<b>Дом:</b> ${escapeHtml(houseName || booking.house)}`,
    `<b>Даты:</b> ${escapeHtml(booking.checkin)} → ${escapeHtml(booking.checkout)}`,
    `<b>Гость:</b> ${escapeHtml(booking.name)}`,
    `<b>Телефон:</b> <a href="tel:${phone}">${escapeHtml(booking.phone)}</a>`,
  ];
  if (booking.guests) lines.push(`<b>Гостей:</b> ${escapeHtml(booking.guests)}`);
  if (booking.pet) lines.push('<b>С питомцем:</b> да, нужно согласование');
  if (booking.comment) lines.push('', `<i>${escapeHtml(booking.comment)}</i>`);

  const id = escapeHtml(booking.id);
  lines.push('', adminUrl ? `Номер заявки: <a href="${escapeHtml(adminUrl)}">${id}</a>` : `Номер заявки: <code>${id}</code>`);
  if (adminUrl) lines.push('<i>Нажмите номер, чтобы открыть заявки в админке.</i>');
  return lines.join('\n');
}

/**
 * Отправляет сообщение в Telegram.
 * Возвращает { sent: boolean, reason?: string } — не бросает исключение,
 * потому что сбой уведомления не должен ломать приём заявки.
 */
export async function sendTelegramNotification(env, text, options = {}) {
  const token = env?.TELEGRAM_BOT_TOKEN || env?.TELEGRAM_TOKEN;
  const chatId = env?.TELEGRAM_CHAT_ID || env?.TELEGRAM_CHAT;
  if (!token || !chatId) {
    return { sent: false, reason: 'telegram_not_configured' };
  }
  const fetchImpl = options.fetch || fetch;
  // TELEGRAM_API_BASE позволяет направить запрос через прокси, если прямой
  // доступ к api.telegram.org заблокирован провайдером.
  const apiBase = (env?.TELEGRAM_API_BASE || 'https://api.telegram.org').replace(/\/+$/, '');
  try {
    const response = await fetchImpl(`${apiBase}/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      return { sent: false, reason: `telegram_${response.status}: ${detail.slice(0, 200)}` };
    }
    return { sent: true };
  } catch (error) {
    return { sent: false, reason: `telegram_error: ${error.message}` };
  }
}
