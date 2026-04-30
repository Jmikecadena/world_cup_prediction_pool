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

const ordernarTablaTerceros = () => {
    const equipos = calcularTablaTerceros();

    equipos.sort((a, b) => {
        if (b.puntos !== a.puntos) {
            return b.puntos - a.puntos;
        } else if (b.dg !== a.dg) {
            return b.dg - a.dg;
        } else {
            return b.golesAFavor - a.golesAFavor;
        }
    });
    return { tabla: equipos };

}

const dibujarTablaTerceros = () => {
    const container = document.getElementById("tabla-terceros")
    if (!container) return;
    let tabla = ordernarTablaTerceros();
    checkTiedEightPlace(tabla);
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

const checkTiedEightPlace = (tabla) => {
    const equipoOcho = tabla.tabla[7];
    const popupButton = document.getElementById("popup-mostrar")
    const empatados = tabla.tabla.filter(e =>
        e.puntos === equipoOcho.puntos && e.dg === equipoOcho.dg && e.golesAFavor === equipoOcho.golesAFavor
    );

    const arrayMenosOcho = []

    for (let i = 0; i < 8; i++) {
        if (empatados.includes(tabla.tabla[i])) {
            arrayMenosOcho.push(tabla.tabla[i]);
        }
    }

    const allPredicted = predicciones.every(p => p.resultado);

    if (empatados.length <= 1) {
        popupButton.style.display = 'none';
        return;
    }

    popupButton.style.display = allPredicted ? 'flex' : 'none';

    const cupos = arrayMenosOcho.length;
    const popup = document.getElementById('popup');
    const contenido = document.getElementById('popup-equipos');

    if (cupos == 1) {
        document.getElementById("elige-popup").textContent = `Elige ${cupos} equipo que pasará a Octavos de Final`
    } else {
        document.getElementById("elige-popup").textContent = `Elige ${cupos} equipos que pasarán a Octavos de Final`
    }

    contenido.innerHTML = empatados.map(e =>
        `<div class="info-equipos-popup" id="${e.id}">
            <img src="https://flagcdn.com/w80/${e.flag}.png" alt="${e.id}"/>
            <span class="country-id-popup">${e.id}</span>
            <p>PTS: <span class='nums-popup'>${e.puntos}</span><br> DG:
            <span class='nums-popup'>${e.dg}</span><br> GF:
            <span class='nums-popup-dg'>${e.golesAFavor}</span></p>
        </div>`
    ).join('');

    if (allPredicted) {
        popup.showPopover();
    }
    const arraySelected = []

    document.querySelectorAll(".info-equipos-popup").forEach(pais => {
        pais.addEventListener("click", () => {
            const id = pais.id;
            const i = arraySelected.indexOf(id);
            if (i !== -1) {
                arraySelected.splice(i, 1);
                pais.style.backgroundColor = "transparent";
            } else if (arraySelected.length < cupos) {
                arraySelected.push(id);
                pais.style.backgroundColor = "rgba(249, 248, 213, 0.3)";
            }
        });
    });

    const ordenaTerceros = () => {
        const { tabla } = ordernarTablaTerceros();
        tabla.sort((a, b) => {
            if (b.puntos !== a.puntos) {
                return b.puntos - a.puntos;
            } 
            if (b.dg !== a.dg) {
                return b.dg - a.dg;
            }
            if (b.golesAFavor !== a.golesAFavor) {
                return b.golesAFavor - a.golesAFavor;
            } else {
                return arraySelected.includes(b.id) - arraySelected.includes(a.id);
            }
        });
        const container = document.getElementById("tabla-terceros");
        container.innerHTML = `
            <tr class="row-1">
                <td>POS</td>
                <td>Grupo</td>
                <td id="pais">PAIS</td>
                <td>PTS</td>
                <td>DG</td>
            </tr>
        ` + tabla.map((pais, i) => {
            const equipo = paises.find(p => p.id === pais.id);
            return `
            <tr class="row-${i+1}">
                <td>${i + 1}</td>
                <td>${equipo.grupo}</td>
                <td><div class="country-cell"><img class="flags-table" src="https://flagcdn.com/w80/${pais.flag}.png"
                    alt="${pais.id}"/><span class="pais-id">${pais.id}</span><span class="nombres">${pais.nombre}</span></div></td>
                <td>${pais.puntos}</td>
                <td>${pais.dg}</td>
            </tr>`;
        }).join('');
    };

    document.getElementById('popup-cerrar').onclick = () => {
        ordenaTerceros();
        popup.hidePopover();
    };

    popupButton.addEventListener("click", () => {
        if (predicciones.every(p => p.resultado)) {
            popup.showPopover();
        }
    });
};

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



