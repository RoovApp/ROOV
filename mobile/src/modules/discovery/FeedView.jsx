/**
 * Feed — ROOV Product, Cap. 19 e 62.
 *
 * A ordem vem do Algoritmo Feed: relevância, compatibilidade, recência,
 * distância e diversidade. Feed cronológico puro é proibido.
 */

import { useMemo } from 'react';
import { FlatList } from 'react-native';
import { PostCard } from '../../components/PostCard.jsx';
import { EmptyState } from '../../components/ui.jsx';
import { rankFeed } from '../../engine/recommendation.js';
import { useRoov } from '../../state/RoovProvider.jsx';

export function FeedView({ visiblePlaceIds }) {
  const { posts, placeById, userDna, moment } = useRoov();

  const ranked = useMemo(() => {
    // O feed respeita os filtros globais: filtrou "Gastronomia" no mapa, o feed
    // mostra experiências de gastronomia (Regra 07).
    const scoped = visiblePlaceIds
      ? posts.filter((post) => visiblePlaceIds.has(post.placeId))
      : posts;
    return rankFeed(scoped, { placeById, userAffinities: userDna.affinities, moment });
  }, [posts, placeById, userDna, moment, visiblePlaceIds]);

  if (!ranked.length) {
    return (
      <EmptyState
        emoji="📷"
        title="Nenhuma experiência com esses filtros"
        message="Afrouxe os filtros ou seja o primeiro a publicar algo por aqui."
      />
    );
  }

  return (
    <FlatList
      data={ranked}
      keyExtractor={(item) => item.post.id}
      renderItem={({ item }) => <PostCard post={item.post} place={item.place} />}
      contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 130 }}
      showsVerticalScrollIndicator={false}
      initialNumToRender={3}
      windowSize={5}
      removeClippedSubviews
    />
  );
}
