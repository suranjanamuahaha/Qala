// src/pages/ArtistPublicProfile.tsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { getUserProfile } from "../lib/firebaseHelpers";
import type { Role } from "../lib/types";
import ChatModal from "./chatModal";

type ArtistProfileData = {
  email?: string;
  role?: Role;
  displayName?: string;
  tagline?: string;
  bio?: string;

  instagram?: string;
  artstation?: string;
  portfolio?: string;

  avatarUrl?: string;
  artworks?: string[];
};

const ArtistPublicProfile: React.FC = () => {
  const { artistId } = useParams<{ artistId: string }>();
  const [form, setForm] = useState<ArtistProfileData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const auth = getAuth();

  useEffect(() => {
    const load = async () => {
      if (!artistId) {
        setError("Artist not found.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await getUserProfile(artistId);

        if (!data || data.role !== "artist") {
          setError("This artist profile does not exist.");
          setLoading(false);
          return;
        }

        const merged: ArtistProfileData = {
          email: data.email,
          role: data.role,
          displayName: data.displayName,
          tagline: (data as any).tagline ?? "Digital Artist | Concept Designer",
          bio:
            (data as any).bio ??
            "Describe your style, themes, and what inspires your art.",
          instagram: (data as any).instagram ?? "",
          artstation: (data as any).artstation ?? "",
          portfolio: (data as any).portfolio ?? "",
          avatarUrl: (data as any).avatarUrl ?? "",
          artworks:
            (data as any).artworks ?? [
              "/assets/art1.jpg",
              "/assets/art2.jpg",
              "/assets/art3.jpg",
              "/assets/art4.jpg",
              "/assets/art5.jpg",
              "/assets/art6.jpg",
            ],
        };

        setForm(merged);
      } catch (err: any) {
        console.error(err);
        setError(err?.message || "Failed to load artist profile");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [artistId]);

  const avatarInitial =
    form.displayName && form.displayName.trim().length > 0
      ? form.displayName.trim()[0].toUpperCase()
      : "A";

  const artworks = form.artworks ?? [];

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-900/50 flex items-center justify-center">
        <p className="text-gray-100">Loading artist profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-blue-900/50 flex items-center justify-center px-4">
        <p className="text-gray-100 text-center">{error}</p>
      </div>
    );
  }

  const handleMessageClick = () => {
    const user = auth.currentUser;
    if (!user) {
      alert("Please log in to send a message to this artist.");
      return;
    }
    setIsChatOpen(true);
  };

  return (
    <>
      <div className="min-h-screen bg-blue-900/50 flex flex-col items-center py-10 px-5">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white shadow-xl rounded-2xl p-8 max-w-3xl w-full relative"
        >
          {/* Avatar */}
          {form.avatarUrl ? (
            <img
              src={form.avatarUrl}
              alt="Artist Profile"
              className="w-36 h-36 rounded-full mx-auto object-cover shadow-md"
            />
          ) : (
            <div className="w-36 h-36 rounded-full mx-auto bg-blue-100 flex items-center justify-center text-4xl font-bold text-blue-700 shadow-md">
              {avatarInitial}
            </div>
          )}

          {/* Order / Message buttons */}
          <div className="mt-4 flex justify-center gap-3">
            <button
              type="button"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
              onClick={() => {
                alert("Order flow coming soon!");
              }}
            >
              Order
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded-lg border border-blue-600 text-blue-600 text-sm font-medium hover:bg-blue-50 transition"
              onClick={handleMessageClick}
            >
              Message
            </button>
          </div>

          {/* Basic info */}
          <h1 className="mt-4 text-3xl font-semibold text-gray-800 text-center">
            {form.displayName || "Artist"}
          </h1>
          <p className="text-gray-500 text-sm text-center">
            {form.tagline || "Digital Artist | Concept Designer"}
          </p>

          {/* Bio */}
          <div className="mt-4">
            <p className="text-gray-700 text-base leading-relaxed text-center">
              {form.bio ||
                "Share a short bio about your artistic journey, your favorite themes, and what inspires your work."}
            </p>
          </div>

          {/* Social links */}
          <div className="mt-5 flex flex-col sm:flex-row justify-center gap-4 text-sm">
            {form.instagram && (
              <a
                href={form.instagram}
                target="_blank"
                rel="noreferrer"
                className="text-blue-500 hover:text-blue-700 transition-colors"
              >
                Instagram
              </a>
            )}
            {form.artstation && (
              <a
                href={form.artstation}
                target="_blank"
                rel="noreferrer"
                className="text-blue-500 hover:text-blue-700 transition-colors"
              >
                ArtStation
              </a>
            )}
            {form.portfolio && (
              <a
                href={form.portfolio}
                target="_blank"
                rel="noreferrer"
                className="text-blue-500 hover:text-blue-700 transition-colors"
              >
                Portfolio
              </a>
            )}
          </div>
        </motion.div>

        {/* Works Gallery */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-10 max-w-5xl w-full"
        >
          {artworks.map((img, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.03 }}
              className="bg-white rounded-xl shadow-md overflow-hidden"
            >
              {img ? (
                <img
                  src={img}
                  alt={`Art ${i + 1}`}
                  className="w-full h-64 object-cover"
                />
              ) : (
                <div className="w-full h-64 flex items-center justify-center text-gray-400 text-sm">
                  Artwork URL not set
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Chat modal for messaging this artist */}
      {artistId && (
        <ChatModal
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          artistId={artistId}
        />
      )}
    </>
  );
};

export default ArtistPublicProfile;
