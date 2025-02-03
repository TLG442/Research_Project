import { Tabs } from 'expo-router';
import React from 'react';
import { Image, Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarShowLabel: false, // Remove text labels
        tabBarStyle: {
          position: 'absolute',
          bottom: 20,
          width: '90%', // Ensures left and right spacing
          marginHorizontal: '5%', // Centers the tab bar
          borderRadius: 25, // Rounded corners
          backgroundColor: '#A9A9A9',
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
            },
            android: {
              elevation: 5, // Shadow for Android
            },
          }),
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Image
              source={
                focused
                  ? require('../../assets/images/Home_icon.png') // Active icon
                  : require('../../assets/images/Home_icon.png') // Inactive icon
              }
              style={{
                width: 28,
                height: 28,
                tintColor: color, // Apply color tint if needed
              }}
              resizeMode="contain"
            />
          ),
        }}
      />
    </Tabs>
  );
}
