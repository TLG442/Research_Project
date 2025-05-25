import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { supabase } from '../supabase/supabaseClient'; // Import the Supabase client
import { useColorScheme } from '@/hooks/useColorScheme';
import { AppProvider } from "@/context/AppContext";
// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Check authentication state using Supabase and redirect accordingly
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!loaded) return; // Wait for fonts to load

        // Check if there's an active Supabase session
        const { data: { session } } = await supabase.auth.getSession();
        const isAuthenticated = !!session; // True if session exists

        SplashScreen.hideAsync();

        // Redirect based on auth state
        if (isAuthenticated) {
          router.replace('/(tabs)'); // Go to tabs if authenticated
        } else {
          router.replace('/loginScreen'); // Go to login if not authenticated
        }
      } catch (error) {
        console.error('Error checking auth state:', error);
        // Fallback to login screen on error
        SplashScreen.hideAsync();
        router.replace('/loginScreen');
      }
    };

    checkAuth();

    // Listen for auth state changes (e.g., user logs in/out)
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      const isAuthenticated = !!session;
      if (isAuthenticated) {
        router.replace('/(tabs)');
      } else {
        router.replace('/loginScreen');
      }
    });

    // Cleanup listener on unmount
    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [loaded, router]);

  if (!loaded) {
    return null;
  }

  return (
      <AppProvider>
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="loginScreen" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
    </AppProvider>
  );
}