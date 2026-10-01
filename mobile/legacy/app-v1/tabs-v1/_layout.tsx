import { SymbolView } from 'expo-symbols';
import { Tabs, useRouter } from 'expo-router';
import { Platform, Pressable, type ColorValue } from 'react-native';

import Colors, { RoovColors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].tint,
        tabBarInactiveTintColor: Colors[colorScheme].tabIconDefault,
        tabBarStyle: {
          backgroundColor: RoovColors.surface,
          borderTopColor: RoovColors.border,
        },
        headerStyle: { backgroundColor: RoovColors.background },
        headerTintColor: RoovColors.text,
        headerTitleStyle: { fontWeight: '700' },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Map',
          tabBarIcon: ({ color }) => <TabIcon name="map" color={color} />,
        }}
      />
      <Tabs.Screen
        name="communities"
        options={{
          title: 'Communities',
          tabBarIcon: ({ color }) => <TabIcon name="people" color={color} />,
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: '',
          tabBarIcon: () => (
            <Pressable
              onPress={() => router.push('/create')}
              style={{
                width: 52,
                height: 52,
                borderRadius: 26,
                backgroundColor: RoovColors.primary,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: Platform.OS === 'ios' ? 12 : 8,
              }}>
              <SymbolView
                name={{ ios: 'plus', android: 'add', web: 'add' }}
                tintColor="#fff"
                size={28}
              />
            </Pressable>
          ),
        }}
        listeners={{
          tabPress: (event) => {
            event.preventDefault();
            router.push('/create');
          },
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: 'Saved',
          tabBarIcon: ({ color }) => <TabIcon name="bookmark" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <TabIcon name="person" color={color} />,
        }}
      />
    </Tabs>
  );
}

function TabIcon({ name, color }: { name: keyof typeof TAB_ICONS; color: ColorValue }) {
  return <SymbolView name={TAB_ICONS[name]} tintColor={color} size={24} />;
}

const TAB_ICONS = {
  map: { ios: 'map.fill', android: 'map', web: 'map' },
  people: { ios: 'person.3.fill', android: 'groups', web: 'groups' },
  bookmark: { ios: 'bookmark.fill', android: 'bookmark', web: 'bookmark' },
  person: { ios: 'person.fill', android: 'person', web: 'person' },
} as const;
