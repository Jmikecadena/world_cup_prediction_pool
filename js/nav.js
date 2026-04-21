import { auth } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

onAuthStateChanged(auth, (user) => {

    const loginButton = document.getElementById("nav-login");
    const registerButton = document.getElementById("nav-button");
    const divProfile = document.getElementById("nav-profile");

    const userAvatar = document.getElementById("nav-avatar");
    const nombre = document.getElementById("nav-inicial");
    
    if (user) {
        loginButton.style.display = 'none';
        registerButton.style.display = 'none';
        divProfile.style.display = 'flex'

        userAvatar.src = user.photoURL; 
        nombre.textContent = user.displayName;
        
    } else {
        loginButton.style.display = 'inline-block';
        registerButton.style.display = 'flex';
        divProfile.style.display = 'none';
    }
})

const cerrarSesion = document.getElementById("nav-logout")
cerrarSesion.addEventListener("click", () => {
    auth.signOut(auth);
})
