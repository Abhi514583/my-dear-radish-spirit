import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { MoodSlider } from "../components/MoodSlider";
import { JournalInput } from "../components/JournalInput";
import { useTheme } from "../hooks/useTheme";
import { useEntries } from "../hooks/useEntries";
import { useToast } from "../hooks/useToast";

// Mascot component placeholder - add your Lottie file to assets/radish_idle.json to enable
const MascotSlot: React.FC = () => {
  return null; // Renders nothing until Lottie file is added
};

// Get weather-based background color
const getWeatherBackground = (mood: number, isDark: boolean): string => {
  const baseColors = {
    1: isDark ? "#2D3748" : "#E2E8F0", // Storm
    2: isDark ? "#374151" : "#F1F5F9", // Cloudy
    3: isDark ? "#1E3A8A" : "#DBEAFE", // Okay
    4: isDark ? "#92400E" : "#FEF3C7", // Sunny
    5: isDark ? "#B45309" : "#FDE68A", // Radiant
  };
  return baseColors[mood as keyof typeof baseColors] || baseColors[3];
};

export const TodayScreen: React.FC = () => {
  const { colors, typography, spacing, colorScheme } = useTheme();
  const { saveEntry, getTodayEntry, loading } = useEntries();
  const { showSuccess, showError } = useToast();

  const [mood, setMood] = useState(3);
  const [text, setText] = useState("");
  const [enhancedText, setEnhancedText] = useState("");
  const [isShowingEnhanced, setIsShowingEnhanced] = useState(false);
  const [hasExistingEntry, setHasExistingEntry] = useState(false);
  const [saving, setSaving] = useState(false);
  const [enhancing, setEnhancing] = useState(false);

  const weatherBackground = getWeatherBackground(mood, colorScheme === "dark");

  useEffect(() => {
    loadTodayEntry();
  }, []);

  const loadTodayEntry = async () => {
    try {
      const todayEntry = await getTodayEntry();
      if (todayEntry) {
        setMood(todayEntry.mood);
        setText(todayEntry.text);
        if (todayEntry.enhancedText) {
          setEnhancedText(todayEntry.enhancedText);
        }
        setHasExistingEntry(true);
      }
    } catch (error) {
      console.error("Failed to load today entry:", error);
    }
  };

  const enhanceText = async () => {
    if (text.trim().length === 0) {
      showError("Please write something first");
      return;
    }

    setEnhancing(true);
    try {
      // Import AIService dynamically to avoid circular imports
      const { AIService } = await import("../services/AIService");
      const enhanced = await AIService.enhanceJournalText(text);

      if (enhanced.ok && enhanced.enhancedText) {
        setText(enhanced.enhancedText);
        showSuccess("Text enhanced! Your original is preserved.");
      } else {
        showError(enhanced.error || "Failed to enhance text");
      }
    } catch (error) {
      console.error("Enhancement failed:", error);
      showError("Failed to enhance text");
    } finally {
      setEnhancing(false);
    }
  };

  const handleSave = async () => {
    if (text.trim().length === 0) {
      showError("Please write something in your journal entry");
      return;
    }

    setSaving(true);
    try {
      const success = await saveEntry(mood, text);
      if (success) {
        showSuccess(
          hasExistingEntry
            ? "Entry updated! Ready for next entry."
            : "Entry saved! Ready for next entry."
        );
        setHasExistingEntry(true);

        // Clear the text input and reset mood for a fresh start
        setText("");
        setMood(3); // Reset to neutral "Okay" mood
      } else {
        showError("Failed to save entry. Please try again.");
      }
    } catch (error) {
      showError("Failed to save entry. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const isDisabled = saving || loading || text.trim().length === 0;

  return (
    <View style={[styles.container, { backgroundColor: weatherBackground }]}>
      <ScrollView
        contentContainerStyle={[styles.content, { padding: spacing.md }]}
        showsVerticalScrollIndicator={false}
        accessibilityLabel="Today's journal entry form"
      >
        {/* Compact Header */}
        <View style={[styles.header, { marginBottom: spacing.lg }]}>
          <Text
            style={[styles.title, { color: colors.text }, typography.heading]}
          >
            Today's Entry
          </Text>
        </View>

        {/* Compact Mood Section */}
        <View style={[styles.compactMoodSection, { marginBottom: spacing.lg }]}>
          <MoodSlider value={mood} onValueChange={setMood} />
        </View>

        {/* Journal Input with AI Enhancement */}
        <View
          style={[
            styles.journalSection,
            {
              backgroundColor: colors.surface + "E6",
              borderRadius: 16,
              padding: spacing.md,
              marginBottom: spacing.lg,
            },
          ]}
        >
          <JournalInput
            value={text}
            onChangeText={setText}
            placeholder="What's on your mind today?"
          />

          {/* AI Enhancement Button */}
          {text.trim().length > 10 && (
            <TouchableOpacity
              style={[
                styles.enhanceButton,
                {
                  backgroundColor: colors.primary + "20",
                  borderColor: colors.primary,
                },
              ]}
              onPress={enhanceText}
              disabled={enhancing}
            >
              {enhancing ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Text
                  style={[styles.enhanceButtonText, { color: colors.primary }]}
                >
                  ✨ Enhance with AI
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.saveButton,
              {
                backgroundColor: isDisabled ? colors.border : colors.primary,
              },
            ]}
            onPress={handleSave}
            disabled={isDisabled}
            accessibilityLabel={
              hasExistingEntry ? "Update today's entry" : "Save today's entry"
            }
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={[styles.saveButtonText, typography.subheading]}>
                {hasExistingEntry ? "Update Entry" : "Save Entry"}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {hasExistingEntry && (
          <Text
            style={[
              styles.updateNote,
              { color: colors.textSecondary },
              typography.caption,
            ]}
          >
            You can update your entry multiple times throughout the day.
          </Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    minHeight: "100%",
  },
  header: {
    alignItems: "center",
  },
  title: {
    fontWeight: "bold",
    textAlign: "center",
  },
  compactMoodSection: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  journalSection: {
    width: "100%",
  },
  enhanceButton: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    alignSelf: "flex-end",
  },
  enhanceButtonText: {
    fontSize: 12,
    fontWeight: "600",
  },
  buttonContainer: {
    width: "100%",
  },
  saveButton: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  updateNote: {
    textAlign: "center",
    fontStyle: "italic",
    marginTop: 8,
  },
});
