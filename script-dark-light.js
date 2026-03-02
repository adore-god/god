// Cookie helpers
function setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + (days*24*60*60*1000));
    document.cookie = name + "=" + encodeURIComponent(value) + 
        ";expires=" + d.toUTCString() + ";path=/";
}

function getCookie(name) {
    return document.cookie
        .split("; ")
        .find(row => row.startsWith(name + "="))
        ?.split("=")[1] || null;
}

// Apply saved preference immediately (NO waiting)
if (getCookie("darkModeDisabled") === "true") {
    document.documentElement.setAttribute("data-theme", "light");
}

// Toggle dark mode
function toggleDarkMode() {
    const html = document.documentElement;
    const isLight = html.getAttribute("data-theme") === "light";

    if (isLight) {
        html.removeAttribute("data-theme");
        setCookie("darkModeDisabled", "false", 30);
    } else {
        html.setAttribute("data-theme", "light");
        setCookie("darkModeDisabled", "true", 30);
    }
}

// Wait only for button
document.addEventListener("DOMContentLoaded", function() {
    const btn = document.getElementById("theme-toggle");
    if (btn) btn.addEventListener("click", toggleDarkMode);
});