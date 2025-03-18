import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useColorScheme } from '@/hooks/useColorScheme';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Check authentication state and redirect accordingly
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuthenticated = await AsyncStorage.getItem('isAuthenticated');
        if (loaded) {
          SplashScreen.hideAsync();
          // Redirect based on auth state
          if (isAuthenticated === 'true') {
            router.replace('/(tabs)');// Go to tabs if authenticated
          } else {
            router.replace('/loginScreen'); // Go to login if not authenticated
          }
        }
      } catch (error) {
        console.error('Error checking auth state:', error);
        // Fallback to login screen on error
        if (loaded) {
          SplashScreen.hideAsync();
          router.replace('/loginScreen');
        }
      }
    };
    checkAuth();
  }, [loaded, router]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="loginScreen" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}