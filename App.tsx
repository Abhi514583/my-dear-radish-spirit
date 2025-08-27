import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { Text } from "react-native";
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
              let emoji = "";

              if (route.name === "Today") {
                iconName = focused ? "leaf" : "leaf-outline";
                emoji = "🌱"; // Growing radish
              } else if (route.name === "Calendar") {
                iconName = focused ? "book" : "book-outline";
                emoji = "📖"; // Journal book
              } else if (route.name === "Insights") {
                iconName = focused ? "sparkles" : "sparkles-outline";
                emoji = "✨"; // Magic insights
              } else if (route.name === "Settings") {
                iconName = focused ? "flower" : "flower-outline";
                emoji = "🌸"; // Ghibli flower
              } else {
                iconName = "help-outline";
              }

              // Return emoji for focused state, icon for unfocused
              if (focused) {
                return (
                  <Text style={{ fontSize: size + 2, textAlign: "center" }}>
                    {emoji}
                  </Text>
                );
              }
              return <Ionicons name={iconName} size={size - 2} color={color} />;
            },
            tabBarActiveTintColor: "#2E7D32", // Forest green
            tabBarInactiveTintColor: "#81C784", // Light green
            tabBarStyle: {
              backgroundColor: "#E8F5E8", // Very light green
              borderTopColor: "#A5D6A7", // Soft green
              borderTopWidth: 2,
              height: 85,
              paddingTop: 8,
              paddingBottom: 8,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              shadowColor: "#2E7D32",
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 10,
            },
            tabBarLabelStyle: {
              fontSize: 11,
              fontWeight: "600",
              marginTop: 4,
              letterSpacing: 0.3,
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
              title: "Grow",
              headerTitle: "My Dear Radish Spirit",
            }}
          />
          <Tab.Screen
            name="Calendar"
            component={CalendarScreen}
            options={{
              title: "Stories",
              headerTitle: "My Garden Stories",
            }}
          />
          <Tab.Screen
            name="Insights"
            component={InsightsScreen}
            options={{
              title: "Magic",
              headerTitle: "Garden Magic",
            }}
          />
          <Tab.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              title: "Care",
              headerTitle: "Garden Care",
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
