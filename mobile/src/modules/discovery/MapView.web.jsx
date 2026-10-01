/**
 * Fallback do mapa para web — react-native-maps não roda no navegador.
 *
 * Mantém o mesmo contrato (`PlacesMap({ places })`) e cai para a lista de
 * Place Cards, que é o destino de todo fluxo de descoberta (Cap. 5.3).
 */

import { ScrollView, View } from 'react-native';
import { PlaceCard } from '../../components/PlaceCard.jsx';
import { EmptyState } from '../../components/ui.jsx';

export function PlacesMap({ places }) {
  if (!places.length) {
    return (
      <EmptyState
        emoji="🗺️"
        title="Nenhum lugar com esses filtros"
        message="Remova algum filtro para ver mais experiências por aqui."
      />
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 120 }}>
      <View style={{ gap: 12 }}>
        {places.map((place) => (
          <PlaceCard key={place.id} place={place} variant="compact" />
        ))}
      </View>
    </ScrollView>
  );
}
