const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const sa = require('./firebase-sa.json');

initializeApp({
  credential: cert(sa)
});

const db = getFirestore();

async function checkJobs() {
  const snapshot = await db.collection('jobs').get();
  console.log(`Found ${snapshot.size} jobs in Firestore.`);
  snapshot.forEach(doc => {
    console.log(doc.id, '=>', doc.data());
  });
}

checkJobs();
