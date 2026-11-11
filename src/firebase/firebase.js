import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";  // Add this import

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA9FcKGmlnTt-8O1-MpbSAhsv31-7tzQeo",
  authDomain: "techcycle-afe6b.firebaseapp.com",
  projectId: "techcycle-afe6b",
  storageBucket: "techcycle-afe6b.firebasestorage.app",  // This exists in your config
  messagingSenderId: "19919777135",
  appId: "1:19919777135:web:0f768792fc08a163120c9a",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);  // Add this line

export { app, auth, db, storage };  // Add storage to exports