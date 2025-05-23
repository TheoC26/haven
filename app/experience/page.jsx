"use client";
import Header from "@/components/Header";
import GreetingModal from "@/components/modals/GreetingModal";
import AuthModal from "@/components/modals/AuthModal";
import OnboardingModal from "@/components/modals/OnboardingModal";
import ProfileModal from "@/components/modals/ProfileModal";
import HouseModal from "@/components/modals/HouseModal";
import ApplyModal from "@/components/modals/ApplyModal";
import SuggestClubModal from "@/components/modals/SuggestClubModal";
import { useAuth } from "@/hooks/useAuth";
import { useDecorations } from "@/hooks/useDecorations";
import { useClubs } from "@/hooks/useClubs";
import React, { useState, useRef, useEffect } from "react";
import useStateRef from "@/hooks/stateRef";

const Experience = () => {
  // Canvas references
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const animationRef = useRef(null);

  // Game state
  const [isCloseEnoughToClub, setIsCloseEnoughToClub] = useState(false);
  const [closestClubState, setClosestClubState] = useState(null);
  const [message, setMessage] = useState("");

  // Modal states
  const [showGreeting, setShowGreeting] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [selectedClub, setSelectedClub] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showSuggestModal, setShowSuggestModal] = useState(false);

  // Game data state
  const [clubsState, setClubsState] = useState([]);
  const [decorationsState, setDecorationsState, decorationsStateRef] =
    useStateRef([]);

  // Player state (moved from direct variables to state refs to persist across renders)
  const playerStateRef = useRef({
    position: {
      x: window.innerWidth / 2 - (391 * 0.166) / 2,
      y: window.innerHeight / 2 - (908 * 0.166) / 2,
    },
    speed: 5,
    diagonalSpeed: Math.sqrt(Math.pow(5, 2) / 2),
    currentSpeed: 5,
    directions: {
      up: false,
      down: false,
      left: false,
      right: false,
    },
    width: 391,
    height: 908,
    scale: 0.166,
    state: "idle-down",
    lastDirection: "down",
    frameDuration: 5,
    frameCounter: 5,
    frame: 0,
    currentFrame: [0, 0],
    lastState: "idle-down",
  });

  // Game world state
  const gameStateRef = useRef({
    scroll: { x: 0, y: 0 },
    closeEnough: false,
    closeEnoughDecoration: false,
    closestClub: null,
    closestDecoration: null,
  });

  // Animation data
  const animationsRef = useRef({
    "idle-down": [[1, 2]],
    "idle-right": [[0, 0]],
    "idle-up": [[1, 3]],
    "idle-left": [[0, 1]],
    "walk-down": [
      [0, 2],
      [1, 2],
      [2, 2],
      [1, 2],
    ],
    "walk-right": [
      [0, 0],
      [1, 0],
      [2, 0],
      [3, 0],
    ],
    "walk-up": [
      [0, 3],
      [1, 3],
      [2, 3],
      [1, 3],
    ],
    "walk-left": [
      [0, 1],
      [1, 1],
      [2, 1],
      [3, 1],
    ],
  });

  // Images
  const imagesRef = useRef({
    char: new Image(),
    house1: new Image(),
    house2: new Image(),
    house3: new Image(),
    house4: new Image(),
    tree1: new Image(),
    stones: new Image(),
  });

  const decorationsToChooseFromRef = useRef([
    {
      name: "Tree",
      image: 1,
      imageUrl: "/art/decoration/tree1.png",
    },
    {
      name: "Stones",
      image: 2,
      imageUrl: "/art/decoration/stones.png",
    },
  ]);

  // Get auth and club data
  const { user, checkUserExists } = useAuth();
  const { clubs, loading: loadingClubs } = useClubs();
  const { decorations, loading: loadingDecorations } = useDecorations();

  // Load images
  useEffect(() => {
    imagesRef.current.char.src = "/art/spritesheet3.png";
    imagesRef.current.house1.src = "/art/house/house1.png";
    imagesRef.current.house2.src = "/art/house/house2.png";
    imagesRef.current.house3.src = "/art/house/house3.png";
    imagesRef.current.house4.src = "/art/house/house4.png";
    imagesRef.current.tree1.src = "/art/decoration/tree1.png";
    imagesRef.current.stones.src = "/art/decoration/stones.png";
  }, []);

  // Check if first visit to show greeting
  useEffect(() => {
    const hasVisited = localStorage.getItem("hasVisited");
    if (!hasVisited) {
      setShowGreeting(true);
      localStorage.setItem("hasVisited", "true");
    }
  }, []);

  // Update clubs state when clubs data changes
  useEffect(() => {
    if (clubs && clubs.length > 0) {
      setClubsState(clubs);
    }
  }, [clubs]);

  useEffect(() => {
    if (!decorations || decorations.length === 0) return;
    console.log("Decorations loaded from Firebase:", decorations);
    setDecorationsState(decorations);
  }, [decorations]);

  // Setup canvas and event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    ctxRef.current = canvas.getContext("2d");

    // Handle window resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Update player position on resize
      playerStateRef.current.position = {
        x:
          window.innerWidth / 2 -
          (playerStateRef.current.width * playerStateRef.current.scale) / 2,
        y:
          window.innerHeight / 2 -
          (playerStateRef.current.height * playerStateRef.current.scale) / 2,
      };
    };

    // Set initial canvas size
    handleResize();

    // Register event listeners
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("resize", handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Start the game loop when clubs data is loaded
  useEffect(() => {
    if (loadingClubs || !canvasRef.current || !ctxRef.current) {
      return;
    }

    const draw = () => {
      updateCanvas();
      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [loadingClubs, clubsState]);

  const getHouseImage = (house_index) => {
    const images = imagesRef.current;
    if (house_index === 1) return images.house1;
    if (house_index === 2) return images.house2;
    if (house_index === 3) return images.house3;
    if (house_index === 4) return images.house4;
    return null;
  };

  const getDecorationImage = (decoration_index) => {
    const images = imagesRef.current;
    // Convert to number to ensure proper comparison (in case it comes as string from Firebase)
    const index = Number(decoration_index);
    if (index === 1) return images.tree1;
    if (index === 2) return images.stones;
    return images.tree1; // Default to tree1
  };

  // Handler functions
  const handleLoginClick = () => {
    setShowAuth(true);
  };

  const handleProfileClick = () => {
    setShowProfile(true);
  };

  const handleAuthComplete = async () => {
    // User has authenticated, check if they need onboarding
    if (user && !user.isAnonymous) {
      const exists = await checkUserExists(user.uid);
      if (!exists) {
        setShowOnboarding(true);
      }
    }
  };

  const handleClubClick = (club) => {
    setSelectedClub(club);
  };

  const handleApplyClick = () => {
    setShowApplyModal(true);
  };

  const handleClosestClubClick = () => {
    if (closestClubState) {
      handleClubClick(closestClubState);
    }
  };

  // Keyboard input handlers
  function handleKeyDown(event) {
    const player = playerStateRef.current;

    if (event.code === "ArrowLeft") {
      player.directions.left = true;
    }
    if (event.code === "ArrowRight") {
      player.directions.right = true;
    }
    if (event.code === "ArrowUp") {
      player.directions.up = true;
    }
    if (event.code === "ArrowDown") {
      player.directions.down = true;
    }
    if (event.code === "Enter") {
      if (gameStateRef.current.closeEnough) {
        handleClubClick(gameStateRef.current.closestClub);
      }
    }
  }

  function handleKeyUp(event) {
    const player = playerStateRef.current;

    if (event.code === "ArrowLeft") {
      player.directions.left = false;
    }
    if (event.code === "ArrowRight") {
      player.directions.right = false;
    }
    if (event.code === "ArrowUp") {
      player.directions.up = false;
    }
    if (event.code === "ArrowDown") {
      player.directions.down = false;
    }
  }

  // Game state handlers
  function stateHandler() {
    const player = playerStateRef.current;

    if (player.directions.left) {
      player.state = "walk-left";
      player.lastDirection = "left";
    } else if (player.directions.right) {
      player.state = "walk-right";
      player.lastDirection = "right";
    } else if (player.directions.down) {
      player.state = "walk-down";
      player.lastDirection = "down";
    } else if (player.directions.up) {
      player.state = "walk-up";
      player.lastDirection = "up";
    } else {
      player.state = "idle-" + player.lastDirection;
    }

    if (player.state !== player.lastState) {
      player.frame = 0;
      player.frameCounter = 0;
      player.lastState = player.state;
    }
  }

  function animationHandler() {
    const player = playerStateRef.current;
    const animations = animationsRef.current;

    player.frameCounter -= 1;
    if (player.frameCounter <= 0) {
      player.frame += 1;
      if (player.frame >= animations[player.state].length) {
        player.frame = 0;
      }
      player.frameCounter = player.frameDuration;
    }

    player.currentFrame = animations[player.state][player.frame];
  }

  function checkCollisionWithClubs(direction) {
    const player = playerStateRef.current;
    const gameState = gameStateRef.current;
    const playerRect = {
      x: player.position.x,
      y: player.position.y + 100,
      width: player.width * player.scale,
      height: player.height * player.scale - 100,
    };
    const closestClub = gameState.closestClub;
    if (!closestClub) return false;
    const clubRect = {
      x: closestClub.pos_x + 50,
      y: closestClub.pos_y + 200,
      width: getHouseImage(closestClub.house_image).naturalWidth - 100,
      height: getHouseImage(closestClub.house_image).naturalHeight - 250,
    };
    const offset = 10; // Adjust this value as needed
    if (direction === "up") {
      playerRect.y -= offset;
    } else if (direction === "down") {
      playerRect.y += offset;
    } else if (direction === "left") {
      playerRect.x -= offset;
    } else if (direction === "right") {
      playerRect.x += offset;
    }
    console.log("Player Rect:", playerRect, "Club Rect:", clubRect);
    return (
      playerRect.x < clubRect.x + clubRect.width &&
      playerRect.x + playerRect.width > clubRect.x &&
      playerRect.y < clubRect.y + clubRect.height &&
      playerRect.y + playerRect.height > clubRect.y
    );
  }

  function updatePlayerPosition() {
    const player = playerStateRef.current;
    const gameState = gameStateRef.current;

    if (
      (player.directions.up && player.directions.right) ||
      (player.directions.up && player.directions.left) ||
      (player.directions.down && player.directions.right) ||
      (player.directions.down && player.directions.left)
    ) {
      player.currentSpeed = player.diagonalSpeed;
    } else {
      player.currentSpeed = player.speed;
    }

    if (player.directions.up && !checkCollisionWithClubs("up")) {
      player.position.y -= player.currentSpeed;
      gameState.scroll.y += player.currentSpeed;
    }
    if (player.directions.down && !checkCollisionWithClubs("down")) {
      player.position.y += player.currentSpeed;
      gameState.scroll.y -= player.currentSpeed;
    }
    if (player.directions.left && !checkCollisionWithClubs("left")) {
      player.position.x -= player.currentSpeed;
      gameState.scroll.x += player.currentSpeed;
    }
    if (player.directions.right && !checkCollisionWithClubs("right")) {
      player.position.x += player.currentSpeed;
      gameState.scroll.x -= player.currentSpeed;
    }
  }

  function drawDecorations() {
    const ctx = ctxRef.current;
    const gameState = gameStateRef.current;
    const player = playerStateRef.current;

    // Use decorationsStateRef.current to ensure we have the latest data
    const decorations = decorationsStateRef.current;
    if (!decorations || !decorations.length || !ctx) return;

    // Debug to confirm we have decorations to draw

    let shortestDistance = Infinity;
    // console.log("Drawing decorations:", decorations.length);
    for (const decoration of decorations) {
      // Skip if missing required properties
      if (
        !decoration ||
        typeof decoration.image === "undefined" ||
        typeof decoration.pos_x === "undefined" ||
        typeof decoration.pos_y === "undefined"
      ) {
        console.warn("Skipping invalid decoration:", decoration);
        continue;
      }
      const decorationImg = getDecorationImage(decoration.image);
      // Skip if image isn't loaded
      if (!decorationImg || !decorationImg.complete) {
        console.warn("Decoration image not ready:", decoration.image);
        continue;
      }

      if (decoration.name != "Stones") {
        const distance = Math.sqrt(
          Math.pow(
            player.position.x +
              (player.width * player.scale) / 2 -
              (decoration.pos_x + decorationImg.naturalWidth / 2),
            2
          ) +
            Math.pow(
              player.position.y +
                (player.height * player.scale) / 2 -
                (decoration.pos_y + decorationImg.naturalHeight / 2),
              2
            )
        );

        if (distance < shortestDistance) {
          shortestDistance = distance;
          gameState.closestDecoration = decoration;
          // setClosestDecorationState(decoration);
          if (distance < 275) {
            gameState.closeEnoughDecoration = true;
          } else {
            gameState.closeEnoughDecoration = false;
          }
        }
      }

      // Debug position values
      // console.log(`Drawing decoration at: ${decoration.pos_x + gameState.scroll.x}, ${decoration.pos_y + gameState.scroll.y}`);
      try {
        const shouldFlip = decoration.flip ? -1 : 1;
        // rotate first
        ctx.save();
        ctx.translate(
          decoration.pos_x + gameState.scroll.x + decorationImg.width / 2,
          decoration.pos_y + gameState.scroll.y + decorationImg.height / 2
        );
        ctx.scale(shouldFlip, 1);
        ctx.rotate((decoration.rotation * Math.PI) / 180);
        ctx.translate(
          -(decoration.pos_x + gameState.scroll.x + decorationImg.width / 2),
          -(decoration.pos_y + gameState.scroll.y + decorationImg.height / 2)
        );
        ctx.drawImage(
          decorationImg,
          decoration.pos_x + gameState.scroll.x,
          decoration.pos_y + gameState.scroll.y,
          decorationImg.width * decoration.scale * shouldFlip,
          decorationImg.height * decoration.scale
        );
        ctx.restore();
      } catch (err) {
        console.error("Error drawing decoration:", err, decoration);
      }
    }
  }

  function drawClubs() {
    const ctx = ctxRef.current;
    const gameState = gameStateRef.current;
    const player = playerStateRef.current;
    const images = imagesRef.current;

    if (!clubsState || !ctx) return;

    let shortestDistance = Infinity;

    for (const club of clubsState) {
      // Use house1 image as default if club.house_image is undefined
      const houseImg = getHouseImage(club.house_image) || images.house1;

      const distance = Math.sqrt(
        Math.pow(
          player.position.x +
            (player.width * player.scale) / 2 -
            (club.pos_x + houseImg.naturalWidth / 2),
          2
        ) +
          Math.pow(
            player.position.y +
              (player.height * player.scale) / 2 -
              (club.pos_y + houseImg.naturalHeight / 2),
            2
          )
      );

      if (distance < shortestDistance) {
        shortestDistance = distance;
        gameState.closestClub = club;
        setClosestClubState(club);

        if (distance < 275) {
          gameState.closeEnough = true;
          setIsCloseEnoughToClub(true);
          setMessage(`Enter ${club.name} club`);
        } else {
          gameState.closeEnough = false;
          setIsCloseEnoughToClub(false);
        }
      }

      ctx.drawImage(
        houseImg,
        club.pos_x + gameState.scroll.x,
        club.pos_y + gameState.scroll.y
      );
    }
  }

  function drawClosestDecoration() {
    const ctx = ctxRef.current;
    const gameState = gameStateRef.current;
    const player = playerStateRef.current;
    const images = imagesRef.current;

    if (!gameState.closestDecoration || !ctx) return;
    const closestDecoration = gameState.closestDecoration;
    const decorationImg = getDecorationImage(closestDecoration.image);
    if (!decorationImg) return;
    if (
      player.position.y <
      closestDecoration.pos_y +
        (decorationImg.naturalHeight * closestDecoration.scale) / 2
    ) {
      const shouldFlip = closestDecoration.flip ? -1 : 1;
      // rotate first
      ctx.save();
      ctx.translate(
        closestDecoration.pos_x + gameState.scroll.x + decorationImg.width / 2,
        closestDecoration.pos_y + gameState.scroll.y + decorationImg.height / 2
      );
      ctx.scale(shouldFlip, 1);
      ctx.rotate((closestDecoration.rotation * Math.PI) / 180);
      ctx.translate(
        -(
          closestDecoration.pos_x +
          gameState.scroll.x +
          decorationImg.width / 2
        ),
        -(
          closestDecoration.pos_y +
          gameState.scroll.y +
          decorationImg.height / 2
        )
      );
      ctx.drawImage(
        decorationImg,
        closestDecoration.pos_x + gameState.scroll.x,
        closestDecoration.pos_y + gameState.scroll.y,
        decorationImg.width * closestDecoration.scale * shouldFlip,
        decorationImg.height * closestDecoration.scale
      );
      ctx.restore();
    }
  }

  function drawClosestClub() {
    const ctx = ctxRef.current;
    const gameState = gameStateRef.current;
    const player = playerStateRef.current;
    const images = imagesRef.current;

    if (!gameState.closestClub || !ctx) return;

    const closestClub = gameState.closestClub;
    const houseImg = getHouseImage(closestClub.house_image) || images.house1;

    if (player.position.y < closestClub.pos_y + houseImg.naturalHeight / 4) {
      ctx.drawImage(
        houseImg,
        closestClub.pos_x + gameState.scroll.x,
        closestClub.pos_y + gameState.scroll.y
      );
    }
  }

  function drawPlayer() {
    const ctx = ctxRef.current;
    const gameState = gameStateRef.current;
    const player = playerStateRef.current;
    const images = imagesRef.current;

    if (!ctx) return;

    ctx.drawImage(
      images.char,
      player.currentFrame[0] * player.width,
      player.currentFrame[1] * player.height,
      player.width,
      player.height,
      player.position.x + gameState.scroll.x,
      player.position.y + gameState.scroll.y,
      player.width * player.scale,
      player.height * player.scale
    );
  }

  function clearCanvas() {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;

    if (!ctx || !canvas) return;

    ctx.fillStyle = "#B3DAAA";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function updateCanvas() {
    clearCanvas();
    updatePlayerPosition();
    drawClubs();
    drawDecorations();
    drawPlayer();
    drawClosestClub();
    drawClosestDecoration();
    stateHandler();
    animationHandler();
  }

  return (
    <main className="">
      <div className="fixed w-full h-full inset-0">
        <canvas
          className="w-full h-full"
          ref={canvasRef}
          width={window.innerWidth}
          height={window.innerHeight}
        ></canvas>
      </div>
      {loadingClubs && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#6A3C1F]"></div>
          <p className="mt-4 text-[#6A3C1F] font-medium">Loading clubs...</p>
        </div>
      )}
      <button
        onClick={handleClosestClubClick}
        className={`fixed cursor-pointer outline-none flex left-1/2 gap-2 top-1/3 border-2 border-green-800 text-green-800 -translate-x-1/2 translate-y-0 scale-96 bg-white px-4 py-2 rounded-lg transition-all  opacity-0 ${
          isCloseEnoughToClub && "opacity-100 translate-y-4 scale-100"
        }`}
      >
        <div>{message}</div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24px"
          viewBox="0 -960 960 960"
          width="24px"
          fill="#016630"
        >
          <path d="m284.91-434.5 106.68 106.67q12.67 12.68 12.67 31.83t-12.67 31.83q-12.68 12.67-31.83 12.67t-31.83-12.67l-184-183.76q-6.71-6.72-9.81-14.92-3.1-8.19-3.1-17.15 0-8.96 3.1-17.15 3.1-8.2 9.81-14.92l184-183.76q12.68-12.67 31.83-12.67t31.83 12.67q12.67 12.68 12.67 31.83t-12.67 31.83L284.91-525.5h472.22V-640q0-19.15 13.17-32.33 13.18-13.17 32.33-13.17t32.33 13.17q13.17 13.18 13.17 32.33v114.5q0 37.78-26.61 64.39t-64.39 26.61H284.91Z" />
        </svg>
      </button>
      {user && !user.isAnonymous && (
        <div className="fixed bottom-6 right-6">
          <button
            onClick={() => setShowSuggestModal(true)}
            className="bg-[#6A3C1F] text-white py-3 px-5 rounded-full hover:bg-[#8B6B4F] transition-colors shadow-lg flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5 mr-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            Suggest a Club
          </button>
        </div>
      )}

      <Header
        onInfoClick={() => setShowGreeting(true)}
        onLoginClick={handleLoginClick}
        onProfileClick={handleProfileClick}
      />

      {/* Modals */}
      <GreetingModal
        isOpen={showGreeting}
        onClose={() => setShowGreeting(false)}
        onLogin={() => {
          setShowGreeting(false);
          setShowAuth(true);
        }}
        onSkip={() => setShowGreeting(false)}
      />

      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onAuthComplete={handleAuthComplete}
      />

      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />

      <ProfileModal
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
      />

      <HouseModal
        isOpen={!!selectedClub}
        onClose={() => setSelectedClub(null)}
        club={selectedClub}
        onApply={handleApplyClick}
      />

      <ApplyModal
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        clubId={selectedClub?.id}
      />

      <SuggestClubModal
        isOpen={showSuggestModal}
        onClose={() => setShowSuggestModal(false)}
      />
    </main>
  );
};

export default Experience;
