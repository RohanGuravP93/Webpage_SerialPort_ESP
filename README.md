# BASIC example of how get the ESP32/Arduino board to communicate with Webpage and control LED on the ESP32 board 

## How to
1. [Arduino setup](#Arduino-setup)
2. [Local Server](#local-server)
3. [Webpage](#webpage)

## Arduino Setup
To set up the Arduino part of the project, follow these steps:
* Connect your ESP32 board to your computer via a USB cable.
* Open the Arduino IDE and create a new sketch.
* Paste the following code into the sketch:

```cpp
const int ledPin = 2;  // LED connected to digital pin 2

void setup() {
  pinMode(ledPin, OUTPUT);
  Serial.begin(115200);
}

void loop() {
  if (Serial.available() > 0) {
    String command = Serial.readStringUntil('\n');
    if (command.equals("on")) {
      digitalWrite(ledPin, HIGH);
    } else if (command.equals("off")) {
      digitalWrite(ledPin, LOW);
    }
  }
}
```
* Upload the sketch to your ESP32 board.
* Make sure that the serial monitor is set to 115200 baud.
  
## Local Server
To create a local server that can communicate with the Arduino board and the webpage, follow these steps:

### Installing necessary libraries
You need to have Node.js installed on your computer. You also need to install the following libraries using npm:

* ```serialport```: This library allows you to communicate with serial ports in Node.js.
```
npm install serialport
```
### Creating the local server
Create a new file called ```port.js``` and paste the following code into it:
```js
const {SerialPort} = require('serialport');
const http = require('http');
const fs = require('fs');

// Create a serial port object
const port = new SerialPort({
    path:'COM5', 
    baudRate: 115200,
    dataBits: 8,
    stopBits: 1,
    parity: 'none',
});

// Set up event listeners for incoming data from Arduino
port.on('data', (data) => {
    console.log(`Received data: ${data}`);
    // Handle incoming data as needed
});

// Create an HTTP server to serve the index.html file
http.createServer((req, res) => {
    if (req.url === '/') {
        fs.readFile('index.html', (err, data) => {
            if (err) {
                console.error(err);
                res.writeHead(500);
                res.end('Error loading index.html');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(data);
            }
        });
    } else if (req.url === '/sendData') {
        let body = '';
        req.on('data', chunk => {
            body += chunk;
        });
        req.on('end', () => {
            try {
                const jsonData = JSON.parse(body);
                console.log(`Received data: ${jsonData.data}`);
                // Send data to Arduino
                if (jsonData.data === 'on') {
                    port.write('on');
                } else if (jsonData.data === 'off') {
                    port.write('off');
                }
            } catch (error) {
                console.error(error);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Error parsing JSON data');
                return;
            }

            // Send response back to client
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('Data sent to serial port');
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Resource not found');
    }
}).listen(3000, () => {
    console.log('Server listening on port 3000');
});
```
* Replace ```COM5``` with the actual COM port of your Arduino board.
* Run the server by navigating to the directory containing ```port.js``` and typing ```node port.js```.

## Webpage
To create a webpage that can send data to the local server, follow these steps:
Create a new file called ```index.html``` and paste the following code into it:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LED Control</title>
</head>
<body>
    <button id="ledon">Turn LED On</button>
    <button id="ledoff">Turn LED Off</button>

    <script>
        function sendData(data) {
            var xhr = new XMLHttpRequest();
            xhr.open("POST", "/sendData", true);
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.send(JSON.stringify({data: data}));
        }

        document.getElementById("ledon").addEventListener("click", function() {
            sendData('on');
        });

        document.getElementById("ledoff").addEventListener("click", function() {
            sendData('off');
        });
    </script>
</body>
</html>
```
* Open a web browser and navigate to ```http://localhost:3000```.
* Clicking the "Turn LED On" or "Turn LED Off" button should send data to the local server, which will then send the corresponding command to the Arduino board.
