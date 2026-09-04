/**
 * SMART MULTI-BED IV WORKFLOW & EVENT MONITORING PLATFORM
 * Dual HX711 Load-Cell Firmware for ESP32
 * 
 * Hardware:
 *   - ESP32 Development Board
 *   - 2x 1kg Load Cells
 *   - 2x HX711 ADC Amplifiers
 *
 * Pin Connections:
 *   Channel 1 (Bed 1):
 *     DOUT -> GPIO 16
 *     SCK  -> GPIO 4
 *   Channel 2 (Bed 2):
 *     DOUT -> GPIO 17
 *     SCK  -> GPIO 18
 *
 * Ingestion Contract:
 *   POST /api/device/data
 *   Transmits JSON with readings for both channels in a single payload.
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h> // ArduinoJson v6 or v7
#include "HX711.h"

// ---------------- Wi-Fi Configuration ----------------
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// ---------------- Backend Server Endpoint ----------------
const char* SERVER_URL    = "http://192.168.1.100:8080/api/device/data";
const char* DEVICE_CODE   = "ESP32_01";

// ---------------- Hardware Pin Definitions ----------------
const int CH1_DOUT_PIN = 16;
const int CH1_SCK_PIN  = 4;

const int CH2_DOUT_PIN = 17;
const int CH2_SCK_PIN  = 18;

// ---------------- Calibration Constants (Experimental Initial) ----------------
// Default calibration factors: (raw_adc - offset) / factor = weight_in_grams
// Calibrate each load cell independently using known weights.
float CH1_CALIBRATION_FACTOR = 420.5f;
long  CH1_ZERO_OFFSET        = 843920L;

float CH2_CALIBRATION_FACTOR = 415.2f;
long  CH2_ZERO_OFFSET        = 764210L;

// ---------------- Sampling Parameters ----------------
const unsigned long SAMPLING_INTERVAL_MS = 1000; // 1 Hz sampling rate
unsigned long lastSampleTime = 0;
unsigned long sequenceNumber = 0;

HX711 scale1;
HX711 scale2;

void connectWiFi() {
  Serial.print("Connecting to Wi-Fi: ");
  Serial.println(WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[Wi-Fi] Connected!");
    Serial.print("[Wi-Fi] IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n[Wi-Fi] Connection failed. Will retry during main loop.");
  }
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n==========================================");
  Serial.println("  Smart IV Dual-Bed ESP32 Telemetry Unit  ");
  Serial.println("==========================================");

  // Initialize HX711 load cells
  scale1.begin(CH1_DOUT_PIN, CH1_SCK_PIN);
  scale2.begin(CH2_DOUT_PIN, CH2_SCK_PIN);

  Serial.println("[Sensors] Initializing Load Cell 1 (Bed 1)...");
  if (scale1.wait_ready_timeout(1000)) {
    Serial.println("[Sensors] Channel 1 Ready.");
  } else {
    Serial.println("[Sensors] WARNING: Channel 1 HX711 not found.");
  }

  Serial.println("[Sensors] Initializing Load Cell 2 (Bed 2)...");
  if (scale2.wait_ready_timeout(1000)) {
    Serial.println("[Sensors] Channel 2 Ready.");
  } else {
    Serial.println("[Sensors] WARNING: Channel 2 HX711 not found.");
  }

  // Connect to Network
  connectWiFi();
}

void loop() {
  unsigned long now = millis();
  if (now - lastSampleTime >= SAMPLING_INTERVAL_MS) {
    lastSampleTime = now;
    sequenceNumber++;

    // Ensure Wi-Fi is connected
    if (WiFi.status() != WL_CONNECTED) {
      Serial.println("[Wi-Fi] Disconnected, reconnecting...");
      WiFi.reconnect();
      return;
    }

    // Read Raw ADC values from both load cells
    long rawAdc1 = 0;
    float weight1 = 0.0f;
    if (scale1.is_ready()) {
      rawAdc1 = scale1.read();
      weight1 = (float)(rawAdc1 - CH1_ZERO_OFFSET) / CH1_CALIBRATION_FACTOR;
      if (weight1 < 0.0f) weight1 = 0.0f; // Clip negative noise
    } else {
      Serial.println("[Warning] Scale 1 not ready");
    }

    long rawAdc2 = 0;
    float weight2 = 0.0f;
    if (scale2.is_ready()) {
      rawAdc2 = scale2.read();
      weight2 = (float)(rawAdc2 - CH2_ZERO_OFFSET) / CH2_CALIBRATION_FACTOR;
      if (weight2 < 0.0f) weight2 = 0.0f;
    } else {
      Serial.println("[Warning] Scale 2 not ready");
    }

    // Construct JSON Payload
    StaticJsonDocument<512> doc;
    doc["deviceId"] = DEVICE_CODE;

    JsonArray readings = doc.createNestedArray("readings");

    // Reading 1: Bed 1
    JsonObject r1 = readings.createNestedObject();
    r1["bedId"] = "BED_1";
    r1["channelId"] = "HX711_1";
    r1["sequenceNumber"] = sequenceNumber;
    r1["weight"] = round(weight1 * 100.0) / 100.0;
    r1["rawAdc"] = rawAdc1;

    // Reading 2: Bed 2
    JsonObject r2 = readings.createNestedObject();
    r2["bedId"] = "BED_2";
    r2["channelId"] = "HX711_2";
    r2["sequenceNumber"] = sequenceNumber;
    r2["weight"] = round(weight2 * 100.0) / 100.0;
    r2["rawAdc"] = rawAdc2;

    String jsonPayload;
    serializeJson(doc, jsonPayload);

    // Send HTTP POST Request to Spring Boot Backend
    HTTPClient http;
    http.begin(SERVER_URL);
    http.addHeader("Content-Type", "application/json");
    http.setTimeout(3000); // 3s timeout

    int httpResponseCode = http.POST(jsonPayload);

    if (httpResponseCode > 0) {
      Serial.printf("[HTTP] Sent seq=%lu | Bed 1: %.2fg | Bed 2: %.2fg | Status: %d\n",
                    sequenceNumber, weight1, weight2, httpResponseCode);
    } else {
      Serial.printf("[HTTP ERROR] Failed to send packet: %s (code: %d)\n",
                    http.errorToString(httpResponseCode).c_str(), httpResponseCode);
    }

    http.end();
  }
}
