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
import { useClubs } from "@/hooks/useClubs";
import React, { useState, useRef, useEffect } from "react";

const Experience1 = () => {
  // html stuff
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

//   const { user, checkUserExists } = useAuth();
  const { clubs, loading: loadingClubs } = useClubs();

  // Check if first visit to show greeting
  useEffect(() => {
    const hasVisited = localStorage.getItem("hasVisited");
    if (!hasVisited) {
      setShowGreeting(true);
      localStorage.setItem("hasVisited", "true");
    }
  }, []);

  // Check if first visit to show greeting
  useEffect(() => {
    const hasVisited = localStorage.getItem("hasVisited");
    if (!hasVisited) {
      setShowGreeting(true);
      localStorage.setItem("hasVisited", "true");
    }
  }, []);

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

  //   experience stuff

  // manage the canvas and context
  const canvasRef = useRef(null);
  let canvas;
  let ctx;

  let closeEnough = false;

  let char_image = new Image();
  char_image.src = "/art/spritesheet2.png";
  let house1_image = new Image();
  house1_image.src = "/art/house/house1.png";
  let house2_image = new Image();
  house2_image.src = "/art/house/house2.png";
  let house3_image = new Image();
  house3_image.src = "/art/house/house3.png";
  let house4_image = new Image();
  house4_image.src = "/art/house/house4.png";

  const house_images = [house1_image, house2_image, house3_image, house4_image];

  let tree_image = new Image();
  tree_image.src = "/art/decoration/tree.png";

  const decoration_images = [tree_image];

  let decorations;
//   let clubs;

  function loadLevelData() {
    const data = localStorage.getItem("levelData");
    if (!data) return [];

    const raw = JSON.parse(data);
    return raw
      .filter((o) => o.type === "house")
      .map((obj, idx) => ({
        name: obj.name,
        house_image: obj.image,
        pos_x: obj.x,
        pos_y: obj.y,
        id: `club-${idx}`,
      }));
  }
  function loadDecorationData() {
    const data = localStorage.getItem("levelData");
    if (!data) return [];
    const raw = JSON.parse(data);
    return raw
      .filter((o) => o.type === "decoration")
      .map((obj, idx) => ({
        name: obj.name,
        decoration_image: obj.image,
        pos_x: obj.x,
        pos_y: obj.y,
        id: `decoration-${idx}`,
      }));
  }

  function loadImage(src) {
    const img = new Image();
    img.src = src;
    return img;
  }

  const [clubsState, setClubsState] = useState([]);
  const [decorationsState, setDecorationsState] = useState([]);

  useEffect(() => {
    // clubs = loadLevelData();
    decorations = loadDecorationData();
    setDecorationsState(decorations);
    setClubsState(clubs);
  }, []);

  let closestClub = null;

  //   let animations = {
  //     "idle-down": [
  //       [0, 0],
  //       [0, 0],
  //       [0, 0],
  //       [0, 0],
  //       [0, 0],
  //       [0, 0],
  //       [0, 0],
  //       [0, 1],
  //     ],
  //     "idle-right": [[3, 3]],
  //     "idle-up": [[0, 2]],
  //     "idle-left": [[3, 4]],
  //     "walk-down": [
  //       [0, 0],
  //       [1, 0],
  //       [2, 0],
  //       [3, 0],
  //       [0, 0],
  //       [1, 1],
  //       [2, 1],
  //       [3, 1],
  //     ],
  //     "walk-right": [
  //       [3, 3],
  //       [0, 4],
  //       [1, 4],
  //       [2, 4],
  //     ],
  //     "walk-up": [
  //       [0, 2],
  //       [1, 2],
  //       [2, 2],
  //       [3, 2],
  //       [0, 3],
  //       [0, 2],
  //       [1, 3],
  //       [2, 3],
  //     ],
  //     "walk-left": [
  //       [3, 4],
  //       [0, 5],
  //       [1, 5],
  //       [2, 5],
  //     ],
  //   };

  let animations = {
    "idle-down": [[0, 0]],
    "idle-right": [[0, 0]],
    "idle-up": [[0, 0]],
    "idle-left": [[0, 1]],
    "walk-down": [[0, 0]],
    "walk-right": [
      [0, 0],
      [1, 0],
      [2, 0],
      [3, 0],
    ],
    "walk-up": [[0, 0]],
    "walk-left": [
      [0, 1],
      [1, 1],
      [2, 1],
      [3, 1],
    ],
  };

  let state = "idle-down";
  let last_direction = "down";
  let frame_duration = 5;
  let frame_counter = frame_duration;
  let frame = 0;
  let current_frame = animations[state][frame];
  let change = false;
  let last_state = state;

  let movementKeyDown = false;

  let scroll = { x: 0, y: 0 };

  const playerWidth = 391;
  const playerHeight = 908;
  const playerScale = 0.166;
  let playerPosition = {
    x: window.innerWidth / 2 - (playerWidth * playerScale) / 2,
    y: window.innerHeight / 2 - (playerHeight * playerScale) / 2,
  };
  let playerSpeed = 5;
  let playerDiagonalSpeed = Math.sqrt(Math.pow(playerSpeed, 2) / 2);
  let playerCurrentSpeed = playerSpeed;
  let playerDirections = {
    up: false,
    down: false,
    left: false,
    right: false,
  };

  function state_handler() {
    if (playerDirections.left) {
      state = "walk-left";
      last_direction = "left";
    } else if (playerDirections.right) {
      state = "walk-right";
      last_direction = "right";
    } else if (playerDirections.down) {
      state = "walk-down";
      last_direction = "down";
    } else if (playerDirections.up) {
      state = "walk-up";
      last_direction = "up";
    } else {
      state = "idle-" + last_direction;
    }
    if (state != last_state) {
      frame = 0;
      frame_counter = 0;
      last_state = state;
    }
  }

  function animation_handler() {
    frame_counter -= 1;
    if (frame_counter <= 0) {
      frame += 1;
      if (frame >= animations[state].length) {
        frame = 0;
      }
      frame_counter = frame_duration;
    }
    current_frame = animations[state][frame];
  }

  function checkMove(direction) {
    if (direction) {
      return true;
    }
    return false;
  }

  function updatePlayerPosition() {
    if (
      (playerDirections.up && playerDirections.right) ||
      (playerDirections.up && playerDirections.left) ||
      (playerDirections.down && playerDirections.right) ||
      (playerDirections.down && playerDirections.left)
    ) {
      playerCurrentSpeed = playerDiagonalSpeed;
    } else {
      playerCurrentSpeed = playerSpeed;
    }

    // playerDirections.up = true;
    // console.log(playerDirections);

    if (checkMove(playerDirections.up)) {
      playerPosition.y -= playerCurrentSpeed;
      scroll.y += playerCurrentSpeed;
    }
    if (checkMove(playerDirections.down)) {
      playerPosition.y += playerCurrentSpeed;
      scroll.y -= playerCurrentSpeed;
    }
    if (checkMove(playerDirections.left)) {
      playerPosition.x -= playerCurrentSpeed;
      scroll.x += playerCurrentSpeed;
    }
    if (checkMove(playerDirections.right)) {
      playerPosition.x += playerCurrentSpeed;
      scroll.x -= playerCurrentSpeed;
    }
  }

  function drawDecorations() {
    return;
    for (const decoration of decorations) {
      ctx.drawImage(
        decoration_images[decoration.decoration_image],
        decoration.pos_x + scroll.x,
        decoration.pos_y + scroll.y
      );
    }
  }

  function drawClubs() {
    let shortestDistance = Infinity;
    for (const club of clubs) {
      const distance = Math.sqrt(
        Math.pow(
          playerPosition.x +
            (playerWidth * playerScale) / 2 -
            (club.pos_x + house_images[club.house_image].naturalWidth / 2),
          2
        ) +
          Math.pow(
            playerPosition.y +
              (playerHeight * playerScale) / 2 -
              (club.pos_y + house_images[club.house_image].naturalHeight / 2),
            2
          )
      );
      if (distance < shortestDistance) {
        shortestDistance = distance;
        closestClub = club;
        setClosestClubState(club);

        if (distance < 275) {
          setIsCloseEnoughToClub(true);
          closeEnough = true;
          setMessage(`Enter ${club.name} club`);
        } else {
          setIsCloseEnoughToClub(false);
          closeEnough = false;
        }
      }

      ctx.drawImage(
        house_images[club.house_image],
        club.pos_x + scroll.x,
        club.pos_y + scroll.y
      );
    }
  }

  function drawClosestClub() {
    if (!closestClub) return;
    if (
      playerPosition.y <
      closestClub.pos_y +
        house_images[closestClub.house_image].naturalHeight / 4
    ) {
      ctx.drawImage(
        house_images[closestClub.house_image],
        closestClub.pos_x + scroll.x,
        closestClub.pos_y + scroll.y
      );
    }
  }

  function drawPlayer() {
    // ctx.drawImage(char_image, playerPosition.x, playerPosition.y, 100, 100);
    ctx.fillStyle = "red";
    // ctx.fillRect(playerPosition.x, playerPosition.y, 50, 50);
    ctx.drawImage(
      char_image,
      current_frame[0] * playerWidth,
      current_frame[1] * playerHeight,
      playerWidth,
      playerHeight,
      playerPosition.x + scroll.x,
      playerPosition.y + scroll.y,
      playerWidth * 0.166,
      playerHeight * 0.166
    );
  }
  function clearCanvas() {
    // ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#B3DAAA";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  function updateCanvas() {
    clearCanvas();
    updatePlayerPosition();
    drawDecorations();
    drawClubs();
    drawPlayer();
    drawClosestClub();
    state_handler();
    animation_handler();
  }
  function handleKeyDown(event) {
    if (event.code == "ArrowLeft") {
      playerDirections.left = true;
    }
    if (event.code == "ArrowRight") {
      playerDirections.right = true;
    }
    if (event.code == "ArrowUp") {
      playerDirections.up = true;
    }
    if (event.code == "ArrowDown") {
      playerDirections.down = true;
    }
    if (event.code == "Enter") {
      if (closeEnough) {
        handleClubClick(closestClub);
      }
    }
  }
  function handleKeyUp(event) {
    if (event.code == "ArrowLeft") {
      playerDirections.left = false;
    }
    if (event.code == "ArrowRight") {
      playerDirections.right = false;
    }
    if (event.code == "ArrowUp") {
      playerDirections.up = false;
    }
    if (event.code == "ArrowDown") {
      playerDirections.down = false;
    }
  }
  function handleResize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    playerPosition.x = window.innerWidth / 2 - (playerWidth * playerScale) / 2;
    playerPosition.y =
      window.innerHeight / 2 - (playerHeight * playerScale) / 2;
  }
  useEffect(() => {
    canvas = canvasRef.current;
    ctx = canvas.getContext("2d");
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    canvas = canvasRef.current;
    ctx = canvas.getContext("2d");
    let animationFrameId;

    const draw = () => {
      updateCanvas();
      // Request the next frame
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [clubsState, decorationsState]);

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

export default Experience1;
