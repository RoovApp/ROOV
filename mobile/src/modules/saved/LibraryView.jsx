/**
 * Minha Biblioteca — ROOV Product, Cap. 14 e 42.
 *
 * Quatro compartimentos oficiais: Favoritos, Quero Conhecer, Experiências
 * Vividas e Coleções Personalizadas. Nenhum outro agrupamento é permitido.
 */

import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PlaceCard } from '../../components/PlaceCard.jsx';
import {
  Chip,
  EmptyState,
  GhostButton,
  GradientButton,
  Sheet,
} from '../../components/ui.jsx';
import { LIBRARY_KINDS } from '../../domain/taxonomy.js';
import { applyFilters } from '../../engine/recommendation.js';
import { useRoov } from '../../state/RoovProvider.jsx';
import { colors, radius, withAlpha } from '../../theme.js';

export function LibraryView() {
  const { library, placeById, collections, filters, actions } = useRoov();
  const [kind, setKind] = useState('favorito');
  const [openCollection, setOpenCollection] = useState(null);
  const [creating, setCreating] = useState(false);

  const places = useMemo(() => {
    const resolved = library.placeIdsOf(kind).map((id) => placeById[id]).filter(Boolean);
    // A biblioteca respeita os mesmos filtros globais dos outros módulos.
    return applyFilters(resolved, { ...filters, biblioteca: [] }, { library });
  }, [library, placeById, kind, filters]);

  const activeKind = LIBRARY_KINDS.find((k) => k.id === kind);

  return (
    <ScrollView
      contentContainerStyle={{ padding: 16, gap: 24, paddingBottom: 130 }}
      showsVerticalScrollIndicator={false}
    >
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {LIBRARY_KINDS.map((k) => (
            <Chip key={k.id} active={kind === k.id} color={k.color} onPress={() => setKind(k.id)}>
              {k.emoji} {k.label} · {library.placeIdsOf(k.id).length}
            </Chip>
          ))}
        </View>
      </ScrollView>

      {places.length === 0 ? (
        <EmptyState
          emoji={activeKind.emoji}
          title={`Nada em ${activeKind.label}`}
          message="Toda experiência pode ser salva. Comece marcando um lugar no mapa ou no feed."
        />
      ) : (
        <View style={{ gap: 8 }}>
          {places.map((place) => (
            <PlaceCard key={place.id} place={place} variant="compact" />
          ))}
        </View>
      )}

      <View style={{ gap: 12 }}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📚 Coleções</Text>
          <Pressable onPress={() => setCreating(true)} style={styles.inline}>
            <Ionicons name="add" size={14} color={colors.muted} />
            <Text style={styles.link}>nova</Text>
          </Pressable>
        </View>

        {collections.map((collection) => (
          <Pressable
            key={collection.id}
            onPress={() => setOpenCollection(collection)}
            style={({ pressed }) => [styles.collectionRow, pressed && { opacity: 0.75 }]}
          >
            <View
              style={[styles.collectionIcon, { backgroundColor: withAlpha(collection.color, 0.18) }]}
            >
              <Text style={{ fontSize: 20 }}>{collection.emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.collectionName} numberOfLines={1}>
                {collection.name}
              </Text>
              <Text style={styles.collectionMeta} numberOfLines={1}>
                {collection.description || `${collection.placeIds.length} lugares`}
              </Text>
            </View>
            <Text style={styles.collectionMeta}>{collection.placeIds.length}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.muted} />
          </Pressable>
        ))}
      </View>

      <CollectionDetailSheet
        collection={openCollection}
        placeById={placeById}
        onClose={() => setOpenCollection(null)}
      />

      <NewCollectionSheet
        open={creating}
        onClose={() => setCreating(false)}
        onCreate={(collection) => {
          actions.createCollection(collection);
          setCreating(false);
        }}
      />
    </ScrollView>
  );
}

function CollectionDetailSheet({ collection, placeById, onClose }) {
  if (!collection) return null;
  const places = collection.placeIds.map((id) => placeById[id]).filter(Boolean);

  return (
    <Sheet
      open
      onClose={onClose}
      title={`${collection.emoji} ${collection.name}`}
      subtitle={collection.description || `${places.length} lugares`}
    >
      <View style={{ gap: 8 }}>
        {places.length === 0 ? (
          <EmptyState emoji="📭" title="Coleção vazia" message="Adicione lugares pelo Place Card." />
        ) : (
          places.map((place) => <PlaceCard key={place.id} place={place} variant="compact" />)
        )}
      </View>
    </Sheet>
  );
}

const EMOJIS = ['📚', '💘', '🌿', '🌃', '🧳', '🍽️', '💎', '🎧'];
const COLORS = ['#8B5CFF', '#FF0F7B', '#FF7A1A', '#FFB400', '#22C55E'];

function NewCollectionSheet({ open, onClose, onCreate }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [emoji, setEmoji] = useState('📚');
  const [color, setColor] = useState(COLORS[0]);

  const submit = () => {
    if (!name.trim()) return;
    onCreate({
      id: `col-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      emoji,
      color,
      placeIds: [],
    });
    setName('');
    setDescription('');
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Nova coleção"
      subtitle="Agrupe experiências do seu jeito"
      footer={
        <>
          <GhostButton style={{ flex: 1 }} onPress={onClose}>
            Cancelar
          </GhostButton>
          <GradientButton style={{ flex: 1 }} onPress={submit} disabled={!name.trim()}>
            Criar
          </GradientButton>
        </>
      }
    >
      <View style={{ gap: 16 }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {EMOJIS.map((e) => (
            <Pressable
              key={e}
              onPress={() => setEmoji(e)}
              style={[styles.emojiOption, emoji === e && styles.emojiOptionActive]}
            >
              <Text style={{ fontSize: 20 }}>{e}</Text>
            </Pressable>
          ))}
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          {COLORS.map((c) => (
            <Pressable
              key={c}
              accessibilityLabel={`Cor ${c}`}
              onPress={() => setColor(c)}
              style={[
                styles.colorOption,
                { backgroundColor: c },
                color === c && { borderColor: '#FFFFFF' },
              ]}
            />
          ))}
        </View>

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Nome da coleção"
          placeholderTextColor={colors.muted}
          style={styles.input}
        />
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Descrição (opcional)"
          placeholderTextColor={colors.muted}
          style={styles.input}
        />
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.foreground },
  link: { fontSize: 12, color: colors.muted },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 4 },

  collectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 12,
  },
  collectionIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  collectionName: { fontSize: 14, fontWeight: '600', color: colors.foreground },
  collectionMeta: { fontSize: 11, color: colors.muted },

  emojiOption: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  emojiOptionActive: { borderColor: '#FFFFFF', backgroundColor: colors.surfaceHover },
  colorOption: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: 'transparent' },

  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.foreground,
  },
});
