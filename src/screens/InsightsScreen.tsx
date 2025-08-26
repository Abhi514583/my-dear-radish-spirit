import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { MetricCard } from "../components/MetricCard";
import { useTheme } from "../hooks/useTheme";
import { useEntries } from "../hooks/useEntries";
import { useStreak } from "../hooks/useStreak";
import { AIService } from "../services/AIService";

export const InsightsScreen: React.FC = () => {
  const { colors, typography, spacing } = useTheme();
  const {
    entries,
    getEntryCount,
    getAverageMood,
    loading: entriesLoading,
  } = useEntries();
  const { streak, loading: streakLoading } = useStreak();

  const [entryCount, setEntryCount] = useState(0);
  const [averageMood, setAverageMood] = useState(0);
  const [loading, setLoading] = useState(true);
  const [aiSummary, setAiSummary] = useState<{
    summary: string;
    focus: string;
  } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    loadInsights();
  }, [loadInsights]);

  // Refresh insights when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadInsights();
    }, [loadInsights])
  );

  const loadInsights = useCallback(async () => {
    try {
      setLoading(true);
      const [count, avgMood] = await Promise.all([
        getEntryCount(),
        getAverageMood(),
      ]);

      setEntryCount(count);
      setAverageMood(avgMood);
    } catch (error) {
      console.error("Failed to load insights:", error);
    } finally {
      setLoading(false);
    }
  }, [getEntryCount, getAverageMood]);

  const generateWeeklySummary = useCallback(async () => {
    if (entries.length < 7) return;

    try {
      setAiLoading(true);
      setAiError(null);

      const result = await AIService.aiWeeklySummary(entries);

      if (result.ok && result.summary && result.focus) {
        setAiSummary({
          summary: result.summary,
          focus: result.focus,
        });
      } else {
        setAiError(result.error || "Failed to generate summary");
      }
    } catch (error) {
      console.error("Failed to generate AI summary:", error);
      setAiError("Failed to generate summary");
    } finally {
      setAiLoading(false);
    }
  }, [entries]);

  const formattedAverageMood = useMemo(() => {
    if (averageMood === 0) return "0";
    return averageMood.toFixed(1);
  }, [averageMood]);

  const isLoading = loading || entriesLoading || streakLoading;

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text
          style={[
            styles.loadingText,
            { color: colors.textSecondary, marginTop: spacing.md },
            typography.body,
          ]}
        >
          Loading your insights...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { padding: spacing.lg }]}
      accessibilityLabel="Journal insights and statistics"
    >
      <View style={[styles.header, { marginBottom: spacing.xl }]}>
        <Text
          style={[styles.title, { color: colors.text }, typography.heading]}
        >
          Your Insights
        </Text>
        <Text
          style={[
            styles.subtitle,
            { color: colors.textSecondary },
            typography.body,
          ]}
        >
          Track your journaling progress and emotional patterns
        </Text>
      </View>

      <View style={[styles.metricsGrid, { gap: spacing.md }]}>
        <View style={[styles.row, { gap: spacing.md }]}>
          <MetricCard
            title="Total Entries"
            value={entryCount}
            subtitle={entryCount === 1 ? "entry" : "entries"}
          />
          <MetricCard
            title="Current Streak"
            value={streak.current}
            subtitle={streak.current === 1 ? "day" : "days"}
          />
        </View>

        <View style={[styles.row, { gap: spacing.md }]}>
          <MetricCard
            title="Longest Streak"
            value={streak.longest}
            subtitle={streak.longest === 1 ? "day" : "days"}
          />
          <MetricCard
            title="Average Mood"
            value={formattedAverageMood}
            subtitle="out of 5"
          />
        </View>
      </View>

      {/* AI Weekly Summary Card */}
      <View
        style={[
          styles.aiCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            marginTop: spacing.lg,
          },
        ]}
      >
        <Text
          style={[
            styles.aiCardTitle,
            { color: colors.text },
            typography.subheading,
          ]}
        >
          Wisdom of the Week 🌱
        </Text>

        {entryCount < 7 ? (
          <Text
            style={[
              styles.aiCardSubtitle,
              { color: colors.textSecondary },
              typography.body,
            ]}
          >
            Add 7 daily entries to unlock your weekly wisdom 🌱
          </Text>
        ) : aiSummary ? (
          <View>
            <Text
              style={[
                styles.aiSummary,
                { color: colors.text },
                typography.body,
              ]}
            >
              {aiSummary.summary}
            </Text>
            <View
              style={[
                styles.aiFocus,
                {
                  backgroundColor: colors.primary + "20",
                  marginTop: spacing.md,
                },
              ]}
            >
              <Text
                style={[
                  styles.aiFocusLabel,
                  { color: colors.primary },
                  typography.caption,
                ]}
              >
                This Week's Focus
              </Text>
              <Text
                style={[
                  styles.aiFocusText,
                  { color: colors.primary },
                  typography.body,
                ]}
              >
                {aiSummary.focus}
              </Text>
            </View>
          </View>
        ) : (
          <View>
            <TouchableOpacity
              style={[styles.aiButton, { backgroundColor: colors.primary }]}
              onPress={generateWeeklySummary}
              disabled={aiLoading}
              accessibilityLabel="Generate weekly AI summary"
            >
              {aiLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={[styles.aiButtonText, typography.body]}>
                  Generate Weekly Summary
                </Text>
              )}
            </TouchableOpacity>
            {aiError && (
              <Text
                style={[
                  styles.aiError,
                  { color: colors.error, marginTop: spacing.sm },
                  typography.caption,
                ]}
              >
                {aiError}
              </Text>
            )}
          </View>
        )}
      </View>

      {entryCount === 0 && (
        <View style={[styles.emptyState, { marginTop: spacing.xl }]}>
          <Text
            style={[
              styles.emptyTitle,
              { color: colors.text },
              typography.subheading,
            ]}
          >
            Start Your Journey
          </Text>
          <Text
            style={[
              styles.emptySubtitle,
              { color: colors.textSecondary, marginTop: spacing.sm },
              typography.body,
            ]}
          >
            Create your first journal entry to see meaningful insights about
            your mood patterns and journaling habits.
          </Text>
        </View>
      )}

      {entryCount > 0 && (
        <View style={[styles.encouragement, { marginTop: spacing.xl }]}>
          <Text
            style={[
              styles.encouragementText,
              { color: colors.textSecondary },
              typography.body,
            ]}
          >
            {streak.current > 0
              ? `Great job! You're on a ${streak.current}-day streak. Keep it up!`
              : "Start a new streak by journaling today!"}
          </Text>
        </View>
      )}
    </ScrollView>
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
  content: {
    flexGrow: 1,
  },
  header: {
    alignItems: "center",
  },
  title: {
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    textAlign: "center",
    lineHeight: 24,
  },
  loadingText: {
    textAlign: "center",
  },
  metricsGrid: {
    width: "100%",
  },
  row: {
    flexDirection: "row",
  },
  emptyState: {
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontWeight: "600",
    textAlign: "center",
  },
  emptySubtitle: {
    textAlign: "center",
    lineHeight: 24,
  },
  encouragement: {
    alignItems: "center",
    paddingHorizontal: 32,
  },
  encouragementText: {
    textAlign: "center",
    lineHeight: 24,
    fontStyle: "italic",
  },
  aiCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
  },
  aiCardTitle: {
    fontWeight: "600",
    marginBottom: 8,
  },
  aiCardSubtitle: {
    lineHeight: 24,
    fontStyle: "italic",
  },
  aiSummary: {
    lineHeight: 24,
    marginBottom: 8,
  },
  aiFocus: {
    borderRadius: 8,
    padding: 12,
  },
  aiFocusLabel: {
    fontWeight: "600",
    marginBottom: 4,
    textTransform: "uppercase",
    fontSize: 12,
  },
  aiFocusText: {
    fontWeight: "500",
    lineHeight: 20,
  },
  aiButton: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    minHeight: 44,
  },
  aiButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  aiError: {
    textAlign: "center",
    fontStyle: "italic",
  },
});
