> **Desatualizado em partes, revisar antes de confiar cegamente.** Escrito
> antes da EMENDA-002 (autenticação deixou de ser Supabase Auth, virou
> própria em `api/`) e antes do Expo subir pra SDK 57. Os nomes de tela
> abaixo também não batem mais com `app/(tabs)/` atual (que já está em
> português: `comunidades.jsx`, `perfil.jsx`, `salvos.jsx`). Use como
> contexto histórico da intenção do produto, não como fonte de verdade de
> stack ou estrutura de arquivos: para isso, ver `docs/ARCHITECTURE.md`,
> `docs/ROADMAP.md` e `docs/PRODUTO.md` na raiz do repositório.

# ROOV — Contexto do Projeto

## O que é o ROOV
Repositório vivo de experiências de uma cidade, construído por UGC (User-Generated Content). Combina mapa + prova social + curadoria coletiva. Think: Google Maps com prova social do Instagram. MVP focado em São Paulo, até ~1.000 usuários.

## Stack
- **Framework:** Expo SDK 56 + Expo Router (file-based routing)
- **Linguagem:** TypeScript
- **Backend:** Supabase (Postgres + Auth + Storage + Edge Functions)
- **Mapa:** react-native-maps (SDK nativo gratuito, ilimitado)
- **Plataforma alvo:** iOS primário, cross-platform via Expo

## Estrutura de Navegação
Barra inferior com 5 tabs (Expo Router `app/(tabs)/`):
- `index.tsx` → **Map** (tela principal — modos: map / feed / ranking)
- `communities.tsx` → **Communities**
- `create.tsx` → **Criar** (botão central com FAB circular roxo)
- `saved.tsx` → **Saved / Coleções**
- `profile.tsx` → **Profile + Gamificação**

Rotas extras:
- `app/place/[id].tsx` → Place Detail (ficha do lugar)
- `app/create.tsx` → tela de criação (também acessível fora das tabs)

## Design System
Tema escuro. Todas as cores em `constants/Colors.ts`:
```ts
RoovColors = {
  primary: '#6C3CE1',       // roxo principal
  primaryDark: '#5429C7',
  accent: '#FF6B4A',        // laranja/coral
  background: '#0F0F12',    // fundo geral
  surface: '#1A1A22',       // cards
  surfaceElevated: '#24242E',
  text: '#FFFFFF',
  textSecondary: '#A0A0B0',
  border: '#2E2E3A',
  success: '#34D399',
  warning: '#FBBF24',
  categories: {
    gastro: '#FF6B4A',
    natureza: '#34D399',
    passeios: '#60A5FA',
    noturna: '#A78BFA',
  }
}
```

## Entidades de Dados (types/index.ts)
- **Place:** id, name, category, lat, lng, address, city, priceRange (1-4), bestTime, description, ratingAvg, reviewsCount, savesCount, popularityScore, imageUrl
- **Post:** id, authorName, authorAvatar, placeId, placeName, mediaUrl, mediaType, caption, vibes[], likesCount, commentsCount, createdAt
- **Community:** id, name, city, membersCount, postsToday, coverUrl, isMember
- **UserProfile:** id, username, bio, level, xp, postsCount, placesCount, savesCount
- **PlaceCategory:** 'gastro' | 'natureza' | 'passeios' | 'noturna'
- **ContentStatus:** 'pending' | 'published' | 'removed'
- **UserLevel:** 'Explorer' | 'Local Expert' | 'Ambassador' | 'Legend'
- **DiscoveryMode:** 'map' | 'feed' | 'ranking'

## Constantes (constants/Config.ts)
- `CATEGORIES` — 4 categorias com id, label e cor
- `VIBES` — Nightlife, Café, Date, Nature, Luxury, Sunset, Live Music, Hidden Gem, Local Favorite
- `COLLECTIONS` — Todos, Favs, Quero, Noite, Trips, Gems
- `SAO_PAULO_CENTER` — coordenadas do centro de SP para o mapa
- `DEFAULT_CITY` — 'São Paulo, SP'

## Componentes Existentes (components/roov/)
- `PlaceCard.tsx` — card horizontal com imagem, rank opcional, rating, categoria, preço
- `PostCard.tsx` — card de post do feed com mídia, autor, vibes, ações
- `CategoryFilter.tsx` — chips horizontais para filtrar categoria
- `DiscoveryModeSwitcher.tsx` — switcher Map / Feed / Ranking
- `EmptyState.tsx` — estado vazio com título, mensagem e CTA opcional

## Estado Atual das Telas
- `Map (index.tsx)` — implementado: mapa com pins por categoria, feed de posts, ranking. Usa mock data.
- `Communities` — esqueleto básico, precisa de UI completa
- `Create` — esqueleto básico, precisa do fluxo de publicação
- `Saved` — esqueleto básico, precisa de coleções
- `Profile` — esqueleto básico, precisa de gamificação/badges
- `Place Detail [id]` — precisa de UI completa (galeria, rating, reviews, similar places)

## Dados Mock (lib/mock-data.ts)
4 places (MASP, D-Edge, Mercado Municipal, Ibirapuera), 2 posts, 2 communities, 1 perfil de usuário. Backend real via Supabase ainda não conectado nas telas.

## Regras de Desenvolvimento
- Sempre usar `RoovColors` para cores, nunca hardcodar hex no componente
- Preferir `StyleSheet.create()` ao invés de inline styles
- Componentes reutilizáveis vão em `components/roov/`
- Dados mockados em `lib/mock-data.ts`
- Tipos sempre em `types/index.ts`
- Checar docs em https://docs.expo.dev/versions/v56.0.0/ antes de usar APIs Expo (versão mudou bastante)
- O mapa (`react-native-maps`) não funciona na web — usar `Platform.OS === 'web'` para fallback
- Não conectar Supabase ainda nas telas — trabalhar com mock data até o front estar completo

## Épicos do MVP (do PRD)
1. **Discovery & Mapa** — pins por categoria, filtros, geolocalização
2. **Place Detail** — galeria, rating, reviews, similar places, save/share
3. **Feed Social** — curtir, comentar, compartilhar, salvar post
4. **Ranking** — por categoria/cidade, ordenado por rating
5. **Communities** — feed por cidade, entrar/sair
6. **Criar Experiência** — foto/vídeo + local + vibe + publicar
7. **Saved / Coleções** — organizar saves em coleções, visualizar em lista/mapa
8. **Profile & Gamificação** — níveis (Explorer→Local Expert→Ambassador→Legend), badges, XP
9. **Trust & Safety** — moderação, EULA, reportar, bloquear (obrigatório para lojas)
