import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { LineChart } from "react-native-chart-kit";

// API URL
const API_URL =
  "https://9hktsjh3i1.execute-api.ap-south-1.amazonaws.com/smartmeter-total-consumption/smartmeter?meterid=s12";

const ElectricUsageInsights = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Function to fetch data from the API
  const fetchData = async () => {
    try {
      const response = await fetch(API_URL);
      const jsonData = await response.json();

      // Remove the first element and add new data to the end
      setData((prevData) => {
        const newData = [...prevData, jsonData];
        if (newData.length > 10) {
          // Limit the data to 50 points
          newData.shift(); // Remove the first element
        }
        return newData;
      });

      setLoading(false); // Stop loading once data is fetched
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false); // Stop loading in case of error
    }
  };

  // Set an interval to fetch data every second (1000ms)
  useEffect(() => {
    fetchData(); // Initial fetch when component mounts

    const intervalId = setInterval(() => {
      fetchData(); // Fetch data every second
    }, 2000); // 1000 milliseconds (1 second)

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return <Text style={styles.loading}>Loading...</Text>;
  }

  const energyConsumedData = data.map((item) =>
    parseFloat(item.payload.energyConsumedWh)
  );
  const voltageData = data.map((item) => parseFloat(item.payload.voltage));

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer} // Apply alignItems here
    >
      <Text style={styles.title}>User Insights</Text>

      {/* Energy Consumption Over Time Line Chart */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>
          Energy Consumption Over Time (Wh/s)
        </Text>
        <LineChart
          data={{
            datasets: [
              {
                data: energyConsumedData,
                color: (opacity = 1) => `rgba(52, 172, 235, ${opacity})`,
                strokeWidth: 2,
              },
            ],
          }}
          width={350}
          height={220}
          chartConfig={chartConfig}
          style={styles.chart}
        />
      </View>

      {/* Voltage Over Time Line Chart */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Voltage Over Time (v/s)</Text>
        <LineChart
          data={{
            datasets: [
              {
                data: voltageData,
                color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`,
                strokeWidth: 2,
              },
            ],
          }}
          width={350}
          height={220}
          chartConfig={chartConfig}
          style={styles.chart}
        />
      </View>
    </ScrollView>
  );
};

const chartConfig = {
  backgroundGradientFrom: "#f0f0f0", // Lighter background for modern feel
  backgroundGradientTo: "#f0f0f0",
  color: (opacity = 1) => `rgba(52, 172, 235, ${opacity})`,
  strokeWidth: 3,
  propsForDots: {
    r: "6", // Bigger dots for visibility
    strokeWidth: "2", // Border around the dots
    stroke: "#fff", // White stroke for contrast
  },
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white", padding: 20 },
  contentContainer: { alignItems: "center" }, // Apply the alignItems here
  title: { fontSize: 28, fontWeight: "bold", color: "#333", marginBottom: 20 },
  chartCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    elevation: 5, // Shadow effect for a card-like look
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  chart: { borderRadius: 10, marginVertical: 8, width: "80%" },
  loading: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    color: "#555",
  },
});

export default ElectricUsageInsights;
