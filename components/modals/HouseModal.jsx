"use client";
import React, { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";

const HouseModal = ({ isOpen, onClose, club, onApply }) => {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMembers = async () => {
      if (!club?.members || club.members.length === 0) return;

      setLoading(true);
      try {
        const memberPromises = club.members.map(async (memberId) => {
          const memberDoc = await getDoc(doc(db, "users", memberId));
          if (memberDoc.exists()) {
            return {
              id: memberId,
              ...memberDoc.data(),
            };
          }
          return null;
        });

        const memberData = await Promise.all(memberPromises);
        setMembers(memberData.filter(Boolean));
      } catch (error) {
        console.error("Error fetching members:", error);
      } finally {
        setLoading(false);
      }
    };

    if (club && isOpen) {
      fetchMembers();
    }
  }, [club, isOpen]);

  if (!club) return null;

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";

    const date =
      timestamp instanceof Date
        ? timestamp
        : timestamp.toDate
        ? timestamp.toDate()
        : new Date(timestamp);

    return date.toLocaleDateString();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog
          as={motion.div}
          static
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          open={isOpen}
          onClose={onClose}
          className="relative z-50 text-black"
        >
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

          {/* Full-screen container */}
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel
              as={motion.div}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white rounded-2xl shadow-xl max-w-5xl w-full max-h-[70vh] overflow-auto"
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute right-4 top-4 bg-white rounded-bl-xl p-2 text-[#53674F] transition-all hover:text-[#53674F]/90 cursor-pointer"
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

              {/* Content */}
              <div className="overflow-y-auto">
                {/* House Image */}
                <div className="w-full h-full p-6">
                  <img
                    src={`/art/inside/house${club.house_image}.png`}
                    alt={club.name}
                    className="w-full h-96 object-cover rounded-xl"
                  />
                </div>

                {/* Header */}
                <div className="fixed top-[8vh] left-1/2 -translate-x-1/2 -z-10 bg-white p-4 px-12 rounded-t-2xl">
                  <Dialog.Title className="text-2xl font-semibold text-[#53674F] text-center">
                    {club.name}
                  </Dialog.Title>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                  {/* Club info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-3 ">
                        About This Club
                      </h3>
                      <div className="prose max-w-none ">
                        <p>{club.description}</p>
                      </div>

                      {club.images && club.images.length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-medium mb-2 ">Club Images</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {club.images.length > 0 &&
                              club.images.map((imageUrl, index) => (
                                <img
                                  key={index}
                                  src={imageUrl}
                                  alt={`${club.name} image ${index + 1}`}
                                  className="rounded-lg w-full h-32 object-cover"
                                />
                              ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium ">Leader</h4>
                        <p>{club.leaderName || "Unknown"}</p>
                      </div>

                      <div>
                        <h4 className="font-medium ">Date Created</h4>
                        <p>{formatDate(club.dateCreated)}</p>
                      </div>

                      <div>
                        <h4 className="font-medium ">Meeting Times</h4>
                        {club.meetingTimes && club.meetingTimes.length > 0 ? (
                          <ul className="list-disc pl-5">
                            {club.meetingTimes.map((time, index) => (
                              <li key={index}>{time}</li>
                            ))}
                          </ul>
                        ) : (
                          <p>No scheduled meetings</p>
                        )}
                      </div>

                      <div>
                        <h4 className="font-medium ">Communication Method</h4>
                        <p>{club.communicationMethod || "Not specified"}</p>
                      </div>

                      <div>
                        <h4 className="font-medium ">Commitment Level</h4>
                        <div className="flex items-center mt-1">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-6 h-2 mx-0.5 rounded ${
                                i < (club.commitmentLevel || 0)
                                  ? "bg-[#53674F]"
                                  : "bg-[#53674F]/30"
                              }`}
                            />
                          ))}
                          <span className="ml-2 text-sm">
                            {club.commitmentLevel}/5
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Members section */}
                  <div className="mt-8 pt-8 border-t border-[#53674F]/30">
                    <h3 className="text-xl font-semibold mb-4 ">
                      Our Members ({members.length})
                    </h3>

                    {loading ? (
                      <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#53674F]"></div>
                      </div>
                    ) : members.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {members.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center space-x-2"
                          >
                            <div
                              className="w-8 h-8 rounded-full"
                              style={{
                                backgroundColor: member.color || "#53674F",
                              }}
                            ></div>
                            <span>{member.name}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="">No members yet. Be the first to join!</p>
                    )}
                  </div>

                  {/* Apply to join button */}
                  <div className="mt-8 pt-8 border-t border-[#53674F]/30">
                    <button
                      onClick={onApply}
                      className="w-full bg-[#53674F] text-white py-3 px-4 rounded-lg hover:bg-[#53674F]/90 transition-colors duration-200 font-semibold text-lg"
                    >
                      Apply to Join This Club
                    </button>
                  </div>
                </div>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

export default HouseModal;
