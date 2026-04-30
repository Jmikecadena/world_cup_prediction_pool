import { auth, provider, db } from "./firebase.js";
import { signInWithPopup, signInWithRedirect, getRedirectResult, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

getRedirectResult(auth).then(async (result) => {
    if (!result) {
        return;
    }
    const user = result.user;
    const userRef = doc(db, "predicciones", user.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
        await setDoc(userRef, { name: user.displayName }, { merge: true });
        await setDoc(doc(db, "usernames", user.displayName), { uid: user.uid });
    }
    window.location.href = "./predictions.html";

    }).catch((error) => {
        console.error(error.code, error.message);
    });

const googleLogin = document.getElementById("google-button");
googleLogin.addEventListener("click", function() {
    if (isMobile) {
        signInWithRedirect(auth, provider).then(async (result) => {
            const user = result.user;
            const userRef = doc(db, "predicciones", user.uid);
            const userSnap = await getDoc(userRef);
            if (!userSnap.exists()) {
                await setDoc(userRef, { name: user.displayName }, { merge: true });
                await setDoc(doc(db, "usernames", user.displayName), { uid: user.uid });
            }
            window.location.href = "./predictions.html";
        }).catch((error) => {
            console.error(error.code, error.message);
        });
    } else {
        signInWithPopup(auth, provider).then(async (result) => {
            const user = result.user;
            const userRef = doc(db, "predicciones", user.uid);
            const userSnap = await getDoc(userRef);
            if (!userSnap.exists()) {
                await setDoc(userRef, { name: user.displayName }, { merge: true });
                await setDoc(doc(db, "usernames", user.displayName), { uid: user.uid });
            }
            window.location.href = "./predictions.html";
        }).catch((error) => {
            console.error(error.code, error.message);
        });
    }
});
