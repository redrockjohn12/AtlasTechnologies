"use strict";

const menuToggle = document.getElementById("menu-toggle");
const nav = document.getElementById("main-nav");
const year = document.getElementById("year");

if (menuToggle && nav) {
    menuToggle.addEventListener("click", () => {
        nav.classList.toggle("active");
    });

    nav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            nav.classList.remove("active");
        });
    });
}

if (year) {
    year.textContent = new Date().getFullYear();
}
