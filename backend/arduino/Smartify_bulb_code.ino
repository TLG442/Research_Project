#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <PubSubClient.h>
#include <ArduinoOTA.h>
#include <ESP8266WebServer.h>
#include <LittleFS.h>

#define LED_ON  LOW
#define LED_OFF HIGH

const char* deviceName = "Room1";
const char* defaultSSID     = "testAP";
const char* defaultPassword = "p@ssw0rd78";
const char* otaPassword     = "myOTAPass";
const char* mqttServer = "test.mosquitto.org";
const uint16_t mqttPort = 1883;
String mqttTopic = String("smartify_home/") + deviceName + "/light";

const int LED_PIN = LED_BUILTIN;
const int RELAY_PIN = D2;

WiFiClient espClient;
PubSubClient mqttClient(espClient);
ESP8266WebServer webServer(80);
const char* configFilename = "/wifi_config.txt";
bool configPortalActive = false;

bool connectToWiFi(const String &ssid, const String &pass, int maxAttempts);
bool checkInternetConnectivity();
void startConfigPortal();
void handleRoot();
void handleSaveCredentials();
void loadWiFiCredentials(String &ssid, String &pass);
void saveWiFiCredentials(const String &ssid, const String &pass);
void setupOTA();
void connectToMQTT();
void mqttCallback(char* topic, byte* payload, unsigned int length);

void setup() {
  Serial.begin(115200);
  delay(100);
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LED_OFF);
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, HIGH);

  if (!LittleFS.begin()) {
    Serial.println("Failed to mount LittleFS. Formatting...");
    LittleFS.format();
    LittleFS.begin();
  }

  bool wifiConnected = connectToWiFi(defaultSSID, defaultPassword, 5);
  if (wifiConnected && !checkInternetConnectivity()) {
    wifiConnected = false;
  }

  if (!wifiConnected) {
    Serial.println("Trying saved Wi-Fi credentials...");
    String storedSSID, storedPASS;
    loadWiFiCredentials(storedSSID, storedPASS);
    if (!storedSSID.isEmpty() && !storedPASS.isEmpty()) {
      wifiConnected = connectToWiFi(storedSSID, storedPASS, 5);
      if (wifiConnected && !checkInternetConnectivity()) {
        wifiConnected = false;
      }
    }
  }

  if (!wifiConnected) {
    startConfigPortal();
  }

  if (WiFi.status() == WL_CONNECTED && checkInternetConnectivity()) {
    setupOTA();
    mqttClient.setServer(mqttServer, mqttPort);
    mqttClient.setCallback(mqttCallback);
    connectToMQTT();
  }
}

void loop() {
  if (configPortalActive) {
    webServer.handleClient();
    return;
  }
  if (WiFi.status() != WL_CONNECTED && !configPortalActive) {
    Serial.println("Wi-Fi disconnected, attempting reconnect...");
    bool reconnected = connectToWiFi(WiFi.SSID(), WiFi.psk(), 5);
    if (!reconnected || !checkInternetConnectivity()) {
      startConfigPortal();
      return;
    }
  }
  ArduinoOTA.handle();
  if (!mqttClient.connected()) {
    connectToMQTT();
  }
  mqttClient.loop();
}

bool connectToWiFi(const String &ssid, const String &pass, int maxAttempts) {
  Serial.printf("Connecting to Wi-Fi: %s\n", ssid.c_str());
  WiFi.mode(WIFI_STA);
  WiFi.setPhyMode(WIFI_PHY_MODE_11B);
  WiFi.setOutputPower(16);
  WiFi.begin(ssid.c_str(), pass.c_str());

  for (int attempts = 1; attempts <= maxAttempts; attempts++) {
    if (WiFi.status() == WL_CONNECTED) {
      Serial.print("Wi-Fi connected! IP: ");
      Serial.println(WiFi.localIP());
      return true;
    }
    Serial.printf("Attempt %d/%d...\n", attempts, maxAttempts);
    digitalWrite(LED_PIN, LED_ON);
    delay(200);
    digitalWrite(LED_PIN, LED_OFF);
    delay(1800);
  }
  return WiFi.status() == WL_CONNECTED;
}

bool checkInternetConnectivity() {
  if (WiFi.status() != WL_CONNECTED) return false;
  WiFiClient wifiClient;
  HTTPClient http;
  http.begin(wifiClient, "http://clients3.google.com/generate_204");
  int httpCode = http.GET();
  bool success = (httpCode == 204);
  http.end();
  return success;
}

void startConfigPortal() {
  configPortalActive = true;
  WiFi.mode(WIFI_AP);
  String apName = String(deviceName) + "_ConfigAP";
  WiFi.softAP(apName.c_str(), "12345678");
  webServer.on("/", HTTP_GET, handleRoot);
  webServer.on("/save", HTTP_POST, handleSaveCredentials);
  webServer.begin();
}

void handleRoot() {
  webServer.send(200, "text/html", "<h2>Enter Wi-Fi Credentials</h2>"
    "<form action='/save' method='POST'>"
    "SSID: <input type='text' name='ssid'><br><br>"
    "Password: <input type='password' name='pass'><br><br>"
    "<input type='submit' value='Save'></form>");
}

void handleSaveCredentials() {
  if (webServer.hasArg("ssid") && webServer.hasArg("pass")) {
    saveWiFiCredentials(webServer.arg("ssid"), webServer.arg("pass"));
    webServer.send(200, "text/html", "Saved! Rebooting...");
    delay(1000);
    ESP.restart();
  }
}

void loadWiFiCredentials(String &ssid, String &pass) {
  File file = LittleFS.open(configFilename, "r");
  if (!file) return;
  ssid = file.readStringUntil('\n');
  pass = file.readStringUntil('\n');
  file.close();
}

void saveWiFiCredentials(const String &ssid, const String &pass) {
  File file = LittleFS.open(configFilename, "w");
  file.println(ssid);
  file.println(pass);
  file.close();
}

void setupOTA() {
  ArduinoOTA.setHostname(deviceName);
  ArduinoOTA.setPassword(otaPassword);
  ArduinoOTA.begin();
}

void connectToMQTT() {
  if (mqttClient.connect(String(deviceName).c_str())) {
    mqttClient.subscribe(mqttTopic.c_str());
  }
}

void mqttCallback(char* topic, byte* payload, unsigned int length) {
  String message;
  for (unsigned int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  digitalWrite(LED_PIN, LED_ON);
  delay(100);
  digitalWrite(LED_PIN, LED_OFF);
  digitalWrite(RELAY_PIN, message.equalsIgnoreCase("ON") ? LOW : HIGH);
}
