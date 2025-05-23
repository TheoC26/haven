import { useState, useEffect } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";

export const useClubs = () => {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        setLoading(true);
        const clubsCollection = collection(db, "club");
        const clubSnapshot = await getDocs(clubsCollection);

        const clubsData = await Promise.all(
          clubSnapshot.docs.map(async (clubDoc) => {
            const clubData = clubDoc.data();

            // Fetch leader's name if not already included
            if (clubData.leaderID && !clubData.leaderName) {
              try {
                const leaderDoc = await getDoc(
                  doc(db, "users", clubData.leaderID)
                );
                if (leaderDoc.exists()) {
                  const leaderData = leaderDoc.data();
                  clubData.leaderName = leaderData.name;
                }
              } catch (err) {
                console.error("Error fetching leader data:", err);
              }
            }


            return {
              id: clubDoc.id,
              ...clubData,
            };
          })
        );

        // console.log("Fetched clubs:", clubsData);

        setClubs(clubsData);
      } catch (err) {
        console.error("Error fetching clubs:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClubs();
  }, []);

  const getClubById = (id) => {
    return clubs.find((club) => club.id === id) || null;
  };

  const addClub = async (club) => {
    try {
      const clubsCollection = collection(db, "club");
      await addDoc(clubsCollection, club);
      setClubs((prev) => [...prev, { ...club, id: club.id }]);
    } catch (err) {
      console.error("Error adding club:", err);
      setError(err.message);
    }
  }

  return {
    clubs,
    loading,
    error,
    getClubById,
    addClub,
  };
};
