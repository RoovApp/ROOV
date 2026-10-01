/**
 * ROOV Place Card — ROOV Product, Cap. 13.
 *
 * Componente oficial para representar QUALQUER local. Regra 06: nenhum módulo
 * desenha card de lugar próprio.
 *
 * Estrutura fixa: Imagem → Nome → Localização → DNA ROOV → Classificação da
 * Biblioteca → Botões. Estados: preview · compacto · expandido · completo.
 */

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { DnaStrip } from './DnaStrip.jsx';
import { LibraryActionRow, PlanActionRow } from './PlaceActions.jsx';
import { CATEGORY_BY_ID, LIBRARY_BY_ID, PRICE_RANGES } from '../domain/taxonomy.js';
import { formatDistance } from '../engine/recommendation.js';
import { isOpenAt } from '../engine/moment.js';
import { useRoov } from '../state/RoovProvider.jsx';
import { colors, radius, withAlpha } from '../theme.js';

export function PlaceCard({ place, variant = 'expanded', experience, reasons = [], rank }) {
  if (!place) return null;
  if (variant === 'compact') return <CompactCard place={place} rank={rank} />;
  if (variant === 'preview') return <PreviewCard place={place} />;
  if (variant === 'full') return <FullCard place={place} />;
  return <ExpandedCard place={place} experience={experience} reasons={reasons} rank={rank} />;
}

function useOpenPlace(placeId) {
  const router = useRouter();
  return () => router.push(`/place/${placeId}`);
}

/** Selo da classificação que o usuário deu ao lugar. */
function LibraryFlags({ placeId }) {
  const { library } = useRoov();
  const kinds = library.kindsOf(placeId);
  if (!kinds.length) return null;
  return (
    <Text style={{ fontSize: 11 }}>
      {kinds.map((kind) => LIBRARY_BY_ID[kind]?.emoji).join('')}
    </Text>
  );
}

function OpenStatus({ place }) {
  const { moment } = useRoov();
  const open = isOpenAt(place.hours, moment.hour, moment.weekday);
  return (
    <View style={styles.inline}>
      <Ionicons name="time-outline" size={11} color={open ? colors.vivido : colors.muted} />
      <Text style={[styles.tiny, open && { color: colors.vivido }]}>
        {open ? 'Aberto agora' : `Abre ${place.hours?.open ?? '--:--'}`}
      </Text>
    </View>
  );
}

function CategoryDot({ category }) {
  const meta = CATEGORY_BY_ID[category];
  if (!meta) return null;
  return (
    <View style={styles.inline}>
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: meta.hex }} />
      <Text style={styles.tiny}>{meta.short}</Text>
    </View>
  );
}

/** Estado expandido — o padrão em listas e carrosséis. */
function ExpandedCard({ place, experience, reasons, rank }) {
  const open = useOpenPlace(place.id);
  const meta = CATEGORY_BY_ID[place.category];

  return (
    <View style={styles.card}>
      <Pressable onPress={open}>
        <View style={styles.hero}>
          <Image source={place.photos[0]} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.25)', 'rgba(0,0,0,0.88)']}
            style={StyleSheet.absoluteFill}
          />

          {rank != null ? (
            <View style={styles.rankBadge}>
              <Text style={styles.rankText}>{rank}</Text>
            </View>
          ) : null}

          <View style={[styles.typeBadge, { backgroundColor: withAlpha(meta.hex, 0.22) }]}>
            <Text style={[styles.typeBadgeText, { color: meta.hex }]}>{place.placeType}</Text>
          </View>

          {/* A experiência vem antes do nome: o local é consequência (Regra 01) */}
          <View style={styles.heroFooter}>
            {experience ? (
              <Text style={styles.experience} numberOfLines={1}>
                {experience}
              </Text>
            ) : null}
            <View style={styles.inline}>
              <Text style={styles.placeName} numberOfLines={1}>
                {place.name}
              </Text>
              <LibraryFlags placeId={place.id} />
            </View>
            <View style={styles.inline}>
              <Ionicons name="location-outline" size={11} color="rgba(255,255,255,0.7)" />
              <Text style={styles.heroMeta} numberOfLines={1}>
                {place.neighborhood} · {formatDistance(place.distanceKm)}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>

      <View style={styles.cardBody}>
        <DnaStrip dna={place.dna} limit={4} />

        {reasons.slice(0, 2).map((reason) => (
          <Text key={reason} style={styles.reason} numberOfLines={2}>
            · {reason}
          </Text>
        ))}

        <View style={styles.cardFooter}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <CategoryDot category={place.category} />
            <OpenStatus place={place} />
          </View>
          <LibraryActionRow place={place} size="sm" />
        </View>
      </View>
    </View>
  );
}

/** Estado compacto — listas densas, pesquisa, coleções. */
function CompactCard({ place, rank }) {
  const open = useOpenPlace(place.id);

  return (
    <Pressable onPress={open} style={({ pressed }) => [styles.compact, pressed && { opacity: 0.75 }]}>
      {rank != null ? <Text style={styles.compactRank}>{rank}</Text> : null}
      <Image source={place.photos[0]} style={styles.compactImage} contentFit="cover" transition={200} />
      <View style={{ flex: 1, gap: 4 }}>
        <View style={styles.inline}>
          <Text style={styles.compactName} numberOfLines={1}>
            {place.name}
          </Text>
          <LibraryFlags placeId={place.id} />
        </View>
        <Text style={styles.tiny} numberOfLines={1}>
          {place.placeType} · {place.neighborhood} · {formatDistance(place.distanceKm)}
        </Text>
        <DnaStrip dna={place.dna} limit={2} />
      </View>
      <LibraryActionRow place={place} size="sm" />
    </Pressable>
  );
}

/** Estado preview — o que abre ao tocar num pin do mapa. */
function PreviewCard({ place }) {
  const open = useOpenPlace(place.id);

  return (
    <View style={styles.card}>
      <Pressable onPress={open} style={styles.previewTop}>
        <Image source={place.photos[0]} style={styles.previewImage} contentFit="cover" transition={200} />
        <View style={{ flex: 1, gap: 4 }}>
          <View style={styles.inline}>
            <Text style={styles.compactName} numberOfLines={1}>
              {place.name}
            </Text>
            <LibraryFlags placeId={place.id} />
          </View>
          <Text style={styles.tiny} numberOfLines={1}>
            {place.placeType} · {formatDistance(place.distanceKm)}
          </Text>
          <DnaStrip dna={place.dna} limit={3} />
        </View>
      </Pressable>
      <View style={styles.previewActions}>
        <LibraryActionRow place={place} size="sm" />
        <PlanActionRow place={place} style={{ flex: 1 }} />
      </View>
    </View>
  );
}

/** Estado completo — cabeçalho da ficha do lugar. */
function FullCard({ place }) {
  const meta = CATEGORY_BY_ID[place.category];
  const price = PRICE_RANGES.find((p) => p.id === place.priceRange);

  return (
    <View style={{ gap: 14 }}>
      <View>
        <View style={[styles.typeBadgeInline, { backgroundColor: withAlpha(meta.hex, 0.16) }]}>
          <Text style={[styles.typeBadgeText, { color: meta.hex }]}>
            {place.placeType} · {meta.label}
          </Text>
        </View>
        <Text style={styles.fullName}>{place.name}</Text>
        <View style={[styles.inline, { flexWrap: 'wrap', marginTop: 4 }]}>
          <Ionicons name="location-outline" size={11} color={colors.muted} />
          <Text style={styles.tiny}>
            {place.neighborhood} · {place.city} · {formatDistance(place.distanceKm)} ·{' '}
            {price?.label}
          </Text>
        </View>
        <View style={{ marginTop: 6 }}>
          <OpenStatus place={place} />
        </View>
      </View>

      <LibraryActionRow place={place} showLabels />
      <PlanActionRow place={place} />
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
  hero: { height: 158, justifyContent: 'flex-end' },
  heroFooter: { padding: 12, gap: 3 },
  experience: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.78)' },
  placeName: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', flexShrink: 1 },
  heroMeta: { fontSize: 11, color: 'rgba(255,255,255,0.72)', flexShrink: 1 },

  rankBadge: {
    position: 'absolute',
    left: 12,
    top: 12,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },

  typeBadge: {
    position: 'absolute',
    right: 12,
    top: 12,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  typeBadgeInline: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 8,
  },
  typeBadgeText: { fontSize: 11, fontWeight: '600' },

  cardBody: { padding: 12, gap: 10 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  reason: { fontSize: 11, color: colors.muted, lineHeight: 16 },

  compact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 10,
  },
  compactRank: { width: 18, textAlign: 'center', fontSize: 13, fontWeight: '700', color: colors.muted },
  compactImage: { width: 62, height: 62, borderRadius: radius.md },
  compactName: { fontSize: 14, fontWeight: '600', color: colors.foreground, flexShrink: 1 },

  previewTop: { flexDirection: 'row', gap: 12, padding: 12 },
  previewImage: { width: 78, height: 78, borderRadius: radius.md },
  previewActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderTopWidth: 1,
    borderColor: colors.border,
  },

  fullName: { fontSize: 24, fontWeight: '700', color: colors.foreground },

  inline: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  tiny: { fontSize: 11, color: colors.muted, flexShrink: 1 },
});
