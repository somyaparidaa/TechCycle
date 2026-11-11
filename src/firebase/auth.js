import { auth, db } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";

/**
 * Idempotently saves or updates user profile in Firestore `users/{uid}`.
 * Preserves existing creation timestamp and custom profile properties.
 */
export const syncUserProfile = async (user, additionalData = {}) => {
  if (!user || !user.uid) return null;

  try {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    const baseData = {
      uid: user.uid,
      email: user.email || "",
      displayName: additionalData.displayName || user.displayName || user.email?.split("@")[0] || "User",
      photoURL: user.photoURL || null,
      lastLoginAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      ...additionalData,
    };

    if (!userSnap.exists()) {
      baseData.createdAt = serverTimestamp();
    }

    await setDoc(userRef, baseData, { merge: true });
    return baseData;
  } catch (error) {
    console.error("[TechCycle] Failed to sync user profile in Firestore:", error);
    // Non-blocking for auth itself
    return null;
  }
};

export const doCreateUserWithEmailAndPassword = async (email, password, displayName = "") => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  if (userCredential.user) {
    await syncUserProfile(userCredential.user, { displayName });
  }
  return userCredential;
};

export const doSignInWithEmailAndPassword = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  if (userCredential.user) {
    await syncUserProfile(userCredential.user);
  }
  return userCredential;
};

export const doSignInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const result = await signInWithPopup(auth, provider);
  if (result.user) {
    await syncUserProfile(result.user);
  }
  return result;
};

export const doSignOut = () => {
  return signOut(auth);
};
