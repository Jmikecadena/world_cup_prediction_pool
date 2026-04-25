import { db, auth } from "./firebase.js";
import { paises, partidos, predicciones } from "./data.js";
import { doc, setDoc, getDocs, collection } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

export let grupoActivo = 'A';

export const cambiarGrupo = (grupo) => {
    grupoActivo = grupo;
    dibujarTituloGrupo(grupo);
    resetearPaises();
    dibujarTabla(grupo);
    dibujarPartidos(grupo);
    obtenerPrediccionUsuario();
    opcionesDesplegables();
};

const dibujarTituloGrupo = (grupo) => {
    const container = document.querySelector(".groups-names")
    if (!container) return;

    container.innerHTML = `
        <h1 class="group-name">GRUPO ${grupo}</h1>
    `
}

const puntosPorPartido = (resultado) => {
    if (resultado === 'local') {
        return {local: 3, visitante: 0};
    } else if (resultado === 'visitante') {
        return {local: 0, visitante: 3}
    } else {
        return {local: 1, visitante: 1};
    }
}


const procesarPrediccionUsuario = (Id, resultado, margen) => {
    const prediccion = puntosPorPartido(resultado); 
    const partido = partidos.find(c => c.id === Id); 

    const pais = paises.find(p => partido.local === p.id);
    pais.puntos += prediccion['local'];

    const pais2 = paises.find(p => partido.visitante === p.id)
    pais2.puntos += prediccion['visitante'];

    if (margen > 0) {
        if (resultado === 'local') {
            pais.golesAFavor += margen;  
            pais2.golesEnContra += margen;
        } else {
            pais.golesEnContra += margen;
            pais2.golesAFavor += margen;
        }
    }

    console.log({ local: pais, visitante: pais2 }) 
    return { local: pais, visitante: pais2 }
}

export const ordernarTabla = (grupo) => {
    const equipos = [];
    for (let i = 0; i < paises.length; i++) {
        if (paises[i].grupo === grupo) {
            equipos.push({
                id: paises[i].id,
                nombre: paises[i].nombre,
                flag: paises[i].flag,
                puntos: paises[i].puntos,
                dg: paises[i].dg
            });
        }
    }

    equipos.sort((a, b) => {
        if (b.puntos !== a.puntos) {
            return b.puntos - a.puntos;
        } else {
            return b.dg - a.dg;
        }
    });
    return { tabla: equipos };
}

export const calcularTablaCompleta = (grupo) => {
    predicciones.forEach(prediccion => {
        if (!prediccion.resultado) {
            return;
        }
        procesarPrediccionUsuario(prediccion.matchId, prediccion.resultado,
            prediccion.margen);
    })
    return ordernarTabla(grupo);
}

const dibujarTabla = (grupo = grupoActivo) => {
    const container = document.getElementById("tabla-grupo")
    if (!container) return;
    let tabla = calcularTablaCompleta(grupo);
    container.innerHTML = `
        <tr class="row-1">
            <td>POS</td>
            <td id="pais">PAIS</td>
            <td>PTS</td>
            <td>DG</td>
        </tr>
    ` + tabla.tabla.map((pais, i) => `
        <tr class=row-${i+1}>
            <td>${i + 1}</td>
            <td><div class="country-cell"><img class="flags-table" src="https://flagcdn.com/w80/${pais.flag}.png"
                alt="${pais.id}"/><span class="pais-id">${pais.id}</span><span class="nombres">${pais.nombre}</span></div></td>
            <td>${pais.puntos}</td>
            <td>${pais.dg}</td>
        </tr>
        
    `).join('')
}

const dibujarPartidos = (grupo = grupoActivo) => {
    const container = document.querySelector(".matches-container")
    if (!container) return;
    const filtrados = partidos.filter(p => p.grupo === grupo);
    container.innerHTML = filtrados.map(partido => `
        <div class="match-card ${partido.id}">
            <div class="match-vs">
                <h2>${partido.local}</h2>
                <img class="flag-matches" id="flagmatches-local"
                    src="https://flagcdn.com/w80/${partido.flagLocal}.png" alt="${partido.local}">
                <h2>vs</h2>
                <img class="flag-matches" id="flagmatches-visitante"
                    src="https://flagcdn.com/w80/${partido.flagVisitante}.png" alt="${partido.visitante}">
                <h2>${partido.visitante} </h2>
            </div>
            <div class="match-buttons">
                <button id='${partido.id}-local'><strong>${partido.local}</strong></button>
                <button id='${partido.id}-empate'><strong>X</strong></button>
                <button id='${partido.id}-visitante'><strong>${partido.visitante}</strong></button>
            </div>
            <div class="margen">${dibujarBotonesMargen(partido.id)}</div>
            <div class="who-wins" id="${idWhowins(partido.id)}">${margenMensaje(partido.id)}</div>
            <div class="match-info"><p>${partido.fecha} - ${partido.hora} - ${partido.ciudad}</p></div>
        </div>
    `).join('')

    stylesSelectorClicked();
}

const idWhowins = matchId => {
    const prediccion = predicciones.find(p => p.matchId === matchId);
    if (!prediccion || !prediccion.resultado) {
        return '';
    } 
    return prediccion.resultado === 'local' ? 'message-local' : 'message-visitante';
}

const dibujarBotonesMargen = matchId => {
    const prediccion = predicciones.find(p => p.matchId === matchId);
    if (prediccion && (prediccion.resultado === 'local' || prediccion.resultado === 'visitante')) {
        const mensaje = prediccion.margen;
        return `
            <select class="margen-select">
                <option disabled ${mensaje == false ? 'selected' : ''}>Diferencia de gol</option>
                <option value=1 ${mensaje === 1 ? 'selected' : ''}>+1</option>
                <option value=2 ${mensaje === 2 ? 'selected' : ''}>+2</option>
                <option value=3 ${mensaje === 3 ? 'selected' : ''}>+3</option>
                <option value=4 ${mensaje === 4 ? 'selected' : ''}>+4</option>
                <option value=5 ${mensaje === 5 ? 'selected' : ''}>5 o más</option>
            </select>
            `;
    }
    return '';
}

const margenMensaje = matchId => {                                                                                                                                                                            
    const prediccion = predicciones.find(p => p.matchId === matchId);                                                                                                                                         
    const partido = partidos.find(p => p.id === matchId);
    const pais = paises.find(p =>  p.id === partido.local)
    const pais2 = paises.find(p =>  p.id === partido.visitante) 

    const id = idWhowins(matchId);

    if (prediccion && prediccion.resultado === 'local' && prediccion.margen > 0) {
        if (1 < prediccion.margen && prediccion.margen < 5) {
            return `<img class="flag-matches" id="flagmessage-local"
                        src="https://flagcdn.com/w160/${partido.flagLocal}.png"
                        alt="${partido.local}"><p id="${id}">Gana por ${prediccion.margen}
                        goles de diferencia</p>`;
        } else if (prediccion.margen >= 5) {
            return `<img class="flag-matches" id="flagmessage-local"
                        src="https://flagcdn.com/w160/${partido.flagLocal}.png"
                        alt="${partido.local}"><p id="${id}">Gana por ${prediccion.margen}
                        o más goles de diferencia</p>`;
        } else {
            return `<img class="flag-matches" id="flagmessage-local"
                        src="https://flagcdn.com/w160/${partido.flagLocal}.png"
                        alt="${partido.local}"><p id="${id}">Gana por ${prediccion.margen}
                        gol de diferencia</p>`;
        }
    }

    if (prediccion && prediccion.resultado === 'visitante' && prediccion.margen > 0) {
        if (1 < prediccion.margen && prediccion.margen < 5) {
            return `<img class="flag-matches" id="flagmessage-visitante"
                        src="https://flagcdn.com/w160/${partido.flagVisitante}.png"
                        alt="${partido.visitante}"><p id="${id}">Gana por ${prediccion.margen}
                        goles de diferencia</p>`;
        } else if (prediccion.margen >= 5) {
            return `<img class="flag-matches" id="flagmessage-visitante"
                        src="https://flagcdn.com/w160/${partido.flagVisitante}.png"
                        alt="${partido.visitante}"><p id="${id}">Gana por ${prediccion.margen}
                        o más goles de diferencia</p>`;
        } else {
            return `<img class="flag-matches" id="flagmessage-visitante"
                        src="https://flagcdn.com/w160/${partido.flagVisitante}.png"
                        alt="${partido.visitante}"><p id="${id}">Gana por ${prediccion.margen}
                        gol de diferencia</p>`;
        }
    } return '';
}                                                                                                                                                                                                                  

let margen = {};

const stylesSelectorClicked = () => {
    partidos.forEach(partido => {
        const prediccion = predicciones.find(p => p.matchId === partido.id);
        const tieneMargen = prediccion && (prediccion.resultado === 'local' || prediccion.resultado === 'visitante');

        const match = document.querySelector(`.match-card.${partido.id}`);
        if (!match) {
            return;
        }
        const desplegable = match.querySelector('.margen');

        match.querySelector('.match-vs').style.padding = tieneMargen ? "10px 175px 200px" : "";
        match.querySelector('.match-buttons').style.bottom = tieneMargen ? "190px" : "";
        match.querySelector('.match-info').style.bottom = tieneMargen ? "115px" : "";
        
        if (prediccion && prediccion.resultado === 'visitante') {
            desplegable.style.bottom = tieneMargen ? "130px" : "";
            desplegable.style.right = tieneMargen ? "-180px" : "";
        } else if (prediccion && prediccion.resultado === 'local'){
            desplegable.style.bottom = tieneMargen ? "130px" : "";
            desplegable.style.left = tieneMargen ? "-180px" : "";
        }
    });


    Object.values(clickedbuttons).forEach(botonId => {
        const findButon = document.getElementById(botonId);
        if (findButon) {
            findButon.style.backgroundColor = "#6e654c";
        }
    });
}

const dibujarInfoPartidos = () => {
    return partidos.map(partido => `${partido.fecha} - ${partido.hora} - ${partido.ciudad}`)
}

export const resetearPaises = () => {
    paises.forEach(pais => {
        pais.puntos = 0;
        pais.golesAFavor = 0;
        pais.golesEnContra = 0;
    })
    return predicciones;
}

let clickedbuttons = {};

const unHoverBotton = (button) => {
    const [matchId, result] = button.id.split('-');
    if (clickedbuttons[matchId]) {
        document.getElementById(clickedbuttons[matchId]).style.backgroundColor = "#dac896";
        margen['margen'] = false;
        const prediccion = predicciones.find(p => p.matchId == matchId);
        if (prediccion) {
            prediccion.margen = 0;
        }
    } 

    clickedbuttons[matchId] = button.id;
    margen['margen'] = true;
    console.log(clickedbuttons)
}

const obtenerPrediccionUsuario = () => {
    document.querySelectorAll(".match-buttons button").forEach(button => {
        button.addEventListener("click", () => { 

            const [matchId, result] = button.id.split('-');
            const prediccion = predicciones.find(p => p.matchId === matchId);

            if (prediccion) {
                prediccion.resultado = result;
            }

            const userId = auth.currentUser?.uid;                                                                                                                                                                         
                if (userId) {                                                                                                                                                                                                 
                    setDoc(doc(db, "predicciones", userId, "partidos", matchId), {                                                                                                                                          
                    resultado: result,                                                                                                                                                                                    
                    margen: prediccion.margen
                })                                                                                                                                                                                                     
            }    
            unHoverBotton(button);
            
            resetearPaises();
            dibujarTabla();
            dibujarPartidos();
            obtenerPrediccionUsuario();
            opcionesDesplegables();
        });
    });
}

const opcionesDesplegables = () => {
    document.querySelectorAll('.margen select').forEach((opcion, i) => {
        opcion.addEventListener('change', () => {
            const matchId = opcion.closest('.match-card').classList[1];
            const prediccion = predicciones.find(p => p.matchId === matchId);

            if (prediccion) {
                prediccion.margen = parseInt(opcion.value);
                const userId = auth.currentUser?.uid;
                if (userId) {
                    setDoc(doc(db, "predicciones", userId, "partidos", matchId), {
                        resultado: prediccion.resultado,
                        margen: prediccion.margen

                    });
                }
            }
            resetearPaises();
            dibujarTabla();
            dibujarPartidos();
            obtenerPrediccionUsuario();
            opcionesDesplegables();
        });
    });
}
const cargarPrediccionesDeFirestore = async (userId) => {
    const snapshot = await getDocs(collection(db, "predicciones", userId, "partidos"));
    snapshot.forEach(docSnap => {
        const predict = predicciones.find(p => p.matchId === docSnap.id);
        if (predict) {
            predict.resultado = docSnap.data().resultado;
            predict.margen = docSnap.data().margen ?? 0;
            if (predict.resultado) {
                clickedbuttons[docSnap.id] = `${docSnap.id}-${predict.resultado}`;
            }
        }
    });
};

onAuthStateChanged(auth, async (user) => {
    if (user) {
        await cargarPrediccionesDeFirestore(user.uid);
        dibujarTituloGrupo(grupoActivo);
        dibujarTabla();
        dibujarPartidos();
        obtenerPrediccionUsuario();
        opcionesDesplegables();
    } else {
        window.location.href = "./iniciar_sesion.html";
    }
});