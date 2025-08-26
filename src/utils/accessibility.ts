/**
 * Accessibility utilities for ensuring WCAG compliance
 */

/**
 * Calculate relative luminance of a color
 * @param hex - Hex color string (e.g., "#FF0000")
 * @returns Relative luminance value between 0 and 1
 */
const getLuminance = (hex: string): number => {
  // Remove # if present
  const color = hex.replace("#", "");

  // Convert to RGB
  const r = parseInt(color.substr(0, 2), 16) / 255;
  const g = parseInt(color.substr(2, 2), 16) / 255;
  const b = parseInt(color.substr(4, 2), 16) / 255;

  // Apply gamma correction
  const sRGB = [r, g, b].map((c) => {
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  // Calculate luminance
  return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
};

/**
 * Calculate contrast ratio between two colors
 * @param color1 - First color in hex format
 * @param color2 - Second color in hex format
 * @returns Contrast ratio between 1 and 21
 */
export const getContrastRatio = (color1: string, color2: string): number => {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);

  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
};

/**
 * Check if contrast ratio meets WCAG AA standards
 * @param color1 - First color in hex format
 * @param color2 - Second color in hex format
 * @param isLargeText - Whether the text is considered large (18pt+ or 14pt+ bold)
 * @returns Whether the contrast meets WCAG AA standards
 */
export const meetsWCAGAA = (
  color1: string,
  color2: string,
  isLargeText: boolean = false
): boolean => {
  const ratio = getContrastRatio(color1, color2);
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
};

/**
 * Check if contrast ratio meets WCAG AAA standards
 * @param color1 - First color in hex format
 * @param color2 - Second color in hex format
 * @param isLargeText - Whether the text is considered large (18pt+ or 14pt+ bold)
 * @returns Whether the contrast meets WCAG AAA standards
 */
export const meetsWCAGAAA = (
  color1: string,
  color2: string,
  isLargeText: boolean = false
): boolean => {
  const ratio = getContrastRatio(color1, color2);
  return isLargeText ? ratio >= 4.5 : ratio >= 7;
};

/**
 * Minimum touch target size in points (44pt for iOS, 48dp for Android)
 */
export const MIN_TOUCH_TARGET_SIZE = 44;

/**
 * Check if a component meets minimum touch target size requirements
 * @param width - Width of the touch target
 * @param height - Height of the touch target
 * @returns Whether the touch target meets minimum size requirements
 */
export const meetsTouchTargetSize = (
  width: number,
  height: number
): boolean => {
  return width >= MIN_TOUCH_TARGET_SIZE && height >= MIN_TOUCH_TARGET_SIZE;
};

/**
 * Generate accessibility label for mood values
 * @param mood - Mood value from 1-5
 * @returns Descriptive accessibility label
 */
export const getMoodAccessibilityLabel = (mood: number): string => {
  const labels = {
    1: "Stormy mood - feeling very down",
    2: "Cloudy mood - feeling low",
    3: "Okay mood - feeling neutral",
    4: "Sunny mood - feeling good",
    5: "Radiant mood - feeling excellent",
  };

  return labels[mood as keyof typeof labels] || `Mood level ${mood}`;
};
