import MapView, { Marker } from 'react-native-maps';
import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import { CATEGORIES } from '@/constants/Config';
import type { Place } from '@/types';

type Props = {
  places: Place[];
  initialRegion: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
};

export function MapViewWrapper({ places, initialRegion }: Props) {
  const router = useRouter();

  return (
    <MapView style={StyleSheet.absoluteFill} initialRegion={initialRegion}>
      {places.map((place) => {
        const color = CATEGORIES.find((item) => item.id === place.category)?.color;
        return (
          <Marker
            key={place.id}
            coordinate={{ latitude: place.lat, longitude: place.lng }}
            title={place.name}
            pinColor={color}
            onCalloutPress={() => router.push(`/place/${place.id}`)}
          />
        );
      })}
    </MapView>
  );
}
