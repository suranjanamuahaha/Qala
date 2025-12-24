// src/components/LoginModal.tsx
import React, { useEffect, useState } from "react";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import type { User as FirebaseUser } from "firebase/auth";
import { saveUserProfile, getUserProfile } from "../lib/firebaseHelpers";
import { useNavigate } from "react-router-dom";
import type { Role } from "../lib/types";
import { app } from "../firebase.js";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// const roleToRoute = (r: Role) =>
//   r === "artist" ? "/dashboard/artist" : r === "customer" ? "/dashboard/customer" : "/dashboard/studio";

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  // ---- ALL hooks MUST be declared BEFORE any early return ----
  const navigate = useNavigate();

  // form & UI state hooks
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [role, setRole] = useState<Role>("artist");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // google-first-time flow hooks
  const [pendingGoogleUser, setPendingGoogleUser] = useState<FirebaseUser | null>(null);
  const [showChooseRoleForGoogle, setShowChooseRoleForGoogle] = useState(false);
  const [googleChosenRole, setGoogleChosenRole] = useState<Role>("artist");

  // side-effect hook
  useEffect(() => {
    if (!isOpen) {
      // reset local ui state when modal closes
      setPendingGoogleUser(null);
      setShowChooseRoleForGoogle(false);
      setGoogleChosenRole("artist");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setRole("artist");
      setLoading(false);
    }
  }, [isOpen]);

  // now it's safe to early-return if not open
  if (!isOpen) return null;

  // helper to finish login
  const finishLogin = async (uid: string, emailArg?: string, chosenRole?: Role) => {
    const profile = await getUserProfile(uid);
    if (!profile && chosenRole) {
      await saveUserProfile(uid, { email: emailArg ?? "", role: chosenRole, displayName: undefined });
      navigate("/");
    } else if (!profile && !chosenRole) {
      await saveUserProfile(uid, { email: emailArg ?? "", role: "customer", displayName: undefined });
      navigate("/");
    }
    // } else {
    //   const userRole: Role = (profile?.role as Role) ?? "customer";
    //   navigate("/");
    // }
    onLoginSuccess();
  };

  // signup/login handlers (unchanged logic)
  const handleSignup = async () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    try {
      setLoading(true);
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      await saveUserProfile(userCred.user.uid, {
        email,
        role,
        displayName: userCred.user.displayName ?? undefined,
      });
      navigate("/");
      onLoginSuccess();
    } catch (err: any) {
      alert(err?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      setLoading(true);
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      await finishLogin(userCred.user.uid, userCred.user.email ?? undefined);
    } catch (err: any) {
      alert(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      setLoading(true);
      const res = await signInWithPopup(auth, provider);
      const firebaseUser = res.user;
      const uid = firebaseUser.uid;
      const profile = await getUserProfile(uid);
      if (!profile) {
        setPendingGoogleUser(firebaseUser);
        setShowChooseRoleForGoogle(true);
      } else {
        await finishLogin(uid, firebaseUser.email ?? undefined);
      }
    } catch (err: any) {
      alert(err?.message || "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  const completeGoogleRoleChoice = async () => {
    if (!pendingGoogleUser) return;
    try {
      setLoading(true);
      await saveUserProfile(pendingGoogleUser.uid, {
        email: pendingGoogleUser.email ?? "",
        role: googleChosenRole,
        displayName: pendingGoogleUser.displayName ?? undefined,
      });
      setShowChooseRoleForGoogle(false);
      setPendingGoogleUser(null);
      navigate("/");
      onLoginSuccess();
    } catch (err: any) {
      alert(err?.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      alert("Please enter your email address to reset password.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent. Check your inbox.");
    } catch (err: any) {
      alert(err?.message || "Failed to send reset email");
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "signup") handleSignup();
    else handleLogin();
  };

  // ---------- JSX (unchanged structure) ----------
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md relative">
        <button
          onClick={() => {
            onClose();
            // keep state reset behavior consistent
            setPendingGoogleUser(null);
            setShowChooseRoleForGoogle(false);
            setGoogleChosenRole("artist");
            setEmail("");
            setPassword("");
            setConfirmPassword("");
            setRole("artist");
          }}
          className="absolute top-3 right-4 text-gray-500 hover:text-gray-700 text-2xl"
          aria-label="close"
        >
          ×
        </button>

        <h2 className="text-2xl font-semibold mb-2 text-gray-800">
          {mode === "signup" ? "Create account" : "Welcome back"}
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          {mode === "signup" ? "Sign up as an artist, customer, or studio" : "Login to your account"}
        </p>

        {showChooseRoleForGoogle ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm">Welcome! Choose how you'd like to use Qala:</p>

            <fieldset className="flex flex-col gap-2">
              <label className="flex items-center gap-2">
                <input type="radio" className="accent-blue-600" checked={googleChosenRole === "artist"} onChange={() => setGoogleChosenRole("artist")} />
                <span>Artist — receive commission requests & sell art</span>
              </label>

              <label className="flex items-center gap-2">
                <input type="radio" className="accent-blue-600" checked={googleChosenRole === "customer"} onChange={() => setGoogleChosenRole("customer")} />
                <span>Customer — commission artists & buy art</span>
              </label>

              <label className="flex items-center gap-2">
                <input type="radio" className="accent-blue-600" checked={googleChosenRole === "studio"} onChange={() => setGoogleChosenRole("studio")} />
                <span>Studio — manage multiple artists & larger projects</span>
              </label>
            </fieldset>

            <div className="flex gap-2">
              <button type="button" onClick={completeGoogleRoleChoice} disabled={loading} className="bg-blue-600 disabled:opacity-60 text-white py-2 rounded-lg flex-1">
                {loading ? "Please wait..." : "Continue"}
              </button>
              <button type="button" onClick={() => { setShowChooseRoleForGoogle(false); setPendingGoogleUser(null); }} className="border rounded-lg px-3 py-2">Cancel</button>
            </div>

          </div>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col space-y-3">
            {mode === "signup" && (
              <fieldset className="flex items-center gap-4">
                <legend className="sr-only">Role</legend>
                <label className="flex items-center gap-2">
                  <input className="accent-blue-600" type="radio" checked={role === "artist"} onChange={() => setRole("artist")} />
                  <span className="text-sm">Artist</span>
                </label>
                <label className="flex items-center gap-2">
                  <input className="accent-blue-600" type="radio" checked={role === "customer"} onChange={() => setRole("customer")} />
                  <span className="text-sm">Customer</span>
                </label>
                <label className="flex items-center gap-2">
                  <input className="accent-blue-600" type="radio" checked={role === "studio"} onChange={() => setRole("studio")} />
                  <span className="text-sm">Studio</span>
                </label>
              </fieldset>
            )}

            <input onChange={(e) => setEmail(e.target.value)} value={email} type="email" required placeholder="Email" className="border rounded-lg px-3 py-2" autoComplete="email" />

            <input onChange={(e) => setPassword(e.target.value)} value={password} type="password" required placeholder="Password" className="border rounded-lg px-3 py-2" autoComplete={mode === "signup" ? "new-password" : "current-password"} />

            {mode === "signup" && <input onChange={(e) => setConfirmPassword(e.target.value)} value={confirmPassword} type="password" required placeholder="Confirm password" className="border rounded-lg px-3 py-2" autoComplete="new-password" />}

            {mode === "login" && (
              <div className="flex items-center justify-between text-sm">
                <button type="button" onClick={handleResetPassword} className="text-blue-600 hover:underline">Forgot password?</button>
                <span className="text-gray-500">or</span>
                <button type="button" onClick={handleGoogle} className="text-gray-700 hover:underline">Sign in with Google</button>
              </div>
            )}

            <button type="submit" disabled={loading} className="bg-blue-600 disabled:opacity-60 text-white py-2 rounded-lg mt-2">
              {loading ? "Please wait..." : mode === "signup" ? "Create account" : "Login"}
            </button>

            {mode === "signup" && (
              <button type="button" onClick={handleGoogle} className="border rounded-lg px-3 py-2 flex items-center justify-center gap-3">
                {/* google svg */}
                Continue with Google
              </button>
            )}

            <div className="text-center text-sm text-gray-600 pt-2">
              {mode === "signup" ? (
                <>
                  Already a member?{" "}
                  <button className="text-blue-600 hover:underline" type="button" onClick={() => { setMode("login"); }}>
                    Login!
                  </button>
                </>
              ) : (
                <>
                  New here?{" "}
                  <button className="text-blue-600 hover:underline" type="button" onClick={() => { setMode("signup"); }}>
                    Create account
                  </button>
                </>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginModal;
