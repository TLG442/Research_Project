import { Tabs, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";

import { Colors } from "@/constants/Colors";


export default function TabLayout() {

  const insets = useSafeAreaInsets();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = true;
      if (token) {
        // Add your auth logic here if needed
      }
    };

    checkAuth();
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#0394fc",
        headerShown: false,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginTop: 2,
        },
        tabBarItemStyle: {
          justifyContent: "center",
          alignItems: "center",
          paddingVertical: 8,
        },
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <BlurView
              intensity={50}
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                borderRadius: 0,
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                height: 80 + (insets.bottom || 0), // Include safe area bottom
                overflow: "hidden",
                backdropFilter: "blur(10px)",
                justifyContent: "center",
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 10,
              }}
            />
          ) : (
            <View
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                borderRadius: 0,
                backgroundColor: "rgba(233, 236, 238, 0.8)", // Red background for Android
                height:  (insets.bottom || 0), // Include safe area bottom
                justifyContent: "center",
                alignItems: "center",
                elevation: 10, // Android shadow
              }}
            />
          ),
        tabBarStyle: {
          backgroundColor: "transparent",
          position: "absolute",
          left: 0,
                right: 0,
          bottom: 0,
          borderTopWidth: 0,
          elevation: 0,
          paddingBottom: insets.bottom, // Ensure safe area is respected
          height: 70 + (insets.bottom || 0), // Match background height
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? "water" : "water-outline"}
              size={32}
              color={color}
            />
          ),
          tabBarLabel: "Water",
        }}
      />
      {/* <Tabs.Screen
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
      /> */}
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
          tabBarLabel: "Power",
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
        name="light_control"
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