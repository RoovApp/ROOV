/**
 * Sistema Oficial de Pesquisa — ROOV Product, Cap. 9 e 49.
 *
 * Uma pesquisa única para o app inteiro. Um mesmo termo devolve lugares,
 * comunidades, pessoas, tags e localizações — e cada resultado leva ao mesmo
 * destino que qualquer outro fluxo levaria.
 */

import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PlaceCard } from '../../components/PlaceCard.jsx';
import { Chip, EmptyState, Loading } from '../../components/ui.jsx';
import { searchService } from '../../services/index.js';
import { CATEGORY_BY_ID } from '../../domain/taxonomy.js';
import { useRoov } from '../../state/RoovProvider.jsx';
import { colors, radius } from '../../theme.js';

/** Sugestões contextuais: dependem do momento, não são uma lista fixa. */
function contextualSuggestions(moment) {
  const band = moment.band.id;
  if (band === 'amanhecer' || band === 'manha')
    return ['café tranquilo', 'parque para caminhar', 'padaria de bairro'];
  if (band === 'pico' || band === 'pausa') return ['almoço', 'mercado', 'restaurante autêntico'];
  if (band === 'tarde') return ['museu', 'arte de rua', 'parque'];
  if (band === 'golden-hour') return ['rooftop', 'mirante', 'pôr do sol'];
  return ['bar escondido', 'balada', 'jantar romântico'];
}

export function SearchModule() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { searchHistory, moment, actions } = useRoov();

  const [term, setTerm] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scope, setScope] = useState('tudo');

  useEffect(() => {
    const trimmed = term.trim();
    if (!trimmed) {
      setResults(null);
      return undefined;
    }
    setLoading(true);
    const timer = setTimeout(() => {
      searchService.query(trimmed).then((r) => {
        setResults(r);
        setLoading(false);
      });
    }, 220);
    return () => clearTimeout(timer);
  }, [term]);

  const suggestions = useMemo(() => contextualSuggestions(moment), [moment]);

  const submit = (value) => {
    setTerm(value);
    actions.recordSearch(value);
  };

  const total = results
    ? results.places.length +
      results.communities.length +
      results.people.length +
      results.tags.length +
      results.locations.length
    : 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top + 6 }}>
      <View style={styles.header}>
        <Pressable accessibilityLabel="Voltar" onPress={() => router.back()} style={styles.iconButton}>
          <Ionicons name="chevron-back" size={18} color={colors.foreground} />
        </Pressable>
        <View style={styles.searchField}>
          <Ionicons name="search" size={16} color={colors.muted} />
          <TextInput
            autoFocus
            value={term}
            onChangeText={setTerm}
            onSubmitEditing={() => submit(term)}
            returnKeyType="search"
            placeholder="Cidade, bairro, lugar, vibe…"
            placeholderTextColor={colors.muted}
            style={styles.input}
          />
          {term ? (
            <Pressable accessibilityLabel="Limpar" onPress={() => setTerm('')}>
              <Ionicons name="close" size={16} color={colors.muted} />
            </Pressable>
          ) : null}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 22, paddingBottom: insets.bottom + 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {!term.trim() ? (
          <>
            {searchHistory.length > 0 ? (
              <Section title="Recentes" icon="time-outline">
                <View style={styles.wrap}>
                  {searchHistory.map((item) => (
                    <Chip key={item} onPress={() => submit(item)}>
                      {item}
                    </Chip>
                  ))}
                </View>
              </Section>
            ) : null}

            <Section title={moment.headline} icon="trending-up">
              <View style={styles.wrap}>
                {suggestions.map((item) => (
                  <Chip key={item} onPress={() => submit(item)}>
                    {item}
                  </Chip>
                ))}
              </View>
            </Section>
          </>
        ) : loading && !results ? (
          <Loading />
        ) : total === 0 ? (
          <EmptyState
            emoji="🔍"
            title={`Nada encontrado para "${term}"`}
            message="Tente uma vibe (“romântico”), um bairro ou o nome de uma comunidade."
          />
        ) : (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {[
                  { id: 'tudo', label: `Tudo · ${total}` },
                  { id: 'lugares', label: `Lugares · ${results.places.length}` },
                  { id: 'comunidades', label: `Comunidades · ${results.communities.length}` },
                  { id: 'pessoas', label: `Pessoas · ${results.people.length}` },
                ].map((option) => (
                  <Chip
                    key={option.id}
                    active={scope === option.id}
                    onPress={() => setScope(option.id)}
                  >
                    {option.label}
                  </Chip>
                ))}
              </View>
            </ScrollView>

            {(scope === 'tudo' || scope === 'lugares') && results.places.length > 0 ? (
              <Section title="Lugares">
                <View style={{ gap: 8 }}>
                  {results.places.map((place) => (
                    <PlaceCard key={place.id} place={place} variant="compact" />
                  ))}
                </View>
              </Section>
            ) : null}

            {scope === 'tudo' && results.tags.length > 0 ? (
              <Section title="Vibes e ambientes">
                <View style={styles.wrap}>
                  {results.tags.map((t) => (
                    <Chip key={t.id} onPress={() => submit(t.label)}>
                      {t.emoji} {t.label}
                    </Chip>
                  ))}
                </View>
              </Section>
            ) : null}

            {scope === 'tudo' && results.locations.length > 0 ? (
              <Section title="Localizações">
                <View style={{ gap: 8 }}>
                  {results.locations.map((location) => (
                    <View key={location} style={styles.row}>
                      <Ionicons name="location-outline" size={16} color={colors.muted} />
                      <Text style={styles.rowText}>{location}</Text>
                    </View>
                  ))}
                </View>
              </Section>
            ) : null}

            {(scope === 'tudo' || scope === 'comunidades') && results.communities.length > 0 ? (
              <Section title="Comunidades">
                <View style={{ gap: 8 }}>
                  {results.communities.map((community) => {
                    const meta = CATEGORY_BY_ID[community.category];
                    return (
                      <Pressable
                        key={community.id}
                        onPress={() => router.push(`/comunidade/${community.id}`)}
                        style={styles.row}
                      >
                        <Image source={community.cover} style={styles.thumb} contentFit="cover" />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.rowTitle} numberOfLines={1}>
                            {community.name}
                          </Text>
                          <Text style={styles.rowMeta}>
                            {community.membersCount.toLocaleString('pt-BR')} ·{' '}
                            <Text style={{ color: meta.hex }}>{meta.short}</Text>
                          </Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </Section>
            ) : null}

            {(scope === 'tudo' || scope === 'pessoas') && results.people.length > 0 ? (
              <Section title="Pessoas">
                <View style={{ gap: 8 }}>
                  {results.people.map((person) => (
                    <View key={person.id} style={styles.row}>
                      <Image source={person.avatar} style={styles.avatar} contentFit="cover" />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.rowTitle} numberOfLines={1}>
                          {person.name}
                        </Text>
                        <Text style={styles.rowMeta}>@{person.username}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </Section>
            ) : null}
          </>
        )}
      </ScrollView>
    </View>
  );
}

function Section({ title, icon, children }) {
  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        {icon ? <Ionicons name={icon} size={12} color={colors.muted} /> : null}
        <Text style={styles.sectionTitle}>{title.toUpperCase()}</Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16 },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchField: {
    flex: 1,
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: { flex: 1, fontSize: 14, color: colors.foreground, padding: 0 },

  sectionTitle: { fontSize: 10, letterSpacing: 0.8, color: colors.muted },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 10,
  },
  thumb: { width: 48, height: 48, borderRadius: radius.md },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  rowTitle: { fontSize: 14, fontWeight: '600', color: colors.foreground },
  rowMeta: { fontSize: 11, color: colors.muted },
  rowText: { fontSize: 14, color: colors.foreground },
});
