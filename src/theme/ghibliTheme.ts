// Studio Ghibli inspired theme with Howl's Moving Castle vibes
export const ghibliColors = {
  // Mood-based colors matching our weather system
  moods: {
    1: {
      // Stormy ⛈️
      primary: "#4A5568",
      light: "#718096",
      background: "#2D3748",
      glow: "#5A6B7D",
      text: "#E2E8F0",
    },
    2: {
      // Cloudy ☁️
      primary: "#718096",
      light: "#A0AEC0",
      background: "#4A5568",
      glow: "#8B9DC3",
      text: "#F7FAFC",
    },
    3: {
      // Okay ⛅
      primary: "#4299E1",
      light: "#63B3ED",
      background: "#3182CE",
      glow: "#7BB8F0",
      text: "#FFFFFF",
    },
    4: {
      // Sunny ☀️
      primary: "#F6AD55",
      light: "#FBD38D",
      background: "#ED8936",
      glow: "#FFD89B",
      text: "#2D3748",
    },
    5: {
      // Radiant 🌟
      primary: "#F6E05E",
      light: "#F7E98E",
      background: "#ECC94B",
      glow: "#FFEB9C",
      text: "#2D3748",
    },
  },

  // Howl's Moving Castle inspired palette
  castle: {
    // Howl's hair colors
    blondeGold: "#F7E98E",
    magicGreen: "#68D391",
    fireOrange: "#F6AD55",

    // Castle colors
    metalBronze: "#A0522D",
    steamBlue: "#4299E1",
    magicPurple: "#9F7AEA",

    // Sophie's colors
    sophieBlue: "#4A90E2",
    apronCream: "#FFF8DC",

    // Calcifer's fire
    calciferOrange: "#FF6B35",
    calciferYellow: "#FFD23F",

    // Magical elements
    starlight: "#E6FFFA",
    moonbeam: "#F0FFF4",
    enchanted: "#E9D8FD",
  },

  // Base theme colors
  light: {
    background: "#FFFEF7", // Warm paper white
    surface: "#F7F5F0", // Soft cream
    card: "#FFFFFF",
    border: "#E2E0DB",
    text: "#2D3748",
    textSecondary: "#4A5568",
    textTertiary: "#718096",
    shadow: "rgba(0,0,0,0.1)",
  },

  dark: {
    background: "#1A1B23", // Deep night blue
    surface: "#2D2E3F", // Darker blue-gray
    card: "#3A3B4F",
    border: "#4A4B5F",
    text: "#F7FAFC",
    textSecondary: "#E2E8F0",
    textTertiary: "#CBD5E0",
    shadow: "rgba(0,0,0,0.3)",
  },
};

export const ghibliTypography = {
  // Inspired by Ghibli's hand-drawn aesthetic
  fontFamily: {
    regular: "System",
    medium: "System",
    bold: "System",
  },

  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    "2xl": 24,
    "3xl": 30,
    "4xl": 36,
  },

  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const ghibliSpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
};

export const ghibliAnimations = {
  // Gentle, organic animations like Ghibli films
  spring: {
    damping: 15,
    stiffness: 150,
    mass: 1,
  },

  gentle: {
    duration: 800,
    easing: "ease-out",
  },

  magical: {
    duration: 1200,
    easing: "ease-in-out",
  },
};

// Utility functions
export const getMoodTheme = (mood: number) => {
  return (
    ghibliColors.moods[mood as keyof typeof ghibliColors.moods] ||
    ghibliColors.moods[3]
  );
};

export const getMoodEmoji = (mood: number): string => {
  const emojis = {
    1: "⛈️",
    2: "☁️",
    3: "⛅",
    4: "☀️",
    5: "🌟",
  };
  return emojis[mood as keyof typeof emojis] || "⛅";
};

export const getMoodLabel = (mood: number): string => {
  const labels = {
    1: "Stormy",
    2: "Cloudy",
    3: "Okay",
    4: "Sunny",
    5: "Radiant",
  };
  return labels[mood as keyof typeof labels] || "Okay";
};
