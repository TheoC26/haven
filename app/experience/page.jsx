"use client";
import Header from "@/components/Header";
import GreetingModal from "@/components/modals/GreetingModal";
import AuthModal from "@/components/modals/AuthModal";
import OnboardingModal from "@/components/modals/OnboardingModal";
import ProfileModal from "@/components/modals/ProfileModal";
import HouseModal from "@/components/modals/HouseModal";
import ApplyModal from "@/components/modals/ApplyModal";
import SuggestClubModal from "@/components/modals/SuggestClubModal";
import Joystick from "@/components/Joystick";
import { useAuth } from "@/hooks/useAuth";
import { useDecorations } from "@/hooks/useDecorations";
import { useClubs } from "@/hooks/useClubs";
import React, { useState, useRef, useEffect } from "react";
import {
  IMAGES,
  GAME_CONSTANTS,
} from "@/config/images";

import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase";

// Game Engine Imports
import { GameEngine } from "@/game/GameEngine";
import { Player } from "@/game/entities/Player";
import { OtherPlayer } from "@/game/entities/OtherPlayer";
import { Club } from "@/game/entities/Club";
import { Decoration } from "@/game/entities/Decoration";
import { Creature } from "@/game/entities/Creature";
import { NetworkManager } from "@/game/NetworkManager";

const Experience = () => {
  // Canvas references
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const networkRef = useRef(null);
  const otherPlayersRef = useRef({});

  // UI state
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
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Data
  const { user, checkUserExists } = useAuth();
  const { clubs, loading: loadingClubs } = useClubs();
  const { decorations, loading: loadingDecorations } = useDecorations();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Animation definitions (moved here or could be in config)
  const animations = {
    "idle-down": [[1, 2]],
    "idle-right": [[0, 0]],
    "idle-up": [[1, 3]],
    "idle-left": [[0, 1]],
    "walk-down": [[0, 2], [1, 2], [2, 2], [1, 2]],
    "walk-right": [[0, 0], [1, 0], [2, 0], [3, 0]],
    "walk-up": [[0, 3], [1, 3], [2, 3], [1, 3]],
    "walk-left": [[0, 1], [1, 1], [2, 1], [3, 1]],
  };

  const imagesRef = useRef({});

  // 1. Initial Load & Setup
  useEffect(() => {
    // Load images
    Object.entries(IMAGES).forEach(([key, src]) => {
      const img = new Image();
      img.src = src;
      imagesRef.current[key] = img;
    });

    // Check visit status
    const hasVisited = localStorage.getItem("hasVisited");
    if (!hasVisited) {
      setShowGreeting(true);
      localStorage.setItem("hasVisited", "true");
    }
    setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);

    // Redirect if not logged in
    if (!user && !localStorage.getItem("isLoggingIn")) {
      // window.location.href = "/"; // Temporarily commented to avoid redirect loop during dev
    }
  }, [user]);

  // 2. Initialize Game Engine
  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new GameEngine(canvasRef.current);
    engineRef.current = engine;

    // Initial Resize
    engine.resize(window.innerWidth, window.innerHeight);

    // Setup Local Player
    const startX = window.innerWidth / 2 - (GAME_CONSTANTS.PLAYER_WIDTH * GAME_CONSTANTS.PLAYER_SCALE) / 2 + GAME_CONSTANTS.INITIAL_PLAYER_OFFSET.x;
    const startY = window.innerHeight / 2 - (GAME_CONSTANTS.PLAYER_HEIGHT * GAME_CONSTANTS.PLAYER_SCALE) / 2 + GAME_CONSTANTS.INITIAL_PLAYER_OFFSET.y;
    
    const localPlayer = new Player(startX, startY, imagesRef.current, animations);
    engine.entityManager.addEntity(localPlayer);
    engine.player = localPlayer;
    engine.scroll = { x: -GAME_CONSTANTS.INITIAL_PLAYER_OFFSET.x, y: -GAME_CONSTANTS.INITIAL_PLAYER_OFFSET.y };

    // Add Creatures
    const creature = new Creature(700, 800, "/art/creatures/creature1.png", 0.8);
    engine.entityManager.addEntity(creature);

    engine.start();

    // Resize listener
    const handleResize = () => engine.resize(window.innerWidth, window.innerHeight);
    window.addEventListener("resize", handleResize);

    // Keyboard Listeners
    const handleKeyDown = (e) => {
      if (e.code === "ArrowLeft") localPlayer.directions.left = true;
      if (e.code === "ArrowRight") localPlayer.directions.right = true;
      if (e.code === "ArrowUp") localPlayer.directions.up = true;
      if (e.code === "ArrowDown") localPlayer.directions.down = true;
      if (e.code === "Enter") {
         // Handle interactions here or in engine.update
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === "ArrowLeft") localPlayer.directions.left = false;
      if (e.code === "ArrowRight") localPlayer.directions.right = false;
      if (e.code === "ArrowUp") localPlayer.directions.up = false;
      if (e.code === "ArrowDown") localPlayer.directions.down = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      engine.stop();
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // 3. Sync Clubs and Decorations to Engine
  useEffect(() => {
    if (!engineRef.current || !clubs) return;
    
    // Clear old clubs and decorations before adding new ones
    // (In a more complex app, you'd sync only changes)
    engineRef.current.entityManager.entities = engineRef.current.entityManager.entities.filter(
      e => !(e instanceof Club) && !(e instanceof Decoration)
    );

    clubs.forEach(clubData => {
      const club = new Club(clubData, imagesRef);
      engineRef.current.entityManager.addEntity(club);
    });

    if (decorations) {
      decorations.forEach(decData => {
        const dec = new Decoration(decData, imagesRef);
        engineRef.current.entityManager.addEntity(dec);
      });
    }
  }, [clubs, decorations]);

  // 4. WebSocket / Networking
  useEffect(() => {
    if (!engineRef.current) return;

    const network = new NetworkManager(
      "wss://haven-websocket-server-production.up.railway.app/",
      (msg) => {
        if (msg.type === "disconnect") {
          const other = otherPlayersRef.current[msg.id];
          if (other) {
            engineRef.current.entityManager.removeEntity(other);
            delete otherPlayersRef.current[msg.id];
          }
          return;
        }

        if (msg.sender && msg.sender !== network.playerId) {
          let other = otherPlayersRef.current[msg.sender];
          if (!other) {
            other = new OtherPlayer(msg.sender, msg, imagesRef.current);
            otherPlayersRef.current[msg.sender] = other;
            engineRef.current.entityManager.addEntity(other);
          }
          other.updateFromNetwork(msg);
        }
      }
    );

    network.connect();
    networkRef.current = network;

    // Pulse position updates in the main loop
    const originalUpdate = engineRef.current.update.bind(engineRef.current);
    engineRef.current.update = (deltaTime) => {
      originalUpdate(deltaTime);
      
      // Update interactions (Checking closest club)
      updateInteractions(engineRef.current);

      if (engineRef.current.player && userData) {
        network.sendUpdate(engineRef.current.player.getStateForNetwork(), userData);
      }
    };

    return () => network.disconnect();
  }, [userData]);

  const isCloseEnoughRef = useRef(false);
  const closestClubIdRef = useRef(null);

  // Helper: Interaction Logic
  const updateInteractions = (engine) => {
    const player = engine.player;
    if (!player || !clubs) return;

    let minDist = Infinity;
    let closest = null;

    clubs.forEach(club => {
      // Use center of player and club for distance (as per original logic)
      const px = player.x + player.width / 2;
      const py = player.y + player.height / 2;
      const cx = club.pos_x + (imagesRef.current[`house${club.house_image}`]?.naturalWidth || 200) / 2;
      const cy = club.pos_y + (imagesRef.current[`house${club.house_image}`]?.naturalHeight || 200) / 2;
      
      const dist = Math.sqrt(Math.pow(px - cx, 2) + Math.pow(py - cy, 2));
      
      if (dist < minDist) {
        minDist = dist;
        closest = club;
      }
    });

    const isCloseNow = minDist < GAME_CONSTANTS.CLUB_INTERACTION_DISTANCE;

    // Only update state if there's a change or if we need to update the message for a different club
    if (isCloseNow) {
      if (!isCloseEnoughRef.current || closestClubIdRef.current !== closest.id) {
        isCloseEnoughRef.current = true;
        closestClubIdRef.current = closest.id;
        setIsCloseEnoughToClub(true);
        setClosestClubState(closest);
        setMessage(`Enter ${closest.name}`);
      }
    } else {
      if (isCloseEnoughRef.current) {
        isCloseEnoughRef.current = false;
        closestClubIdRef.current = null;
        setIsCloseEnoughToClub(false);
        setClosestClubState(null);
      }
    }
  };

  // 5. User Data Fetching (Real-time)
  useEffect(() => {
    if (!user || user.isAnonymous) return;

    setIsLoading(true);
    const userRef = doc(db, "users", user.uid);
    
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserData(data);
        
        // Sync character to local player instantly
        if (engineRef.current?.player && data.character) {
          engineRef.current.player.setCharacter(data.character);
        }
      } else {
        setUserData({ name: "Anonymous User", character: "char_ambiguous" });
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Error listening to user data:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Handlers
  const handleJoystickMove = (directions) => {
    if (engineRef.current?.player) {
      engineRef.current.player.directions = directions;
    }
  };

  const handleClosestClubClick = () => {
    if (closestClubState) setSelectedClub(closestClubState);
  };

  return (
    <main className="">
      <div className="fixed w-full h-full inset-0">
        <canvas className="w-full h-full" ref={canvasRef}></canvas>
      </div>

      {(loadingClubs || loadingDecorations) && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#53674F]"></div>
          <p className="mt-4 text-[#53674F] font-medium">Loading world...</p>
        </div>
      )}

      <button
        onClick={handleClosestClubClick}
        className={`fixed cursor-pointer outline-none flex left-1/2 gap-2 top-1/3 border-2 border-green-800 text-green-800 -translate-x-1/2 translate-y-0 scale-96 bg-white px-4 py-2 rounded-lg transition-all opacity-0 z-10 ${
          isCloseEnoughToClub && "opacity-100 translate-y-4 scale-100"
        }`}
      >
        <div>{message}</div>
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#016630">
          <path d="m284.91-434.5 106.68 106.67q12.67 12.68 12.67 31.83t-12.67 31.83q-12.68 12.67-31.83 12.67t-31.83-12.67l-184-183.76q-6.71-6.72-9.81-14.92-3.1-8.19-3.1-17.15 0-8.96 3.1-17.15 3.1-8.2 9.81-14.92l184-183.76q12.68-12.67 31.83-12.67t31.83 12.67q12.67 12.68 12.67 31.83t-12.67 31.83L284.91-525.5h472.22V-640q0-19.15 13.17-32.33 13.18-13.17 32.33-13.17t32.33 13.17q13.17 13.18 13.17 32.33v114.5q0 37.78-26.61 64.39t-64.39 26.61H284.91Z" />
        </svg>
      </button>

      {user && !user.isAnonymous && (
        <div className="fixed bottom-6 left-6 z-10">
          <button
            onClick={() => setShowSuggestModal(true)}
            className="bg-[#53674F] text-white py-3 px-5 rounded-full hover:bg-[#53674F]/90 transition-colors shadow-lg flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Suggest a Club
          </button>
        </div>
      )}

      <Header
        onInfoClick={() => setShowGreeting(true)}
        onLoginClick={() => setShowAuth(true)}
        onProfileClick={() => setShowProfile(true)}
      />

      <GreetingModal isOpen={showGreeting} onClose={() => setShowGreeting(false)} onLogin={() => { setShowGreeting(false); setShowAuth(true); }} onSkip={() => setShowGreeting(false)} />
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} onAuthComplete={async () => { if (user) { const exists = await checkUserExists(user.uid); if (!exists) setShowOnboarding(true); } }} />
      <OnboardingModal isOpen={showOnboarding} onClose={() => setShowOnboarding(false)} />
      <ProfileModal isOpen={showProfile} onClose={() => setShowProfile(false)} />
      <HouseModal isOpen={!!selectedClub} onClose={() => setSelectedClub(null)} club={selectedClub} onApply={() => setShowApplyModal(true)} />
      <ApplyModal isOpen={showApplyModal} onClose={() => setShowApplyModal(false)} clubId={selectedClub?.id} />
      <SuggestClubModal isOpen={showSuggestModal} onClose={() => setShowSuggestModal(false)} />
      {isTouchDevice && <Joystick onMove={handleJoystickMove} />}
    </main>
  );
};

export default Experience;
