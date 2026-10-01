import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';

import { VIBES } from '@/constants/Config';
import { RoovColors } from '@/constants/Colors';

export default function CreateScreen() {
  const router = useRouter();
  const [caption, setCaption] = useState('');
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);

  const toggleVibe = (vibe: string) => {
    setSelectedVibes((current) =>
      current.includes(vibe) ? current.filter((item) => item !== vibe) : [...current, vibe],
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Criar experiência',
          presentation: 'modal',
          headerStyle: { backgroundColor: RoovColors.background },
          headerTintColor: RoovColors.text,
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Mídia</Text>
        <Pressable style={styles.mediaPicker}>
          <Text style={styles.mediaPickerText}>+ Adicionar foto ou vídeo</Text>
        </Pressable>

        <Text style={styles.sectionTitle}>Descrição</Text>
        <TextInput
          style={styles.input}
          placeholder="Conte sua experiência..."
          placeholderTextColor={RoovColors.textSecondary}
          multiline
          value={caption}
          onChangeText={setCaption}
        />

        <Text style={styles.sectionTitle}>Localização *</Text>
        <Pressable style={styles.input}>
          <Text style={styles.placeholder}>Selecionar ou criar um lugar</Text>
        </Pressable>

        <Text style={styles.sectionTitle}>Vibes</Text>
        <View style={styles.vibes}>
          {VIBES.map((vibe) => {
            const active = selectedVibes.includes(vibe);
            return (
              <Pressable
                key={vibe}
                onPress={() => toggleVibe(vibe)}
                style={[styles.vibe, active && styles.vibeActive]}>
                <Text style={[styles.vibeText, active && styles.vibeTextActive]}>{vibe}</Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable style={styles.publish} onPress={() => router.back()}>
          <Text style={styles.publishText}>Publicar (mock)</Text>
        </Pressable>
        <Text style={styles.note}>
          Na V1, publicações passam por moderação automática antes de ficarem públicas.
        </Text>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: RoovColors.background,
  },
  content: {
    padding: 16,
    gap: 8,
    paddingBottom: 40,
  },
  sectionTitle: {
    color: RoovColors.text,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 4,
  },
  mediaPicker: {
    height: 180,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: RoovColors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: RoovColors.surface,
  },
  mediaPickerText: {
    color: RoovColors.textSecondary,
    fontWeight: '600',
  },
  input: {
    backgroundColor: RoovColors.surface,
    borderRadius: 12,
    padding: 14,
    color: RoovColors.text,
    minHeight: 48,
  },
  placeholder: {
    color: RoovColors.textSecondary,
  },
  vibes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  vibe: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: RoovColors.surface,
    borderWidth: 1,
    borderColor: RoovColors.border,
  },
  vibeActive: {
    backgroundColor: RoovColors.primary,
    borderColor: RoovColors.primary,
  },
  vibeText: {
    color: RoovColors.textSecondary,
    fontWeight: '600',
    fontSize: 12,
  },
  vibeTextActive: {
    color: RoovColors.text,
  },
  publish: {
    backgroundColor: RoovColors.primary,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  publishText: {
    color: RoovColors.text,
    fontWeight: '800',
    fontSize: 16,
  },
  note: {
    color: RoovColors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
});
