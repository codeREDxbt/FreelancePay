const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const sa = require('./firebase-sa.json');

initializeApp({
  credential: cert(sa)
});

const db = getFirestore();

async function seedJobs() {
  const jobsRef = db.collection('jobs');
  
  await jobsRef.add({
    title: "Need a Web3 Frontend Developer",
    description: "Looking for an experienced React developer to build a frontend for our new DeFi protocol. Must have experience with ethers.js and responsive design.",
    budget: "5000",
    clientId: "GA7QYV2XN723XF7ZYF36F6F6J6Q5V3V6Q3V3X2W",
    status: "open",
    createdAt: new Date(),
    updatedAt: new Date()
  });

  await jobsRef.add({
    title: "Smart Contract Auditor for Escrow",
    description: "We have written a Soroban smart contract for escrow. We need an auditor to review the code and provide a report on potential vulnerabilities.",
    budget: "1000",
    clientId: "GA7QYV2XN723XF7ZYF36F6F6J6Q5V3V6Q3V3X2W",
    status: "open",
    createdAt: new Date(),
    updatedAt: new Date()
  });

  console.log("Jobs seeded!");
}

seedJobs();
