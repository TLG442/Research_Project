import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  Image,
  TouchableOpacity,
  Animated,
  Dimensions,
  PanResponder,
  PanResponderGestureState,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, LinearGradient, Stop, Defs } from 'react-native-svg';
import { useRouter } from 'expo-router';



const { width, height } = Dimensions.get('window');
const FREQUENCY = 7;
const INITIAL_AMPLITUDE = 20;
const INITIAL_VERTICAL_OFFSET = 100;

const water_management = () => {
  const insets = useSafeAreaInsets();
  const waveAnim = useRef(new Animated.Value(0)).current;
  const animation = useRef(new Animated.Value(0)).current;
  const verticalOffset = useRef(new Animated.Value(INITIAL_VERTICAL_OFFSET)).current;
  const amplitude = useRef(new Animated.Value(INITIAL_AMPLITUDE)).current;
  const router = useRouter();
  const [isPumpOn, setIsPumpOn] = useState(false);
  const [flowRate, setFlowRate] = useState(0);
  const [refreshing, setRefreshing] = useState(false); // State for refresh indicator
  const [leakStatus, setLeakStatus] = useState({ status: '', category: '' , severity : ""});
  const [pressureDatastatus, setpressureDatastatus] = useState('');
  // Fetch data from the API
  const fetchFlowData = async () => {
    try {
      const response = await fetch('https://04ss9x7lah.execute-api.eu-north-1.amazonaws.com/dev');
      const data = await response.json();
      const parsedBody = JSON.parse(data.body);
      const flowMlPerSecond = parsedBody.flow_ml_s;
      setFlowRate(flowMlPerSecond);
    } catch (error) {
      console.error('Error fetching flow data:', error);
    }
  };

  const fetchPressuredata = async () => {
    try {
      const response = await fetch('https://oqyqqcdzli.execute-api.eu-north-1.amazonaws.com/dev');
      const data = await response.json();
      const parsedBody = JSON.parse(data.body);
      console.log(parsedBody); 
      
      if(parsedBody.message === 'No pressure values found in DynamoDB') {
        setpressureDatastatus('No pressure values detected');
      } else {
        // Check if pressure_values exists and is an array
        if (parsedBody.pressure_values && Array.isArray(parsedBody.pressure_values)) {
          try {
            const classifyResponse = await fetch('https://researchmodelhosting.uc.r.appspot.com/classify_leak', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                values: parsedBody.pressure_values,
                topology: 1.0,
                sensor: 1.0
              }),
            });
            
            const classifyData = await classifyResponse.json();
            // Set status based on classification result
            // Adjust this based on your actual response structure
            setpressureDatastatus(classifyData.leak_status || 'Pressure data processed');
            
          } catch (classificationError) {
            console.error('Error classifying leak:', classificationError);
            setpressureDatastatus('Error processing pressure data');
          }
        } else {
          setpressureDatastatus('Invalid pressure data format');
        }
      }
    } catch (error) {
      console.error('Error fetching pressure data:', error);
      setpressureDatastatus('Error fetching data');
    }
  };


  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFlowData(); 
    await fetchPressuredata();// Make the API call
    setRefreshing(false);
  };

  // Initial fetch and interval
  useEffect(() => {
    fetchFlowData();
    const interval = setInterval(fetchFlowData, 3000); // Every 20 seconds

    return () => clearInterval(interval);
  }, []);

  const flowLPM = (flowRate / 1000) * 60;

  const animatedPath = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [
      `M0,${INITIAL_VERTICAL_OFFSET} 
       Q${width / 4},${INITIAL_VERTICAL_OFFSET + INITIAL_AMPLITUDE} 
       ${width / 2},${INITIAL_VERTICAL_OFFSET} 
       T${width},${INITIAL_VERTICAL_OFFSET} 
       L${width},${height} 
       L0,${height} Z`,
      `M0,${INITIAL_VERTICAL_OFFSET} 
       Q${width / 4},${INITIAL_VERTICAL_OFFSET - INITIAL_AMPLITUDE} 
       ${width / 2},${INITIAL_VERTICAL_OFFSET} 
       T${width},${INITIAL_VERTICAL_OFFSET} 
       L${width},${height} 
       L0,${height} Z`,
    ],
  });

  const sendPumpControl = async (metrics: number) => {
    try {
      const response = await fetch('https://t73yk0ldda.execute-api.eu-north-1.amazonaws.com/dev/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metrics: metrics,
        }),
      });
      const result = await response.json();
      console.log(`Pump control response (metrics=${metrics}):`, result);
    } catch (error) {
      console.error(`Error sending pump control (metrics=${metrics}):`, error);
    }
  };

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState: PanResponderGestureState) => {
      const { moveY } = gestureState;
      if (moveY > INITIAL_VERTICAL_OFFSET) {
        verticalOffset.setValue(Math.min(height, moveY));
        const newAmplitude = Math.max(0, (height - moveY) * 0.025);
        amplitude.setValue(newAmplitude);
      }
    },
  });

  const handleSwitchToggle = (value: boolean) => {
    setIsPumpOn(value);
    if (value) {
      sendPumpControl(45);
    } else {
      sendPumpControl(75);
    }
  };

  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.timing(animation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animation, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => animate());
    };
    animate();
  }, []);

  const AnimatedPath = Animated.createAnimatedComponent(Path);
  const AnimatedSvg = Animated.createAnimatedComponent(Svg);

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.goodMorning}>Good Morning,</Text>
          <Text style={styles.userName}>Tharuka</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity>
            <Image source={require('../../assets/images/bell.png')} style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Image source={require('../../assets/images/settings_iccon-removebg-preview.png')} style={styles.icon} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardContent}>
          <Text style={styles.flowRate}>{flowLPM.toFixed(2)} LPS</Text>
          <Text style={styles.flowLabel}>Current flow rate</Text>
          <View style={styles.waterPumpContainer}>
            <Text style={styles.waterPumpLabel}>Water pump</Text>
            <Switch onValueChange={handleSwitchToggle} value={isPumpOn} />
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
            <AnimatedPath d={animatedPath} fill="url(#grad)" />
          </AnimatedSvg>
        </View>
      </View>


<TouchableOpacity style={styles.card1} onPress={() => router.push('../leak-details')}>
  <View style={styles.cardContent}>
    <Text>
      <Text style={styles.LeakStatusHeader}>Leak status: </Text>
      <Text style={styles.leakdata}>{leakStatus.status}</Text>
    </Text>
    <Text>
      <Text style={styles.LeakStatusHeader}>Leak category: </Text>
      <Text style={styles.leakdata}>{leakStatus.category}</Text>
    </Text>
    <Text>
      <Text style={styles.LeakStatusHeader}>Severity: </Text>
      <Text style={styles.leakdata}>{leakStatus.severity}</Text>
    </Text>
    <Text>
      <Text style={styles.LeakStatusHeader1}>{pressureDatastatus}</Text>
    </Text>
  </View>
</TouchableOpacity>

      <TouchableOpacity style={styles.insightsButton} onPress={() => router.push('../water-usag-insights')}>
        <Text style={styles.insightsButtonText}>Water usage Insights</Text>
      </TouchableOpacity>
      <Text style={styles.insightsLabel}>Track your water usage and detect patterns over time.</Text>
    </ScrollView>
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
  cardContent: {
    flexDirection: 'column', // Align content vertically
  },
  flowRate: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
  },
  LeakStatusHeader: {
    fontSize: 18,
    fontWeight: '600', // Semi-bold
    color: '#333', // Light grey color
  },
  LeakStatusHeader1: {
    alignItems: 'center',
    fontSize: 18,
    fontWeight: '600', // Semi-bold
    color: 'black', // Light grey color
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
    width: 230,
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