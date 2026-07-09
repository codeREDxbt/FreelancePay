import { collection, addDoc, serverTimestamp, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from './config';
import { FeedbackEntry, Invite, TransactionEvent, OnboardingEvent } from '@/types/growth';

export const submitFeedback = async (feedback: Omit<FeedbackEntry, 'id' | 'createdAt'>) => {
  const feedbackRef = collection(db, 'feedback');
  const docRef = await addDoc(feedbackRef, {
    ...feedback,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const createInvite = async (invite: Omit<Invite, 'id' | 'createdAt'>) => {
  const invitesRef = collection(db, 'invites');
  const docRef = await addDoc(invitesRef, {
    ...invite,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const logTransactionEvent = async (event: Omit<TransactionEvent, 'id' | 'timestamp'>) => {
  const eventsRef = collection(db, 'transaction_events');
  const docRef = await addDoc(eventsRef, {
    ...event,
    timestamp: serverTimestamp(),
  });
  return docRef.id;
};

export const logOnboardingEvent = async (event: Omit<OnboardingEvent, 'id' | 'timestamp'>) => {
  const eventsRef = collection(db, 'onboarding_events');
  const docRef = await addDoc(eventsRef, {
    ...event,
    timestamp: serverTimestamp(),
  });
  return docRef.id;
};

export const getTransactionEvents = async (contractId: string) => {
  const eventsRef = collection(db, 'transaction_events');
  const q = query(eventsRef, where('contractId', '==', contractId), orderBy('timestamp', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as TransactionEvent[];
};
