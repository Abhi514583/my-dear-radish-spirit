import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  ImageBackground,
} from "react-native";
import { MoodSlider } from "../components/MoodSlider";
import { JournalInput } from "../components/JournalInput";
import { useTheme } from "../hooks/useTheme";
import { useEntries } from "../hooks/useEntries";
import { useToast } from "../hooks/useToast";

// Beautiful date formatting
const formatTodayDate = (): {
  dayName: string;
  date: string;
  month: string;
  greeting: string;
} => {
  const now = new Date();
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const hour = now.getHours();
  let greeting = "raddishhh ✨";
  if (hour >= 12 && hour < 17) greeting = "raddish time 🌱";
  else if (hour >= 17) greeting = "evening radish 🌙";

  return {
    dayName: dayNames[now.getDay()],
    date: now.getDate().toString(),
    month: monthNames[now.getMonth()],
    greeting,
  };
};

// Get mood-based background image
const getMoodBackgroundImage = (mood: number) => {
  const images = {
    1: require("../../assets/1.png"),
    2: require("../../assets/2.png"),
    3: require("../../assets/3.png"),
    4: require("../../assets/4.png"),
    5: require("../../assets/5.png"),
  };
  return images[mood as keyof typeof images] || images[3];
};

export const TodayScreen: React.FC = () => {
  const { colors, typography, spacing, colorScheme } = useTheme();
  const { saveEntry, getTodayEntry, loading } = useEntries();
  const { showSuccess, showError } = useToast();

  const [mood, setMood] = useState(3);
  const [text, setText] = useState("");
  const [hasExistingEntry, setHasExistingEntry] = useState(false);
  const [saving, setSaving] = useState(false);
  const [enhancing, setEnhancing] = useState(false);

  const backgroundImage = getMoodBackgroundImage(mood);

  useEffect(() => {
    loadTodayEntry();
  }, []);

  const loadTodayEntry = async () => {
    try {
      const todayEntry = await getTodayEntry();
      if (todayEntry) {
        setMood(todayEntry.mood);
        setText(todayEntry.text);
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

  const dateInfo = formatTodayDate();

  return (
    <ImageBackground
      source={backgroundImage}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.content}>
        {/* Compact Date Header - Top Fixed */}
        <View style={styles.compactHeader}>
          <Text style={[styles.compactGreeting, { color: "#FFFFFF" }]}>
            {dateInfo.greeting}
          </Text>
          <View style={styles.compactDateRow}>
            <Text style={[styles.compactDay, { color: "#FFFFFF" }]}>
              {dateInfo.dayName}
            </Text>
            <Text style={[styles.compactDate, { color: "#FFFFFF" }]}>
              {dateInfo.date}
            </Text>
          </View>
        </View>

        {/* Main Content Area - Scrollable */}
        <ScrollView
          style={styles.scrollContent}
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Mood Slider - Compact & Visible */}
          <View style={styles.compactMoodSection}>
            <MoodSlider value={mood} onValueChange={setMood} />
          </View>

          {/* Journal Input - Optimized Size */}
          <View style={styles.compactJournalSection}>
            <JournalInput
              value={text}
              onChangeText={setText}
              placeholder="What's on your mind today?"
            />

            {/* AI Enhancement & Save in Row */}
            <View style={styles.actionRow}>
              {/* Clear Button */}
              {text.trim().length > 0 && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => setText("")}
                >
                  <Text style={styles.clearButtonText}>🗑️</Text>
                </TouchableOpacity>
              )}

              {/* AI Enhancement Button */}
              {text.trim().length > 10 && (
                <TouchableOpacity
                  style={styles.compactEnhanceButton}
                  onPress={enhanceText}
                  disabled={enhancing}
                >
                  {enhancing ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <Text
                      style={[
                        styles.compactButtonText,
                        { color: colors.primary },
                      ]}
                    >
                      ✨ AI
                    </Text>
                  )}
                </TouchableOpacity>
              )}

              {/* Save Button */}
              <TouchableOpacity
                style={[
                  styles.compactSaveButton,
                  {
                    backgroundColor: isDisabled
                      ? colors.border
                      : colors.primary,
                  },
                ]}
                onPress={handleSave}
                disabled={isDisabled}
              >
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.compactSaveText}>
                    {hasExistingEntry ? "Update" : "Save"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Mascot Space - Bottom Fixed */}
        <View style={styles.mascotArea}>
          {/* Future mascot will go here */}
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },

  // Compact Header - Fixed at top
  compactHeader: {
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    paddingTop: 50, // Safe area
    paddingBottom: 12,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  compactGreeting: {
    fontSize: 15,
    fontWeight: "600",
    opacity: 0.95,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  compactDateRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 10,
    backgroundColor: "rgba(139, 69, 19, 0.3)", // Earthy brown
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(160, 82, 45, 0.4)", // Saddle brown
  },
  compactDay: {
    fontSize: 16,
    fontWeight: "600",
    color: "#F5E6D3", // Warm cream
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  compactDate: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFE4B5", // Moccasin
    textShadowColor: "rgba(0, 0, 0, 0.4)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },

  // Scrollable content area
  scrollContent: {
    flex: 1,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 20,
  },

  // Compact Mood Section
  compactMoodSection: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  // Compact Journal Section
  compactJournalSection: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  // Action Row (Clear, AI + Save buttons)
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    gap: 8,
  },
  clearButton: {
    backgroundColor: "rgba(255, 99, 71, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 99, 71, 0.3)",
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  clearButtonText: {
    fontSize: 14,
  },
  compactEnhanceButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(0, 122, 255, 0.3)",
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  compactButtonText: {
    fontSize: 12,
    fontWeight: "500",
  },
  compactSaveButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 36,
  },
  compactSaveText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },

  // Mascot Area - Fixed at bottom
  mascotArea: {
    height: 180,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});
