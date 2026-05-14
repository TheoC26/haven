import { Entity } from "./Entity";
import { getDecorationImage } from "@/config/images";

export class Decoration extends Entity {
  constructor(data, imagesRef) {
    super(data.pos_x, data.pos_y, 100, 100);
    this.data = data;
    this.imagesRef = imagesRef;
    this.name = data.name || "";
  }

  get sortY() {
    const img = getDecorationImage(this.data.image, this.imagesRef);
    if (!img) return super.sortY;
    
    // Stones are drawn on the ground, so they should always be behind the player?
    // The user had special logic for stones.
    if (this.name.includes("Stone")) {
      return -Infinity; // Always behind
    }
    
    return this.y + (img.height * this.data.scale);
  }

  draw(ctx, scroll) {
    const img = getDecorationImage(this.data.image, this.imagesRef);
    if (!img || !img.complete) return;

    this.width = img.width * this.data.scale;
    this.height = img.height * this.data.scale;

    const shouldFlip = this.data.flip ? -1 : 1;
    
    ctx.save();
    // Move to center of decoration for rotation and scaling
    const centerX = this.x + scroll.x + this.width / 2;
    const centerY = this.y + scroll.y + this.height / 2;
    
    ctx.translate(centerX, centerY);
    ctx.scale(shouldFlip, 1);
    ctx.rotate((this.data.rotation * Math.PI) / 180);
    
    // Draw relative to center
    ctx.drawImage(
      img,
      -this.width / 2 * shouldFlip, // If flipped, we need to adjust
      -this.height / 2,
      this.width * shouldFlip,
      this.height
    );
    
    ctx.restore();
  }
}
