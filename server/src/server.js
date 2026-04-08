const http = require('http');
const app = require('./app');
const config = require('./config');
const { setupWebSocket } = require('./realtime/heartRateWs');

const server = http.createServer(app);

// Setup WebSocket for real-time heart rate
setupWebSocket(server);

server.listen(config.port, () => {
  console.log(`🚀 Justalorie API running on port ${config.port}`);
  console.log(`   Environment: ${config.nodeEnv}`);
  console.log(`   CORS origin: ${config.corsOrigin}`);
  console.log(`   WebSocket: ws://localhost:${config.port}/ws/heart-rate`);
});
