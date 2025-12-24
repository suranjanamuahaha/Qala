import { app } from "../firebase";
import { getFirestore, collection, addDoc, serverTimestamp, query, where, getDocs, doc, setDoc } from "firebase/firestore";

const db = getFirestore(app);

// Creates or returns an existing chat between customer & artist
export const getOrCreateChat = async (artistId: string, customerId: string) => {
  const chatsRef = collection(db, "chats");

  // Check if chat already exists
  const q = query(chatsRef,
    where("artistId", "==", artistId),
    where("customerId", "==", customerId)
  );

  const existing = await getDocs(q);

  if (!existing.empty) {
    return existing.docs[0].id;
  }

  // Create new chat document
  const chatDoc = await addDoc(chatsRef, {
    artistId,
    customerId,
    lastMessage: "",
    updatedAt: serverTimestamp(),
  });

  return chatDoc.id;
};

export const addChatMessage = async (chatId: string, senderId: string, text: string) => {
  const messagesRef = collection(db, `chats/${chatId}/messages`);

  await addDoc(messagesRef, {
    senderId,
    text,
    createdAt: serverTimestamp(),
  });

  // update chat summary
  const chatRef = doc(db, "chats", chatId);
  await setDoc(chatRef, {
    lastMessage: text,
    updatedAt: serverTimestamp()
  }, { merge: true });
};
