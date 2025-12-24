import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { getAuth } from "firebase/auth";
import { getUserProfile } from "../lib/firebaseHelpers";

const auth = getAuth();

export default function RequireRole({
  children,
  allowed,
}: {
  children: React.ReactNode;
  allowed: ("artist" | "customer" | "studio")[];
}) {
  const [user, loading] = useAuthState(auth);
  const [profile, setProfile] = React.useState<any>(null);

  React.useEffect(() => {
    if (user) getUserProfile(user.uid).then(setProfile);
  }, [user]);

  if (loading || (user && !profile)) return <div>Loading...</div>;
  if (!user) return <Navigate to="/" replace />;

  if (!allowed.includes(profile.role)) return <Navigate to="/not-authorized" replace />;

  return <>{children}</>;
}
