import { useState, useEffect } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";

export const useDecorations = () => {
  const [decorations, setDecorations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDecorations = async () => {
      try {
        setLoading(true);
        const decorationsCollection = collection(db, "decorations");
        const decorationSnapshot = await getDocs(decorationsCollection);

        const decorationsData = await Promise.all(
          decorationSnapshot.docs.map(async (decorationDoc) => {
            const decorationData = decorationDoc.data();

            // Fetch leader's name if not already included
            if (decorationData.leaderID && !decorationData.leaderName) {
              try {
                const leaderDoc = await getDoc(
                  doc(db, "users", decorationData.leaderID)
                );
                if (leaderDoc.exists()) {
                  const leaderData = leaderDoc.data();
                  decorationData.leaderName = leaderData.name;
                }
              } catch (err) {
                console.error("Error fetching leader data:", err);
              }
            }

            return {
              id: decorationDoc.id,
              ...decorationData,
            };
          })
        );

        // console.log("Fetched decorations:", decorationsData);

        setDecorations(decorationsData);
      } catch (err) {
        console.error("Error fetching decorations:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDecorations();
  }, []);

  const getDecorationById = (id) => {
    return decorations.find((decoration) => decoration.id === id) || null;
  };

  const addDecoration = async (decoration) => {
    try {
      const decorationsCollection = collection(db, "decoration");
      await addDoc(decorationsCollection, decoration);
      setDecorations((prev) => [...prev, { ...decoration, id: decoration.id }]);
    } catch (err) {
      console.error("Error adding decoration:", err);
      setError(err.message);
    }
  };

  return {
    decorations,
    loading,
    error,
    getDecorationById,
    addDecoration,
  };
};
