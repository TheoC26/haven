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

import { doc, onSnapshot } from "firebase/firestore";
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
  const [isXKeyDown, setIsXKeyDown] = useState(false);

  const isAnyModalOpen = showGreeting || showAuth || showOnboarding || showProfile || !!selectedClub || showApplyModal || showSuggestModal;

  // Data
  const { user, checkUserExists } = useAuth();
  const { clubs, loading: loadingClubs } = useClubs();
  const { decorations, loading: loadingDecorations } = useDecorations();
  const [userData, setUserData] = useState(null);

  // Animation definitions
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

    const hasVisited = localStorage.getItem("hasVisited");
    if (!hasVisited) {
      setShowGreeting(true);
      localStorage.setItem("hasVisited", "true");
    }
    setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  // 2. Initialize Game Engine
  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new GameEngine(canvasRef.current);
    engineRef.current = engine;

    engine.resize(window.innerWidth, window.innerHeight);

    // Setup Local Player
    const startX = window.innerWidth / 2 - (GAME_CONSTANTS.PLAYER_WIDTH * GAME_CONSTANTS.PLAYER_SCALE) / 2 + GAME_CONSTANTS.INITIAL_PLAYER_OFFSET.x;
    const startY = window.innerHeight / 2 - (GAME_CONSTANTS.PLAYER_HEIGHT * GAME_CONSTANTS.PLAYER_SCALE) / 2 + GAME_CONSTANTS.INITIAL_PLAYER_OFFSET.y;
    
    const localPlayer = new Player(startX, startY, imagesRef, animations);
    engine.setPlayer(localPlayer);
    engine.entityManager.addEntity(localPlayer);
    engine.scroll = { x: -GAME_CONSTANTS.INITIAL_PLAYER_OFFSET.x, y: -GAME_CONSTANTS.INITIAL_PLAYER_OFFSET.y };

    // Interaction Callback
    engine.onInteractionUpdate = (isClose, club) => {
      setIsCloseEnoughToClub(isClose);
      setClosestClubState(club);
      if (isClose && club) setMessage(`Enter ${club.name}`);
    };

    // Add Creatures
    const creature = new Creature(700, 800, "/art/creatures/creature1.png", 0.8);
    engine.entityManager.addEntity(creature);

    engine.start();

    const handleResize = () => engine.resize(window.innerWidth, window.innerHeight);
    window.addEventListener("resize", handleResize);

    const handleKeyDown = (e) => {
      if (e.code === "ArrowLeft") localPlayer.directions.left = true;
      if (e.code === "ArrowRight") localPlayer.directions.right = true;
      if (e.code === "ArrowUp") localPlayer.directions.up = true;
      if (e.code === "ArrowDown") localPlayer.directions.down = true;
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
            other = new OtherPlayer(msg.sender, msg, imagesRef);
            otherPlayersRef.current[msg.sender] = other;
            engineRef.current.entityManager.addEntity(other);
          }
          other.updateFromNetwork(msg);
        }
      }
    );

    network.connect();
    engineRef.current.setNetworkManager(network);

    return () => {
      network.disconnect();
      engineRef.current.setNetworkManager(null);
    };
  }, []);

  // 5. User Data Fetching (Real-time)
  useEffect(() => {
    if (!user || user.isAnonymous) return;

    const userRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserData(data);
        if (engineRef.current) {
          engineRef.current.setUserData(data);
        }
      } else {
        const anonData = { name: "Anonymous User", character: "char_ambiguous" };
        setUserData(anonData);
        if (engineRef.current) {
          engineRef.current.setUserData(anonData);
        }
      }
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

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key.toLowerCase() === "x") {
        setIsXKeyDown(true);
        if (isCloseEnoughToClub && closestClubState && !isAnyModalOpen) {
          setSelectedClub(closestClubState);
        }
      }
    };

    const handleGlobalKeyUp = (e) => {
      if (e.key.toLowerCase() === "x") {
        setIsXKeyDown(false);
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    window.addEventListener("keyup", handleGlobalKeyUp);

    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
      window.removeEventListener("keyup", handleGlobalKeyUp);
    };
  }, [isCloseEnoughToClub, closestClubState, isAnyModalOpen]);

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
        className={`fixed cursor-pointer outline-none flex left-1/2 gap-3 top-1/3 border-2 border-green-800 text-green-800 -translate-x-1/2 translate-y-0 scale-96 bg-white px-4 py-2 rounded-lg transition-all opacity-0 z-10 ${
          isCloseEnoughToClub && "opacity-100 translate-y-4 scale-100"
        }`}
      >
        <div>{message}</div>
        <div className="w-6 h-6 relative">
          <div className={`bg-[#016730] rounded-sm absolute inset-0 bottom-1 grid place-items-center transition-transform ${isXKeyDown ? 'translate-y-1' : ''}`}>
            <span className="text-white font-bold text-xs">X</span>
          </div>
          <div className="border border-[#016730] rounded-sm absolute inset-0 top-1 bottom-px"></div>
        </div>

      </button>

      {user && !user.isAnonymous && (
        <div className="fixed bottom-6 left-6 z-10">
          <button
            onClick={() => setShowSuggestModal(true)}
            className="bg-[#53674F] text-white py-3 px-5 rounded-2xl cursor-pointer hover:scale-105 transition-colors shadow-lg flex items-center"
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
