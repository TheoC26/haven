import { Entity } from "./Entity";
import { GAME_CONSTANTS } from "@/config/images";

export class Player extends Entity {
  constructor(x, y, images, animations) {
    const width = GAME_CONSTANTS.PLAYER_WIDTH;
    const height = GAME_CONSTANTS.PLAYER_HEIGHT;
    const scale = GAME_CONSTANTS.PLAYER_SCALE;
    super(x, y, width * scale, height * scale);

    this.rawWidth = width;
    this.rawHeight = height;
    this.scale = scale;
    this.images = images;
    this.animations = animations;

    this.speed = GAME_CONSTANTS.PLAYER_SPEED;
    this.diagonalSpeed = GAME_CONSTANTS.PLAYER_DIAGONAL_SPEED;
    this.currentSpeed = this.speed;

    this.directions = { up: false, down: false, left: false, right: false };
    this.state = "idle-down";
    this.lastDirection = "down";
    this.lastState = "idle-down";

    this.frame = 0;
    this.frameCounter = 5;
    this.frameDuration = 5;
    this.currentFrame = [1, 2]; // Default idle-down
  }

  update(gameState) {
    this.handleMovement(gameState);
    this.updateAnimation();
  }

  handleMovement(gameState) {
    // Update speed for diagonal movement
    const movingDiagonal =
      (this.directions.up || this.directions.down) &&
      (this.directions.left || this.directions.right);
    this.currentSpeed = movingDiagonal ? this.diagonalSpeed : this.speed;

    const prevX = this.x;
    const prevY = this.y;

    if (this.directions.up) {
      this.y -= this.currentSpeed;
      gameState.scroll.y += this.currentSpeed;
    }
    if (this.directions.down) {
      this.y += this.currentSpeed;
      gameState.scroll.y -= this.currentSpeed;
    }
    if (this.directions.left) {
      this.x -= this.currentSpeed;
      gameState.scroll.x += this.currentSpeed;
    }
    if (this.directions.right) {
      this.x += this.currentSpeed;
      gameState.scroll.x -= this.currentSpeed;
    }

    // Determine state
    if (this.directions.left) {
      this.state = "walk-left";
      this.lastDirection = "left";
    } else if (this.directions.right) {
      this.state = "walk-right";
      this.lastDirection = "right";
    } else if (this.directions.down) {
      this.state = "walk-down";
      this.lastDirection = "down";
    } else if (this.directions.up) {
      this.state = "walk-up";
      this.lastDirection = "up";
    } else {
      this.state = "idle-" + this.lastDirection;
    }

    if (this.state !== this.lastState) {
      this.frame = 0;
      this.frameCounter = 0;
      this.lastState = this.state;
    }
  }

  updateAnimation() {
    const animation = this.animations[this.state];
    this.frameCounter -= 1;
    if (this.frameCounter <= 0) {
      this.frame = (this.frame + 1) % animation.length;
      this.frameCounter = this.frameDuration;
    }
    this.currentFrame = animation[this.frame];
  }

  draw(ctx, scroll) {
    if (!this.images.char || !this.images.char.complete) return;

    ctx.drawImage(
      this.images.char,
      this.currentFrame[0] * this.rawWidth,
      this.currentFrame[1] * this.rawHeight,
      this.rawWidth,
      this.rawHeight,
      this.x + scroll.x,
      this.y + scroll.y,
      this.width,
      this.height
    );
  }

  getStateForNetwork() {
    return {
      position: { x: this.x, y: this.y },
      state: this.state,
      currentFrame: this.currentFrame,
    };
  }
}
