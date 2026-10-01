import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../src/theme.js';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Rota não encontrada' }} />
      <View style={styles.container}>
        <Text style={styles.emoji}>🧭</Text>
        <Text style={styles.title}>Essa tela não existe</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Voltar para o mapa</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 24,
    backgroundColor: colors.background,
  },
  emoji: { fontSize: 34 },
  title: { fontSize: 16, fontWeight: '700', color: colors.foreground },
  link: { marginTop: 12 },
  linkText: { fontSize: 13, color: colors.muted, textDecorationLine: 'underline' },
});
