import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  orderBy,
} from "firebase/firestore";
import { db } from "./config";
import type { Contract, MilestoneStatus } from "@/types";

const CONTRACTS_COLLECTION = "contracts";
const LOCAL_STORAGE_KEY = "freelancepay_mock_contracts";

// Helper to get local mock data
function getLocalContracts(): Contract[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

// Helper to save local mock data
function saveLocalContracts(contracts: Contract[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(contracts));
}

export async function createContract(
  data: Omit<Contract, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  try {
    const ref = await addDoc(collection(db, CONTRACTS_COLLECTION), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return ref.id;
  } catch (err) {
    console.warn("Firebase failed, falling back to LocalStorage:", err);
    const mockId = "local_" + Math.random().toString(36).substr(2, 9);
    const newContract: Contract = {
      ...data,
      id: mockId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const local = getLocalContracts();
    saveLocalContracts([...local, newContract]);
    return mockId;
  }
}

export async function getContract(id: string): Promise<Contract | null> {
  try {
    const snap = await getDoc(doc(db, CONTRACTS_COLLECTION, id));
    if (!snap.exists()) throw new Error("Not found in Firebase");
    return { id: snap.id, ...snap.data() } as Contract;
  } catch (err) {
    console.warn("Firebase failed, checking LocalStorage:", err);
    const local = getLocalContracts();
    return local.find(c => c.id === id) || null;
  }
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

export async function getUserContracts(
  walletAddress: string
): Promise<Contract[]> {
  try {
    const q = query(
      collection(db, CONTRACTS_COLLECTION),
      where("clientWallet", "==", walletAddress),
      orderBy("createdAt", "desc")
    );
    const freelancerQ = query(
      collection(db, CONTRACTS_COLLECTION),
      where("freelancerWallet", "==", walletAddress),
      orderBy("createdAt", "desc")
    );

    const [clientSnap, freelancerSnap] = await Promise.all([
      getDocs(q),
      getDocs(freelancerQ),
    ]);

    const all = [
      ...clientSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Contract)),
      ...freelancerSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Contract)),
    ];

    // Deduplicate in case client and freelancer are the same
    const unique = Array.from(new Map(all.map(item => [item.id, item])).values());

    return unique.sort((a, b) => {
      const timeA = getTimestampMs(a.createdAt);
      const timeB = getTimestampMs(b.createdAt);
      return timeB - timeA;
    });
  } catch (err) {
    console.warn("Firebase failed, falling back to LocalStorage:", err);
    const local = getLocalContracts();
    return local.filter(c => c.clientWallet === walletAddress || c.freelancerWallet === walletAddress).sort((a, b) => {
      return getTimestampMs(b.createdAt) - getTimestampMs(a.createdAt);
    });
  }
}

export async function updateMilestoneStatus(
  contractId: string,
  milestoneId: number,
  status: MilestoneStatus,
  deliverableUrl?: string
) {
  try {
    const contractRef = doc(db, CONTRACTS_COLLECTION, contractId);
    const snap = await getDoc(contractRef);
    if (!snap.exists()) throw new Error("Not found");

    const data = snap.data() as Contract;
    const milestones = [...data.milestones];
    milestones[milestoneId] = {
      ...milestones[milestoneId],
      status,
      ...(deliverableUrl ? { deliverableUrl } : {})
    };

    const isClosed = milestones.every(m => m.status === "approved" || m.status === "released");

    await updateDoc(contractRef, {
      milestones,
      ...(isClosed ? { isClosed: true } : {}),
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn("Firebase failed, updating LocalStorage:", err);
    let local = getLocalContracts();
    local = local.map(c => {
      if (c.id === contractId) {
        const updatedMilestones = [...c.milestones];
        updatedMilestones[milestoneId] = {
          ...updatedMilestones[milestoneId],
          status,
          ...(deliverableUrl ? { deliverableUrl } : {})
        };
        const isClosed = updatedMilestones.every(m => m.status === "approved" || m.status === "released");
        return { 
          ...c, 
          milestones: updatedMilestones, 
          ...(isClosed ? { isClosed: true } : {}),
          updatedAt: new Date() 
        };
      }
      return c;
    });
    saveLocalContracts(local);
  }
}

export async function saveFeedback(contractId: string, feedback: {
  rating: number;
  comment: string;
  walletAddress: string;
}) {
  try {
    await addDoc(collection(db, "feedback"), {
      contractId,
      ...feedback,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn("Firebase failed, ignoring feedback save:", err);
  }
}

export async function flagDispute(contractId: string) {
  try {
    const contractRef = doc(db, CONTRACTS_COLLECTION, contractId);
    await updateDoc(contractRef, {
      isDisputed: true,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn("Firebase failed, updating LocalStorage:", err);
    const local = getLocalContracts();
    const updated = local.map(c =>
      c.id === contractId
        ? { ...c, isDisputed: true, updatedAt: new Date() }
        : c
    );
    saveLocalContracts(updated);
  }
}
