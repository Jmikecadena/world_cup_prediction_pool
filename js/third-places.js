import { paises, predicciones } from "./data.js";
import { resetearPaises, calcularTablaCompleta, ordernarTabla } from "./predicts.js"
import { db, auth } from "./firebase.js";
import { getDocs, collection, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

const calcularTablaTerceros = () => {
    let arrTerceros = []
    for (let i = 65; i < 77; i++) {
        const letra = String.fromCharCode(i);
        resetearPaises();
        let posiciones = calcularTablaCompleta(letra);
        posiciones.tabla[2].posicion = `3${letra}`
        arrTerceros.push(posiciones.tabla[2])
    }
    resetearPaises();
    return arrTerceros;
}

export const ordernarTablaTerceros = () => {
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

export const dibujarTablaTerceros = () => {
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
    checkTiedEightPlace(tabla);
}

const arraySelected = []

export const setTercerosSeleccion = (arr) => {
    arraySelected.splice(0, arraySelected.length, ...arr);
};

let currentUser = null;

export const obtainTerceros = tabla => {
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
    return tabla;
}

const checkTiedEightPlace = (tabla) => {
    const equipoOcho = tabla.tabla[7];
    const equipoNueve = tabla.tabla[8]
    const popupButton = document.getElementById("popup-mostrar")
    const empatados = tabla.tabla.filter(e =>
        e.puntos === equipoOcho.puntos && e.dg === equipoOcho.dg && e.golesAFavor === equipoOcho.golesAFavor
    );
    const ochoYNueve = equipoOcho.puntos === equipoNueve.puntos && equipoOcho.dg === equipoNueve.dg 
        && equipoOcho.golesAFavor === equipoNueve.golesAFavor

    const arrayMenosOcho = []

    for (let i = 0; i < 8; i++) {
        if (empatados.includes(tabla.tabla[i])) {
            arrayMenosOcho.push(tabla.tabla[i]);
        }
    }

    const allPredicted = predicciones.every(p => p.resultado);

    if (!ochoYNueve || empatados.length <= 1) {
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

    if (allPredicted && arraySelected.length === 0) {
        popup.showPopover();
    }

    document.querySelectorAll(".info-equipos-popup").forEach(pais => {
        if (arraySelected.includes(pais.id)) {
            pais.style.backgroundColor = "rgba(249, 248, 213, 0.3)";
        }
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

    if (arraySelected.length > 0) {
        ordenaTerceros();
    }

    document.getElementById('popup-cerrar').onclick = async () => {
        ordenaTerceros();
        popup.hidePopover();
        if (currentUser) {
            await setDoc(doc(db, "predicciones", currentUser.uid),
                { tercerosSeleccion: arraySelected },
                { merge: true }
            );
        }
    };

    popupButton.addEventListener("click", () => {
        if (predicciones.every(p => p.resultado)) {
            popup.showPopover();
        }
    });

    {return ordenaTerceros}
};


onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "./iniciar_sesion.html";
        return;
}
    currentUser = user;

    const snap = await getDocs(collection(db, "predicciones", user.uid, "partidos"));
    snap.forEach(docSnap => {
        const pred = predicciones.find(p => p.matchId === docSnap.id);
        if (pred) {
            pred.resultado = docSnap.data().resultado;
            pred.margen = docSnap.data().margen ?? 0;
        }
    });

    const userDoc = await getDoc(doc(db, "predicciones", user.uid));
    if (userDoc.exists() && userDoc.data().tercerosSeleccion) {
        arraySelected.splice(0, arraySelected.length, ...userDoc.data().tercerosSeleccion);
    }

    dibujarTablaTerceros();
    let arrayFaseFinal = []
    let arrayFaseGrupos = []

    const querySnapshot = await getDocs(collection(db, "predicciones"));

    await Promise.all(querySnapshot.docs.map(async (userDoc) => {
        const uid = userDoc.id;
        const name = userDoc.data().name;

        const [partidosSnap, faseFinalSnap] = await Promise.all([
            getDocs(collection(db, "predicciones", uid, "partidos")),
            getDocs(collection(db, "predicciones", uid, "fase_final"))
        ]);

        if (partidosSnap.size == 72) arrayFaseGrupos.push(name);

        faseFinalSnap.forEach(docSnap => {
            const equipos = Object.values(docSnap.data());
            const octavos = equipos.filter(p => p.instancia === 'octavos');
            const cuartos = equipos.filter(p => p.instancia === 'cuartos');
            const semis = equipos.filter(p => p.instancia === 'semis');
            const final = equipos.filter(p => p.instancia === 'final');
            const campeon = equipos.filter(p => p.instancia === 'campeon');
            const tercero = equipos.filter(p => p.instancia === 'tercero');

            if (octavos.length === 8 && cuartos.length === 4 && semis.length === 1
                && final.length === 1 && campeon.length === 1 && tercero.length === 1) {
                arrayFaseFinal.push(name);
            }
        });
    }));

    console.log("Fase de Grupos completada:", arrayFaseGrupos);
    console.log("Fase Final completada:", arrayFaseFinal);
});



