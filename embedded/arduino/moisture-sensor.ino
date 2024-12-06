// Configuration
const int hygrometerPin = A0; // Analog pin connected to the hygrometer
unsigned long previousMillis = 0;
const unsigned long interval = 120000; // 2 minutes in milliseconds

void setup() {
  Serial.begin(9600);
  pinMode(hygrometerPin, INPUT);
}

void loop() {
  unsigned long currentMillis = millis();

  if (currentMillis - previousMillis >= interval) {
    previousMillis = currentMillis;

    int sensorValue = analogRead(hygrometerPin);
    float humidity = map(sensorValue, 0, 1023, 0, 100); // Convert to percentage

    Serial.println(humidity);
  }
}
