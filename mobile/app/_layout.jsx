/**
 * Raiz do app — monta os providers e a navegação em pilha.
 *
 * Mapa de rotas espelha o Cap. 8: quatro destinos na barra inferior e o resto
 * como navegação secundária empilhada em tela cheia.
 */

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RoovProvider, useRoov } from '../src/state/RoovProvider.jsx';
import { PlaceActionsProvider } from '../src/components/PlaceActions.jsx';
import { Toast } from '../src/components/ui.jsx';
import { colors } from '../src/theme.js';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = { initialRouteName: '(tabs)' };

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <SafeAreaProvider>
      <RoovProvider>
        <PlaceActionsProvider>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="place/[id]" />
            <Stack.Screen name="comunidade/[id]" />
            <Stack.Screen name="buscar" options={{ animation: 'fade_from_bottom' }} />
            <Stack.Screen name="criar" options={{ animation: 'slide_from_bottom' }} />
          </Stack>
          <GlobalToast />
        </PlaceActionsProvider>
      </RoovProvider>
    </SafeAreaProvider>
  );
}

/** O toast vive acima da pilha inteira para sobreviver a trocas de tela. */
function GlobalToast() {
  const { toast } = useRoov();
  return <Toast toast={toast} />;
}
