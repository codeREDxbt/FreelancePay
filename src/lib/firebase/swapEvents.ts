import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  orderBy,
} from "firebase/firestore";
import { db } from "./config";

const SWAP_EVENTS_COLLECTION = "swap_events";
const LOCAL_STORAGE_KEY = "freelancepay_mock_swap_events";

export interface SwapEvent {
  id: string;
  walletAddress: string;
  direction: "buy_usdc" | "sell_usdc";
  sourceAsset: string;
  destAsset: string;
  sourceAmount: string;
  destinationAmount: string;
  txHash?: string;
  status: "submitted" | "completed" | "failed";
  createdAt: Date;
  errorMessage?: string;
}

interface RawSwapEvent {
  id: string;
  walletAddress: string;
  direction: "buy_usdc" | "sell_usdc";
  sourceAsset: string;
  destAsset: string;
  sourceAmount: string;
  destinationAmount: string;
  txHash?: string;
  status: "submitted" | "completed" | "failed";
  createdAt: unknown;
  errorMessage?: string;
}

function getLocalEvents(): SwapEvent[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  return stored ? (JSON.parse(stored) as SwapEvent[]) : [];
}

function saveLocalEvents(events: SwapEvent[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(events));
}

function getTimestampMs(value: unknown): number {
  if (value instanceof Date) return value.getTime();
  if (typeof value === "number") return value;
  if (typeof value === "string") return new Date(value).getTime();
  if (value && typeof value === "object" && "toMillis" in value) {
    const v = value as { toMillis: () => number };
    return v.toMillis();
  }
  return 0;
}

export async function recordSwapEvent(
  data: Omit<SwapEvent, "id" | "createdAt">
): Promise<string> {
  try {
    const ref = await addDoc(collection(db, SWAP_EVENTS_COLLECTION), {
      ...data,
      createdAt: serverTimestamp(),
    });
    return ref.id;
  } catch (err) {
    console.warn("Firebase failed, recording swap locally:", err);
    const newEvent: SwapEvent = {
      ...data,
      id: "local_" + Math.random().toString(36).slice(2, 11),
      createdAt: new Date(),
    };
    const local = getLocalEvents();
    saveLocalEvents([newEvent, ...local].slice(0, 50));
    return newEvent.id;
  }
}

function normalize(raw: RawSwapEvent): SwapEvent {
  return {
    id: raw.id,
    walletAddress: raw.walletAddress,
    direction: raw.direction,
    sourceAsset: raw.sourceAsset,
    destAsset: raw.destAsset,
    sourceAmount: raw.sourceAmount,
    destinationAmount: raw.destinationAmount,
    txHash: raw.txHash,
    status: raw.status,
    createdAt: new Date(getTimestampMs(raw.createdAt)),
    errorMessage: raw.errorMessage,
  };
}

export async function getUserSwapEvents(
  walletAddress: string,
  limit = 10
): Promise<SwapEvent[]> {
  try {
    const q = query(
      collection(db, SWAP_EVENTS_COLLECTION),
      where("walletAddress", "==", walletAddress),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    const events = snap.docs.map((d) =>
      normalize({ id: d.id, ...(d.data() as Omit<RawSwapEvent, "id">) })
    );
    return events.slice(0, limit);
  } catch (err) {
    console.warn("Firebase failed, loading local swap events:", err);
    return getLocalEvents().filter(e => e.walletAddress === walletAddress).slice(0, limit);
  }
}
