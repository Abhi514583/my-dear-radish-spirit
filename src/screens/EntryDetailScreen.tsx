import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Share,
} from "react-native";
import { useTheme } from "../hooks/useTheme";
import { Entry } from "../data/types";
import {
  getMoodTheme,
  getMoodEmoji,
  getMoodLabel,
  ghibliColors,
  ghibliSpacing,
} from "../theme/ghibliTheme";
import { MoodSlider } from "../components/MoodSlider";

interface EntryDetailScreenProps {
  entry: Entry;
  onClose: () => void;
  onEdit?: (entry: Entry) => void;
}

const { width, height } = Dimensions.get("window");

export const EntryDetailScreen: React.FC<EntryDetailScreenProps> = ({
  entry,
  onClose,
  onEdit,
}) => {
  const { colors } = useTheme();
  const [viewMode, setViewMode] = useState<"raw" | "enhanced">("raw");
  const [slideAnimation] = useState(new Animated.Value(height));
  const [glowAnimation] = useState(new Animated.Value(0));

  const moodTheme = getMoodTheme(entry.mood);
  const moodEmoji = getMoodEmoji(entry.mood);
  const moodLabel = getMoodLabel(entry.mood);

  useEffect(() => {
    // Slide up animation
    Animated.spring(slideAnimation, {
      toValue: 0,
      damping: 15,
      stiffness: 150,
      useNativeDriver: true,
    }).start();

    // Gentle glow animation
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnimation, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnimation, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: false,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const handleClose = () => {
    Animated.timing(slideAnimation, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  const formatDate = (dateISO: string): string => {
    const date = new Date(dateISO);
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  };

  const enhanceText = (text: string): string => {
    // Simple text enhancement - in a real app, this could use AI
    const sentences = text.split(".").filter((s) => s.trim());
    const enhanced = sentences.map((sentence) => {
      const trimmed = sentence.trim();
      if (!trimmed) return "";

      // Add some magical flourishes based on mood
      const flourishes = {
        1: [
          "Despite the storms within",
          "Through the gray clouds of today",
          "In the midst of turbulence",
        ],
        2: [
          "As the mist clears slowly",
          "Through gentle overcast skies",
          "With quiet contemplation",
        ],
        3: [
          "In the balance of today",
          "With steady, peaceful steps",
          "Through the gentle rhythm of life",
        ],
        4: [
          "Bathed in golden sunlight",
          "With warmth filling the heart",
          "As brightness touches everything",
        ],
        5: [
          "Radiating pure joy",
          "With stars dancing in my soul",
          "In this moment of pure magic",
        ],
      };

      const moodFlourishes =
        flourishes[entry.mood as keyof typeof flourishes] || flourishes[3];
      const randomFlourish =
        moodFlourishes[Math.floor(Math.random() * moodFlourishes.length)];

      return `${randomFlourish}, ${trimmed.toLowerCase()}`;
    });

    return enhanced.join(". ") + ".";
  };

  const shareEntry = async () => {
    try {
      const shareText = `${formatDate(
        entry.dateISO
      )}\n\nMood: ${moodEmoji} ${moodLabel}\n\n${
        entry.text
      }\n\n✨ From My Dear Radish Spirit`;
      await Share.share({
        message: shareText,
        title: "Journal Entry",
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  return (
    <View style={styles.overlay}>
      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
            transform: [{ translateY: slideAnimation }],
          },
        ]}
      >
        {/* Magical header with mood theme */}
        <View style={[styles.header, { backgroundColor: moodTheme.primary }]}>
          <Animated.View
            style={[
              styles.headerGlow,
              {
                backgroundColor: moodTheme.glow,
                opacity: glowAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 0.7],
                }),
              },
            ]}
          />

          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            accessibilityLabel="Close entry detail"
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <View style={styles.moodOrb}>
              <Text style={styles.moodOrbEmoji}>{moodEmoji}</Text>
            </View>
            <Text style={[styles.dateText, { color: moodTheme.text }]}>
              {formatDate(entry.dateISO)}
            </Text>
            <Text style={[styles.moodText, { color: moodTheme.text }]}>
              {moodLabel} Mood
            </Text>
          </View>

          <TouchableOpacity
            style={styles.shareButton}
            onPress={shareEntry}
            accessibilityLabel="Share entry"
          >
            <Text style={styles.shareButtonText}>↗</Text>
          </TouchableOpacity>
        </View>

        {/* View mode toggle */}
        <View
          style={[styles.toggleContainer, { backgroundColor: colors.surface }]}
        >
          <TouchableOpacity
            style={[
              styles.toggleButton,
              viewMode === "raw" && { backgroundColor: moodTheme.primary },
            ]}
            onPress={() => setViewMode("raw")}
          >
            <Text
              style={[
                styles.toggleText,
                {
                  color:
                    viewMode === "raw" ? moodTheme.text : colors.textSecondary,
                },
              ]}
            >
              Raw Thoughts
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleButton,
              viewMode === "enhanced" && { backgroundColor: moodTheme.primary },
            ]}
            onPress={() => setViewMode("enhanced")}
          >
            <Text
              style={[
                styles.toggleText,
                {
                  color:
                    viewMode === "enhanced"
                      ? moodTheme.text
                      : colors.textSecondary,
                },
              ]}
            >
              Enhanced ✨
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content area */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Mood slider display */}
          <View
            style={[styles.moodSection, { backgroundColor: colors.surface }]}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              How You Felt
            </Text>
            <View style={styles.moodSliderContainer}>
              <MoodSlider
                value={entry.mood}
                onValueChange={() => {}} // Read-only
              />
            </View>
          </View>

          {/* Journal text */}
          <View
            style={[styles.textSection, { backgroundColor: colors.surface }]}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {viewMode === "raw" ? "Your Words" : "Enhanced Reflection"}
            </Text>

            <View
              style={[
                styles.textContainer,
                {
                  backgroundColor: colors.card,
                  borderLeftColor: moodTheme.primary,
                },
              ]}
            >
              <Text style={[styles.journalText, { color: colors.text }]}>
                {viewMode === "raw" ? entry.text : enhanceText(entry.text)}
              </Text>
            </View>
          </View>

          {/* Magical elements */}
          <View style={styles.magicalElements}>
            <View
              style={[
                styles.sparkle,
                { backgroundColor: ghibliColors.castle.starlight },
              ]}
            />
            <View
              style={[
                styles.sparkle,
                { backgroundColor: ghibliColors.castle.moonbeam },
              ]}
            />
            <View
              style={[
                styles.sparkle,
                { backgroundColor: ghibliColors.castle.enchanted },
              ]}
            />
          </View>
        </ScrollView>

        {/* Action buttons */}
        <View style={[styles.actions, { backgroundColor: colors.surface }]}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: moodTheme.primary },
            ]}
            onPress={() => onEdit?.(entry)}
            accessibilityLabel="Edit this entry"
          >
            <Text style={[styles.actionButtonText, { color: moodTheme.text }]}>
              Edit Entry ✏️
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 1000,
  },
  container: {
    flex: 1,
    marginTop: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  header: {
    position: "relative",
    paddingTop: ghibliSpacing.lg,
    paddingBottom: ghibliSpacing.xl,
    paddingHorizontal: ghibliSpacing.lg,
    alignItems: "center",
  },
  headerGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  closeButton: {
    position: "absolute",
    top: ghibliSpacing.lg,
    left: ghibliSpacing.lg,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  shareButton: {
    position: "absolute",
    top: ghibliSpacing.lg,
    right: ghibliSpacing.lg,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  shareButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  headerContent: {
    alignItems: "center",
  },
  moodOrb: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: ghibliSpacing.md,
  },
  moodOrbEmoji: {
    fontSize: 40,
  },
  dateText: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
    textAlign: "center",
  },
  moodText: {
    fontSize: 14,
    fontWeight: "500",
    opacity: 0.9,
  },
  toggleContainer: {
    flexDirection: "row",
    margin: ghibliSpacing.lg,
    borderRadius: 12,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: ghibliSpacing.sm,
    paddingHorizontal: ghibliSpacing.md,
    borderRadius: 8,
    alignItems: "center",
  },
  toggleText: {
    fontSize: 14,
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: ghibliSpacing.lg,
    paddingBottom: ghibliSpacing["4xl"],
  },
  moodSection: {
    borderRadius: 16,
    padding: ghibliSpacing.lg,
    marginBottom: ghibliSpacing.lg,
  },
  textSection: {
    borderRadius: 16,
    padding: ghibliSpacing.lg,
    marginBottom: ghibliSpacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: ghibliSpacing.md,
    textAlign: "center",
  },
  moodSliderContainer: {
    opacity: 0.8,
    pointerEvents: "none",
  },
  textContainer: {
    borderRadius: 12,
    padding: ghibliSpacing.lg,
    borderLeftWidth: 4,
  },
  journalText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400",
  },
  magicalElements: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: ghibliSpacing.xl,
  },
  sparkle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    opacity: 0.6,
  },
  actions: {
    padding: ghibliSpacing.lg,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  actionButton: {
    borderRadius: 12,
    paddingVertical: ghibliSpacing.md,
    paddingHorizontal: ghibliSpacing.lg,
    alignItems: "center",
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
