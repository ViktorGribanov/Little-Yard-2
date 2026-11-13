// /oauth/callback — обмен кода GitHub на токен и передача его админке.
//
// Основной канал — postMessage (протокол Decap: authorizing:github → успех).
// Но после перехода через GitHub окно может потерять родителя (window.opener
// бывает null), и тогда сообщение уходит в пустоту. Поэтому токен кладётся ещё
// и в localStorage того же домена: вкладка админки получает его событием
// storage и завершает вход сама.

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
  const token = data.access_token || '';
  const payload = JSON.stringify({ token, provider: 'github' });
  const successMessage = JSON.stringify(`authorization:github:success:${payload}`);
  const stored = JSON.stringify({ token, ts: Date.now() });

  const diagnostic = token
    ? `Токен получен (${token.length} символов)`
    : `Токен не получен. GitHub ответил: ${data.error || 'без ошибки'} ${data.error_description || ''}`.trim();
  const safeDiagnostic = diagnostic.replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));

  const html = `<!doctype html>
<html lang="ru">
<head><meta charset="utf-8"><title>Вход в админку</title></head>
<body style="font-family:system-ui,sans-serif;padding:2rem">
<p>Авторизация завершена. Вернитесь во вкладку с админкой — она должна открыться сама.</p>
<p><small>${safeDiagnostic}</small></p>
<script>
  (function () {
    var token = ${JSON.stringify(token)};
    var success = ${successMessage};

    // Канал 1: общее хранилище домена — работает, даже если окна потеряли связь.
    try {
      if (token) localStorage.setItem('little-yard-oauth', ${stored});
    } catch (e) {}

    function closeSelf() {
      try { window.close(); } catch (e) {}
    }

    // Канал 2: классическое рукопожатие Decap, если родитель доступен.
    if (window.opener) {
      var timer = setInterval(function () {
        try { window.opener.postMessage('authorizing:github', '*'); } catch (e) {}
      }, 400);

      window.addEventListener('message', function (event) {
        if (event.data !== 'authorizing:github') return;
        clearInterval(timer);
        try { window.opener.postMessage(success, event.origin || '*'); } catch (e) {}
        setTimeout(closeSelf, 400);
      }, false);

      setTimeout(function () {
        clearInterval(timer);
        try { window.opener.postMessage(success, '*'); } catch (e) {}
        setTimeout(closeSelf, 400);
      }, 4000);
    }
  })();
</script>
</body>
</html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}
