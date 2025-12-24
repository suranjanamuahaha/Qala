// src/lib/firebaseHelpers.ts
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import type { Role } from "./types";
import { app } from "../firebase";

const db = getFirestore(app);

export type UserProfile = {
  // core identity
  email?: string;
  role?: Role;
  displayName?: string;

  // avatar / photo
  photoURL?: string;   // from Firebase Auth, if you use it
  avatarUrl?: string;  // custom stored avatar URL (e.g. from Storage)

  // profile content
  bio?: string;

  // address fields
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;

  // contact
  phone?: string;

  // timestamps
  createdAt?: any;
  updatedAt?: any;
};

// remove undefined so we don't overwrite existing fields with undefined
function stripUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
  const out: Partial<T> = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (val !== undefined) out[key as keyof T] = val;
  }
  return out;
}

export const saveUserProfile = async (uid: string, profile: Partial<UserProfile>) => {
  const ref = doc(db, "users", uid);
  const cleaned = stripUndefined(profile);

  // check if doc already exists to handle createdAt correctly
  const snap = await getDoc(ref);

  const dataToSave: any = {
    ...cleaned,
    updatedAt: serverTimestamp(),
  };

  if (!snap.exists()) {
    dataToSave.createdAt = serverTimestamp();
  }

  await setDoc(ref, dataToSave, { merge: true });
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);
    return snap.exists() ? (snap.data() as UserProfile) : null;
  } catch (err) {
    console.error("Failed to fetch user profile", err);
    return null;
  }
};
