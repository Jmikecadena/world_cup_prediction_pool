document.querySelectorAll("[data-href]").forEach(elemento => {
    elemento.addEventListener("click", () => {
        location.href = elemento.dataset.href;
    });
});

