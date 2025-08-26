import { getDatabase } from "./database";
import { Entry } from "./types";

export class EntryDAO {
  // Insert new entry (upsert for same day)
  static async create(entry: Omit<Entry, "id">): Promise<number> {
    const db = await getDatabase();

    try {
      const result = await db.runAsync(
        `INSERT OR REPLACE INTO entries (dateISO, mood, text, createdAt) 
         VALUES (?, ?, ?, ?)`,
        [entry.dateISO, entry.mood, entry.text, entry.createdAt]
      );

      return result.lastInsertRowId;
    } catch (error) {
      console.error("Failed to create entry:", error);
      throw error;
    }
  }

  // Get entry for specific date
  static async getByDate(dateISO: string): Promise<Entry | null> {
    const db = await getDatabase();

    try {
      const result = await db.getFirstAsync<Entry>(
        "SELECT * FROM entries WHERE dateISO = ?",
        [dateISO]
      );

      return result || null;
    } catch (error) {
      console.error("Failed to get entry by date:", error);
      throw error;
    }
  }

  // Get all entries sorted by date desc (newest first)
  static async getAllDesc(): Promise<Entry[]> {
    const db = await getDatabase();

    try {
      const result = await db.getAllAsync<Entry>(
        "SELECT * FROM entries ORDER BY dateISO DESC"
      );

      return result;
    } catch (error) {
      console.error("Failed to get all entries:", error);
      throw error;
    }
  }

  // Get total entry count
  static async getCount(): Promise<number> {
    const db = await getDatabase();

    try {
      const result = await db.getFirstAsync<{ count: number }>(
        "SELECT COUNT(*) as count FROM entries"
      );

      return result?.count || 0;
    } catch (error) {
      console.error("Failed to get entry count:", error);
      throw error;
    }
  }

  // Calculate average mood (memoized)
  static async getAverageMood(): Promise<number> {
    const db = await getDatabase();

    try {
      const result = await db.getFirstAsync<{ avg: number }>(
        "SELECT AVG(mood) as avg FROM entries"
      );

      return result?.avg || 0;
    } catch (error) {
      console.error("Failed to get average mood:", error);
      throw error;
    }
  }

  // Delete all entries (future export/reset feature)
  static async deleteAll(): Promise<void> {
    const db = await getDatabase();

    try {
      await db.runAsync("DELETE FROM entries");
    } catch (error) {
      console.error("Failed to delete all entries:", error);
      throw error;
    }
  }
}
