import { Entity } from "./Entity";
import { GAME_CONSTANTS } from "@/config/images";
import { Club } from "./Club";

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
    this.characterId = "char_ambiguous"; // Default

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

  setCharacter(characterId) {
    this.characterId = characterId;
  }

  update(gameState) {
    this.handleMovement(gameState);
    this.updateAnimation();
  }

  checkCollision(gameState, dx = 0, dy = 0) {
    const clubs = gameState.entities.filter(e => e instanceof Club);
    
    // Player collision rectangle (from original logic: y offset 100, height reduced by 100)
    const playerRect = {
      x: this.x + dx,
      y: this.y + 100 + dy,
      width: this.width,
      height: this.height - 100
    };

    for (const club of clubs) {
      const clubRect = {
        x: club.x + 50,
        y: club.y + 200,
        width: club.width - 100,
        height: club.height - 250
      };

      if (
        playerRect.x < clubRect.x + clubRect.width &&
        playerRect.x + playerRect.width > clubRect.x &&
        playerRect.y < clubRect.y + clubRect.height &&
        playerRect.y + playerRect.height > clubRect.y
      ) {
        return true;
      }
    }
    return false;
  }

  handleMovement(gameState) {
    const movingDiagonal =
      (this.directions.up || this.directions.down) &&
      (this.directions.left || this.directions.right);
    this.currentSpeed = movingDiagonal ? this.diagonalSpeed : this.speed;

    const moveStep = this.currentSpeed;

    if (this.directions.up && !this.checkCollision(gameState, 0, -moveStep)) {
      this.y -= moveStep;
      gameState.scroll.y += moveStep;
    }
    if (this.directions.down && !this.checkCollision(gameState, 0, moveStep)) {
      this.y += moveStep;
      gameState.scroll.y -= moveStep;
    }
    if (this.directions.left && !this.checkCollision(gameState, -moveStep, 0)) {
      this.x -= moveStep;
      gameState.scroll.x += moveStep;
    }
    if (this.directions.right && !this.checkCollision(gameState, moveStep, 0)) {
      this.x += moveStep;
      gameState.scroll.x -= moveStep;
    }

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
    if (!animation) return;
    this.frameCounter -= 1;
    if (this.frameCounter <= 0) {
      this.frame = (this.frame + 1) % animation.length;
      this.frameCounter = this.frameDuration;
    }
    this.currentFrame = animation[this.frame];
  }

  draw(ctx, scroll) {
    const charImg = this.images[this.characterId];
    if (!charImg || !charImg.complete) return;

    ctx.drawImage(
      charImg,
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
      character: this.characterId,
    };
  }
}
