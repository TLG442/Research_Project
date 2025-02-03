import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, Image, TouchableOpacity , Animated  } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // For handling safe areas
import Svg, { Path } from 'react-native-svg';


const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const waveAnim = useRef(new Animated.Value(0)).current; // Initial position

  useEffect(() => {
    Animated.loop(
      Animated.timing(waveAnim, {
        toValue: -1440, // Move wave to the left (adjust as needed for smoother transition)
        duration: 1000, // Duration of one loop cycle (adjust for smoother animation)
     
       // Correct easing function
        useNativeDriver: true, // Optimize for performance
      })
    ).start();
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTextContainer}> {/* Added container for text */}
          <Text style={styles.goodMorning}>Good Morning,</Text>
          <Text style={styles.userName}>Tharuka</Text>
        </View>
        <View style={styles.headerIcons}> {/* Container for icons */}
          <TouchableOpacity>
            <Image source={require('../../assets/images/bell.png')} style={styles.icon} /> {/* Replace with your bell icon path */}
          </TouchableOpacity>
          <TouchableOpacity>
            <Image source={require('../../assets/images/settings_iccon-removebg-preview.png')} style={styles.icon} /> {/* Replace with your settings icon path */}
          </TouchableOpacity>
        </View>
      </View>

      {/* Water Flow Card */}
      <View style={styles.card}>
        <View style={styles.cardContent}> {/* Content container */}
          <Text style={styles.flowRate}>30 LPM</Text>
          <Text style={styles.flowLabel}>Current flow rate</Text>
          <View style={styles.waterPumpContainer}> {/* Water pump and switch container */}
            <Text style={styles.waterPumpLabel}>Water pump</Text>
            <Switch />
          </View>
        </View>
        {/* Wave Image - You'll need to adjust the path */}
        <View style={styles.waveContainer}>
     
        </View>
      </View>

      {/* Leak Status Card */}
      <View style={styles.waveContainer}>
  
</View>


      {/* Insights Button */}
      <TouchableOpacity style={styles.insightsButton}>
        <Text style={styles.insightsButtonText}>Water usage Insights</Text>
      </TouchableOpacity>
      <Text style={styles.insightsLabel}>Track your water usage and detect patterns over time.</Text>

     
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white', // Light gray background
    paddingHorizontal: 20, // Consistent horizontal padding
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Space between text and icons
    alignItems: 'center', // Vertically center
    marginTop: 20, // Top margin
    marginBottom: 20,
  },
  headerTextContainer: {
    flexDirection: 'column', // Text stacked vertically
  },
  goodMorning: {
    fontSize: 16,
    color: '#777', // Slightly darker gray
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333', // Dark gray
  },
  headerIcons: {
    flexDirection: 'row', // Icons in a row
  },
  
  waveContainer: {
    height: 100, // Height of the wave area
    overflow: 'hidden', // Hide the wave as it moves out of the container
  },
  wave: {
    width: 400, // Width of the wave (should be larger than container)
    height: 100, // Height of the wave
    backgroundColor: 'lightblue', // Color of the wave
    // You can use a more complex wave shape with SVG or images if needed.
  },
  icon: {
    width: 30,
    height: 30,
    marginLeft: 10, // Space between icons
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10, // Rounded corners
    padding: 20,
    marginBottom: 20,
    elevation: 3, // For Android shadow (works well with elevation)
    shadowColor: '#000', // For iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cardContent: {
    flexDirection: 'column', // Align content vertically
  },
  flowRate: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
  },
  flowLabel: {
    fontSize: 16,
    color: '#777',
    marginBottom: 10,
  },
  waterPumpContainer: {
    flexDirection: 'row',
    alignItems: 'center', // Align switch and label
  },
  waterPumpLabel: {
    fontSize: 16,
    color: '#333',
    marginRight: 10,
  },
  waveImage: {
    width: '100%',
    height: 100, // Adjust as needed
    marginTop: 10, // Space between content and image
  },
  leakStatus: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center', // Center the text
  },
  insightsButton: {
    backgroundColor: '#007AFF', // Blue button
    borderRadius: 23,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 10,
  },
  insightsButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  insightsLabel: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    marginBottom: 20,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around', // Distribute buttons evenly
    backgroundColor: 'white',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  navButton: {
    alignItems: 'center', // Center icon and text
  },
  navIcon: {
    width: 25,
    height: 25,
    marginBottom: 5,
  },
  navButtonText: {
    fontSize: 14,
    color: '#333',
  },
});

export default HomeScreen;