import { auth, provider, db } from "./firebase.js";
import { signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

const googleLogin = document.getElementById("google-button");
googleLogin.addEventListener("click", function() {
    signInWithPopup(auth, provider)
    .then(async (result) => {
        const user = result.user;
        const userRef = doc(db, "predicciones", user.uid);
        await setDoc(userRef, {
            name: user.displayName,
            email: user.email
        }, { merge: true });
        window.location.href = "./predictions.html";
    }).catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error(errorCode, errorMessage);
    });
});
