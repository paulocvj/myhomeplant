
# **Embedded Guide**

In this file we will go through the process of setting up the hardware. I know Arduino isn't the best option but it's the fastest/easiest one I have at the moment. You can replace the Arduino with a simple A/D converter with I2C pins if you wish, or even with a Esp32 if you're into overkilling a home project.

## **Prerequisites**
- **Hardware**:
  - Raspberry Pi Zero W (or similar).
  - Arduino (Nano or Uno or similar).
  - Soil moisture sensor.
- **Software**:
  - Arduino GUI.
  - Python 3.

---

## **Installation**
### 1. Clone the Repository
```bash
git clone https://github.com/username/plant-monitor.git
cd plant-monitor/embedded/
```

### 2. Connect the moisture sensor to your Arduino (or similar)
Connect the analog input of the moisture sensor to your Arduino (A0).

### 3. Program the Arduino
Flash your Arduino with the file `arduino/moisture-sensor.ino`.

### 4. Configure the Raspberry Pi
Run:
```
sudo raspi-config
```
Then go to `Interface options -> Serial Port` and select `No` and then `Yes`. Reboot if needed.

### 5. Integrate the system
Connect your serial communication wires from the Arduino to the Raspberry Pi. Doing so will allow the Raspberry Pi to receive the analog data from the Arduino. With the said data you will be able to parse it into the POST command and send it to the server.

### 6. Crontab the python script
Run the following command to allow the python script to run since boot:
```
crontab -e
```
Inside crontab paste the following line at the end of file:
```
@reboot /PATH/TO/YOUR/FOLDER/myhomeplant/embedded/humidity_handler/humidity_sender_ino.py &
```

---