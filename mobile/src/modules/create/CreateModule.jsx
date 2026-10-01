/**
 * Criar Experiência — ROOV Product, Cap. 5.5 e 11.
 *
 * Duas regras governam esta tela:
 *   Regra 02 — todo post pertence obrigatoriamente a um lugar;
 *   Cap. 11  — toda postagem precisa das tags obrigatórias (ambiente, vibe,
 *              público e perfil), porque são elas que constroem o DNA.
 *
 * Fluxo: escolher lugar → mídia e relato → tags → publicar.
 */

import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Chip, EmptyState, GradientButton, TagPill } from '../../components/ui.jsx';
import { DnaStrip } from '../../components/DnaStrip.jsx';
import { TAG_GROUPS, tag as resolveTag } from '../../domain/taxonomy.js';
import { formatDistance } from '../../engine/recommendation.js';
import { useRoov } from '../../state/RoovProvider.jsx';
import { colors, radius, withAlpha } from '../../theme.js';

const STEPS = ['lugar', 'relato', 'tags'];

export function CreateModule() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { places, actions } = useRoov();

  const [step, setStep] = useState('lugar');
  const [query, setQuery] = useState('');
  const [place, setPlace] = useState(null);
  const [caption, setCaption] = useState('');
  const [photo, setPhoto] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState(null);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pool = q
      ? places.filter((p) =>
          [p.name, p.placeType, p.neighborhood].join(' ').toLowerCase().includes(q),
        )
      : [...places].sort((a, b) => a.distanceKm - b.distanceKm);
    return pool.slice(0, 12);
  }, [places, query]);

  /** Quais grupos obrigatórios ainda faltam — visível o tempo todo. */
  const missingGroups = useMemo(() => {
    const covered = new Set();
    for (const tagId of selectedTags) {
      const group = TAG_GROUPS.find((g) => g.tags.some((t) => t.id === tagId));
      if (group) covered.add(group.key);
    }
    return TAG_GROUPS.filter((g) => g.required && !covered.has(g.key));
  }, [selectedTags]);

  const toggleTag = (id) =>
    setSelectedTags((current) =>
      current.includes(id) ? current.filter((t) => t !== id) : [...current, id],
    );

  const pickImage = async (fromCamera) => {
    const permission = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      actions.toast('Permissão negada — usando a foto do lugar');
      return;
    }

    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.8, aspect: [4, 5] })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          quality: 0.8,
        });

    if (!result.canceled && result.assets?.[0]) setPhoto(result.assets[0].uri);
  };

  const publish = async () => {
    setPublishing(true);
    setError(null);
    try {
      await actions.publishPost({
        placeId: place.id,
        media: [photo ?? place.photos[0]],
        caption: caption.trim(),
        tags: selectedTags,
      });
      router.replace(`/place/${place.id}`);
    } catch (e) {
      setError(e.message);
      setPublishing(false);
    }
  };

  const goBack = () => {
    const index = STEPS.indexOf(step);
    if (index === 0) router.back();
    else setStep(STEPS[index - 1]);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top + 6 }}
    >
      <View style={styles.header}>
        <Pressable accessibilityLabel="Voltar" onPress={goBack} style={styles.iconButton}>
          <Ionicons name="chevron-back" size={18} color={colors.foreground} />
        </Pressable>
        <Text style={styles.headerTitle}>Nova experiência</Text>
      </View>

      <View style={styles.stepBar}>
        {STEPS.map((s) => (
          <View
            key={s}
            style={[
              styles.stepSegment,
              STEPS.indexOf(s) <= STEPS.indexOf(step) && { backgroundColor: '#FF0F7B' },
            ]}
          />
        ))}
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: insets.bottom + 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {step === 'lugar' ? (
          <>
            <View>
              <Text style={styles.stepTitle}>Onde foi?</Text>
              <Text style={styles.stepHint}>
                Toda experiência acontece em algum lugar — é ele que ganha DNA com o seu post.
              </Text>
            </View>

            <View style={styles.searchField}>
              <Ionicons name="search" size={16} color={colors.muted} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Buscar lugar"
                placeholderTextColor={colors.muted}
                style={styles.input}
              />
            </View>

            {matches.length === 0 ? (
              <EmptyState emoji="📍" title="Nenhum lugar encontrado com esse nome" />
            ) : (
              matches.map((option) => (
                <Pressable
                  key={option.id}
                  onPress={() => {
                    setPlace(option);
                    setPhoto(null);
                    setStep('relato');
                  }}
                  style={({ pressed }) => [styles.placeRow, pressed && { opacity: 0.75 }]}
                >
                  <Image source={option.photos[0]} style={styles.placeThumb} contentFit="cover" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.placeName} numberOfLines={1}>
                      {option.name}
                    </Text>
                    <Text style={styles.placeMeta} numberOfLines={1}>
                      {option.placeType} · {option.neighborhood} ·{' '}
                      {formatDistance(option.distanceKm)}
                    </Text>
                  </View>
                </Pressable>
              ))
            )}
          </>
        ) : null}

        {step === 'relato' && place ? (
          <>
            <View style={styles.selectedPlace}>
              <Ionicons name="location-outline" size={16} color={colors.muted} />
              <View style={{ flex: 1 }}>
                <Text style={styles.placeName} numberOfLines={1}>
                  {place.name}
                </Text>
                <Text style={styles.placeMeta} numberOfLines={1}>
                  {place.neighborhood} · {place.city}
                </Text>
              </View>
              <Pressable onPress={() => setStep('lugar')}>
                <Text style={styles.link}>trocar</Text>
              </Pressable>
            </View>

            <View>
              <Text style={styles.stepTitle}>A foto da experiência</Text>
              <Text style={styles.stepHint}>
                Tire agora, escolha da galeria, ou use a foto do lugar.
              </Text>
            </View>

            <Image
              source={photo ?? place.photos[0]}
              style={styles.preview}
              contentFit="cover"
              transition={200}
            />

            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Pressable onPress={() => pickImage(true)} style={styles.mediaButton}>
                <Ionicons name="camera-outline" size={16} color={colors.foreground} />
                <Text style={styles.mediaButtonText}>Câmera</Text>
              </Pressable>
              <Pressable onPress={() => pickImage(false)} style={styles.mediaButton}>
                <Ionicons name="images-outline" size={16} color={colors.foreground} />
                <Text style={styles.mediaButtonText}>Galeria</Text>
              </Pressable>
              {photo ? (
                <Pressable onPress={() => setPhoto(null)} style={styles.mediaButton}>
                  <Ionicons name="close" size={16} color={colors.muted} />
                  <Text style={styles.mediaButtonText}>Limpar</Text>
                </Pressable>
              ) : null}
            </View>

            <View>
              <Text style={styles.stepTitle}>Conte a experiência</Text>
              <TextInput
                multiline
                value={caption}
                onChangeText={setCaption}
                placeholder="O que aconteceu, o que valeu a pena, o que você faria diferente…"
                placeholderTextColor={colors.muted}
                style={[styles.input, styles.textarea]}
              />
            </View>

            <GradientButton onPress={() => setStep('tags')} disabled={!caption.trim()}>
              Continuar
            </GradientButton>
          </>
        ) : null}

        {step === 'tags' && place ? (
          <>
            <View>
              <Text style={styles.stepTitle}>Como foi essa experiência?</Text>
              <Text style={styles.stepHint}>
                Estas tags constroem o DNA de {place.name}. Sem elas, o lugar não ganha identidade.
              </Text>
            </View>

            {missingGroups.length > 0 ? (
              <Text style={styles.warning}>
                Ainda faltam: {missingGroups.map((g) => g.label).join(', ')}.
              </Text>
            ) : null}

            {TAG_GROUPS.map((group) => (
              <View key={group.key} style={{ gap: 8 }}>
                <Text style={styles.groupLabel}>
                  {group.label.toUpperCase()}
                  {group.required ? ' *' : ''}
                </Text>
                <View style={styles.wrap}>
                  {group.tags.map((t) => (
                    <Chip
                      key={t.id}
                      active={selectedTags.includes(t.id)}
                      onPress={() => toggleTag(t.id)}
                    >
                      {t.emoji} {t.label}
                    </Chip>
                  ))}
                </View>
              </View>
            ))}

            <View style={styles.dnaPreview}>
              <Text style={styles.previewTitle}>Prévia do que você adiciona ao DNA</Text>
              <View style={styles.wrap}>
                {selectedTags.length === 0 ? (
                  <Text style={styles.placeMeta}>Nenhuma tag escolhida ainda.</Text>
                ) : (
                  selectedTags.map((id) => {
                    const t = resolveTag(id);
                    return (
                      <TagPill key={id}>
                        {t.emoji} {t.label}
                      </TagPill>
                    );
                  })
                )}
              </View>
              <Text style={styles.previewTitle}>DNA atual do lugar</Text>
              <DnaStrip dna={place.dna} limit={4} />
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <GradientButton
              onPress={publish}
              disabled={publishing || missingGroups.length > 0 || !caption.trim()}
            >
              {publishing ? 'Publicando…' : 'Publicar experiência'}
            </GradientButton>
          </>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16 },
  headerTitle: { fontSize: 15, fontWeight: '700', color: colors.foreground },
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

  stepBar: { flexDirection: 'row', gap: 6, paddingHorizontal: 16, paddingTop: 12 },
  stepSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },

  stepTitle: { fontSize: 16, fontWeight: '700', color: colors.foreground, marginBottom: 4 },
  stepHint: { fontSize: 12, color: colors.muted, lineHeight: 17 },

  searchField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 46,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.foreground,
    padding: 0,
  },
  textarea: {
    height: 120,
    marginTop: 10,
    padding: 16,
    textAlignVertical: 'top',
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  placeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 10,
  },
  placeThumb: { width: 56, height: 56, borderRadius: radius.md },
  placeName: { fontSize: 14, fontWeight: '600', color: colors.foreground },
  placeMeta: { fontSize: 11, color: colors.muted },
  link: { fontSize: 11, color: colors.muted, textDecorationLine: 'underline' },

  selectedPlace: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 12,
  },

  preview: { width: '100%', aspectRatio: 4 / 5, borderRadius: radius.lg },
  mediaButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 42,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  mediaButtonText: { fontSize: 12, fontWeight: '600', color: colors.foreground },

  groupLabel: { fontSize: 10, letterSpacing: 0.8, color: colors.muted },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },

  dnaPreview: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 16,
    gap: 10,
  },
  previewTitle: { fontSize: 12, fontWeight: '700', color: colors.foreground },

  warning: {
    fontSize: 11,
    color: colors.foreground,
    borderWidth: 1,
    borderColor: withAlpha('#FFB400', 0.45),
    backgroundColor: withAlpha('#FFB400', 0.1),
    borderRadius: radius.lg,
    padding: 12,
  },
  error: {
    fontSize: 11,
    color: colors.foreground,
    borderWidth: 1,
    borderColor: withAlpha('#FF0F7B', 0.45),
    backgroundColor: withAlpha('#FF0F7B', 0.1),
    borderRadius: radius.lg,
    padding: 12,
  },
});
