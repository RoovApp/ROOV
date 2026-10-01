/**
 * Barra de navegação inferior — ROOV Product, Cap. 8.
 *
 * Quatro abas (Mapa, Comunidades, Salvos, Perfil) e um Floating Action Button
 * central para Criar Post. O FAB não é uma aba: é um botão sobre a barra, por
 * isso vive fora do <Tabs>.
 */

import { Pressable, StyleSheet, View } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, gradient } from '../../src/theme.js';

export default function TabLayout() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const barHeight = 58 + insets.bottom;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#FFFFFF',
          tabBarInactiveTintColor: colors.muted,
          tabBarStyle: {
            position: 'absolute',
            height: barHeight,
            paddingTop: 6,
            paddingBottom: insets.bottom,
            backgroundColor: 'rgba(10,10,12,0.82)',
            borderTopColor: colors.border,
            borderTopWidth: 1,
            elevation: 0,
          },
          tabBarBackground: () => (
            <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
          ),
          tabBarLabelStyle: { fontSize: 10 },
          tabBarItemStyle: { paddingTop: 2 },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Mapa',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'map' : 'map-outline'} size={22} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="comunidades"
          options={{
            title: 'Comunidades',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'people' : 'people-outline'} size={22} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="salvos"
          options={{
            title: 'Salvos',
            // Espaço reservado no meio para o FAB não cobrir ícone nenhum.
            tabBarItemStyle: { marginLeft: 68 },
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'bookmark' : 'bookmark-outline'} size={22} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="perfil"
          options={{
            title: 'Perfil',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'person' : 'person-outline'} size={22} color={color} />
            ),
          }}
        />
      </Tabs>

      <Pressable
        accessibilityLabel="Criar experiência"
        onPress={() => router.push('/criar')}
        style={({ pressed }) => [
          styles.fab,
          { bottom: insets.bottom + 22 },
          pressed && { transform: [{ scale: 0.94 }] },
        ]}
      >
        <LinearGradient
          colors={gradient.colors}
          locations={gradient.locations}
          start={gradient.start}
          end={gradient.end}
          style={styles.fabInner}
        >
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    alignSelf: 'center',
    width: 58,
    height: 58,
    borderRadius: 29,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  fabInner: {
    flex: 1,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
