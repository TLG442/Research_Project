import { Tabs } from 'expo-router';
import React from 'react';
import { Image, Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // Import for safe area handling

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets(); // Get safe area insets

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
          bottom: Platform.OS === 'ios' ? insets.bottom : 20, // Adjust for iOS safe area
          width: '90%', // Ensures left and right spacing
          marginHorizontal: '5%', // Centers the tab bar
          borderRadius: 25, // Rounded corners
          backgroundColor: '#A9A9A9',
          height: Platform.OS === 'ios' ? 40 : 50, // Adjust height for iOS
          overflow: 'hidden', // Ensure border radius is visible on iOS
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
      }}
    >
      
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

    
      <Tabs.Screen
        name="water_management"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Image
              source={
                focused
                  ? require('../../assets/images/water_droplet.png') // Active icon
                  : require('../../assets/images/water_droplet.png') // Inactive icon
              }
              style={{
                width: 28,
                height: 28,
                tintColor: color,
              }}
              resizeMode="contain"
            />
          ),
        }}
      />



<Tabs.Screen
        name="microgrid"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Image
              source={
                focused
                  ? require('../../assets/images/react-logo.png') // Active icon
                  : require('../../assets/images/react-logo.png') // Inactive icon
              }
              style={{
                width: 28,
                height: 28,
                tintColor: color,
              }}
              resizeMode="contain"
            />
          ),
        }}
      />

      
<Tabs.Screen
        name="lightControl"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Image
              source={
                focused
                  ? require('../../assets/images/splash-icon.png') // Active icon
                  : require('../../assets/images/splash-icon.png') // Inactive icon
              }
              style={{
                width: 28,
                height: 28,
                tintColor: color,
              }}
              resizeMode="contain"
            />
          ),
        }}
      />

  
    </Tabs>
  );
}
