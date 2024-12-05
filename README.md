
# **Plant Monitor**

A simple system for soil moisture monitoring, designed to run on a server and send sensor data via Raspberry Pi Zero W.

## **Description**
The **Plant Monitor** is an IoT project to monitor soil moisture for plants. It includes:
- A Node.js server with WebSocket for real-time communication.
- SQLite database to store moisture data.
- Simple web interface for data visualization.
- A data-sending script configured to run on a Raspberry Pi Zero W.

## **Features**
- Stores and displays the most recent moisture data sent by the sensor.
- Real-time chart updates on the interface using WebSocket.
- Structured logs for debugging and monitoring.

---

## **Prerequisites**
- **Hardware**:
  - Raspberry Pi Zero W (or similar).
  - Soil moisture sensor.
- **Software**:
  - Node.js (>= v18.0).
  - SQLite3.
  - Bash (for scripts).
  - `npm` to manage dependencies.

---

## **Installation**
### 1. Clone the Repository
```bash
git clone https://github.com/username/plant-monitor.git
cd plant-monitor
```

### 2. Run the Makefile
Use the Makefile to install dependencies and configure the project:
```bash
make
```

### 3. Configure the Data Sending Script
Ensure the `humidity_sender.sh` script is properly configured to send data to the server:
```bash
#!/bin/bash
SERVER_URL="http://<your-server>:3000/api/humidity"
```

Replace `<your-server>` with the IP address or hostname of your server.

### 4. Reboot to Activate the Cronjob
After installation, reboot the system to activate the data-sending cronjob:
```bash
sudo reboot
```

---

## **Usage**
### Start the Server Manually
To start the server manually, run:
```bash
make start-server
```

### Test Data Sending with `curl`
```bash
make test-curl
```

---

## **Project Structure**

```plaintext
plant-monitor/
├── server.js          # Node.js server
├── logger.js          # Logging system
├── Makefile           # Project automation
├── humidity_sender.sh # Raspberry Pi data-sending script
├── frontend/
│   ├── index.html     # Web interface
│   ├── styles.css     # Interface styles
│   └── script.js      # Frontend logic
```

---

## **How It Works**
1. The Raspberry Pi sends soil moisture data every 2 minutes via a `POST` request.
2. The server stores the data in a SQLite database.
3. The server uses WebSocket to notify connected clients of new data.
4. The web interface updates the real-time chart dynamically.

---

## **License**
This project is licensed under the [GPL-3.0 license](LICENSE).
