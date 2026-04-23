import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyByineY2NN2VXSasZtu_UEhlppMI7rJmNY",
    authDomain: "polla-mundialista-fa7d0.firebaseapp.com",
    projectId: "polla-mundialista-fa7d0",
    storageBucket: "polla-mundialista-fa7d0.firebasestorage.app",
    messagingSenderId: "301081189619",
    appId: "1:301081189619:web:8ae3a38d880990e0b5ab86"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);

auth.languageCode = 'es';
