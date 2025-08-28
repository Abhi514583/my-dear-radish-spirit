import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "@react-navigation/native";
import { MetricCard } from "../components/MetricCard";
import { useTheme } from "../hooks/useTheme";
import { useEntries } from "../hooks/useEntries";
import { useStreak } from "../hooks/useStreak";
import { AIService } from "../services/AIService";
import {
  getMoodGradient,
  getMoodTheme,
  getMoodEmoji,
} from "../theme/ghibliTheme";

const { width } = Dimensions.get("window");

export const InsightsScreen: React.FC = () => {
  const { colors } = useTheme();
  const {
    entries,
    getEntryCount,
    getAverageMood,
    loading: entriesLoading,
  } = useEntries();
  const { streak, loading: streakLoading } = useStreak();

  const [entryCount, setEntryCount] = useState(0);
  const [averageMood, setAverageMood] = useState(3);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"weekly" | "monthly">("weekly");
  const [aiSummary, setAiSummary] = useState<{
    summary: string;
    focus: string;
  } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Get dynamic theme based on average mood
  const moodGradient = getMoodGradient(Math.round(averageMood));
  const moodTheme = getMoodTheme(Math.round(averageMood));
  const moodEmoji = getMoodEmoji(Math.round(averageMood));

  useEffect(() => {
    loadInsights();
  }, [loadInsights]);

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
      setAverageMood(avgMood || 3);
    } catch (error) {
      console.error("Failed to load insights:", error);
    } finally {
      setLoading(false);
    }
  }, [getEntryCount, getAverageMood]);

  const generateSummary = useCallback(async () => {
    if (entries.length < (viewMode === "weekly" ? 7 : 30)) return;

    try {
      setAiLoading(true);
      setAiError(null);

      const result =
        viewMode === "weekly"
          ? await AIService.aiWeeklySummary(entries)
          : await AIService.aiMonthlySummary(entries);

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
  }, [entries, viewMode]);

  const getRecentMoodTrend = () => {
    if (entries.length < 3) return "neutral";
    const recent = entries.slice(-7).map((e) => e.mood);
    const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const prevAvg =
      entries
        .slice(-14, -7)
        .map((e) => e.mood)
        .reduce((a, b) => a + b, 0) /
      Math.max(entries.slice(-14, -7).length, 1);

    if (avg > prevAvg + 0.5) return "improving";
    if (avg < prevAvg - 0.5) return "declining";
    return "stable";
  };

  const moodTrend = getRecentMoodTrend();

  if (loading || entriesLoading || streakLoading) {
    return (
      <LinearGradient
        colors={moodGradient}
        style={[styles.container, styles.centered]}
      >
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingEmoji}>🔮</Text>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>
            Conjuring your magical insights...
          </Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={moodGradient}
      style={styles.container}
      locations={[0, 0.6, 1]}
    >
      {/* Magical Header */}
      <LinearGradient
        colors={[
          `${moodTheme.primary}CC`,
          `${moodTheme.primary}99`,
          `${moodTheme.primary}66`,
        ]}
        style={styles.magicalHeader}
      >
        <Text style={styles.magicalTitle}>✨ Magical Insights ✨</Text>
        <Text style={[styles.moodIndicator, { color: moodTheme.text }]}>
          Your spirit feels {moodEmoji} {getMoodLabel(Math.round(averageMood))}
        </Text>
      </LinearGradient>

      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Time Period Toggle */}
        <View style={styles.periodToggle}>
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
              📅 Weekly
            </Text>
          </TouchableOpacity>
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
              🗓️ Monthly
            </Text>
          </TouchableOpacity>
        </View>

        {/* Magic Stats Cards */}
        <View style={styles.statsContainer}>
          <LinearGradient
            colors={[`${moodTheme.light}40`, `${moodTheme.light}20`]}
            style={styles.statCard}
          >
            <Text style={styles.statEmoji}>📖</Text>
            <Text style={[styles.statValue, { color: moodTheme.text }]}>
              {entryCount}
            </Text>
            <Text style={[styles.statLabel, { color: moodTheme.text }]}>
              Stories Written
            </Text>
          </LinearGradient>

          <LinearGradient
            colors={[`${moodTheme.light}40`, `${moodTheme.light}20`]}
            style={styles.statCard}
          >
            <Text style={styles.statEmoji}>🔥</Text>
            <Text style={[styles.statValue, { color: moodTheme.text }]}>
              {streak.current}
            </Text>
            <Text style={[styles.statLabel, { color: moodTheme.text }]}>
              Day Streak
            </Text>
          </LinearGradient>

          <LinearGradient
            colors={[`${moodTheme.light}40`, `${moodTheme.light}20`]}
            style={styles.statCard}
          >
            <Text style={styles.statEmoji}>
              {moodTrend === "improving"
                ? "📈"
                : moodTrend === "declining"
                ? "📉"
                : "📊"}
            </Text>
            <Text style={[styles.statValue, { color: moodTheme.text }]}>
              {averageMood.toFixed(1)}
            </Text>
            <Text style={[styles.statLabel, { color: moodTheme.text }]}>
              Mood Average
            </Text>
          </LinearGradient>
        </View>

        {/* AI Summary Crystal Ball */}
        <LinearGradient
          colors={[
            `${moodTheme.primary}30`,
            `${moodTheme.primary}20`,
            `${moodTheme.primary}10`,
          ]}
          style={styles.crystalBall}
        >
          <Text style={styles.crystalTitle}>
            🔮 {viewMode === "weekly" ? "Weekly" : "Monthly"} Wisdom
          </Text>

          {entryCount < (viewMode === "weekly" ? 7 : 30) ? (
            <View style={styles.crystalEmpty}>
              <Text
                style={[styles.crystalEmptyText, { color: moodTheme.text }]}
              >
                Write {viewMode === "weekly" ? 7 : 30} entries to unlock magical
                insights
              </Text>
              <Text style={styles.crystalEmptyEmoji}>🌱</Text>
            </View>
          ) : aiSummary ? (
            <View style={styles.crystalContent}>
              <Text style={[styles.summaryText, { color: moodTheme.text }]}>
                {aiSummary.summary}
              </Text>
              <LinearGradient
                colors={[`${moodTheme.primary}40`, `${moodTheme.primary}20`]}
                style={styles.focusCard}
              >
                <Text style={[styles.focusLabel, { color: moodTheme.text }]}>
                  ✨ Focus Area
                </Text>
                <Text style={[styles.focusText, { color: moodTheme.text }]}>
                  {aiSummary.focus}
                </Text>
              </LinearGradient>
            </View>
          ) : (
            <TouchableOpacity
              style={[
                styles.crystalButton,
                { backgroundColor: moodTheme.primary },
              ]}
              onPress={generateSummary}
              disabled={aiLoading}
            >
              {aiLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.crystalButtonText}>
                  🔮 Reveal {viewMode === "weekly" ? "Weekly" : "Monthly"}{" "}
                  Wisdom
                </Text>
              )}
            </TouchableOpacity>
          )}

          {aiError && <Text style={styles.errorText}>{aiError}</Text>}
        </LinearGradient>

        {/* Guidance Section */}
        <LinearGradient
          colors={[
            `${moodTheme.primary}25`,
            `${moodTheme.primary}15`,
            `${moodTheme.primary}05`,
          ]}
          style={styles.guidanceSection}
        >
          <Text style={styles.guidanceTitle}>🌟 Magical Guidance</Text>

          <View style={styles.guidanceCards}>
            <TouchableOpacity style={styles.guidanceCard}>
              <Text style={styles.guidanceEmoji}>🧘‍♀️</Text>
              <Text
                style={[styles.guidanceCardTitle, { color: moodTheme.text }]}
              >
                Mindfulness
              </Text>
              <Text
                style={[styles.guidanceCardText, { color: moodTheme.text }]}
              >
                Daily reflection practices
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.guidanceCard}>
              <Text style={styles.guidanceEmoji}>🌱</Text>
              <Text
                style={[styles.guidanceCardTitle, { color: moodTheme.text }]}
              >
                Growth
              </Text>
              <Text
                style={[styles.guidanceCardText, { color: moodTheme.text }]}
              >
                Personal development tips
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.guidanceCard}>
              <Text style={styles.guidanceEmoji}>💫</Text>
              <Text
                style={[styles.guidanceCardTitle, { color: moodTheme.text }]}
              >
                Inspiration
              </Text>
              <Text
                style={[styles.guidanceCardText, { color: moodTheme.text }]}
              >
                Daily motivational quotes
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Magical Footer */}
        <View style={styles.magicalFooter}>
          <Text style={[styles.footerText, { color: moodTheme.text }]}>
            "Every entry is a step on your magical journey" ✨
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const getMoodLabel = (mood: number): string => {
  const labels = {
    1: "stormy",
    2: "cloudy",
    3: "balanced",
    4: "sunny",
    5: "radiant",
  };
  return labels[mood as keyof typeof labels] || "balanced";
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },

  // Loading
  loadingContainer: {
    alignItems: "center",
    padding: 40,
  },
  loadingEmoji: {
    fontSize: 60,
    marginBottom: 20,
  },
  loadingText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 16,
    textAlign: "center",
  },

  // Magical Header
  magicalHeader: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: "center",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  magicalTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 8,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  moodIndicator: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // Scroll Content
  scrollContent: {
    flex: 1,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 40,
  },

  // Period Toggle
  periodToggle: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 25,
    padding: 4,
    marginBottom: 20,
    alignSelf: "center",
  },
  toggleButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  activeToggle: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  toggleText: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.8)",
  },
  activeToggleText: {
    color: "#333",
  },

  // Stats Container
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    opacity: 0.9,
  },

  // Crystal Ball
  crystalBall: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    alignItems: "center",
  },
  crystalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 16,
    textAlign: "center",
  },
  crystalEmpty: {
    alignItems: "center",
    paddingVertical: 20,
  },
  crystalEmptyText: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 12,
    opacity: 0.9,
  },
  crystalEmptyEmoji: {
    fontSize: 30,
  },
  crystalContent: {
    width: "100%",
  },
  summaryText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    marginBottom: 16,
    fontWeight: "500",
  },
  focusCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  focusLabel: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  focusText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 22,
  },
  crystalButton: {
    borderRadius: 15,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  crystalButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 14,
    textAlign: "center",
    marginTop: 12,
    fontStyle: "italic",
  },

  // Guidance Section
  guidanceSection: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  guidanceTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 16,
  },
  guidanceCards: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  guidanceCard: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  guidanceEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  guidanceCardTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
    textAlign: "center",
  },
  guidanceCardText: {
    fontSize: 12,
    textAlign: "center",
    opacity: 0.9,
    lineHeight: 16,
  },

  // Magical Footer
  magicalFooter: {
    alignItems: "center",
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
    opacity: 0.8,
  },
});
