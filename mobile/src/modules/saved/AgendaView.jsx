/**
 * Agenda — ROOV Product, Cap. 15, 43 e 64.
 *
 * Hoje / Amanhã / Esta semana / Este mês / Sem data, com os avisos do motor de
 * agenda no topo de cada bloco. Nada aqui bloqueia o usuário: são avisos.
 */

import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { EmptyState } from '../../components/ui.jsx';
import { analyzeDay, groupAgenda } from '../../engine/agenda.js';
import { CATEGORY_BY_ID } from '../../domain/taxonomy.js';
import { useRoov } from '../../state/RoovProvider.jsx';
import { colors, radius, withAlpha } from '../../theme.js';

const STATUS = {
  planejado: { label: 'Planejado', color: colors.muted },
  confirmado: { label: 'Confirmado', color: colors.vivido },
  concluido: { label: 'Concluído', color: colors.muted },
  cancelado: { label: 'Cancelado', color: colors.favorito },
};

/** Cada severidade tem borda e fundo próprios — crítico grita, info sussurra. */
const SEVERITY_STYLE = {
  critical: { borderColor: withAlpha('#FF0F7B', 0.45), backgroundColor: withAlpha('#FF0F7B', 0.1) },
  warning: { borderColor: withAlpha('#FFB400', 0.45), backgroundColor: withAlpha('#FFB400', 0.1) },
  suggestion: { borderColor: withAlpha('#8B5CFF', 0.45), backgroundColor: withAlpha('#8B5CFF', 0.1) },
  info: { borderColor: colors.border, backgroundColor: colors.surface },
};

export function AgendaView() {
  const { agenda, placeById, moment, actions } = useRoov();
  const groups = useMemo(() => groupAgenda(agenda), [agenda]);

  if (!agenda.length) {
    return (
      <EmptyState
        emoji="📅"
        title="Nenhuma experiência planejada"
        message="Toda experiência pode virar plano. Use o botão Agenda no card de qualquer lugar."
      />
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{ padding: 16, gap: 24, paddingBottom: 130 }}
      showsVerticalScrollIndicator={false}
    >
      {groups.map((group) => (
        <View key={group.id} style={{ gap: 10 }}>
          <Text style={styles.groupTitle}>{group.label}</Text>

          <DayInsights items={group.items} placeById={placeById} moment={moment} />

          {group.items.map((item) => (
            <AgendaCard
              key={item.id}
              item={item}
              place={placeById[item.placeId]}
              onRemove={() => actions.removeAgendaItem(item.id)}
              onToggleStatus={() =>
                actions.updateAgendaItem({
                  ...item,
                  status: item.status === 'confirmado' ? 'planejado' : 'confirmado',
                })
              }
            />
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

function DayInsights({ items, placeById, moment }) {
  const insights = useMemo(() => analyzeDay(items, placeById, moment), [items, placeById, moment]);
  if (!insights.length) return null;

  return (
    <View style={{ gap: 8 }}>
      {insights.slice(0, 3).map((insight) => (
        <View key={insight.id} style={[styles.insight, SEVERITY_STYLE[insight.severity]]}>
          <Text style={styles.insightTitle}>
            {insight.emoji} {insight.title}
          </Text>
          <Text style={styles.insightMessage}>{insight.message}</Text>
        </View>
      ))}
    </View>
  );
}

function AgendaCard({ item, place, onRemove, onToggleStatus }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  if (!place) return null;

  const meta = CATEGORY_BY_ID[place.category];
  const status = STATUS[item.status];

  return (
    <View style={styles.card}>
      <View style={styles.timeBox}>
        <Text style={styles.time}>{item.time}</Text>
        <Text style={styles.duration}>{item.duration}</Text>
      </View>

      <View style={{ flex: 1, gap: 4 }}>
        <Pressable onPress={() => router.push(`/place/${place.id}`)}>
          <Text style={styles.placeName} numberOfLines={1}>
            {place.name}
          </Text>
          <View style={styles.inline}>
            <Ionicons name="location-outline" size={11} color={colors.muted} />
            <Text style={styles.meta} numberOfLines={1}>
              {place.neighborhood} ·{' '}
            </Text>
            <Text style={[styles.meta, { color: meta.hex }]}>{meta.short}</Text>
          </View>
        </Pressable>

        {item.notes ? <Text style={styles.notes}>{item.notes}</Text> : null}

        <View style={[styles.inline, { gap: 10, marginTop: 4 }]}>
          <Pressable onPress={onToggleStatus} style={styles.statusPill}>
            <Ionicons name="time-outline" size={11} color={status.color} />
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </Pressable>

          {confirming ? (
            <View style={[styles.inline, { gap: 8 }]}>
              <Pressable onPress={onRemove} style={styles.removeConfirm}>
                <Text style={styles.removeConfirmText}>remover</Text>
              </Pressable>
              <Pressable onPress={() => setConfirming(false)}>
                <Text style={styles.meta}>cancelar</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable accessibilityLabel="Remover da agenda" onPress={() => setConfirming(true)}>
              <Ionicons name="trash-outline" size={14} color={colors.muted} />
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  groupTitle: { fontSize: 13, fontWeight: '700', color: colors.muted },

  insight: { borderWidth: 1, borderRadius: radius.lg, padding: 12, gap: 4 },
  insightTitle: { fontSize: 12, fontWeight: '700', color: colors.foreground },
  insightMessage: { fontSize: 11, color: colors.muted, lineHeight: 16 },

  card: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 12,
  },
  timeBox: {
    width: 58,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  time: { fontSize: 14, fontWeight: '700', color: colors.foreground },
  duration: { fontSize: 10, color: colors.muted },

  placeName: { fontSize: 14, fontWeight: '600', color: colors.foreground },
  meta: { fontSize: 11, color: colors.muted },
  notes: { fontSize: 11, color: colors.muted, lineHeight: 16 },

  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: { fontSize: 10 },

  removeConfirm: {
    backgroundColor: withAlpha('#FF0F7B', 0.18),
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  removeConfirmText: { fontSize: 10, color: '#FF0F7B', fontWeight: '600' },

  inline: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
