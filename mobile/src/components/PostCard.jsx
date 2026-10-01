/**
 * Card de experiência do Feed — ROOV Product, Cap. 19.
 *
 * Um post nunca é "uma foto": é uma experiência vivida em um lugar. Por isso o
 * lugar aparece com o mesmo destaque do autor, e as tags ficam visíveis — são
 * elas que constroem o DNA daquele lugar.
 */

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useRoov } from '../state/RoovProvider.jsx';
import { usersService } from '../services/index.js';
import { tag } from '../domain/taxonomy.js';
import { formatDistance } from '../engine/recommendation.js';
import { TagPill } from './ui.jsx';
import { colors, radius } from '../theme.js';

function timeAgo(iso) {
  const mins = (Date.now() - new Date(iso).getTime()) / 60000;
  if (mins < 60) return `${Math.max(1, Math.round(mins))}min`;
  if (mins < 1440) return `${Math.round(mins / 60)}h`;
  const days = Math.round(mins / 1440);
  if (days < 7) return `${days}d`;
  return `${Math.round(days / 7)}sem`;
}

export function PostCard({ post, place }) {
  const router = useRouter();
  const { library, likedPostIds, actions } = useRoov();
  const author = usersService.byIdSync(post.authorId);
  const liked = likedPostIds.includes(post.id);
  const saved = place ? library.has(place.id, 'quero') : false;

  const openPlace = () => place && router.push(`/place/${place.id}`);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Image source={author?.avatar} style={styles.avatar} contentFit="cover" />
        <View style={{ flex: 1 }}>
          <Text style={styles.author} numberOfLines={1}>
            {author?.name}
          </Text>
          {place ? (
            <Pressable onPress={openPlace} style={styles.inline}>
              <Ionicons name="location-outline" size={11} color={colors.muted} />
              <Text style={styles.meta} numberOfLines={1}>
                {place.name} · {place.neighborhood}
              </Text>
            </Pressable>
          ) : null}
        </View>
        <Text style={styles.meta}>{timeAgo(post.createdAt)}</Text>
      </View>

      <Pressable onPress={openPlace}>
        <Image source={post.media[0]} style={styles.media} contentFit="cover" transition={220} />
      </Pressable>

      <View style={styles.body}>
        <View style={styles.actions}>
          <Pressable
            accessibilityLabel="Curtir"
            onPress={() => actions.toggleLike(post.id)}
            style={styles.inline}
          >
            <Ionicons
              name={liked ? 'heart' : 'heart-outline'}
              size={20}
              color={liked ? colors.favorito : colors.foreground}
            />
            <Text style={styles.actionCount}>{post.likesCount.toLocaleString('pt-BR')}</Text>
          </Pressable>

          <View style={styles.inline}>
            <Ionicons name="chatbubble-outline" size={19} color={colors.muted} />
            <Text style={styles.actionCount}>{post.commentsCount}</Text>
          </View>

          <Pressable
            accessibilityLabel="Compartilhar"
            onPress={() => actions.toast('Link da experiência copiado')}
          >
            <Ionicons name="share-social-outline" size={19} color={colors.muted} />
          </Pressable>

          {place ? (
            <Pressable
              accessibilityLabel="Salvar em Quero Conhecer"
              onPress={() => actions.toggleLibrary(place.id, 'quero', 'Quero Conhecer')}
              style={{ marginLeft: 'auto' }}
            >
              <Ionicons
                name={saved ? 'bookmark' : 'bookmark-outline'}
                size={20}
                color={saved ? colors.quero : colors.muted}
              />
            </Pressable>
          ) : null}
        </View>

        <Text style={styles.caption}>{post.caption}</Text>

        <View style={styles.tagRow}>
          {post.tags.slice(0, 5).map((id) => {
            const t = tag(id);
            return (
              <TagPill key={id}>
                {t.emoji} {t.label}
              </TagPill>
            );
          })}
        </View>

        {place ? (
          <Text style={styles.footnote}>
            Estas tags alimentam o DNA de {place.name} · {formatDistance(place.distanceKm)} de você
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12 },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  author: { fontSize: 14, fontWeight: '600', color: colors.foreground },
  meta: { fontSize: 11, color: colors.muted, flexShrink: 1 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 5 },

  media: { width: '100%', aspectRatio: 4 / 5 },

  body: { padding: 12, gap: 10 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  actionCount: { fontSize: 13, color: colors.foreground },
  caption: { fontSize: 14, color: colors.foreground, lineHeight: 20 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  footnote: { fontSize: 11, color: colors.muted },
});
