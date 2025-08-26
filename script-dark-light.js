// Cookie helpers
function setCookie(name, value, days) {
    let expires = "";
    if(days) {
        const d = new Date();
        d.setTime(d.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + d.toUTCString();
    }
    document.cookie = name + "=" + value + expires + "; path=/";
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for(let i=0;i<ca.length;i++) {
        let c = ca[i].trim();
        if(c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length);
    }
    return null;
}

// Remove dark mode
function removeDarkMode() {
    document.body.classList.remove("dark-mode");
    setCookie("darkModeDisabled", "true", 30);
}

// Apply preference on load
window.addEventListener("DOMContentLoaded", () => {
    if(getCookie("darkModeDisabled") === "true") {
        document.body.classList.remove("dark-mode");
    }
});

// Optional: attach to a button
document.getElementById("disable-dark-mode").addEventListener("click", removeDarkMode);
