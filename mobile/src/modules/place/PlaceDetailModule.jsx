/**
 * Ficha do Lugar — destino comum de todos os fluxos de descoberta (Cap. 5.3).
 *
 * Ordem da página segue o Place Card completo (Cap. 13): galeria → identidade
 * → DNA ROOV → funcionamento → experiências da comunidade → DNA parecido.
 * Nunca exibe nota, estrela ou porcentagem.
 */

import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PlaceCard } from '../../components/PlaceCard.jsx';
import { DnaPanel } from '../../components/DnaStrip.jsx';
import { PostCard } from '../../components/PostCard.jsx';
import { EmptyState, GhostButton, Loading } from '../../components/ui.jsx';
import { placesService, postsService } from '../../services/index.js';
import { experienceTitle } from '../../engine/recommendation.js';
import { isOpenAt } from '../../engine/moment.js';
import { useRoov } from '../../state/RoovProvider.jsx';
import { colors, radius } from '../../theme.js';

const WEEKDAYS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

export function PlaceDetailModule() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { placeById, moment, actions } = useRoov();

  const [place, setPlace] = useState(placeById[id] ?? null);
  const [posts, setPosts] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [photoIndex, setPhotoIndex] = useState(0);

  useEffect(() => {
    setPlace(placeById[id] ?? null);
    setPhotoIndex(0);
    let cancelled = false;
    Promise.all([
      placesService.byId(id),
      postsService.byPlace(id),
      placesService.similarTo(id),
    ]).then(([fresh, placePosts, similarPlaces]) => {
      if (cancelled) return;
      if (fresh) setPlace(fresh);
      setPosts(placePosts);
      setSimilar(similarPlaces);
    });
    return () => {
      cancelled = true;
    };
  }, [id, placeById]);

  if (!place) return <Loading label="Carregando lugar…" />;

  const open = isOpenAt(place.hours, moment.hour, moment.weekday);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ height: 300 }}>
          <Image
            source={place.photos[photoIndex]}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={250}
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.6)', 'transparent', colors.background]}
            locations={[0, 0.45, 1]}
            style={StyleSheet.absoluteFill}
          />

          {place.photos.length > 1 ? (
            <View style={styles.dots}>
              {place.photos.map((photo, i) => (
                <Pressable
                  key={photo}
                  accessibilityLabel={`Foto ${i + 1}`}
                  onPress={() => setPhotoIndex(i)}
                  style={[styles.dot, i === photoIndex && styles.dotActive]}
                />
              ))}
            </View>
          ) : null}
        </View>

        <View style={styles.body}>
          {/* A experiência antes do estabelecimento (Regra 01) */}
          <Text style={styles.experience}>{experienceTitle(place, moment)}</Text>

          <PlaceCard place={place} variant="full" />

          <View style={{ gap: 10 }}>
            <Text style={styles.sectionTitle}>DNA ROOV</Text>
            <Text style={styles.sectionHint}>
              A identidade deste lugar segundo quem já esteve aqui. Não é nota, é retrato.
            </Text>
            <DnaPanel dna={place.dna} />
          </View>

          <View style={{ gap: 10 }}>
            <Text style={styles.sectionTitle}>Funcionamento</Text>
            <View style={styles.infoCard}>
              <View style={styles.inline}>
                <Ionicons name="time-outline" size={14} color={colors.muted} />
                <Text style={[styles.infoText, open && { color: colors.vivido }]}>
                  {open ? 'Aberto agora' : 'Fechado agora'}
                </Text>
                <Text style={styles.infoMuted}>
                  · {place.hours.open} às {place.hours.close}
                </Text>
              </View>
              {place.hours.closedOn?.length ? (
                <Text style={styles.infoMuted}>
                  Fechado {place.hours.closedOn.map((d) => WEEKDAYS[d]).join(', ')}
                </Text>
              ) : null}
              <Text style={styles.infoMuted}>
                {place.neighborhood} · {place.city} — {place.state}
              </Text>
            </View>
          </View>

          <View style={{ gap: 12 }}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Experiências aqui</Text>
              <Pressable onPress={() => router.push('/criar')}>
                <Text style={styles.link}>publicar a sua</Text>
              </Pressable>
            </View>

            {posts === null ? (
              <Loading />
            ) : posts.length === 0 ? (
              <EmptyState
                emoji="🎬"
                title="Ninguém contou essa história ainda"
                message="Seja a primeira pessoa a registrar uma experiência neste lugar."
                action={
                  <GhostButton style={{ marginTop: 8, paddingHorizontal: 28 }} onPress={() => router.push('/criar')}>
                    Criar experiência
                  </GhostButton>
                }
              />
            ) : (
              posts.map((post) => <PostCard key={post.id} post={post} place={place} />)
            )}
          </View>

          {similar.length > 0 ? (
            <View style={{ gap: 10 }}>
              <Text style={styles.sectionTitle}>DNA parecido</Text>
              <Text style={styles.sectionHint}>
                Lugares diferentes que entregam uma sensação próxima.
              </Text>
              {similar.map((similarPlace) => (
                <PlaceCard key={similarPlace.id} place={similarPlace} variant="compact" />
              ))}
            </View>
          ) : null}
        </View>
      </ScrollView>

      {/* Controles flutuantes sobre a galeria */}
      <View style={[styles.floatingBar, { top: insets.top + 6 }]}>
        <Pressable accessibilityLabel="Voltar" onPress={() => router.back()} style={styles.floatingButton}>
          <Ionicons name="chevron-back" size={18} color={colors.foreground} />
        </Pressable>
        <Pressable
          accessibilityLabel="Compartilhar"
          onPress={() => actions.toast('Link do lugar copiado')}
          style={styles.floatingButton}
        >
          <Ionicons name="share-social-outline" size={17} color={colors.foreground} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: 16, gap: 26, marginTop: -18 },
  experience: { fontSize: 12, fontWeight: '600', color: colors.muted },

  dots: { position: 'absolute', left: 0, right: 0, bottom: 30, flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.4)' },
  dotActive: { width: 20, backgroundColor: '#FFFFFF' },

  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.foreground },
  sectionHint: { fontSize: 12, color: colors.muted, lineHeight: 17 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  link: { fontSize: 12, color: colors.muted, textDecorationLine: 'underline' },

  infoCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 16,
    gap: 6,
  },
  infoText: { fontSize: 14, color: colors.foreground },
  infoMuted: { fontSize: 12, color: colors.muted },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },

  floatingBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  floatingButton: {
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
