import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
} from "react-native";
import { useTheme } from "../hooks/useTheme";
import { Entry } from "../data/types";
import {
  getMoodTheme,
  getMoodEmoji,
  ghibliColors,
  ghibliSpacing,
} from "../theme/ghibliTheme";

interface MagicalCalendarProps {
  entries: Entry[];
  onDatePress: (entry: Entry) => void;
  selectedMonth?: Date;
  onMonthChange?: (month: Date) => void;
}

const { width } = Dimensions.get("window");
const CELL_SIZE = (width - 40) / 7; // 7 days per week

export const MagicalCalendar: React.FC<MagicalCalendarProps> = ({
  entries,
  onDatePress,
  selectedMonth = new Date(),
  onMonthChange,
}) => {
  const { colors } = useTheme();
  const [currentMonth, setCurrentMonth] = useState(selectedMonth);
  const [glowAnimation] = useState(new Animated.Value(0));

  // Create a map of entries by date for quick lookup
  const entriesByDate = React.useMemo(() => {
    const map = new Map<string, Entry>();
    entries.forEach((entry) => {
      map.set(entry.dateISO, entry);
    });
    return map;
  }, [entries]);

  // Gentle pulsing animation for today
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

  const getDaysInMonth = useCallback((date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  }, []);

  const formatDateISO = (date: Date): string => {
    return date.toISOString().split("T")[0];
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return formatDateISO(date) === formatDateISO(today);
  };

  const navigateMonth = (direction: "prev" | "next") => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(
      currentMonth.getMonth() + (direction === "next" ? 1 : -1)
    );
    setCurrentMonth(newMonth);
    onMonthChange?.(newMonth);
  };

  const renderDayCell = (date: Date | null, index: number) => {
    if (!date) {
      return <View key={`empty-${index}`} style={styles.emptyCell} />;
    }

    const dateISO = formatDateISO(date);
    const entry = entriesByDate.get(dateISO);
    const moodTheme = entry ? getMoodTheme(entry.mood) : null;
    const emoji = entry ? getMoodEmoji(entry.mood) : null;
    const today = isToday(date);

    return (
      <TouchableOpacity
        key={dateISO}
        style={[
          styles.dayCell,
          {
            backgroundColor: entry ? moodTheme?.light : colors.surface,
            borderColor: today ? ghibliColors.castle.magicGreen : colors.border,
            borderWidth: today ? 2 : 1,
          },
        ]}
        onPress={() => entry && onDatePress(entry)}
        disabled={!entry}
        accessibilityLabel={`${date.getDate()} ${
          entry ? `with ${getMoodEmoji(entry.mood)} mood` : "no entry"
        }`}
      >
        {today && (
          <Animated.View
            style={[
              styles.todayGlow,
              {
                backgroundColor: ghibliColors.castle.magicGreen,
                opacity: glowAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.2, 0.5],
                }),
              },
            ]}
          />
        )}

        <Text
          style={[
            styles.dayNumber,
            {
              color: entry ? moodTheme?.text : colors.textSecondary,
              fontWeight: today ? "bold" : "normal",
            },
          ]}
        >
          {date.getDate()}
        </Text>

        {emoji && <Text style={styles.dayEmoji}>{emoji}</Text>}

        {entry && (
          <View
            style={[
              styles.moodIndicator,
              { backgroundColor: moodTheme?.primary },
            ]}
          />
        )}
      </TouchableOpacity>
    );
  };

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

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const days = getDaysInMonth(currentMonth);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with month navigation */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[
            styles.navButton,
            { backgroundColor: ghibliColors.castle.steamBlue },
          ]}
          onPress={() => navigateMonth("prev")}
          accessibilityLabel="Previous month"
        >
          <Text style={styles.navButtonText}>‹</Text>
        </TouchableOpacity>

        <View style={styles.monthTitle}>
          <Text style={[styles.monthText, { color: colors.text }]}>
            {monthNames[currentMonth.getMonth()]}
          </Text>
          <Text style={[styles.yearText, { color: colors.textSecondary }]}>
            {currentMonth.getFullYear()}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.navButton,
            { backgroundColor: ghibliColors.castle.steamBlue },
          ]}
          onPress={() => navigateMonth("next")}
          accessibilityLabel="Next month"
        >
          <Text style={styles.navButtonText}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Day names header */}
      <View style={styles.dayNamesRow}>
        {dayNames.map((dayName) => (
          <View key={dayName} style={styles.dayNameCell}>
            <Text style={[styles.dayNameText, { color: colors.textSecondary }]}>
              {dayName}
            </Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      <ScrollView
        style={styles.calendarScroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.calendarGrid}>
          {days.map((date, index) => renderDayCell(date, index))}
        </View>

        {/* Legend */}
        <View style={[styles.legend, { backgroundColor: colors.surface }]}>
          <Text style={[styles.legendTitle, { color: colors.text }]}>
            Mood Legend ✨
          </Text>
          <View style={styles.legendRow}>
            {[1, 2, 3, 4, 5].map((mood) => {
              const theme = getMoodTheme(mood);
              return (
                <View key={mood} style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendColor,
                      { backgroundColor: theme.light },
                    ]}
                  >
                    <Text style={styles.legendEmoji}>{getMoodEmoji(mood)}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: ghibliSpacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: ghibliSpacing.md,
    marginBottom: ghibliSpacing.md,
    borderBottomWidth: 1,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  navButtonText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  monthTitle: {
    alignItems: "center",
  },
  monthText: {
    fontSize: 20,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  yearText: {
    fontSize: 14,
    fontWeight: "500",
  },
  dayNamesRow: {
    flexDirection: "row",
    marginBottom: ghibliSpacing.sm,
  },
  dayNameCell: {
    width: CELL_SIZE,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  dayNameText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  calendarScroll: {
    flex: 1,
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  emptyCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
  },
  dayCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    margin: 1,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  todayGlow: {
    position: "absolute",
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 10,
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  dayEmoji: {
    fontSize: 12,
    position: "absolute",
    top: 4,
    right: 4,
  },
  moodIndicator: {
    position: "absolute",
    bottom: 4,
    left: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legend: {
    marginTop: ghibliSpacing.lg,
    padding: ghibliSpacing.md,
    borderRadius: 12,
    alignItems: "center",
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: ghibliSpacing.sm,
  },
  legendRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  legendItem: {
    alignItems: "center",
  },
  legendColor: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  legendEmoji: {
    fontSize: 16,
  },
});
