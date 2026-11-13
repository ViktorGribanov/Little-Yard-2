// /oauth/auth — редирект на GitHub для входа в админку.
// Переменные Pages: GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET.

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const clientId = env.GITHUB_CLIENT_ID;
  if (!clientId) {
    return new Response('OAuth не настроен: нет GITHUB_CLIENT_ID', { status: 503 });
  }

  const params = new URLSearchParams({
    client_id: clientId,
    scope: 'repo',
    redirect_uri: `${url.origin}/oauth/callback`,
    state: crypto.randomUUID(),
  });

  return Response.redirect(`https://github.com/login/oauth/authorize?${params}`, 302);
}
