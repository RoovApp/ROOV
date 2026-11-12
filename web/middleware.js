/**
 * Senha de teste na frente de `/admin` (Vercel Routing Middleware).
 *
 * Teste fechado: só quem tem usuário e senha abre o app. As credenciais vêm
 * das variáveis de ambiente `ADMIN_USER` e `ADMIN_PASSWORD` do projeto no
 * Vercel; nunca entram no código. Sem elas configuradas, falha fechada:
 * ninguém entra (mesma filosofia das rotas da API, ver README).
 *
 * Isto protege só o front. A API (`/v1`, no Render) tem a própria
 * autenticação e não passa por aqui.
 */

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};

const REALM = 'ROOV - teste fechado';

function unauthorized() {
  return new Response('Acesso restrito ao teste do ROOV.', {
    status: 401,
    headers: {
      'WWW-Authenticate': `Basic realm="${REALM}", charset="UTF-8"`,
      'Cache-Control': 'no-store',
    },
  });
}

/** Comparação em tempo constante, pra não vazar a senha pelo tempo de resposta. */
function safeEqual(a, b) {
  const enc = new TextEncoder();
  const x = enc.encode(a);
  const y = enc.encode(b);
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  }
  return diff === 0;
}

function decodeBase64Utf8(value) {
  const bin = atob(value);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export default function middleware(request) {
  const expectedUser = process.env.ADMIN_USER;
  const expectedPassword = process.env.ADMIN_PASSWORD;

  if (!expectedUser || !expectedPassword) {
    return new Response('Acesso de teste não configurado.', {
      status: 503,
      headers: { 'Cache-Control': 'no-store' },
    });
  }

  const header = request.headers.get('authorization') || '';
  const [scheme, encoded] = header.split(' ');
  if (scheme !== 'Basic' || !encoded) return unauthorized();

  let decoded;
  try {
    decoded = decodeBase64Utf8(encoded);
  } catch {
    return unauthorized();
  }

  const sep = decoded.indexOf(':');
  if (sep < 0) return unauthorized();
  const user = decoded.slice(0, sep);
  const password = decoded.slice(sep + 1);

  // Avalia as duas comparações sempre, sem curto-circuito.
  const userOk = safeEqual(user, expectedUser);
  const passwordOk = safeEqual(password, expectedPassword);
  if (!(userOk && passwordOk)) return unauthorized();

  // Sem retorno: a requisição segue para o arquivo estático normalmente.
  return undefined;
}
