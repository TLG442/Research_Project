import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Device {
  name: string;
  isActive: boolean;
}

const meterId = "s12"; // 🔑 Replace with dynamic ID if needed

const ManageDevices = () => {
  const insets = useSafeAreaInsets();
  const [devices, setDevices] = useState<Device[]>([]);
  const [newDevice, setNewDevice] = useState("");

  // 🔽 Fetch devices when component mounts
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await fetch(
          `https://uwvq4x41e4.execute-api.ap-south-1.amazonaws.com/prod/devices?meterId=${meterId}`
        );
        const json = await response.json();
        if (json.devices) {
          setDevices(json.devices);
        }
      } catch (error) {
        console.error("Error fetching devices:", error);
      }
    };

    fetchDevices();
  }, []);

  const addDevice = () => {
    if (newDevice.trim() !== "") {
      setDevices([...devices, { name: newDevice.trim(), isActive: true }]);
      setNewDevice("");
    }
  };

  const removeDevice = (index: number) => {
    const updated = [...devices];
    updated.splice(index, 1);
    setDevices(updated);
  };

  const toggleStatus = (index: number) => {
    const updated = [...devices];
    updated[index].isActive = !updated[index].isActive;
    setDevices(updated);
  };

  const saveDevices = async () => {
    try {
      const response = await fetch(
        "https://uwvq4x41e4.execute-api.ap-south-1.amazonaws.com/prod/devices",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            meterId,
            devices,
          }),
        }
      );

      const result = await response.json();
      console.log("Save response:", result);
      alert("Devices saved successfully!");
    } catch (error) {
      console.error("Error saving devices:", error);
      alert("Failed to save devices.");
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.title}>Manage Your Devices</Text>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="New device name"
          value={newDevice}
          onChangeText={setNewDevice}
        />
        <TouchableOpacity onPress={addDevice} style={styles.addButton}>
          <Text style={{ color: "white" }}>Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={devices}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item, index }) => (
          <View
            style={[
              styles.deviceItem,
              {
                backgroundColor: item.isActive ? "#e0ffe0" : "#ffe0e0",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              },
            ]}
          >
            <TouchableOpacity
              onPress={() => toggleStatus(index)}
              style={styles.deviceInfo}
            >
              <Text style={styles.deviceText}>
                {item.name} ({item.isActive ? "Active" : "Inactive"})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => removeDevice(index)}>
              <Text style={styles.deleteText}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <TouchableOpacity style={styles.saveButton} onPress={saveDevices}>
        <Text style={{ color: "white", fontWeight: "bold" }}>Save</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, backgroundColor: "white" },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1c1c1e",
    marginBottom: 20,
    textAlign: "center",
  },
  inputRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  input: {
    flex: 1,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
  },
  addButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 8,
  },
  deviceItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  deviceInfo: {
    flex: 1,
    marginRight: 10,
  },

  deviceText: { fontSize: 16 },
  saveButton: {
    marginTop: 20,
    marginBottom: 30,
    backgroundColor: "#28a745",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  deleteText: {
    color: "red",
    marginLeft: 10,
    fontWeight: "bold",
  },
});

export default ManageDevices;
