import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from 'expo-router';
import { Canvas, Rect, Group, RoundedRect, Text as SkiaText, useFont } from '@shopify/react-native-skia';

export default function WaterUsageInsights() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  React.useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  // Hardcoded water usage data
  const waterUsageData = [100, 30, 15, 25, 35, 40, 22]; // Liters per day
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Load a font (replace with your font file path)
  const font = useFont(require('../assets/fonts/SpaceMono-Regular.ttf'), 12);
  if (!font) return null; // Wait for the font to load

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.content}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>Water Usage Insights</Text>
        </View>

        <View style={styles.insightsContainer}>
          <Canvas style={{ width: '100%', height: 400 }}>
            <Rect x={0} y={0} width={420} height={200} color="#f0f0f0" />
            <Group>
              {waterUsageData.map((value, index) => (
                <RoundedRect
                  key={index}
                  x={index * 50 + 20}
                  y={150 - value}
                  width={30}
                  height={value}
                  r={10}
                  color="#34baeb"
                />
              ))}
              {daysOfWeek.map((day, index) => (
                <SkiaText
                  key={day}
                  x={index * 50 + 30}
                  y={175}
                  text={day}
                  font={font}
                  color="black"
                />
              ))}
            </Group>
          </Canvas>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  headerContainer: {
    height: '30%',
    backgroundColor: '#34baeb',
    padding: 20,
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  insightsContainer: {
    flex: 2,
    backgroundColor: 'white',
    marginTop: -30,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingVertical: 20,
    alignItems: 'center',
  },
});