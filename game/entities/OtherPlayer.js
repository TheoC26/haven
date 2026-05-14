import { Entity } from "./Entity";
import { GAME_CONSTANTS } from "@/config/images";

export class OtherPlayer extends Entity {
  constructor(id, data, images) {
    const width = GAME_CONSTANTS.PLAYER_WIDTH * GAME_CONSTANTS.PLAYER_SCALE;
    const height = GAME_CONSTANTS.PLAYER_HEIGHT * GAME_CONSTANTS.PLAYER_SCALE;
    super(data.position.x, data.position.y, width, height);

    this.id = id;
    this.name = data.name || "Anonymous";
    this.images = images;
    this.currentFrame = data.currentFrame || [1, 2];
    this.state = data.state || "idle-down";

    // For interpolation
    this.targetX = this.x;
    this.targetY = this.y;
    this.lerpSpeed = 0.15; // Adjustment factor for smoothing
  }

  updateFromNetwork(data) {
    this.targetX = data.position.x;
    this.targetY = data.position.y;
    this.state = data.state;
    this.currentFrame = data.currentFrame;
    this.name = data.name || this.name;
  }

  update(gameState) {
    // Linear interpolation for smooth movement
    this.x += (this.targetX - this.x) * this.lerpSpeed;
    this.y += (this.targetY - this.y) * this.lerpSpeed;
  }

  draw(ctx, scroll) {
    if (!this.images.char || !this.images.char.complete) return;

    const rawWidth = GAME_CONSTANTS.PLAYER_WIDTH;
    const rawHeight = GAME_CONSTANTS.PLAYER_HEIGHT;

    // Draw name if close (handled by engine distance check usually, but for now just draw)
    ctx.fillStyle = "white";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.fillText(this.name, this.x + scroll.x + this.width / 2, this.y + scroll.y - 10);

    ctx.drawImage(
      this.images.char,
      this.currentFrame[0] * rawWidth,
      this.currentFrame[1] * rawHeight,
      rawWidth,
      rawHeight,
      this.x + scroll.x,
      this.y + scroll.y,
      this.width,
      this.height
    );
  }
}
