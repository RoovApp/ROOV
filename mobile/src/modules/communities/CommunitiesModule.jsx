/**
 * Comunidades — ROOV Product, Cap. 16, 21 e 61.
 *
 * A ordem vem do Algoritmo Comunidades: afinidade de DNA, interesses e
 * localização. Número de membros nunca é o fator principal.
 */

import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SearchBar } from '../../components/SearchBar.jsx';
import { EmptyState, SegmentedTabs } from '../../components/ui.jsx';
import { rankCommunities } from '../../engine/recommendation.js';
import { CATEGORY_BY_ID } from '../../domain/taxonomy.js';
import { useRoov } from '../../state/RoovProvider.jsx';
import { colors, gradient, radius, withAlpha } from '../../theme.js';

const TABS = [
  { id: 'para-voce', label: 'Para você' },
  { id: 'minhas', label: 'Minhas' },
];

export function CommunitiesModule() {
  const insets = useSafeAreaInsets();
  const { communities, userDna, user } = useRoov();
  const [tab, setTab] = useState('para-voce');

  const ranked = useMemo(
    () => rankCommunities(communities, { userDna, userCity: user?.city ?? 'São Paulo' }),
    [communities, userDna, user],
  );

  const list = tab === 'minhas' ? ranked.filter((r) => r.community.isMember) : ranked;

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 6 }]}>
      <View style={{ paddingHorizontal: 16, gap: 12 }}>
        <View style={{ flexDirection: 'row' }}>
          <SearchBar />
        </View>
        <SegmentedTabs value={tab} onChange={setTab} options={TABS} />
      </View>

      <FlatList
        data={list}
        keyExtractor={(item) => item.community.id}
        renderItem={({ item }) => (
          <CommunityCard community={item.community} reasons={item.reasons} />
        )}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 130 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            emoji="👥"
            title="Você ainda não entrou em nenhuma comunidade"
            message="Comunidades são o jeito mais rápido de encontrar quem gosta do que você gosta."
          />
        }
      />
    </View>
  );
}

export function CommunityCard({ community, reasons = [] }) {
  const router = useRouter();
  const { actions } = useRoov();
  const meta = CATEGORY_BY_ID[community.category];

  return (
    <View style={styles.card}>
      <Pressable onPress={() => router.push(`/comunidade/${community.id}`)}>
        <View style={styles.cover}>
          <Image source={community.cover} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.9)']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.coverFooter}>
            <View style={{ flex: 1 }}>
              <View style={styles.inline}>
                <Text style={styles.name} numberOfLines={1}>
                  {community.name}
                </Text>
                {community.type === 'privada' ? (
                  <Ionicons name="lock-closed" size={12} color={colors.muted} />
                ) : null}
              </View>
              <View style={styles.inline}>
                <Ionicons name="people-outline" size={11} color="rgba(255,255,255,0.72)" />
                <Text style={styles.coverMeta}>
                  {community.membersCount.toLocaleString('pt-BR')} · {community.postsToday} posts hoje
                </Text>
              </View>
            </View>
            <View style={[styles.categoryBadge, { backgroundColor: withAlpha(meta.hex, 0.22) }]}>
              <Text style={{ fontSize: 10, fontWeight: '700', color: meta.hex }}>{meta.short}</Text>
            </View>
          </View>
        </View>
      </Pressable>

      <View style={{ padding: 12, gap: 10 }}>
        <Text style={styles.description}>{community.description}</Text>

        {reasons.length > 0 ? (
          <Text style={styles.reasons}>· {reasons.join(' · ')}</Text>
        ) : null}

        <Pressable
          onPress={() => actions.toggleCommunity(community.id, community.name, community.isMember)}
          style={({ pressed }) => [{ borderRadius: radius.pill, overflow: 'hidden' }, pressed && { opacity: 0.8 }]}
        >
          {community.isMember ? (
            <View style={styles.memberButton}>
              <Text style={styles.memberButtonText}>Participando</Text>
            </View>
          ) : (
            <LinearGradient
              colors={gradient.colors}
              locations={gradient.locations}
              start={gradient.start}
              end={gradient.end}
              style={styles.joinButton}
            >
              <Text style={styles.joinButtonText}>
                {community.type === 'privada' ? 'Pedir para entrar' : 'Entrar'}
              </Text>
            </LinearGradient>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  cover: { height: 116, justifyContent: 'flex-end' },
  coverFooter: { flexDirection: 'row', alignItems: 'flex-end', gap: 12, padding: 12 },
  name: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', flexShrink: 1 },
  coverMeta: { fontSize: 11, color: 'rgba(255,255,255,0.72)' },
  categoryBadge: { borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 4 },

  description: { fontSize: 12, color: colors.muted, lineHeight: 18 },
  reasons: { fontSize: 11, color: colors.muted },

  joinButton: { paddingVertical: 11, alignItems: 'center' },
  joinButtonText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
  memberButton: {
    paddingVertical: 11,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
  },
  memberButtonText: { fontSize: 12, fontWeight: '700', color: colors.foreground },

  inline: { flexDirection: 'row', alignItems: 'center', gap: 5 },
});
