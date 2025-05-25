import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const ENERGY_API_URL = "http://65.1.109.254/energy_tips?meterId=s12";

const EnergyAnalysis = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnergyData = async () => {
      try {
        const response = await fetch(ENERGY_API_URL);
        const result = await response.json();
        setData(result);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching energy analysis:", error);
        setLoading(false);
      }
    };

    fetchEnergyData();
  }, []);

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: "", headerBackTitleVisible: false }} />
        <View style={[styles.container, { paddingTop: insets.top }]}>
          <ActivityIndicator size="large" color="#007BFF" />
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: "", headerBackTitleVisible: false }} />
      <ScrollView style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.header}>
          <MaterialCommunityIcons
            name="lightning-bolt"
            size={28}
            color="#007BFF"
          />{" "}
          Energy Analysis
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>📟 Meter ID: {data?.meterId}</Text>

          <Text style={styles.label}>📊 Usage Summary:</Text>
          <Text style={styles.value}>{data?.usage_summary}</Text>

          <Text style={styles.label}>🔥 Consumption Status:</Text>
          <View
            style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}
          >
            <MaterialCommunityIcons
              name={data?.consumption_status === "high" ? "fire" : "leaf"}
              size={20}
              color={
                data?.consumption_status === "high" ? "#FF3B30" : "#34C759"
              }
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.status,
                {
                  color:
                    data?.consumption_status === "high" ? "#FF3B30" : "#34C759",
                },
              ]}
            >
              {data?.consumption_status.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>🔌 Active Devices:</Text>
          {data?.active_devices?.map((device: string, index: number) => (
            <View key={index} style={styles.deviceRow}>
              <MaterialCommunityIcons
                name="power-plug"
                size={18}
                color="#555"
              />
              <Text style={styles.deviceText}>{device}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>📝 Summary:</Text>
          <Text style={styles.value}>{data?.summary}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>💡 Energy Saving Tips:</Text>
          {data?.energy_saving_tips?.map((tip: string, index: number) => (
            <View key={index} style={styles.tipContainer}>
              <MaterialCommunityIcons
                name="check-circle"
                size={20}
                color="#4CD964"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    backgroundColor: "#f5f7fa",
    flex: 1,
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1c1c1e",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
    color: "#333",
  },
  value: {
    fontSize: 15,
    color: "#555",
    marginTop: 4,
  },
  status: {
    fontSize: 16,
    fontWeight: "700",
  },
  deviceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  deviceText: {
    fontSize: 15,
    color: "#555",
    marginLeft: 8,
  },
  tipContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 15,
    color: "#444",
  },
  backBtn: {
    flexDirection: "row",
    marginTop: 24,
    backgroundColor: "#007BFF",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 50,
  },
  backBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 6,
  },
});

export default EnergyAnalysis;
