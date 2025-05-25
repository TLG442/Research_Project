import { useAppContext } from "@/context/AppContext";
import DatabaseHelper from "@/data/database";
import React, { useEffect , useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  PermissionsAndroid,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context"; // For handling safe areas
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import AsyncStorage from '@react-native-async-storage/async-storage';
const LightControl = () => {
  const { calibratedRooms, setCalibratedRooms } = useAppContext();
  const insets = useSafeAreaInsets();
   const [username, setUsername] = useState('user');
    const [greeting, setGreeting] = useState('Good Morning');
  const router = useRouter();

  const checkLocationPermissions = async () => {
    const { status, canAskAgain } =
      await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.error("Location permission not granted");
      if (canAskAgain) {
        const { status: newStatus } =
          await Location.requestForegroundPermissionsAsync();
        return newStatus === "granted";
      }
      return false;
    }
    return true;
  };
useEffect(() => {
    const fetchUsername = async () => {
      try {
        const email = await AsyncStorage.getItem('userEmail');
        if (email) {
          const usernamePart = email.split('@')[0];
          setUsername(usernamePart.charAt(0).toUpperCase() + usernamePart.slice(1));
        }
      } catch (error) {
        console.error('Error fetching username:', error);
      }
    };

    fetchUsername();

    // Update greeting based on current time
    const updateGreeting = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) {
        setGreeting('Good Morning');
      } else if (hour >= 12 && hour < 17) {
        setGreeting('Good Afternoon');
      } else if (hour >= 17 && hour < 22) {
        setGreeting('Good Evening');
      } else {
        setGreeting('Good Night');
      }
    };

    updateGreeting(); // Set initial greeting
    const interval = setInterval(updateGreeting, 60000); // Update every minute
    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  useEffect(() => {
    const checkPermissions = async () => {
      const hasPermission = await checkLocationPermissions();
      if (!hasPermission) {
        console.error("Location permission not granted");
      }
    };
    checkPermissions();
    DatabaseHelper.createTables();
    DatabaseHelper.getCalibratedRooms().then((rooms) => {
      setCalibratedRooms(rooms);
    });
  }, []);

  const isCalibratedRoomsEmpty = calibratedRooms.length === 0;

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
           <Text style={styles.goodMorning}>{greeting},</Text>
           <Text style={styles.userName}>{username}</Text>
        </View>
        <View style={styles.headerIcons}>
     
          <TouchableOpacity>
            <Image
              source={require("../../assets/images/settings_iccon-removebg-preview.png")}
              style={styles.icon}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View>
        <Text style={styles.calibrationOptionTitle}>Calibration Options</Text>
        <View style={styles.calibrationOptionsContainer}>
          <TouchableOpacity
            onPress={() => {
              router.push("../light_control/room_input");
            }}
            style={styles.flexOne}
          >
            <View style={styles.calibrationOptionCard}>
              <Image
                source={require("../../assets/images/Rect1.png")}
                style={styles.rect1}
              />
              <Image
                source={require("../../assets/images/Rect2Icon.png")}
                style={styles.rect1Icon}
              />
              <Text style={styles.calibrationOptionCardText}>
                Calibrate Rooms
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            disabled={isCalibratedRoomsEmpty}
            style={{
              ...styles.flexOne,
              opacity: isCalibratedRoomsEmpty ? 0.5 : 1, // Disable opacity if empty
            }}
          >
            <View style={styles.calibrationOptionCard}>
              <Image
                source={require("../../assets/images/Rect2.png")}
                style={styles.rect1}
              />
              <Image
                source={require("../../assets/images/Rect1Icon.png")}
                style={styles.rect1Icon}
              />
              <Text style={styles.calibrationOptionCardText}>
                Use Calibrated Rooms
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View>
        <Text style={styles.smartPredictionTitle}>Smart Prediction</Text>
        <View style={styles.smartPredictionContainer}>
          <View style={styles.smartPredictionCard}>
            <View style={styles.smartPredictionHeader}>
              <View>
                <Text style={styles.roomText}>🏡 Room: Living Room</Text>
                <Text style={styles.suggestedActionText}>
                  ⚡️ Suggested Action: Turn off in 2m 5s
                </Text>
              </View>
              <View>
                <Text style={styles.lightStatusText}>💡 On</Text>
              </View>
            </View>
            <View style={styles.centeredRow}>
              <TouchableOpacity style={styles.roomSetupButton}>
                <Text style={styles.roomSetupButtonText}>⚙️ Room Setup</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white", // Light gray background
    paddingHorizontal: 20, // Consistent horizontal padding
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between", // Space between text and icons
    alignItems: "center", // Vertically center
    marginTop: 20, // Top margin
    marginBottom: 20,
  },
  headerTextContainer: {
    flexDirection: "column", // Text stacked vertically
  },
  calibrationOptionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333", // Dark gray
  },
  calibrationOptionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between", // Space between options
    marginTop: 14, // Space above options
  },
  calibrationOptionCard: {
    backgroundColor: "white",
    borderRadius: 10, // Rounded corners
    padding: 20,
    marginBottom: 20,
    marginHorizontal: 5, // Add horizontal margin for spacing
    height: 150,
    elevation: 3, // For Android shadow (works well with elevation)
    shadowColor: "#000", // For iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    display: "flex", // Ensure it behaves like a flex container
    justifyContent: "flex-end", // Center the text
    alignItems: "center", // Center the text
    overflow: "hidden", // Ensure SVG stays within card bounds
  },
  rect1: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 180,
    height: 150,
    resizeMode: "cover", // Adjust as needed
  },
  rect1Icon: {
    position: "absolute",
    top: 12,
    left: 12,
    width: 30,
    height: 30,
  },
  calibrationOptionCardText: {
    fontSize: 16,
    color: "#fff", // Dark gray
    textAlign: "center", // Center the text
    fontWeight: "bold", // Bold text
    flexWrap: "wrap", // Ensure text wraps within the card
  },
  smartPredictionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333", // Dark gray
    marginTop: 20,
  },
  goodMorning: {
    fontSize: 16,
    color: "#777", // Slightly darker gray
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333", // Dark gray
  },
  headerIcons: {
    flexDirection: "row", // Icons in a row
  },

  waveContainer: {
    height: 100, // Height of the wave area
    overflow: "hidden", // Hide the wave as it moves out of the container
  },
  waveContainer1: {
    height: 200, // Height of the wave area
    overflow: "hidden", // Hide the wave as it moves out of the container
  },
  wave: {
    width: 400, // Width of the wave (should be larger than container)
    height: 100, // Height of the wave
    backgroundColor: "lightblue", // Color of the wave
    // You can use a more complex wave shape with SVG or images if needed.
  },
  icon: {
    width: 30,
    height: 30,
    marginLeft: 10, // Space between icons
  },
  card: {
    backgroundColor: "white",
    borderRadius: 10, // Rounded corners
    padding: 20,
    marginBottom: 20,
    elevation: 3, // For Android shadow (works well with elevation)
    shadowColor: "#000", // For iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cardContent: {
    flexDirection: "column", // Align content vertically
  },
  flowRate: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#333",
  },
  flowLabel: {
    fontSize: 16,
    color: "#777",
    marginBottom: 10,
  },
  waterPumpContainer: {
    flexDirection: "row",
    alignItems: "center", // Align switch and label
  },
  waterPumpLabel: {
    fontSize: 16,
    color: "#333",
    marginRight: 10,
  },
  waveImage: {
    width: "100%",
    height: 100, // Adjust as needed
    marginTop: 10, // Space between content and image
  },
  canvas: {
    flex: 1,
  },
  leakStatus: {
    fontSize: 18,
    color: "#333",
    textAlign: "center", // Center the text
  },
  insightsButton: {
    backgroundColor: "#34baeb", // Blue button
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    marginBottom: 10,
    width: 300,
    alignSelf: "center", // Centers the button horizontally
  },

  insightsButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  insightsLabel: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
    marginBottom: 20,
  },
  navBar: {
    flexDirection: "row",
    justifyContent: "space-around", // Distribute buttons evenly
    backgroundColor: "white",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  navButton: {
    alignItems: "center", // Center icon and text
  },
  navIcon: {
    width: 25,
    height: 25,
    marginBottom: 5,
  },
  navButtonText: {
    fontSize: 14,
    color: "#333",
  },
  flexOne: {
    flex: 1,
  },
  smartPredictionContainer: {
    marginTop: 10,
  },
  smartPredictionCard: {
    backgroundColor: "#223888",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 25,
  },
  smartPredictionHeader: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  roomText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  suggestedActionText: {
    marginTop: 5,
    color: "white",
  },
  lightStatusText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  centeredRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
  },
  roomSetupButton: {
    backgroundColor: "#34baeb",
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    marginTop: 30,
    width: 300,
  },
  roomSetupButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default LightControl;
