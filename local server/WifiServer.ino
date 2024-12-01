#include <WiFi.h>

const char *ssid = "SLT-FIBRE";
const char *password = "nadee123";
int relayPin = 4;

WiFiServer server(80);

void setup() {
  Serial.begin(115200);
  pinMode(relayPin, OUTPUT);  // Set the relay pin as output
  digitalWrite(relayPin, LOW);  // Ensure pump is off initially

  Serial.println();
  Serial.print("Connecting to WiFi: ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.println("WiFi connected.");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());

  server.begin();
}

void loop() {
  WiFiClient client = server.available();  // Check for incoming client

  if (client) {
    Serial.println("New Client Connected.");
    String request = "";
    while (client.connected()) {
      if (client.available()) {
        char c = client.read();
        request += c;

        if (c == '\n') {
          if (request.indexOf("GET /api/pump/off") >= 0) {
            digitalWrite(relayPin, HIGH);  // Turn pump ON
            client.println("HTTP/1.1 200 OK");
            client.println("Content-Type: application/json");
            client.println();
            client.println("{\"status\":\"Pump turned OFF\"}");
          } else if (request.indexOf("GET /api/pump/on") >= 0) {
            digitalWrite(relayPin, LOW);  // Turn pump OFF
            client.println("HTTP/1.1 200 OK");
            client.println("Content-Type: application/json");
            client.println();
            client.println("{\"status\":\"Pump turned on\"}");
          } else {
            client.println("HTTP/1.1 404 Not Found");
            client.println("Content-Type: text/plain");
            client.println();
            client.println("Endpoint not found.");
          }
          break;
        }
      }
    }
    delay(1);
    client.stop();
    Serial.println("Client Disconnected.");
  }
}
