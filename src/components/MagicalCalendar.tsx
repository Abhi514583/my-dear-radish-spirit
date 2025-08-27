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
  viewMode?: "monthly" | "weekly";
  weekStartsOnSunday?: boolean;
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
}

const { width } = Dimensions.get("window");
const CELL_SIZE = (width - 40) / 7; // 7 days per week

export const MagicalCalendar: React.FC<MagicalCalendarProps> = ({
  entries,
  onDatePress,
  selectedMonth = new Date(),
  onMonthChange,
  viewMode = "monthly",
  weekStartsOnSunday = true,
  selectedDate,
  onDateSelect,
}) => {
  const { colors } = useTheme();
  const [currentMonth, setCurrentMonth] = useState(selectedMonth);
  const [currentWeek, setCurrentWeek] = useState(new Date());
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

  const getDaysInMonth = useCallback(
    (date: Date) => {
      const year = date.getFullYear();
      const month = date.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      const startingDayOfWeek = weekStartsOnSunday
        ? firstDay.getDay()
        : (firstDay.getDay() + 6) % 7;

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
    },
    [weekStartsOnSunday]
  );

  const getWeekDays = useCallback(
    (date: Date) => {
      const days: Date[] = [];
      const startOfWeek = new Date(date);

      // Find Sunday (start of week)
      const dayOfWeek = weekStartsOnSunday
        ? date.getDay()
        : (date.getDay() + 6) % 7;
      startOfWeek.setDate(date.getDate() - dayOfWeek);

      // Add 7 days starting from Sunday
      for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        days.push(day);
      }

      return days;
    },
    [weekStartsOnSunday]
  );

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

  const navigateWeek = (direction: "prev" | "next") => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + (direction === "next" ? 7 : -7));
    setCurrentWeek(newWeek);
  };

  const renderDayCell = (
    date: Date | null,
    index: number,
    isWeekView = false
  ) => {
    if (!date) {
      return <View key={`empty-${index}`} style={styles.emptyCell} />;
    }

    const dateISO = formatDateISO(date);
    const entry = entriesByDate.get(dateISO);
    const moodTheme = entry ? getMoodTheme(entry.mood) : null;
    const emoji = entry ? getMoodEmoji(entry.mood) : null;
    const today = isToday(date);
    const isSelected = selectedDate && formatDateISO(selectedDate) === dateISO;

    const cellStyle = isWeekView ? styles.weekDayCell : styles.dayCell;

    return (
      <TouchableOpacity
        key={dateISO}
        style={[
          cellStyle,
          {
            backgroundColor: entry ? moodTheme?.light : colors.surface,
            borderColor: today
              ? ghibliColors.castle.magicGreen
              : isSelected
              ? ghibliColors.castle.steamBlue
              : colors.border,
            borderWidth: today || isSelected ? 2 : 1,
          },
        ]}
        onPress={() => {
          if (entry) {
            onDatePress(entry);
          } else {
            onDateSelect?.(date);
          }
        }}
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
            isWeekView ? styles.weekDayNumber : styles.dayNumber,
            {
              color: entry ? moodTheme?.text : colors.textSecondary,
              fontWeight: today ? "bold" : "normal",
            },
          ]}
        >
          {date.getDate()}
        </Text>

        {emoji && (
          <Text style={isWeekView ? styles.weekDayEmoji : styles.dayEmoji}>
            {emoji}
          </Text>
        )}

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

  const dayNames = weekStartsOnSunday
    ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const days =
    viewMode === "weekly"
      ? getWeekDays(currentWeek)
      : getDaysInMonth(currentMonth);
  const currentDate = viewMode === "weekly" ? currentWeek : currentMonth;
  const navigate = viewMode === "weekly" ? navigateWeek : navigateMonth;

  const getHeaderTitle = () => {
    if (viewMode === "weekly") {
      const startOfWeek = getWeekDays(currentWeek)[0];
      const endOfWeek = getWeekDays(currentWeek)[6];
      const startMonth = monthNames[startOfWeek.getMonth()].slice(0, 3);
      const endMonth = monthNames[endOfWeek.getMonth()].slice(0, 3);

      if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
        return `${startMonth} ${startOfWeek.getDate()}-${endOfWeek.getDate()}`;
      } else {
        return `${startMonth} ${startOfWeek.getDate()} - ${endMonth} ${endOfWeek.getDate()}`;
      }
    } else {
      return monthNames[currentMonth.getMonth()];
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with navigation */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[
            styles.navButton,
            { backgroundColor: ghibliColors.castle.steamBlue },
          ]}
          onPress={() => navigate("prev")}
          accessibilityLabel={`Previous ${
            viewMode === "weekly" ? "week" : "month"
          }`}
        >
          <Text style={styles.navButtonText}>‹</Text>
        </TouchableOpacity>

        <View style={styles.monthTitle}>
          <Text style={[styles.monthText, { color: colors.text }]}>
            {getHeaderTitle()}
          </Text>
          <Text style={[styles.yearText, { color: colors.textSecondary }]}>
            {currentDate.getFullYear()}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.navButton,
            { backgroundColor: ghibliColors.castle.steamBlue },
          ]}
          onPress={() => navigate("next")}
          accessibilityLabel={`Next ${
            viewMode === "weekly" ? "week" : "month"
          }`}
        >
          <Text style={styles.navButtonText}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Day names header */}
      <View style={styles.dayNamesRow}>
        {dayNames.map((dayName) => (
          <View
            key={dayName}
            style={
              viewMode === "weekly"
                ? styles.weekDayNameCell
                : styles.dayNameCell
            }
          >
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
        <View
          style={viewMode === "weekly" ? styles.weekGrid : styles.calendarGrid}
        >
          {viewMode === "weekly"
            ? days.map((date, index) => renderDayCell(date, index, true))
            : days.map((date, index) => renderDayCell(date, index, false))}
        </View>

        {/* Legend - only show in monthly view */}
        {viewMode === "monthly" && (
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
                      <Text style={styles.legendEmoji}>
                        {getMoodEmoji(mood)}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}
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
    paddingBottom: ghibliSpacing.sm,
    marginBottom: ghibliSpacing.sm,
    borderBottomWidth: 1,
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  navButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  monthTitle: {
    alignItems: "center",
  },
  monthText: {
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  yearText: {
    fontSize: 12,
    fontWeight: "500",
  },
  dayNamesRow: {
    flexDirection: "row",
    marginBottom: ghibliSpacing.xs,
  },
  dayNameCell: {
    width: CELL_SIZE,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  weekDayNameCell: {
    flex: 1,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  dayNameText: {
    fontSize: 10,
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
  weekGrid: {
    flexDirection: "row",
    height: 80,
    marginBottom: ghibliSpacing.md,
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
    borderRadius: 6,
    margin: 1,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  weekDayCell: {
    flex: 1,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    margin: 2,
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
    borderRadius: 8,
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 1,
  },
  weekDayNumber: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 2,
  },
  dayEmoji: {
    fontSize: 10,
    position: "absolute",
    top: 2,
    right: 2,
  },
  weekDayEmoji: {
    fontSize: 14,
    position: "absolute",
    top: 4,
    right: 4,
  },
  moodIndicator: {
    position: "absolute",
    bottom: 2,
    left: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  legend: {
    marginTop: ghibliSpacing.sm,
    padding: ghibliSpacing.sm,
    borderRadius: 8,
    alignItems: "center",
  },
  legendTitle: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: ghibliSpacing.xs,
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
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  legendEmoji: {
    fontSize: 10,
  },
});
