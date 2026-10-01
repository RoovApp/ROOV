/**
 * Detalhe da Comunidade — Cap. 16 e 44.
 *
 * Uma comunidade é um recorte do produto inteiro: feed próprio, lugares
 * próprios, membros. Reutiliza os componentes globais, sem padrão novo.
 */

import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PostCard } from '../../components/PostCard.jsx';
import { PlaceCard } from '../../components/PlaceCard.jsx';
import { EmptyState, Loading, SegmentedTabs, TagPill } from '../../components/ui.jsx';
import { communitiesService } from '../../services/index.js';
import { CATEGORY_BY_ID, tag } from '../../domain/taxonomy.js';
import { useRoov } from '../../state/RoovProvider.jsx';
import { colors, gradient, radius } from '../../theme.js';

const TABS = [
  { id: 'feed', label: 'Feed' },
  { id: 'lugares', label: 'Lugares' },
  { id: 'sobre', label: 'Sobre' },
];

export function CommunityDetailModule() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { communities, placeById, actions } = useRoov();

  const [posts, setPosts] = useState(null);
  const [tab, setTab] = useState('feed');

  const community = communities.find((c) => c.id === id);

  useEffect(() => {
    let cancelled = false;
    communitiesService.postsOf(id).then((result) => {
      if (!cancelled) setPosts(result);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const places = useMemo(() => {
    if (!posts) return [];
    const ids = [...new Set(posts.map((p) => p.placeId))];
    return ids.map((placeId) => placeById[placeId]).filter(Boolean);
  }, [posts, placeById]);

  if (!community) return <Loading label="Carregando comunidade…" />;

  const meta = CATEGORY_BY_ID[community.category];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ height: 190, justifyContent: 'flex-end' }}>
          <Image source={community.cover} style={StyleSheet.absoluteFill} contentFit="cover" transition={220} />
          <LinearGradient
            colors={['rgba(0,0,0,0.55)', 'rgba(0,0,0,0.2)', colors.background]}
            locations={[0, 0.4, 1]}
            style={StyleSheet.absoluteFill}
          />
          <View style={{ padding: 16 }}>
            <View style={styles.inline}>
              <Text style={styles.title}>{community.name}</Text>
              {community.type === 'privada' ? (
                <Ionicons name="lock-closed" size={14} color={colors.foreground} />
              ) : null}
            </View>
            <View style={[styles.inline, { marginTop: 4 }]}>
              <Ionicons name="people-outline" size={12} color="rgba(255,255,255,0.75)" />
              <Text style={styles.headerMeta}>
                {community.membersCount.toLocaleString('pt-BR')} membros ·{' '}
              </Text>
              <Text style={[styles.headerMeta, { color: meta.hex }]}>{meta.label}</Text>
            </View>
          </View>
        </View>

        <View style={{ paddingHorizontal: 16, gap: 16 }}>
          <Pressable
            onPress={() => actions.toggleCommunity(community.id, community.name, community.isMember)}
            style={({ pressed }) => [{ borderRadius: radius.pill, overflow: 'hidden' }, pressed && { opacity: 0.85 }]}
          >
            {community.isMember ? (
              <View style={styles.memberButton}>
                <Text style={styles.memberButtonText}>Participando · {community.role}</Text>
              </View>
            ) : (
              <LinearGradient
                colors={gradient.colors}
                locations={gradient.locations}
                start={gradient.start}
                end={gradient.end}
                style={styles.joinButton}
              >
                <Text style={styles.joinButtonText}>Entrar na comunidade</Text>
              </LinearGradient>
            )}
          </Pressable>

          <SegmentedTabs value={tab} onChange={setTab} options={TABS} />

          {tab === 'feed' ? (
            posts === null ? (
              <Loading />
            ) : posts.length === 0 ? (
              <EmptyState emoji="💬" title="Nenhuma experiência ainda" />
            ) : (
              <View style={{ gap: 14 }}>
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} place={placeById[post.placeId]} />
                ))}
              </View>
            )
          ) : null}

          {tab === 'lugares' ? (
            <View style={{ gap: 8 }}>
              {places.map((place) => (
                <PlaceCard key={place.id} place={place} variant="compact" />
              ))}
            </View>
          ) : null}

          {tab === 'sobre' ? (
            <View style={{ gap: 16 }}>
              <Text style={styles.about}>{community.description}</Text>
              <View>
                <Text style={styles.groupLabel}>SOBRE O QUE SE FALA AQUI</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  {community.tags.map((tagId) => {
                    const t = tag(tagId);
                    return (
                      <TagPill key={tagId}>
                        {t.emoji} {t.label}
                      </TagPill>
                    );
                  })}
                </View>
              </View>
              <View style={styles.infoCard}>
                <Text style={styles.infoText}>Tipo: comunidade {community.type}</Text>
                <Text style={styles.infoText}>Cidade: {community.city}</Text>
                <Text style={styles.infoText}>Seu papel: {community.role}</Text>
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <Pressable
        accessibilityLabel="Voltar"
        onPress={() => router.back()}
        style={[styles.backButton, { top: insets.top + 6 }]}
      >
        <Ionicons name="chevron-back" size={18} color={colors.foreground} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 21, fontWeight: '700', color: '#FFFFFF' },
  headerMeta: { fontSize: 12, color: 'rgba(255,255,255,0.75)' },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 6 },

  joinButton: { paddingVertical: 13, alignItems: 'center' },
  joinButtonText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  memberButton: {
    paddingVertical: 13,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
  },
  memberButtonText: { fontSize: 14, fontWeight: '700', color: colors.foreground },

  about: { fontSize: 14, color: colors.muted, lineHeight: 21 },
  groupLabel: { fontSize: 10, letterSpacing: 0.8, color: colors.muted, marginBottom: 8 },
  infoCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 16,
    gap: 4,
  },
  infoText: { fontSize: 12, color: colors.muted },

  backButton: {
    position: 'absolute',
    left: 16,
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10,10,12,0.75)',
    borderWidth: 1,
    borderColor: colors.border,
  },
});
