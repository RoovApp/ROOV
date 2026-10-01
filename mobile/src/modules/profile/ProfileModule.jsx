/**
 * Perfil — ROOV Product, Cap. 23, 38 e 53.
 *
 * Abas internas oficiais: Posts, Coleções e Visitados (Cap. 8). A gamificação
 * aparece como consequência do uso, nunca como placar — o DNA do usuário é o
 * dado mais importante da tela.
 */

import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PlaceCard } from '../../components/PlaceCard.jsx';
import { PostCard } from '../../components/PostCard.jsx';
import { EmptyState, Loading, SegmentedTabs, TagPill } from '../../components/ui.jsx';
import { useRoov } from '../../state/RoovProvider.jsx';
import { colors, gradient, radius } from '../../theme.js';

const TABS = [
  { id: 'posts', label: 'Posts' },
  { id: 'colecoes', label: 'Coleções' },
  { id: 'visitados', label: 'Visitados' },
];

export function ProfileModule() {
  const insets = useSafeAreaInsets();
  const { user, profile, posts, placeById, collections, library, userDna, actions } = useRoov();
  const [tab, setTab] = useState('posts');

  const myPosts = useMemo(
    () => posts.filter((post) => post.authorId === user?.id),
    [posts, user],
  );

  const visited = useMemo(
    () => library.placeIdsOf('vivido').map((id) => placeById[id]).filter(Boolean),
    [library, placeById],
  );

  if (!user || !profile) return <Loading label="Carregando perfil…" />;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 16, gap: 22, paddingBottom: 130 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <Text style={styles.screenTitle}>Perfil</Text>
        <Pressable
          accessibilityLabel="Configurações"
          onPress={() => actions.toast('Configurações chegam na próxima sprint')}
          style={styles.iconButton}
        >
          <Ionicons name="settings-outline" size={17} color={colors.foreground} />
        </Pressable>
      </View>

      <View style={styles.identity}>
        <Image source={user.avatar} style={styles.avatar} contentFit="cover" />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.meta}>@{user.username}</Text>
          <Text style={styles.meta}>
            {user.city} — {user.state}
          </Text>
        </View>
      </View>

      <Text style={styles.bio}>{user.bio}</Text>

      {/* Nível e XP — Cap. 53 */}
      <View style={styles.card}>
        <View style={styles.spread}>
          <Text style={styles.cardTitle}>
            Nível {profile.level} · {profile.levelLabel}
          </Text>
          <Text style={styles.meta}>{profile.xp.toLocaleString('pt-BR')} XP</Text>
        </View>
        <View style={styles.progressTrack}>
          <LinearGradient
            colors={gradient.colors}
            locations={gradient.locations}
            start={gradient.start}
            end={gradient.end}
            style={[styles.progressFill, { width: `${Math.round(profile.progressToNext * 100)}%` }]}
          />
        </View>
        {profile.nextLevel ? (
          <Text style={styles.meta}>
            Faltam {(profile.nextLevel.minXp - profile.xp).toLocaleString('pt-BR')} XP para{' '}
            {profile.nextLevel.label}
          </Text>
        ) : null}
      </View>

      {/* DNA do usuário — o retrato de quem ele é dentro do produto */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Seu DNA ROOV</Text>
        <Text style={styles.meta}>{userDna.summary}</Text>
        <View style={styles.tagRow}>
          {userDna.topTags.map((t) => (
            <TagPill key={t.id}>
              {t.emoji} {t.label}
            </TagPill>
          ))}
        </View>
        <Text style={styles.footnote}>
          Construído automaticamente pelo que você salva, vive e planeja. Nunca preenchido à mão.
        </Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Stat value={profile.stats.places} label="lugares" />
        <Stat value={myPosts.length} label="posts" />
        <Stat value={profile.stats.cities} label="cidades" />
        <Stat value={profile.stats.communities} label="grupos" />
      </View>

      <View style={{ gap: 12 }}>
        <Text style={styles.cardTitle}>Conquistas</Text>
        <View style={styles.badgeGrid}>
          {profile.badges.map((badge) => (
            <View
              key={badge.id}
              style={[styles.badge, !badge.unlocked && { opacity: 0.45 }]}
            >
              <Text style={{ fontSize: 24 }}>{badge.emoji}</Text>
              <Text style={styles.badgeLabel} numberOfLines={2}>
                {badge.label}
              </Text>
              {!badge.unlocked && badge.progress != null ? (
                <View style={styles.badgeTrack}>
                  <View style={[styles.badgeFill, { width: `${Math.round(badge.progress * 100)}%` }]} />
                </View>
              ) : null}
            </View>
          ))}
        </View>
      </View>

      <SegmentedTabs value={tab} onChange={setTab} options={TABS} />

      <View style={{ gap: 12 }}>
        {tab === 'posts' ? (
          myPosts.length === 0 ? (
            <EmptyState
              emoji="🎬"
              title="Nenhuma experiência publicada"
              message="Todo post pertence a um lugar e fortalece o DNA dele."
            />
          ) : (
            myPosts.map((post) => (
              <PostCard key={post.id} post={post} place={placeById[post.placeId]} />
            ))
          )
        ) : null}

        {tab === 'colecoes'
          ? collections.map((collection) => (
              <View key={collection.id} style={styles.card}>
                <Text style={styles.cardTitle}>
                  {collection.emoji} {collection.name}
                </Text>
                <Text style={styles.meta}>{collection.placeIds.length} lugares</Text>
              </View>
            ))
          : null}

        {tab === 'visitados' ? (
          visited.length === 0 ? (
            <EmptyState emoji="✅" title="Nenhuma experiência vivida marcada ainda" />
          ) : (
            visited.map((place) => <PlaceCard key={place.id} place={place} variant="compact" />)
          )
        ) : null}
      </View>
    </ScrollView>
  );
}

function Stat({ value, label }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  screenTitle: { fontSize: 19, fontWeight: '700', color: colors.foreground },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  identity: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatar: { width: 78, height: 78, borderRadius: 39, borderWidth: 2, borderColor: '#8B5CFF' },
  name: { fontSize: 18, fontWeight: '700', color: colors.foreground },
  meta: { fontSize: 12, color: colors.muted },
  bio: { fontSize: 14, color: colors.foreground, lineHeight: 20 },

  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 16,
    gap: 6,
  },
  cardTitle: { fontSize: 14, fontWeight: '700', color: colors.foreground },
  spread: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  footnote: { fontSize: 11, color: colors.muted, lineHeight: 16, marginTop: 4 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },

  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    marginVertical: 6,
  },
  progressFill: { height: '100%', borderRadius: 3 },

  stat: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingVertical: 12,
    alignItems: 'center',
  },
  statValue: { fontSize: 18, fontWeight: '700', color: colors.foreground },
  statLabel: { fontSize: 10, color: colors.muted },

  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badge: {
    width: '31.5%',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  badgeLabel: { fontSize: 11, fontWeight: '600', color: colors.foreground, textAlign: 'center' },
  badgeTrack: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    marginTop: 2,
  },
  badgeFill: { height: '100%', backgroundColor: 'rgba(255,255,255,0.5)' },
});
