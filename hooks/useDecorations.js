import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  addDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/firebase";

export const useDecorations = () => {
  const [decorations, setDecorations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDecorations = async () => {
      try {
        setLoading(true);
        // Create a query to order by dateCreated descending
        const decorationsCollection = collection(db, "decorations");
        const decorationsQuery = query(
          decorationsCollection,
          orderBy("dateCreated", "asc")
        );
        const decorationSnapshot = await getDocs(decorationsQuery);

        const decorationsData = decorationSnapshot.docs.map((decorationDoc) => {
          const decorationData = decorationDoc.data();
          return {
            id: decorationDoc.id,
            ...decorationData,
          };
        });

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
      const decorationsCollection = collection(db, "decorations");
      const docRef = await addDoc(decorationsCollection, decoration);
      setDecorations((prev) => [{ ...decoration, id: docRef.id }, ...prev]);
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
