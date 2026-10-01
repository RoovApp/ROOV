import { Image } from 'expo-image';
import { useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PlaceCard } from '@/components/roov/PlaceCard';
import { EmptyState } from '@/components/roov/EmptyState';
import { COLLECTIONS } from '@/constants/Config';
import { RoovColors } from '@/constants/Colors';
import { MOCK_PLACES } from '@/lib/mock-data';

const COLLECTION_ICONS: Record<string, string> = {
  Todos: '📌',
  Favs: '⭐',
  Quero: '🔖',
  Noite: '🌙',
  Trips: '✈️',
  Gems: '💎',
};

const SAVED_BY_COLLECTION: Record<string, string[]> = {
  Todos: ['1', '3', '4'],
  Favs: ['4'],
  Quero: ['1', '3'],
  Noite: [],
  Trips: ['3'],
  Gems: ['1'],
};

export default function SavedScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [collection, setCollection] = useState<(typeof COLLECTIONS)[number]>('Todos');

  const savedIds = SAVED_BY_COLLECTION[collection] ?? [];
  const savedPlaces = MOCK_PLACES.filter((p) => savedIds.includes(p.id));

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Saved</Text>
        <Text style={styles.subtitle}>{savedIds.length} lugares salvos</Text>
      </View>

      {/* Collection chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}>
        {COLLECTIONS.map((col) => {
          const active = collection === col;
          const count = SAVED_BY_COLLECTION[col]?.length ?? 0;
          return (
            <Pressable
              key={col}
              onPress={() => setCollection(col)}
              style={[styles.chip, active && styles.chipActive]}>
              <Text style={styles.chipIcon}>{COLLECTION_ICONS[col]}</Text>
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{col}</Text>
              {count > 0 && (
                <View style={[styles.badge, active && styles.badgeActive]}>
                  <Text style={styles.badgeText}>{count}</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      {/* List */}
      <FlatList
        data={savedPlaces}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <PlaceCard
            place={item}
            onPress={() => router.push(`/place/${item.id}`)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            title="Coleção vazia"
            message={`Você ainda não salvou nenhum lugar em "${collection}". Explore o mapa e salve seus favoritos.`}
            actionLabel="Explorar"
            onAction={() => router.push('/')}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: RoovColors.background,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 2,
  },
  title: {
    color: RoovColors.text,
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    color: RoovColors.textSecondary,
    fontSize: 14,
  },
  chips: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: RoovColors.border,
    backgroundColor: RoovColors.surface,
  },
  chipActive: {
    backgroundColor: RoovColors.primary,
    borderColor: RoovColors.primary,
  },
  chipIcon: {
    fontSize: 13,
  },
  chipText: {
    color: RoovColors.textSecondary,
    fontWeight: '600',
    fontSize: 13,
  },
  chipTextActive: {
    color: RoovColors.text,
  },
  badge: {
    backgroundColor: RoovColors.border,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  badgeText: {
    color: RoovColors.text,
    fontSize: 10,
    fontWeight: '700',
  },
  list: {
    paddingTop: 4,
    paddingBottom: 32,
  },
});
