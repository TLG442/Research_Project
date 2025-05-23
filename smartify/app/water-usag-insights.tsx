import React, { useState, useEffect } from "react";
import { Text, Box, Button, ButtonText } from "@gluestack-ui/themed";
import { View, useColorScheme, StyleSheet, Dimensions } from "react-native"; // Import Dimensions
import { BarChart } from "react-native-chart-kit"; // Import BarChart
import { useNavigation } from "expo-router";
// Svg and Picker are not directly used for the chart with react-native-chart-kit,
// but you might keep Svg if you have other Svg needs.
// import Svg, { LinearGradient, Stop , Defs } from "react-native-svg";
// import { Picker } from "@react-native-picker/picker";

const screenWidth = Dimensions.get("window").width; // Get screen width for responsive charts

// Removed the DATA mock as we'll use the fetched data directly

export default function WaterUsageInsights() {
  const [chartData, setChartData] = useState({
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        data: [0, 0, 0, 0, 0, 0, 0], // Initialize with zeros
      },
    ],
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [timeRange, setTimeRange] = useState("past7days");
  const [timeRangeLabel, setTimeRangeLabel] = useState("Sort by");
  const colorMode = useColorScheme();
  const navigation = useNavigation();

  const isDark = colorMode === "dark";

  useEffect(() => {
    fetchData(new Date());
    const intervalId = setInterval(() => {
      fetchData(new Date());
    }, 1000000); // 10 seconds (consider making this shorter for testing, e.g., 5000 for 5 secs)
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const fetchData = async (date: Date) => {
    try {
      const response = await fetch(
        `https://xuykyco2wj.execute-api.eu-north-1.amazonaws.com/dev`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            Flow_data: `water_usage_${date.toISOString().split("T")[0]}`,
            date: date.toISOString().split("T")[0],
          }),
        }
      );

      const result = await response.json();
      let flowValues: number[] = [0, 0, 0, 0, 0, 0, 0];

      if (response.status === 200) {
        try {
          const parsedBody = JSON.parse(result.body);
          if (parsedBody.week_data && Array.isArray(parsedBody.week_data)) {
            // Ensure data is mapped to the 7 days correctly
            flowValues = parsedBody.week_data.map((item: any) => item.total_flow);
            // Pad with zeros if less than 7 days, or slice if more
            while (flowValues.length < 7) {
              flowValues.push(0);
            }
            flowValues = flowValues.slice(0, 7);
          }
        } catch (parseError) {
          console.error("Error parsing response body:", parseError);
        }
      } else if (response.status === 404) {
        console.warn("No data found for the selected date. Defaulting to 0.");
      }

      setChartData({
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
          {
            data: flowValues,
          },
        ],
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      // Set chart data to zeros on error to avoid displaying old data
      setChartData({
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
          {
            data: [0, 0, 0, 0, 0, 0, 0],
          },
        ],
      });
    }
  };

  const handleTimeRangeChange = (value: string, label: string) => {
    setTimeRange(value);
    setTimeRangeLabel(label);
  };

  const chartConfig = {
    backgroundGradientFrom: "#ffffff", // White background
    backgroundGradientFromOpacity: 1,
    backgroundGradientTo: "#ffffff", // White background
    backgroundGradientToOpacity: 1,
    color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`, // Blue bars
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // Black labels
    strokeWidth: 2, // optional, default 3
    barPercentage: 0.5, // Adjust bar width
    useShadowColorFromDataset: false, // optional
    decimalPlaces: 0, // No decimal places for labels
    propsForLabels: {
      fontSize: 10, // Font size for axis labels
    },
    propsForBackgroundLines: {
      strokeDasharray: "0", // No dashed lines for background grid
    },
    fillShadowGradient: `blue`, // Start color of gradient
    fillShadowGradientOpacity: 0.8, // Opacity of gradient
  };


  return (
    <Box
      style={{ backgroundColor: "white" }}
      flex={1}
      paddingHorizontal={5}
      paddingVertical={0}
    >
      <Box
        width="100%"
        height="17%"
        borderRadius={10}
        paddingBottom={20}
        paddingTop={20}
        backgroundColor="white"
        overflow="hidden"
        boxShadow="0px 4px 10px rgba(0, 0, 0, 0.3)"
        position="relative"
      >
        <Box
          width="100%"
          padding={10}
          paddingTop={35}
          borderRadius={10}
          backgroundColor="white"
        >
          <Text fontSize={18}>Water Usage Insights</Text>
        </Box>
      </Box>

      <Box
        height="5%"
        style={{ backgroundColor: "white" }}
        paddingHorizontal={5}
        paddingVertical={2}
      ></Box>

      <Box paddingTop={1} paddingBottom={55} width="95%" height="70%" borderRadius={10}>
        <BarChart
          data={chartData}
          width={screenWidth - 20} // Adjust width to fit screen with padding
          height={300}
          yAxisLabel="" // Set to empty string if you don't want a label
          yAxisSuffix="L" // Suffix for y-axis values (e.g., Liters)
          chartConfig={chartConfig}
          verticalLabelRotation={0} // No rotation for x-axis labels
          fromZero={true} // Ensure y-axis starts from zero
          showValuesOnTopOfBars={true} // Display values on top of bars
          withCustomBarColorFromData={true} // Allows custom bar colors if you define them in datasets
          flatColor={true} // Makes all bars the same color if not custom defined
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
        />
      </Box>
    </Box>
  );
}

const styles = StyleSheet.create({
  // Add any additional styles if needed
});