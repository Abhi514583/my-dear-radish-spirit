import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert, StyleSheet } from "react-native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { useTheme } from "../../hooks/useTheme";
import { EntryDAO } from "../../data/EntryDAO";
import { getDatabase } from "../../data/database";
import { useToast } from "../../hooks/useToast";
import { NotificationService } from "../../services/NotificationService";

export const SettingsScreen: React.FC = () => {
  const { colors, typography, spacing } = useTheme();
  const { showSuccess, showError } = useToast();
  const [hasNotifications, setHasNotifications] = useState(false);

  useEffect(() => {
    checkNotificationStatus();
  }, []);

  const checkNotificationStatus = async () => {
    const scheduled = await NotificationService.getScheduledNotifications();
    setHasNotifications(scheduled.length > 0);
  };

  const getAllEntries = async () => {
    try {
      return await EntryDAO.getAllDesc();
    } catch (error) {
      console.error("Failed to get entries:", error);
      return [];
    }
  };

  const toCSV = (rows: any[]): string => {
    if (!rows.length) return "dateISO,mood,text,createdAt\\n";

    const header = Object.keys(rows[0]).join(",");
    const body = rows
      .map((row) =>
        Object.values(row)
          .map((value) => String(value).replace(/"/g, '""'))
          .join(",")
      )
      .join("\\n");

    return header + "\\n" + body + "\\n";
  };

  const exportData = async () => {
    try {
      const entries = await getAllEntries();

      if (entries.length === 0) {
        showError("No entries to export");
        return;
      }

      const jsonPath = FileSystem.cacheDirectory + "radish_spirit_entries.json";
      const csvPath = FileSystem.cacheDirectory + "radish_spirit_entries.csv";

      await FileSystem.writeAsStringAsync(
        jsonPath,
        JSON.stringify(entries, null, 2)
      );
      await FileSystem.writeAsStringAsync(csvPath, toCSV(entries));

      // Share both files
      await Sharing.shareAsync(jsonPath, {
        mimeType: "application/json",
        dialogTitle: "Export Journal Entries (JSON)",
      });

      await Sharing.shareAsync(csvPath, {
        mimeType: "text/csv",
        dialogTitle: "Export Journal Entries (CSV)",
      });

      showSuccess("Data exported successfully!");
    } catch (error) {
      console.error("Export failed:", error);
      showError("Failed to export data");
    }
  };

  const scheduleReminder = async () => {
    try {
      const success = await NotificationService.scheduleDailyReminder();
      if (success) {
        setHasNotifications(true);
        showSuccess("Daily reminder scheduled for 8:00 PM!");
      } else {
        showError(
          "Failed to schedule reminder. Please check notification permissions."
        );
      }
    } catch (error) {
      console.error("Failed to schedule reminder:", error);
      showError("Failed to schedule reminder");
    }
  };

  const cancelReminder = async () => {
    try {
      await NotificationService.cancelDailyReminder();
      setHasNotifications(false);
      showSuccess("Daily reminder cancelled");
    } catch (error) {
      console.error("Failed to cancel reminder:", error);
      showError("Failed to cancel reminder");
    }
  };

  const deleteAllData = async () => {
    Alert.alert(
      "Delete All Data?",
      "This will permanently remove all your journal entries and reset your streaks. This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete All",
          style: "destructive",
          onPress: async () => {
            try {
              await EntryDAO.deleteAll();

              // Reset streaks
              const db = await getDatabase();
              await db.runAsync(
                "UPDATE streaks SET current = 0, longest = 0, updatedAt = ? WHERE id = 1",
                [Date.now()]
              );

              showSuccess("All data deleted successfully");
            } catch (error) {
              console.error("Delete failed:", error);
              showError("Failed to delete data");
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.content, { padding: spacing.lg }]}>
        <Text
          style={[styles.title, { color: colors.text }, typography.heading]}
        >
          Settings
        </Text>

        <Text
          style={[
            styles.subtitle,
            { color: colors.textSecondary, marginBottom: spacing.xl },
            typography.body,
          ]}
        >
          Manage your journal data and app preferences
        </Text>

        {/* Notifications Section */}
        <View
          style={[
            styles.section,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              marginBottom: spacing.lg,
            },
          ]}
        >
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.text },
              typography.subheading,
            ]}
          >
            Daily Reminders
          </Text>

          {hasNotifications ? (
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.textSecondary }]}
              onPress={cancelReminder}
              accessibilityLabel="Cancel daily reminder"
              accessibilityHint="Cancels the scheduled 8:00 PM daily reminder"
            >
              <Text style={[styles.buttonText, typography.body]}>
                Cancel Reminder
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={scheduleReminder}
              accessibilityLabel="Schedule daily reminder"
              accessibilityHint="Schedules a daily reminder at 8:00 PM"
            >
              <Text style={[styles.buttonText, typography.body]}>
                Schedule 8:00 PM Reminder
              </Text>
            </TouchableOpacity>
          )}

          <Text
            style={[
              styles.reminderNote,
              { color: colors.textSecondary, marginTop: spacing.sm },
              typography.caption,
            ]}
          >
            {hasNotifications
              ? "You'll receive a gentle reminder at 8:00 PM daily"
              : "Get a gentle nudge to journal each evening"}
          </Text>
        </View>

        {/* Data Management Section */}
        <View
          style={[
            styles.section,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.text },
              typography.subheading,
            ]}
          >
            Data Management
          </Text>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={exportData}
            accessibilityLabel="Export journal data"
            accessibilityHint="Exports your entries as JSON and CSV files"
          >
            <Text style={[styles.buttonText, typography.body]}>
              Export Data (JSON & CSV)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.dangerButton,
              { backgroundColor: colors.error },
            ]}
            onPress={deleteAllData}
            accessibilityLabel="Delete all data"
            accessibilityHint="Permanently removes all journal entries and resets streaks"
          >
            <Text style={[styles.buttonText, typography.body]}>
              Delete All Data
            </Text>
          </TouchableOpacity>
        </View>

        <Text
          style={[
            styles.note,
            { color: colors.textSecondary, marginTop: spacing.lg },
            typography.caption,
          ]}
        >
          💡 More customization options coming in future updates.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    lineHeight: 24,
  },
  section: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
  },
  sectionTitle: {
    fontWeight: "600",
    marginBottom: 16,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 12,
    alignItems: "center",
    minHeight: 44, // Accessibility touch target
  },
  dangerButton: {
    marginBottom: 0,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  note: {
    textAlign: "center",
    lineHeight: 20,
    fontStyle: "italic",
  },
  reminderNote: {
    textAlign: "center",
    lineHeight: 18,
    fontStyle: "italic",
  },
});
