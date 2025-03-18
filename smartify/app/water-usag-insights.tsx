import React, { useState , useEffect  } from "react";
import { Text, Box, Button, ButtonText , Menu, MenuItem, Pressable } from "@gluestack-ui/themed";
import { CartesianChart, Bar, useChartPressState } from "victory-native";
import { Circle, useFont, vec } from "@shopify/react-native-skia";
import { View, useColorScheme, StyleSheet } from "react-native";
import { COLORMODES } from "@gluestack-style/react/lib/typescript/types";
import { LinearGradient, Text as SKText } from "@shopify/react-native-skia";
import { useDerivedValue } from "react-native-reanimated";
import { useNavigation } from 'expo-router';
import { Picker } from "@react-native-picker/picker";
// import CalendarPicker from 'react-native-calendar-picker';

const inter = require("../assets/fonts/roboto.ttf");

const DATA = (length: number = 10) =>
  Array.from({ length }, (_, index) => ({
    month: index + 1,
    listenCount: Math.floor(Math.random() * (100 - 50 + 1)) + 50,
  }));

export default function WaterUsageInsights() {
  const [data, setData] = useState(DATA(7));
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [sortBy, setSortBy] = useState("date");
  const navigation = useNavigation();
    const [showMenu, setShowMenu] = useState(false);
  const font = useFont(inter, 12);
  const [timeRangeLabel, setTimeRangeLabel] = useState("Sort by");
  const toolTipFont = useFont(inter, 24);
  const [timeRange, setTimeRange] = useState("past7days");
  const colorMode = useColorScheme() as COLORMODES;
  const { state, isActive } = useChartPressState({
    x: 0,
    y: { listenCount: 0 },
  });
  useEffect(() => {
    // Initial fetch
    fetchData(new Date());

    // Set interval to fetch data every 10 seconds
    const intervalId = setInterval(() => {
      fetchData(new Date());
    }, 30000000000); // 10 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  React.useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  React.useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const isDark = colorMode === "dark";

  const value = useDerivedValue(() => {
    return "" + state.y.listenCount.value.value;
  }, [state]);

  const textYPosition = useDerivedValue(() => {
    return state.y.listenCount.position.value - 15;
  }, [value]);

  const textXPosition = useDerivedValue(() => {
    if (!toolTipFont) {
      return 0;
    }
    return (
      state.x.position.value - toolTipFont.measureText(value.value).width / 2
    );
  }, [value, toolTipFont]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setShowCalendar(false);
    fetchData(date);
  };
  

  const handleTimeRangeChange = (value: string, label: string) => {
    setTimeRange(value);
    setTimeRangeLabel(label);
    setShowMenu(false);
  };
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
      console.log(result);
  
      let flowValues: number[] = [0, 0, 0, 0, 0, 0, 0]; // Default to 7 zeros for 7 days
  
      if (response.status === 200) {
        try {
          const parsedBody = JSON.parse(result.body);
          if (parsedBody.week_data && Array.isArray(parsedBody.week_data)) {
            // Map the total_flow values from week_data (newest to oldest)
            flowValues = parsedBody.week_data.map((item: any) => item.total_flow);
          }
        } catch (parseError) {
          console.error("Error parsing response body:", parseError);
        }
      } else if (response.status === 404) {
        console.warn("No data found for the selected date. Defaulting to 0.");
      }
  
      const newData = flowValues.map((value: number, index: number) => ({
        month: index + 1, // 1 to 7, matching "Mon" to "Sun"
        listenCount: value,
      }));
  
      setData(newData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };


  return (
    <Box
      style={{ backgroundColor: 'white' }} // Explicitly set background color to white
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
  backgroundColor="lightgrey"
  overflow="hidden" 
  boxShadow="0px 4px 10px rgba(0, 0, 0, 0.3)" // Add shadow
  position="relative" // Set relative positioning for the parent box to position the child box
>
  <Box // Nested box for the content
    width="100%"
    padding={10}
    paddingTop={35}
    borderRadius={10} // Rounded corners on the nested box
    backgroundColor="lightgrey" // Maintain background
  >
    <Text fontSize={20}>
      Water Usage Insights
    </Text>
  </Box>

{/* 
  <Box 
          position="absolute"
          top={5}
          bottom={0}
          right={0}
          width="50%"
        >
          <Picker
            selectedValue={timeRange}
            onValueChange={(itemValue) => {
              const label = itemValue === "past7days" ? "Past 7 Days" : "Month";
              handleTimeRangeChange(itemValue, label);
            }}
            style={{ backgroundColor: 'lightgrey', borderRadius: 5 }}
          >
            <Picker.Item label="Past 7 Days" value="past7days" />
            <Picker.Item label="Month" value="month" />
          </Picker>
        </Box> */}
</Box>


      <Box
        height="5%"
      style={{ backgroundColor: 'white' }} // Explicitly set background color to white
      
      paddingHorizontal={5}
      paddingVertical={2}
    ></Box>
 
      {/* {showCalendar && (
        <CalendarPicker
          onDateChange={handleDateSelect}
        />
      )} */}
      <Box paddingTop={1} paddingBottom={55} width="95%" height="70%"  borderRadius={10} >
      <CartesianChart
  xKey="month"
  padding={5}
  yKeys={["listenCount"]}
  domain={{ y: [0, 100] }}
  domainPadding={{ left: 50, right: 50, top: 30 }}
  axisOptions={{
    font,
    tickCount: 7, 
    formatXLabel: (value) => {
      const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      return labels[value - 1] || "";
    },
    lineColor: isDark ? "#71717a" : "#d4d4d8",
    labelColor: isDark ? "black" : "black",
  }}
  chartPressState={state}
  data={data}
>

          {({ points, chartBounds }) => {
            return (
              <>
                <Bar
                  points={points.listenCount}
                  chartBounds={chartBounds}
                  animate={{ type: "timing", duration: 1000 }}
                  roundedCorners={{
                    topLeft: 10,
                    topRight: 10,
                  }}
                >
                  <LinearGradient
                    start={vec(0, 0)}
                    end={vec(0, 400)}
                    colors={["blue", "#34c6eb"]}
                  />
                </Bar>

                {isActive ? (
                  <>
                    <SKText
                      font={toolTipFont}
                      color={isDark ? "black" : "black"}
                      x={textXPosition}
                      y={textYPosition}
                      text={value}
                    />
                    <Circle
                      cx={state.x.position}
                      cy={state.y.listenCount.position}
                      r={8}
                      color={"grey"}
                      opacity={0.8}
                    />
                  </>
                ) : null}
              </>
            );
          }}
        </CartesianChart>
      </Box>
     
    </Box>
  );
}