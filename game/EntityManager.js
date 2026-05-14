export class EntityManager {
  constructor() {
    this.entities = [];
  }

  addEntity(entity) {
    this.entities.push(entity);
  }

  removeEntity(entity) {
    this.entities = this.entities.filter((e) => e !== entity);
  }

  clear() {
    this.entities = [];
  }

  update(gameState) {
    this.entities.forEach((entity) => entity.update(gameState));
  }

  draw(ctx, scroll, canvas) {
    // 1. Filter entities on screen
    const visibleEntities = this.entities.filter((entity) =>
      entity.isOnScreen(scroll, canvas)
    );

    // 2. Sort entities by their bottom edge (Y + Height)
    visibleEntities.sort((a, b) => a.sortY - b.sortY);

    // 3. Draw in sorted order
    visibleEntities.forEach((entity) => entity.draw(ctx, scroll));
  }
}
