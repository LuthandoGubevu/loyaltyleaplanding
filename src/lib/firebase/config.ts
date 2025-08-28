
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDJMKzxLjndQ806agw4vqHnUE5FztjAssk",
  authDomain: "loyaltyleap-e166f.firebaseapp.com",
  projectId: "loyaltyleap-e166f",
  storageBucket: "loyaltyleap-e166f.appspot.com",
  messagingSenderId: "41718310302",
  appId: "1:41718310302:web:d88d919c31d58a420ba28f",
  measurementId: "G-HYZM0F4QQ4"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
