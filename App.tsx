import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import { TodayScreen } from "./src/screens/TodayScreen";
import { CalendarScreen } from "./src/screens/CalendarScreen";
import { InsightsScreen } from "./src/screens/InsightsScreen";
import { SettingsScreen } from "./src/screens/settings/SettingsScreen";
import { ToastContainer } from "./src/components/ToastContainer";
import { ErrorBoundary } from "./src/components/ErrorBoundary";
import { useTheme } from "./src/hooks/useTheme";
import { useToast } from "./src/hooks/useToast";
import { initDatabase } from "./src/data/database";

const Tab = createBottomTabNavigator();

function AppContent() {
  const { colors, colorScheme } = useTheme();
  const { toasts, hideToast } = useToast();

  useEffect(() => {
    // Initialize database on app start
    initDatabase().catch(console.error);
  }, []);

  return (
    <>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName: keyof typeof Ionicons.glyphMap;

              if (route.name === "Today") {
                iconName = focused ? "today" : "today-outline";
              } else if (route.name === "Calendar") {
                iconName = focused ? "list" : "list-outline";
              } else if (route.name === "Insights") {
                iconName = focused ? "analytics" : "analytics-outline";
              } else if (route.name === "Settings") {
                iconName = focused ? "settings" : "settings-outline";
              } else {
                iconName = "help-outline";
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.textSecondary,
            tabBarStyle: {
              backgroundColor: colors.surface,
              borderTopColor: colors.border,
            },
            headerStyle: {
              backgroundColor: colors.surface,
            },
            headerTintColor: colors.text,
            headerTitleStyle: {
              fontWeight: "600",
            },
          })}
        >
          <Tab.Screen
            name="Today"
            component={TodayScreen}
            options={{
              title: "Today",
              headerTitle: "My Dear Radish Spirit",
            }}
          />
          <Tab.Screen
            name="Calendar"
            component={CalendarScreen}
            options={{
              title: "Journal",
              headerTitle: "My Journal",
            }}
          />
          <Tab.Screen
            name="Insights"
            component={InsightsScreen}
            options={{
              title: "Insights",
              headerTitle: "Insights",
            }}
          />
          <Tab.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              title: "Settings",
              headerTitle: "Settings",
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>

      <ToastContainer toasts={toasts} onHideToast={hideToast} />
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}
