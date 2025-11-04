import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { PlayOption } from '../game/types';

interface PlayOptionsMenuProps {
  availableOptions: PlayOption[];
  onOptionSelect: (option: PlayOption) => void;
  theme: any;
  disabled?: boolean;
}

export default function PlayOptionsMenu({
  availableOptions,
  onOptionSelect,
  theme,
  disabled = false,
}: PlayOptionsMenuProps) {
  const styles = createStyles(theme);

  const getOptionInfo = (option: PlayOption) => {
    switch (option) {
      case PlayOption.MINE:
        return {
          icon: '⛏️',
          title: 'Mine',
          description: 'Draw cards & create transaction',
          color: theme.colors.success,
        };
      case PlayOption.BUY_MINING_RIG:
        return {
          icon: '🏭',
          title: 'Buy Mining Rig',
          description: 'Cost: 1₿ - Draw more cards',
          color: theme.colors.warning,
        };
      case PlayOption.MOVE_TO_COLD_STORAGE:
        return {
          icon: '🧊',
          title: 'Cold Storage',
          description: 'Secure your bitcoin',
          color: theme.colors.primary,
        };
      case PlayOption.MOVE_TO_NEXT_BLOCK:
        return {
          icon: '⏭️',
          title: 'Next Block',
          description: 'Advance to next block',
          color: theme.colors.accent,
        };
      default:
        return {
          icon: '❓',
          title: 'Unknown',
          description: '',
          color: theme.colors.text.secondary,
        };
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Turn - Choose Action</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.optionsContainer}
      >
        {availableOptions.map((option) => {
          const info = getOptionInfo(option);
          return (
            <TouchableOpacity
              key={option}
              style={[
                styles.optionCard,
                { borderColor: info.color },
                disabled && styles.optionDisabled,
              ]}
              onPress={() => !disabled && onOptionSelect(option)}
              activeOpacity={0.7}
              disabled={disabled}
            >
              <Text style={styles.optionIcon}>{info.icon}</Text>
              <Text style={styles.optionTitle}>{info.title}</Text>
              <Text style={styles.optionDescription}>{info.description}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.medium,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },

  title: {
    fontSize: theme.fonts.sizes.large,
    fontWeight: theme.fonts.weights.bold,
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.medium,
  },

  optionsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.medium,
  },

  optionCard: {
    width: 120,
    padding: theme.spacing.medium,
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 2,
    alignItems: 'center',
  },

  optionDisabled: {
    opacity: 0.5,
  },

  optionIcon: {
    fontSize: 32,
    marginBottom: theme.spacing.small,
  },

  optionTitle: {
    fontSize: theme.fonts.sizes.medium,
    fontWeight: theme.fonts.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },

  optionDescription: {
    fontSize: theme.fonts.sizes.xs,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
});
