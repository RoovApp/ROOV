/**
 * Sistema Oficial de Filtros — ROOV Product, Cap. 10.
 *
 * Regra 07: todo módulo usa exatamente este sistema. Filtros são cumulativos,
 * removíveis individualmente e permanecem durante toda a navegação — por isso
 * vivem no estado global, não no estado local de cada tela.
 */

import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  AMBIENTES,
  CATEGORIES,
  CATEGORY_BY_ID,
  EMPTY_FILTERS,
  LIBRARY_KINDS,
  PERFIS,
  PLACE_TYPES,
  PRICE_RANGES,
  PUBLICOS,
  SORT_OPTIONS,
  VIBES,
  countActiveFilters,
  tag,
} from '../domain/taxonomy.js';
import { useRoov } from '../state/RoovProvider.jsx';
import { Chip, GhostButton, GradientButton, Sheet } from './ui.jsx';
import { colors, radius, withAlpha } from '../theme.js';

export function FilterButton({ onPress }) {
  const { filters } = useRoov();
  const count = countActiveFilters(filters);

  return (
    <Pressable
      accessibilityLabel="Filtros"
      onPress={onPress}
      style={({ pressed }) => [styles.filterButton, pressed && { opacity: 0.6 }]}
    >
      <Ionicons name="options-outline" size={18} color={colors.foreground} />
      {count > 0 ? (
        <View style={styles.filterBadge}>
          <Text style={styles.filterBadgeText}>{count}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

/** Chips do que está aplicado. Cada um remove só a si mesmo. */
export function ActiveFilterChips({ style }) {
  const { filters, actions } = useRoov();
  const chips = [];

  if (filters.category) {
    const meta = CATEGORY_BY_ID[filters.category];
    chips.push({
      key: `cat-${filters.category}`,
      label: meta.label,
      color: meta.hex,
      remove: () => actions.patchFilters({ category: null, placeTypes: [] }),
    });
  }
  for (const type of filters.placeTypes) {
    chips.push({
      key: `type-${type}`,
      label: type,
      remove: () =>
        actions.patchFilters({ placeTypes: filters.placeTypes.filter((t) => t !== type) }),
    });
  }
  for (const group of ['ambiente', 'vibe', 'publico', 'perfil']) {
    for (const id of filters[group]) {
      const t = tag(id);
      chips.push({
        key: `${group}-${id}`,
        label: `${t.emoji} ${t.label}`,
        remove: () => actions.patchFilters({ [group]: filters[group].filter((v) => v !== id) }),
      });
    }
  }
  for (const kind of filters.biblioteca) {
    const meta = LIBRARY_KINDS.find((k) => k.id === kind);
    chips.push({
      key: `lib-${kind}`,
      label: `${meta.emoji} ${meta.label}`,
      color: meta.color,
      remove: () =>
        actions.patchFilters({ biblioteca: filters.biblioteca.filter((k) => k !== kind) }),
    });
  }
  for (const price of filters.priceRange) {
    chips.push({
      key: `price-${price}`,
      label: PRICE_RANGES.find((p) => p.id === price).label,
      remove: () =>
        actions.patchFilters({ priceRange: filters.priceRange.filter((p) => p !== price) }),
    });
  }
  if (filters.maxDistanceKm !== EMPTY_FILTERS.maxDistanceKm) {
    chips.push({
      key: 'distance',
      label: `até ${filters.maxDistanceKm} km`,
      remove: () => actions.patchFilters({ maxDistanceKm: EMPTY_FILTERS.maxDistanceKm }),
    });
  }
  if (filters.sort !== EMPTY_FILTERS.sort) {
    chips.push({
      key: 'sort',
      label: SORT_OPTIONS.find((s) => s.id === filters.sort).label,
      remove: () => actions.patchFilters({ sort: EMPTY_FILTERS.sort }),
    });
  }

  if (!chips.length) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={style}
      contentContainerStyle={{ flexDirection: 'row', gap: 8, paddingHorizontal: 16 }}
    >
      {chips.map((chip) => (
        <Pressable
          key={chip.key}
          onPress={chip.remove}
          style={[
            styles.activeChip,
            chip.color && { borderColor: withAlpha(chip.color, 0.5) },
          ]}
        >
          <Text
            style={[styles.activeChipText, chip.color && { color: chip.color }]}
            numberOfLines={1}
          >
            {chip.label}
          </Text>
          <Ionicons name="close" size={11} color={chip.color ?? colors.foreground} />
        </Pressable>
      ))}
      <Pressable onPress={actions.resetFilters} style={{ justifyContent: 'center' }}>
        <Text style={styles.clearText}>limpar</Text>
      </Pressable>
    </ScrollView>
  );
}

/** Atalho de categoria — primeira etapa do funil, sempre visível. */
export function CategoryRail({ style }) {
  const { filters, actions } = useRoov();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={style}
      contentContainerStyle={{ flexDirection: 'row', gap: 8, paddingHorizontal: 16 }}
    >
      <Chip
        active={!filters.category}
        onPress={() => actions.patchFilters({ category: null, placeTypes: [] })}
      >
        Tudo
      </Chip>
      {CATEGORIES.map((category) => (
        <Chip
          key={category.id}
          active={filters.category === category.id}
          color={category.hex}
          onPress={() =>
            actions.patchFilters({
              category: filters.category === category.id ? null : category.id,
              placeTypes: [],
            })
          }
        >
          {category.short}
        </Chip>
      ))}
    </ScrollView>
  );
}

const DISTANCES = [2, 5, 10, 25];

/**
 * Painel completo. Edita um rascunho local e só grava no estado global ao
 * aplicar, para a lista atrás não ficar piscando a cada toque.
 */
export function FilterSheet({ open, onClose, resultCount }) {
  const { filters, actions } = useRoov();
  const [draft, setDraft] = useState(filters);
  const [lastOpen, setLastOpen] = useState(open);

  if (open !== lastOpen) {
    setLastOpen(open);
    if (open) setDraft(filters);
  }

  const toggleIn = (key, value) =>
    setDraft((d) => ({
      ...d,
      [key]: d[key].includes(value) ? d[key].filter((v) => v !== value) : [...d[key], value],
    }));

  const placeTypes = draft.category ? PLACE_TYPES[draft.category] : [];

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Filtros"
      subtitle="Combine quantos quiser — eles valem em todo o app"
      footer={
        <>
          <GhostButton style={{ flex: 1 }} onPress={() => setDraft(EMPTY_FILTERS)}>
            Limpar
          </GhostButton>
          <GradientButton
            style={{ flex: 1 }}
            onPress={() => {
              actions.setFilters(draft);
              onClose();
            }}
          >
            {resultCount != null ? `Aplicar · ${resultCount}` : 'Aplicar'}
          </GradientButton>
        </>
      }
    >
      <View style={{ gap: 20 }}>
        <Group label="Categoria principal">
          {CATEGORIES.map((category) => (
            <Chip
              key={category.id}
              color={category.hex}
              active={draft.category === category.id}
              onPress={() =>
                setDraft((d) => ({
                  ...d,
                  category: d.category === category.id ? null : category.id,
                  placeTypes: [],
                }))
              }
            >
              {category.label}
            </Chip>
          ))}
        </Group>

        {placeTypes.length > 0 ? (
          <Group label="Tipo do local">
            {placeTypes.map((type) => (
              <Chip
                key={type}
                active={draft.placeTypes.includes(type)}
                onPress={() => toggleIn('placeTypes', type)}
              >
                {type}
              </Chip>
            ))}
          </Group>
        ) : null}

        <TagGroup label="Ambiente" tags={AMBIENTES} selected={draft.ambiente} onToggle={(id) => toggleIn('ambiente', id)} />
        <TagGroup label="Vibe & Sensação" tags={VIBES} selected={draft.vibe} onToggle={(id) => toggleIn('vibe', id)} />
        <TagGroup label="Público" tags={PUBLICOS} selected={draft.publico} onToggle={(id) => toggleIn('publico', id)} />
        <TagGroup label="Perfil do local" tags={PERFIS} selected={draft.perfil} onToggle={(id) => toggleIn('perfil', id)} />

        <Group label="Classificação da biblioteca">
          {LIBRARY_KINDS.map((kind) => (
            <Chip
              key={kind.id}
              color={kind.color}
              active={draft.biblioteca.includes(kind.id)}
              onPress={() => toggleIn('biblioteca', kind.id)}
            >
              {kind.emoji} {kind.label}
            </Chip>
          ))}
        </Group>

        <Group label="Preço">
          {PRICE_RANGES.map((price) => (
            <Chip
              key={price.id}
              active={draft.priceRange.includes(price.id)}
              onPress={() => toggleIn('priceRange', price.id)}
            >
              {price.label} · {price.hint}
            </Chip>
          ))}
        </Group>

        <Group label="Distância">
          {DISTANCES.map((km) => (
            <Chip
              key={km}
              active={draft.maxDistanceKm === km}
              onPress={() => setDraft((d) => ({ ...d, maxDistanceKm: km }))}
            >
              até {km} km
            </Chip>
          ))}
        </Group>

        <Group label="Ordenação">
          {SORT_OPTIONS.map((option) => (
            <Chip
              key={option.id}
              active={draft.sort === option.id}
              onPress={() => setDraft((d) => ({ ...d, sort: option.id }))}
            >
              {option.label}
            </Chip>
          ))}
        </Group>
      </View>
    </Sheet>
  );
}

function Group({ label, children }) {
  return (
    <View>
      <Text style={styles.groupLabel}>{label.toUpperCase()}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{children}</View>
    </View>
  );
}

function TagGroup({ label, tags, selected, onToggle }) {
  return (
    <Group label={label}>
      {tags.map((t) => (
        <Chip key={t.id} active={selected.includes(t.id)} onPress={() => onToggle(t.id)}>
          {t.emoji} {t.label}
        </Chip>
      ))}
    </Group>
  );
}

const styles = StyleSheet.create({
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: '#FF0F7B',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeText: { fontSize: 10, fontWeight: '700', color: '#FFFFFF' },

  activeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceHover,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  activeChipText: { fontSize: 11, color: colors.foreground },
  clearText: { fontSize: 11, color: colors.muted, textDecorationLine: 'underline' },

  groupLabel: { fontSize: 10, letterSpacing: 0.8, color: colors.muted, marginBottom: 8 },
});
