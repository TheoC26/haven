"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  arrayUnion,
} from "firebase/firestore";
import { db } from "@/firebase";

export default function AdminPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { isAdmin, loading: loadingAdmin } = useAdmin();

  const [activeTab, setActiveTab] = useState("clubs");
  const [clubs, setClubs] = useState([]);
  const [users, setUsers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      if (!user || !isAdmin) return;

      setLoading(true);
      try {
        // Fetch clubs
        const clubsCollection = collection(db, "club");
        const clubSnapshot = await getDocs(clubsCollection);
        const clubsData = clubSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setClubs(clubsData);

        // Fetch users
        const usersCollection = collection(db, "users");
        const usersSnapshot = await getDocs(usersCollection);
        const usersData = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersData);

        // Fetch applications
        const applicationsCollection = collection(db, "applications");
        const applicationsSnapshot = await getDocs(applicationsCollection);
        const applicationsData = await Promise.all(
          applicationsSnapshot.docs.map(async (docRef) => {
            const data = docRef.data();
            console.log(data);

            // Get club name
            let clubName = "";
            if (data.clubID) {
              console.log(data.clubID)
              const clubRef = doc(db, "club", data.clubID);
              const clubDoc = await getDoc(clubRef);
              if (clubDoc.exists()) {
                clubName = clubDoc.data().name;
              }
            }

            console.log(docRef.id)

            return {
              id: docRef.id,
              ...data,
              clubName,
            };
          })
        );
        console.log(applicationsData);
        setApplications(applicationsData);
      } catch (err) {
        console.error("Error fetching admin data:", err);
        setError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, isAdmin]);

  // Check if user is admin
  useEffect(() => {
    if (!loadingAdmin && !isAdmin) {
      router.push("/");
    }
  }, [isAdmin, loadingAdmin, router]);

  // Handle application approval
  const handleApproveApplication = async (application) => {
    try {
      // Update application status
      await updateDoc(doc(db, "applications", application.id), {
        status: "approved",
      });

      // Add user to club members
      await updateDoc(doc(db, "club", application.clubID), {
        members: arrayUnion(application.userID),
      });

      // Update local state
      setApplications((prevApplications) =>
        prevApplications.map((app) =>
          app.id === application.id ? { ...app, status: "approved" } : app
        )
      );
    } catch (err) {
      console.error("Error approving application:", err);
      alert("Failed to approve application. Please try again.");
    }
  };

  // Handle application rejection
  const handleRejectApplication = async (application) => {
    try {
      await updateDoc(doc(db, "applications", application.id), {
        status: "rejected",
      });

      // Update local state
      setApplications((prevApplications) =>
        prevApplications.map((app) =>
          app.id === application.id ? { ...app, status: "rejected" } : app
        )
      );
    } catch (err) {
      console.error("Error rejecting application:", err);
      alert("Failed to reject application. Please try again.");
    }
  };

  // Handle club deletion
  const handleDeleteClub = async (clubId) => {
    if (
      !confirm(
        "Are you sure you want to delete this club? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await deleteDoc(doc(db, "club", clubId));

      // Update local state
      setClubs((prevClubs) => prevClubs.filter((club) => club.id !== clubId));
    } catch (err) {
      console.error("Error deleting club:", err);
      alert("Failed to delete club. Please try again.");
    }
  };

  if (loadingAdmin) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#B3DAAA]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#6A3C1F]"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-[#B3DAAA] p-6">
      <div className="max-w-6xl mx-auto bg-[#AF6E45] rounded-xl border-8 border-[#A3643C] shadow-xl overflow-hidden">
        <div className="p-6 bg-[#A3643C] border-b-4 border-[#6A3C1F]">
          <h1 className="text-2xl font-bold text-white">Digital Haven Admin</h1>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#6A3C1F]">
          <button
            className={`px-6 py-3 text-lg font-medium ${
              activeTab === "clubs"
                ? "bg-[#6A3C1F] text-white"
                : "text-[#6A3C1F] hover:bg-[#6A3C1F10]"
            }`}
            onClick={() => setActiveTab("clubs")}
          >
            Clubs
          </button>
          <button
            className={`px-6 py-3 text-lg font-medium ${
              activeTab === "users"
                ? "bg-[#6A3C1F] text-white"
                : "text-[#6A3C1F] hover:bg-[#6A3C1F10]"
            }`}
            onClick={() => setActiveTab("users")}
          >
            Users
          </button>
          <button
            className={`px-6 py-3 text-lg font-medium ${
              activeTab === "applications"
                ? "bg-[#6A3C1F] text-white"
                : "text-[#6A3C1F] hover:bg-[#6A3C1F10]"
            }`}
            onClick={() => setActiveTab("applications")}
          >
            Applications
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6A3C1F]"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          ) : (
            <>
              {/* Clubs Tab */}
              {activeTab === "clubs" && (
                <div>
                  <h2 className="text-xl font-semibold text-[#6A3C1F] mb-4">
                    Manage Clubs ({clubs.length})
                  </h2>

                  <div className="overflow-auto bg-[#BE9871] rounded-lg shadow">
                    <table className="min-w-full divide-y divide-[#6A3C1F]/30">
                      <thead className="bg-[#6A3C1F]">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                            Leader
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                            Members
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#6A3C1F]/20">
                        {clubs.map((club) => (
                          <tr key={club.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-[#6A3C1F]">
                              {club.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-[#6A3C1F]">
                              {club.leaderName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-[#6A3C1F]">
                              {club.members ? club.members.length : 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-[#6A3C1F]">
                              <button
                                onClick={() => handleDeleteClub(club.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}

                        {clubs.length === 0 && (
                          <tr>
                            <td
                              colSpan={4}
                              className="px-6 py-4 text-center text-[#6A3C1F]"
                            >
                              No clubs found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Users Tab */}
              {activeTab === "users" && (
                <div>
                  <h2 className="text-xl font-semibold text-[#6A3C1F] mb-4">
                    Manage Users ({users.length})
                  </h2>

                  <div className="overflow-auto bg-[#BE9871] rounded-lg shadow">
                    <table className="min-w-full divide-y divide-[#6A3C1F]/30">
                      <thead className="bg-[#6A3C1F]">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                            Color
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                            Bio
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#6A3C1F]/20">
                        {users.map((user) => (
                          <tr key={user.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-[#6A3C1F]">
                              {user.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div
                                className="w-6 h-6 rounded-full"
                                style={{
                                  backgroundColor: user.color || "#6A3C1F",
                                }}
                              ></div>
                            </td>
                            <td className="px-6 py-4 text-[#6A3C1F]">
                              {user.bio || "No bio"}
                            </td>
                          </tr>
                        ))}

                        {users.length === 0 && (
                          <tr>
                            <td
                              colSpan={3}
                              className="px-6 py-4 text-center text-[#6A3C1F]"
                            >
                              No users found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Applications Tab */}
              {activeTab === "applications" && (
                <div>
                  <h2 className="text-xl font-semibold text-[#6A3C1F] mb-4">
                    Applications ({applications.length})
                  </h2>

                  <div className="space-y-4">
                    {applications.map((application) => (
                      <div
                        key={application.id}
                        className="bg-[#BE9871] rounded-lg overflow-hidden shadow border border-[#6A3C1F]/20"
                      >
                        <div className="p-4 bg-[#A3643C] border-b border-[#6A3C1F]/20">
                          <div className="flex justify-between items-center">
                            <h3 className="text-lg font-medium text-white">
                              {application.name} → {application.clubName}
                            </h3>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                application.status === "approved"
                                  ? "bg-green-100 text-green-800"
                                  : application.status === "rejected"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {application.status || "pending"}
                            </span>
                          </div>
                        </div>

                        <div className="p-4 space-y-3">
                          <div>
                            <h4 className="text-sm font-medium text-[#6A3C1F]">
                              Bio
                            </h4>
                            <p className="text-[#6A3C1F]">
                              {application.bio || "No bio provided"}
                            </p>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium text-[#6A3C1F]">
                              Why they want to join
                            </h4>
                            <p className="text-[#6A3C1F]">
                              {application.whyWantToJoin}
                            </p>
                          </div>

                          {application.anythingWeShouldKnow && (
                            <div>
                              <h4 className="text-sm font-medium text-[#6A3C1F]">
                                Additional information
                              </h4>
                              <p className="text-[#6A3C1F]">
                                {application.anythingWeShouldKnow}
                              </p>
                            </div>
                          )}

                          {application.status === "pending" && (
                            <div className="flex space-x-2 pt-2">
                              <button
                                onClick={() =>
                                  handleApproveApplication(application)
                                }
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() =>
                                  handleRejectApplication(application)
                                }
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {applications.length === 0 && (
                      <div className="bg-[#BE9871] rounded-lg p-6 text-center text-[#6A3C1F]">
                        No applications found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
