import { getDatabase } from "./database";
import { Streak } from "./types";
import { calculateStreakAfterNewEntry } from "../utils/streakCalculator";

export class StreakDAO {
  // Get current streak data (creates if not exists)
  static async getStreak(): Promise<Streak> {
    const db = await getDatabase();

    try {
      let result = await db.getFirstAsync<Streak>(
        "SELECT * FROM streaks WHERE id = 1"
      );

      if (!result) {
        // Initialize streak record
        await db.runAsync(
          "INSERT INTO streaks (id, current, longest, updatedAt) VALUES (1, 0, 0, ?)",
          [Date.now()]
        );

        result = {
          id: 1,
          current: 0,
          longest: 0,
          updatedAt: Date.now(),
        };
      }

      return result;
    } catch (error) {
      console.error("Failed to get streak:", error);
      throw error;
    }
  }

  // Update streak after new entry
  static async updateStreakAfterSave(entryDate: string): Promise<void> {
    const db = await getDatabase();

    try {
      // Calculate new streak values
      const { current, longest } = await calculateStreakAfterNewEntry(
        entryDate
      );

      // Update streak record
      await db.runAsync(
        "UPDATE streaks SET current = ?, longest = ?, updatedAt = ? WHERE id = 1",
        [current, longest, Date.now()]
      );
    } catch (error) {
      console.error("Failed to update streak:", error);
      throw error;
    }
  }
}
