# Accessibility Guide

This document outlines the accessibility features and compliance measures implemented in the My Dear Radish Spirit journaling app.

## WCAG 2.1 Compliance

### Level AA Compliance

The app meets WCAG 2.1 Level AA standards through:

#### Color and Contrast

- **Contrast Ratios**: All text meets minimum 4.5:1 contrast ratio against backgrounds
- **Color Independence**: Information is not conveyed through color alone
- **Theme Support**: Both light and dark themes maintain proper contrast ratios

#### Touch Targets

- **Minimum Size**: All interactive elements meet 44pt minimum touch target size
- **Spacing**: Adequate spacing between touch targets to prevent accidental activation

#### Typography

- **Dynamic Type**: Support for iOS Dynamic Type scaling (capped at 1.3x for readability)
- **Font Scaling**: Responsive font sizes that scale with user preferences
- **Line Height**: Proper line spacing for improved readability

## Screen Reader Support

### VoiceOver (iOS) and TalkBack (Android)

- **Accessibility Labels**: Descriptive labels for all interactive elements
- **Accessibility Hints**: Contextual hints explaining element behavior
- **Accessibility Roles**: Proper semantic roles for UI elements
- **Reading Order**: Logical navigation order through content

### Component-Specific Features

#### MoodSlider

- Descriptive mood labels (e.g., "Good mood, 7 out of 10")
- Increment/decrement actions for precise control
- Real-time value announcements

#### JournalInput

- Character count announcements
- Input validation feedback
- Proper keyboard handling

#### EntryCard

- Complete entry information in accessibility label
- Mood rating context
- Date formatting for screen readers

#### MetricCard

- Combined metric information in single announcement
- Clear value and unit descriptions

## Performance Optimizations

### FlatList Performance

- **getItemLayout**: Pre-calculated item dimensions for smooth scrolling
- **keyExtractor**: Stable keys for efficient re-rendering
- **removeClippedSubviews**: Memory optimization for large lists
- **Batch Rendering**: Optimized rendering batches for better performance

### Memory Management

- **Memoization**: Expensive calculations cached with useMemo
- **Callback Optimization**: useCallback for stable function references
- **Component Optimization**: Minimal re-renders through proper state management

## Testing

### Automated Testing

- Contrast ratio validation
- Touch target size verification
- Accessibility label presence checks
- Screen reader announcement testing

### Manual Testing Checklist

- [ ] Navigate entire app using only VoiceOver/TalkBack
- [ ] Test with maximum font size settings
- [ ] Verify color contrast in both themes
- [ ] Test touch targets with motor impairments in mind
- [ ] Validate keyboard navigation (external keyboard)

## Development Guidelines

### Adding New Components

1. Include accessibility labels and hints
2. Set appropriate accessibility roles
3. Ensure minimum touch target sizes
4. Test with screen readers
5. Validate color contrast

### Code Examples

#### Basic Accessibility Props

```tsx
<TouchableOpacity
  accessibilityLabel="Save journal entry"
  accessibilityHint="Saves your mood and text for today"
  accessibilityRole="button"
  style={{ minHeight: 44, minWidth: 44 }}
>
  <Text>Save</Text>
</TouchableOpacity>
```

#### Screen Reader Optimized Text

```tsx
<Text
  accessibilityLabel={`Mood rating ${mood} out of 10, ${getMoodAccessibilityLabel(
    mood
  )}`}
>
  {mood}
</Text>
```

#### Performance Optimized List

```tsx
<FlatList
  data={entries}
  keyExtractor={(item) => item.id}
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={10}
/>
```

## Accessibility Features by Screen

### Today Screen

- Mood slider with increment/decrement actions
- Journal input with character count announcements
- Save button with loading state feedback

### Calendar Screen

- Optimized list performance for large entry collections
- Entry cards with complete information in labels
- Empty state with helpful guidance

### Insights Screen

- Metric cards with combined value announcements
- Progress encouragement with context
- Loading states with descriptive text

## Future Enhancements

### Planned Improvements

- Voice input support for journal entries
- Haptic feedback for mood selection
- High contrast mode support
- Reduced motion preferences
- Voice-over custom actions for advanced navigation

### Accessibility Testing Tools

- React Native Accessibility Inspector
- Flipper Accessibility Plugin
- Manual testing with real assistive technologies

## Resources

- [React Native Accessibility Guide](https://reactnative.dev/docs/accessibility)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [iOS Accessibility Guidelines](https://developer.apple.com/accessibility/)
- [Android Accessibility Guidelines](https://developer.android.com/guide/topics/ui/accessibility)

## Contact

For accessibility feedback or issues, please create an issue in the project repository with the "accessibility" label.
