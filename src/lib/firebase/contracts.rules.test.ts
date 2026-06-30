import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  afterEach,
} from "vitest";
import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { readFileSync } from "fs";
import { resolve } from "path";

let testEnv: RulesTestEnvironment;

const WALLET_A = "GCLIENT_WALLET_A";
const WALLET_B = "GCLIENT_WALLET_B";
const WALLET_C = "GFREELANCER_WALLET_C";

const sampleContract = () => ({
  contractAddress: "CAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
  clientWallet: WALLET_A,
  freelancerWallet: WALLET_C,
  title: "Test Contract",
  description: "A test contract",
  totalAmount: 100,
  milestones: [
    {
      id: 0,
      description: "First milestone",
      amount: 50,
      status: "pending",
    },
  ],
  isDisputed: false,
  isClosed: false,
});

const sampleFeedback = (wallet: string) => ({
  contractId: "contract1",
  rating: 5,
  comment: "Great work",
  walletAddress: wallet,
});

beforeAll(async () => {
  const rulesPath = resolve(process.cwd(), "firestore.rules");
  testEnv = await initializeTestEnvironment({
    projectId: "freelancepay-rules-test",
    firestore: { 
      rules: readFileSync(rulesPath, "utf8"),
    },
  });
});

afterEach(async () => {
  await testEnv.clearFirestore();
});

afterAll(async () => {
  await testEnv.cleanup();
});

describe("contracts collection rules", () => {
  it("allows authenticated clientWallet to create a contract", async () => {
    const db = testEnv.authenticatedContext(WALLET_A).firestore();
    const ref = db.collection("contracts").doc("c1");
    await assertSucceeds(
      ref.set({
        ...sampleContract(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
    );
  });

  it("denies unauthenticated create", async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    const ref = db.collection("contracts").doc("c2");
    await assertFails(
      ref.set({
        ...sampleContract(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
    );
  });

  it("denies create when clientWallet != auth.uid", async () => {
    const db = testEnv.authenticatedContext(WALLET_B).firestore();
    const ref = db.collection("contracts").doc("c3");
    await assertFails(
      ref.set({
        ...sampleContract(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
    );
  });

  it("allows clientWallet to read their own contract", async () => {
    const adminDb = testEnv.authenticatedContext(WALLET_A).firestore();
    await adminDb.collection("contracts").doc("c4").set({
      ...sampleContract(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    const readerDb = testEnv.authenticatedContext(WALLET_A).firestore();
    const snap = await readerDb.collection("contracts").doc("c4").get();
    expect(snap.exists).toBe(true);
  });

  it("allows freelancerWallet to read a contract", async () => {
    const adminDb = testEnv.authenticatedContext(WALLET_A).firestore();
    await adminDb.collection("contracts").doc("c5").set({
      ...sampleContract(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    const readerDb = testEnv.authenticatedContext(WALLET_C).firestore();
    const snap = await readerDb.collection("contracts").doc("c5").get();
    expect(snap.exists).toBe(true);
  });

  it("denies read by unrelated wallet", async () => {
    const adminDb = testEnv.authenticatedContext(WALLET_A).firestore();
    await adminDb.collection("contracts").doc("c6").set({
      ...sampleContract(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    const readerDb = testEnv.authenticatedContext(WALLET_B).firestore();
    await assertFails(readerDb.collection("contracts").doc("c6").get());
  });

  it("allows clientWallet to update a contract", async () => {
    const adminDb = testEnv.authenticatedContext(WALLET_A).firestore();
    await adminDb.collection("contracts").doc("c7").set({
      ...sampleContract(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    const updaterDb = testEnv.authenticatedContext(WALLET_A).firestore();
    await assertSucceeds(
      updaterDb.collection("contracts").doc("c7").update({
        title: "Updated title",
        updatedAt: Date.now(),
      })
    );
  });

  it("denies delete on contracts", async () => {
    const adminDb = testEnv.authenticatedContext(WALLET_A).firestore();
    await adminDb.collection("contracts").doc("c8").set({
      ...sampleContract(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    const deleterDb = testEnv.authenticatedContext(WALLET_A).firestore();
    await assertFails(
      deleterDb.collection("contracts").doc("c8").delete()
    );
  });
});

describe("feedback collection rules", () => {
  it("allows authenticated wallet to create feedback when walletAddress matches uid", async () => {
    const db = testEnv.authenticatedContext(WALLET_A).firestore();
    const ref = db.collection("feedback").doc("f1");
    await assertSucceeds(
      ref.set({
        ...sampleFeedback(WALLET_A),
        createdAt: Date.now(),
      })
    );
  });

  it("denies create when walletAddress != auth.uid", async () => {
    const db = testEnv.authenticatedContext(WALLET_A).firestore();
    const ref = db.collection("feedback").doc("f2");
    await assertFails(
      ref.set({
        ...sampleFeedback(WALLET_B),
        createdAt: Date.now(),
      })
    );
  });

  it("allows authenticated read of feedback", async () => {
    const adminDb = testEnv.authenticatedContext(WALLET_A).firestore();
    await adminDb.collection("feedback").doc("f3").set({
      ...sampleFeedback(WALLET_A),
      createdAt: Date.now(),
    });

    const readerDb = testEnv.authenticatedContext(WALLET_B).firestore();
    await assertSucceeds(readerDb.collection("feedback").doc("f3").get());
  });

  it("denies update and delete on feedback", async () => {
    const adminDb = testEnv.authenticatedContext(WALLET_A).firestore();
    await adminDb.collection("feedback").doc("f4").set({
      ...sampleFeedback(WALLET_A),
      createdAt: Date.now(),
    });

    const updaterDb = testEnv.authenticatedContext(WALLET_A).firestore();
    await assertFails(
      updaterDb.collection("feedback").doc("f4").update({ rating: 1 })
    );

    await assertFails(
      updaterDb.collection("feedback").doc("f4").delete()
    );
  });
});

describe("auth_nonces collection rules", () => {
  it("denies all reads and writes to auth_nonces", async () => {
    const db = testEnv.authenticatedContext(WALLET_A).firestore();
    const ref = db.collection("auth_nonces").doc("n1");
    await assertFails(ref.set({ nonce: "abc" }));
    await assertFails(ref.get());
  });
});

describe("default deny rule", () => {
  it("denies reads on unknown collections", async () => {
    const db = testEnv.authenticatedContext(WALLET_A).firestore();
    await assertFails(db.collection("unknown_col").doc("x").get());
  });
});
