import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PlaceCard } from '@/components/roov/PlaceCard';
import { PostCard } from '@/components/roov/PostCard';
import { CATEGORIES } from '@/constants/Config';
import { RoovColors } from '@/constants/Colors';
import { MOCK_PLACES, MOCK_POSTS } from '@/lib/mock-data';

export default function PlaceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [saved, setSaved] = useState(false);

  const place = MOCK_PLACES.find((item) => item.id === id);
  const posts = MOCK_POSTS.filter((item) => item.placeId === id);
  const similar = MOCK_PLACES.filter(
    (item) => item.id !== id && item.category === place?.category,
  );

  if (!place) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Lugar não encontrado</Text>
      </View>
    );
  }

  const category = CATEGORIES.find((item) => item.id === place.category);

  const openInMaps = () => {
    const url =
      Platform.OS === 'ios'
        ? `maps://?q=${encodeURIComponent(place.name)}&ll=${place.lat},${place.lng}`
        : `geo:${place.lat},${place.lng}?q=${encodeURIComponent(place.name)}`;
    Linking.openURL(url);
  };

  const onShare = async () => {
    await Share.share({
      title: place.name,
      message: `${place.name} no ROOV — ${place.address}`,
    });
  };

  const popularityLabel =
    place.popularityScore >= 90
      ? 'Muito popular'
      : place.popularityScore >= 70
        ? 'Popular'
        : 'Em alta';

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.heroContainer}>
          {place.imageUrl ? (
            <Image source={{ uri: place.imageUrl }} style={styles.hero} contentFit="cover" />
          ) : (
            <View style={[styles.hero, styles.heroFallback]} />
          )}
          <LinearGradient
            colors={['rgba(15,15,18,0.6)', 'transparent', 'rgba(15,15,18,0.9)']}
            locations={[0, 0.4, 1]}
            style={StyleSheet.absoluteFill}
          />

          {/* Back */}
          <Pressable
            onPress={() => router.back()}
            style={[styles.floatingBtn, { top: insets.top + 8, left: 16 }]}>
            <Text style={styles.floatingBtnText}>‹</Text>
          </Pressable>

          {/* Save + Share */}
          <View style={[styles.floatingRight, { top: insets.top + 8, right: 16 }]}>
            <Pressable
              onPress={() => setSaved((v) => !v)}
              style={[styles.floatingBtn, saved && styles.floatingBtnActive]}>
              <Text style={styles.floatingBtnText}>{saved ? '★' : '☆'}</Text>
            </Pressable>
            <Pressable onPress={onShare} style={styles.floatingBtn}>
              <Text style={styles.floatingBtnText}>↑</Text>
            </Pressable>
          </View>

          {/* Title overlay */}
          <View style={styles.heroTitle}>
            <View style={styles.heroBadges}>
              <View style={[styles.categoryBadge, { backgroundColor: category?.color }]}>
                <Text style={styles.categoryBadgeText}>{category?.label}</Text>
              </View>
              <View style={styles.popularityBadge}>
                <Text style={styles.popularityText}>🔥 {popularityLabel}</Text>
              </View>
            </View>
            <Text style={styles.placeName}>{place.name}</Text>
            <Text style={styles.placeAddress}>{place.address}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>★ {place.ratingAvg.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{place.reviewsCount}</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{place.savesCount}</Text>
            <Text style={styles.statLabel}>Saves</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{'$'.repeat(place.priceRange)}</Text>
            <Text style={styles.statLabel}>Preço</Text>
          </View>
        </View>

        <View style={styles.body}>
          {/* Description */}
          <Text style={styles.description}>{place.description}</Text>

          {/* Info chips */}
          <View style={styles.chips}>
            {place.bestTime ? (
              <View style={styles.chip}>
                <Text style={styles.chipText}>⏰ {place.bestTime}</Text>
              </View>
            ) : null}
            <View style={styles.chip}>
              <Text style={styles.chipText}>📍 {place.city}</Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Pressable
              style={[styles.actionPrimary, saved && styles.actionSaved]}
              onPress={() => setSaved((v) => !v)}>
              <Text style={styles.actionPrimaryText}>{saved ? '★ Salvo' : '☆ Salvar'}</Text>
            </Pressable>
            <Pressable style={styles.actionSecondary} onPress={openInMaps}>
              <Text style={styles.actionSecondaryText}>Abrir no Mapa</Text>
            </Pressable>
          </View>

          {/* Community posts */}
          {posts.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Posts da comunidade</Text>
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </View>
          )}

          {/* Similar places */}
          {similar.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Lugares similares</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.similarScroll}>
                {similar.map((item) => (
                  <Pressable
                    key={item.id}
                    style={styles.similarCard}
                    onPress={() => router.push(`/place/${item.id}`)}>
                    {item.imageUrl ? (
                      <Image
                        source={{ uri: item.imageUrl }}
                        style={styles.similarImage}
                        contentFit="cover"
                      />
                    ) : (
                      <View style={[styles.similarImage, styles.similarImageFallback]} />
                    )}
                    <LinearGradient
                      colors={['transparent', 'rgba(15,15,18,0.85)']}
                      style={styles.similarGradient}
                    />
                    <View style={styles.similarInfo}>
                      <Text style={styles.similarName} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={styles.similarRating}>★ {item.ratingAvg.toFixed(1)}</Text>
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        <View style={{ height: insets.bottom + 24 }} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: RoovColors.background,
  },
  notFound: {
    flex: 1,
    backgroundColor: RoovColors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    color: RoovColors.textSecondary,
    fontSize: 16,
  },

  // Hero
  heroContainer: {
    height: 340,
  },
  hero: {
    width: '100%',
    height: '100%',
  },
  heroFallback: {
    backgroundColor: RoovColors.surface,
  },
  floatingBtn: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(15,15,18,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: RoovColors.border,
  },
  floatingBtnActive: {
    backgroundColor: RoovColors.primary,
    borderColor: RoovColors.primary,
  },
  floatingBtnText: {
    color: RoovColors.text,
    fontSize: 20,
    lineHeight: 24,
  },
  floatingRight: {
    position: 'absolute',
    flexDirection: 'row',
    gap: 8,
  },
  heroTitle: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    gap: 6,
  },
  heroBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryBadgeText: {
    color: RoovColors.text,
    fontWeight: '700',
    fontSize: 12,
  },
  popularityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(15,15,18,0.6)',
    borderWidth: 1,
    borderColor: RoovColors.border,
  },
  popularityText: {
    color: RoovColors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  placeName: {
    color: RoovColors.text,
    fontSize: 26,
    fontWeight: '800',
  },
  placeAddress: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    backgroundColor: RoovColors.surface,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    color: RoovColors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  statLabel: {
    color: RoovColors.textSecondary,
    fontSize: 11,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: RoovColors.border,
  },

  // Body
  body: {
    padding: 16,
    gap: 16,
  },
  description: {
    color: RoovColors.text,
    fontSize: 15,
    lineHeight: 23,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: RoovColors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: RoovColors.border,
  },
  chipText: {
    color: RoovColors.textSecondary,
    fontSize: 13,
  },

  // Actions
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionPrimary: {
    flex: 1,
    backgroundColor: RoovColors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  actionSaved: {
    backgroundColor: RoovColors.surface,
    borderWidth: 1,
    borderColor: RoovColors.primary,
  },
  actionPrimaryText: {
    color: RoovColors.text,
    fontWeight: '700',
    fontSize: 15,
  },
  actionSecondary: {
    flex: 1,
    backgroundColor: RoovColors.surface,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: RoovColors.border,
  },
  actionSecondaryText: {
    color: RoovColors.text,
    fontWeight: '700',
    fontSize: 15,
  },

  // Section
  section: {
    gap: 12,
  },
  sectionTitle: {
    color: RoovColors.text,
    fontSize: 18,
    fontWeight: '800',
  },

  // Similar places
  similarScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  similarCard: {
    width: 160,
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 12,
  },
  similarImage: {
    width: '100%',
    height: '100%',
  },
  similarImageFallback: {
    backgroundColor: RoovColors.surface,
  },
  similarGradient: {
    ...StyleSheet.absoluteFill,
  },
  similarInfo: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    gap: 2,
  },
  similarName: {
    color: RoovColors.text,
    fontWeight: '700',
    fontSize: 13,
  },
  similarRating: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
  },
});
