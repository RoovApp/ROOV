import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CATEGORIES } from '@/constants/Config';
import { RoovColors } from '@/constants/Colors';
import type { Place } from '@/types';

type Props = {
  place: Place;
  rank?: number;
  onPress?: () => void;
};

export function PlaceCard({ place, rank, onPress }: Props) {
  const category = CATEGORIES.find((item) => item.id === place.category);

  return (
    <Pressable onPress={onPress} style={styles.card}>
      {place.imageUrl ? (
        <Image source={{ uri: place.imageUrl }} style={styles.image} contentFit="cover" />
      ) : (
        <View style={[styles.image, styles.imageFallback]} />
      )}
      <View style={styles.content}>
        <View style={styles.header}>
          {rank != null && <Text style={styles.rank}>#{rank}</Text>}
          <Text style={styles.name} numberOfLines={1}>
            {place.name}
          </Text>
        </View>
        <Text style={styles.meta}>
          ★ {place.ratingAvg.toFixed(1)} · {place.reviewsCount} reviews · {place.savesCount} saves
        </Text>
        <View style={styles.footer}>
          <View style={[styles.badge, { backgroundColor: category?.color ?? RoovColors.primary }]}>
            <Text style={styles.badgeText}>{category?.label}</Text>
          </View>
          <Text style={styles.price}>{'$'.repeat(place.priceRange)}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: RoovColors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  image: {
    width: 96,
    height: 96,
  },
  imageFallback: {
    backgroundColor: RoovColors.surfaceElevated,
  },
  content: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
    gap: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rank: {
    color: RoovColors.accent,
    fontWeight: '800',
    fontSize: 16,
  },
  name: {
    flex: 1,
    color: RoovColors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  meta: {
    color: RoovColors.textSecondary,
    fontSize: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: RoovColors.text,
    fontSize: 11,
    fontWeight: '700',
  },
  price: {
    color: RoovColors.textSecondary,
    fontWeight: '600',
  },
});
