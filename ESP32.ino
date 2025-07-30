//Using Arduino IDE
//Board used: ESP32-WROOM

const int ledPin = 2; // Onboard LED pin (GPIO2)

void setup() {
  Serial.begin(115200);
  pinMode(ledPin, OUTPUT);
}

void loop() {
  if (Serial.available() > 0) {
    String command = Serial.readStringUntil('\n');
    Serial.print("Received command: ");
    Serial.println(command);
    
    if (command == "on") {
      digitalWrite(ledPin, HIGH); // Turn the LED on
      Serial.println("LED turned ON");
    } else if (command == "off") {
      digitalWrite(ledPin, LOW); // Turn the LED off
      Serial.println("LED turned OFF");
    }
  }
}
