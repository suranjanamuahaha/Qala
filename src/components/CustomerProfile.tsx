// src/pages/UserProfile.tsx
import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "../firebase";
import { getUserProfile, saveUserProfile } from "../lib/firebaseHelpers";
import type { Role } from "../lib/types";

const auth = getAuth(app);

type UserProfileData = {
  email?: string;
  role?: Role;
  displayName?: string;
  bio?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  avatarUrl?: string;
};

const CustomerProfile: React.FC = () => {
  const [uid, setUid] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [form, setForm] = useState<UserProfileData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Track logged-in user
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUid(user.uid);
      } else {
        setUid(null);
        setProfile(null);
        setForm({});
      }
    });
    return () => unsub();
  }, []);

  // 2. Load profile from Firestore whenever uid changes
  useEffect(() => {
    const load = async () => {
      if (!uid) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await getUserProfile(uid);
        const merged: UserProfileData = {
          email: data?.email ?? auth.currentUser?.email ?? "",
          role: (data?.role as Role) ?? "customer",
          displayName: data?.displayName ?? auth.currentUser?.displayName ?? "",
          bio: data?.bio ?? "",
          addressLine1: data?.addressLine1 ?? "",
          addressLine2: data?.addressLine2 ?? "",
          city: data?.city ?? "",
          state: data?.state ?? "",
          postalCode: data?.postalCode ?? "",
          country: data?.country ?? "",
          phone: data?.phone ?? "",
          avatarUrl: data?.avatarUrl ?? "",
        };
        setProfile(merged);
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
    (field: keyof UserProfileData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = e.target.value;
      setForm((prev) => ({ ...prev, [field]: value }));
    };

  const handleSave = async () => {
    if (!uid) return;
    try {
      setSaving(true);
      setError(null);
      await saveUserProfile(uid, form); // merge into Firestore
      setProfile(form);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  // For now, just a placeholder avatar. Later we can add upload.
  const avatarInitial =
    form.displayName && form.displayName.trim().length > 0
      ? form.displayName.trim()[0].toUpperCase()
      : "C";

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto mt-10 px-4">
        <p className="text-gray-600">Loading profile...</p>
      </div>
    );
  }

  if (!uid) {
    return (
      <div className="max-w-3xl mx-auto mt-10 px-4">
        <p className="text-gray-600">
          You need to be logged in to view your profile.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 px-4 pb-10">
      <h1 className="text-2xl font-semibold mb-6">Your Profile</h1>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      <div className="bg-white shadow-md rounded-2xl p-6 space-y-6">
        {/* Top section: avatar + basic info */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-700">
            {avatarInitial}
          </div>
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={form.displayName ?? ""}
                  onChange={handleChange("displayName")}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="Your name"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Role: <span className="font-medium">{form.role ?? "customer"}</span>
            </p>
            {form.email && (
              <p className="text-xs text-gray-500">
                Email: <span className="font-mono">{form.email}</span>
              </p>
            )}
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Bio
          </label>
          <textarea
            value={form.bio ?? ""}
            onChange={handleChange("bio")}
            rows={3}
            className="w-full border rounded-lg px-3 py-2 text-sm"
            placeholder="Tell us a bit about yourself..."
          />
        </div>

        {/* Address */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Address line 1
            </label>
            <input
              type="text"
              value={form.addressLine1 ?? ""}
              onChange={handleChange("addressLine1")}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="Street, building, etc."
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Address line 2 (optional)
            </label>
            <input
              type="text"
              value={form.addressLine2 ?? ""}
              onChange={handleChange("addressLine2")}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="Apartment, landmark, etc."
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              City
            </label>
            <input
              type="text"
              value={form.city ?? ""}
              onChange={handleChange("city")}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              State
            </label>
            <input
              type="text"
              value={form.state ?? ""}
              onChange={handleChange("state")}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Postal code
            </label>
            <input
              type="text"
              value={form.postalCode ?? ""}
              onChange={handleChange("postalCode")}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Country
            </label>
            <input
              type="text"
              value={form.country ?? ""}
              onChange={handleChange("country")}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Phone
          </label>
          <input
            type="text"
            value={form.phone ?? ""}
            onChange={handleChange("phone")}
            className="w-full border rounded-lg px-3 py-2 text-sm"
            placeholder="Contact number"
          />
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;
