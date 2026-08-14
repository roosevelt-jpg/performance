import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

const requiredVariables = [
  "FIREBASE_PROJECT_ID",
  "FIREBASE_CLIENT_EMAIL",
  "FIREBASE_PRIVATE_KEY",
  "FIREBASE_STORAGE_BUCKET",
] as const;

export function isFirebaseConfigured(): boolean {
  return requiredVariables.every((name) => Boolean(process.env[name]?.trim()));
}

function getAdminApp() {
  if (!isFirebaseConfigured()) {
    throw new Error(
      `Firebase is not configured. Set ${requiredVariables.join(", ")}.`,
    );
  }

  return (
    getApps()[0] ??
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    })
  );
}

export function getFirebaseFirestore() {
  return getFirestore(getAdminApp());
}

export function getFirebaseStorage() {
  return getStorage(getAdminApp());
}
