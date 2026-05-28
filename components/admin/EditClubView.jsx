"use client";
import React, { useState, useEffect } from "react";
import { db } from "@/firebase";
import {
  doc,
  updateDoc,
  collection,
  addDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import TiptapEditor from "@/components/TiptapEditor";

export default function EditClubView({ club, onBack, onUpdate }) {
  const [formData, setFormData] = useState({
    name: club.name || "",
    description: club.description || "",
    leaderName: club.leaderName || "",
    communicationMethod: club.communicationMethod || "",
    commitmentLevel: club.commitmentLevel || 1,
    meetingTimes: club.meetingTimes ? club.meetingTimes.join(", ") : "",
  });

  const [saving, setSaving] = useState(false);
  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [posting, setPosting] = useState(false);

  // Fetch posts
  useEffect(() => {
    if (!club?.id) return;
    const postsRef = collection(db, "club", club.id, "posts");
    const q = query(postsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(postsData);
    });

    return () => unsubscribe();
  }, [club.id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveDetails = async () => {
    setSaving(true);
    try {
      const updateData = {
        ...formData,
        meetingTimes: formData.meetingTimes
          ? formData.meetingTimes.split(",").map((t) => t.trim())
          : [],
        commitmentLevel: parseInt(formData.commitmentLevel),
      };

      await updateDoc(doc(db, "club", club.id), updateData);
      onUpdate({ ...club, ...updateData });
      alert("Club details updated successfully!");
    } catch (err) {
      console.error("Error updating club:", err);
      alert("Failed to update club details.");
    } finally {
      setSaving(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent || newPostContent === "<p></p>") {
      alert("Post content cannot be empty.");
      return;
    }

    setPosting(true);
    try {
      await addDoc(collection(db, "club", club.id, "posts"), {
        content: newPostContent,
        createdAt: serverTimestamp(),
      });
      setNewPostContent("");
      alert("Post created successfully!");
    } catch (err) {
      console.error("Error creating post:", err);
      alert("Failed to create post.");
    } finally {
      setPosting(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      await deleteDoc(doc(db, "club", club.id, "posts", postId));
    } catch (err) {
      console.error("Error deleting post:", err);
      alert("Failed to delete post.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
        >
          <svg
            className="w-6 h-6 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h2 className="text-2xl font-bold text-gray-900">Editing: {club.name}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Details */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Club Details</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Club Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-[#53674F] focus:border-[#53674F]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-[#53674F] focus:border-[#53674F]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Leader Name</label>
              <input
                type="text"
                name="leaderName"
                value={formData.leaderName}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-[#53674F] focus:border-[#53674F]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Times (comma separated)</label>
              <input
                type="text"
                name="meetingTimes"
                value={formData.meetingTimes}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-[#53674F] focus:border-[#53674F]"
                placeholder="e.g. Mondays 5PM, Wednesdays 6PM"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Communication Method</label>
              <input
                type="text"
                name="communicationMethod"
                value={formData.communicationMethod}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-[#53674F] focus:border-[#53674F]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Commitment Level (1-5)</label>
              <input
                type="number"
                name="commitmentLevel"
                min="1"
                max="5"
                value={formData.commitmentLevel}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-[#53674F] focus:border-[#53674F]"
              />
            </div>
            <button
              onClick={handleSaveDetails}
              disabled={saving}
              className="w-full py-2 bg-[#53674F] text-white rounded-lg hover:bg-[#53674F]/90 transition-colors font-medium disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Details"}
            </button>
          </div>
        </div>

        {/* Right Column: Feed Management */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col h-[800px]">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Manage Feed Posts</h3>
          
          {/* Create Post */}
          <div className="mb-6 space-y-3">
            <TiptapEditor
              content={newPostContent}
              onChange={(html) => setNewPostContent(html)}
            />
            <button
              onClick={handleCreatePost}
              disabled={posting || !newPostContent}
              className="w-full py-2 bg-[#53674F] text-white rounded-lg hover:bg-[#53674F]/90 transition-colors font-medium disabled:opacity-50"
            >
              {posting ? "Posting..." : "Publish Post"}
            </button>
          </div>

          <hr className="border-gray-200 mb-4" />

          {/* Posts List */}
          <h4 className="font-medium text-gray-700 mb-2">Previous Posts</h4>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {posts.length === 0 ? (
              <p className="text-gray-500 italic text-sm">No posts yet.</p>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="border border-gray-200 rounded-lg p-4 relative group">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs text-gray-500">
                      {post.createdAt?.toDate ? post.createdAt.toDate().toLocaleString() : "Just now"}
                    </span>
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                      title="Delete Post"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <div
                    className="prose prose-sm max-w-none text-gray-800"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
