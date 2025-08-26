/**
 * Accessibility testing utilities for development and testing
 */

import {
  getContrastRatio,
  meetsWCAGAA,
  meetsTouchTargetSize,
} from "./accessibility";

interface AccessibilityIssue {
  type: "contrast" | "touch-target" | "missing-label" | "missing-role";
  severity: "error" | "warning";
  message: string;
  element?: string;
}

/**
 * Test color combinations for WCAG compliance
 */
export const testColorContrast = (
  colors: Record<string, string>
): AccessibilityIssue[] => {
  const issues: AccessibilityIssue[] = [];

  // Test common color combinations
  const combinations = [
    {
      fg: colors.text,
      bg: colors.background,
      name: "Primary text on background",
    },
    {
      fg: colors.textSecondary,
      bg: colors.background,
      name: "Secondary text on background",
    },
    { fg: "#FFFFFF", bg: colors.primary, name: "White text on primary" },
    { fg: colors.text, bg: colors.surface, name: "Text on surface" },
    {
      fg: colors.textSecondary,
      bg: colors.surface,
      name: "Secondary text on surface",
    },
  ];

  combinations.forEach(({ fg, bg, name }) => {
    if (!meetsWCAGAA(fg, bg)) {
      const ratio = getContrastRatio(fg, bg);
      issues.push({
        type: "contrast",
        severity: "error",
        message: `${name} has insufficient contrast ratio: ${ratio.toFixed(
          2
        )}:1 (minimum 4.5:1)`,
        element: name,
      });
    }
  });

  return issues;
};

/**
 * Test touch target sizes
 */
export const testTouchTargets = (): AccessibilityIssue[] => {
  const issues: AccessibilityIssue[] = [];

  // Common touch targets to test
  const touchTargets = [
    { name: "Save Button", width: 44, height: 44 },
    { name: "Mood Badge", width: 44, height: 44 },
    { name: "Entry Card", width: 300, height: 44 },
  ];

  touchTargets.forEach(({ name, width, height }) => {
    if (!meetsTouchTargetSize(width, height)) {
      issues.push({
        type: "touch-target",
        severity: width < 44 || height < 44 ? "error" : "warning",
        message: `${name} (${width}x${height}) is smaller than minimum touch target size (44x44)`,
        element: name,
      });
    }
  });

  return issues;
};

/**
 * Generate accessibility report
 */
export const generateAccessibilityReport = (colors: Record<string, string>) => {
  const contrastIssues = testColorContrast(colors);
  const touchTargetIssues = testTouchTargets();

  const allIssues = [...contrastIssues, ...touchTargetIssues];
  const errors = allIssues.filter((issue) => issue.severity === "error");
  const warnings = allIssues.filter((issue) => issue.severity === "warning");

  return {
    summary: {
      total: allIssues.length,
      errors: errors.length,
      warnings: warnings.length,
      passed: allIssues.length === 0,
    },
    issues: allIssues,
    recommendations: [
      "Ensure all interactive elements have accessibility labels",
      "Test with screen readers (VoiceOver on iOS, TalkBack on Android)",
      "Verify keyboard navigation works properly",
      "Test with different font sizes and display settings",
      "Validate color contrast in both light and dark themes",
    ],
  };
};

/**
 * Log accessibility report to console (development only)
 */
export const logAccessibilityReport = (colors: Record<string, string>) => {
  if (__DEV__) {
    const report = generateAccessibilityReport(colors);

    console.group("🔍 Accessibility Report");
    console.log(`✅ Total checks: ${report.summary.total}`);
    console.log(`❌ Errors: ${report.summary.errors}`);
    console.log(`⚠️  Warnings: ${report.summary.warnings}`);

    if (report.issues.length > 0) {
      console.group("Issues Found:");
      report.issues.forEach((issue) => {
        const icon = issue.severity === "error" ? "❌" : "⚠️";
        console.log(`${icon} ${issue.message}`);
      });
      console.groupEnd();
    }

    if (report.summary.passed) {
      console.log("🎉 All accessibility checks passed!");
    }

    console.groupEnd();
  }
};
