
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC_ent56lXphR0FLAEZmoQMCeC-z7nRJho",
  authDomain: "loyaltyleap-53c3f.firebaseapp.com",
  projectId: "loyaltyleap-53c3f",
  storageBucket: "loyaltyleap-53c3f.appspot.com",
  messagingSenderId: "261428189411",
  appId: "1:261428189411:web:718a1f5b9613e8b4fa8dd6",
  measurementId: "G-TBTLTXR2MP"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
