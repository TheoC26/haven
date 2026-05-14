export class NetworkManager {
  constructor(url, onMessage) {
    this.url = url;
    this.onMessage = onMessage;
    this.socket = null;
    this.playerId = null;
    this.sendInterval = 1000 / 20; // 20Hz
    this.lastSendTime = 0;
  }

  connect() {
    this.socket = new WebSocket(this.url);

    this.socket.onopen = () => {
      console.log("Connected to WebSocket server");
    };

    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "id") {
        this.playerId = message.id;
      }
      this.onMessage(message);
    };

    this.socket.onclose = () => {
      console.log("Disconnected from WebSocket server");
    };
  }

  sendUpdate(playerState, userData) {
    if (!this.socket || this.socket.readyState !== 1) return;

    const now = performance.now();
    if (now - this.lastSendTime < this.sendInterval) return;

    this.lastSendTime = now;
    this.socket.send(
      JSON.stringify({
        ...playerState,
        name: userData?.name || "Anonymous",
      })
    );
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
    }
  }
}
