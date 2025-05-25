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
  const [forecast, setForecast] = useState<number | null>(null);

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
  const fetchForecast = async () => {
    try {
      const response = await fetch("http://65.1.109.254/forecast_hourly");
      const result = await response.json();
      setForecast(result.adjusted_prediction); // or use result.forecast_hourly_kWh
    } catch (error) {
      console.error("Error fetching forecast:", error);
    }
  };

  useEffect(() => {
    fetchData(); // existing real-time data
    fetchForecast(); // call new forecast function too
    const interval = setInterval(() => {
      fetchData();
      fetchForecast();
    }, 10000); // fetch every 10s

    return () => clearInterval(interval);
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
          <TouchableOpacity
            style={styles.insights}
            onPress={() => router.push("../electric_energy_analysis")}
          >
            <Text style={styles.insightsText}>Energy Analysis</Text>
          </TouchableOpacity>
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

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push("../electric_usage_insights")}
            >
              <Text style={styles.buttonText}>Insights</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push("../electric_devices")}
            >
              <Text style={styles.buttonText}>Electrical Devices</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.forecastContainer}>
            <MaterialCommunityIcons
              name="chart-line"
              size={20}
              color="#4A90E2"
            />
            <Text style={styles.forecastTitle}>Forecasted Hourly Usage</Text>
            <Text style={styles.forecastValue}>
              {forecast !== null ? forecast.toFixed(2) : "0.00"} kWh
            </Text>
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
    borderColor: "#4FC3F7",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
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
    marginBottom: 10,
    borderColor: "#EF9A9A",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
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
  promptBox: {
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    alignItems: "center",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 16,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: "#E3F2FD",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    elevation: 2,
  },
  buttonText: {
    color: "#1E88E5",
    fontWeight: "bold",
    fontSize: 16,
  },

  forecastContainer: {
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    marginBottom: 32,
    borderColor: "#4FC3F7",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  forecastTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#0288D1",
    marginTop: 10,
  },
  forecastValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#01579B",
    marginTop: 6,
  },
});

export default ElectricUsage;
