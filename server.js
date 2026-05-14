const { WebSocketServer } = require('ws');
const { v4: uuidv4 } = require('uuid');

const wss = new WebSocketServer({ port: 8082 });

const clients = new Map();
const worldState = new Map(); // Store the last known state of each player

wss.on('connection', (ws) => {
  const id = uuidv4();
  const metadata = { id };
  clients.set(ws, metadata);

  console.log(`Client ${id} connected`);

  // Send the new client their unique ID
  ws.send(JSON.stringify({ type: 'id', id }));

  // Send the current world state to the new client
  worldState.forEach((state, senderId) => {
    ws.send(JSON.stringify({ ...state, sender: senderId, type: 'sync' }));
  });

  ws.on('message', (messageAsString) => {
    try {
      const message = JSON.parse(messageAsString);
      const metadata = clients.get(ws);
      const senderId = metadata.id;

      message.sender = senderId;
      
      // Update world state for this player
      worldState.set(senderId, message);

      const outbound = JSON.stringify(message);

      // Broadcast the message to all other clients
      [...clients.keys()].forEach((client) => {
        if (client !== ws && client.readyState === ws.OPEN) {
          client.send(outbound);
        }
      });
    } catch (e) {
      console.error('Error processing message:', e);
    }
  });

  ws.on('close', () => {
    const metadata = clients.get(ws);
    if (metadata) {
      const id = metadata.id;
      // Notify all other clients about the disconnection
      const disconnectMessage = JSON.stringify({ type: 'disconnect', id });
      [...clients.keys()].forEach((client) => {
        if (client !== ws && client.readyState === ws.OPEN) {
          client.send(disconnectMessage);
        }
      });
      
      // Remove the client from the list and world state
      clients.delete(ws);
      worldState.delete(id);
      console.log(`Client ${id} disconnected`);
    }
  });
});

console.log('WebSocket server started on port 8082');
