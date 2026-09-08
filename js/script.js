// Atlas Technologies
// Main website functionality

const menuToggle = document.getElementById("menuToggle");
const navigation = document.getElementById("navigation");


// Mobile navigation
menuToggle.addEventListener("click", () => {
    navigation.classList.toggle("active");
});


// Close mobile menu after clicking a link
const navigationLinks = navigation.querySelectorAll("a");

navigationLinks.forEach(link => {
    link.addEventListener("click", () => {
        navigation.classList.remove("active");
    });
});


// Contact form
const contactForm = document.getElementById("contactForm");

contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    alert(
        "Thank you for contacting Atlas Technologies! " +
        "Our project team will get back to you soon."
    );

    contactForm.reset();
});


// Simple reveal animation
const sections = document.querySelectorAll(".section");

const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
            }
        });
    },
    {
        threshold: 0.12
    }
);

sections.forEach((section) => {
    observer.observe(section);
});
