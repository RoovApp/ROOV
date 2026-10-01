import { StyleSheet, Text, View } from 'react-native';
import { RoovColors } from '@/constants/Colors';
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

export function MapViewWrapper({ places: _places, initialRegion: _initialRegion }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🗺️</Text>
      <Text style={styles.title}>Mapa disponível no app</Text>
      <Text style={styles.subtitle}>Abra no iPhone com Expo Go para ver o mapa com pins.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: RoovColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
    margin: 16,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    color: RoovColors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    color: RoovColors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
