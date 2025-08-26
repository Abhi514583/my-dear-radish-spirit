import React, { useState } from "react";
import { View, TextInput, Text, StyleSheet } from "react-native";
import { useTheme } from "../hooks/useTheme";

interface JournalInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export const JournalInput: React.FC<JournalInputProps> = ({
  value,
  onChangeText,
  placeholder = "What's on your mind today?",
}) => {
  const { colors, typography, spacing } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const characterCount = value.length;
  const maxCharacters = 1000;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.inputContainer,
          {
            borderColor: isFocused ? colors.primary : "transparent",
            backgroundColor: "transparent",
          },
        ]}
      >
        <TextInput
          style={[styles.textInput, { color: colors.text }, typography.body]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          multiline
          numberOfLines={4}
          maxLength={maxCharacters}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          accessibilityLabel="Journal entry text input"
          accessibilityHint="Enter your thoughts and feelings for today"
          accessibilityRole="text"
          returnKeyType="default"
          blurOnSubmit={false}
          textContentType="none"
          autoCapitalize="sentences"
          autoCorrect={true}
        />
      </View>

      <View style={styles.footer}>
        <Text
          style={[
            styles.characterCount,
            { color: colors.textSecondary },
            typography.caption,
          ]}
          accessibilityLabel={`${characterCount} of ${maxCharacters} characters used`}
        >
          {characterCount}/{maxCharacters}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  inputContainer: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
  },
  textInput: {
    flex: 1,
    textAlignVertical: "top",
    lineHeight: 20,
    fontSize: 16,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 4,
  },
  characterCount: {
    fontSize: 11,
  },
});
