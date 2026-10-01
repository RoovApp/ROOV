/**
 * Explorar — ROOV Product, Cap. 20, 60 e 63.
 *
 * Recomendações inteligentes, nunca listas genéricas. Todas as seções são
 * dinâmicas: se o motor não encontrar conteúdo relevante para uma seção, ela
 * simplesmente não existe naquele momento.
 */

import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PlaceCard } from '../../components/PlaceCard.jsx';
import { EmptyState, SectionTitle, TagPill } from '../../components/ui.jsx';
import { buildExploreSections } from '../../engine/recommendation.js';
import { useRoov } from '../../state/RoovProvider.jsx';
import { colors, radius, withAlpha } from '../../theme.js';

export function ExploreView({ places }) {
  const { userDna, moment, knownPlaceIds } = useRoov();

  const sections = useMemo(
    () =>
      buildExploreSections({
        places,
        userAffinities: userDna.affinities,
        moment,
        knownPlaceIds,
        userDna,
      }),
    [places, userDna, moment, knownPlaceIds],
  );

  if (!sections.length) {
    return (
      <EmptyState
        emoji="✨"
        title="Sem recomendações com esses filtros"
        message="O Explorar precisa de espaço para sugerir. Tente remover alguns filtros."
      />
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: 130, gap: 26 }}
      showsVerticalScrollIndicator={false}
    >
      <MomentCard />

      {sections.map((section) => (
        <View key={section.id}>
          <SectionTitle title={section.title} subtitle={section.subtitle} />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
            snapToInterval={272}
            decelerationRate="fast"
          >
            {section.items.map((item) => (
              <View key={item.placeId} style={{ width: 260 }}>
                <PlaceCard
                  place={item.place}
                  experience={item.experience}
                  reasons={item.reasons}
                />
              </View>
            ))}
          </ScrollView>
        </View>
      ))}
    </ScrollView>
  );
}

/** O DNA do Momento explicado em linguagem humana, nunca como score. */
function MomentCard() {
  const { moment, userDna } = useRoov();

  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 4 }}>
      <LinearGradient
        colors={[withAlpha(moment.color, 0.22), 'rgba(255,255,255,0.04)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <Text style={styles.context}>
          {moment.weekdayLabel} · {String(moment.hour).padStart(2, '0')}h ·{' '}
          {moment.weather.emoji} {moment.weather.tempC}°C
        </Text>
        <Text style={styles.headline}>{moment.headline}</Text>
        <Text style={styles.summary}>
          {userDna.summary} · {moment.city}
        </Text>

        {userDna.topTags.length > 0 ? (
          <View style={styles.tagRow}>
            {userDna.topTags.slice(0, 4).map((t) => (
              <TagPill key={t.id}>
                {t.emoji} {t.label}
              </TagPill>
            ))}
          </View>
        ) : null}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 4,
  },
  context: { fontSize: 11, color: colors.muted },
  headline: { fontSize: 18, fontWeight: '700', color: colors.foreground },
  summary: { fontSize: 11, color: colors.muted },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
});
