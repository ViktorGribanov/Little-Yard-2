// /oauth/callback — обмен кода GitHub на токен и передача его админке.
//
// Decap открывает это окно и ждёт postMessage с токеном. Окно и админка
// обмениваются сообщениями, и порядок не гарантирован: админка может начать
// слушать позже, чем мы отправим. Поэтому отправляем несколько раз — сразу и
// с повторами, а также в ответ на любое сообщение от родителя.

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
  const message = JSON.stringify(`authorization:github:success:${payload}`);

  const html = `<!doctype html>
<html lang="ru">
<head><meta charset="utf-8"><title>Вход в админку</title></head>
<body style="font-family:system-ui,sans-serif;padding:2rem">
<p>Авторизация завершена. Окно можно закрыть.</p>
<script>
  (function () {
    var message = ${message};

    function sendToOpener(origin) {
      if (!window.opener) return;
      try {
        window.opener.postMessage(message, origin || '*');
      } catch (e) {
        try { window.opener.postMessage(message, '*'); } catch (e2) {}
      }
    }

    // Отвечаем на рукопожатие админки, если оно придёт.
    window.addEventListener('message', function (event) {
      sendToOpener(event.origin);
      setTimeout(function () { window.close(); }, 600);
    }, false);

    // И отправляем сами — на случай, если рукопожатия не будет.
    [0, 300, 800, 1500, 3000].forEach(function (delay) {
      setTimeout(function () { sendToOpener('*'); }, delay);
    });
  })();
</script>
</body>
</html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}
