"use client";
import Header from "@/components/Header";
import React, { useState, useRef, useEffect } from "react";
import { addDoc, collection, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { useClubs } from "@/hooks/useClubs";
import { useDecorations } from "@/hooks/useDecorations";
import useStateRef from "@/hooks/stateRef";
import DecorationsPanel from "./levelEditor/DecorationsPanel";

const LevelEditor = () => {
  // Canvas references
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const animationRef = useRef(null);

  // Game state
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [placementMode, setPlacementMode, placementModeRef] =
    useStateRef(false);
  const [deleteDecorationMode, setDeleteDecorationMode, deleteDecorationModeRef] =
    useStateRef(false);

  // Club form data
  const [clubData, setClubData] = useState({
    name: "",
    description: "",
    leaderName: "",
    communicationMethod: "Whatsapp",
    commitmentLevel: 3,
    house_image: 1,
    meetingTimes: [""],
    images: [""],
    members: [],
    pos_x: 0,
    pos_y: 0,
  });

  const [decorationData, setDecorationData, decorationDataRef] = useStateRef({
    image: 1,
    scale: 1,
    flip: false,
    rotation: 0,
    pos_x: 0,
    pos_y: 0,
  });

  const { clubs, loading: loadingClubs } = useClubs();
  const { decorations, loading: loadingDecorations } = useDecorations();

  // Game data state - Important: using a ref instead of state for clubs to ensure drawing has latest data
  //   const clubsStateRef = useRef([]);
  const [clubsState, setClubsState, clubsStateRef] = useStateRef([]);

  // Decoration state
  const [decorationsState, setDecorationsState, decorationsStateRef] =
    useStateRef([]);

  const [selectedDecoration, setSelectedDecoration, selectedDecorationRef] =
    useStateRef(null);

  // Player state (moved from direct variables to state refs to persist across renders)
  const playerStateRef = useRef({
    position: {
      x: window.innerWidth / 2 - (391 * 0.166) / 2,
      y: window.innerHeight / 2 - (908 * 0.166) / 2,
    },
    speed: 10,
    diagonalSpeed: Math.sqrt(Math.pow(10, 2) / 2),
    currentSpeed: 10,
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
    housePreview: null,
    previewPos: { x: 0, y: 0 },
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
    }
  ]);

  // Editing club state
  const [editingClub, setEditingClub, editingClubRef] = useStateRef(null);

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

  useEffect(() => {
    if (!decorations || decorations.length === 0) return;
    console.log("Decorations loaded from Firebase:", decorations);
    setDecorationsState(decorations);
  }, [decorations]);

  // Load clubs from Firebase
  useEffect(() => {
    if (clubs && clubs.length > 0) {
      console.log("Clubs loaded from Firebase:", clubs);
      setClubsState(clubs);
      // Update the ref immediately to ensure drawing has latest data
      //   clubsStateRef.current = clubs;
    }
  }, [clubs]);

  // Update clubsStateRef whenever clubsState changes
  useEffect(() => {
    // clubsStateRef.current = clubsState;
  }, [clubsState]);

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
    // window.addEventListener("click", handleCanvasClick);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("resize", handleResize);
      //   window.removeEventListener("click", handleCanvasClick);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Start the game loop
  useEffect(() => {
    if (!canvasRef.current || !ctxRef.current) {
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
  }, []);

  // Update the club preview position when in placement mode
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (placementMode) {
        const gameState = gameStateRef.current;
        if (editingClubRef.current != null) {
          gameState.previewPos = {
            x:
              e.clientX -
              gameState.scroll.x -
              getHouseImage(clubData.house_image).naturalWidth / 2,
            y:
              e.clientY -
              gameState.scroll.y -
              getHouseImage(clubData.house_image).naturalHeight / 2,
          };
        } else if (selectedDecorationRef.current != null) {
          gameState.previewPos = {
            x:
              e.clientX -
              gameState.scroll.x -
              (getDecorationImage(decorationData.image).naturalWidth *
                decorationDataRef.current.scale) /
                2,
            y:
              e.clientY -
              gameState.scroll.y -
              (getDecorationImage(decorationData.image).naturalHeight *
                decorationDataRef.current.scale) /
                2,
          };
        }
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [placementMode]);

  useEffect(() => {
    if (placementMode) {
      // Initialize house preview position to center of screen
      const gameState = gameStateRef.current;
      gameState.previewPos = {
        x: window.innerWidth / 2 - gameState.scroll.x,
        y: window.innerHeight / 2 - gameState.scroll.y,
      };
    }
  }, [placementMode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const clickHandler = async (e) => {
      const rect = canvasRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      console.log(selectedDecorationRef.current);
      console.log(editingClubRef.current);
      if (deleteDecorationModeRef.current) {
        // draw a debugging circle where clicked
        ctxRef.current.beginPath();
        ctxRef.current.arc(clickX, clickY, 100, 0, Math.PI * 2);
        ctxRef.current.fillStyle = "red";
        ctxRef.current.fill();
        ctxRef.current.closePath();
        console.log("clicked at", clickX, clickY);
        // Check if the click is on a decoration
        const clickedDecoration = decorationsStateRef.current.find(
          (decoration) =>
            clickX >= decoration.pos_x + gameStateRef.current.scroll.x &&
            clickX <= decoration.pos_x + getDecorationImage(decoration.image).width * decoration.scale + gameStateRef.current.scroll.x &&
            clickY >= decoration.pos_y + gameStateRef.current.scroll.y &&
            clickY <= decoration.pos_y + getDecorationImage(decoration.image).height * decoration.scale + gameStateRef.current.scroll.y
        );
        if (clickedDecoration) {
          // Remove decoration from Firebase
          const decorationId = clickedDecoration.id;
          const decorationRef = doc(db, "decorations", decorationId);
          
          deleteDoc(decorationRef)

          // Remove from local state
          const updatedDecorations = decorationsStateRef.current.filter(
            (decoration) => decoration.id !== clickedDecoration.id
          );
          setDecorationsState(updatedDecorations);
          decorationsStateRef.current = updatedDecorations;

          handleSetMessage("Decoration deleted successfully!");
        } else {
          handleSetMessage("No decoration found at this position.");
        }

        return;
      }
      if (placementModeRef.current) {
        const gameState = gameStateRef.current;

        if (editingClubRef.current != null) {
          // Update clubData with new position
          const updatedClubData = {
            ...editingClubRef.current,
            pos_x: gameState.previewPos.x,
            pos_y: gameState.previewPos.y,
          };

          // Update club in Firebase
          updateClubInFirebase(editingClubRef.current.id, updatedClubData);

          // Update local state
          const updatedClubs = clubsStateRef.current.map((club) =>
            club.id === editingClubRef.id
              ? { ...club, ...updatedClubData }
              : club
          );
          setClubsState(updatedClubs);
          //   clubsStateRef.current = updatedClubs;

          setEditingClub(null);
          setPlacementMode(false);
          handleSetMessage("Club position updated successfully!");

          return;
        } else if (selectedDecorationRef.current != null) {
          const newDec = {
            ...selectedDecorationRef.current,
            scale: decorationDataRef.current.scale,
            flip: decorationDataRef.current.flip,
            rotation: decorationDataRef.current.rotation,
            pos_x: gameState.previewPos.x,
            pos_y: gameState.previewPos.y,
          };
          // push to Firestore
          const docId = await addDecorationToFirebase(newDec);
          // update local
          const updated = [...decorationsStateRef.current, {...newDec, id: docId}];
          console.log("updated", updated);
          setDecorationsState(updated);
          decorationsStateRef.current = updated;
          // exit placement
          setPlacementMode(false);
          setSelectedDecoration(null);
          handleSetMessage(`${selectedDecorationRef.current.name} placed!`);
        } else {
          console.log("im running away oh no");
          // Update clubData with position
          const newClubData = {
            ...clubData,
            pos_x: gameState.previewPos.x,
            pos_y: gameState.previewPos.y,
          };

          // Add club to Firebase
          addClubToFirebase(newClubData);

          // Create a new club object with proper structure
          const newClub = {
            id: `club-${Date.now()}`,
            name: newClubData.name,
            house_image: newClubData.house_image,
            pos_x: newClubData.pos_x,
            pos_y: newClubData.pos_y,
          };

          // Add to local state and update ref immediately
          const updatedClubs = [...clubsStateRef.current, newClub];
          setClubsState(updatedClubs);
          //   clubsStateRef.current = updatedClubs;

          // Exit placement mode
          setPlacementMode(false);
          handleSetMessage("Club placed successfully!");
        }
      } else {
        console.log("im not at placement mode");

        const clickedClub = isClickOnClub(clickX, clickY);
        if (clickedClub) {
          setEditingClub(clickedClub);
          setClubData({
            name: clickedClub.name || "",
            description: clickedClub.description || "",
            leaderName: clickedClub.leaderName || "",
            communicationMethod: clickedClub.communicationMethod || "Whatsapp",
            commitmentLevel: clickedClub.commitmentLevel || 3,
            house_image: clickedClub.house_image || 1,
            meetingTimes: clickedClub.meetingTimes || [""],
            images: clickedClub.images || [""],
            members: clickedClub.members || [],
            pos_x: clickedClub.pos_x,
            pos_y: clickedClub.pos_y,
          });
          setShowForm(true);
        }
      }
    };

    canvas.addEventListener("click", clickHandler);

    return () => {
      canvas.removeEventListener("click", clickHandler);
    };
  }, [placementMode, clubData]);

  const handleSetMessage = (msg, duration = 3000) => {
    setMessage(msg);
    setTimeout(() => {
      setMessage("");
    }, duration);
  };

  const getHouseImage = (house_index) => {
    const images = imagesRef.current;
    // Convert to number to ensure proper comparison (in case it comes as string from Firebase)
    const index = Number(house_index);
    if (index === 1) return images.house1;
    if (index === 2) return images.house2;
    if (index === 3) return images.house3;
    if (index === 4) return images.house4;
    return images.house1; // Default to house1
  };

  const getDecorationImage = (decoration_index) => {
    const images = imagesRef.current;
    // Convert to number to ensure proper comparison (in case it comes as string from Firebase)
    const index = Number(decoration_index);
    if (index === 1) return images.tree1;
    if (index === 2) return images.stones;
    return images.tree1; // Default to tree1
  };

  // Add this function after the getHouseImage function
  const isClickOnClub = (clickX, clickY) => {
    const gameState = gameStateRef.current;
    const clubs = clubsStateRef.current;

    for (const club of clubs) {
      const houseImg = getHouseImage(club.house_image);
      if (!houseImg || !houseImg.complete) continue;

      const clubX = club.pos_x + gameState.scroll.x;
      const clubY = club.pos_y + gameState.scroll.y;

      // Check if click is within the house image bounds
      if (
        clickX >= clubX &&
        clickX <= clubX + houseImg.width &&
        clickY >= clubY &&
        clickY <= clubY + houseImg.height
      ) {
        return club;
      }
    }
    return null;
  };

  // Keyboard input handlers
  function handleKeyDown(event) {
    if (showForm) return; // Don't handle movement when form is open

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
    if (event.code === "KeyF" && !showForm) {
      // Press F to open form
      setShowForm(true);
    }
    if (event.code === "Escape") {
      if (placementMode) {
        setPlacementMode(false);
      } else if (showForm) {
        setShowForm(false);
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

    if (player.directions.up) {
      player.position.y -= player.currentSpeed;
      gameState.scroll.y += player.currentSpeed;
    }
    if (player.directions.down) {
      player.position.y += player.currentSpeed;
      gameState.scroll.y -= player.currentSpeed;
    }
    if (player.directions.left) {
      player.position.x -= player.currentSpeed;
      gameState.scroll.x += player.currentSpeed;
    }
    if (player.directions.right) {
      player.position.x += player.currentSpeed;
      gameState.scroll.x -= player.currentSpeed;
    }
  }

  function drawDecorations() {
    const ctx = ctxRef.current;
    const gameState = gameStateRef.current;

    // Use decorationsStateRef.current to ensure we have the latest data
    const decorations = decorationsStateRef.current;
    if (!decorations || !decorations.length || !ctx) return;

    // Debug to confirm we have decorations to draw

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

    // Use clubsStateRef.current to ensure we have the latest data
    const clubs = clubsStateRef.current;

    if (!clubs || !clubs.length || !ctx) return;

    // Debug to confirm we have clubs to draw
    // console.log("Drawing clubs:", clubs.length);

    for (const club of clubs) {
      // Skip if missing required properties
      if (
        !club ||
        typeof club.house_image === "undefined" ||
        typeof club.pos_x === "undefined" ||
        typeof club.pos_y === "undefined"
      ) {
        console.warn("Skipping invalid club:", club);
        continue;
      }

      const houseImg = getHouseImage(club.house_image);

      // Skip if image isn't loaded
      if (!houseImg || !houseImg.complete) {
        console.warn("House image not ready:", club.house_image);
        continue;
      }

      // Debug position values
      // console.log(`Drawing house at: ${club.pos_x + gameState.scroll.x}, ${club.pos_y + gameState.scroll.y}`);

      try {
        ctx.drawImage(
          houseImg,
          club.pos_x + gameState.scroll.x,
          club.pos_y + gameState.scroll.y
        );
      } catch (err) {
        console.error("Error drawing club:", err, club);
      }
    }
  }

  function drawHousePreview() {
    if (!placementMode) return;

    const ctx = ctxRef.current;
    const gameState = gameStateRef.current;
    const houseImg = getHouseImage(clubData.house_image);

    if (!ctx || !houseImg || !houseImg.complete) return;

    // Draw semi-transparent house
    ctx.globalAlpha = 0.7;
    ctx.drawImage(
      houseImg,
      gameState.previewPos.x + gameState.scroll.x,
      gameState.previewPos.y + gameState.scroll.y
    );
    ctx.globalAlpha = 1.0;
  }

  function drawPlayer() {
    const ctx = ctxRef.current;
    const gameState = gameStateRef.current;
    const player = playerStateRef.current;
    const images = imagesRef.current;

    if (!ctx || !images.char.complete) return;

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
    drawClubs(); // Will use clubsStateRef.current
    drawDecorations(); // Will use decorationsStateRef.current
    drawHousePreview();
    drawPlayer();
    stateHandler();
    animationHandler();
  }

  // Form handling
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setClubData({
      ...clubData,
      [name]: value,
    });
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setClubData({
      ...clubData,
      [name]: Number(value),
    });
  };

  const handleMeetingTimeChange = (index, value) => {
    const newMeetingTimes = [...clubData.meetingTimes];
    newMeetingTimes[index] = value;
    setClubData({
      ...clubData,
      meetingTimes: newMeetingTimes,
    });
  };

  const addMeetingTime = () => {
    setClubData({
      ...clubData,
      meetingTimes: [...clubData.meetingTimes, ""],
    });
  };

  const removeMeetingTime = (index) => {
    const newMeetingTimes = [...clubData.meetingTimes];
    newMeetingTimes.splice(index, 1);
    setClubData({
      ...clubData,
      meetingTimes: newMeetingTimes,
    });
  };

  const handleImageChange = (index, value) => {
    const newImages = [...clubData.images];
    newImages[index] = value;
    setClubData({
      ...clubData,
      images: newImages,
    });
  };

  const addImage = () => {
    setClubData({
      ...clubData,
      images: [...clubData.images, ""],
    });
  };

  const removeImage = (index) => {
    const newImages = [...clubData.images];
    newImages.splice(index, 1);
    setClubData({
      ...clubData,
      images: newImages,
    });
  };

  // Add updateClubInFirebase function
  const updateClubInFirebase = async (clubId, updatedData) => {
    try {
      const clubRef = doc(db, "club", clubId);
      await updateDoc(clubRef, updatedData);
      console.log("Club updated in Firebase successfully!");
    } catch (err) {
      console.error("Error updating club in Firebase:", err);
      handleSetMessage("Error updating club in Firebase: " + err.message);
    }
  };

  // Modify handleSubmit to handle both new and existing clubs
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!clubData.name || !clubData.description || !clubData.leaderName) {
      handleSetMessage("Please fill out all required fields!");
      return;
    }

    if (editingClub) {
      // Update existing club
      await updateClubInFirebase(editingClub.id, clubData);

      // Update local state
      const updatedClubs = clubsStateRef.current.map((club) =>
        club.id === editingClub.id ? { ...club, ...clubData } : club
      );
      setClubsState(updatedClubs);
      //   clubsStateRef.current = updatedClubs;

      handleSetMessage("Club updated successfully!");
      setEditingClub(null);
      setShowForm(false);
    } else {
      // Start placement mode for new club
      setPlacementMode(true);
      setShowForm(false);
      handleSetMessage("Click on the map to place the club house!");
    }
  };

  // Add cleanup when closing the form
  const handleCloseForm = (e) => {
    // dont propagate the event if the form is closed by clicking outside
    e.stopPropagation();

    setShowForm(false);
    setEditingClub(null);
    setClubData({
      name: "",
      description: "",
      leaderName: "",
      communicationMethod: "Whatsapp",
      commitmentLevel: 3,
      house_image: 1,
      meetingTimes: [""],
      images: [""],
      members: [],
      pos_x: 0,
      pos_y: 0,
    });
  };

  const addClubToFirebase = async (clubDataToAdd) => {
    try {
      const clubsCollection = collection(db, "club");
      await addDoc(clubsCollection, {
        ...clubDataToAdd,
        dateCreated: new Date(),
      });
      console.log("Club added to Firebase successfully!");
    } catch (err) {
      console.error("Error adding club to Firebase:", err);
      handleSetMessage("Error adding club to Firebase: " + err.message);
    }
  };

  const addDecorationToFirebase = async (decorationDataToAdd) => {
    let firebaseDocId;
    try {
      const decorationsCollection = collection(db, "decorations");
      // Get the document ID of the newly added decoration
      const docRef = await addDoc(decorationsCollection, {
        ...decorationDataToAdd,
        dateCreated: new Date(),
      });
      firebaseDocId = docRef.id;
      console.log("Decoration added to Firebase with ID:", firebaseDocId);
    } catch (err) {
      console.error("Error adding decoration to Firebase:", err);
      handleSetMessage("Error adding decoration to Firebase: " + err.message);
    }
    return firebaseDocId;
  };

  const saveToLocalStorage = () => {
    const levelData = [
      ...clubsStateRef.current.map((club) => ({
        type: "club",
        id: club.id,
        name: club.name,
        house_image: club.house_image,
        x: club.pos_x,
        y: club.pos_y,
      })),
    ];

    localStorage.setItem("levelData", JSON.stringify(levelData));
  };

  const clearLevel = () => {
    if (
      window.confirm(
        "Are you sure you want to clear the level? This cannot be undone."
      )
    ) {
      setClubsState([]);
      //   clubsStateRef.current = [];
      localStorage.removeItem("levelData");
      handleSetMessage("Level cleared!");
    }
  };
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

      {/* <Header title="Level Editor" /> */}

      {message && (
        <div className="fixed left-1/2 transform -translate-x-1/2 top-20 bg-white border-2 border-green-800 text-green-800 px-4 py-2 rounded-lg shadow-md">
          {message}
        </div>
      )}

      <div className="fixed bottom-4 right-4 flex flex-col gap-2">
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-800 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-700 transition-all"
        >
          Add New Club (F)
        </button>
        <button
          onClick={clearLevel}
          className="bg-red-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-500 transition-all"
        >
          Clear Level
        </button>
      </div>

      {/* Club Form Modal */}
      {showForm && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-xs flex items-center justify-center p-4 z-50"
          onClick={handleCloseForm}
        >
          <div
            className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-green-800 mb-4">
              Add New Club
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Club Name*
                </label>
                <input
                  type="text"
                  name="name"
                  value={clubData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Description*
                </label>
                <textarea
                  name="description"
                  value={clubData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                ></textarea>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Leader Name*
                </label>
                <input
                  type="text"
                  name="leaderName"
                  value={clubData.leaderName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Communication Method
                </label>
                <select
                  name="communicationMethod"
                  value={clubData.communicationMethod}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="Whatsapp">Whatsapp</option>
                  <option value="Discord">Discord</option>
                  <option value="Slack">Slack</option>
                  <option value="Email">Email</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Commitment Level (1-5)
                </label>
                <input
                  type="number"
                  name="commitmentLevel"
                  value={clubData.commitmentLevel}
                  onChange={handleNumberChange}
                  min="1"
                  max="5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  House Style
                </label>
                <div className="flex gap-4 mt-2">
                  {[1, 2, 3, 4].map((houseNum) => (
                    <div
                      key={houseNum}
                      className={`border-2 p-2 rounded-lg cursor-pointer ${
                        clubData.house_image === houseNum
                          ? "border-green-600 bg-green-50"
                          : "border-gray-300"
                      }`}
                      onClick={() =>
                        setClubData({ ...clubData, house_image: houseNum })
                      }
                    >
                      <img
                        src={`/art/house/house${houseNum}.png`}
                        alt={`House ${houseNum}`}
                        className="w-24 h-auto object-contain"
                      />
                      <div className="text-center mt-1">Style {houseNum}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Meeting Times
                </label>
                {clubData.meetingTimes.map((time, index) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={time}
                      onChange={(e) =>
                        handleMeetingTimeChange(index, e.target.value)
                      }
                      placeholder="e.g. Mondays 4-5pm"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeMeetingTime(index)}
                      className="px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addMeetingTime}
                  className="mt-1 px-3 py-1 bg-green-100 text-green-600 rounded hover:bg-green-200"
                >
                  Add Meeting Time
                </button>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Images (URLs)
                </label>
                {clubData.images.map((img, index) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={img}
                      onChange={(e) => handleImageChange(index, e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addImage}
                  className="mt-1 px-3 py-1 bg-green-100 text-green-600 rounded hover:bg-green-200"
                >
                  Add Image URL
                </button>
              </div>
              <button
                onClick={handleCloseForm}
                className="absolute right-4 top-4 text-[#7E4C2C] transition-all hover:text-yellow-600 cursor-pointer"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                {editingClub && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setPlacementMode(true);
                      setShowForm(false);
                      console.log("Editing club:", editingClub);
                      handleSetMessage(
                        "Click on the map to place the club house!"
                      );
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Move Club
                  </button>
                )}
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  {editingClub ? "Update Club" : "Place on Map"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DecorationsPanel
        decorations={decorationsToChooseFromRef.current}
        decorationData={decorationDataRef.current}
        setDecorationData={setDecorationData}
        deleteDecorationMode={deleteDecorationMode}
        setDeleteDecorationMode={setDeleteDecorationMode}
        onSelect={(dec) => {
          setSelectedDecoration(dec);
          setPlacementMode(true);
          handleSetMessage(`Click on the map to place ${dec.name}`);
        }}
      />

      {/* Instructions */}
      <div className="fixed top-16 left-4 bg-white p-3 rounded-lg border-2 border-green-800 shadow-md">
        <h3 className="font-bold text-green-800 mb-2">Controls:</h3>
        <ul className="text-sm space-y-1">
          <li>🡑 🡓 🡐 🡒 : Move around map</li>
          <li>F : Open new club form</li>
          <li>Click : Place club (in placement mode)</li>
          <li>ESC : Cancel placement or close form</li>
        </ul>
      </div>
    </main>
  );
};

export default LevelEditor;
