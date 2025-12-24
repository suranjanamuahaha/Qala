// src/pages/ArtistProfile.tsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "../firebase";
import { getUserProfile, saveUserProfile } from "../lib/firebaseHelpers";
import type { Role } from "../lib/types";

const auth = getAuth(app);
const storage = getStorage(app);

type ArtistProfileData = {
  email?: string;
  role?: Role;
  displayName?: string; // artist name
  tagline?: string; // "Digital Artist | Concept Designer"
  bio?: string;

  instagram?: string;
  artstation?: string;
  portfolio?: string;

  avatarUrl?: string; // profile picture URL
  artworks?: string[]; // gallery image URLs
};

const ArtistProfile: React.FC = () => {
  const [uid, setUid] = useState<string | null>(null);
  const [form, setForm] = useState<ArtistProfileData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingArtwork, setUploadingArtwork] = useState(false);

  // Track logged-in user
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUid(user.uid);
      } else {
        setUid(null);
        setForm({});
      }
    });
    return () => unsub();
  }, []);

  // Load artist profile
  useEffect(() => {
    const load = async () => {
      if (!uid) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await getUserProfile(uid);

        const merged: ArtistProfileData = {
          email: data?.email ?? auth.currentUser?.email ?? "",
          role: (data?.role as Role) ?? "artist",
          displayName: data?.displayName ?? auth.currentUser?.displayName ?? "",
          tagline: (data as any)?.tagline ?? "Digital Artist | Concept Designer",
          bio:
            (data as any)?.bio ??
            "Describe your style, themes, and what inspires your art.",
          instagram: (data as any)?.instagram ?? "",
          artstation: (data as any)?.artstation ?? "",
          portfolio: (data as any)?.portfolio ?? "",
          avatarUrl: (data as any)?.avatarUrl ?? "",
          artworks:
            (data as any)?.artworks ?? [
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
        setError(err?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [uid]);

  const handleChange =
    (field: keyof ArtistProfileData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = e.target.value;
      setForm((prev) => ({ ...prev, [field]: value }));
    };

  const handleArtworkChange =
    (index: number) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setForm((prev) => {
        const artworks = [...(prev.artworks ?? [])];
        artworks[index] = value;
        return { ...prev, artworks };
      });
    };

  const handleAddArtwork = () => {
    setForm((prev) => ({
      ...prev,
      artworks: [...(prev.artworks ?? []), ""],
    }));
  };

  const handleRemoveArtwork = (index: number) => {
    setForm((prev) => {
      const artworks = [...(prev.artworks ?? [])];
      artworks.splice(index, 1);
      return { ...prev, artworks };
    });
  };

  // helper to upload an image file to storage and get URL
  const uploadImage = async (file: File, folder: string): Promise<string> => {
    if (!uid) throw new Error("User not logged in");
    const fileRef = ref(
      storage,
      `${folder}/${uid}/${Date.now()}_${file.name}`
    );
    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);
    return url;
  };

  // avatar upload
  const handleAvatarFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!uid) return;
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingAvatar(true);
      setError(null);
      const url = await uploadImage(file, "avatars");
      setForm((prev) => ({ ...prev, avatarUrl: url }));
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to upload profile picture");
    } finally {
      setUploadingAvatar(false);
      // reset input so same file can be re-selected if needed
      e.target.value = "";
    }
  };

  // artworks upload (can be multiple files)
  const handleArtworkFileAdd = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!uid) return;
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploadingArtwork(true);
      setError(null);
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const url = await uploadImage(files[i], "artworks");
        urls.push(url);
      }
      setForm((prev) => ({
        ...prev,
        artworks: [...(prev.artworks ?? []), ...urls],
      }));
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to upload artwork images");
    } finally {
      setUploadingArtwork(false);
      e.target.value = "";
    }
  };

  const handleSave = async () => {
    if (!uid) return;
    try {
      setSaving(true);
      setError(null);
      // save extra artist fields too
      await saveUserProfile(uid, form as any);
      setIsEditing(false);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

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

  if (!uid) {
    return (
      <div className="min-h-screen bg-blue-900/50 flex items-center justify-center px-4">
        <p className="text-gray-100 text-center">
          You need to be logged in as an artist to view this page.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-900/50 flex flex-col items-center py-10 px-5">
      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white shadow-xl rounded-2xl p-8 max-w-3xl w-full relative"
      >
        {/* Edit / Save buttons */}
        <div className="absolute top-4 right-4 flex gap-2">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1 text-xs rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-3 py-1 text-xs rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-1 text-xs rounded-lg border border-blue-500 text-blue-600 hover:bg-blue-50"
            >
              Edit profile
            </button>
          )}
        </div>

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

        {/* Avatar upload (edit mode only) */}
        {isEditing && (
          <div className="mt-3 flex flex-col items-center gap-2">
            <label className="text-xs text-gray-600">
              Update profile picture
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarFileChange}
              className="text-xs"
            />
            {uploadingAvatar && (
              <p className="text-xs text-gray-500 mt-1">
                Uploading profile picture...
              </p>
            )}
          </div>
        )}

        {/* Basic info */}
        {isEditing ? (
          <div className="mt-4 space-y-2">
            <input
              type="text"
              value={form.displayName ?? ""}
              onChange={handleChange("displayName")}
              className="w-full text-3xl font-semibold text-gray-800 text-center border-b border-gray-200 pb-1 focus:outline-none"
              placeholder="Artist name"
            />
            <input
              type="text"
              value={form.tagline ?? ""}
              onChange={handleChange("tagline")}
              className="w-full text-sm text-gray-500 text-center border-b border-gray-200 pb-1 focus:outline-none"
              placeholder="Digital Artist | Concept Designer"
            />
          </div>
        ) : (
          <>
            <h1 className="mt-4 text-3xl font-semibold text-gray-800 text-center">
              {form.displayName || "Your artist name"}
            </h1>
            <p className="text-gray-500 text-sm text-center">
              {form.tagline || "Digital Artist | Concept Designer"}
            </p>
          </>
        )}

        {/* Bio */}
        <div className="mt-4">
          {isEditing ? (
            <textarea
              value={form.bio ?? ""}
              onChange={handleChange("bio")}
              rows={4}
              className="w-full text-gray-700 text-base leading-relaxed border rounded-lg px-3 py-2"
              placeholder="Tell clients about your style, experience, and what you love to create..."
            />
          ) : (
            <p className="text-gray-700 text-base leading-relaxed text-center">
              {form.bio ||
                "Share a short bio about your artistic journey, your favorite themes, and what inspires your work."}
            </p>
          )}
        </div>

        {/* Social links */}
        <div className="mt-5 flex flex-col sm:flex-row justify-center gap-4 text-sm">
          {isEditing ? (
            <div className="w-full space-y-2">
              <input
                type="text"
                value={form.instagram ?? ""}
                onChange={handleChange("instagram")}
                placeholder="Instagram URL"
                className="w-full border rounded-lg px-3 py-2"
              />
              <input
                type="text"
                value={form.artstation ?? ""}
                onChange={handleChange("artstation")}
                placeholder="ArtStation URL"
                className="w-full border rounded-lg px-3 py-2"
              />
              <input
                type="text"
                value={form.portfolio ?? ""}
                onChange={handleChange("portfolio")}
                placeholder="Portfolio URL"
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>

        {error && (
          <div className="mt-4 text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 text-left">
            {error}
          </div>
        )}
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

      {/* Artwork editing controls */}
      {isEditing && (
        <div className="max-w-5xl w-full mt-8 bg-white/90 rounded-2xl shadow-md p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Edit artworks
          </h2>
          <p className="text-xs text-gray-500 mb-2">
            Add links to your artwork images or upload new ones from your
            device.
          </p>

          <div className="space-y-3">
            {artworks.map((url, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={url}
                  onChange={handleArtworkChange(index)}
                  className="flex-1 border rounded-lg px-3 py-2 text-sm"
                  placeholder="https://example.com/your-artwork.jpg"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveArtwork(index)}
                  className="text-xs px-2 py-1 rounded-lg border border-red-300 text-red-500 hover:bg-red-50"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddArtwork}
            className="mt-2 text-xs px-3 py-1 rounded-lg border border-blue-400 text-blue-600 hover:bg-blue-50"
          >
            + Add artwork by URL
          </button>

          <div className="mt-4">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Or upload artwork images from your device
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleArtworkFileAdd}
              className="text-xs"
            />
            {uploadingArtwork && (
              <p className="text-xs text-gray-500 mt-1">
                Uploading artwork images...
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ArtistProfile;
