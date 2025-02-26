import React, { useState , useEffect  } from "react";
import { Text, Box, Button, ButtonText } from "@gluestack-ui/themed";
import { CartesianChart, Bar, useChartPressState } from "victory-native";
import { Circle, useFont, vec } from "@shopify/react-native-skia";
import { View, useColorScheme, StyleSheet } from "react-native";
import { COLORMODES } from "@gluestack-style/react/lib/typescript/types";
import { LinearGradient, Text as SKText } from "@shopify/react-native-skia";
import { useDerivedValue } from "react-native-reanimated";
import { useNavigation } from 'expo-router';
// import CalendarPicker from 'react-native-calendar-picker';

const inter = require("../assets/fonts/roboto.ttf");

const DATA = (length: number = 10) =>
  Array.from({ length }, (_, index) => ({
    month: index + 1,
    listenCount: Math.floor(Math.random() * (100 - 50 + 1)) + 50,
  }));

export default function WaterUsageInsights() {
  const [data, setData] = useState(DATA(5));
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const navigation = useNavigation();
  const font = useFont(inter, 12);
  const toolTipFont = useFont(inter, 24);
  const colorMode = useColorScheme() as COLORMODES;
  const { state, isActive } = useChartPressState({
    x: 0,
    y: { listenCount: 0 },
  });
  useEffect(() => {
    fetchData(new Date());
  }, []);

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
  
      let flowValues: number[] = [0]; // Default to [0] if no data is found
  
      if (response.status === 200) {
        try {
          const parsedBody = JSON.parse(result.body);
          if (Array.isArray(parsedBody.Flow_values) && parsedBody.Flow_values.length > 0) {
            flowValues = parsedBody.Flow_values;
          }
        } catch (parseError) {
          console.error("Error parsing response body:", parseError);
        }
      } else if (response.status === 404) {
        console.warn("No data found for the selected date. Defaulting to 0.");
      }
  
      const newData = flowValues.map((value: number, index: number) => ({
        month: index + 1,
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

  {/* Date Picker */}
  <Box 
    position="absolute"
    bottom={10} // Distance from the bottom of the parent box
    right={10}  // Distance from the right of the parent box
  >
    <Button onPress={() => setShowCalendar(!showCalendar)} >
      <Text>Select Date</Text>
    </Button>
  </Box>
</Box>


      <Box
      style={{ backgroundColor: 'white' }} // Explicitly set background color to white
      flex={1}
      paddingHorizontal={5}
      paddingVertical={25}
    ></Box>
 
      {/* {showCalendar && (
        <CalendarPicker
          onDateChange={handleDateSelect}
        />
      )} */}
      <Box paddingTop={10} width="95%" height="70%"  borderRadius={10} >
        <CartesianChart
          xKey="month"
          padding={5}
          yKeys={["listenCount"]}
          domain={{ y: [0, 100] }}
          domainPadding={{ left: 50, right: 50, top: 30 }}
          axisOptions={{
            font,
            tickCount: 5,
            formatXLabel: (value) => {
              const date = new Date(2023, value - 1);
              return date.toLocaleString("default", { month: "short" });
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