import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { RoovColors } from '@/constants/Colors';

type Props = {
  onFilterPress?: () => void;
};

export function SearchBar({ onFilterPress }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.inputWrapper}>
        <Text style={styles.icon}>🔍</Text>
        <TextInput
          style={styles.input}
          placeholder="Search cities, places or experiences"
          placeholderTextColor={RoovColors.textSecondary}
        />
      </View>
      <Pressable style={styles.filterBtn} onPress={onFilterPress}>
        <Text style={styles.filterIcon}>⚙</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: RoovColors.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: RoovColors.border,
  },
  icon: {
    fontSize: 15,
  },
  input: {
    flex: 1,
    color: RoovColors.text,
    fontSize: 14,
  },
  filterBtn: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: RoovColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: RoovColors.border,
  },
  filterIcon: {
    fontSize: 18,
    color: RoovColors.text,
  },
});
