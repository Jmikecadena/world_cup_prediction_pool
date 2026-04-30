import { auth, provider, db } from "./firebase.js";
import { signInWithPopup, signInWithRedirect, getRedirectResult, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
let iniciado = false;

async function saveUserAndRedirect(user) {
    if (iniciado) return;
    iniciado = true;

    const userRef = doc(db, "predicciones", user.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
        await setDoc(userRef, { name: user.displayName, email: user.email }, { merge: true });
        await setDoc(doc(db, "usernames", user.displayName), { uid: user.uid });
    }
    window.location.href = "./predictions.html";
}

if (isMobile) {
    getRedirectResult(auth)
        .then((result) => {
            if (result && result.user) {
                saveUserAndRedirect(result.user);
            }
        })
        .catch((error) => {
            console.error(error.code, error.message);
        });
}

onAuthStateChanged(auth, (user) => {
    if (user) saveUserAndRedirect(user);
});

const googleLogin = document.getElementById("google-button");
googleLogin.addEventListener("click", function() {
    if (isMobile) {
        signInWithRedirect(auth, provider).catch((error) => {
            console.error(error.code, error.message);
        });
    } else {
        signInWithPopup(auth, provider).catch((error) => {
            console.error(error.code, error.message);
        });
    }
});
