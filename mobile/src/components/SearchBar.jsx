/**
 * Barra de Pesquisa global — ROOV Product, Cap. 4.4 e 9.
 *
 * A pesquisa pertence ao sistema, não à tela. Este componente é só o gatilho e
 * sempre leva para a mesma rota `/buscar`, de onde quer que tenha sido tocado.
 */

import { Pressable, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useRoov } from '../state/RoovProvider.jsx';
import { colors, radius } from '../theme.js';

const PLACEHOLDERS = [
  'Buscar lugares, vibes, cidades…',
  'Onde tomar um café tranquilo?',
  'Qual bar combina com hoje?',
  'Onde assistir ao pôr do sol?',
];

export function SearchBar({ style }) {
  const router = useRouter();
  const { moment } = useRoov();

  // O placeholder acompanha o momento: de manhã pergunta café, à noite bar.
  const placeholder =
    moment.band.id === 'golden-hour'
      ? PLACEHOLDERS[3]
      : moment.hour >= 20
        ? PLACEHOLDERS[2]
        : moment.hour <= 11
          ? PLACEHOLDERS[1]
          : PLACEHOLDERS[0];

  return (
    <Pressable
      onPress={() => router.push('/buscar')}
      style={({ pressed }) => [styles.bar, pressed && { opacity: 0.7 }, style]}
    >
      <Ionicons name="search" size={16} color={colors.muted} />
      <Text style={styles.placeholder} numberOfLines={1}>
        {placeholder}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    flex: 1,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  placeholder: { fontSize: 12, color: colors.muted, flex: 1 },
});
