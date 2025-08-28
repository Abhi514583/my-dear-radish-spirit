import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ImageBackground,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MoodSlider } from "../components/MoodSlider";
import { useEntries } from "../hooks/useEntries";
import { useToast } from "../hooks/useToast";
import {
  getMoodGradient,
  getMoodTheme,
  getMoodEmoji,
} from "../theme/ghibliTheme";

const { height, width } = Dimensions.get("window");

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
  let greeting = "morning radish ✨";
  if (hour >= 12 && hour < 17) greeting = "afternoon radish 🌱";
  else if (hour >= 17) greeting = "evening radish 🌙";

  return {
    dayName: dayNames[now.getDay()],
    date: now.getDate().toString(),
    month: monthNames[now.getMonth()],
    greeting,
  };
};

export const TodayScreen: React.FC = () => {
  const { saveEntry, getTodayEntry, loading } = useEntries();
  const { showSuccess, showError } = useToast();

  const [mood, setMood] = useState(3);
  const [text, setText] = useState("");
  const [originalText, setOriginalText] = useState(""); // Always stores what user originally typed
  const [enhancedText, setEnhancedText] = useState(""); // Stores AI enhanced version
  const [isEnhanced, setIsEnhanced] = useState(false);
  const [hasExistingEntry, setHasExistingEntry] = useState(false);
  const [saving, setSaving] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [lastEntry, setLastEntry] = useState<{
    text: string;
    date: string;
  } | null>(null);

  // Get dynamic theme based on current mood
  const moodGradient = getMoodGradient(mood);
  const moodTheme = getMoodTheme(mood);
  const moodEmoji = getMoodEmoji(mood);

  useEffect(() => {
    loadTodayEntry();
  }, []);

  const loadTodayEntry = async () => {
    try {
      const todayEntry = await getTodayEntry();
      if (todayEntry) {
        setMood(todayEntry.mood);
        setText(todayEntry.text);
        setOriginalText(todayEntry.text);
        setHasExistingEntry(true);
        setLastEntry({
          text:
            todayEntry.text.slice(0, 100) +
            (todayEntry.text.length > 100 ? "..." : ""),
          date: new Date().toLocaleDateString(),
        });
      }
    } catch (error) {
      console.error("Failed to load today entry:", error);
    }
  };

  const openModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setText("");
    setOriginalText("");
    setEnhancedText("");
    setIsEnhanced(false);
  };

  const clearText = () => {
    setText("");
    setOriginalText("");
    setEnhancedText("");
    setIsEnhanced(false);
  };

  const enhanceText = async () => {
    if (text.trim().length === 0) {
      showError("Please write something first");
      return;
    }

    // Store original text if not already stored
    if (!originalText) {
      setOriginalText(text);
    }

    setEnhancing(true);
    try {
      const { AIService } = await import("../services/AIService");
      const enhanced = await AIService.enhanceJournalText(text);

      if (enhanced.ok && enhanced.enhancedText) {
        setEnhancedText(enhanced.enhancedText);
        setText(enhanced.enhancedText);
        setIsEnhanced(true);
        showSuccess("Text enhanced!");
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

  const switchToRaw = () => {
    setText(originalText);
    setIsEnhanced(false);
  };

  const switchToEnhanced = () => {
    if (enhancedText) {
      setText(enhancedText);
      setIsEnhanced(true);
    } else {
      enhanceText(); // Generate enhanced version if not exists
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
        showSuccess(hasExistingEntry ? "Entry updated!" : "Entry saved!");
        setHasExistingEntry(true);
        setLastEntry({
          text: text.slice(0, 100) + (text.length > 100 ? "..." : ""),
          date: new Date().toLocaleDateString(),
        });
        closeModal();
      } else {
        showError("Failed to save entry. Please try again.");
      }
    } catch (error) {
      showError("Failed to save entry. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const dateInfo = formatTodayDate();

  return (
    <ImageBackground
      source={require("../../assets/1.png")}
      style={styles.container}
      resizeMode="cover"
    >
      <LinearGradient
        colors={[
          `${moodTheme.primary}40`,
          `${moodTheme.primary}20`,
          `${moodTheme.primary}10`,
          "transparent",
        ]}
        style={styles.overlay}
        locations={[0, 0.3, 0.6, 1]}
      >
        {/* Minimal Header */}
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: "#FFFFFF" }]}>
            {dateInfo.greeting}
          </Text>
          <Text style={[styles.date, { color: "#FFFFFF" }]}>
            {dateInfo.dayName}, {dateInfo.month} {dateInfo.date}
          </Text>
        </View>

        {/* Mood Slider - Always visible */}
        <View style={styles.moodContainer}>
          <Text style={[styles.moodQuestion, { color: "#FFFFFF" }]}>
            How are you feeling? {moodEmoji}
          </Text>
          <MoodSlider value={mood} onValueChange={setMood} />
        </View>

        {/* Last Entry Summary Card */}
        {lastEntry && (
          <LinearGradient
            colors={["rgba(0, 0, 0, 0.4)", "rgba(0, 0, 0, 0.2)"]}
            style={styles.summaryCard}
          >
            <Text style={[styles.summaryDate, { color: "#FFFFFF" }]}>
              Today's Entry
            </Text>
            <Text
              style={[styles.summaryText, { color: "#FFFFFF" }]}
              numberOfLines={3}
            >
              {lastEntry.text}
            </Text>
            <TouchableOpacity onPress={openModal}>
              <Text style={[styles.editLink, { color: "#FFFFFF" }]}>
                Edit Entry
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        )}

        {/* Mascot Area - Main screen space */}
        <View style={styles.mascotArea}>
          <Text style={[styles.mascotPlaceholder, { color: "#FFFFFF" }]}>
            🌱 Mascot Space 🌱
          </Text>
          <Text style={[styles.mascotSubtext, { color: "#FFFFFF" }]}>
            Your radish friend will live here
          </Text>
        </View>

        {/* Floating + Button - Better visibility */}
        <TouchableOpacity
          style={[
            styles.floatingButton,
            {
              backgroundColor: "#FFFFFF",
              borderWidth: 3,
              borderColor: moodTheme.primary,
            },
          ]}
          onPress={openModal}
          activeOpacity={0.8}
        >
          <Text style={[styles.plusIcon, { color: moodTheme.primary }]}>+</Text>
        </TouchableOpacity>

        {/* Bottom Sheet Modal */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={closeModal}
        >
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.keyboardView}
            >
              <LinearGradient
                colors={[
                  mood <= 2 ? "#2D3748" : "#FFFFFF",
                  mood <= 2 ? "#4A5568" : "#F8F9FA",
                ]}
                style={styles.modalContent}
              >
                {/* Modal Header - Fixed positioning */}
                <View style={styles.modalHeader}>
                  <TouchableOpacity
                    onPress={closeModal}
                    style={styles.cancelButtonContainer}
                  >
                    <Text style={[styles.cancelButton, { color: "#007AFF" }]}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <Text
                    style={[
                      styles.modalTitle,
                      { color: mood <= 2 ? "#FFFFFF" : "#333" },
                    ]}
                  >
                    Journal Entry
                  </Text>
                  <TouchableOpacity
                    onPress={clearText}
                    style={styles.clearButtonContainer}
                  >
                    <Text
                      style={[styles.clearButtonText, { color: "#FF3B30" }]}
                    >
                      Clear
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Text Input Area */}
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      color: mood <= 2 ? "#FFFFFF" : "#333",
                      borderColor: moodTheme.primary + "40",
                    },
                  ]}
                  value={text}
                  onChangeText={(newText) => {
                    setText(newText);
                    // Store as original text if this is the first time typing
                    if (!originalText && newText.trim().length > 0) {
                      setOriginalText(newText);
                    }
                    // Reset enhanced state if user modifies text
                    if (isEnhanced && newText !== enhancedText) {
                      setIsEnhanced(false);
                    }
                  }}
                  placeholder="What's on your mind today?"
                  placeholderTextColor={mood <= 2 ? "#CBD5E0" : "#999"}
                  multiline
                  textAlignVertical="top"
                  autoFocus
                />

                {/* Version Toggle - Better logic */}
                {originalText && enhancedText && (
                  <View style={styles.versionToggle}>
                    <TouchableOpacity
                      style={[
                        styles.versionButton,
                        !isEnhanced && [
                          styles.activeVersion,
                          { backgroundColor: moodTheme.primary },
                        ],
                      ]}
                      onPress={switchToRaw}
                    >
                      <Text
                        style={[
                          styles.versionText,
                          !isEnhanced && styles.activeVersionText,
                        ]}
                      >
                        Raw
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.versionButton,
                        isEnhanced && [
                          styles.activeVersion,
                          { backgroundColor: moodTheme.primary },
                        ],
                      ]}
                      onPress={switchToEnhanced}
                    >
                      <Text
                        style={[
                          styles.versionText,
                          isEnhanced && styles.activeVersionText,
                        ]}
                      >
                        Enhanced
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Action Buttons - Always visible above keyboard */}
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[
                      styles.enhanceButton,
                      { borderColor: moodTheme.primary },
                    ]}
                    onPress={enhanceText}
                    disabled={enhancing || text.trim().length < 10}
                  >
                    {enhancing ? (
                      <ActivityIndicator
                        size="small"
                        color={moodTheme.primary}
                      />
                    ) : (
                      <Text
                        style={[
                          styles.enhanceButtonText,
                          { color: moodTheme.primary },
                        ]}
                      >
                        ✨ Enhance
                      </Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.saveButton,
                      {
                        backgroundColor:
                          text.trim().length === 0 ? "#999" : moodTheme.primary,
                      },
                    ]}
                    onPress={handleSave}
                    disabled={saving || text.trim().length === 0}
                  >
                    {saving ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Text style={styles.saveButtonText}>
                        {hasExistingEntry ? "Update" : "Save"}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </KeyboardAvoidingView>
          </View>
        </Modal>
      </LinearGradient>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
  },

  // Minimal Header
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: "center",
  },
  greeting: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
    textShadowColor: "rgba(0, 0, 0, 0.7)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  date: {
    fontSize: 14,
    fontWeight: "500",
    opacity: 0.95,
    textShadowColor: "rgba(0, 0, 0, 0.7)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  // Mood Container
  moodContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: "center",
  },
  moodQuestion: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.7)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  // Summary Card
  summaryCard: {
    marginHorizontal: 20,
    marginVertical: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  summaryDate: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
    opacity: 0.9,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  summaryText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  editLink: {
    fontSize: 14,
    fontWeight: "600",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // Mascot Area
  mascotArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  mascotPlaceholder: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.7)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  mascotSubtext: {
    fontSize: 14,
    opacity: 0.9,
    textAlign: "center",
    fontStyle: "italic",
    textShadowColor: "rgba(0, 0, 0, 0.7)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  // Floating Button
  floatingButton: {
    position: "absolute",
    bottom: 30,
    left: width / 2 - 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  plusIcon: {
    fontSize: 28,
    fontWeight: "300",
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  keyboardView: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    maxHeight: height * 0.8,
    minHeight: height * 0.6,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20, // More space from top
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  cancelButtonContainer: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    minWidth: 70,
  },
  cancelButton: {
    fontSize: 18, // Larger for easier tapping
    fontWeight: "600",
  },
  clearButtonContainer: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    minWidth: 70,
    alignItems: "flex-end",
  },
  clearButtonText: {
    fontSize: 18, // Larger for easier tapping
    fontWeight: "600",
  },
  modalTitle: {
    fontSize: 16, // Slightly smaller to fit better
    fontWeight: "700",
    textAlign: "center",
    flex: 1,
  },

  // Text Input
  textInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderWidth: 1,
    borderRadius: 12,
    marginHorizontal: 20,
    marginVertical: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },

  // Version Toggle
  versionToggle: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    borderRadius: 8,
    padding: 2,
  },
  versionButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 6,
  },
  activeVersion: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  versionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  activeVersionText: {
    color: "#FFFFFF",
  },

  // Action Buttons
  actionButtons: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  enhanceButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  enhanceButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    flex: 2,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
