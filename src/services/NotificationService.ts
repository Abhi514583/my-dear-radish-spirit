import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export class NotificationService {
  static async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("daily-reminder", {
          name: "Daily Reminders",
          importance: Notifications.AndroidImportance.DEFAULT,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
        });
      }

      return finalStatus === "granted";
    } catch (error) {
      console.error("Failed to request notification permissions:", error);
      return false;
    }
  }

  static async scheduleDailyReminder(): Promise<boolean> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return false;
      }

      // Cancel existing notifications first
      await this.cancelDailyReminder();

      // Schedule daily notification at 8:00 PM
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "How was your day? 🌱",
          body: "Open to jot a line.",
          sound: "default",
        },
        trigger: {
          hour: 20, // 8:00 PM
          minute: 0,
          repeats: true,
        },
      });

      return true;
    } catch (error) {
      console.error("Failed to schedule daily reminder:", error);
      return false;
    }
  }

  static async cancelDailyReminder(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error("Failed to cancel notifications:", error);
    }
  }

  static async getScheduledNotifications(): Promise<
    Notifications.NotificationRequest[]
  > {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error("Failed to get scheduled notifications:", error);
      return [];
    }
  }
}
