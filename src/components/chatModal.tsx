// src/components/ChatModal.tsx
import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { app } from "../firebase";
import { getOrCreateChat, addChatMessage } from "../lib/chatHelpers";

const db = getFirestore(app);

type ChatModalProps =
  | {
      isOpen: boolean;
      onClose: () => void;
      artistId: string;   // used when starting chat from public profile
      chatId?: undefined;
    }
  | {
      isOpen: boolean;
      onClose: () => void;
      chatId: string;     // used when opening existing chat from dashboard
      artistId?: undefined;
    };

const ChatModal: React.FC<ChatModalProps> = (props) => {
  const { isOpen, onClose } = props;
  const [resolvedChatId, setResolvedChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");

  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    if (!isOpen) return;

    let unsub: (() => void) | undefined;

    const setup = async () => {
      if (!user) return;

      let chatId: string;

      // Case 1: existing chat (artist dashboard)
      if ("chatId" in props && props.chatId) {
        chatId = props.chatId;
      }
      // Case 2: starting / re-opening chat from public profile
      else if ("artistId" in props && props.artistId) {
        chatId = await getOrCreateChat(props.artistId, user.uid);
      } else {
        return;
      }

      setResolvedChatId(chatId);

      const msgsRef = collection(db, `chats/${chatId}/messages`);
      const q = query(msgsRef, orderBy("createdAt"));
      unsub = onSnapshot(q, (snap) => {
        setMessages(snap.docs.map((d) => d.data()));
      });
    };

    setup();

    return () => {
      if (unsub) unsub();
    };
  }, [isOpen, user, props]);

  const sendMessage = async () => {
    if (!resolvedChatId || !user || !input.trim()) return;

    await addChatMessage(resolvedChatId, user.uid, input.trim());
    setInput("");
  };

  if (!isOpen) return null;

  if (!user) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
        <div className="bg-white w-full max-w-sm rounded-xl shadow-lg p-6 text-center">
          <p className="mb-4">Please log in to chat with this artist.</p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-lg flex flex-col">
        <div className="p-3 border-b flex justify-between items-center">
          <h2 className="font-semibold text-sm">Chat</h2>
          <button onClick={onClose} className="text-gray-500">
            ✖
          </button>
        </div>

        <div className="p-4 max-h-96 overflow-y-auto flex flex-col gap-2 text-sm">
          {messages.length === 0 && (
            <p className="text-gray-400 text-center text-xs">
              Say hi to start the conversation ✨
            </p>
          )}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`px-3 py-2 rounded-lg max-w-[80%] ${
                msg.senderId === user.uid
                  ? "bg-blue-200 self-end ml-auto"
                  : "bg-gray-200 self-start mr-auto"
              }`}
            >
              {msg.text}
            </div>
          ))}
        </div>

        <div className="p-3 border-t flex gap-2">
          <input
            className="flex-1 border px-3 py-2 rounded-lg text-sm"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
          />
          <button
            onClick={sendMessage}
            className="px-4 bg-blue-600 text-white rounded-lg text-sm"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;
