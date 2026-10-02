/**
 * Camada de Repositório — ROOV Product, Cap. 26.
 *
 * A UI nunca importa mock diretamente: importa daqui. Quando a API REST do
 * Cap. 28 (ou o Supabase) entrar, só o corpo destas funções muda — a assinatura
 * já é assíncrona e paginável de propósito.
 */

import { MOCK_PLACES } from './mock/places.js';
import {
  CURRENT_USER_ID,
  MOCK_AGENDA,
  MOCK_COLLECTIONS,
  MOCK_COMMUNITIES,
  MOCK_LIBRARY,
  MOCK_POSTS,
  MOCK_PROFILE,
  MOCK_SEARCH_HISTORY,
  MOCK_USERS,
  LEVELS,
} from './mock/social.js';
import { buildPlaceDna } from '../engine/dna.js';
import { TAG_GROUPS } from '../domain/taxonomy.js';
import { apiRequestPage } from './apiClient.js';
import { loadSession } from './auth.js';

const GROUP_OF_TAG = (() => {
  const map = {};
  for (const group of TAG_GROUPS) for (const t of group.tags) map[t.id] = group.key;
  return map;
})();

/** Latência simulada — a UI precisa saber lidar com loading desde já. */
const LATENCY_MS = 180;
const delay = (value) =>
  new Promise((resolve) => setTimeout(() => resolve(value), LATENCY_MS));

/**
 * Consolida o DNA de um lugar: sementes de curadoria + tags reais dos posts.
 * As sementes existem para que um lugar recém-cadastrado não fique sem
 * identidade — mas perdem força conforme a comunidade posta.
 */
function consolidateDna(place, posts) {
  const fromPosts = buildPlaceDna(posts);

  const seedPost = {
    createdAt: place.createdAt,
    tags: Object.values(place.seedTags ?? {}).flat(),
  };
  // Semente equivale a ~2 posts: some, mas a comunidade sempre supera.
  const seedWeight = Math.max(0.35, 2 / (posts.length + 2));
  const seeded = buildPlaceDna([seedPost, seedPost]);

  /** @type {import('../domain/types.js').Dna} */
  const merged = { ambiente: [], vibe: [], publico: [], perfil: [], contributions: posts.length };

  for (const group of ['ambiente', 'vibe', 'publico', 'perfil']) {
    const acc = {};
    for (const ref of seeded[group]) acc[ref.id] = ref.weight * seedWeight;
    for (const ref of fromPosts[group]) {
      acc[ref.id] = (acc[ref.id] ?? 0) + ref.weight * (1 - seedWeight * 0.5);
    }
    const max = Math.max(...Object.values(acc), 1);
    merged[group] = Object.entries(acc)
      .map(([id, weight]) => ({ id, weight: weight / max }))
      .sort((a, b) => b.weight - a.weight)
      .slice(0, group === 'ambiente' || group === 'vibe' ? 4 : 3);
  }
  return merged;
}

const PLACES_PAGE_LIMIT = 50;

/**
 * Lugares reais, cadastrados via `api/`. `seedTags` é a ponte temporária até
 * Posts existir de verdade — ver `docs/EMENDA-004-SEED-TAGS-NO-PLACE.md` no
 * roov-monorepo. Pagina por cursor até acabar (teto de 20 páginas = 1000
 * lugares, segurança contra loop infinito, não um limite de produto).
 *
 * Nunca derruba a inicialização do app: se a API estiver fora do ar ou a
 * sessão tiver expirado, a UI simplesmente segue só com os lugares mockados.
 */
async function fetchRealPlaces() {
  const session = loadSession();
  if (!session) return [];

  try {
    const places = [];
    let cursor;
    for (let page = 0; page < 20; page += 1) {
      const query = new URLSearchParams({ limit: String(PLACES_PAGE_LIMIT) });
      if (cursor) query.set('cursor', cursor);
      const { data, meta } = await apiRequestPage(`/places?${query}`, {
        accessToken: session.accessToken,
      });
      places.push(...data);
      if (!meta.hasMore) break;
      cursor = meta.nextCursor;
    }

    return places.map((place) => ({
      id: place.id,
      name: place.name,
      category: place.category,
      placeType: place.placeType,
      neighborhood: place.neighborhood,
      city: place.city,
      state: place.state,
      country: place.country,
      coords: { lat: place.latitude, lng: place.longitude },
      photos: place.photos,
      priceRange: place.priceRange,
      hours: place.hours,
      status: place.status,
      createdAt: place.createdAt,
      seedTags: place.seedTags ?? undefined,
    }));
  } catch (err) {
    console.warn('[roov] Lugares reais indisponíveis, seguindo só com o mock.', err);
    return [];
  }
}

/**
 * Índice em memória, construído uma vez por sessão do app (não uma vez por
 * chamada): `getDb()` memoiza a promise, então todo mundo que chama durante
 * a hidratação inicial (Cap. 26) compartilha a mesma requisição de lugares
 * reais, em vez de disparar uma por serviço.
 *
 * União de mock + real, não substituição: Feed, Comunidades e Biblioteca
 * continuam 100% mock (Fases 5/8 do roadmap) e dependem dos ids mockados
 * existentes. Mapa e Explorar passam a ver os dois conjuntos juntos.
 */
let dbPromise = null;

/** Síncrono de propósito: `byIdSync` (autor de um post) não pode esperar a promise de `db`. */
const USER_BY_ID = Object.fromEntries(MOCK_USERS.map((u) => [u.id, u]));

async function buildDb() {
  const postsByPlace = {};
  for (const post of MOCK_POSTS) {
    (postsByPlace[post.placeId] ??= []).push(post);
  }

  const mockPlaces = MOCK_PLACES.map((place) => {
    const posts = postsByPlace[place.id] ?? [];
    const { seedTags, ...rest } = place;
    return {
      ...rest,
      dna: consolidateDna(place, posts),
      postsCount: posts.length,
    };
  });

  const realPlaces = (await fetchRealPlaces()).map((place) => {
    const { seedTags, ...rest } = place;
    return {
      ...rest,
      dna: consolidateDna(place, []),
      postsCount: 0,
    };
  });

  const places = [...mockPlaces, ...realPlaces];
  const placeById = Object.fromEntries(places.map((p) => [p.id, p]));

  return { places, placeById, userById: USER_BY_ID, postsByPlace };
}

function getDb() {
  if (!dbPromise) dbPromise = buildDb();
  return dbPromise;
}

/* ─── Places ──────────────────────────────────────────────────────────────── */

export const placesService = {
  async list() {
    const db = await getDb();
    return delay(db.places);
  },
  async byId(id) {
    const db = await getDb();
    return delay(db.placeById[id] ?? null);
  },
  async byIds(ids) {
    const db = await getDb();
    return delay(ids.map((id) => db.placeById[id]).filter(Boolean));
  },
  /** Lugares com DNA parecido — usado no "experiências similares" do detalhe. */
  async similarTo(id, limit = 4) {
    const db = await getDb();
    const place = db.placeById[id];
    if (!place) return delay([]);
    const target = new Set(
      ['ambiente', 'vibe', 'perfil'].flatMap((g) => place.dna[g].map((r) => r.id)),
    );
    const ranked = db.places
      .filter((p) => p.id !== id)
      .map((p) => {
        const ids = ['ambiente', 'vibe', 'perfil'].flatMap((g) => p.dna[g].map((r) => r.id));
        const overlap = ids.filter((t) => target.has(t)).length;
        return { p, overlap, sameCategory: p.category === place.category };
      })
      .sort((a, b) => b.overlap - a.overlap || b.sameCategory - a.sameCategory)
      .slice(0, limit)
      .map((r) => r.p);
    return delay(ranked);
  },
};

/* ─── Posts ───────────────────────────────────────────────────────────────── */

export const postsService = {
  async feed() {
    return delay(MOCK_POSTS);
  },
  async byPlace(placeId) {
    const db = await getDb();
    return delay(db.postsByPlace[placeId] ?? []);
  },
  async byAuthor(authorId) {
    return delay(MOCK_POSTS.filter((p) => p.authorId === authorId));
  },
  /**
   * Publica uma experiência. Regra 02: sem lugar, não existe post.
   * Regra 10: toda interação melhora o algoritmo — por isso as tags voltam
   * imediatamente para o DNA do lugar.
   */
  async create({ placeId, media, caption, tags, mediaType = 'photo' }) {
    if (!placeId) throw new Error('Todo post precisa pertencer a um lugar.');
    const db = await getDb();

    const required = TAG_GROUPS.filter((g) => g.required).map((g) => g.key);
    const provided = new Set(tags.map((t) => GROUP_OF_TAG[t]).filter(Boolean));
    const missing = required.filter((g) => !provided.has(g));
    if (missing.length) {
      const labels = TAG_GROUPS.filter((g) => missing.includes(g.key)).map((g) => g.label);
      throw new Error(`Faltam tags obrigatórias: ${labels.join(', ')}.`);
    }

    const post = {
      id: `post-${Date.now()}`,
      authorId: CURRENT_USER_ID,
      placeId,
      media: media?.length ? media : db.placeById[placeId]?.photos.slice(0, 1) ?? [],
      mediaType,
      caption,
      tags,
      likesCount: 0,
      commentsCount: 0,
      createdAt: new Date().toISOString(),
    };

    MOCK_POSTS.unshift(post);
    (db.postsByPlace[placeId] ??= []).unshift(post);

    // Reconsolida o DNA do lugar com a contribuição nova.
    const place = db.placeById[placeId];
    if (place) {
      place.dna = consolidateDna(
        { ...place, seedTags: rebuildSeed(place) },
        db.postsByPlace[placeId],
      );
      place.postsCount = db.postsByPlace[placeId].length;
    }
    return delay(post);
  },
};

/** Reconstrói as sementes a partir do DNA atual para não perder a curadoria. */
function rebuildSeed(place) {
  const seed = {};
  for (const group of ['ambiente', 'vibe', 'publico', 'perfil']) {
    seed[group] = place.dna[group].filter((r) => r.weight > 0.6).map((r) => r.id);
  }
  return seed;
}

/* ─── Users & Profile ─────────────────────────────────────────────────────── */

export const usersService = {
  async me() {
    const db = await getDb();
    return delay(db.userById[CURRENT_USER_ID]);
  },
  byIdSync(id) {
    return USER_BY_ID[id] ?? null;
  },
  async profile() {
    const level = [...LEVELS].reverse().find((l) => MOCK_PROFILE.xp >= l.minXp) ?? LEVELS[0];
    const next = LEVELS.find((l) => l.minXp > MOCK_PROFILE.xp);
    return delay({
      ...MOCK_PROFILE,
      level: level.level,
      levelLabel: level.label,
      nextLevel: next ?? null,
      progressToNext: next
        ? (MOCK_PROFILE.xp - level.minXp) / (next.minXp - level.minXp)
        : 1,
    });
  },
  async searchHistory() {
    return delay(MOCK_SEARCH_HISTORY);
  },
};

/* ─── Biblioteca, Coleções e Agenda ───────────────────────────────────────── */

export const libraryService = {
  async entries() {
    return delay(MOCK_LIBRARY);
  },
  async collections() {
    return delay(MOCK_COLLECTIONS);
  },
  async agenda() {
    return delay(MOCK_AGENDA);
  },
};

/* ─── Comunidades ─────────────────────────────────────────────────────────── */

export const communitiesService = {
  async list() {
    return delay(MOCK_COMMUNITIES);
  },
  async byId(id) {
    return delay(MOCK_COMMUNITIES.find((c) => c.id === id) ?? null);
  },
  /** Posts da comunidade: por enquanto derivados da categoria e das tags. */
  async postsOf(id) {
    const community = MOCK_COMMUNITIES.find((c) => c.id === id);
    if (!community) return delay([]);
    const db = await getDb();
    const tags = new Set(community.tags);
    const posts = MOCK_POSTS.filter((post) => {
      const place = db.placeById[post.placeId];
      if (!place) return false;
      if (place.category !== community.category) {
        return post.tags.some((t) => tags.has(t));
      }
      return true;
    });
    return delay(posts);
  },
};

/* ─── Pesquisa unificada — Cap. 9 ─────────────────────────────────────────── */

export const searchService = {
  /**
   * Uma pesquisa, cinco tipos de resultado. Nunca pertence a uma tela:
   * qualquer módulo chama exatamente esta função.
   */
  async query(term) {
    const q = term.trim().toLowerCase();
    if (!q) return delay({ places: [], communities: [], people: [], tags: [], locations: [] });
    const db = await getDb();

    const places = db.places.filter((p) =>
      [p.name, p.placeType, p.neighborhood, p.city].join(' ').toLowerCase().includes(q),
    );

    const communities = MOCK_COMMUNITIES.filter((c) =>
      [c.name, c.description, c.city].join(' ').toLowerCase().includes(q),
    );

    const people = MOCK_USERS.filter(
      (u) => u.id !== CURRENT_USER_ID && [u.name, u.username].join(' ').toLowerCase().includes(q),
    );

    const tags = TAG_GROUPS.flatMap((g) => g.tags).filter((t) =>
      t.label.toLowerCase().includes(q),
    );

    const locations = [...new Set(db.places.map((p) => `${p.neighborhood} · ${p.city}`))].filter(
      (l) => l.toLowerCase().includes(q),
    );

    return delay({ places, communities, people, tags, locations });
  },
};
