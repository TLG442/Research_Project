import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const MicroGridInsights = () => {
  // Example values for solar production and battery storage
  const solarProduction = "5.2 kWh";
  const batteryStorage = "3.8 kWh";

  // Example hardcoded daily schedule
  const dailySchedule = [
    { source: "Solar", time: "6 AM - 8 AM" },
    { source: "Battery", time: "8 AM - 12 PM" },
    { source: "Grid", time: "12 PM - 4 PM" },
    { source: "Solar", time: "4 PM - 6 PM" },
    { source: "Battery", time: "6 PM - 10 PM" },
    { source: "Grid", time: "10 PM - 6 AM" },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Energy Production Section (Solar & Battery) */}
      <View style={styles.energyContainer}>
        <View style={[styles.energyBox, styles.solarBox]}>
          <MaterialCommunityIcons name="solar-power" size={36} color="black" />
          <Text style={styles.energyLabel}>Solar Generation</Text>
          <Text style={styles.energyValue}>{solarProduction}</Text>
        </View>
        <View style={[styles.energyBox, styles.batteryBox]}>
          <MaterialCommunityIcons
            name="battery-charging"
            size={36}
            color="black"
          />
          <Text style={styles.energyLabel}>Battery Storage</Text>
          <Text style={styles.energyValue}>{batteryStorage}</Text>
        </View>
      </View>

      {/* Daily Schedule Section */}
      <Text style={styles.sectionTitle}>Daily Energy Schedule</Text>
      <View style={styles.scheduleContainer}>
        {dailySchedule.map((entry, index) => (
          <View key={index} style={styles.scheduleBox}>
            <Text style={styles.scheduleText}>Source: {entry.source}</Text>
            <Text style={styles.scheduleText}>Time: {entry.time}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white", padding: 20 }, // Added marginTop

  // Energy Section Styles
  energyContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    marginTop: 20, // Added marginTop
  },
  energyBox: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 5,
    elevation: 4,
  },
  solarBox: { backgroundColor: "#FFDD44" },
  batteryBox: { backgroundColor: "#55AAFF" },
  energyLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginTop: 5,
  },
  energyValue: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 5,
    color: "#000",
  },

  // Schedule Section Styles
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 15,
    marginTop: 30, // Added margin-top
  },
  scheduleContainer: { marginTop: 10 },
  scheduleBox: {
    backgroundColor: "#EEF7FF",
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
  },
  scheduleText: { fontSize: 16, fontWeight: "500", color: "#333" },
});

export default MicroGridInsights;
