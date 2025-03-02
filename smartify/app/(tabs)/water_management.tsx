import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, Image, TouchableOpacity , Animated , Dimensions ,PanResponder ,PanResponderGestureState  } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // For handling safe areas

import Svg, { Path, LinearGradient, Stop, Defs } from 'react-native-svg';
import { useRouter } from 'expo-router';
const { width, height } = Dimensions.get('window');
const FREQUENCY = 7;
const INITIAL_AMPLITUDE = 20;
const INITIAL_VERTICAL_OFFSET = 100;
const water_management = () => {
  const insets = useSafeAreaInsets();
  const waveAnim = useRef(new Animated.Value(0)).current; // Initial position
  const animation = useRef(new Animated.Value(0)).current;
  const verticalOffset = useRef(new Animated.Value(INITIAL_VERTICAL_OFFSET)).current;
  const amplitude = useRef(new Animated.Value(INITIAL_AMPLITUDE)).current;

  const createWavePath = (animationValue: number): Animated.AnimatedInterpolation<string> => {
    return Animated.add(
      verticalOffset,
      Animated.multiply(
        amplitude,
        new Animated.Value(Math.sin(animationValue * Math.PI * FREQUENCY))
      )
    ).interpolate({
      inputRange: [0, height],
      outputRange: [0, height],
      extrapolate: 'clamp'
    });
  };

  const animatedPath: Animated.AnimatedInterpolation<string> = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [
      `M0,${INITIAL_VERTICAL_OFFSET} 
       Q${width/4},${INITIAL_VERTICAL_OFFSET + INITIAL_AMPLITUDE} 
       ${width/2},${INITIAL_VERTICAL_OFFSET} 
       T${width},${INITIAL_VERTICAL_OFFSET} 
       L${width},${height} 
       L0,${height} Z`,
      
      `M0,${INITIAL_VERTICAL_OFFSET} 
       Q${width/4},${INITIAL_VERTICAL_OFFSET - INITIAL_AMPLITUDE} 
       ${width/2},${INITIAL_VERTICAL_OFFSET} 
       T${width},${INITIAL_VERTICAL_OFFSET} 
       L${width},${height} 
       L0,${height} Z`
    ]
  });

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState: PanResponderGestureState) => {
      const { moveY } = gestureState;
      if (moveY > INITIAL_VERTICAL_OFFSET) {
        verticalOffset.setValue(Math.min(height, moveY));
        const newAmplitude = Math.max(0, (height - moveY) * 0.025);
        amplitude.setValue(newAmplitude);
      }
    }
  });
  useEffect(() => {
    const animate = (): void => {
      Animated.sequence([
        Animated.timing(animation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true
        }),
        Animated.timing(animation, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true
        })
      ]).start(() => animate());
    };

    animate();
  }, []);


  const AnimatedPath = Animated.createAnimatedComponent(Path);
  const AnimatedSvg = Animated.createAnimatedComponent(Svg);
  const router = useRouter();
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

        <View style={styles.waveContainer1} {...panResponder.panHandlers}>
      <AnimatedSvg style={styles.canvas} width={width} height={height}>
        <Defs>
          <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="cyan" stopOpacity="1" />
            <Stop offset="1" stopColor="blue" stopOpacity="1" />
          </LinearGradient>
        </Defs>
        <AnimatedPath
          d={animatedPath}
          fill="url(#grad)"
        />
      </AnimatedSvg>
      
    </View>
       
       
   </View>

   <View style={styles.card1}>
  <View style={styles.cardContent}> {/* Content container */}
    <Text>
      <Text style={styles.LeakStatusHeader}>Leak status: </Text>
      <Text style={styles.leakdata}>leak in the system</Text>
    </Text>
    <Text>
      <Text style={styles.LeakStatusHeader}>Leak category: </Text>
      <Text style={styles.leakdata}>Gasket leak</Text>
    </Text>
    <Text>
      <Text style={styles.LeakStatusHeader}>Severity: </Text>
      <Text style={styles.leakdata}>High</Text>
    </Text>
  </View>
</View>


      
      <TouchableOpacity style={styles.insightsButton} onPress={() => router.push('../water-usag-insights')}>
        <Text style={styles.insightsButtonText}  >Water usage Insights</Text>
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
  waveContainer1: {
    height: 200, // Height of the wave area
    overflow: 'hidden',
    borderRadius: 20, // Hide the wave as it moves out of the container
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
    backgroundColor: '#e1e3e6',
    borderRadius: 20, // Rounded corners
    padding: 20,
    marginBottom: 20,
    elevation: 3, // For Android shadow (works well with elevation)
    shadowColor: '#000', // For iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  card1: {
    backgroundColor: '#f0d8a2',
    borderRadius: 20, // Rounded corners
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
  LeakStatusHeader: {
    fontSize: 19,
    fontWeight: '600', // Semi-bold
    color: '#333', // Light grey color
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
  leakdata: {
    fontSize: 16,
    color: '#333',
    marginRight: 10,
  },
  waveImage: {
    width: '100%',
    height: 100, // Adjust as needed
    marginTop: 10, // Space between content and image
  },
  canvas: {
    flex:1
},
  leakStatus: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center', // Center the text
  },
  insightsButton: {
    backgroundColor: '#34baeb', // Blue button
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 10,
    width: 250,
    alignSelf: 'center', // Centers the button horizontally
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

export default water_management;