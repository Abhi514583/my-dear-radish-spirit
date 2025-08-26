export const colors = {
  light: {
    primary: "#C53030", // Darker Radish Red for better contrast
    secondary: "#38A169", // Darker Leaf Green for better contrast
    background: "#FFFFFF",
    surface: "#F8F9FA",
    text: "#2D3748",
    textSecondary: "#4A5568", // Darker for better contrast (was #718096)
    border: "#E2E8F0",
    success: "#38A169",
    warning: "#D69E2E", // Darker for better contrast
    error: "#E53E3E",
  },
  dark: {
    primary: "#E15A5A", // Keep original for dark theme
    secondary: "#6DBF6E", // Keep original for dark theme
    background: "#1A202C",
    surface: "#2D3748",
    text: "#F7FAFC",
    textSecondary: "#CBD5E0", // Lighter for better contrast (was #A0AEC0)
    border: "#4A5568",
    success: "#6DBF6E",
    warning: "#F6AD55",
    error: "#E53E3E",
  },
};

export type ColorScheme = "light" | "dark";
export type Colors = typeof colors.light;
