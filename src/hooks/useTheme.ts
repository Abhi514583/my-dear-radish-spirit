import { useColorScheme } from "react-native";
import { colors, type Colors, type ColorScheme } from "../theme/colors";
import { typography, type Typography } from "../theme/typography";
import { spacing, type Spacing } from "../theme/spacing";
import { logAccessibilityReport } from "../utils/accessibilityTesting";

export interface Theme {
  colors: Colors;
  typography: Typography;
  spacing: Spacing;
  colorScheme: ColorScheme;
}

export const useTheme = (): Theme => {
  const colorScheme = useColorScheme() ?? "light";
  const themeColors = colors[colorScheme];

  // Run accessibility checks in development
  if (__DEV__) {
    // Only log once per theme change to avoid spam
    const key = `accessibility-check-${colorScheme}`;
    if (!global[key as keyof typeof global]) {
      logAccessibilityReport(themeColors);
      (global as any)[key] = true;
    }
  }

  return {
    colors: themeColors,
    typography,
    spacing,
    colorScheme,
  };
};
