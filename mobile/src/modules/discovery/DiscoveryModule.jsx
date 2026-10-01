/**
 * Módulo de Descoberta — Mapa, Feed e Explorar sob a mesma aba.
 *
 * Cap. 8 define exatamente estas três abas internas; Cap. 5.3 diz que os três
 * caminhos convergem para o mesmo destino, o ROOV Place Card. Por isso os três
 * compartilham header, pesquisa e filtros.
 */

import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SearchBar } from '../../components/SearchBar.jsx';
import {
  ActiveFilterChips,
  CategoryRail,
  FilterButton,
  FilterSheet,
} from '../../components/FilterSystem.jsx';
import { Loading, SegmentedTabs } from '../../components/ui.jsx';
import { applyFilters } from '../../engine/recommendation.js';
import { useRoov } from '../../state/RoovProvider.jsx';
import { PlacesMap } from './MapView';
import { MapBoundary } from './MapBoundary.jsx';
import { FeedView } from './FeedView.jsx';
import { ExploreView } from './ExploreView.jsx';
import { colors, radius } from '../../theme.js';

const VIEWS = [
  { id: 'mapa', label: 'Mapa' },
  { id: 'feed', label: 'Feed' },
  { id: 'explorar', label: 'Explorar' },
];

export function DiscoveryModule() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { ready, places, filters, library, user, moment } = useRoov();
  const [view, setView] = useState('mapa');
  const [filterOpen, setFilterOpen] = useState(false);

  const filtered = useMemo(
    () => applyFilters(places, filters, { library }),
    [places, filters, library],
  );

  const visiblePlaceIds = useMemo(() => new Set(filtered.map((p) => p.id)), [filtered]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 6 }]}>
      <View style={styles.headerRow}>
        <SearchBar />
        <FilterButton onPress={() => setFilterOpen(true)} />
        <Pressable onPress={() => router.push('/perfil')}>
          <Image source={user?.avatar} style={styles.avatar} contentFit="cover" />
        </Pressable>
      </View>

      <CategoryRail style={{ marginTop: 10, flexGrow: 0 }} />
      <ActiveFilterChips style={{ marginTop: 8, flexGrow: 0 }} />

      <View style={styles.subHeader}>
        <View style={styles.cityPill}>
          <Ionicons name="navigate" size={12} color={colors.foreground} />
          <Text style={styles.cityText}>{moment.city}</Text>
        </View>
        <SegmentedTabs value={view} onChange={setView} options={VIEWS} style={{ width: 208 }} />
      </View>

      <View style={{ flex: 1 }}>
        {!ready ? (
          <Loading label="Carregando experiências…" />
        ) : view === 'mapa' ? (
          <MapBoundary places={filtered}>
            <PlacesMap places={filtered} />
          </MapBoundary>
        ) : view === 'feed' ? (
          <FeedView visiblePlaceIds={visiblePlaceIds} />
        ) : (
          <ExploreView places={filtered} />
        )}
      </View>

      <FilterSheet
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        resultCount={filtered.length}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16 },
  avatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: '#8B5CFF' },
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  cityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  cityText: { fontSize: 11, color: colors.foreground, fontWeight: '600' },
});
