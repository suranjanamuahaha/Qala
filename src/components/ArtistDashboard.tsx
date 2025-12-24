// src/components/ArtistDashboard.tsx
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { app } from "../firebase";
import { getUserProfile } from "../lib/firebaseHelpers";
import type { UserProfile } from "../lib/firebaseHelpers";
import ChatModal from "./chatModal";

const db = getFirestore(app);

type ChatSummary = {
  id: string;
  artistId: string;
  customerId: string;
  lastMessage?: string;
  updatedAt?: any;
};

const ArtistDashboard = () => {
  const auth = getAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [artistId, setArtistId] = useState<string | null>(null);
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [customerNames, setCustomerNames] = useState<Record<string, string>>({});
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Load artist profile and track logged-in artistId
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setProfile(null);
        setArtistId(null);
        setLoading(false);
        setChats([]);
        return;
      }

      setArtistId(user.uid);
      const p = await getUserProfile(user.uid);
      setProfile(p);
      setLoading(false);
    });

    return () => unsub();
  }, [auth]);

  // Subscribe to chat requests for this artist
  useEffect(() => {
    if (!artistId) {
      setChats([]);
      return;
    }

    const q = query(
      collection(db, "chats"),
      where("artistId", "==", artistId)
    );

    const unsub = onSnapshot(q, (snap) => {
      const list: ChatSummary[] = snap.docs.map((doc) => {
        const data = doc.data() as any;
        return {
          id: doc.id,
          artistId: data.artistId,
          customerId: data.customerId,
          lastMessage: data.lastMessage,
          updatedAt: data.updatedAt,
        };
      });
      setChats(list);
    });

    return () => unsub();
  }, [artistId]);

  // Load customer names for chats
  useEffect(() => {
    const loadNames = async () => {
      const ids = Array.from(new Set(chats.map((c) => c.customerId))).filter(
        (id) => !customerNames[id]
      );
      if (ids.length === 0) return;

      const updates: Record<string, string> = {};
      await Promise.all(
        ids.map(async (id) => {
          const p = await getUserProfile(id);
          if (p) {
            updates[id] = p.displayName || p.email || id;
          } else {
            updates[id] = id;
          }
        })
      );

      setCustomerNames((prev) => ({ ...prev, ...updates }));
    };

    if (chats.length > 0) {
      loadNames();
    }
  }, [chats, customerNames]);

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-xl">
        Loading artist dashboard...
      </div>
    );
  }

  const handleOpenChat = (chatId: string) => {
    setSelectedChatId(chatId);
    setIsChatOpen(true);
  };

  return (
    <>
      <div className="min-h-screen flex bg-gray-50">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-lg p-6 hidden md:block">
          <h2 className="text-xl font-semibold mb-6">Artist Panel</h2>
          <ul className="space-y-4">
            <li className="cursor-pointer hover:text-blue-600">New Orders</li>
            <li className="cursor-pointer hover:text-blue-600">Chat Requests</li>
            <li className="cursor-pointer hover:text-blue-600">
              Active Commissions
            </li>
            <li className="cursor-pointer hover:text-blue-600">
              Manage Portfolio
            </li>
            <li className="cursor-pointer hover:text-blue-600">Settings</li>
          </ul>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <h1 className="text-3xl font-bold">
            Welcome {profile?.displayName || "Artist"} 🎨
          </h1>

          <p className="text-gray-600 mt-2">
            Manage your commissions, respond to customer messages, and showcase
            your art.
          </p>

          {/* New Orders */}
          <section className="mt-8 bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-4">New Orders</h2>
            <p className="text-gray-500">
              You haven&apos;t received any new orders yet.
            </p>
          </section>

          {/* Chat Requests */}
          <section className="mt-8 bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-4">Chat Requests</h2>

            {chats.length === 0 ? (
              <p className="text-gray-500">
                Chat requests from customers will appear here.
              </p>
            ) : (
              <ul className="space-y-3">
                {chats.map((chat) => (
                  <li
                    key={chat.id}
                    className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer shadow-sm"
                    onClick={() => handleOpenChat(chat.id)}
                  >
                    <p className="font-semibold text-sm">
                      Customer:{" "}
                      <span className="font-medium">
                        {customerNames[chat.customerId] || chat.customerId}
                      </span>
                    </p>
                    {chat.lastMessage && (
                      <p className="text-xs text-gray-600 mt-1 truncate">
                        Last message: {chat.lastMessage}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Active Commissions */}
          <section className="mt-8 bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-4">Active Commissions</h2>
            <p className="text-gray-500">
              Track the progress of your ongoing commissions here.
            </p>
          </section>

          {/* Portfolio / Quick Actions */}
          <section className="mt-8 bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-4">Portfolio & Profile</h2>
            <p className="text-gray-500">
              Quickly jump to your artist profile to update your bio, socials,
              and artworks.
            </p>
          </section>
        </main>
      </div>

      {/* Chat modal to reply to a selected customer */}
      {selectedChatId && (
        <ChatModal
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          chatId={selectedChatId}
        />
      )}
    </>
  );
};

export default ArtistDashboard;
