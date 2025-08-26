import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Modal } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { MagicalCalendar } from "../components/MagicalCalendar";
import { EntryDetailScreen } from "./EntryDetailScreen";
import { useTheme } from "../hooks/useTheme";
import { useEntries } from "../hooks/useEntries";
import { Entry } from "../data/types";
import { ghibliColors, ghibliSpacing } from "../theme/ghibliTheme";

export const CalendarScreen: React.FC = () => {
  const { colors, typography } = useTheme();
  const { entries, loading, loadEntries } = useEntries();
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

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

  const handleEditEntry = (entry: Entry) => {
    // Navigate to edit mode - for now just close
    setSelectedEntry(null);
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        ✨ Your Magical Journal ✨
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        Start writing to see your moods bloom across the calendar like flowers
        in Howl's garden
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator
          size="large"
          color={ghibliColors.castle.magicGreen}
        />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Gathering your magical memories...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          ✨ Magical Calendar ✨
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {entries.length > 0
            ? `${entries.length} magical ${
                entries.length === 1 ? "memory" : "memories"
              } captured`
            : "Your journey awaits..."}
        </Text>
      </View>

      {/* Calendar */}
      {entries.length > 0 ? (
        <MagicalCalendar
          entries={entries}
          onDatePress={handleDatePress}
          selectedMonth={currentMonth}
          onMonthChange={setCurrentMonth}
        />
      ) : (
        renderEmptyState()
      )}

      {/* Entry Detail Modal */}
      <Modal
        visible={selectedEntry !== null}
        animationType="none"
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
    </View>
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
  header: {
    alignItems: "center",
    padding: ghibliSpacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    fontStyle: "italic",
  },
  loadingText: {
    textAlign: "center",
    marginTop: ghibliSpacing.md,
    fontSize: 16,
    fontStyle: "italic",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: ghibliSpacing["2xl"],
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: ghibliSpacing.md,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    fontStyle: "italic",
  },
});
