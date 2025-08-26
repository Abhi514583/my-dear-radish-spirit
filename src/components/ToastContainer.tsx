import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from "react-native";
import { useTheme } from "../hooks/useTheme";
import { Toast, ToastType } from "../hooks/useToast";

interface ToastContainerProps {
  toasts: Toast[];
  onHideToast: (id: string) => void;
}

const getToastColor = (type: ToastType, colors: any) => {
  switch (type) {
    case "success":
      return colors.success;
    case "error":
      return colors.error;
    case "info":
    default:
      return colors.primary;
  }
};

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onHideToast,
}) => {
  const { colors, typography, spacing } = useTheme();

  if (toasts.length === 0) return null;

  return (
    <View style={styles.container}>
      {toasts.map((toast) => {
        const backgroundColor = getToastColor(toast.type, colors);

        return (
          <TouchableOpacity
            key={toast.id}
            style={[
              styles.toast,
              { backgroundColor, marginBottom: spacing.sm },
            ]}
            onPress={() => onHideToast(toast.id)}
            accessibilityLabel={`${toast.type} message: ${toast.message}`}
            accessibilityHint="Tap to dismiss"
          >
            <Text style={[styles.toastText, typography.body]}>
              {toast.message}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 60,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  toast: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  toastText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "500",
  },
});
