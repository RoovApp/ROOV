import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RoovColors } from '@/constants/Colors';
import { MOCK_PLACES, MOCK_POSTS, MOCK_PROFILE } from '@/lib/mock-data';

const LEVELS = [
  { id: 'Explorer', label: 'Explorer', icon: '🧭', xpRequired: 0 },
  { id: 'Local Expert', label: 'Local Expert', icon: '⭐', xpRequired: 500 },
  { id: 'Ambassador', label: 'Ambassador', icon: '🏆', xpRequired: 2000 },
  { id: 'Legend', label: 'Legend', icon: '👑', xpRequired: 5000 },
] as const;

const ACHIEVEMENTS = [
  { id: 'first_post', icon: '📸', label: 'First Post', unlocked: true },
  { id: 'explorer', icon: '🗺️', label: 'Explorer', unlocked: true },
  { id: 'local_gem', icon: '💎', label: 'Local Gem', unlocked: true },
  { id: 'trendsetter', icon: '🔥', label: 'Trendsetter', unlocked: false },
  { id: 'ambassador', icon: '🏆', label: 'Ambassador', unlocked: false },
  { id: 'legend', icon: '👑', label: 'Legend', unlocked: false },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const profile = MOCK_PROFILE;

  const currentLevelIndex = LEVELS.findIndex((l) => l.id === profile.level);
  const currentLevel = LEVELS[currentLevelIndex];
  const nextLevel = LEVELS[currentLevelIndex + 1];
  const xpProgress = nextLevel
    ? (profile.xp - currentLevel.xpRequired) / (nextLevel.xpRequired - currentLevel.xpRequired)
    : 1;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
      showsVerticalScrollIndicator={false}>

      {/* Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarWrapper}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{profile.username[0].toUpperCase()}</Text>
          </View>
          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeIcon}>{currentLevel?.icon}</Text>
          </View>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.username}>@{profile.username}</Text>
          <Text style={styles.bio}>{profile.bio}</Text>
          <Pressable style={styles.editBtn}>
            <Text style={styles.editBtnText}>Editar perfil</Text>
          </Pressable>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <StatItem value={profile.postsCount} label="Posts" />
        <View style={styles.statsDivider} />
        <StatItem value={profile.placesCount} label="Lugares" />
        <View style={styles.statsDivider} />
        <StatItem value={profile.savesCount} label="Saves" />
      </View>

      {/* Level progress */}
      <View style={styles.levelCard}>
        <View style={styles.levelHeader}>
          <View>
            <Text style={styles.levelLabel}>Nível atual</Text>
            <Text style={styles.levelName}>{currentLevel?.icon} {profile.level}</Text>
          </View>
          <View style={styles.xpBadge}>
            <Text style={styles.xpText}>{profile.xp} XP</Text>
          </View>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${Math.round(xpProgress * 100)}%` }]} />
        </View>
        {nextLevel && (
          <Text style={styles.progressLabel}>
            {nextLevel.xpRequired - profile.xp} XP para {nextLevel.icon} {nextLevel.label}
          </Text>
        )}
      </View>

      {/* Levels */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Jornada</Text>
        <View style={styles.levelsRow}>
          {LEVELS.map((level, index) => {
            const unlocked = index <= currentLevelIndex;
            return (
              <View key={level.id} style={styles.levelStep}>
                <View style={[styles.levelCircle, unlocked && styles.levelCircleUnlocked]}>
                  <Text style={styles.levelCircleIcon}>{level.icon}</Text>
                </View>
                <Text style={[styles.levelStepLabel, unlocked && styles.levelStepLabelUnlocked]}>
                  {level.label}
                </Text>
                {index < LEVELS.length - 1 && (
                  <View style={[styles.levelConnector, unlocked && index < currentLevelIndex && styles.levelConnectorFilled]} />
                )}
              </View>
            );
          })}
        </View>
      </View>

      {/* Achievements */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Conquistas</Text>
        <View style={styles.achievementsGrid}>
          {ACHIEVEMENTS.map((a) => (
            <View key={a.id} style={[styles.achievement, !a.unlocked && styles.achievementLocked]}>
              <Text style={[styles.achievementIcon, !a.unlocked && styles.achievementIconLocked]}>
                {a.unlocked ? a.icon : '🔒'}
              </Text>
              <Text style={[styles.achievementLabel, !a.unlocked && styles.achievementLabelLocked]}>
                {a.label}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ height: insets.bottom + 24 }} />
    </ScrollView>
  );
}

function StatItem({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
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
    gap: 20,
  },

  // Profile header
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: RoovColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: RoovColors.primaryDark,
  },
  avatarText: {
    color: RoovColors.text,
    fontSize: 30,
    fontWeight: '800',
  },
  levelBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: RoovColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: RoovColors.background,
  },
  levelBadgeIcon: {
    fontSize: 14,
  },
  profileInfo: {
    flex: 1,
    gap: 4,
    paddingTop: 4,
  },
  username: {
    color: RoovColors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  bio: {
    color: RoovColors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  editBtn: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: RoovColors.border,
  },
  editBtnText: {
    color: RoovColors.text,
    fontSize: 13,
    fontWeight: '600',
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    backgroundColor: RoovColors.surface,
    borderRadius: 16,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    color: RoovColors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  statLabel: {
    color: RoovColors.textSecondary,
    fontSize: 12,
  },
  statsDivider: {
    width: 1,
    backgroundColor: RoovColors.border,
  },

  // Level card
  levelCard: {
    backgroundColor: RoovColors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  levelLabel: {
    color: RoovColors.textSecondary,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  levelName: {
    color: RoovColors.text,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  xpBadge: {
    backgroundColor: RoovColors.primary + '33',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: RoovColors.primary + '66',
  },
  xpText: {
    color: RoovColors.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  progressBar: {
    height: 8,
    backgroundColor: RoovColors.surfaceElevated,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: RoovColors.primary,
    borderRadius: 4,
  },
  progressLabel: {
    color: RoovColors.textSecondary,
    fontSize: 12,
  },

  // Levels journey
  section: {
    gap: 16,
  },
  sectionTitle: {
    color: RoovColors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  levelsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  levelStep: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
    position: 'relative',
  },
  levelCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: RoovColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: RoovColors.border,
  },
  levelCircleUnlocked: {
    borderColor: RoovColors.primary,
    backgroundColor: RoovColors.primary + '22',
  },
  levelCircleIcon: {
    fontSize: 22,
  },
  levelStepLabel: {
    color: RoovColors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  levelStepLabelUnlocked: {
    color: RoovColors.text,
  },
  levelConnector: {
    position: 'absolute',
    top: 24,
    left: '60%',
    right: '-60%',
    height: 2,
    backgroundColor: RoovColors.border,
    zIndex: -1,
  },
  levelConnectorFilled: {
    backgroundColor: RoovColors.primary,
  },

  // Achievements
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  achievement: {
    width: '30%',
    backgroundColor: RoovColors.surface,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: RoovColors.border,
  },
  achievementLocked: {
    opacity: 0.4,
  },
  achievementIcon: {
    fontSize: 28,
  },
  achievementIconLocked: {},
  achievementLabel: {
    color: RoovColors.text,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  achievementLabelLocked: {
    color: RoovColors.textSecondary,
  },
});
