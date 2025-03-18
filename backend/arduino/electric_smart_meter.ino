#include "EmonLib.h" // Include the EmonLib library
#include "secrets.h"
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include "WiFi.h"
#include <NTPClient.h>
#include <WiFiUdp.h>

#define AWS_IOT_PUBLISH_TOPIC   "electric_smart_meter/pub"
#define AWS_IOT_SUBSCRIBE_TOPIC "electric_smart_meter/sub"

// Create an instance of EmonLib
EnergyMonitor emon1;

// Pin Definitions
#define VOLTAGE_SENSOR_PIN 35  // ZMPT101B connected to GPIO 35
#define CURRENT_SENSOR_PIN 34  // SCT-013 connected to GPIO 34

// Calibration Constants
#define VCAL 94.5   // Voltage calibration factor for a 230V system
#define CCAL 0.52   // Current calibration factor

// Define NTP Client to get time
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org");

// Energy Consumption Variables
float energyConsumed = 0.0;  // Stores energy in kWh
unsigned long lastMillis = 0;


WiFiClientSecure net = WiFiClientSecure();
PubSubClient client(net);

void connectAWS() {
  
  // Connect to Wi-Fi
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.println("Connecting to Wi-Fi...");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  // Configure WiFiClientSecure to use the AWS IoT device credentials
  net.setCACert(AWS_CERT_CA);
  net.setCertificate(AWS_CERT_CRT);
  net.setPrivateKey(AWS_CERT_PRIVATE);

  // Connect to the MQTT broker on the AWS endpoint
  client.setServer(AWS_IOT_ENDPOINT, 8883);
  client.setCallback(messageHandler); // Set message handler for subscribed topics

  Serial.println("Connecting to AWS IoT...");
  while (!client.connect(THINGNAME)) {
    Serial.print(".");
    delay(100);
  }

  if (!client.connected()) {
    Serial.println("AWS IoT Timeout!");
    return;
  }

  // Subscribe to the topic
  client.subscribe(AWS_IOT_SUBSCRIBE_TOPIC);
  Serial.println("AWS IoT Connected!");
}


void publishMessage()
{
  StaticJsonDocument<200> doc;
  doc["meterid"] = "s12";
  doc["timestamp"] = timeClient.getFormattedTime();  // Use the current time from NTP
  doc["voltage"] = emon1.Vrms;   // RMS Voltage
  doc["current"] = emon1.Irms;   // RMS Current
  doc["energyConsumed"] = energyConsumed;  // Energy Consumed (kWh)


  char jsonBuffer[512];
  serializeJson(doc, jsonBuffer); // print to client
 
  client.publish(AWS_IOT_PUBLISH_TOPIC, jsonBuffer);
}
 
void messageHandler(char* topic, byte* payload, unsigned int length) {
  Serial.print("Incoming message on topic: ");
  Serial.println(topic);
  
  // Deserialize the incoming message
  StaticJsonDocument<200> doc;
  deserializeJson(doc, payload);
  const char* message = doc["message"];
  Serial.println(message);  // Print the message from the subscribed topic
}

void setup() {
    Serial.begin(115200);
    analogReadResolution(12); // Set ESP32 ADC to 12-bit mode (0-4095 range)

    // Initialize EmonLib for voltage and current measurement
    emon1.voltage(VOLTAGE_SENSOR_PIN, VCAL, 1.7); // (Pin, Calibration factor, Phase shift)
    emon1.current(CURRENT_SENSOR_PIN, CCAL);      // (Pin, Calibration factor)

    lastMillis = millis(); // Initialize time tracking
    connectAWS();

    // Initialize NTPClient
    timeClient.begin();
    timeClient.setTimeOffset(19800); // Set offset time in seconds to adjust for your timezone 

}

void loop() {
    // Measure voltage and current
    emon1.calcVI(20, 2000); // Calculate RMS values
    // Update the NTP client to get the current time
    timeClient.update();

    // Get the current time as a formatted string
    String formattedTime = timeClient.getFormattedTime();
    String formattedTime = timeClient.getFormattedTime();
    String timestamp = formattedDate + "T" + formattedTime;

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

  // Publish sensor readings to AWS IoT
  publishMessage();

  // MQTT client loop to handle messages
  client.loop();

  delay(1000); // Update every second

}
