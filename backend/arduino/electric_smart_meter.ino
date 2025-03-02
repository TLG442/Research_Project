#include "EmonLib.h" // Include the EmonLib library

// Create an instance of EmonLib
EnergyMonitor emon1;

// Pin Definitions
#define VOLTAGE_SENSOR_PIN 35  // ZMPT101B connected to GPIO 35
#define CURRENT_SENSOR_PIN 34  // SCT-013 connected to GPIO 34

// Calibration Constants
#define VCAL 94.5   // Voltage calibration factor for a 230V system
#define CCAL 0.52   // Current calibration factor

// Energy Consumption Variables
float energyConsumed = 0.0;  // Stores energy in kWh
unsigned long lastMillis = 0;

void setup() {
    Serial.begin(115200);
    analogReadResolution(12); // Set ESP32 ADC to 12-bit mode (0-4095 range)

    // Initialize EmonLib for voltage and current measurement
    emon1.voltage(VOLTAGE_SENSOR_PIN, VCAL, 1.7); // (Pin, Calibration factor, Phase shift)
    emon1.current(CURRENT_SENSOR_PIN, CCAL);      // (Pin, Calibration factor)

    lastMillis = millis(); // Initialize time tracking
}

void loop() {
    // Measure voltage and current
    emon1.calcVI(20, 2000); // Calculate RMS values

    float measuredVoltage = emon1.Vrms; // Get RMS voltage
    float measuredCurrent = emon1.Irms; // Get RMS current
    float realPower = emon1.realPower;  // Real power (W)
    float apparentPower = emon1.apparentPower; // Apparent power (VA)

    // **Power Factor Calculation**
    float powerFactor = (apparentPower > 0) ? (realPower / apparentPower) : 0;

    // **Energy Consumption Calculation**
    unsigned long currentMillis = millis();
    energyConsumed += (apparentPower * (currentMillis - lastMillis)) / 3600000000.0; // Convert to kWh
    lastMillis = currentMillis; // Update time reference

    // **Print Sensor Readings**
    Serial.print("Voltage: ");
    Serial.print(measuredVoltage, 2);
    Serial.print(" V\t");

    Serial.print("Current: ");
    Serial.print(measuredCurrent, 4);
    Serial.print(" A\t");

    Serial.print("Real Power: ");
    Serial.print(realPower, 2);
    Serial.print(" W\t");

    Serial.print("Apparent Power: ");
    Serial.print(apparentPower, 2);
    Serial.print(" VA\t");

    Serial.print("Power Factor: ");
    Serial.print(powerFactor, 2);
    Serial.print("\t");

    Serial.print("Energy: ");
    Serial.print(energyConsumed, 7);
    Serial.println(" kWh");

    delay(1000); // Update every second
}
