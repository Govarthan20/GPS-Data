import dgram from 'dgram';

import dotenv from 'dotenv';

dotenv.config();

const UDP_PORT = process.env.UDP_PORT || 5000; // Sensagram often allows you to configure this
const API_URL = process.env.API_URL || 'http://localhost:3000/api/gps';

const server = dgram.createSocket('udp4');

server.on('error', (err) => {
    console.log(`UDP server error:\n${err.stack}`);
    server.close();
});

server.on('message', async (msg, rinfo) => {
    try {
        const payloadString = msg.toString();
        console.log(`Received UDP from ${rinfo.address}:${rinfo.port}`);

        // Sensagram sends JSON
        const data = JSON.parse(payloadString);

        // Typically Sensagram provides GPS data inside the json structure.
        // Use the sender's IP address to uniquely identify each phone/device.
        const deviceIp = rinfo.address;

        let lat, lon, spd, dir, acc, alt;

        // Try to extract GPS data based on Sensagram format
        if (data.gps) {
            lat = data.gps.latitude;
            lon = data.gps.longitude;
            spd = data.gps.speed;
            dir = data.gps.bearing; // Sensagram uses bearing
            acc = data.gps.accuracy;
            alt = data.gps.altitude;
        } else {
            // Flat format fallback
            lat = data.latitude;
            lon = data.longitude;
            spd = data.speed;
            dir = data.bearing;
            acc = data.accuracy;
            alt = data.altitude;
        }

        if (lat !== undefined && lon !== undefined) {
            const payload = {
                device_ip: deviceIp,
                latitude: lat,
                longitude: lon,
                speed: spd,
                heading: dir,
                accuracy: acc,
                altitude: alt
            };

            // Forward to Next.js API
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                console.log(`Forwarded GPS from device ${deviceIp} to API successfully.`);
            } else {
                console.error(`Failed to forward to API: ${response.status} ${response.statusText}`);
            }
        } else {
            console.log('Received packet does not contain GPS coordinates, ignoring.', data);
        }
    } catch (err) {
        console.error('Error processing UDP message:', err);
    }
});

server.on('listening', () => {
    const address = server.address();
    console.log(`Sensagram UDP Proxy listening on port ${address.port}`);
    console.log(`Forwarding GPS data to ${API_URL}`);
    console.log(`Configure your Sensagram app to send data to your PC's IP address on port ${address.port}`);
});

server.bind(UDP_PORT);
