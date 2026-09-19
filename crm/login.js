"use strict";

document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("login-form");
  const status = document.getElementById("login-status");
  const forgot = document.getElementById("forgot-password");
  const warning = document.getElementById("setup-warning");

  const setStatus = (message, type = "") => {
    status.textContent = message;
    status.className = `form-status ${type}`.trim();
  };

  const client = window.atlasSupabase;
  if (!client) {
    warning.hidden = false;
    form.querySelector("button[type=submit]").disabled = true;
    forgot.disabled = true;
    return;
  }

  const { data: sessionData } = await client.auth.getSession();
  if (sessionData.session) {
    window.location.replace("index.html");
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = form.querySelector("button[type=submit]");
    button.disabled = true;
    setStatus("Signing in…");
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) {
      setStatus(error.message || "Unable to sign in.", "error");
      button.disabled = false;
      return;
    }

    setStatus("Login successful. Opening CRM…", "success");
    window.location.replace("index.html");
  });

  forgot.addEventListener("click", async () => {
    const email = document.getElementById("email").value.trim();
    if (!email) {
      setStatus("Enter your email address first.", "error");
      return;
    }
    forgot.disabled = true;
    setStatus("Sending password-reset email…");
    const redirectTo = new URL("login.html", window.location.href).href;
    const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) setStatus(error.message || "Unable to send reset email.", "error");
    else setStatus("If that account exists, a password-reset email has been sent.", "success");
    forgot.disabled = false;
  });
});
