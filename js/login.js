import { auth, provider } from "./firebase.js";
import { signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

const googleLogin = document.getElementById("google-button");
googleLogin.addEventListener("click", function() {
    signInWithPopup(auth, provider)
    .then((result) => {
        const user = result.user;
        window.location.href = "./predictions.html";
    }).catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error(errorCode, errorMessage);
    });
});
