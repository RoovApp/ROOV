/**
 * Rede de segurança do mapa.
 *
 * O mapa é a primeira tela do app: se `react-native-maps` não estiver
 * disponível no runtime (versão do Expo Go, permissão negada, provider ausente),
 * o app inteiro ficaria inutilizável. Este boundary troca o mapa pela lista de
 * Place Cards — o mesmo destino de qualquer fluxo de descoberta (Cap. 5.3) —
 * em vez de derrubar a navegação.
 */

import { Component } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { PlaceCard } from '../../components/PlaceCard.jsx';
import { colors, radius } from '../../theme.js';

export class MapBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.warn('[ROOV] mapa indisponível, caindo para a lista:', error?.message);
  }

  render() {
    if (!this.state.failed) return this.props.children;

    const { places = [] } = this.props;

    return (
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>🗺️ Mapa indisponível neste dispositivo</Text>
          <Text style={styles.noticeText}>
            Os mesmos lugares aparecem aqui em lista. Feed e Explorar seguem funcionando normalmente.
          </Text>
        </View>
        {places.map((place) => (
          <PlaceCard key={place.id} place={place} variant="compact" />
        ))}
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 10, paddingBottom: 130 },
  notice: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 14,
    gap: 4,
  },
  noticeTitle: { fontSize: 13, fontWeight: '700', color: colors.foreground },
  noticeText: { fontSize: 11, color: colors.muted, lineHeight: 16 },
});
