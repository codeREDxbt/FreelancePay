import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';
let hasValidCredentials = false;

if (!getApps().length && !isBuildPhase) {
  const projectId =
    process.env.FIREBASE_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    console.warn(
      '⚠️ Firebase Admin: missing credentials — using mocked services for local testing.'
    );
  } else {
    try {
      initializeApp({
        credential: cert({ projectId, clientEmail, privateKey }),
      });
      hasValidCredentials = true;
    } catch (e) {
      console.error('Failed to initialize Firebase Admin', e);
    }
  }
} else if (getApps().length) {
  hasValidCredentials = true;
}

function getAdminAuth() {
  if (isBuildPhase || !hasValidCredentials) {
    return {
      createCustomToken: async () => 'mock-token-' + Date.now(),
    } as unknown as ReturnType<typeof getAuth>;
  }
  return getAuth();
}

function getAdminDb() {
  if (isBuildPhase || !hasValidCredentials) {
    return {
      collection: () => ({
        doc: () => ({
          get: async () => ({ exists: true, data: () => ({ consumed: false, expiresAt: Date.now() + 600000 }) }),
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