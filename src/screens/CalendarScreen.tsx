import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "@react-navigation/native";
import { MagicalCalendar } from "../components/MagicalCalendar";
import { EntryDetailScreen } from "./EntryDetailScreen";
import { useEntries } from "../hooks/useEntries";
import { Entry } from "../data/types";
import { getMoodGradient, getMoodTheme } from "../theme/ghibliTheme";

export const CalendarScreen: React.FC = () => {
  const { entries, loading, loadEntries, getAverageMood } = useEntries();
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [viewMode, setViewMode] = useState<"monthly" | "weekly">("monthly");
  const [averageMood, setAverageMood] = useState(3);

  // Get dynamic theme based on average mood
  const moodGradient = getMoodGradient(Math.round(averageMood));
  const moodTheme = getMoodTheme(Math.round(averageMood));

  // Refresh entries when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadEntries();
      loadAverageMood();
    }, [loadEntries])
  );

  const loadAverageMood = async () => {
    try {
      const avgMood = await getAverageMood();
      setAverageMood(avgMood || 3);
    } catch (error) {
      console.error("Failed to load average mood:", error);
    }
  };

  const handleDatePress = (entry: Entry) => {
    setSelectedEntry(entry);
  };

  const handleCloseDetail = () => {
    setSelectedEntry(null);
  };

  const handleEditEntry = () => {
    // Navigate to edit mode - for now just close
    setSelectedEntry(null);
  };

  const renderViewToggle = () => (
    <View style={styles.viewToggle}>
      <TouchableOpacity
        style={[
          styles.toggleButton,
          viewMode === "monthly" && [
            styles.activeToggle,
            { backgroundColor: moodTheme.primary },
          ],
        ]}
        onPress={() => setViewMode("monthly")}
      >
        <Text
          style={[
            styles.toggleText,
            { color: viewMode === "monthly" ? "#FFFFFF" : moodTheme.text },
          ]}
        >
          🗓️ Month
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.toggleButton,
          viewMode === "weekly" && [
            styles.activeToggle,
            { backgroundColor: moodTheme.primary },
          ],
        ]}
        onPress={() => setViewMode("weekly")}
      >
        <Text
          style={[
            styles.toggleText,
            { color: viewMode === "weekly" ? "#FFFFFF" : moodTheme.text },
          ]}
        >
          📅 Week
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyGarden}>
      <Text style={styles.emptyGardenTitle}>🌱 Garden Awaits 🌱</Text>
      <Text style={styles.emptyGardenText}>
        Plant your first story to bloom
      </Text>
      <View style={styles.emptyGardenDecor}>
        <Text style={styles.gardenEmoji}>🌿🌸🌿</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <LinearGradient
        colors={moodGradient}
        style={[styles.container, styles.centered]}
      >
        <Text style={styles.loadingText}>
          🌱 Growing your garden stories... 🌱
        </Text>
        <ActivityIndicator
          size="large"
          color={moodTheme.primary}
          style={{ marginTop: 16 }}
        />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={moodGradient}
      style={styles.container}
      locations={[0, 0.5, 1]}
    >
      {/* Dynamic Garden Header */}
      <LinearGradient
        colors={[
          `${moodTheme.primary}CC`,
          `${moodTheme.primary}99`,
          `${moodTheme.primary}66`,
        ]}
        style={styles.dynamicHeader}
      >
        <View style={styles.headerRow}>
          <Text style={[styles.headerTitle, { color: moodTheme.text }]}>
            🌻 Garden Stories
          </Text>
          <Text style={[styles.headerStats, { color: moodTheme.text }]}>
            {entries.length} 🌱
          </Text>
        </View>
        {renderViewToggle()}
      </LinearGradient>

      {/* Garden Bed - Full Screen Calendar */}
      <View style={styles.fullScreenGarden}>
        {entries.length > 0 ? (
          <MagicalCalendar
            entries={entries}
            onDatePress={handleDatePress}
            selectedMonth={currentMonth}
            onMonthChange={setCurrentMonth}
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            viewMode={viewMode}
            weekStartsOnSunday={true}
          />
        ) : (
          renderEmptyState()
        )}
      </View>

      {/* Entry Detail Modal */}
      <Modal
        visible={selectedEntry !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseDetail}
      >
        {selectedEntry && (
          <EntryDetailScreen
            entry={selectedEntry}
            onClose={handleCloseDetail}
            onEdit={handleEditEntry}
          />
        )}
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },

  // Dynamic Header
  dynamicHeader: {
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  headerStats: {
    fontSize: 16,
    fontWeight: "700",
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // View Toggle
  viewToggle: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 25,
    padding: 4,
    alignSelf: "center",
  },
  toggleButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  activeToggle: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: "700",
  },

  // Full Screen Garden (Calendar)
  fullScreenGarden: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    marginHorizontal: 12,
    marginVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },

  // Empty Garden State
  emptyGarden: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyGardenTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 12,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  emptyGardenText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    marginBottom: 16,
    fontWeight: "500",
  },
  emptyGardenDecor: {
    alignItems: "center",
  },
  gardenEmoji: {
    fontSize: 30,
  },

  // Loading
  loadingText: {
    textAlign: "center",
    fontSize: 18,
    fontStyle: "italic",
    color: "#FFFFFF",
    marginBottom: 8,
    fontWeight: "600",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
