import React from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import Slider from "@react-native-community/slider";
import { useTheme } from "../hooks/useTheme";
import { getMoodAccessibilityLabel } from "../utils/accessibility";

interface MoodSliderProps {
  value: number;
  onValueChange: (value: number) => void;
}

const getMoodLabel = (mood: number): string => {
  switch (mood) {
    case 1:
      return "Stormy";
    case 2:
      return "Cloudy";
    case 3:
      return "Okay";
    case 4:
      return "Sunny";
    case 5:
      return "Radiant";
    default:
      return "Okay";
  }
};

const getMoodEmoji = (mood: number): string => {
  switch (mood) {
    case 1:
      return "⛈️";
    case 2:
      return "☁️";
    case 3:
      return "⛅";
    case 4:
      return "☀️";
    case 5:
      return "🌟";
    default:
      return "⛅";
  }
};

// Weather-inspired color palette
const getMoodColor = (mood: number): string => {
  switch (mood) {
    case 1:
      return "#6B7280"; // Storm gray
    case 2:
      return "#9CA3AF"; // Cloudy gray
    case 3:
      return "#60A5FA"; // Okay blue
    case 4:
      return "#FBBF24"; // Sunny yellow
    case 5:
      return "#F59E0B"; // Radiant gold
    default:
      return "#60A5FA";
  }
};

const getMoodGlow = (mood: number): string => {
  switch (mood) {
    case 1:
      return "#7B8290";
    case 2:
      return "#ACB3BF";
    case 3:
      return "#70B5FF";
    case 4:
      return "#FFCF34";
    case 5:
      return "#FFAE1B";
    default:
      return "#70B5FF";
  }
};

export const MoodSlider: React.FC<MoodSliderProps> = ({
  value,
  onValueChange,
}) => {
  const { colors, typography, spacing } = useTheme();
  const [glowAnimation] = React.useState(new Animated.Value(0));

  const moodLabel = getMoodLabel(value);
  const moodEmoji = getMoodEmoji(value);
  const moodColor = getMoodColor(value);
  const glowColor = getMoodGlow(value);

  // Gentle pulsing glow animation
  React.useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnimation, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const glowOpacity = glowAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.compactContainer}>
      {/* Compact Mood Display */}
      <View style={[styles.compactMoodDisplay, { marginBottom: spacing.md }]}>
        <View style={[styles.compactOrb, { backgroundColor: moodColor }]}>
          <Text style={styles.compactEmoji}>{moodEmoji}</Text>
        </View>
        <Text
          style={[styles.compactLabel, { color: moodColor }, typography.body]}
        >
          {moodLabel}
        </Text>
      </View>

      {/* Compact Slider */}
      <View style={styles.compactSliderContainer}>
        <Slider
          style={styles.compactSlider}
          minimumValue={1}
          maximumValue={5}
          step={1}
          value={value}
          onValueChange={onValueChange}
          minimumTrackTintColor={moodColor}
          maximumTrackTintColor={colors.border}
          thumbTintColor={moodColor}
          accessibilityLabel={`${moodLabel} mood, ${moodEmoji}, ${value} out of 5`}
          accessibilityHint="Slide to adjust your mood rating from 1 to 5"
          accessibilityRole="adjustable"
        />
      </View>

      {/* Compact Scale Labels */}
      <View style={styles.compactScaleContainer}>
        <Text
          style={[styles.compactScaleText, { color: colors.textSecondary }]}
        >
          ⛈️
        </Text>
        <Text
          style={[styles.compactScaleText, { color: colors.textSecondary }]}
        >
          🌟
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  compactContainer: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 12,
  },
  compactMoodDisplay: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  compactOrb: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  compactEmoji: {
    fontSize: 20,
    textAlign: "center",
  },
  compactLabel: {
    fontWeight: "600",
    fontSize: 16,
    textTransform: "capitalize",
  },
  compactSliderContainer: {
    width: "100%",
    paddingHorizontal: 16,
  },
  compactSlider: {
    width: "100%",
    height: 40,
  },
  compactScaleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "85%",
    paddingHorizontal: 8,
    marginTop: 4,
  },
  compactScaleText: {
    fontSize: 16,
  },
});
