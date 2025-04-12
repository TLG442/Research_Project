import { Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
} from "react-native";
import Geolocation from "react-native-geolocation-service";

const RoomSetup: React.FC = () => {
  const { roomCount } = useLocalSearchParams();
  const count = parseInt(roomCount as string, 10) || 0;
  const [roomNames, setRoomNames] = useState<string[]>(Array(count).fill(""));
  const [currentCoordinates, setCurrentCoordinates] = useState({
    latitude: 0,
    longitude: 0,
  });

  const handleRoomNameChange = (index: number, name: string) => {
    const updatedRoomNames = [...roomNames];
    updatedRoomNames[index] = name;
    setRoomNames(updatedRoomNames);
  };

  useEffect(() => {
    Geolocation.requestAuthorization("always");
    Geolocation.getCurrentPosition(
      (position) => {
        console.log("Current Position:", position);
        setCurrentCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.error("Error getting location:", error);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  }, []);

  const renderRoomItem = ({ item, index }: { item: string; index: number }) => (
    <View style={styles.roomItem}>
      <Text style={styles.heading}>Room {index + 1}</Text>
      <TextInput
        style={styles.input}
        placeholder={`Room ${index + 1} Name`}
        value={roomNames[index]}
        onChangeText={(text) => handleRoomNameChange(index, text)}
      />
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}
      >
        <Text style={styles.coordinatesText}>Range: </Text>
        <Text
          style={{
            color: "#8d8d8d", // Red for not calibrated
          }}
        >
          Not Calibrated
        </Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => console.log(`Start calibration for Room ${index + 1}`)}
        >
          <Text style={styles.buttonText}>Start Calibration</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ ...styles.button, ...styles.stopButton }}
          onPress={() => console.log(`Stop calibration for Room ${index + 1}`)}
        >
          <Text style={styles.buttonText}>Stop</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerBackVisible: true,
          headerBackTitle: "Back",
          headerShown: true,
          title: "Calibrate Rooms",
          headerTitleAlign: "center",
        }}
      />

      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 5 }}>
          Current Coordinates:
        </Text>
        <Text style={{ fontSize: 14, color: "#555" }}>
          Latitude: {currentCoordinates.latitude || "Not Available"}
        </Text>
        <Text style={{ fontSize: 14, color: "#555" }}>
          Longitude: {currentCoordinates.longitude || "Not Available"}
        </Text>
      </View>
      <FlatList
        data={roomNames}
        renderItem={renderRoomItem}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5", // Match background color with room_input.tsx
    padding: 16,
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333", // Dark gray for consistency
    textAlign: "left",
    marginBottom: 20,
  },
  listContainer: {
    paddingBottom: 16,
  },
  roomItem: {
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10, // Match rounded corners
    backgroundColor: "#fff", // White background for cards
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10, // Match rounded corners
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#fff", // White background for inputs
  },
  coordinatesText: {
    fontSize: 14,
    color: "#555", // Subtle gray for text
    // marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10, // Add spacing above buttons
  },
  button: {
    backgroundColor: "#34baeb",
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    // marginBottom: 80,
    alignItems: "center",
  },
  stopButton: {
    backgroundColor: "#ff4d4d", // Red for stop button
  },
  buttonText: {
    color: "white", // White text for contrast
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default RoomSetup;
