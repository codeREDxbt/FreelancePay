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
  deleteDoc,
} from "firebase/firestore";
import { db } from "./config";
import type { Job, JobApplication } from "@/types";

function withTimeout<T>(promise: Promise<T>, ms = 8000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms))
  ]);
}

const JOBS_COLLECTION = "jobs";
const APPLICATIONS_COLLECTION = "applications";
const LOCAL_STORAGE_JOBS_KEY = "freelancepay_mock_jobs";
const LOCAL_STORAGE_APPS_KEY = "freelancepay_mock_apps";

function getLocalJobs(): Job[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(LOCAL_STORAGE_JOBS_KEY);
  return stored ? JSON.parse(stored) : [];
}

function saveLocalJobs(jobs: Job[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_STORAGE_JOBS_KEY, JSON.stringify(jobs));
}

function getLocalApps(): JobApplication[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(LOCAL_STORAGE_APPS_KEY);
  return stored ? JSON.parse(stored) : [];
}

function saveLocalApps(apps: JobApplication[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_STORAGE_APPS_KEY, JSON.stringify(apps));
}

export async function createJob(
  data: Omit<Job, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  try {
    const ref = await addDoc(collection(db, JOBS_COLLECTION), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return ref.id;
  } catch (err) {
    console.warn("Firebase failed, falling back to LocalStorage:", err);
    const mockId = "job_" + Math.random().toString(36).substr(2, 9);
    const newJob: Job = {
      ...data,
      id: mockId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const local = getLocalJobs();
    saveLocalJobs([...local, newJob]);
    return mockId;
  }
}

export async function getJobs(): Promise<Job[]> {
  try {
    const q = query(
      collection(db, JOBS_COLLECTION),
      where("status", "==", "open"),
      orderBy("createdAt", "desc")
    );
    const snap = await withTimeout(getDocs(q));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Job));
  } catch (err) {
    console.warn("Firebase failed, falling back to LocalStorage:", err);
    return getLocalJobs().filter(j => j.status === "open").sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return timeB - timeA;
    });
  }
}

export async function getMyJobs(clientId: string): Promise<Job[]> {
  try {
    const q = query(
      collection(db, JOBS_COLLECTION),
      where("clientId", "==", clientId)
    );
    const snap = await withTimeout(getDocs(q));
    const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Job));
    return docs.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return timeB - timeA;
    });
  } catch (err) {
    console.warn("Firebase failed, falling back to LocalStorage:", err);
    return getLocalJobs().filter(j => j.clientId === clientId).sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return timeB - timeA;
    });
  }
}

export async function getJob(id: string): Promise<Job | null> {
  try {
    const snap = await getDoc(doc(db, JOBS_COLLECTION, id));
    if (!snap.exists()) throw new Error("Not found in Firebase");
    return { id: snap.id, ...snap.data() } as Job;
  } catch (err) {
    console.warn("Firebase failed, checking LocalStorage:", err);
    return getLocalJobs().find(j => j.id === id) || null;
  }
}

export async function updateJobStatus(id: string, status: "open" | "closed") {
  try {
    await updateDoc(doc(db, JOBS_COLLECTION, id), {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn("Firebase failed, checking LocalStorage:", err);
    const local = getLocalJobs();
    saveLocalJobs(local.map(j => j.id === id ? { ...j, status, updatedAt: new Date() } : j));
  }
}

export async function deleteJob(id: string) {
  try {
    await deleteDoc(doc(db, JOBS_COLLECTION, id));
  } catch (err) {
    console.warn("Firebase failed, checking LocalStorage:", err);
    const local = getLocalJobs();
    saveLocalJobs(local.filter(j => j.id !== id));
  }
}

export async function applyToJob(
  data: Omit<JobApplication, "id" | "status" | "createdAt" | "updatedAt">
): Promise<string> {
  try {
    const ref = await addDoc(collection(db, APPLICATIONS_COLLECTION), {
      ...data,
      status: "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return ref.id;
  } catch (err) {
    console.warn("Firebase failed, falling back to LocalStorage:", err);
    const mockId = "app_" + Math.random().toString(36).substr(2, 9);
    const newApp: JobApplication = {
      ...data,
      id: mockId,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const local = getLocalApps();
    saveLocalApps([...local, newApp]);
    return mockId;
  }
}

export async function getJobApplications(jobId: string): Promise<JobApplication[]> {
  try {
    const q = query(
      collection(db, APPLICATIONS_COLLECTION),
      where("jobId", "==", jobId),
      orderBy("createdAt", "desc")
    );
    const snap = await withTimeout(getDocs(q));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as JobApplication));
  } catch (err) {
    console.warn("Firebase failed, falling back to LocalStorage:", err);
    return getLocalApps().filter(a => a.jobId === jobId).sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return timeB - timeA;
    });
  }
}

export async function updateApplicationStatus(id: string, status: "pending" | "accepted" | "rejected") {
  try {
    await updateDoc(doc(db, APPLICATIONS_COLLECTION, id), {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn("Firebase failed, checking LocalStorage:", err);
    const local = getLocalApps();
    saveLocalApps(local.map(a => a.id === id ? { ...a, status, updatedAt: new Date() } : a));
  }
}
