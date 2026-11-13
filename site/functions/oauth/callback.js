// /oauth/callback — обмен кода GitHub на токен и передача его админке.
//
// Протокол Decap (см. handshakeCallback в decap-cms-lib-auth):
//   1. окно шлёт админке "authorizing:github";
//   2. админка отвечает тем же сообщением;
//   3. окно отвечает "authorization:github:success:{token,provider}".
// Первый шаг обязателен: без него админка не регистрирует обработчик токена.
// Поэтому рукопожатие повторяется, пока не придёт ответ.

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return new Response('GitHub не передал код авторизации', { status: 400 });
  }
  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
    return new Response('OAuth не настроен: нет GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET', { status: 503 });
  }

  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });

  const data = await response.json().catch(() => ({}));
  const payload = JSON.stringify({ token: data.access_token || '', provider: 'github' });
  const successMessage = JSON.stringify(`authorization:github:success:${payload}`);
  // Диагностика для человека: токен не печатаем, только факт и код ошибки GitHub.
  const diagnostic = data.access_token
    ? `Токен получен (${String(data.access_token).length} символов)`
    : `Токен не получен. GitHub ответил: ${data.error || 'без ошибки'} ${data.error_description || ''}`.trim();
  const safeDiagnostic = diagnostic.replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));

  const html = `<!doctype html>
<html lang="ru">
<head><meta charset="utf-8"><title>Вход в админку</title></head>
<body style="font-family:system-ui,sans-serif;padding:2rem">
<p id="diag">Авторизация завершена. Окно закроется само.</p>
<p><small>${safeDiagnostic}</small></p>
<script>
  (function () {
    var success = ${successMessage};
    var done = false;
    var timer = null;

    function handshake() {
      if (done || !window.opener) return;
      try { window.opener.postMessage('authorizing:github', '*'); } catch (e) {}
    }

    // Повторяем рукопожатие, пока админка не ответит.
    timer = setInterval(handshake, 400);
    handshake();

    window.addEventListener('message', function (event) {
      if (done || !window.opener) return;
      if (event.data !== 'authorizing:github') return;

      done = true;
      if (timer) clearInterval(timer);
      try {
        window.opener.postMessage(success, event.origin || '*');
      } catch (e) {
        try { window.opener.postMessage(success, '*'); } catch (e2) {}
      }
      setTimeout(function () { window.close(); }, 500);
    }, false);

    // Страховка: если ответа нет, всё равно отдаём токен и закрываемся.
    setTimeout(function () {
      if (done || !window.opener) return;
      done = true;
      if (timer) clearInterval(timer);
      try { window.opener.postMessage(success, '*'); } catch (e) {}
      setTimeout(function () { window.close(); }, 500);
    }, 6000);
  })();
</script>
</body>
</html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}
