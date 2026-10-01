/**
 * DNA ROOV — ROOV Product, Cap. 12.
 *
 * Nunca porcentagem, nunca nota, nunca estrela. A força de uma tag é
 * comunicada só pela ordem e pela opacidade.
 */

import { StyleSheet, Text, View } from 'react-native';
import { topDnaTags } from '../engine/dna.js';
import { TAG_GROUPS, tag as resolveTag } from '../domain/taxonomy.js';
import { TagPill } from './ui.jsx';
import { colors, radius } from '../theme.js';

/** Faixa compacta usada dentro do ROOV Place Card. */
export function DnaStrip({ dna, limit = 4, style }) {
  const tags = topDnaTags(dna, limit);
  if (!tags.length) return null;

  return (
    <View style={[styles.row, style]}>
      {tags.map((t) => (
        <TagPill key={t.id} opacity={0.65 + t.weight * 0.35}>
          {t.emoji} {t.label}
        </TagPill>
      ))}
    </View>
  );
}

/** DNA completo agrupado — usado na ficha do lugar. */
export function DnaPanel({ dna, style }) {
  if (!dna) return null;
  const groups = TAG_GROUPS.filter((g) => g.required);

  return (
    <View style={[{ gap: 14 }, style]}>
      {groups.map((group) => {
        const refs = dna[group.key] ?? [];
        if (!refs.length) return null;
        return (
          <View key={group.key}>
            <Text style={styles.groupLabel}>{group.label.toUpperCase()}</Text>
            <View style={styles.row}>
              {refs.map((ref) => {
                const t = resolveTag(ref.id);
                return (
                  <View
                    key={ref.id}
                    style={[styles.bigTag, { opacity: 0.6 + ref.weight * 0.4 }]}
                  >
                    <Text style={styles.bigTagText}>
                      {t.emoji} {t.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        );
      })}

      <Text style={styles.footnote}>
        DNA construído por {dna.contributions ?? 0}{' '}
        {dna.contributions === 1 ? 'experiência' : 'experiências'} da comunidade.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  groupLabel: {
    fontSize: 10,
    letterSpacing: 0.8,
    color: colors.muted,
    marginBottom: 6,
  },
  bigTag: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  bigTagText: { fontSize: 12, color: colors.foreground },
  footnote: { fontSize: 11, color: colors.muted },
});
