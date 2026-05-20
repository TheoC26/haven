import { EntityManager } from "./EntityManager";
import { CANVAS_BACKGROUND_COLOR, GAME_CONSTANTS } from "@/config/images";

export class GameEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.entityManager = new EntityManager();
    this.scroll = { x: 0, y: 0 };
    this.animationFrameId = null;
    this.lastTime = 0;
    
    // Core references
    this.player = null;
    this.networkManager = null;
    this.userData = null;
    
    // Interaction state
    this.onInteractionUpdate = null; // Callback for React UI
    this.closestClubId = null;
    this.isCloseToClub = false;
  }

  setPlayer(player) {
    this.player = player;
  }

  setNetworkManager(networkManager) {
    this.networkManager = networkManager;
  }

  setUserData(userData) {
    this.userData = userData;
    if (this.player && userData?.character) {
      this.player.setCharacter(userData.character);
    }
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
      entities: this.entityManager.entities,
    };
    
    // 1. Update all entities
    this.entityManager.update(gameState);

    // 2. Handle interactions
    this.updateInteractions();

    // 3. Send network updates
    if (this.player && this.networkManager && this.userData) {
      this.networkManager.sendUpdate(
        this.player.getStateForNetwork(), 
        this.userData
      );
    }
  }

  updateInteractions() {
    if (!this.player) return;

    let minDist = Infinity;
    let closest = null;
    
    // Import Club dynamically or check type
    const clubs = this.entityManager.entities.filter(e => e.constructor.name === 'Club');

    clubs.forEach(club => {
      // Use center of player and club for distance
      const px = this.player.x + this.player.width / 2;
      const py = this.player.y + this.player.height / 2;
      
      // We use the club's stored data or dimensions
      const cx = club.x + club.width / 2;
      const cy = club.y + club.height / 2;
      
      const dist = Math.sqrt(Math.pow(px - cx, 2) + Math.pow(py - cy, 2));
      
      if (dist < minDist) {
        minDist = dist;
        closest = club;
      }
    });

    const isCloseNow = minDist < GAME_CONSTANTS.CLUB_INTERACTION_DISTANCE;
    const closestId = closest?.data?.id || null;

    if (isCloseNow !== this.isCloseToClub || closestId !== this.closestClubId) {
      this.isCloseToClub = isCloseNow;
      this.closestClubId = closestId;
      
      if (this.onInteractionUpdate) {
        this.onInteractionUpdate(isCloseNow, closest?.data || null);
      }
    }
  }

  draw() {
    this.ctx.fillStyle = CANVAS_BACKGROUND_COLOR;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.entityManager.draw(this.ctx, this.scroll, this.canvas);
  }

  resize(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
  }
}
