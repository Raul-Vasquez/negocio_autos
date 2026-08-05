const net = require('net');

const socket = net.createConnection({
  host: '127.0.0.1',
  port: 3307
});

socket.on('connect', () => {
  console.log('✅ Puerto 3307 accesible');
  socket.end();
});

socket.on('error', (err) => {
  console.error(err);
});