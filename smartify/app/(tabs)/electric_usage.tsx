import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

const API_URL =
  "https://9hktsjh3i1.execute-api.ap-south-1.amazonaws.com/smartmeter-total-consumption/smartmeter?meterid=s12";

const ElectricUsage = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  interface Data {
    energyConsumed: number;
    voltage: number;
    current: number;
  }

  // Example prompt based on past hour data
  const insightsPrompt =
    "Your energy consumption has increased by 15% in the last hour. Consider turning off unused appliances.";

  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to fetch data
  const fetchData = async () => {
    try {
      const response = await fetch(API_URL);
      const result = await response.json();
      setData(result.payload);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  // Fetch data every 10 seconds
  useEffect(() => {
    fetchData(); // Initial fetch
    const interval = setInterval(fetchData, 1000); // Fetch every 10s

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Power Usage</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#FF6347" />
      ) : (
        <>
          <View style={styles.cardsContainer}>
            {/* Current flow */}
            <View style={styles.card}>
              <MaterialCommunityIcons
                name="flash-outline"
                size={32}
                color="#FFA500"
              />
              <Text style={styles.cardTitle}>Current</Text>
              <Text style={styles.cardValue}>{data?.current || "0.00"} A</Text>
              <Text style={styles.cardStatus}>Low</Text>
            </View>

            {/* Voltage */}
            <View style={styles.card}>
              <MaterialCommunityIcons name="flash" size={32} color="#1E90FF" />
              <Text style={styles.cardTitle}>Voltage</Text>
              <Text style={styles.cardValue}>{data?.voltage || "0.00"} V</Text>
              <Text style={styles.cardStatus}>Normal</Text>
            </View>
          </View>

          {/* Total Power Consumption */}
          <View style={styles.totalPowerContainer}>
            <MaterialCommunityIcons
              name="power-plug"
              size={48}
              color="#FF6347"
            />
            <Text style={styles.totalPowerTitle}>Monthly Consumption</Text>
            <Text style={styles.totalPowerValue}>
              {data?.energyConsumed || "0.00"} kWh
            </Text>
          </View>

          {/* Navigate to Insights */}
          <TouchableOpacity
            style={styles.insights}
            onPress={() => router.push("../electric_usage_insights")}
          >
            <Text style={styles.insightsText}>Insights</Text>
          </TouchableOpacity>
          <View style={styles.promptBox}>
            <Text style={styles.promptText}>{insightsPrompt}</Text>
          </View>
        </>
      )}
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
    marginBottom: 40,
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
  totalPowerUnit: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FF6347",
    marginVertical: 4,
  },
  promptText: { fontSize: 16, color: "#333" },
});

export default ElectricUsage;
