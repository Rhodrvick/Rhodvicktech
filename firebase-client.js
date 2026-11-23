import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCdZYU2FXNEyEfEVcjjZFrlY6aFWR-cg7w",
  authDomain: "rhodvick-website.firebaseapp.com",
  projectId: "rhodvick-website",
  storageBucket: "rhodvick-website.firebasestorage.app",
  messagingSenderId: "205881971430",
  appId: "1:205881971430:web:d631e263de99ed5eb5e127",
  measurementId: "G-QMGRP2N7HJ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
