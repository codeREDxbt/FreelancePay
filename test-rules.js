const { initializeApp: initAdmin, cert } = require('firebase-admin/app');
const { getAuth: getAdminAuth } = require('firebase-admin/auth');
const sa = require('./firebase-sa.json');

const adminApp = initAdmin({ credential: cert(sa) });
const adminAuth = getAdminAuth(adminApp);

const { initializeApp: initClient } = require('firebase/app');
const { getAuth: getClientAuth, signInWithCustomToken } = require('firebase/auth');
const { getFirestore, collection, addDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const clientApp = initClient(firebaseConfig);
const clientAuth = getClientAuth(clientApp);
const clientDb = getFirestore(clientApp);

async function testFirebaseWrite() {
  const testUid = "GCTestWalletAddress1234567890";
  const customToken = await adminAuth.createCustomToken(testUid);
  
  await signInWithCustomToken(clientAuth, customToken);
  console.log("Signed in with client SDK, UID:", clientAuth.currentUser.uid);
  
  try {
    const docRef = await addDoc(collection(clientDb, 'contracts'), {
      clientWallet: testUid,
      freelancerWallet: "GCFreelancer123",
      title: "Test Contract",
      description: "Testing write access",
      totalAmount: 100,
      contractAddress: "txhash123",
      isDisputed: false,
      isClosed: false,
      jobId: "123",
      applicationId: "456",
      milestones: []
    });
    console.log("Successfully wrote contract:", docRef.id);
  } catch (error) {
    console.error("Failed to write contract:", error.message);
  }
}

testFirebaseWrite().catch(console.error).then(() => process.exit(0));
