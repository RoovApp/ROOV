import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CategoryFilter } from '@/components/roov/CategoryFilter';
import { DiscoveryModeSwitcher } from '@/components/roov/DiscoveryModeSwitcher';
import { EmptyState } from '@/components/roov/EmptyState';
import { MapViewWrapper } from '@/components/roov/MapViewWrapper';
import { PlaceCard } from '@/components/roov/PlaceCard';
import { PostCard } from '@/components/roov/PostCard';
import { SearchBar } from '@/components/roov/SearchBar';
import { DEFAULT_CITY, SAO_PAULO_CENTER } from '@/constants/Config';
import { RoovColors } from '@/constants/Colors';
import { MOCK_PLACES, MOCK_POSTS } from '@/lib/mock-data';
import type { DiscoveryMode, PlaceCategory } from '@/types';

export default function MapScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<DiscoveryMode>('map');
  const [category, setCategory] = useState<PlaceCategory | null>(null);

  const filteredPlaces = useMemo(
    () => MOCK_PLACES.filter((place) => !category || place.category === category),
    [category],
  );

  const rankedPlaces = useMemo(
    () => [...filteredPlaces].sort((a, b) => b.ratingAvg - a.ratingAvg),
    [filteredPlaces],
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      {/* Top: search + city + filters */}
      <View style={styles.topSection}>
        <SearchBar />

        <View style={styles.locationRow}>
          <Text style={styles.locationIcon}>📍</Text>
          <Text style={styles.city}>{DEFAULT_CITY}</Text>
          <Text style={styles.counter}>{filteredPlaces.length} locais</Text>
        </View>

        <CategoryFilter selected={category} onSelect={setCategory} />
      </View>

      {/* Middle: content */}
      <View style={styles.content}>
        {mode === 'map' && (
          <MapViewWrapper places={filteredPlaces} initialRegion={SAO_PAULO_CENTER} />
        )}

        {mode === 'feed' && (
          <FlatList
            data={MOCK_POSTS}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => <PostCard post={item} />}
            ListEmptyComponent={
              <EmptyState
                title="Nenhum post ainda"
                message="Seja o primeiro a compartilhar uma experiência nesta cidade."
                actionLabel="Criar experiência"
                onAction={() => router.push('/create')}
              />
            }
          />
        )}

        {mode === 'ranking' && (
          <FlatList
            data={rankedPlaces}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item, index }) => (
              <PlaceCard
                place={item}
                rank={index + 1}
                onPress={() => router.push(`/place/${item.id}`)}
              />
            )}
            ListEmptyComponent={
              <EmptyState
                title="Ranking vazio"
                message="Ainda não há lugares nesta categoria. Mapeie o primeiro!"
                actionLabel="Mapear lugar"
                onAction={() => router.push('/create')}
              />
            }
          />
        )}
      </View>

      {/* Bottom: mode switcher */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom > 0 ? 8 : 16 }]}>
        <DiscoveryModeSwitcher value={mode} onChange={setMode} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: RoovColors.background,
  },
  topSection: {
    gap: 10,
    paddingBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 6,
  },
  locationIcon: {
    fontSize: 14,
  },
  city: {
    flex: 1,
    color: RoovColors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  counter: {
    color: RoovColors.textSecondary,
    fontSize: 13,
  },
  content: {
    flex: 1,
  },
  list: {
    paddingTop: 12,
    paddingBottom: 24,
  },
  bottomBar: {
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: RoovColors.border,
    backgroundColor: RoovColors.background,
  },
});
