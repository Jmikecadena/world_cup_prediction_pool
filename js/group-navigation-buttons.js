import { cambiarGrupo, grupoActivo } from "./predicts.js";

const dibujarBotones = () => {
    const container = document.querySelector(".groups-nav");

    let botones = '';
    for (let i = 65; i < 77; i++) {
        const letra = String.fromCharCode(i);
        botones += `<button class="btn-grupo" id="btn-grupo-${letra}">${letra}</button>`;
    }
    container.innerHTML = botones;

    for (let i = 65; i < 77; i++) {
        const letra = String.fromCharCode(i);
        document.getElementById(`btn-grupo-${letra}`).addEventListener('click', () => {
            cambiarGrupo(letra);
            actualizarBotonActivo(letra);
        });
    }

    actualizarBotonActivo(grupoActivo);
    actualizarNavActivo()
};

const actualizarBotonActivo = (grupo) => {
    document.querySelectorAll('.btn-grupo').forEach(btn => {
        btn.style.backgroundColor = '';
    });
    const activo = document.getElementById(`btn-grupo-${grupo}`);
    if (activo) {
        activo.style.backgroundColor = 'rgb(135, 116, 61)';
    }
};

const actualizarNavActivo = () => {
    const currentPage = window.location.pathname.split('/').pop();

    document.querySelectorAll('.nav-buttons').forEach(btn => {

        btn.addEventListener("click", (e) => {
            document.querySelectorAll('.nav-buttons').forEach(buton => {
                if (buton === btn) {
                    buton.style.border = "2px solid rgb(135, 116, 61)";
                    if (buton.id === 'grupos') {
                        e.preventDefault();
                    }
                } else {
                    buton.style.border = '';
                }
            });
        });
    });
}

if (typeof document !== 'undefined') {
    dibujarBotones();
}
