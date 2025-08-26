import { PixelRatio } from "react-native";

// Base font sizes
const baseFontSizes = {
  heading: 24,
  subheading: 18,
  body: 16,
  caption: 14,
  small: 12,
};

// Dynamic type scaling function
const scaleFont = (size: number): number => {
  const scale = PixelRatio.getFontScale();
  // Cap the scaling to prevent extremely large text
  const cappedScale = Math.min(scale, 1.3);
  return Math.round(size * cappedScale);
};

export const typography = {
  heading: {
    fontSize: scaleFont(baseFontSizes.heading),
    fontWeight: "bold" as const,
    lineHeight: scaleFont(baseFontSizes.heading * 1.33),
  },
  subheading: {
    fontSize: scaleFont(baseFontSizes.subheading),
    fontWeight: "600" as const,
    lineHeight: scaleFont(baseFontSizes.subheading * 1.33),
  },
  body: {
    fontSize: scaleFont(baseFontSizes.body),
    fontWeight: "normal" as const,
    lineHeight: scaleFont(baseFontSizes.body * 1.375),
  },
  caption: {
    fontSize: scaleFont(baseFontSizes.caption),
    fontWeight: "normal" as const,
    lineHeight: scaleFont(baseFontSizes.caption * 1.43),
  },
  small: {
    fontSize: scaleFont(baseFontSizes.small),
    fontWeight: "normal" as const,
    lineHeight: scaleFont(baseFontSizes.small * 1.33),
  },
};

export type Typography = typeof typography;
