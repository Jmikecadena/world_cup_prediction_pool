import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

onAuthStateChanged(auth, async (user) => {

    const loginButton = document.getElementById("nav-login");
    const registerButton = document.getElementById("nav-button");
    const divProfile = document.getElementById("nav-profile");

    const userAvatar = document.getElementById("nav-avatar");
    const nombre = document.getElementById("nav-inicial");

    if (user) {
        loginButton.style.display = 'none';
        registerButton.style.display = 'none';
        divProfile.style.display = 'flex'

        userAvatar.src = user.photoURL || "../assets/person_24dp_E3E3E3_FILL1_wght400_GRAD0_opsz24.svg";

        if (user.displayName) {
            nombre.textContent = user.displayName;
        } else {
            const snap = await getDoc(doc(db, "predicciones", user.uid));
            if (snap.exists()) {
                nombre.textContent = snap.data().name 
            } else {
                nombre.textContent = user.email;
            }
        }

    } else {
        loginButton.style.display = 'inline-block';
        registerButton.style.display = 'flex';
        divProfile.style.display = 'none';
    }
})

const cerrarSesion = document.getElementById("nav-logout")
cerrarSesion.addEventListener("click", () => {
    signOut(auth);
})
