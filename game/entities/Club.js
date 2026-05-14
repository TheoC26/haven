import { Entity } from "./Entity";
import { getHouseImage } from "@/config/images";

export class Club extends Entity {
  constructor(data, imagesRef) {
    // We need the image to get dimensions, but it might not be loaded yet.
    // Initial size can be approximate, will update when image is available.
    super(data.pos_x, data.pos_y, 200, 200);
    this.data = data;
    this.imagesRef = imagesRef;
    
    // Adjust Y-sort offset because the base of the house isn't the bottom of the image usually
    // In this game's art, the sorting point is around 1/4 from the bottom of the image based on old code
    this.ySortOffsetRatio = 0.25; 
  }

  get sortY() {
    const img = getHouseImage(this.data.house_image, this.imagesRef);
    const h = img?.naturalHeight || this.height;
    return this.y + h * (1 - this.ySortOffsetRatio);
  }

  draw(ctx, scroll) {
    const img = getHouseImage(this.data.house_image, this.imagesRef);
    if (!img || !img.complete) return;

    // Update dimensions once image is loaded
    this.width = img.naturalWidth;
    this.height = img.naturalHeight;

    ctx.drawImage(img, this.x + scroll.x, this.y + scroll.y);
  }
}
