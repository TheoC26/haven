export class Entity {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.zOffset = 0; // Can be used for fine-tuned sorting
  }

  // The sortY is the bottom edge of the entity
  get sortY() {
    return this.y + this.height + this.zOffset;
  }

  update(gameState) {
    // To be overridden
  }

  draw(ctx, scroll) {
    // To be overridden
  }

  isOnScreen(scroll, canvas) {
    const screenX = this.x + scroll.x;
    const screenY = this.y + scroll.y;
    return (
      screenX + this.width > -100 &&
      screenX < canvas.width + 100 &&
      screenY + this.height > -100 &&
      screenY < canvas.height + 100
    );
  }
}
