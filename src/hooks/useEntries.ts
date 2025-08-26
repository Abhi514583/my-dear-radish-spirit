import { useState, useEffect, useCallback } from "react";
import { EntryDAO } from "../data/EntryDAO";
import { StreakDAO } from "../data/StreakDAO";
import { Entry } from "../data/types";
import { getCurrentDateISO } from "../utils/dateUtils";

export const useEntries = () => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEntries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const allEntries = await EntryDAO.getAllDesc();
      setEntries(allEntries);
    } catch (err) {
      setError("Failed to load entries");
      console.error("Load entries error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveEntry = useCallback(
    async (mood: number, text: string) => {
      try {
        setLoading(true);
        setError(null);

        const dateISO = getCurrentDateISO();
        const createdAt = Date.now();

        await EntryDAO.create({
          dateISO,
          mood,
          text: text.trim(),
          createdAt,
        });

        // Update streak
        await StreakDAO.updateStreakAfterSave(dateISO);

        // Reload entries
        await loadEntries();

        return true;
      } catch (err) {
        setError("Failed to save entry");
        console.error("Save entry error:", err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [loadEntries]
  );

  const getEntryCount = useCallback(async (): Promise<number> => {
    try {
      return await EntryDAO.getCount();
    } catch (err) {
      console.error("Get entry count error:", err);
      return 0;
    }
  }, []);

  const getAverageMood = useCallback(async (): Promise<number> => {
    try {
      return await EntryDAO.getAverageMood();
    } catch (err) {
      console.error("Get average mood error:", err);
      return 0;
    }
  }, []);

  const getTodayEntry = useCallback(async (): Promise<Entry | null> => {
    try {
      const dateISO = getCurrentDateISO();
      return await EntryDAO.getByDate(dateISO);
    } catch (err) {
      console.error("Get today entry error:", err);
      return null;
    }
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  return {
    entries,
    loading,
    error,
    saveEntry,
    loadEntries,
    getEntryCount,
    getAverageMood,
    getTodayEntry,
  };
};
