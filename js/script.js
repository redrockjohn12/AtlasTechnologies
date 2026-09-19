"use strict";

const menuToggle = document.getElementById("menu-toggle");
const nav = document.getElementById("main-nav");
const year = document.getElementById("year");
const leadForm = document.getElementById("project-form");
const formStatus = document.getElementById("form-status");

if (year) year.textContent = new Date().getFullYear();

if (menuToggle && nav) {
  menuToggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(open));
  });
  nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  }));
}

const revealItems = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("visible"));
}

const sections = [...document.querySelectorAll("main section[id]")];
const navLinks = [...document.querySelectorAll('#main-nav a[href^="#"]')];
if ("IntersectionObserver" in window && sections.length && navLinks.length) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`));
    });
  }, { rootMargin: "-35% 0px -55% 0px", threshold: 0 });
  sections.forEach((section) => sectionObserver.observe(section));
}

function setStatus(message, type = "") {
  if (!formStatus) return;
  formStatus.textContent = message;
  formStatus.className = `form-status ${type}`.trim();
}

function supabaseReady() {
  return Boolean(window.atlasSupabase && window.atlasSupabase.from && window.ATLAS_SUPABASE_CONFIG?.url && window.ATLAS_SUPABASE_CONFIG?.key);
}

if (leadForm) {
  leadForm.addEventListener("submit", async (event) => {
    const honeypot = leadForm.querySelector('[name="_gotcha"]');
    if (honeypot && honeypot.value.trim()) {
      event.preventDefault();
      setStatus("Thanks.", "success");
      return;
    }

    if (!supabaseReady()) return;

    event.preventDefault();
    const button = leadForm.querySelector("button[type=submit]");
    if (button) {
      button.disabled = true;
      button.dataset.originalText = button.innerHTML;
      button.textContent = "Sending…";
    }
    setStatus("Sending your enquiry…");

    const formData = new FormData(leadForm);
    const payload = {
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      phone: String(formData.get("phone") || "").trim() || null,
      company: String(formData.get("company") || "").trim() || null,
      service: String(formData.get("service") || "").trim() || null,
      budget: String(formData.get("budget") || "").trim() || null,
      subject: String(formData.get("subject") || "").trim(),
      message: String(formData.get("message") || "").trim(),
      source: "website"
    };

    try {
      const { error } = await window.atlasSupabase.from("leads").insert(payload);
      if (error) throw error;
      leadForm.reset();
      setStatus("Your enquiry has been received. Atlas Technologies will contact you soon.", "success");
    } catch (error) {
      console.error("Atlas lead submission failed:", error);
      setStatus("The online enquiry system is temporarily unavailable. Your message will be sent through the backup form instead.", "error");
      leadForm.submit();
      return;
    } finally {
      if (button) {
        button.disabled = false;
        button.innerHTML = button.dataset.originalText || "Send Project Enquiry →";
      }
    }
  });
}
