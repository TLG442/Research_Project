#include <Arduino_BuiltIn.h>
#include "utils.h"
#include <PubSubClient.h>

int relayPin ;
int flowSensorPin = 5;
float calibrationFactor = 4.5;

const int pressurePin = 36; // VP (ADC1 Channel 0)


volatile int pulseCount;
float flowRate;
unsigned long flowMilliLitres;
unsigned long totalMilliLitres;
unsigned long oldTime;

void setup() {
    pinMode(relayPin, OUTPUT);
    // // digitalWrite(relayPin, LOW); 

    // // connectAWS();
    // pinMode(flowSensorPin, INPUT_PULLUP);

    Serial.begin(115200);
    // pulseCount = 0;
    // flowRate = 0.0;
    // flowMilliLitres = 0;
    // totalMilliLitres = 0;
    // oldTime = 0;

    // attachInterrupt(digitalPinToInterrupt(flowSensorPin), pulseCounter, FALLING);
}

void loop() {
    // // client.loop();
    // delay(1000);

    // if ((millis() - oldTime) > 1000) {
    //     detachInterrupt(digitalPinToInterrupt(flowSensorPin));

    //     flowRate = ((1000.0 / (millis() - oldTime)) * pulseCount) / calibrationFactor;

    //     oldTime = millis();

    //     float flowMillilitersPerSecond = flowRate * 1000 / 60;
    //     totalMilliLitres += flowMillilitersPerSecond;

    //     Serial.print("Flow rate: ");
    //     Serial.print(flowMillilitersPerSecond);
    //     Serial.print(" mL/s, Total liquid: ");
    //     Serial.println(totalMilliLitres);

    //     pulseCount = 0;

    //     attachInterrupt(digitalPinToInterrupt(flowSensorPin), pulseCounter, FALLING);
    // }
    // delay(1000);

delay(1000);
int sensorValue = analogRead(pressurePin);
float voltage = sensorValue*(5.0/1023.0);


float baselineVoltage = 2.4;
Serial.print("baselineVoltage :");
Serial.print(voltage);
Serial.println("V");
float pressure = (voltage - baselineVoltage)*(100.0/(4.5 - baselineVoltage));

Serial.print("Pressure :");
Serial.print(pressure);
Serial.println("psi");


delay(1000);



}

// void pulseCounter() {
//     pulseCount++;
// }
