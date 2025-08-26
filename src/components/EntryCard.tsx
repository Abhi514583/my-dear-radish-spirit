import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Entry } from "../data/types";
import { useTheme } from "../hooks/useTheme";
import { formatDateForDisplay } from "../utils/dateUtils";

interface EntryCardProps {
  entry: Entry;
  onPress?: () => void;
}

const getMoodColor = (mood: number, colors: any): string => {
  if (mood <= 3) return colors.error;
  if (mood <= 5) return colors.warning;
  if (mood <= 7) return colors.primary;
  return colors.success;
};

const truncateText = (text: string, maxLength: number = 100): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

export const EntryCard: React.FC<EntryCardProps> = ({ entry, onPress }) => {
  const { colors, typography, spacing } = useTheme();

  const moodColor = getMoodColor(entry.mood, colors);
  const formattedDate = formatDateForDisplay(entry.dateISO);
  const truncatedText = truncateText(entry.text);

  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <CardComponent
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          marginBottom: spacing.md,
        },
      ]}
      onPress={onPress}
      accessibilityLabel={`Journal entry from ${formattedDate}, mood ${entry.mood} out of 10`}
      accessibilityHint={onPress ? "Tap to view full entry" : undefined}
      accessibilityRole={onPress ? "button" : "text"}
      accessible={true}
    >
      <View style={[styles.header, { marginBottom: spacing.sm }]}>
        <Text
          style={[styles.date, { color: colors.text }, typography.subheading]}
        >
          {formattedDate}
        </Text>
        <View
          style={[styles.moodBadge, { backgroundColor: moodColor }]}
          accessibilityLabel={`Mood rating ${entry.mood} out of 10`}
          accessibilityRole="text"
        >
          <Text style={[styles.moodText, typography.caption]}>
            {entry.mood}
          </Text>
        </View>
      </View>

      <Text
        style={[styles.text, { color: colors.textSecondary }, typography.body]}
        numberOfLines={3}
      >
        {truncatedText}
      </Text>
    </CardComponent>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    minHeight: 44, // Accessibility touch target
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  date: {
    flex: 1,
    fontWeight: "600",
  },
  moodBadge: {
    width: 44, // Increased for accessibility
    height: 44, // Increased for accessibility
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  moodText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  text: {
    lineHeight: 22,
  },
});
