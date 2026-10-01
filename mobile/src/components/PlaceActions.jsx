/**
 * Fluxo de Organização — ROOV Product, Cap. 5.4.
 *
 * ❤️ Favoritar · ⭐ Quero Conhecer · ✅ Vivido · 📚 Coleção · 📅 Agenda
 *
 * As duas últimas abrem sheets montados uma única vez pelo provider, para que
 * qualquer card em qualquer lista dispare exatamente o mesmo fluxo.
 */

import { createContext, useContext, useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoov } from '../state/RoovProvider.jsx';
import { LIBRARY_KINDS } from '../domain/taxonomy.js';
import { toLocalDateKey } from '../engine/moment.js';
import { GhostButton, GradientButton, Sheet } from './ui.jsx';
import { colors, LIBRARY_ICONS, radius, withAlpha } from '../theme.js';

const PlaceActionsContext = createContext(null);

export function PlaceActionsProvider({ children }) {
  const { collections, agenda, actions } = useRoov();
  const [collectionTarget, setCollectionTarget] = useState(null);
  const [agendaTarget, setAgendaTarget] = useState(null);

  const value = useMemo(
    () => ({ openCollections: setCollectionTarget, openAgenda: setAgendaTarget }),
    [],
  );

  return (
    <PlaceActionsContext.Provider value={value}>
      {children}
      <CollectionSheet
        place={collectionTarget}
        collections={collections}
        actions={actions}
        onClose={() => setCollectionTarget(null)}
      />
      <AgendaSheet
        place={agendaTarget}
        agenda={agenda}
        actions={actions}
        onClose={() => setAgendaTarget(null)}
      />
    </PlaceActionsContext.Provider>
  );
}

export function usePlaceActions() {
  const ctx = useContext(PlaceActionsContext);
  if (!ctx) throw new Error('usePlaceActions precisa estar dentro de <PlaceActionsProvider>.');
  return ctx;
}

/** Classificação da Biblioteca — três botões, sempre na mesma ordem. */
export function LibraryActionRow({ place, size = 'md', showLabels = false, style }) {
  const { library, actions } = useRoov();
  const dimension = size === 'sm' ? 32 : 38;
  const iconSize = size === 'sm' ? 16 : 18;

  return (
    <View style={[{ flexDirection: 'row', gap: 6 }, style]}>
      {LIBRARY_KINDS.map((kind) => {
        const active = library.has(place.id, kind.id);
        const icon = LIBRARY_ICONS[kind.id];

        return (
          <Pressable
            key={kind.id}
            accessibilityRole="button"
            accessibilityLabel={kind.singular}
            accessibilityState={{ selected: active }}
            onPress={() => actions.toggleLibrary(place.id, kind.id, kind.label)}
            style={({ pressed }) => [
              styles.libButton,
              showLabels
                ? { flex: 1, height: 42, flexDirection: 'row', gap: 6, paddingHorizontal: 10 }
                : { width: dimension, height: dimension },
              active && { borderColor: kind.color, backgroundColor: withAlpha(kind.color, 0.14) },
              pressed && { opacity: 0.6 },
            ]}
          >
            <Ionicons
              name={active ? icon.on : icon.off}
              size={iconSize}
              color={active ? kind.color : colors.muted}
            />
            {showLabels ? (
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '600',
                  color: active ? kind.color : colors.muted,
                }}
                numberOfLines={1}
              >
                {kind.shortLabel}
              </Text>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

/** Ações de planejamento: coleção e agenda. */
export function PlanActionRow({ place, style }) {
  const { openCollections, openAgenda } = usePlaceActions();

  return (
    <View style={[{ flexDirection: 'row', gap: 8 }, style]}>
      <Pressable
        onPress={() => openCollections(place)}
        style={({ pressed }) => [styles.planButton, pressed && { opacity: 0.6 }]}
      >
        <Ionicons name="albums-outline" size={16} color={colors.foreground} />
        <Text style={styles.planButtonText}>Coleção</Text>
      </Pressable>
      <Pressable
        onPress={() => openAgenda(place)}
        style={({ pressed }) => [styles.planButton, pressed && { opacity: 0.6 }]}
      >
        <Ionicons name="calendar-outline" size={16} color={colors.foreground} />
        <Text style={styles.planButtonText}>Agenda</Text>
      </Pressable>
    </View>
  );
}

/* ─── Sheets ──────────────────────────────────────────────────────────────── */

const COLLECTION_EMOJIS = ['📚', '💘', '🌿', '🌃', '🧳', '🍽️', '💎'];

function CollectionSheet({ place, collections, actions, onClose }) {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('📚');

  if (!place) return null;

  const submit = () => {
    if (!name.trim()) return;
    actions.createCollection({
      id: `col-${Date.now()}`,
      name: name.trim(),
      description: '',
      emoji,
      color: '#8B5CFF',
      placeIds: [place.id],
    });
    setName('');
    setCreating(false);
    onClose();
  };

  return (
    <Sheet
      open
      onClose={onClose}
      title="Adicionar em coleção"
      subtitle={place.name}
      footer={
        creating ? (
          <>
            <GhostButton style={{ flex: 1 }} onPress={() => setCreating(false)}>
              Cancelar
            </GhostButton>
            <GradientButton style={{ flex: 1 }} onPress={submit} disabled={!name.trim()}>
              Criar
            </GradientButton>
          </>
        ) : (
          <GhostButton style={{ flex: 1 }} onPress={() => setCreating(true)}>
            + Nova coleção
          </GhostButton>
        )
      }
    >
      {creating ? (
        <View style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {COLLECTION_EMOJIS.map((e) => (
              <Pressable
                key={e}
                onPress={() => setEmoji(e)}
                style={[styles.emojiOption, emoji === e && styles.emojiOptionActive]}
              >
                <Text style={{ fontSize: 20 }}>{e}</Text>
              </Pressable>
            ))}
          </View>
          <TextInput
            autoFocus
            value={name}
            onChangeText={setName}
            placeholder="Nome da coleção"
            placeholderTextColor={colors.muted}
            style={styles.input}
          />
        </View>
      ) : (
        <View style={{ gap: 8 }}>
          {collections.map((collection) => {
            const inside = collection.placeIds.includes(place.id);
            return (
              <Pressable
                key={collection.id}
                onPress={() => actions.toggleInCollection(collection.id, place.id)}
                style={[styles.collectionRow, inside && styles.collectionRowActive]}
              >
                <View
                  style={[styles.collectionIcon, { backgroundColor: withAlpha(collection.color, 0.18) }]}
                >
                  <Text style={{ fontSize: 18 }}>{collection.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.collectionName} numberOfLines={1}>
                    {collection.name}
                  </Text>
                  <Text style={styles.collectionMeta}>{collection.placeIds.length} lugares</Text>
                </View>
                {inside ? (
                  <Ionicons name="checkmark-circle" size={20} color={colors.vivido} />
                ) : null}
              </Pressable>
            );
          })}
        </View>
      )}
    </Sheet>
  );
}

const DURATIONS = ['45min', '1h30', '2h', '3h'];

function AgendaSheet({ place, agenda, actions, onClose }) {
  const today = new Date();
  const [dayOffset, setDayOffset] = useState(0);
  const [time, setTime] = useState('19:00');
  const [duration, setDuration] = useState('2h');
  const [notes, setNotes] = useState('');

  if (!place) return null;

  const already = agenda.filter((item) => item.placeId === place.id);

  /**
   * Sem date picker nativo instalado, o usuário escolhe entre os próximos 14
   * dias — cobre o caso real de planejamento sem adicionar dependência.
   */
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    return {
      offset: i,
      iso: toLocalDateKey(d),
      label:
        i === 0
          ? 'Hoje'
          : i === 1
            ? 'Amanhã'
            : d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    };
  });

  const submit = () => {
    actions.addAgendaItem({
      id: `ag-${Date.now()}`,
      placeId: place.id,
      date: days[dayOffset].iso,
      time,
      duration,
      notes: notes.trim(),
      status: 'planejado',
    });
    setNotes('');
    onClose();
  };

  return (
    <Sheet
      open
      onClose={onClose}
      title="Adicionar à agenda"
      subtitle={place.name}
      footer={
        <GradientButton style={{ flex: 1 }} onPress={submit}>
          Planejar experiência
        </GradientButton>
      }
    >
      <View style={{ gap: 16 }}>
        {already.length > 0 ? (
          <Text style={styles.hint}>
            Você já tem {already.length} {already.length === 1 ? 'plano' : 'planos'} aqui.
          </Text>
        ) : null}

        <View>
          <Text style={styles.fieldLabel}>Dia</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {days.map((day) => (
                <Pressable
                  key={day.iso}
                  onPress={() => setDayOffset(day.offset)}
                  style={[styles.option, dayOffset === day.offset && styles.optionActive]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      dayOffset === day.offset && styles.optionTextActive,
                    ]}
                  >
                    {day.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>

        <View>
          <Text style={styles.fieldLabel}>Hora</Text>
          <TextInput
            value={time}
            onChangeText={setTime}
            placeholder="19:00"
            placeholderTextColor={colors.muted}
            keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'default'}
            style={styles.input}
          />
        </View>

        <View>
          <Text style={styles.fieldLabel}>Duração</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {DURATIONS.map((option) => (
              <Pressable
                key={option}
                onPress={() => setDuration(option)}
                style={[styles.option, { flex: 1 }, duration === option && styles.optionActive]}
              >
                <Text
                  style={[styles.optionText, duration === option && styles.optionTextActive]}
                >
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View>
          <Text style={styles.fieldLabel}>Observações</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            placeholder="Reservar mesa, chegar antes…"
            placeholderTextColor={colors.muted}
            style={[styles.input, { height: 84, textAlignVertical: 'top' }]}
          />
        </View>
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  libButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  planButton: {
    flex: 1,
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  planButtonText: { fontSize: 12, fontWeight: '600', color: colors.foreground },

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
  fieldLabel: { fontSize: 11, color: colors.muted, marginBottom: 6 },
  hint: {
    fontSize: 11,
    color: colors.muted,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 10,
  },

  option: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
  },
  optionActive: { borderColor: '#FFFFFF', backgroundColor: colors.surfaceHover },
  optionText: { fontSize: 12, color: colors.muted },
  optionTextActive: { color: colors.foreground, fontWeight: '600' },

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

  collectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 12,
  },
  collectionRowActive: { borderColor: colors.borderStrong, backgroundColor: colors.surfaceHover },
  collectionIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  collectionName: { fontSize: 14, fontWeight: '600', color: colors.foreground },
  collectionMeta: { fontSize: 11, color: colors.muted },
});
