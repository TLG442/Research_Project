#include <Arduino_BuiltIn.h>
#include "certs.h"
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include "WiFi.h"

#define AWS_IOT_PUBLISH_TOPIC   "esp32/pub"
#define RELAY_PIN 4  // GPIO pin connected to the relay

WiFiClientSecure net = WiFiClientSecure();
PubSubClient client(net);

void messageHandler(char* topic, byte* payload, unsigned int length) {
    Serial.print("incoming: ");
    Serial.println(topic);

    StaticJsonDocument<200> doc;
    DeserializationError error = deserializeJson(doc, payload, length);

    if (error) {
        Serial.print("deserializeJson() failed: ");
        Serial.println(error.c_str());
        return;
    }

    int metricsValue = doc["metrics"];  // Get the value from the JSON message
    Serial.print("Received metrics: ");
    Serial.println(metricsValue);

    if (metricsValue > 50) {
        digitalWrite(RELAY_PIN, LOW);  // Turn pump ON
        Serial.println("Pump turned ON");
    } else {
        digitalWrite(RELAY_PIN, HIGH); // Turn pump OFF
        Serial.println("Pump turned OFF");
    }
}

void connectAWS() {
    WiFi.mode(WIFI_STA);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

    Serial.println("Connecting to Wi-Fi");

    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }

    net.setCACert(AWS_CERT_CA);
    net.setCertificate(AWS_CERT_CRT);
    net.setPrivateKey(AWS_CERT_PRIVATE);

    client.setServer(AWS_IOT_ENDPOINT, 8883);
    client.setCallback(messageHandler);

    Serial.println("Connecting to AWS IoT");

    while (!client.connect(THINGNAME)) {
        Serial.print(".");
        delay(100);
    }

    if (!client.connected()) {
        Serial.println("AWS IoT Timeout!");
        return;
    }

    client.subscribe(AWS_IOT_PUBLISH_TOPIC);
    Serial.println("Subscribed to " AWS_IOT_PUBLISH_TOPIC);
    Serial.println("AWS IoT Connected!");
}

void publishMessage(int metricsValue) {
    StaticJsonDocument<200> doc;
    doc["metrics"] = metricsValue;

    char jsonBuffer[512];
    serializeJson(doc, jsonBuffer);

    client.publish(AWS_IOT_PUBLISH_TOPIC, jsonBuffer);
}
