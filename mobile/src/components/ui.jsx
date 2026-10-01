/**
 * Primitivas visuais nativas do ROOV.
 *
 * Equivalente 1:1 do `components/ui/primitives.jsx` do front web, escrito em
 * componentes React Native. A API dos componentes é a mesma de propósito, para
 * que as duas bases evoluam juntas.
 */

import { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, glass, gradient, radius, text, withAlpha } from '../theme.js';

export function GlassCard({ style, children, ...rest }) {
  return (
    <View style={[glass, style]} {...rest}>
      {children}
    </View>
  );
}

export function Chip({ active = false, color, onPress, style, children }) {
  const activeStyle = active
    ? color
      ? { backgroundColor: withAlpha(color, 0.16), borderColor: color }
      : { backgroundColor: colors.surfaceHover, borderColor: colors.borderStrong }
    : null;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        activeStyle,
        pressed && { opacity: 0.7 },
        style,
      ]}
    >
      <Text
        style={[
          styles.chipText,
          active && { color: color ?? colors.foreground, fontWeight: '600' },
        ]}
        numberOfLines={1}
      >
        {children}
      </Text>
    </Pressable>
  );
}

/** Pílula somente-leitura — usada nas tags do DNA. */
export function TagPill({ children, style, opacity = 1 }) {
  return (
    <View style={[styles.tagPill, { opacity }, style]}>
      <Text style={styles.tagPillText} numberOfLines={1}>
        {children}
      </Text>
    </View>
  );
}

export function IconButton({ name, size = 18, onPress, style, color = colors.foreground, label }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.iconButton, pressed && { opacity: 0.6 }, style]}
    >
      <Ionicons name={name} size={size} color={color} />
    </Pressable>
  );
}

export function GradientButton({ onPress, disabled, children, style }) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        { borderRadius: radius.pill, overflow: 'hidden', opacity: disabled ? 0.4 : 1 },
        pressed && !disabled && { transform: [{ scale: 0.98 }] },
        style,
      ]}
    >
      <LinearGradient
        colors={gradient.colors}
        locations={gradient.locations}
        start={gradient.start}
        end={gradient.end}
        style={styles.primaryButton}
      >
        <Text style={styles.primaryButtonText}>{children}</Text>
      </LinearGradient>
    </Pressable>
  );
}

export function GhostButton({ onPress, children, style }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.ghostButton, pressed && { opacity: 0.6 }, style]}
    >
      <Text style={styles.ghostButtonText}>{children}</Text>
    </Pressable>
  );
}

export function SegmentedTabs({ value, onChange, options, style }) {
  return (
    <View style={[styles.segmented, style]}>
      {options.map((option) => {
        const active = option.id === value;
        return (
          <Pressable
            key={option.id}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(option.id)}
            style={[styles.segment, active && styles.segmentActive]}
          >
            <Text
              style={[styles.segmentText, active && styles.segmentTextActive]}
              numberOfLines={1}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/**
 * Bottom sheet — o padrão de navegação secundária do app (Cap. 8).
 * Usa Modal nativo para pegar o gesto de voltar do Android de graça.
 */
export function Sheet({ open, onClose, title, subtitle, children, footer }) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.sheetBackdrop} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: insets.bottom || 16 }]}>
        <View style={styles.sheetHandle} />
        <View style={styles.sheetHeader}>
          <View style={{ flex: 1 }}>
            {title ? <Text style={styles.sheetTitle}>{title}</Text> : null}
            {subtitle ? <Text style={styles.sheetSubtitle}>{subtitle}</Text> : null}
          </View>
          <IconButton name="close" label="Fechar" onPress={onClose} size={16} />
        </View>

        <ScrollView
          style={{ flexGrow: 0 }}
          contentContainerStyle={styles.sheetBody}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>

        {footer ? <View style={styles.sheetFooter}>{footer}</View> : null}
      </View>
    </Modal>
  );
}

export function EmptyState({ emoji = '🧭', title, message, action }) {
  return (
    <View style={styles.empty}>
      <Text style={{ fontSize: 34 }}>{emoji}</Text>
      <Text style={styles.emptyTitle}>{title}</Text>
      {message ? <Text style={styles.emptyMessage}>{message}</Text> : null}
      {action}
    </View>
  );
}

export function SectionTitle({ title, subtitle, style }) {
  return (
    <View style={[{ paddingHorizontal: 16, marginBottom: 10 }, style]}>
      <Text style={text.heading}>{title}</Text>
      {subtitle ? (
        <Text style={[text.tiny, { marginTop: 2 }]} numberOfLines={1}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

export function Loading({ label }) {
  return (
    <View style={styles.loading}>
      <ActivityIndicator color={colors.muted} />
      {label ? <Text style={[text.small, { marginTop: 10 }]}>{label}</Text> : null}
    </View>
  );
}

/** Toast flutuante — aparece acima da tab bar e some sozinho. */
export function Toast({ toast }) {
  const insets = useSafeAreaInsets();
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: toast ? 1 : 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [toast, opacity]);

  if (!toast) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.toast, { opacity, bottom: insets.bottom + 92 }]}
    >
      <Text style={styles.toastText}>{toast.message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  chipText: { fontSize: 12, color: colors.muted },

  tagPill: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagPillText: { fontSize: 11, color: colors.foreground },

  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  primaryButton: { paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  primaryButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },

  ghostButton: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  ghostButtonText: { color: colors.foreground, fontSize: 14, fontWeight: '600' },

  segmented: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    padding: 3,
  },
  segment: {
    flex: 1,
    borderRadius: radius.pill,
    paddingVertical: 7,
    alignItems: 'center',
  },
  segmentActive: { backgroundColor: '#FFFFFF' },
  segmentText: { fontSize: 12, color: colors.muted, fontWeight: '500' },
  segmentTextActive: { color: '#000000', fontWeight: '700' },

  sheetBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.72)' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '88%',
    backgroundColor: colors.backgroundElevated,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderStrong,
    marginTop: 8,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
  },
  sheetTitle: { fontSize: 17, fontWeight: '700', color: colors.foreground },
  sheetSubtitle: { fontSize: 12, color: colors.muted, marginTop: 2 },
  sheetBody: { paddingHorizontal: 20, paddingBottom: 12 },
  sheetFooter: {
    borderTopWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 20,
    paddingTop: 14,
    flexDirection: 'row',
    gap: 8,
  },

  empty: { alignItems: 'center', gap: 10, paddingHorizontal: 32, paddingVertical: 52 },
  emptyTitle: { fontSize: 15, fontWeight: '600', color: colors.foreground, textAlign: 'center' },
  emptyMessage: { fontSize: 13, color: colors.muted, textAlign: 'center', lineHeight: 19 },

  loading: { paddingVertical: 60, alignItems: 'center' },

  toast: {
    position: 'absolute',
    left: 24,
    right: 24,
    alignItems: 'center',
  },
  toastText: {
    backgroundColor: 'rgba(20,20,24,0.96)',
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.foreground,
    fontSize: 13,
    overflow: 'hidden',
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
});
