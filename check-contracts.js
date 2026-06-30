const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const sa = require('./firebase-sa.json');

initializeApp({
  credential: cert(sa)
});

const db = getFirestore();

async function checkContracts() {
  const snapshot = await db.collection('contracts').get();
  console.log(`Found ${snapshot.size} contracts in Firestore.`);
  snapshot.forEach(doc => {
    console.log(doc.id, '=>', doc.data());
  });
}

checkContracts();
