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
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  // Auth state
  const { user, checkUserExists } = useAuth();

  // Modal states
  const [showGreeting, setShowGreeting] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

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
    if (user && !user.isAnonymous) {
      window.location.href = "/experience";
    }

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
    if (user && !user.isAnonymous) {
      const exists = await checkUserExists(user.uid);
      if (!exists) {
        setShowOnboarding(true);
      }
    }
  };

  return (
    <div className="w-screen min-h-screen bg-[#B3DAAA] overflow-hidden">
      <Header
        onInfoClick={() => setShowGreeting(true)}
        onLoginClick={handleLoginClick}
        onProfileClick={handleProfileClick}
      />

      <div
        className="relative w-full h-screen"
        style={{
          left: "100%",
          transform: "translateX(-50%)",
        }}
      >
        {/* Now left-0 = center, negative = left, positive = right */}

        {/* Welcome sign - dead center */}
        <Image
          src="/art/decoration/welcomehaven.png"
          alt="Welcome Haven"
          className="absolute left-0 top-[88px] -translate-x-1/2" // -translate-x-1/2 centers the image itself
          width={330}
          height={583}
        />

        <Image
          src="/art/house/house3.png"
          alt="House"
          className="absolute -left-[530px] -top-[150px] -translate-x-1/2"
          width={600}
          height={150}
        />

        {/* Tree to the left */}
        <Image
          src="/art/decoration/tree3.png"
          alt="Tree"
          className="absolute -left-64 top-[150px] -translate-x-1/2"
          width={350}
          height={120}
        />
        <Image
          src="/art/decoration/tree2.png"
          alt="Tree"
          className="absolute left-[270px] top-[100px] -translate-x-1/2"
          width={370}
          height={120}
        />
        <Image
          src="/art/decoration/tree4.png"
          alt="Tree"
          className="absolute left-[210px] top-[290px] -translate-x-1/2"
          width={110}
          height={120}
        />

        {/* BUSHHH */}
        <Image
          src="/art/decoration/bush2.png"
          alt="Tree"
          className="absolute -left-[200px] top-[480px] -translate-x-1/2"
          width={130}
          height={120}
        />
        <Image
          src="/art/decoration/bush3.png"
          alt="Tree"
          className="absolute left-[290px] top-[500px] -translate-x-1/2"
          width={110}
          height={120}
        />

        {/* House to the right */}
        <Image
          src="/art/house/house1.png"
          alt="House"
          className="absolute left-[510px] top-[670px] -translate-x-1/2 -scale-x-100"
          width={600}
          height={150}
        />

        {/* Stone path */}
        <Image
          src="/art/decoration/stonepath.png"
          alt="Stone Path"
          className="absolute hidden md:block left-[-27%] md:left-[-220px] top-[500px] -translate-x-1/2"
          width={810}
          height={1249.38}
        />
        {/* Tree Bottom Right */}
        <Image
          src="/art/decoration/tree3.png"
          alt="Tree"
          className="absolute left-[330px] top-[1220px] -translate-x-1/2"
          width={312}
          height={120}
        />
        {/* Tree2 Bottom Right */}
        <Image
          src="/art/decoration/tree4.png"
          alt="Tree"
          className="absolute left-[405px] top-[1350px] -translate-x-1/2"
          width={100}
          height={120}
        />
      </div>
      <div className="absolute w-full md:max-w-2xl text-4xl md:text-5xl scale-95 text-black text-center left-1/2 -translate-x-1/2 font-bold top-[700px] md:top-[1120px]">
        A place to stay connected with online communities <br /> Build together.
        Learn together. <br /> Be together.
      </div>
      <div className="absolute w-full md:w-3xl scale-95 text-black text-center left-1/2 -translate-x-1/2 font-bold top-[1120px] md:top-[1700px]">
        <h2 className="w-full text-center mb-5 text-3xl md:text-4xl">
          Watch it in action
        </h2>
        <div className="w-full md:w-3xl aspect-video bg-black rounded-3xl border-8 border-[#53674F]"></div>
      </div>

      <section className="max-w-screen-2xl min-w-screen absolute left-1/2 -translate-x-1/2 font-bold top-[1600px] md:top-[2300px]">
        <div className="text-center text-3xl md:text-4xl text-black">
          Our clubs
        </div>
        <div className="hidden lg:grid lg:grid-cols-6 lg:grid-rows-6 gap-4 h-[40rem] p-12 pt-5">
          <div className="col-span-2 row-span-2 bg-[#ADD2A4] rounded-2xl flex p-3 justify-between flex-col items-center"></div>
          <div className="col-span-2 row-span-6 bg-gradient-to-br from-[#add2a4a2] to-[#ADD2A4] rounded-2xl flex flex-col items-center justify-center">
            <Image src={"/logo.png"} width={80} height={80} alt="logo" />
            <div className="mt-3 text-black text-xl">
              Our first clubs are launching soon!
            </div>
            <div className="mt-0 text-gray-800 text-lg">Stay tuned.</div>
          </div>
          <div className="col-span-2 row-span-3 bg-[#ADD2A4] rounded-2xl flex flex-col items-center justify-between p-6 gap-6"></div>
          <div className="col-span-2 row-span-4 bg-[#ADD2A4] rounded-2xl flex flex-col items-center justify-between p-6 gap-6"></div>
          <div className="col-span-1 row-span-3 bg-[#ADD2A4] rounded-2xl flex p-3 justify-between flex-col items-center py-6"></div>
          <div className="col-span-1 row-span-3 bg-[#ADD2A4] rounded-2xl flex items-center justify-around transition-all"></div>
        </div>
        <div className="grid lg:hidden grid-cols-2 md:grid-cols-4 md:grid-rows-6 gap-4 h-[40rem] p-3 md:p-12">
          <div className="col-span-2 row-span-2 bg-[#ADD2A4] rounded-2xl hidden md:flex flex-col items-center justify-between p-3 gap-1"></div>
          <div className="col-span-2 row-span-5 bg-gradient-to-br from-[#add2a4a2] to-[#ADD2A4] rounded-2xl flex flex-col items-center justify-center">
            <Image src={"/logo.png"} width={80} height={80} alt="logo" />
            <div className="mt-3 text-black text-xl">
              Our first clubs are launching soon!
            </div>
            <div className="mt-0 text-gray-800 text-lg">Stay tuned.</div>
          </div>
          <div className="col-span-2 row-span-3 bg-[#ADD2A4] rounded-2xl flex p-3 justify-between flex-col items-center"></div>
          <div className="col-span-2 row-span-4 bg-[#ADD2A4] rounded-2xl flex flex-col items-center justify-between p-6 gap-6"></div>
          <div className="col-span-1 row-span-4 bg-[#ADD2A4] rounded-2xl flex p-3 justify-between flex-col items-center py-6"></div>
          <div className="col-span-1 row-span-4 bg-[#ADD2A4] rounded-2xl flex items-center justify-around transition-all"></div>
        </div>
      </section>
      <div className="h-[1716px] md:h-[2400px]"></div>
      <div className="w-full flex flex-col items-center justify-between">
        <Link
          href={"https://www.thisteenagelife.org/"}
          className="flex flex-col items-center mb-32 cursor-pointer"
        >
          <Image src={"/ttllogo.png"} width={250} height={250} alt="logo" />
          <h1 className="text-4xl text-center font-bold text-[#53674F] mt-5">
            Sponcered by: This Teenage Life
          </h1>
        </Link>
        <div className="text-center w-full p-3 text-[#53674F] sm:flex sm:justify-between sm:text-left">
          <p className="text-medium">
            <span className="block sm:inline">Built by </span>

            <Link
              className="inline-block text-black underline transition hover:opacity-75"
              href="https://theodore-chan.com/"
            >
              Theodore Chan
            </Link>
          </p>

          <p className="mt-4 text-medium sm:order-first sm:mt-0">
            &copy; {new Date().getFullYear()} Digital Haven. All rights
            reserved.
          </p>
        </div>
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
    </div>
  );
}
