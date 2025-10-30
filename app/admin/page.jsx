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
              console.log(data.clubID);
              const clubRef = doc(db, "club", data.clubID);
              const clubDoc = await getDoc(clubRef);
              if (clubDoc.exists()) {
                clubName = clubDoc.data().name;
              }
            }

            console.log(docRef.id);

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
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#53674F]"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-[#53674F] text-white">
          <h1 className="text-3xl font-bold">Digital Haven Admin</h1>
          <p className="text-[#53674F]/20 mt-1">
            Manage clubs, users, and applications
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200">
          <button
            className={`px-8 py-4 text-lg font-medium transition-colors ${
              activeTab === "clubs"
                ? "border-b-2 border-[#53674F] text-[#53674F] bg-[#53674F]/5"
                : "text-gray-600 hover:text-[#53674F] hover:bg-gray-50"
            }`}
            onClick={() => setActiveTab("clubs")}
          >
            Clubs ({clubs.length})
          </button>
          <button
            className={`px-8 py-4 text-lg font-medium transition-colors ${
              activeTab === "users"
                ? "border-b-2 border-[#53674F] text-[#53674F] bg-[#53674F]/5"
                : "text-gray-600 hover:text-[#53674F] hover:bg-gray-50"
            }`}
            onClick={() => setActiveTab("users")}
          >
            Users ({users.length})
          </button>
          <button
            className={`px-8 py-4 text-lg font-medium transition-colors ${
              activeTab === "applications"
                ? "border-b-2 border-[#53674F] text-[#53674F] bg-[#53674F]/5"
                : "text-gray-600 hover:text-[#53674F] hover:bg-gray-50"
            }`}
            onClick={() => setActiveTab("applications")}
          >
            Applications ({applications.length})
          </button>
        </div>

        {/* Content Area */}
        <div className="p-8">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#53674F]"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          ) : (
            <>
              {/* Clubs Tab */}
              {activeTab === "clubs" && (
                <div>
                  <h2 className="text-2xl font-semibold text-black mb-6">
                    Manage Clubs
                  </h2>

                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                            Club Name
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                            Leader
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                            Members
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {clubs.map((club) => (
                          <tr key={club.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-black font-medium">
                              {club.name}
                            </td>
                            <td className="px-6 py-4 text-gray-600">
                              {club.leaderName}
                            </td>
                            <td className="px-6 py-4 text-gray-600">
                              {club.members ? club.members.length : 0}
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => handleDeleteClub(club.id)}
                                className="text-red-600 hover:text-red-800 font-medium transition-colors"
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
                              className="px-6 py-8 text-center text-gray-500"
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
                  <h2 className="text-2xl font-semibold text-black mb-6">
                    Manage Users
                  </h2>

                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                            Name
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                            Color
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                            Bio
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {users.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-black font-medium">
                              {user.name}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-2">
                                <div
                                  className="w-6 h-6 rounded-full border border-gray-300"
                                  style={{
                                    backgroundColor: user.color || "#53674F",
                                  }}
                                ></div>
                                <span className="text-gray-600 text-sm">
                                  {user.color || "#53674F"}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
                              {user.bio || "No bio"}
                            </td>
                          </tr>
                        ))}

                        {users.length === 0 && (
                          <tr>
                            <td
                              colSpan={3}
                              className="px-6 py-8 text-center text-gray-500"
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
                  <h2 className="text-2xl font-semibold text-black mb-6">
                    Application Management
                  </h2>

                  <div className="space-y-6">
                    {applications.map((application) => (
                      <div
                        key={application.id}
                        className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm"
                      >
                        <div className="p-6 bg-gray-50 border-b border-gray-200">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="text-xl font-semibold text-black">
                                {application.name}
                              </h3>
                              <p className="text-gray-600 mt-1">
                                Applying to:{" "}
                                <span className="font-medium">
                                  {application.clubName}
                                </span>
                              </p>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${
                                application.status === "approved"
                                  ? "bg-green-100 text-green-800"
                                  : application.status === "rejected"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {application.status || "Pending"}
                            </span>
                          </div>
                        </div>

                        <div className="p-6 space-y-4">
                          <div>
                            <h4 className="text-sm font-semibold text-black mb-2">
                              Bio
                            </h4>
                            <p className="text-gray-700">
                              {application.bio || "No bio provided"}
                            </p>
                          </div>

                          <div>
                            <h4 className="text-sm font-semibold text-black mb-2">
                              Why they want to join
                            </h4>
                            <p className="text-gray-700">
                              {application.whyWantToJoin}
                            </p>
                          </div>

                          {application.anythingWeShouldKnow && (
                            <div>
                              <h4 className="text-sm font-semibold text-black mb-2">
                                Additional information
                              </h4>
                              <p className="text-gray-700">
                                {application.anythingWeShouldKnow}
                              </p>
                            </div>
                          )}

                          {application.status === "pending" && (
                            <div className="flex space-x-3 pt-4 border-t border-gray-200">
                              <button
                                onClick={() =>
                                  handleApproveApplication(application)
                                }
                                className="px-6 py-2 bg-[#53674F] text-white rounded-lg hover:bg-[#53674F]/90 transition-colors font-medium"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() =>
                                  handleRejectApplication(application)
                                }
                                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {applications.length === 0 && (
                      <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-500">
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
