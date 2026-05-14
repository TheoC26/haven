import { EntityManager } from "./EntityManager";
import { CANVAS_BACKGROUND_COLOR } from "@/config/images";

export class GameEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.entityManager = new EntityManager();
    this.scroll = { x: 0, y: 0 };
    this.animationFrameId = null;
    this.lastTime = 0;
  }

  start() {
    this.lastTime = performance.now();
    const loop = (currentTime) => {
      const deltaTime = currentTime - this.lastTime;
      this.lastTime = currentTime;

      this.update(deltaTime);
      this.draw();

      this.animationFrameId = requestAnimationFrame(loop);
    };
    this.animationFrameId = requestAnimationFrame(loop);
  }

  stop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  update(deltaTime) {
    const gameState = {
      deltaTime,
      scroll: this.scroll,
      canvas: this.canvas,
    };
    this.entityManager.update(gameState);
  }

  draw() {
    // Clear canvas
    this.ctx.fillStyle = CANVAS_BACKGROUND_COLOR;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw entities
    this.entityManager.draw(this.ctx, this.scroll, this.canvas);
  }

  resize(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
  }
}
