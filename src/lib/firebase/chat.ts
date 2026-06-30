import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";

export interface ChatMessage {
  id: string;
  senderWallet: string;
  text: string;
  createdAt: number;
}

export async function sendMessage(contractId: string, senderWallet: string, text: string) {
  if (!text.trim()) return;
  
  const messagesRef = collection(db, "contracts", contractId, "messages");
  await addDoc(messagesRef, {
    senderWallet,
    text: text.trim(),
    createdAt: serverTimestamp(),
  });
}

export function subscribeToMessages(contractId: string, callback: (messages: ChatMessage[]) => void) {
  try {
    const messagesRef = collection(db, "contracts", contractId, "messages");
    const q = query(messagesRef, orderBy("createdAt", "asc"));
    
    return onSnapshot(q, (snapshot) => {
      const messages: ChatMessage[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        messages.push({
          id: doc.id,
          senderWallet: data.senderWallet,
          text: data.text,
          createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : Date.now(),
        });
      });
      callback(messages);
    }, (err) => {
      console.warn("Failed to subscribe to Firebase messages:", err);
      // Fallback
      pollLocalChat(contractId, callback);
    });
  } catch (err) {
    console.warn("Firebase config missing or failed for chat", err);
    return pollLocalChat(contractId, callback);
  }
}

// Fallback for missing/broken Firebase config
function pollLocalChat(contractId: string, callback: (messages: ChatMessage[]) => void) {
  const key = `freelancepay_mock_chat_${contractId}`;
  
  const readAndCallback = () => {
    const stored = localStorage.getItem(key);
    if (stored) {
      callback(JSON.parse(stored));
    } else {
      callback([]);
    }
  };
  
  readAndCallback();
  const interval = setInterval(readAndCallback, 2000);
  
  return () => clearInterval(interval);
}
