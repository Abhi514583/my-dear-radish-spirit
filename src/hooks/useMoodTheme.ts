import React, { createContext, useContext, useState, useEffect } from "react";
import { getAppTheme } from "../theme/ghibliTheme";
import { useEntries } from "./useEntries";

interface MoodThemeContextType {
  currentMood: number;
  setCurrentMood: (mood: number) => void;
  theme: ReturnType<typeof getAppTheme>;
}

const MoodThemeContext = createContext<MoodThemeContextType | undefined>(
  undefined
);

export const MoodThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentMood, setCurrentMood] = useState(3); // Default to "Okay"
  const { entries } = useEntries();

  // Get today's mood if available
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const todayEntry = entries.find((entry) => entry.dateISO === today);
    if (todayEntry) {
      setCurrentMood(todayEntry.mood);
    }
  }, [entries]);

  const theme = getAppTheme(currentMood);

  return (
    <MoodThemeContext.Provider value={{ currentMood, setCurrentMood, theme }}>
      {children}
    </MoodThemeContext.Provider>
  );
};

export const useMoodTheme = () => {
  const context = useContext(MoodThemeContext);
  if (context === undefined) {
    throw new Error("useMoodTheme must be used within a MoodThemeProvider");
  }
  return context;
};
