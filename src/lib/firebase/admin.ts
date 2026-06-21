import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';
const isDev = process.env.NODE_ENV === 'development';

if (!getApps().length && !isBuildPhase) {
  const projectId =
    process.env.FIREBASE_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    if (isDev || isBuildPhase) {
      console.warn(
        'Firebase Admin: missing credentials — calling Auth/Firestore will throw at runtime.'
      );
    } else {
      throw new Error(
        'FATAL: Firebase Admin credentials are required in production. ' +
          'Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY.'
      );
    }
  }

  if (projectId && clientEmail && privateKey) {
    initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
  } else if (projectId) {
    initializeApp({ projectId });
  }
}

function getAdminAuth() {
  if (isBuildPhase) {
    return {
      createCustomToken: async () => {
        throw new Error('Firebase Admin unavailable during build');
      },
    } as unknown as ReturnType<typeof getAuth>;
  }
  return getAuth();
}

function getAdminDb() {
  if (isBuildPhase) {
    return {
      collection: () => ({
        doc: () => ({
          get: async () => ({ exists: false }),
          set: async () => undefined,
          update: async () => undefined,
        }),
        add: async () => ({ id: 'build-stub' }),
      }),
    } as unknown as ReturnType<typeof getFirestore>;
  }
  return getFirestore();
}

export const adminAuth = getAdminAuth();
export const adminDb = getAdminDb();