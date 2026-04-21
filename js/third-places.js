import { paises, predicciones } from "./data.js";
import { resetearPaises, calcularTablaCompleta, ordernarTabla } from "./predicts.js"
import { db, auth } from "./firebase.js";
import { getDocs, collection } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

const calcularTablaTerceros = () => {
    let arrTerceros = []
    for (let i = 65; i < 77; i++) {
        const letra = String.fromCharCode(i);
        resetearPaises();
        let posiciones = calcularTablaCompleta(letra);
        arrTerceros.push(posiciones.tabla[2])
    }
    resetearPaises();
    return arrTerceros;
}

calcularTablaTerceros();

const ordernarTablaTerceros = () => {
    const equipos = calcularTablaTerceros();

    equipos.sort((a, b) => {
        if (b.puntos !== a.puntos) {
            return b.puntos - a.puntos;
        } else {
            return b.dg - a.dg;
        }
    });
    console.log({tabla: equipos});
    return { tabla: equipos };

}

const dibujarTablaTerceros = () => {
    const container = document.getElementById("tabla-terceros")
    if (!container) return;
    let tabla = ordernarTablaTerceros();
    container.innerHTML = `
        <tr class="row-1">
            <td>POS</td>
            <td>Grupo</td>
            <td id="pais">PAIS</td>
            <td>PTS</td>
            <td>DG</td>
        </tr>
    ` + tabla.tabla.map((pais, i) => {
        const equipo = paises.find(p => p.id === pais.id);
        return `
        <tr class=row-${i+1}>
            <td>${i + 1}</td>
            <td>${equipo.grupo}</td>
            <td><div class="country-cell"><img class="flags-table" src="https://flagcdn.com/w80/${pais.flag}.png"
                alt="${pais.id}"/><span class="pais-id">${pais.id}</span><span class="nombres">${pais.nombre}</span></div></td>
            <td>${pais.puntos}</td>
            <td>${pais.dg}</td>
        </tr>
    `}).join('')
}

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "./iniciar_sesion.html";
        return;
    }
    const snap = await getDocs(collection(db, "predicciones", user.uid, "partidos"));
    snap.forEach(docSnap => {
        const pred = predicciones.find(p => p.matchId === docSnap.id);
        if (pred) {
            pred.resultado = docSnap.data().resultado;
            pred.margen = docSnap.data().margen ?? 0;
        }
    });
    dibujarTablaTerceros();
});

