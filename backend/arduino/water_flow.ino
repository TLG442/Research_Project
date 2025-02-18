#include <Arduino_BuiltIn.h>
#include "utils.h"
#include <PubSubClient.h>

int relayPin = 4;
int flowSensorPin = 5;
float calibrationFactor = 4.5;

volatile int pulseCount;
float flowRate;
unsigned long flowMilliLitres;
unsigned long totalMilliLitres;
unsigned long oldTime;

void setup() {
    pinMode(relayPin, OUTPUT);
    // digitalWrite(relayPin, LOW); 

    // connectAWS();
    pinMode(flowSensorPin, INPUT_PULLUP);

    Serial.begin(115200);
    pulseCount = 0;
    flowRate = 0.0;
    flowMilliLitres = 0;
    totalMilliLitres = 0;
    oldTime = 0;

    attachInterrupt(digitalPinToInterrupt(flowSensorPin), pulseCounter, FALLING);
}

void loop() {
    // client.loop();
    delay(1000);

    if ((millis() - oldTime) > 1000) {
        detachInterrupt(digitalPinToInterrupt(flowSensorPin));

        flowRate = ((1000.0 / (millis() - oldTime)) * pulseCount) / calibrationFactor;

        oldTime = millis();

        float flowMillilitersPerSecond = flowRate * 1000 / 60;
        totalMilliLitres += flowMillilitersPerSecond;

        Serial.print("Flow rate: ");
        Serial.print(flowMillilitersPerSecond);
        Serial.print(" mL/s, Total liquid: ");
        Serial.println(totalMilliLitres);

        pulseCount = 0;

        attachInterrupt(digitalPinToInterrupt(flowSensorPin), pulseCounter, FALLING);
    }
    delay(1000);
}

void pulseCounter() {
    pulseCount++;
}
