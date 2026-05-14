import { Entity } from "./Entity";

export class Creature extends Entity {
  constructor(x, y, imageSrc, speed = 1) {
    super(x, y, 40, 40); // Initial size
    this.img = new Image();
    this.img.src = imageSrc;
    
    this.bounds = { left: x - 200, top: y - 200, width: 400, height: 400 };
    this.target = null;
    this.isWalking = false;
    this.waitTimer = 0;
    this.angle = 0;
    this.angleDir = 1;
    this.speed = speed;
    this.scale = 0.08;
  }

  update(gameState) {
    // Logic from the original code
    if (this.waitTimer > 0) {
      this.waitTimer--;
      this.angle = 0;
      return;
    }

    if (!this.target) {
      const randX = this.bounds.left + Math.random() * this.bounds.width;
      const randY = this.bounds.top + Math.random() * this.bounds.height;
      this.target = { x: randX, y: randY };
      this.isWalking = true;
    }

    if (this.isWalking && this.target) {
      const dx = this.target.x - this.x;
      const dy = this.target.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 2) {
        this.isWalking = false;
        this.target = null;
        this.waitTimer = 60 + Math.random() * 120;
      } else {
        this.x += (dx / dist) * this.speed;
        this.y += (dy / dist) * this.speed;
      }
    }

    // Bobble effect
    if (this.isWalking) {
      this.angle += 0.05 * this.angleDir;
      if (Math.abs(this.angle) > 0.18) {
        this.angleDir *= -1;
      }
    }
  }

  draw(ctx, scroll) {
    if (!this.img.complete) return;

    const width = this.img.width * this.scale;
    const height = this.img.height * this.scale;
    this.width = width;
    this.height = height;

    ctx.save();
    ctx.translate(
      this.x + scroll.x + width / 2,
      this.y + scroll.y + height
    );
    ctx.rotate(this.angle);
    // Adjust Y slightly to make it look grounded
    ctx.drawImage(this.img, -width / 2, -height / 2 - 30, width, height);
    ctx.restore();
  }
}
