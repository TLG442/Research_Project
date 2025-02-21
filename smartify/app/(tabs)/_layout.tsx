import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons"; // Vector icons
import { BlurView } from "expo-blur"; // For glassmorphism effect

import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarShowLabel: true, // Show labels
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginTop: 2, // Ensures good spacing from icon
        },
        tabBarItemStyle: {
          justifyContent: "center", // Centers icon and label
          alignItems: "center",
          paddingVertical: 8, // Adjust vertical alignment
        },
        tabBarBackground: () => (
          <BlurView
            intensity={50}
            style={{
              position: "absolute",
              bottom: 0, // Stick to bottom
              width: "100%",
              borderRadius: 0, // Flat bottom
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              height: Platform.OS === "ios" ? 80 : 85, // Taller for centering
              overflow: "hidden",
              backdropFilter: "blur(10px)",
              paddingBottom: insets.bottom ? insets.bottom / 2 : 10, // Ensure bottom padding
              justifyContent: "center",
              alignItems: "center",
              ...Platform.select({
                ios: {
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 10,
                },
                android: {
                  elevation: 10,
                },
              }),
            }}
          />
        ),
        tabBarStyle: {
          backgroundColor: "transparent", // Needed for BlurView
          position: "absolute",
          borderTopWidth: 0,
          elevation: 0, // Remove default shadow
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? "home" : "home-outline"}
              size={32}
              color={color}
            />
          ),
          tabBarLabel: "Home",
        }}
      />

      <Tabs.Screen
        name="water_management"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? "water" : "water-outline"}
              size={33}
              color={color}
            />
          ),
          tabBarLabel: "Water",
        }}
      />
      <Tabs.Screen
        name="electric_usage"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? "lightning-bolt" : "lightning-bolt-outline"}
              size={32}
              color={color}
            />
          ),
          tabBarLabel: "Electric",
        }}
      />

      <Tabs.Screen
        name="microgrid"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? "grid" : "grid-large"}
              size={32}
              color={color}
            />
          ),
          tabBarLabel: "Grid",
        }}
      />

      <Tabs.Screen
        name="lightControl"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? "lightbulb-on" : "lightbulb-outline"}
              size={32}
              color={color}
            />
          ),
          tabBarLabel: "Lights",
        }}
      />
    </Tabs>
  );
}
