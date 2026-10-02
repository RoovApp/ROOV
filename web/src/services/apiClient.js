/**
 * Cliente HTTP para a API real (`api/`).
 *
 * Único ponto de contato com o backend — igual `services/index.js` é o único
 * ponto de contato com os dados mock. Nenhum outro arquivo deve chamar
 * `fetch` diretamente.
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/v1';

export class ApiError extends Error {
  constructor(code, message, details = []) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
  }
}

/**
 * @param {string} path
 * @param {{ method?: string, body?: unknown, accessToken?: string }} [options]
 */
async function request(path, { method = 'GET', body, accessToken } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // 204 No Content (logout) não tem corpo para parsear.
  const payload = response.status === 204 ? null : await response.json();

  if (!response.ok) {
    const { code, message, details } = payload.error;
    throw new ApiError(code, message, details);
  }

  return payload;
}

/**
 * Chamada comum: devolve só `data`. É o que quase todo endpoint precisa.
 * @param {string} path
 * @param {{ method?: string, body?: unknown, accessToken?: string }} [options]
 */
export async function apiRequest(path, options) {
  const payload = await request(path, options);
  return payload?.data;
}

/**
 * Para endpoints paginados (cursor): devolve `data` e `meta` juntos, porque
 * `meta.nextCursor`/`meta.hasMore` são informação de verdade, não só
 * metadado descartável.
 * @param {string} path
 * @param {{ method?: string, body?: unknown, accessToken?: string }} [options]
 */
export async function apiRequestPage(path, options) {
  const payload = await request(path, options);
  return { data: payload?.data ?? [], meta: payload?.meta };
}
