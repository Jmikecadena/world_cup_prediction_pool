import { db, auth } from "./firebase.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

let eyeicon = document.querySelector(".eye-close")
let password = document.getElementById("password-input")
let passwordRepeat = document.getElementById("repeat-password-input")

eyeicon.onclick = function(){
if (password.type == "password") {
    password.type = "text";
    if (passwordRepeat)passwordRepeat.type = "text";
    eyeicon.src = "../assets/eye_open.png"
} else {
    password.type = "password";
    if(passwordRepeat)passwordRepeat.type = "password";
    eyeicon.src = "../assets/eye_close.png"
    }
}

const form = document.getElementById("form")
const nameInput = document.getElementById("name-input")
const emailInput = document.getElementById("email-input")
const passwordInput = document.getElementById("password-input")
const repeatPasswordInput = document.getElementById("repeat-password-input")
const errorMessage = document.getElementById("error-message")

form.addEventListener('submit', async (e) => {
    e.preventDefault()

    let errors = []

    if (nameInput) {
        errors = await getSignupFormErrors(nameInput.value, emailInput.value,
            passwordInput.value, repeatPasswordInput.value);
    } else {
        errors = getLoginFormErrors(emailInput.value, passwordInput.value);
    }

    if (errors.length > 0) {
        errorMessage.innerText = errors.join(". ");
        return;
    } else {
        try {
            if (nameInput) {
                await uploadRegistrationInfo(nameInput.value, emailInput.value, passwordInput.value);
            } else {
                await signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
            }
            window.location.href = "./index.html";
        } catch (err) {
            const firebaseErrores = {
            "auth/email-already-in-use": "El email ya está registrado.",
            "auth/operation-not-allowed": "El email ya está registrado.",
            "auth/weak-password": "La contraseña debe tener al menos 8 caracteres.",
            "auth/invalid-email": "El email no es válido.",
            "auth/user-not-found": "No existe una cuenta con ese email.",
            "auth/wrong-password": "Contraseña incorrecta.",
            "auth/invalid-credential": "Email o contraseña incorrectos.",
        };
            errorMessage.innerText = firebaseErrores[err.code];
            console.error(err.code, err.message);
        }
    }
})

const getSignupFormErrors = async (name, email, password, repeatPassword) => {
    let errors = []
    let nameCheck = await checkName(name);

    if (name === '' || name === null) {
        errors.push("El nombre es requerido");
        nameInput.parentElement.classList.add("incorrect");
    } else if (!nameCheck) {
        errors.push("El nombre ya está en uso");
        nameInput.parentElement.classList.add("incorrect");
    }

    if (email === '' || email === null) {
        errors.push("El Email es requerido");
        emailInput.parentElement.classList.add("incorrect");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push("El Email no es válido");
        emailInput.parentElement.classList.add("incorrect");
    }

    if (password === '' || password === null) {
        errors.push("La contraseña es requerida");
        passwordInput.parentElement.classList.add("incorrect");
    } else if (password.length < 8) {
        errors.push("La contraseña debe tener al menos 8 caracteres");
        passwordInput.parentElement.classList.add("incorrect");
    }

    if (password !== repeatPassword) {
        errors.push("Las contraseñas no coinciden");
        passwordInput.parentElement.classList.add("incorrect")
        repeatPasswordInput.parentElement.classList.add("incorrect");
    }

    return errors;
}

const getLoginFormErrors = (email, password) => {
    let errors = []

    if (email === '' || email === null) {
        errors.push("El Email es requerido");
        emailInput.parentElement.classList.add("incorrect");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push("El Email no es válido");
        emailInput.parentElement.classList.add("incorrect");
    }

    if (password === '' || password === null) {
        errors.push("La contraseña es requerida");
        passwordInput.parentElement.classList.add("incorrect");
    }

    return errors;
}

const allOfInputs = [nameInput, emailInput, passwordInput, repeatPasswordInput].filter(input => input != null);

allOfInputs.forEach(input => {
    input.addEventListener('input', () => {
        if (input.parentElement.classList.contains('incorrect')) {
            input.parentElement.classList.remove('incorrect');
            errorMessage.innerText = ''
        }
    })
})

const uploadRegistrationInfo = async (name, email, password) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, { displayName: name });
    await setDoc(doc(db, "predicciones", credential.user.uid), { name }, { merge: true });
    await setDoc(doc(db, "usernames", name), { uid: credential.user.uid });
}

const checkName = async name => {
    try {
        const nameSnap = await getDoc(doc(db, "usernames", name));
        return !nameSnap.exists();
    } catch {
        return true;
    }
}