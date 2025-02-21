import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

const electric_usage = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const devices = [
    {
      name: "Lamp",
      power: "1000 Kw/h",
      location: "Kitchen-Bedroom",
      change: "-12%",
      duration: "8 Unit 12 Jam",
    },
    {
      name: "Air Conditioner",
      power: "1000 Kw/h",
      location: "Living Room",
      change: "-10.2%",
      duration: "8 Unit 12 Jam",
    },
    {
      name: "Wireless Speaker",
      power: "1000 Kw/h",
      location: "Bedroom",
      change: "-10.2%",
      duration: "4 Unit 3 Jam",
    },
    {
      name: "Television",
      power: "1000 Kw/h",
      location: "Living Room",
      change: "-100.2%",
      duration: "Unit 12 Jam",
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Power Usage</Text>
      </View>

      <View style={styles.cardsContainer}>
        {/* Usage This Week */}
        <View style={styles.card}>
          <MaterialCommunityIcons
            name="flash-outline"
            size={32}
            color="#FFA500"
          />
          <Text style={styles.cardTitle}>Usage this Week</Text>
          <Text style={styles.cardValue}>2500 Wm</Text>
          <Text style={styles.cardStatus}>Low</Text>
        </View>

        {/* Total Today */}
        <View style={styles.card}>
          <MaterialCommunityIcons
            name="calendar-today"
            size={32}
            color="#1E90FF"
          />
          <Text style={styles.cardTitle}>Total Today</Text>
          <Text style={styles.cardValue}>2500 Wm</Text>
          <Text style={styles.cardStatus}>Low</Text>
        </View>
      </View>

      {/* Navigate to Insights */}
      <TouchableOpacity
        style={styles.insights}
        onPress={() => router.push("../electric_usage_insights")}
      >
        <Text style={styles.insightsText}>Insights</Text>
      </TouchableOpacity>

      <View style={styles.devicesContainer}>
        {devices.map((device, index) => (
          <View key={index} style={styles.deviceCard}>
            <View style={styles.deviceHeader}>
              <Text style={styles.deviceName}>{device.name}</Text>
              <Text style={styles.devicePower}>{device.power}</Text>
            </View>

            <View style={styles.deviceDetails}>
              <Text style={styles.deviceLocation}>{device.location}</Text>
              <Text style={styles.deviceChange}>{device.change}</Text>
            </View>

            <Text style={styles.deviceDuration}>{device.duration}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white", paddingHorizontal: 20 },
  header: { marginVertical: 24 },
  title: { fontSize: 24, fontWeight: "bold", color: "#333" },
  cardsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    padding: 16,
    width: "48%",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: { fontSize: 14, color: "#666", marginTop: 8 },
  cardValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginVertical: 4,
  },
  cardStatus: { fontSize: 14, color: "#4CAF50" },
  insights: { alignSelf: "flex-end", marginBottom: 16 },
  insightsText: { color: "#34baeb", fontWeight: "500" },
  devicesContainer: { flex: 1 },
  deviceCard: {
    backgroundColor: "#EEF7FF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  deviceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  deviceName: { fontSize: 16, fontWeight: "600", color: "#333" },
  devicePower: { fontSize: 14, color: "#666" },
  deviceDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  deviceLocation: { fontSize: 14, color: "#666" },
  deviceChange: { fontSize: 14, color: "#FF5252" },
  deviceDuration: { fontSize: 12, color: "#999" },
});

export default electric_usage;
