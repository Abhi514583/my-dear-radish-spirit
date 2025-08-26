export interface Entry {
  id?: number;
  dateISO: string; // YYYY-MM-DD format
  mood: number; // 1-5 scale (weather-based)
  text: string;
  createdAt: number; // Unix timestamp
}

export interface Streak {
  id: number; // Always 1 (single row)
  current: number;
  longest: number;
  updatedAt: number; // Unix timestamp
}
