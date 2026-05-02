import { auth, provider, db } from "./firebase.js";
import { signInWithPopup, signInWithRedirect, getRedirectResult, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

async function handleUser(user) {
    const userRef = doc(db, "predicciones", user.uid);
    const email = user.email || user.providerData?.[0]?.email || null;
    await setDoc(userRef, {
        name: user.displayName,
        email: email
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

const reset = document.getElementById('reset');
const errorMessage = document.getElementById("error-message");
reset.addEventListener("click", (e) => {
    e.preventDefault()

    const email = document.getElementById('email-input').value;

    sendPasswordResetEmail(auth, email)
        .then(() => {
            alert("Correo enviado!")
        })
        .catch((error) => {

            const firebaseErrores = {
            "auth/email-already-in-use": "El email ya está registrado.",
            "auth/operation-not-allowed": "El email ya está registrado.",
            "auth/weak-password": "La contraseña debe tener al menos 8 caracteres.",
            "auth/invalid-email": "El email no es válido.",
            "auth/user-not-found": "No existe una cuenta con ese email.",
            "auth/wrong-password": "Contraseña incorrecta.",
            "auth/invalid-credential": "Email o contraseña incorrectos.",
        }
            errorMessage.textContent = firebaseErrores[error.code] ?? "Error al enviar el correo.";
            alert(errorMessage.textContent);
    });
    
})