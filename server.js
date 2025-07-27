const { WebSocketServer } = require('ws');
const { v4: uuidv4 } = require('uuid');

const wss = new WebSocketServer({ port: 8082 });

const clients = new Map();

wss.on('connection', (ws) => {
  const id = uuidv4();
  const metadata = { id };
  clients.set(ws, metadata);

  // Send the new client their unique ID
  ws.send(JSON.stringify({ type: 'id', id }));

  ws.on('message', (messageAsString) => {
    const message = JSON.parse(messageAsString);
    const metadata = clients.get(ws);

    message.sender = metadata.id;

    const outbound = JSON.stringify(message);

    // Broadcast the message to all clients
    [...clients.keys()].forEach((client) => {
      if (client.readyState === ws.OPEN) {
        client.send(outbound);
      }
    });
  });

  ws.on('close', () => {
    const metadata = clients.get(ws);
    if (metadata) {
      // Notify all other clients about the disconnection
      const disconnectMessage = JSON.stringify({ type: 'disconnect', id: metadata.id });
      [...clients.keys()].forEach((client) => {
        if (client !== ws && client.readyState === ws.OPEN) {
          client.send(disconnectMessage);
        }
      });
      // Remove the client from the list
      clients.delete(ws);
      console.log(`Client ${metadata.id} disconnected`);
    }
  });
});

console.log('WebSocket server started on port 8082');
