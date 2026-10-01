/**
 * Salvos — ROOV Product, Cap. 22. Organização pessoal.
 *
 * Duas abas internas, como o Cap. 8 define: Minha Biblioteca (Cap. 14) e
 * Agenda (Cap. 15). É o módulo que transforma intenção em planejamento.
 */

import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SearchBar } from '../../components/SearchBar.jsx';
import { FilterButton, FilterSheet } from '../../components/FilterSystem.jsx';
import { SegmentedTabs } from '../../components/ui.jsx';
import { useRoov } from '../../state/RoovProvider.jsx';
import { LibraryView } from './LibraryView.jsx';
import { AgendaView } from './AgendaView.jsx';
import { colors } from '../../theme.js';

export function SavedModule() {
  const insets = useSafeAreaInsets();
  const { library, agenda } = useRoov();
  const [tab, setTab] = useState('biblioteca');
  const [filterOpen, setFilterOpen] = useState(false);

  const options = useMemo(
    () => [
      { id: 'biblioteca', label: `Biblioteca · ${Object.keys(library.byPlace).length}` },
      { id: 'agenda', label: `Agenda · ${agenda.length}` },
    ],
    [library, agenda],
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 6 }]}>
      <View style={{ paddingHorizontal: 16, gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <SearchBar />
          {tab === 'biblioteca' ? <FilterButton onPress={() => setFilterOpen(true)} /> : null}
        </View>
        <SegmentedTabs value={tab} onChange={setTab} options={options} />
      </View>

      <View style={{ flex: 1 }}>
        {tab === 'biblioteca' ? <LibraryView /> : <AgendaView />}
      </View>

      <FilterSheet open={filterOpen} onClose={() => setFilterOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
});
