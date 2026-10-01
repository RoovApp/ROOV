import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { RoovColors } from '@/constants/Colors';
import type { Post } from '@/types';

type Props = {
  post: Post;
  onPlacePress?: () => void;
};

export function PostCard({ post, onPlacePress }: Props) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const likes = liked ? post.likesCount + 1 : post.likesCount;

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{post.authorName[0].toUpperCase()}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.author}>@{post.authorName}</Text>
          <Pressable onPress={onPlacePress}>
            <Text style={styles.place}>📍 {post.placeName}</Text>
          </Pressable>
        </View>
        <Text style={styles.time}>{formatTime(post.createdAt)}</Text>
      </View>

      {/* Media */}
      <Image source={{ uri: post.mediaUrl }} style={styles.image} contentFit="cover" />

      {/* Actions */}
      <View style={styles.actions}>
        <View style={styles.actionsLeft}>
          <Pressable style={styles.actionBtn} onPress={() => setLiked((v) => !v)}>
            <Text style={[styles.actionIcon, liked && styles.actionIconLiked]}>
              {liked ? '❤️' : '🤍'}
            </Text>
            <Text style={[styles.actionCount, liked && { color: '#FF6B6B' }]}>{likes}</Text>
          </Pressable>
          <Pressable style={styles.actionBtn}>
            <Text style={styles.actionIcon}>💬</Text>
            <Text style={styles.actionCount}>{post.commentsCount}</Text>
          </Pressable>
          <Pressable style={styles.actionBtn}>
            <Text style={styles.actionIcon}>↗️</Text>
          </Pressable>
        </View>
        <Pressable style={styles.actionBtn} onPress={() => setSaved((v) => !v)}>
          <Text style={styles.actionIcon}>{saved ? '🔖' : '🏷️'}</Text>
        </Pressable>
      </View>

      {/* Caption */}
      <View style={styles.body}>
        <Text style={styles.caption}>
          <Text style={styles.captionAuthor}>@{post.authorName} </Text>
          {post.caption}
        </Text>

        {/* Vibes */}
        <View style={styles.vibes}>
          {post.vibes.map((vibe) => (
            <View key={vibe} style={styles.vibe}>
              <Text style={styles.vibeText}>{vibe}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function formatTime(isoDate: string) {
  const diff = Date.now() - new Date(isoDate).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'agora';
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: RoovColors.surface,
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: RoovColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: RoovColors.text,
    fontWeight: '700',
    fontSize: 15,
  },
  headerInfo: {
    flex: 1,
    gap: 1,
  },
  author: {
    color: RoovColors.text,
    fontWeight: '700',
    fontSize: 14,
  },
  place: {
    color: RoovColors.textSecondary,
    fontSize: 12,
  },
  time: {
    color: RoovColors.textSecondary,
    fontSize: 12,
  },

  // Media
  image: {
    width: '100%',
    height: 280,
  },

  // Actions
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  actionsLeft: {
    flexDirection: 'row',
    gap: 16,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionIcon: {
    fontSize: 22,
  },
  actionIconLiked: {},
  actionCount: {
    color: RoovColors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },

  // Body
  body: {
    paddingHorizontal: 12,
    paddingBottom: 14,
    gap: 8,
  },
  caption: {
    color: RoovColors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  captionAuthor: {
    fontWeight: '700',
  },
  vibes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  vibe: {
    backgroundColor: RoovColors.surfaceElevated,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: RoovColors.border,
  },
  vibeText: {
    color: RoovColors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
});
