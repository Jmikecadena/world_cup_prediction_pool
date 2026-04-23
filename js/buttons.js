document.querySelectorAll("[data-href]").forEach(elemento => {
    elemento.addEventListener("click", () => {
        location.href = elemento.dataset.href;
    });
});

document.querySelectorAll(".nav-buttons").forEach(btn => {
    const href = btn.getAttribute("href").replace("./", "");
    if (window.location.pathname.endsWith(href)) {
        btn.classList.add("active");
    }
});

