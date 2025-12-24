// src/components/CustomerDashboard.tsx
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getUserProfile } from "../lib/firebaseHelpers";
import type { UserProfile } from "../lib/firebaseHelpers";

const CustomerDashboard = () => {
  const auth = getAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const p = await getUserProfile(user.uid);
      setProfile(p);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-xl">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg p-6 hidden md:block">
        <h2 className="text-xl font-semibold mb-6">Customer Panel</h2>
        <ul className="space-y-4">
          <li className="cursor-pointer hover:text-blue-600">My Orders</li>
          <li className="cursor-pointer hover:text-blue-600">Browse Artists</li>
          <li className="cursor-pointer hover:text-blue-600">Messages</li>
          <li className="cursor-pointer hover:text-blue-600">AI Inspo Chatbot</li>
          <li className="cursor-pointer hover:text-blue-600">Settings</li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <h1 className="text-3xl font-bold">
          Welcome {profile?.displayName || "Customer"} 👋
        </h1>

        <p className="text-gray-600 mt-2">
          Find artists, chat with them, place commissions, and brainstorm ideas.
        </p>

        {/* Example sections */}
        <section className="mt-8 bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">Your Recent Orders</h2>
          <p className="text-gray-500">No orders yet.</p>
        </section>

        <section className="mt-8 bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">Recommended Artists</h2>
          <p className="text-gray-500">Artist recommendations will appear here.</p>
        </section>

        <section className="mt-8 bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">Start a Chat with AI</h2>
          <p className="text-gray-500">
            The Qala AI assistant will help you brainstorm artwork ideas.
          </p>
        </section>
      </main>
    </div>
  );
};

export default CustomerDashboard;
