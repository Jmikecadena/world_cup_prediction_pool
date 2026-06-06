import { paises, predicciones } from "./data.js";
import { resetearPaises, calcularTablaCompleta, ordernarTabla, cargarPrediccionesDeFirestore } from "./predicts.js"
import { ordernarTablaTerceros, obtainTerceros, setTercerosSeleccion } from "./third-places.js"
import { tercerosPairings } from "./final_pairings.js";
import { db, auth } from "./firebase.js";
import { getDocs, collection, setDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";


const tablaCompleta = () => {
    let array = []
    for (let i = 65; i < 77; i++) {
        const letra = String.fromCharCode(i);
        resetearPaises();
        const tabla = calcularTablaCompleta(letra);
        for (let i = 0; i < 4; i++) {
            tabla.tabla[i].posicion = `${i+1}${letra}`
        }
        array.push(tabla);
    }
    resetearPaises();
    return array;
}

const determinarPatron = (tablaOchos) => {
    let array = []
    tablaOchos.forEach((pais) => {
        const [pos, grupo] = pais.posicion
        array.push(grupo);
    })
    array.sort();

    return array.join('');
}

const buscarPatron = patron => {
    const result = tercerosPairings[patron]
    return result;
}


const firstFase = (tablaArray, tablaOchos) => {
    const position = {};
    tablaArray.forEach(group => {
        group.tabla.forEach(pais => {
            position[pais.posicion] = pais;
        });
    });

    const patron = determinarPatron(tablaOchos);
    const patronEncontrado = buscarPatron(patron)

    const arrayMatches = [
        [position['1E'], position[patronEncontrado['1E']]],
        [position['1I'], position[patronEncontrado['1I']]],
        [position['2A'], position['2B']],
        [position['1F'], position['2C']],
        [position['2K'], position['2L']],
        [position['1H'], position['2J']],
        [position['1D'], position[patronEncontrado['1D']]],
        [position['1G'], position[patronEncontrado['1G']]],
        [position['1C'], position['2F']],
        [position['2E'], position['2I']],
        [position['1A'], position[patronEncontrado['1A']]],
        [position['1L'], position[patronEncontrado['1L']]],
        [position['1J'], position['2H']],
        [position['2D'], position['2G']],
        [position['1B'], position[patronEncontrado['1B']]],
        [position['1K'], position[patronEncontrado['1K']]]     
    ]

    arrayMatches.forEach(partido => {
        partido.forEach(pais => {
            pais.instancia = 'dieciseisAvos'
        })
    })

    return arrayMatches;
}

const dibujarPartidos = (arrayMatches) => {
    const container = document.querySelector(".dieciseisavos")
    const containerOctavos = document.querySelector("#primeros-cuatro")
    const containerOctavosDos = document.querySelector("#segundos-cuatro")
    const containerCuartos = document.querySelector("#primeros-dos")
    const containerCuartosDos = document.querySelector("#segundos-dos")
    const containerSemis = document.querySelector(".semis")
    const containerFinal = document.querySelector(".final")
    const containerTerceros = document.querySelector('.tercer-puesto')

    let octavos = ''  
    let octavosDos = ''
    let cuartos = ''
    let cuartosDos = ''
    let semis = ''
    let final = ''
    let tercerpuesto = ''

    container.innerHTML = `
        <div id="primeros-ocho">
            ${arrayMatches.slice(0, 8).map(([paisUno, paisDos], i) => `
                <div class="matchcards-primerosocho">
                    <div class="partidos" id="dA-${i+1}">
                        <button class="botones-partidos paisuno btn-octavos" id="${paisUno.id}-Octavos">
                            <img class="flags" src="https://flagcdn.com/w160/${paisUno.flag}.png"
                                alt="${paisUno.id}"/>${paisUno.id}
                        </button>
                        <button class="botones-partidos btn-octavos"id="${paisDos.id}-Octavos">
                            <img class="flags" src="https://flagcdn.com/w160/${paisDos.flag}.png"
                                alt="${paisDos.id}"/>${paisDos.id}
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
        <div id="segundos-ocho">
            ${arrayMatches.slice(8, 16).map(([paisUno, paisDos], i) => `
                <div class="matchcards-primerosocho">
                    <div class="partidos" id="dA-${i+9}">
                        <button class="botones-partidos paisuno btn-octavos" id="${paisUno.id}-Octavos">
                            <img class="flags" src="https://flagcdn.com/w160/${paisUno.flag}.png"
                                alt="${paisUno.id}"/>${paisUno.id}
                        </button>
                        <button class="botones-partidos btn-octavos"id="${paisDos.id}-Octavos">
                            <img class="flags" src="https://flagcdn.com/w160/${paisDos.flag}.png"
                                alt="${paisDos.id}"/>${paisDos.id}
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>`;
                                                                
    for (let i = 0; i < 4; i++) {
        octavos += `
            <div class="matchcards-primeroscuatro"> 
                <div class="partidos" id="oF-${i+1}">
                    <button class="botones-partidos paisuno btn-cuartos" id="clasificado${i+1}-A">
                        <label>
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFF55"><path d="M513.5-254.5Q528-269 528-290t-14.5-35.5Q499-340 478-340t-35.5 14.5Q428-311 428-290t14.5 35.5Q457-240 478-240t35.5-14.5ZM442-394h74q0-33 7.5-52t42.5-52q26-26 41-49.5t15-56.5q0-56-41-86t-97-30q-57 0-92.5 30T342-618l66 26q5-18 22.5-39t53.5-21q32 0 48 17.5t16 38.5q0 20-12 37.5T506-526q-44 39-54 59t-10 73Zm38 314q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>
                        </label>N/A
                    </button>
                    <button class="botones-partidos btn-cuartos" id="clasificado${i+1}-B">
                        <label>
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFF55"><path d="M513.5-254.5Q528-269 528-290t-14.5-35.5Q499-340 478-340t-35.5 14.5Q428-311 428-290t14.5 35.5Q457-240 478-240t35.5-14.5ZM442-394h74q0-33 7.5-52t42.5-52q26-26 41-49.5t15-56.5q0-56-41-86t-97-30q-57 0-92.5 30T342-618l66 26q5-18 22.5-39t53.5-21q32 0 48 17.5t16 38.5q0 20-12 37.5T506-526q-44 39-54 59t-10 73Zm38 314q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>
                        </label>N/A  
                    </button>
                </div>
            </div>`
    }
    for (let i = 0; i < 4; i++) {
        octavosDos += `
            <div class="matchcards-primeroscuatro"> 
                <div class="partidos" id="oF-${i+5}">
                    <button class="botones-partidos paisuno btn-cuartos" id="clasificado${i+5}-A">
                        <label>
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFF55"><path d="M513.5-254.5Q528-269 528-290t-14.5-35.5Q499-340 478-340t-35.5 14.5Q428-311 428-290t14.5 35.5Q457-240 478-240t35.5-14.5ZM442-394h74q0-33 7.5-52t42.5-52q26-26 41-49.5t15-56.5q0-56-41-86t-97-30q-57 0-92.5 30T342-618l66 26q5-18 22.5-39t53.5-21q32 0 48 17.5t16 38.5q0 20-12 37.5T506-526q-44 39-54 59t-10 73Zm38 314q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>
                        </label>N/A
                    </button>
                    <button class="botones-partidos btn-cuartos" id="clasificado${i+5}-B">
                        <label>
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFF55"><path d="M513.5-254.5Q528-269 528-290t-14.5-35.5Q499-340 478-340t-35.5 14.5Q428-311 428-290t14.5 35.5Q457-240 478-240t35.5-14.5ZM442-394h74q0-33 7.5-52t42.5-52q26-26 41-49.5t15-56.5q0-56-41-86t-97-30q-57 0-92.5 30T342-618l66 26q5-18 22.5-39t53.5-21q32 0 48 17.5t16 38.5q0 20-12 37.5T506-526q-44 39-54 59t-10 73Zm38 314q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>
                        </label>N/A
                    </button>
                </div>
            </div>`
    }
    for (let i =0; i < 2; i++) {
        cuartos += `
            <div class="matchcards-primerosdos">
                <div class="partidos" id="cF-${i+1}">
                    <button class="botones-partidos paisuno btn-semis" id="semifinalista${i+1}-A">
                        <label>
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFF55"><path d="M513.5-254.5Q528-269 528-290t-14.5-35.5Q499-340 478-340t-35.5 14.5Q428-311 428-290t14.5 35.5Q457-240 478-240t35.5-14.5ZM442-394h74q0-33 7.5-52t42.5-52q26-26 41-49.5t15-56.5q0-56-41-86t-97-30q-57 0-92.5 30T342-618l66 26q5-18 22.5-39t53.5-21q32 0 48 17.5t16 38.5q0 20-12 37.5T506-526q-44 39-54 59t-10 73Zm38 314q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>
                        </label>N/A
                    </button>
                    <button class="botones-partidos btn-semis" id="semifinalista${i+1}-B">
                        <label>
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFF55"><path d="M513.5-254.5Q528-269 528-290t-14.5-35.5Q499-340 478-340t-35.5 14.5Q428-311 428-290t14.5 35.5Q457-240 478-240t35.5-14.5ZM442-394h74q0-33 7.5-52t42.5-52q26-26 41-49.5t15-56.5q0-56-41-86t-97-30q-57 0-92.5 30T342-618l66 26q5-18 22.5-39t53.5-21q32 0 48 17.5t16 38.5q0 20-12 37.5T506-526q-44 39-54 59t-10 73Zm38 314q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>
                        </label>N/A
                    </button>
                </div>
            </div>`
    }
    for (let i = 0; i < 2; i++) {
        cuartosDos += `
            <div class="matchcards-primerosdos">
                <div class="partidos" id="cF-${i+3}">
                    <button class="botones-partidos paisuno btn-semis" id="semifinalista${i+3}-A">
                        <label>
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFF55"><path d="M513.5-254.5Q528-269 528-290t-14.5-35.5Q499-340 478-340t-35.5 14.5Q428-311 428-290t14.5 35.5Q457-240 478-240t35.5-14.5ZM442-394h74q0-33 7.5-52t42.5-52q26-26 41-49.5t15-56.5q0-56-41-86t-97-30q-57 0-92.5 30T342-618l66 26q5-18 22.5-39t53.5-21q32 0 48 17.5t16 38.5q0 20-12 37.5T506-526q-44 39-54 59t-10 73Zm38 314q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>
                        </label>N/A
                    </button>
                    <button class="botones-partidos btn-semis" id="semifinalista${i+3}-B">
                        <label>
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFF55"><path d="M513.5-254.5Q528-269 528-290t-14.5-35.5Q499-340 478-340t-35.5 14.5Q428-311 428-290t14.5 35.5Q457-240 478-240t35.5-14.5ZM442-394h74q0-33 7.5-52t42.5-52q26-26 41-49.5t15-56.5q0-56-41-86t-97-30q-57 0-92.5 30T342-618l66 26q5-18 22.5-39t53.5-21q32 0 48 17.5t16 38.5q0 20-12 37.5T506-526q-44 39-54 59t-10 73Zm38 314q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>
                        </label>N/A
                    </button>
                </div>
            </div>`
    }
    semis += `<div class="card-class" id="primeros">
                        <div class="matchcards-primerosdos">
                            <div class="partidos" id="sF-1">
                                <button class="botones-partidos paisuno btn-final" id="finalista1-A">
                                    <label>
                                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFF55"><path d="M513.5-254.5Q528-269 528-290t-14.5-35.5Q499-340 478-340t-35.5 14.5Q428-311 428-290t14.5 35.5Q457-240 478-240t35.5-14.5ZM442-394h74q0-33 7.5-52t42.5-52q26-26 41-49.5t15-56.5q0-56-41-86t-97-30q-57 0-92.5 30T342-618l66 26q5-18 22.5-39t53.5-21q32 0 48 17.5t16 38.5q0 20-12 37.5T506-526q-44 39-54 59t-10 73Zm38 314q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>
                                    </label>N/A
                                </button>
                                <button class="botones-partidos btn-final" id="finalista1-B">
                                    <label>
                                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFF55"><path d="M513.5-254.5Q528-269 528-290t-14.5-35.5Q499-340 478-340t-35.5 14.5Q428-311 428-290t14.5 35.5Q457-240 478-240t35.5-14.5ZM442-394h74q0-33 7.5-52t42.5-52q26-26 41-49.5t15-56.5q0-56-41-86t-97-30q-57 0-92.5 30T342-618l66 26q5-18 22.5-39t53.5-21q32 0 48 17.5t16 38.5q0 20-12 37.5T506-526q-44 39-54 59t-10 73Zm38 314q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>
                                    </label>N/A
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="card-class" id="segundos">
                        <div class="matchcards-primerosdos">
                            <div class="partidos" id="sF-2">
                                <button class="botones-partidos paisuno btn-final" id="finalista2-A">
                                    <label>
                                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFF55"><path d="M513.5-254.5Q528-269 528-290t-14.5-35.5Q499-340 478-340t-35.5 14.5Q428-311 428-290t14.5 35.5Q457-240 478-240t35.5-14.5ZM442-394h74q0-33 7.5-52t42.5-52q26-26 41-49.5t15-56.5q0-56-41-86t-97-30q-57 0-92.5 30T342-618l66 26q5-18 22.5-39t53.5-21q32 0 48 17.5t16 38.5q0 20-12 37.5T506-526q-44 39-54 59t-10 73Zm38 314q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>
                                    </label>N/A
                                </button>
                                <button class="botones-partidos btn-final" id="finalista2-B">
                                    <label>
                                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFF55"><path d="M513.5-254.5Q528-269 528-290t-14.5-35.5Q499-340 478-340t-35.5 14.5Q428-311 428-290t14.5 35.5Q457-240 478-240t35.5-14.5ZM442-394h74q0-33 7.5-52t42.5-52q26-26 41-49.5t15-56.5q0-56-41-86t-97-30q-57 0-92.5 30T342-618l66 26q5-18 22.5-39t53.5-21q32 0 48 17.5t16 38.5q0 20-12 37.5T506-526q-44 39-54 59t-10 73Zm38 314q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>
                                    </label>N/A
                                </button>
                            </div>
                        </div>
                    </div>`
    final += `<h2>Final</h2>
                    <div class="matchcard-final finalcard">
                        <div class="partidos" id="finale">
                            <button id="campeon-A"class="botones-partidos paisuno btn-campeon">
                                <label>
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFF55"><path d="M513.5-254.5Q528-269 528-290t-14.5-35.5Q499-340 478-340t-35.5 14.5Q428-311 428-290t14.5 35.5Q457-240 478-240t35.5-14.5ZM442-394h74q0-33 7.5-52t42.5-52q26-26 41-49.5t15-56.5q0-56-41-86t-97-30q-57 0-92.5 30T342-618l66 26q5-18 22.5-39t53.5-21q32 0 48 17.5t16 38.5q0 20-12 37.5T506-526q-44 39-54 59t-10 73Zm38 314q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>
                                </label>N/A
                            </button>
                            <button id="campeon-B"class="botones-partidos btn-campeon">
                                <label>
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFF55"><path d="M513.5-254.5Q528-269 528-290t-14.5-35.5Q499-340 478-340t-35.5 14.5Q428-311 428-290t14.5 35.5Q457-240 478-240t35.5-14.5ZM442-394h74q0-33 7.5-52t42.5-52q26-26 41-49.5t15-56.5q0-56-41-86t-97-30q-57 0-92.5 30T342-618l66 26q5-18 22.5-39t53.5-21q32 0 48 17.5t16 38.5q0 20-12 37.5T506-526q-44 39-54 59t-10 73Zm38 314q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>
                                </label>N/A  
                            </button>
                        </div>
                    </div>`
    tercerpuesto += `<h2>Tercer Puesto</h2>
                        <div class="matchcard-final">
                            <div class="partidos" id="finale">
                                <button id="tercerCuarto-A" class="botones-partidos paisuno btn-tercero">
                                    <label>
                                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFF55"><path d="M513.5-254.5Q528-269 528-290t-14.5-35.5Q499-340 478-340t-35.5 14.5Q428-311 428-290t14.5 35.5Q457-240 478-240t35.5-14.5ZM442-394h74q0-33 7.5-52t42.5-52q26-26 41-49.5t15-56.5q0-56-41-86t-97-30q-57 0-92.5 30T342-618l66 26q5-18 22.5-39t53.5-21q32 0 48 17.5t16 38.5q0 20-12 37.5T506-526q-44 39-54 59t-10 73Zm38 314q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>
                                    </label>N/A
                                </button>
                                <button id="tercerCuarto-B" class="botones-partidos btn-tercero">
                                    <label>
                                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFF55"><path d="M513.5-254.5Q528-269 528-290t-14.5-35.5Q499-340 478-340t-35.5 14.5Q428-311 428-290t14.5 35.5Q457-240 478-240t35.5-14.5ZM442-394h74q0-33 7.5-52t42.5-52q26-26 41-49.5t15-56.5q0-56-41-86t-97-30q-57 0-92.5 30T342-618l66 26q5-18 22.5-39t53.5-21q32 0 48 17.5t16 38.5q0 20-12 37.5T506-526q-44 39-54 59t-10 73Zm38 314q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>
                                    </label>N/A  
                                </button>
                            </div>
                        </div>`

    containerOctavos.innerHTML = octavos
    containerOctavosDos.innerHTML = octavosDos
    containerCuartos.innerHTML = cuartos
    containerCuartosDos.innerHTML = cuartosDos
    containerSemis.innerHTML = semis
    containerFinal.innerHTML = final
    containerTerceros.innerHTML = tercerpuesto
}

const determinarOctavos = (tablaOctavos) => {
    const botones = document.querySelectorAll('.btn-octavos')
    botones.forEach(pais => {
        pais.addEventListener("click", (e) => {
            const id = e.currentTarget.id
            const [identidad, octavos] = id.split('-')

            tablaOctavos.forEach(partido => {
                partido.forEach( (pais, i) => {
                    if (pais.id === identidad) {
                        let activo = false
                        if (i == 0 && pais.instancia == 'dieciseisAvos') {
                            if (partido[1].instancia == 'dieciseisAvos') {
                                pais.instancia  = 'octavos'
                                activo = true

                            } else {
                                const botonAnterior = document.getElementById(partido[1].id + '-' + octavos)
                                if (botonAnterior) botonAnterior.style.backgroundColor = ''
                                partido[1].instancia = 'dieciseisAvos'
                                pais.instancia = 'octavos'
                                activo = true
                            }

                        } else if (pais.instancia == 'dieciseisAvos' && partido[0].instancia == 'dieciseisAvos') {
                            pais.instancia = 'octavos'
                            activo = true

                        } else {
                            const botonAnterior = document.getElementById(partido[0].id + '-' + octavos)
                            if (botonAnterior) botonAnterior.style.backgroundColor = ''
                            partido[0].instancia = 'dieciseisAvos'
                            pais.instancia = 'octavos'
                            activo = true
                        }
                        if (activo == true) {
                            const boton = document.getElementById(id)
                            boton.style.backgroundColor = 'rgba(174, 174, 132, 0.5)'
                            console.log(pais)
                        }
                    }
                })
            })
            dibujarOctavos(tablaOctavos);
            guardarFaseFinal(tablaOctavos);
        })
    })
    return tablaOctavos;
}

const dibujarOctavos = (tablaOctavos) => {
    let arrayOctavos = []
    let arrayOctavosPartidos = [[],[],[],[],[],[],[],[]]

    tablaOctavos.forEach(partido => {
        partido.forEach(pais => {
            if (pais.instancia !== 'dieciseisAvos'){
                arrayOctavos.push(pais)
            }
        })
    })

    arrayOctavos.forEach((pais) => {
        let div = document.getElementById(`${pais.id}-Octavos`).parentElement;
        const num = parseInt(div.id.split('-')[1])

        if (num % 2 !== 0) {
            const boton = document.getElementById(`clasificado${(num+1)/2}-A`);
            boton.innerHTML = `<img class="flags" src="https://flagcdn.com/w160/${pais.flag}.png"alt="${pais.id}"/>${pais.id}`
            boton.dataset.paisId = pais.id
            arrayOctavosPartidos[((num+1)/2)-1][0] = pais

        } else {
            const boton = document.getElementById(`clasificado${num/2}-B`);
            boton.innerHTML = `<img class="flags" src="https://flagcdn.com/w160/${pais.flag}.png"alt="${pais.id}"/>${pais.id}`
            boton.dataset.paisId = pais.id
            arrayOctavosPartidos[(num/2)-1][1] = pais
        }
    })
    console.log(arrayOctavosPartidos)

    return arrayOctavosPartidos
}

const determinarCuartos = tablaMatches => {
    const botones = document.querySelectorAll(".btn-cuartos")
    botones.forEach(boton => {
        boton.addEventListener("click", (e) => {
            const id = e.currentTarget.id
            const identidad = e.currentTarget.dataset.paisId;
            if (!identidad) return;

            const arrayOctavosPartidos = dibujarOctavos(tablaMatches);

            arrayOctavosPartidos.forEach(partido => {
                partido.forEach((pais, i) => {
                    if (pais && pais.id == identidad) {
                        let activo = false
                        if (i == 0 && pais.instancia == 'octavos') {
                            if (partido[1] && partido[1].instancia == 'octavos') {
                                pais.instancia = 'cuartos'
                                activo = true
                            } else {
                                if (partido[1]) {
                                    const botonAnterior = document.querySelector(`.btn-cuartos[data-pais-id="${partido[1].id}"]`)
                                    if (botonAnterior) botonAnterior.style.backgroundColor = ''
                                    partido[1].instancia = 'octavos'
                                }
                                pais.instancia = 'cuartos'
                                activo = true
                            }
                        } else if (pais.instancia == 'octavos' && partido[0] && partido[0].instancia == 'octavos') {
                            pais.instancia = 'cuartos'
                            activo = true
                        } else {
                            if (partido[0]) {
                                const botonAnterior = document.querySelector(`.btn-cuartos[data-pais-id="${partido[0].id}"]`)
                                if (botonAnterior) botonAnterior.style.backgroundColor = ''
                                partido[0].instancia = 'octavos'
                            }
                            pais.instancia = 'cuartos'
                            activo = true
                        }
                        if (activo) {
                            const button = document.getElementById(id)
                            button.style.backgroundColor = 'rgba(174, 174, 132, 0.5)'
                            console.log(pais)
                        }
                    }
                })
            })
            dibujarCuartos(arrayOctavosPartidos);
            guardarFaseFinal(tablaMatches);
        })
    })
    return tablaMatches;
}

const dibujarCuartos = (arrayOctavosPartidos) => {
    let arrayCuartosPartidos = [[],[],[],[]]

    arrayOctavosPartidos.forEach(partido => {
        partido.forEach(pais => {
            if (pais && pais.instancia !== 'dieciseisAvos' && pais.instancia !== 'octavos') {
                const boton = document.querySelector(`.btn-cuartos[data-pais-id="${pais.id}"]`)
                if (!boton) return
                const div = boton.parentElement
                const num = parseInt(div.id.split('-')[1])

                if (num % 2 !== 0) {
                    const semifinalista = document.getElementById(`semifinalista${(num+1)/2}-A`)
                    semifinalista.innerHTML = `<img class="flags" src="https://flagcdn.com/w160/${pais.flag}.png" alt="${pais.id}"/>${pais.id}`
                    semifinalista.dataset.paisId = pais.id
                    arrayCuartosPartidos[((num+1)/2)-1][0] = pais
                } else {
                    const semifinalista = document.getElementById(`semifinalista${num/2}-B`)
                    semifinalista.innerHTML = `<img class="flags" src="https://flagcdn.com/w160/${pais.flag}.png" alt="${pais.id}"/>${pais.id}`
                    semifinalista.dataset.paisId = pais.id
                    arrayCuartosPartidos[(num/2)-1][1] = pais
                }
            }
        })
    })

    return arrayCuartosPartidos
}

const determinarSemis = (tablaMatches) => {
    const botones = document.querySelectorAll(".btn-semis")
    botones.forEach(boton => {
        boton.addEventListener("click", (e) => {
            const id = e.currentTarget.id
            const identidad = e.currentTarget.dataset.paisId;
            if (!identidad) return;

            const arrayOctavosPartidos = dibujarOctavos(tablaMatches);
            const arrayCuartosPartidos = dibujarCuartos(arrayOctavosPartidos);


            arrayCuartosPartidos.forEach(partido => {
                partido.forEach((pais, i) => {
                    if (pais && pais.id == identidad) {
                        let activo = false
                        if (i == 0 && pais.instancia == 'cuartos') {
                            if (partido[1] && partido[1].instancia == 'cuartos') {
                                pais.instancia = 'semis'
                                activo = true
                            } else {
                                if (partido[1]) {
                                    const botonAnterior = document.querySelector(`.btn-semis[data-pais-id="${partido[1].id}"]`)
                                    if (botonAnterior) botonAnterior.style.backgroundColor = ''
                                    partido[1].instancia = 'cuartos'
                                }
                                pais.instancia = 'semis'
                                activo = true
                            }
                        } else if (pais.instancia == 'cuartos' && partido[0] && partido[0].instancia == 'cuartos') {
                            pais.instancia = 'semis'
                            activo = true
                        } else {
                            if (partido[0]) {
                                const botonAnterior = document.querySelector(`.btn-semis[data-pais-id="${partido[0].id}"]`)
                                if (botonAnterior) botonAnterior.style.backgroundColor = ''
                                partido[0].instancia = 'cuartos'
                            }
                            pais.instancia = 'semis'
                            activo = true
                        }
                        if (activo) {
                            const boton = document.getElementById(id)
                            boton.style.backgroundColor = 'rgba(174, 174, 132, 0.5)'
                        }
                    }
                })
            })
            dibujarSemis(arrayCuartosPartidos);
            guardarFaseFinal(tablaMatches);
        })
    })
    return tablaMatches;
}

const dibujarSemis = (arrayCuartosPartidos) => {
    let arraySemisPartidos = [[], []]

    arrayCuartosPartidos.forEach(partido => {
        partido.forEach(pais => {
            if (pais && pais.instancia !== 'dieciseisAvos' && pais.instancia !== 'cuartos') {
                const boton = document.querySelector(`.btn-semis[data-pais-id="${pais.id}"]`)
                if (!boton) return
                const div = boton.parentElement
                const num = parseInt(div.id.split('-')[1])

                if (num % 2 !== 0) {
                    const finalista = document.getElementById(`finalista${(num + 1) / 2}-A`)
                    finalista.innerHTML = `<img class="flags" src="https://flagcdn.com/w160/${pais.flag}.png" alt="${pais.id}"/>${pais.id}`
                    finalista.dataset.paisId = pais.id
                    arraySemisPartidos[((num + 1) / 2) - 1][0] = pais
                } else {
                    const finalista = document.getElementById(`finalista${num / 2}-B`)
                    finalista.innerHTML = `<img class="flags" src="https://flagcdn.com/w160/${pais.flag}.png" alt="${pais.id}"/>${pais.id}`
                    finalista.dataset.paisId = pais.id
                    arraySemisPartidos[(num / 2) - 1][1] = pais
                }
            }
        })
    })

    return arraySemisPartidos
}

const determinarFinalTercerPuesto = (tablaMatches) => {
    const botones = document.querySelectorAll(".btn-final")
    botones.forEach(boton => {
        boton.addEventListener("click", (e) => {
            const id = e.currentTarget.id
            const identidad = e.currentTarget.dataset.paisId;
            if (!identidad) return;

            const arrayOctavosPartidos = dibujarOctavos(tablaMatches);
            const arrayCuartosPartidos = dibujarCuartos(arrayOctavosPartidos);
            const arraySemisPartidos = dibujarSemis(arrayCuartosPartidos)


            arraySemisPartidos.forEach(partido => {
                partido.forEach((pais, i) => {
                    if (pais && pais.id == identidad) {
                        let activo = false
                        if (i == 0 && pais.instancia == 'semis') {
                            if (partido[1] && partido[1].instancia == 'semis') {
                                pais.instancia = 'final'
                                activo = true
                            } else {
                                if (partido[1]) {
                                    const botonAnterior = document.querySelector(`.btn-final[data-pais-id="${partido[1].id}"]`)
                                    if (botonAnterior) botonAnterior.style.backgroundColor = ''
                                    partido[1].instancia = 'semis'
                                }
                                pais.instancia = 'final'
                                activo = true
                            }
                        } else if (pais.instancia == 'semis' && partido[0] && partido[0].instancia == 'semis') {
                            pais.instancia = 'final'
                            activo = true
                        } else {
                            if (partido[0]) {
                                const botonAnterior = document.querySelector(`.btn-final[data-pais-id="${partido[0].id}"]`)
                                if (botonAnterior) botonAnterior.style.backgroundColor = ''
                                partido[0].instancia = 'semis'
                            }
                            pais.instancia = 'final'
                            activo = true
                        }
                        if (activo) {
                            const boton = document.getElementById(id)
                            boton.style.backgroundColor = 'rgba(174, 174, 132, 0.5)'
                        }
                    }
                })
            })
            dibujarFinalTercerPuesto(arraySemisPartidos);
            guardarFaseFinal(tablaMatches);
        })
    })
    return tablaMatches;
}

const dibujarFinalTercerPuesto = (arraySemisPartidos) => {
    let arrayFinalTercerPuesto = [[], []]

    arraySemisPartidos.forEach(partido => {
        const decidido = partido.some(p => p && (p.instancia === 'final' || p.instancia === 'campeon'))

        partido.forEach(pais => {
            if (pais && (pais.instancia === 'final' || pais.instancia === 'campeon')) {
                const boton = document.querySelector(`.btn-final[data-pais-id="${pais.id}"]`)
                if (!boton) return
                const div = boton.parentElement
                const num = parseInt(div.id.split('-')[1])

                if (num == 1) {
                    const finalista = document.getElementById(`campeon-A`)
                    finalista.innerHTML = `<img class="flags" src="https://flagcdn.com/w160/${pais.flag}.png" alt="${pais.id}"/>${pais.id}`
                    finalista.dataset.paisId = pais.id
                    arrayFinalTercerPuesto[0][0] = pais
                } else {
                    const finalista = document.getElementById(`campeon-B`)
                    finalista.innerHTML = `<img class="flags" src="https://flagcdn.com/w160/${pais.flag}.png" alt="${pais.id}"/>${pais.id}`
                    finalista.dataset.paisId = pais.id
                    arrayFinalTercerPuesto[0][1] = pais
                }

            } else if (decidido && pais && (pais.instancia === 'semis' || pais.instancia === 'tercero')) {
                const button = document.querySelector(`.btn-final[data-pais-id="${pais.id}"]`)
                if (!button) return
                const div = button.parentElement
                const num = parseInt(div.id.split('-')[1])

                if (num == 1) {
                    const tercerCuarto = document.getElementById(`tercerCuarto-A`)
                    tercerCuarto.innerHTML = `<img class="flags" src="https://flagcdn.com/w160/${pais.flag}.png" alt="${pais.id}"/>${pais.id}`
                    tercerCuarto.dataset.paisId = pais.id
                    arrayFinalTercerPuesto[1][0] = pais
                } else {
                    const tercerCuarto = document.getElementById(`tercerCuarto-B`)
                    tercerCuarto.innerHTML = `<img class="flags" src="https://flagcdn.com/w160/${pais.flag}.png" alt="${pais.id}"/>${pais.id}`
                    tercerCuarto.dataset.paisId = pais.id
                    arrayFinalTercerPuesto[1][1] = pais
                }

            }
        })
    })
    return arrayFinalTercerPuesto
}

const determinarCampeonyTercero = (tablaMatches) => {
    const botones = document.querySelectorAll(".btn-campeon")
    const botonesTercero = document.querySelectorAll(".btn-tercero")
    botones.forEach(boton => {
        boton.addEventListener("click", (e) => {
            const id = e.currentTarget.id
            const identidad = e.currentTarget.dataset.paisId;
            if (!identidad) return;

            const arrayOctavosPartidos = dibujarOctavos(tablaMatches);
            const arrayCuartosPartidos = dibujarCuartos(arrayOctavosPartidos);
            const arraySemisPartidos = dibujarSemis(arrayCuartosPartidos);
            const arrayFinalTercerPuesto = dibujarFinalTercerPuesto(arraySemisPartidos);
            console.log(arrayFinalTercerPuesto)

            arrayFinalTercerPuesto.forEach(partido => {
                partido.forEach((pais, i) => {
                    if (pais && pais.id == identidad) {
                        let activo = false
                        if (i == 0 && pais.instancia == 'final') {
                            if (partido[1] && partido[1].instancia == 'final') {
                                pais.instancia = 'campeon'
                                activo = true
                            } else {
                                if (partido[1]) {
                                    const botonAnterior = document.querySelector(`.btn-campeon[data-pais-id="${partido[1].id}"]`)
                                    if (botonAnterior) botonAnterior.style.backgroundColor = ''
                                    partido[1].instancia = 'final'
                                }
                                pais.instancia = 'campeon'
                                activo = true
                            }
                        } else if (pais.instancia == 'final' && partido[0] && partido[0].instancia == 'final') {
                            pais.instancia = 'campeon'
                            activo = true
                        } else {
                            if (partido[0]) {
                                const botonAnterior = document.querySelector(`.btn-campeon[data-pais-id="${partido[0].id}"]`)
                                if (botonAnterior) botonAnterior.style.backgroundColor = ''
                                partido[0].instancia = 'final'
                            }
                            pais.instancia = 'campeon'
                            activo = true
                        }
                        if (activo) {
                            const boton = document.getElementById(id)
                            boton.style.backgroundColor = 'rgba(174, 174, 132, 0.5)'
                        }
                    }
                    console.log(pais, i)
                })
            })
            guardarFaseFinal(tablaMatches);
        })
    })
    botonesTercero.forEach(boton => {
        boton.addEventListener("click", (e) => {
            const id = e.currentTarget.id
            const identidad = e.currentTarget.dataset.paisId;
            if (!identidad) return;

            const arrayOctavosPartidos = dibujarOctavos(tablaMatches);
            const arrayCuartosPartidos = dibujarCuartos(arrayOctavosPartidos);
            const arraySemisPartidos = dibujarSemis(arrayCuartosPartidos);
            const arrayFinalTercerPuesto = dibujarFinalTercerPuesto(arraySemisPartidos);

            arrayFinalTercerPuesto.forEach(partido => {
                partido.forEach((pais, i) => {
                    if (pais && pais.id == identidad) {
                        let activo = false
                        if (i == 0 && pais.instancia == 'semis') {
                            if (partido[1] && partido[1].instancia == 'semis') {
                                pais.instancia = 'tercero'
                                activo = true
                            } else {
                                if (partido[1]) {
                                    const botonAnterior = document.querySelector(`.btn-tercero[data-pais-id="${partido[1].id}"]`)
                                    if (botonAnterior) botonAnterior.style.backgroundColor = ''
                                    partido[1].instancia = 'semis'
                                }
                                pais.instancia = 'tercero'
                                activo = true
                            }
                        } else if (pais.instancia == 'semis' && partido[0] && partido[0].instancia == 'semis') {
                            pais.instancia = 'tercero'
                            activo = true
                        } else {
                            if (partido[0]) {
                                const botonAnterior = document.querySelector(`.btn-tercero[data-pais-id="${partido[0].id}"]`)
                                if (botonAnterior) botonAnterior.style.backgroundColor = ''
                                partido[0].instancia = 'semis'
                            }
                            pais.instancia = 'tercero'
                            activo = true
                        }
                        if (activo) {
                            const boton = document.getElementById(id)
                            boton.style.backgroundColor = 'rgba(174, 174, 132, 0.5)'
                        }
                    }
                })
            })
            guardarFaseFinal(tablaMatches);
        })
    })
    return tablaMatches;
}

const guardarFaseFinal = async (tablaMatches) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    const faseFinal = {};
    tablaMatches.forEach(partido => {
        partido.forEach(pais => {
            faseFinal[pais.id] = { instancia: pais.instancia, posicion: pais.posicion };
        });
    });
    await setDoc(doc(db, "predicciones", userId, "fase_final", "bracket"), faseFinal);
};

const cargarFaseFinalDeFirestore = async (userId, tablaMatches) => {
    const snap = await getDoc(doc(db, "predicciones", userId, "fase_final", "bracket"));
    if (!snap.exists()) return;
    const data = snap.data();
    tablaMatches.forEach(partido => {
        partido.forEach(pais => {
            if (data[pais.id]) pais.instancia = data[pais.id].instancia;
        });
    });
};

const restaurarFaseFinal = (tablaMatches) => {
    const todas = tablaMatches.flat();
    const highlight = 'rgba(174, 174, 132, 0.5)';
    tablaMatches.forEach(partido => {
        partido.forEach(pais => {
            if (pais.instancia !== 'dieciseisAvos') {
                const btn = document.getElementById(`${pais.id}-Octavos`);
                if (btn) btn.style.backgroundColor = highlight;
            }
        });
    });
    const stages = [
        ['.btn-cuartos',  p => p.instancia !== 'dieciseisAvos' && p.instancia !== 'octavos'],
        ['.btn-semis',    p => p.instancia !== 'dieciseisAvos' && p.instancia !== 'octavos' && p.instancia !== 'cuartos'],
        ['.btn-final',    p => p.instancia === 'final' || p.instancia === 'campeon' || p.instancia === 'tercero'],
        ['.btn-campeon',  p => p.instancia === 'campeon'],
        ['.btn-tercero',  p => p.instancia === 'tercero'],
    ];
    stages.forEach(([cls, cond]) => {
        document.querySelectorAll(cls).forEach(btn => {
            const pais = todas.find(p => p && p.id === btn.dataset.paisId);
            if (pais && cond(pais)) btn.style.backgroundColor = highlight;
        });
    });
};

function escalarBracket() {
    const mcard = document.querySelector('.match-cards');
    const factor = window.innerWidth / 1920;
    mcard.style.transformOrigin = 'top center';
    mcard.style.transform = `scale(${factor})`;
}

escalarBracket();
window.addEventListener('resize', escalarBracket);

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "./iniciar_sesion.html";
        return;
    }
    await cargarPrediccionesDeFirestore(user.uid);
    const userDoc = await getDoc(doc(db, "predicciones", user.uid));
    if (userDoc.exists() && userDoc.data().tercerosSeleccion) {
        setTercerosSeleccion(userDoc.data().tercerosSeleccion);
    }
    const { tabla } = ordernarTablaTerceros();
    const tablaOrdenada = obtainTerceros(tabla);
    const tablaMejoresOcho = tablaOrdenada.splice(0, 8);
    const result = tablaCompleta();

    const tablaMatches = firstFase(result, tablaMejoresOcho);
    await cargarFaseFinalDeFirestore(user.uid, tablaMatches);
    dibujarPartidos(tablaMatches);
    determinarOctavos(tablaMatches);
    dibujarOctavos(tablaMatches);
    determinarCuartos(tablaMatches);
    determinarSemis(tablaMatches);
    dibujarSemis(dibujarCuartos(tablaMatches))
    determinarFinalTercerPuesto(tablaMatches)
    dibujarFinalTercerPuesto(dibujarSemis(dibujarCuartos(tablaMatches)))
    determinarCampeonyTercero(tablaMatches)
    restaurarFaseFinal(tablaMatches);
    console.log(tablaMatches)

});
