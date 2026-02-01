(function () {
    var user =JSON.parse(localStorage.getItem('currentUser'));
    if (!user) {
        window.location.href = "index.html";
        return;
    }
    var nameEl = document.getElementById("account-display-name");
    var emailEl = document.getElementById("account-display-email");
    if (nameEl) nameEl.textContent = user.name || "—";
    if (emailEl) emailEl.textContent = user.email || "—";
    var logoutBtn = document.getElementById("account-page-logout");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function () {
            localStorage.removeItem("currentUser");
            window.location.href = "index.html";
        });
    }
})();
