#include <Arduino_BuiltIn.h>
#include "utils.h"
#include <PubSubClient.h>

int relayPin = 4;
void setup() {
    pinMode(relayPin, OUTPUT);
    digitalWrite(relayPin, LOW); 
    Serial.begin(115200);
    connectAWS();
}

void loop() {
  client.loop();
  delay(1000);
}