import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = getFirestore();

export const createContract = functions.https.onCall(
  async (data: any, context: any) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Must be signed in"
      );
    }

    const {
      contractAddress,
      freelancerWallet,
      title,
      description,
      totalAmount,
      milestones,
    } = data;

    if (
      !contractAddress ||
      !freelancerWallet ||
      !title ||
      !description ||
      typeof totalAmount !== "number" ||
      !Array.isArray(milestones)
    ) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing or invalid fields"
      );
    }

    const now = FieldValue.serverTimestamp();

    const ref = await db.collection("contracts").add({
      contractAddress,
      clientWallet: context.auth.uid,
      freelancerWallet,
      title,
      description,
      totalAmount,
      milestones,
      isDisputed: false,
      isClosed: false,
      createdAt: now,
      updatedAt: now,
    });

    return { id: ref.id };
  }
);

export const releaseMilestone = functions.https.onCall(
  async (data: any, context: any) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Must be signed in"
      );
    }

    const { contractId, milestoneId } = data;

    if (!contractId || typeof milestoneId !== "number") {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing required fields"
      );
    }

    const contractRef = db.collection("contracts").doc(contractId);
    const snap = await contractRef.get();

    if (!snap.exists) {
      throw new functions.https.HttpsError("not-found", "Contract not found");
    }

    const contract = snap.data()!;
    if (contract.clientWallet !== context.auth.uid) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Only the client can release milestones"
      );
    }

    const milestones = [...contract.milestones];
    if (milestoneId < 0 || milestoneId >= milestones.length) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Invalid milestoneId"
      );
    }

    milestones[milestoneId] = {
      ...milestones[milestoneId],
      status: "released",
    };

    await contractRef.update({
      milestones,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return { success: true };
  }
);

export const updateMilestone = functions.https.onCall(
  async (data: any, context: any) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Must be signed in"
      );
    }

    const { contractId, milestoneId, status, deliverableUrl } = data;

    if (!contractId || typeof milestoneId !== "number" || !status) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing required fields"
      );
    }

    const contractRef = db.collection("contracts").doc(contractId);
    const snap = await contractRef.get();

    if (!snap.exists) {
      throw new functions.https.HttpsError("not-found", "Contract not found");
    }

    const contract = snap.data()!;
    const wallet = context.auth.uid;
    if (
      contract.clientWallet !== wallet &&
      contract.freelancerWallet !== wallet
    ) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Not a party to this contract"
      );
    }

    const milestones = [...contract.milestones];
    if (milestoneId < 0 || milestoneId >= milestones.length) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Invalid milestoneId"
      );
    }

    milestones[milestoneId] = {
      ...milestones[milestoneId],
      status,
      ...(deliverableUrl ? { deliverableUrl } : {}),
    };

    await contractRef.update({
      milestones,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return { success: true };
  }
);

export const saveFeedback = functions.https.onCall(
  async (data: any, context: any) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Must be signed in"
      );
    }

    const { contractId, rating, comment } = data;

    if (!contractId || typeof rating !== "number" || !comment) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing required fields"
      );
    }

    if (rating < 1 || rating > 5) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Rating must be between 1 and 5"
      );
    }

    await db.collection("feedback").add({
      contractId,
      rating,
      comment,
      walletAddress: context.auth.uid,
      createdAt: FieldValue.serverTimestamp(),
    });

    return { success: true };
  }
);
