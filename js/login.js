import { auth, provider, db } from "./firebase.js";
import { signInWithPopup, signInWithRedirect, getRedirectResult } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

async function handleUser(user) {
    const userRef = doc(db, "predicciones", user.uid);
    await setDoc(userRef, {
        name: user.displayName,
        email: user.email
    }, { merge: true });
    window.location.href = "./predictions.html";
}

getRedirectResult(auth).then(async (result) => {
    if (result) await handleUser(result.user);
}).catch((error) => {
    console.error(error.code, error.message);
});

const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);

const googleLogin = document.getElementById("google-button");
googleLogin.addEventListener("click", function() {
    if (isMobile) {
        signInWithRedirect(auth, provider);
    } else {
        signInWithPopup(auth, provider)
        .then(async (result) => {
            await handleUser(result.user);
        }).catch((error) => {
            console.error(error.code, error.message);
        });
    }
});