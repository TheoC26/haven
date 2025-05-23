"use client";
import { useState, useEffect } from "react";
import { Biker } from "@/components/outside/Biker";
import { House } from "@/components/outside/House";
import RoadSegment from "@/components/svg/RoadSegment";
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

const PathVisualizer = ({ points }) => {
  return (
    <svg
      className="absolute top-0 left-[33%] w-[50%] h-[200vh] pointer-events-none grid place-items-center"
      style={{ zIndex: 1000 }}
    >
      {/* Draw lines between points */}
      <path
        d={`M ${points.map((p) => `${p.x} ${p.y}`).join(" L ")}`}
        stroke="red"
        strokeWidth="2"
        fill="none"
      />

      {/* Draw points */}
      {points.map((point, index) => (
        <circle key={index} cx={point.x} cy={point.y} r="3" fill="blue" />
      ))}
      {points.map((point, index) => (
        <circle key={index} cx={point.x} cy={point.y + 982} r="3" fill="blue" />
      ))}

      {/* Add point numbers for reference */}
      {points.map((point, index) => (
        <text
          key={`text-${index}`}
          x={point.x + 5}
          y={point.y - 5}
          fontSize="10"
          fill="green"
        >
          {index}, {point.x}
        </text>
      ))}
    </svg>
  );
};

const pathPoints = [
  {
    x: 197,
    y: 982,
  },
  {
    x: 207.81275909050697,
    y: 962,
  },
  {
    x: 217.96789996514866,
    y: 942,
  },
  {
    x: 227.59627967072444,
    y: 922,
  },
  {
    x: 236.7276117937583,
    y: 902,
  },
  {
    x: 245.41076249006828,
    y: 882,
  },
  {
    x: 253.6533797968826,
    y: 862,
  },
  {
    x: 261.414783703341,
    y: 842,
  },
  {
    x: 268.64499530731233,
    y: 822,
  },
  {
    x: 275.2732746066758,
    y: 802,
  },
  {
    x: 281.21935238299073,
    y: 782,
  },
  {
    x: 286.37400902192566,
    y: 762,
  },
  {
    x: 290.63811482113916,
    y: 742,
  },
  {
    x: 293.93329126387626,
    y: 722,
  },
  {
    x: 296.17175080204176,
    y: 702,
  },
  {
    x: 297.18579598770976,
    y: 682,
  },
  {
    x: 296.94869834282595,
    y: 662,
  },
  {
    x: 295.3339188181141,
    y: 642,
  },
  {
    x: 292.2309354532486,
    y: 622,
  },
  {
    x: 287.38407773599656,
    y: 602,
  },
  {
    x: 280.7158003214233,
    y: 582,
  },
  {
    x: 272.39201444245734,
    y: 562,
  },
  {
    x: 262.3912303651664,
    y: 542,
  },
  {
    x: 250.5943004318599,
    y: 522,
  },
  {
    x: 236.97214086724655,
    y: 502,
  },
  {
    x: 221.64068080765448,
    y: 482,
  },
  {
    x: 204.7193777986188,
    y: 462,
  },
  {
    x: 186.25761927467828,
    y: 442,
  },
  {
    x: 166.92631953647896,
    y: 422,
  },
  {
    x: 147.80873991173108,
    y: 402,
  },
  {
    x: 130.50204932294137,
    y: 382,
  },
  {
    x: 115.88023752977984,
    y: 362,
  },
  {
    x: 103.96335850997744,
    y: 342,
  },
  {
    x: 94.16659095399422,
    y: 322,
  },
  {
    x: 87.17913245129929,
    y: 302,
  },
  {
    x: 83.10057153376214,
    y: 282,
  },
  {
    x: 82.42064399661274,
    y: 262,
  },
  {
    x: 85.15945018649143,
    y: 242,
  },
  {
    x: 90.57922566037243,
    y: 222,
  },
  {
    x: 97.85246152022726,
    y: 202,
  },

  {
    x: 183,
    y: 22,
  },
];

export default function Home() {
  // Auth state
  const { user, checkUserExists } = useAuth();

  // Clubs data
  const { clubs, loading: loadingClubs } = useClubs();

  // Modal states
  const [showGreeting, setShowGreeting] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [selectedClub, setSelectedClub] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showSuggestModal, setShowSuggestModal] = useState(false);

  // Check if first visit to show greeting
  useEffect(() => {
    const hasVisited = localStorage.getItem("hasVisited");
    if (!hasVisited) {
      setShowGreeting(true);
      localStorage.setItem("hasVisited", "true");
    }
  }, []);

  // Check if user needs onboarding when logged in
  useEffect(() => {
    const checkOnboarding = async () => {
      if (user && !user.isAnonymous) {
        const exists = await checkUserExists(user.uid);
        if (!exists) {
          setShowOnboarding(true);
        }
      }
    };

    checkOnboarding();
  }, [user, checkUserExists]);

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

  return (
    <div className="flex flex-col w-full items-center bg-[#B3DAAA]">
      <Header
        onInfoClick={() => setShowGreeting(true)}
        onLoginClick={handleLoginClick}
        onProfileClick={handleProfileClick}
      />

      <Biker />

      {!loadingClubs && 
        ([...Array(Math.ceil(clubs.length/3))].map((_, index) => (
          <RoadSegment key={index} />
        ))
      )}
      {/* <RoadSegment />
      <RoadSegment />
      <RoadSegment /> */}

      {/* Houses/Clubs */}
      {loadingClubs ? (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#6A3C1F]"></div>
          <p className="mt-4 text-[#6A3C1F] font-medium">Loading clubs...</p>
        </div>
      ) : clubs.length > 0 ? (
        clubs.map((club, index) => (
          <div
            key={club.id}
            className={`absolute ${index % 2 === 1 ? "left-10" : "right-10"}`}
            style={{ top: `${index * 491}px` }}
          >
            <House index={index} club={club} onClick={handleClubClick} />
          </div>
        ))
      ) : (
        // Fallback to display empty houses if no clubs
        [...Array(6)].map((_, index) => (
          <div
            key={index}
            className={`absolute ${index % 2 === 0 ? "left-10" : "right-10"}`}
            style={{ top: `${index * 491 - 200}px` }}
          >
            <House index={index} />
          </div>
        ))
      )}

      {/* Suggest Club button */}
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
    </div>
  );
}
