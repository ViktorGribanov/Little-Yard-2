// /oauth/callback — обмен кода GitHub на токен и передача его админке.
// Decap открывает это окно, ждёт postMessage и сохраняет токен у себя.

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
    function receive(event) {
      window.opener.postMessage(message, event.origin || '*');
      window.removeEventListener('message', receive, false);
    }
    window.addEventListener('message', receive, false);
    if (window.opener) window.opener.postMessage('authorizing:github', '*');
  })();
</script>
</body>
</html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}
