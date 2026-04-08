const { WebSocketServer } = require('ws');
const url = require('url');

let wss = null;
const clients = new Set();

function setupWebSocket(server) {
  wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    const pathname = url.parse(request.url).pathname;

    if (pathname === '/ws/heart-rate') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  wss.on('connection', (ws) => {
    clients.add(ws);
    console.log(`[WS] Heart rate client connected. Total: ${clients.size}`);

    ws.send(JSON.stringify({
      type: 'connected',
      message: 'Connected to Justalorie heart rate stream',
      timestamp: new Date().toISOString(),
    }));

    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString());
        // Handle incoming heart rate data from client (e.g., from device/sensor)
        if (msg.type === 'heartRate' && msg.bpm) {
          broadcastHeartRate({
            bpm: msg.bpm,
            capturedAt: new Date().toISOString(),
            sourceType: msg.sourceType || 'DEVICE',
          });
        }
      } catch (err) {
        console.error('[WS] Invalid message:', err.message);
      }
    });

    ws.on('close', () => {
      clients.delete(ws);
      console.log(`[WS] Heart rate client disconnected. Total: ${clients.size}`);
    });

    ws.on('error', (err) => {
      console.error('[WS] Client error:', err.message);
      clients.delete(ws);
    });
  });

  console.log('[WS] Heart rate WebSocket server initialized');
}

function broadcastHeartRate(data) {
  const message = JSON.stringify({
    type: 'heartRate',
    ...data,
    timestamp: new Date().toISOString(),
  });

  clients.forEach((client) => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(message);
    }
  });
}

function getConnectedClients() {
  return clients.size;
}

module.exports = { setupWebSocket, broadcastHeartRate, getConnectedClients };
