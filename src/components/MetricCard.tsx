import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../hooks/useTheme";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
}) => {
  const { colors, typography, spacing } = useTheme();

  const accessibilityLabel = `${title}: ${value}${
    subtitle ? ` ${subtitle}` : ""
  }`;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="text"
      accessible={true}
    >
      <Text
        style={[
          styles.title,
          { color: colors.textSecondary },
          typography.caption,
        ]}
      >
        {title}
      </Text>

      <Text
        style={[
          styles.value,
          { color: colors.text, marginTop: spacing.xs },
          typography.heading,
        ]}
      >
        {value}
      </Text>

      {subtitle && (
        <Text
          style={[
            styles.subtitle,
            { color: colors.textSecondary, marginTop: spacing.xs },
            typography.small,
          ]}
        >
          {subtitle}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    flex: 1,
    minHeight: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  value: {
    textAlign: "center",
    fontWeight: "bold",
  },
  subtitle: {
    textAlign: "center",
  },
});
