import dayjs from "dayjs";
import { EntryDAO } from "../data/EntryDAO";

export const calculateStreakAfterNewEntry = async (
  newEntryDate: string
): Promise<{ current: number; longest: number }> => {
  try {
    // Get all entries sorted by date desc
    const entries = await EntryDAO.getAllDesc();

    if (entries.length === 0) {
      return { current: 0, longest: 0 };
    }

    // Calculate current streak
    let currentStreak = 0;
    let previousDate: dayjs.Dayjs | null = null;

    for (const entry of entries) {
      const entryDate = dayjs(entry.dateISO);

      if (previousDate === null) {
        // First entry (most recent)
        currentStreak = 1;
        previousDate = entryDate;
      } else {
        const daysDiff = previousDate.diff(entryDate, "day");

        if (daysDiff === 1) {
          // Consecutive day
          currentStreak++;
          previousDate = entryDate;
        } else {
          // Gap found, streak ends
          break;
        }
      }
    }

    // Calculate longest streak by checking all possible streaks
    let longestStreak = 0;
    let tempStreak = 0;
    let tempPreviousDate: dayjs.Dayjs | null = null;

    for (const entry of entries) {
      const entryDate = dayjs(entry.dateISO);

      if (tempPreviousDate === null) {
        tempStreak = 1;
        tempPreviousDate = entryDate;
      } else {
        const daysDiff = tempPreviousDate.diff(entryDate, "day");

        if (daysDiff === 1) {
          tempStreak++;
          tempPreviousDate = entryDate;
        } else {
          // Streak ended, check if it's the longest
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
          tempPreviousDate = entryDate;
        }
      }
    }

    // Check final streak
    longestStreak = Math.max(longestStreak, tempStreak);
    longestStreak = Math.max(longestStreak, currentStreak);

    return { current: currentStreak, longest: longestStreak };
  } catch (error) {
    console.error("Failed to calculate streak:", error);
    return { current: 0, longest: 0 };
  }
};
