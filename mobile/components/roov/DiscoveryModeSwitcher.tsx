import { Pressable, StyleSheet, Text, View } from 'react-native';

import { RoovColors } from '@/constants/Colors';
import type { DiscoveryMode } from '@/types';

const MODES: { id: DiscoveryMode; label: string }[] = [
  { id: 'map', label: 'Map' },
  { id: 'feed', label: 'Feed' },
  { id: 'ranking', label: 'Ranking' },
];

type Props = {
  value: DiscoveryMode;
  onChange: (mode: DiscoveryMode) => void;
};

export function DiscoveryModeSwitcher({ value, onChange }: Props) {
  return (
    <View style={styles.container}>
      {MODES.map((mode) => {
        const active = value === mode.id;
        return (
          <Pressable key={mode.id} onPress={() => onChange(mode.id)} style={styles.item}>
            {active && <View style={styles.activePill} />}
            <Text style={[styles.label, active && styles.labelActive]}>{mode.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: RoovColors.surface,
    borderRadius: 30,
    padding: 4,
    borderWidth: 1,
    borderColor: RoovColors.border,
  },
  item: {
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activePill: {
    ...StyleSheet.absoluteFill,
    borderRadius: 26,
    backgroundColor: RoovColors.primary,
  },
  label: {
    color: RoovColors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  labelActive: {
    color: RoovColors.text,
    fontWeight: '700',
  },
});
