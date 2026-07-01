import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getMessaging, isSupported, Messaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCzBIYqsgYaQLessLcPDla3gxsK1sGAhe0",
  authDomain: "marbie-1600.firebaseapp.com",
  projectId: "marbie-1600",
  storageBucket: "marbie-1600.firebasestorage.app",
  messagingSenderId: "481668471582",
  appId: "1:481668471582:web:8ae0d4bd9e067e526b470f",
};

// Initialize Firebase only if it hasn't been initialized already
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

let messaging: Messaging | null = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      messaging = getMessaging(app);
    }
  });
}

export { app, auth, messaging };
