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
