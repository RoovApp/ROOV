/**
 * Mapa — ROOV Product, Cap. 18. Descoberta geográfica.
 *
 * Aqui o mapa é nativo de verdade (Apple Maps no iOS, Google Maps no Android)
 * via react-native-maps, que já vem embutido no Expo Go.
 *
 * Fluxo: abrir mapa → filtrar → selecionar pin → preview → abrir → salvar →
 * agenda → post.
 */

import { useMemo, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { PlaceCard } from '../../components/PlaceCard.jsx';
import { EmptyState } from '../../components/ui.jsx';
import { CATEGORY_BY_ID } from '../../domain/taxonomy.js';
import { useRoov } from '../../state/RoovProvider.jsx';
import { CATEGORY_ICONS, colors, radius } from '../../theme.js';

const SAO_PAULO = {
  latitude: -23.5605,
  longitude: -46.6533,
  latitudeDelta: 0.16,
  longitudeDelta: 0.16,
};

/** Estilo escuro para o Google Maps (Android). No iOS usamos userInterfaceStyle. */
const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#14141a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8a8a99' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0a0a0e' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#22222c' }] },
  { featureType: 'road', elementType: 'labels', stylers: [{ visibility: 'simplified' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0d1a2b' }] },
  { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#16241a' }] },
];

export function PlacesMap({ places }) {
  const { moment } = useRoov();
  const [selectedId, setSelectedId] = useState(null);
  const mapRef = useRef(null);

  const selected = useMemo(
    () => places.find((p) => p.id === selectedId) ?? null,
    [places, selectedId],
  );

  const recenter = () => {
    mapRef.current?.animateToRegion(SAO_PAULO, 500);
    setSelectedId(null);
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_DEFAULT}
        style={StyleSheet.absoluteFill}
        initialRegion={SAO_PAULO}
        customMapStyle={Platform.OS === 'android' ? DARK_MAP_STYLE : undefined}
        userInterfaceStyle="dark"
        showsPointsOfInterest={false}
        showsUserLocation={false}
        toolbarEnabled={false}
        onPress={() => setSelectedId(null)}
      >
        {places.map((place) => {
          const meta = CATEGORY_BY_ID[place.category];
          const active = place.id === selectedId;

          return (
            <Marker
              key={place.id}
              coordinate={{ latitude: place.coords.lat, longitude: place.coords.lng }}
              onPress={() => setSelectedId(place.id)}
              tracksViewChanges={false}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View
                style={[
                  styles.pin,
                  { backgroundColor: meta.hex, borderColor: meta.hex },
                  active && styles.pinActive,
                ]}
              >
                <Ionicons
                  name={CATEGORY_ICONS[place.category]}
                  size={active ? 18 : 14}
                  color="#FFFFFF"
                />
              </View>
            </Marker>
          );
        })}
      </MapView>

      <Pressable accessibilityLabel="Centralizar" onPress={recenter} style={styles.control}>
        <Ionicons name="locate" size={18} color={colors.foreground} />
      </Pressable>

      {selected ? (
        <View style={styles.preview}>
          <PlaceCard place={selected} variant="preview" />
        </View>
      ) : places.length > 0 ? (
        <View pointerEvents="none" style={styles.hint}>
          <Text style={styles.hintText}>
            {places.length} lugares · {moment.headline}
          </Text>
        </View>
      ) : null}

      {places.length === 0 ? (
        <View style={styles.emptyOverlay}>
          <EmptyState
            emoji="🗺️"
            title="Nenhum lugar com esses filtros"
            message="Remova algum filtro para ver mais experiências por aqui."
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  pin: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  pinActive: { width: 42, height: 42, borderRadius: 21, borderColor: '#FFFFFF' },

  control: {
    position: 'absolute',
    right: 14,
    top: 14,
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10,10,12,0.85)',
    borderWidth: 1,
    borderColor: colors.border,
  },

  preview: { position: 'absolute', left: 12, right: 12, bottom: 12 },

  hint: { position: 'absolute', left: 0, right: 0, bottom: 16, alignItems: 'center' },
  hintText: {
    fontSize: 11,
    color: colors.foreground,
    backgroundColor: 'rgba(10,10,12,0.8)',
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    overflow: 'hidden',
  },

  emptyOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5,5,5,0.8)',
    justifyContent: 'center',
  },
});
