// Shared image configuration for both experience page and level editor

// Image definitions
export const IMAGES = {
  char: "/art/spritesheet3.png",
  house1: "/art/house/house1.png",
  house2: "/art/house/house2.png",
  house3: "/art/house/house3.png",
  house4: "/art/house/house4.png",
  tree1: "/art/decoration/tree1.png",
  tree2: "/art/decoration/tree2.png",
  tree3: "/art/decoration/tree3.png",
  tree4: "/art/decoration/tree4.png",
  tree5: "/art/decoration/tree5.png",
  stone1: "/art/decoration/stone1.png",
  stone2: "/art/decoration/stone2.png",
  stone3: "/art/decoration/stone3.png",
  stone4: "/art/decoration/stone4.png",
  stone5: "/art/decoration/stone5.png",
  stone6: "/art/decoration/stone6.png",
  stone7: "/art/decoration/stone7.png",
  bush1: "/art/decoration/bush1.png",
  bush2: "/art/decoration/bush2.png",
  bush3: "/art/decoration/bush3.png",
  grass1: "/art/decoration/grass1.png",
  grass2: "/art/decoration/grass2.png",
  grass3: "/art/decoration/grass3.png",
};

// Decoration image mapping (index -> image key)
export const DECORATION_IMAGE_MAP = {
  1: "tree1",
  2: "tree2",
  3: "tree3",
  4: "tree4",
  5: "tree5",
  6: "stone1",
  7: "stone2",
  8: "stone3",
  9: "stone4",
  10: "stone5",
  11: "stone6",
  12: "stone7",
  13: "bush1",
  14: "bush2",
  15: "bush3",
  16: "grass1",
  17: "grass2",
  18: "grass3",
};

// House image mapping (index -> image key)
export const HOUSE_IMAGE_MAP = {
  1: "house1",
  2: "house2",
  3: "house3",
  4: "house4",
};

// Decorations available in level editor
export const DECORATIONS_TO_CHOOSE_FROM = [
  {
    name: "Evergreen Tree",
    image: 1,
    imageUrl: IMAGES.tree1,
  },
  {
    name: "Nice Tree",
    image: 2,
    imageUrl: IMAGES.tree2,
  },
  {
    name: "Big Tree",
    image: 3,
    imageUrl: IMAGES.tree3,
  },
  {
    name: "Skinny Tree",
    image: 4,
    imageUrl: IMAGES.tree4,
  },
  {
    name: "Sad Tree",
    image: 5,
    imageUrl: IMAGES.tree5,
  },
  {
    name: "Stone 1",
    image: 6,
    imageUrl: IMAGES.stone1,
  },
  {
    name: "Stone 2",
    image: 7,
    imageUrl: IMAGES.stone2,
  },
  {
    name: "Stone 3",
    image: 8,
    imageUrl: IMAGES.stone3,
  },
  {
    name: "Stone 4",
    image: 9,
    imageUrl: IMAGES.stone4,
  },
  {
    name: "Stone 5",
    image: 10,
    imageUrl: IMAGES.stone5,
  },
  {
    name: "Stone 6",
    image: 11,
    imageUrl: IMAGES.stone6,
  },
  {
    name: "Stone 7",
    image: 12,
    imageUrl: IMAGES.stone7,
  },
  {
    name: "Bush 1",
    image: 13,
    imageUrl: IMAGES.bush1,
  },
  {
    name: "Bush 2",
    image: 14,
    imageUrl: IMAGES.bush2,
  },
  {
    name: "Bush 3",
    image: 15,
    imageUrl: IMAGES.bush3,
  },
  {
    name: "Grass 1",
    image: 16,
    imageUrl: IMAGES.grass1,
  },
  {
    name: "Grass 2",
    image: 17,
    imageUrl: IMAGES.grass2,
  },
  {
    name: "Grass 3",
    image: 18,
    imageUrl: IMAGES.grass3,
  },
];

// Helper functions
export const getHouseImage = (houseIndex, imagesRef) => {
  if (!imagesRef) return;
  const images = imagesRef.current;
  const imageKey = HOUSE_IMAGE_MAP[houseIndex];
  return imageKey ? images[imageKey] : images.house1;
};

export const getDecorationImage = (decorationIndex, imagesRef) => {
  if (!imagesRef) return;
  const images = imagesRef.current;
  const index = Number(decorationIndex);
  const imageKey = DECORATION_IMAGE_MAP[index];
  return imageKey ? images[imageKey] : images.tree1;
};

// Canvas background color
export const CANVAS_BACKGROUND_COLOR = "#B7CA96";

// Game constants
export const GAME_CONSTANTS = {
  CLUB_INTERACTION_DISTANCE: 355,
  PLAYER_SPEED: 5,
  PLAYER_DIAGONAL_SPEED: Math.sqrt(Math.pow(5, 2) / 2),
  PLAYER_WIDTH: 391,
  PLAYER_HEIGHT: 908,
  PLAYER_SCALE: 0.166,
};
