import { useState, useEffect, useCallback } from "react";
import { StreakDAO } from "../data/StreakDAO";
import { Streak } from "../data/types";

export const useStreak = () => {
  const [streak, setStreak] = useState<Streak>({
    id: 1,
    current: 0,
    longest: 0,
    updatedAt: Date.now(),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStreak = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const currentStreak = await StreakDAO.getStreak();
      setStreak(currentStreak);
    } catch (err) {
      setError("Failed to load streak");
      console.error("Load streak error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStreak = useCallback(
    async (entryDate: string) => {
      try {
        setLoading(true);
        setError(null);
        await StreakDAO.updateStreakAfterSave(entryDate);
        await loadStreak(); // Reload to get updated values
      } catch (err) {
        setError("Failed to update streak");
        console.error("Update streak error:", err);
      } finally {
        setLoading(false);
      }
    },
    [loadStreak]
  );

  useEffect(() => {
    loadStreak();
  }, [loadStreak]);

  return {
    streak,
    loading,
    error,
    loadStreak,
    updateStreak,
  };
};
