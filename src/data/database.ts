import * as SQLite from "expo-sqlite";
import { retryWithBackoff } from "../utils/errorUtils";

const DATABASE_NAME = "radish_spirit.db";

let db: SQLite.SQLiteDatabase | null = null;

export const initDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (db) {
    return db;
  }

  try {
    db = await retryWithBackoff(
      async () => {
        return await SQLite.openDatabaseAsync(DATABASE_NAME);
      },
      3,
      500
    );

    // Create tables with retry logic
    await retryWithBackoff(
      async () => {
        return await db!.execAsync(`
      PRAGMA journal_mode = WAL;
      
      -- Entries table (one entry per day enforced)
      CREATE TABLE IF NOT EXISTS entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        dateISO TEXT NOT NULL UNIQUE,
        mood INTEGER NOT NULL CHECK (mood >= 1 AND mood <= 5),
        text TEXT NOT NULL,
        createdAt INTEGER NOT NULL
      );

      -- Streak table (single row)
      CREATE TABLE IF NOT EXISTS streaks (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        current INTEGER NOT NULL DEFAULT 0,
        longest INTEGER NOT NULL DEFAULT 0,
        updatedAt INTEGER NOT NULL
      );

      -- Future-proofing: Weekly summaries table (Sprint 3)
      CREATE TABLE IF NOT EXISTS weekly_summaries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        weekStartISO TEXT NOT NULL UNIQUE,
        summary TEXT,
        focus TEXT,
        createdAt INTEGER NOT NULL
      );
    `);
      },
      3,
      1000
    );

    console.log("Database initialized successfully");
    return db;
  } catch (error) {
    console.error("Database initialization failed:", error);
    throw error;
  }
};

export const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (!db) {
    return await initDatabase();
  }
  return db;
};
