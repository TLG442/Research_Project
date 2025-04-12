import { Stack, useRouter } from "expo-router";
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

const CalibrateRooms: React.FC = () => {
  const [roomCount, setRoomCount] = React.useState("");
  const MAX_ROOMS = 10; // Set the maximum number of rooms

  const handleRoomCountChange = (text: string) => {
    const numericValue = parseInt(text, 10);
    if (
      !isNaN(numericValue) &&
      numericValue >= 1 &&
      numericValue <= MAX_ROOMS
    ) {
      setRoomCount(text);
    } else if (text === "") {
      setRoomCount(text); // Allow clearing the input
    }
  };

  const router = useRouter();

  const handleNext = () => {
    router.push({
      pathname: "/light_control/room_setup",
      params: { roomCount: parseInt(roomCount, 10) },
    });
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <Stack.Screen
            options={{
              headerBackVisible: true,
              headerBackTitle: "Back",
              headerShown: true,
              title: "Setup Rooms",
              headerTitleAlign: "center",
            }}
          />
          <Image
            source={require("../../assets/images/setup_room.png")}
            style={styles.image}
          />
          <Text style={styles.title}>
            Let's get started! How many rooms should we set up?
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter the number of rooms"
            keyboardType="numeric"
            value={roomCount}
            onChangeText={handleRoomCountChange}
          />
          <Text style={styles.hint}>
            Please enter a number between 1 and {MAX_ROOMS}.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={handleNext}
            disabled={!roomCount || parseInt(roomCount, 10) < 1}
          >
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    paddingBottom: 40, // Ensure enough padding for the button
  },
  text: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    width: "80%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#34baeb",
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 80,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  image: {
    width: "50%", // Half of the screen width
    height: undefined, // Maintain aspect ratio
    aspectRatio: 1, // Square image
    marginBottom: 20,
  },
  hint: {
    fontSize: 14,
    color: "#777",
    marginBottom: 20,
    textAlign: "center",
  },
});

export default CalibrateRooms;
