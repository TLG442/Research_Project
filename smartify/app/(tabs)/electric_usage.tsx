import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

const electric_usage = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();

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

      {/* Total Power Consumption (Emphasized) */}
      <View style={styles.totalPowerContainer}>
        <MaterialCommunityIcons name="power-plug" size={48} color="#FF6347" />
        <Text style={styles.totalPowerTitle}>Total Power Consumption</Text>
        <Text style={styles.totalPowerValue}>10,500 Wm</Text>
      </View>

      <View style={styles.cardsContainer}>
        {/* Ampere */}
        <View style={styles.card}>
          <MaterialCommunityIcons
            name="transmission-tower"
            size={32}
            color="#FFA500"
          />
          <Text style={styles.cardTitle}>Ampere</Text>
          <Text style={styles.cardValue}>2500 Wm</Text>
          <Text style={styles.cardStatus}>Low</Text>
        </View>

        {/* Voltage */}
        <View style={styles.card}>
          <MaterialCommunityIcons name="flash" size={32} color="#1E90FF" />
          <Text style={styles.cardTitle}>Voltage</Text>
          <Text style={styles.cardValue}>2500 V</Text>
          <Text style={styles.cardStatus}>Low</Text>
        </View>
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
  totalPowerContainer: {
    backgroundColor: "#FFEBEE",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40, // Added extra space here
  },
  totalPowerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF6347",
    marginTop: 8,
  },
  totalPowerValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FF6347",
    marginVertical: 4,
  },
  monthlyContainer: { marginTop: 24 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  monthlyCard: {
    backgroundColor: "#EEF7FF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomCard: {
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    padding: 16,
    width: "48%",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default electric_usage;
