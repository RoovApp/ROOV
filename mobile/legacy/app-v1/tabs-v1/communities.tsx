import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RoovColors } from '@/constants/Colors';
import { MOCK_COMMUNITIES } from '@/lib/mock-data';
import type { Community } from '@/types';

export default function CommunitiesScreen() {
  const insets = useSafeAreaInsets();
  const [communities, setCommunities] = useState(MOCK_COMMUNITIES);

  const toggleMember = (id: string) => {
    setCommunities((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isMember: !c.isMember } : c)),
    );
  };

  const joined = communities.filter((c) => c.isMember);
  const suggested = communities.filter((c) => !c.isMember);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
      showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Communities</Text>
      <Text style={styles.subtitle}>Encontre comunidades da sua cidade</Text>

      {joined.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Suas comunidades</Text>
          <View style={styles.cards}>
            {joined.map((item) => (
              <CommunityCard key={item.id} community={item} onToggle={toggleMember} />
            ))}
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Descobrir</Text>
        <View style={styles.cards}>
          {suggested.map((item) => (
            <CommunityCard key={item.id} community={item} onToggle={toggleMember} />
          ))}
          {suggested.length === 0 && (
            <Text style={styles.empty}>Você já faz parte de todas as comunidades!</Text>
          )}
        </View>
      </View>

      <View style={{ height: insets.bottom + 24 }} />
    </ScrollView>
  );
}

function CommunityCard({
  community,
  onToggle,
}: {
  community: Community;
  onToggle: (id: string) => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardCover}>
        {community.coverUrl ? (
          <Image source={{ uri: community.coverUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: RoovColors.surfaceElevated }]} />
        )}
        <LinearGradient
          colors={['transparent', 'rgba(15,15,18,0.9)']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.cardOverlay}>
          <View style={styles.cardMeta}>
            <Text style={styles.cardName}>{community.name}</Text>
            <Text style={styles.cardCity}>📍 {community.city}</Text>
          </View>
          <Pressable
            onPress={() => onToggle(community.id)}
            style={[styles.joinBtn, community.isMember && styles.joinBtnActive]}>
            <Text style={[styles.joinBtnText, community.isMember && styles.joinBtnTextActive]}>
              {community.isMember ? 'Membro ✓' : 'Entrar'}
            </Text>
          </Pressable>
        </View>
      </View>
      <View style={styles.cardStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{community.membersCount.toLocaleString('pt-BR')}</Text>
          <Text style={styles.statLabel}>membros</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{community.postsToday}</Text>
          <Text style={styles.statLabel}>posts hoje</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: RoovColors.background,
  },
  content: {
    paddingHorizontal: 16,
  },
  title: {
    color: RoovColors.text,
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    color: RoovColors.textSecondary,
    fontSize: 14,
    marginTop: 4,
    marginBottom: 24,
  },
  section: {
    marginBottom: 28,
    gap: 12,
  },
  sectionTitle: {
    color: RoovColors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  cards: {
    gap: 12,
  },
  empty: {
    color: RoovColors.textSecondary,
    fontSize: 14,
  },

  // Card
  card: {
    backgroundColor: RoovColors.surface,
    borderRadius: 20,
    overflow: 'hidden',
  },
  cardCover: {
    height: 160,
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    padding: 14,
  },
  cardMeta: {
    gap: 2,
    flex: 1,
    marginRight: 12,
  },
  cardName: {
    color: RoovColors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  cardCity: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  joinBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: RoovColors.primary,
  },
  joinBtnActive: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  joinBtnText: {
    color: RoovColors.text,
    fontWeight: '700',
    fontSize: 13,
  },
  joinBtnTextActive: {
    color: 'rgba(255,255,255,0.8)',
  },
  cardStats: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 16,
  },
  statItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  statValue: {
    color: RoovColors.text,
    fontWeight: '700',
    fontSize: 14,
  },
  statLabel: {
    color: RoovColors.textSecondary,
    fontSize: 13,
  },
  statDivider: {
    width: 1,
    height: 16,
    backgroundColor: RoovColors.border,
  },
});
