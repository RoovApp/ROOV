import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { CATEGORIES } from '@/constants/Config';
import { RoovColors } from '@/constants/Colors';
import type { PlaceCategory } from '@/types';

const CATEGORY_ICONS: Record<string, string> = {
  gastro: '🍴',
  natureza: '🌿',
  passeios: '📸',
  noturna: '🎵',
};

type Props = {
  selected: PlaceCategory | null;
  onSelect: (category: PlaceCategory | null) => void;
};

export function CategoryFilter({ selected, onSelect }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}>
      {CATEGORIES.map((category) => {
        const active = selected === category.id;
        return (
          <Pressable
            key={category.id}
            onPress={() => onSelect(active ? null : category.id)}
            style={[
              styles.chip,
              active && { backgroundColor: category.color + '22', borderColor: category.color },
            ]}>
            <Text style={styles.chipIcon}>{CATEGORY_ICONS[category.id]}</Text>
            <Text style={[styles.chipText, active && { color: category.color }]}>
              {category.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: RoovColors.border,
    backgroundColor: RoovColors.surface,
  },
  chipIcon: {
    fontSize: 13,
  },
  chipText: {
    color: RoovColors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
});
