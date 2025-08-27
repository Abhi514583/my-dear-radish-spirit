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

export const CalendarScreen: React.FC = () => {
  const { entries, loading, loadEntries } = useEntries();
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [viewMode, setViewMode] = useState<"monthly" | "weekly">("monthly");

  // Refresh entries when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadEntries();
    }, [loadEntries])
  );

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
          viewMode === "monthly" && styles.activeToggle,
        ]}
        onPress={() => setViewMode("monthly")}
      >
        <Text
          style={[
            styles.toggleText,
            viewMode === "monthly" && styles.activeToggleText,
          ]}
        >
          🗓️ Month
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.toggleButton,
          viewMode === "weekly" && styles.activeToggle,
        ]}
        onPress={() => setViewMode("weekly")}
      >
        <Text
          style={[
            styles.toggleText,
            viewMode === "weekly" && styles.activeToggleText,
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
        colors={["#E8F5E8", "#F1F8E9", "#E8F5E8"]}
        style={[styles.container, styles.centered]}
      >
        <Text style={styles.loadingText}>
          🌱 Growing your garden stories... 🌱
        </Text>
        <ActivityIndicator
          size="large"
          color="#2E7D32"
          style={{ marginTop: 16 }}
        />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={["#E8F5E8", "#F1F8E9", "#E8F5E8"]}
      style={styles.container}
    >
      {/* Compact Garden Header */}
      <View style={styles.compactHeader}>
        <View style={styles.headerRow}>
          <Text style={styles.compactTitle}>🌻 Garden Stories</Text>
          <Text style={styles.compactStats}>{entries.length} 🌱</Text>
        </View>
        {renderViewToggle()}
      </View>

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

  // Compact Header
  compactHeader: {
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderBottomWidth: 1,
    borderBottomColor: "#C8E6C9",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  compactTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  compactStats: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "600",
  },

  // View Toggle
  viewToggle: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderRadius: 20,
    padding: 2,
    alignSelf: "center",
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 18,
  },
  activeToggle: {
    backgroundColor: "#2E7D32",
  },
  toggleText: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "600",
  },
  activeToggleText: {
    color: "#FFFFFF",
  },

  // Full Screen Garden (Calendar)
  fullScreenGarden: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    marginHorizontal: 8,
    marginVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#C8E6C9",
  },

  // Empty Garden State
  emptyGarden: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyGardenTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E7D32",
    textAlign: "center",
    marginBottom: 8,
  },
  emptyGardenText: {
    fontSize: 12,
    color: "#4CAF50",
    textAlign: "center",
    marginBottom: 12,
  },
  emptyGardenDecor: {
    alignItems: "center",
  },
  gardenEmoji: {
    fontSize: 20,
  },

  // Loading
  loadingText: {
    textAlign: "center",
    fontSize: 16,
    fontStyle: "italic",
    color: "#2E7D32",
    marginBottom: 8,
  },
});
