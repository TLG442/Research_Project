import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { LineChart, BarChart } from "react-native-chart-kit";

const electric_usage_insights = () => {
  // Example prompt based on past hour data
  const insightsPrompt =
    "Your energy consumption has increased by 15% in the last hour. Consider turning off unused appliances.";

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>User Insights</Text>

      <View style={styles.promptBox}>
        <Text style={styles.promptText}>{insightsPrompt}</Text>
      </View>

      {/* Power Usage Line Chart */}
      <Text style={styles.chartTitle}>Power Usage Over Time</Text>
      <LineChart
        data={{
          labels: ["10AM", "11AM", "12PM", "1PM", "2PM"],
          datasets: [{ data: [500, 800, 650, 1200, 900] }],
        }}
        width={350}
        height={220}
        chartConfig={chartConfig}
        yAxisLabel="$"
        yAxisSuffix="kWh"
        style={styles.chart}
      />

      {/* Device-wise Usage Bar Chart */}
      <Text style={styles.chartTitle}>Device-wise Power Usage</Text>
      <BarChart
        data={{
          labels: ["Lamp", "AC", "TV", "Speaker"],
          datasets: [{ data: [300, 1200, 800, 500] }],
        }}
        width={350}
        height={220}
        chartConfig={chartConfig}
        yAxisLabel="$" // Add this line
        yAxisSuffix="kWh" // Add this line
        style={styles.chart}
      />
    </ScrollView>
  );
};

const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  color: (opacity = 1) => `rgba(52, 172, 235, ${opacity})`,
  strokeWidth: 2,
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  promptBox: {
    backgroundColor: "#f8f8f8",
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
  },
  promptText: { fontSize: 16, color: "#333" },
  chartTitle: { fontSize: 18, fontWeight: "600", marginVertical: 10 },
  chart: { borderRadius: 10, marginVertical: 8 },
});

export default electric_usage_insights;
