"use strict";

const message = document.getElementById("login-message");

function showMessage(text) {
    if (message) {
        message.textContent = text;
    }
}

showMessage("Login system loaded.");

if (!window.supabase) {
    showMessage("ERROR: Supabase library did not load.");
} else {
    const SUPABASE_URL = "https://cogamcqicefmyedjfvnc.supabase.co";
    const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_JXgkKk5GHMtGQgQFmMO_3Q_NUQQ0qYg";

    const supabase = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );

    const form = document.getElementById("login-form");

    if (!form) {
        showMessage("ERROR: Login form not found.");
    } else {
        form.addEventListener("submit", async (event) => {
            event.preventDefault();

            showMessage("Signing in...");

            const email = document.getElementById("login-email").value.trim();
            const password = document.getElementById("login-password").value;

            const { error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                showMessage("Login error: " + error.message);
                return;
            }

            showMessage("Login successful. Opening CRM...");

            window.location.href = "./";
        });
    }
}
