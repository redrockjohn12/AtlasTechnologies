"use strict";

const SUPABASE_URL = "https://cogamcqicefmyedjfvnc.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_JXgkKk5GHMtGQgQFmMO_3Q_NUQQ0qYg";

const supabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

async function protectCRM() {
    const {
        data: { session },
        error
    } = await supabase.auth.getSession();

    if (error || !session) {
        window.location.replace("./login.html");
        return;
    }

    const script = document.createElement("script");
    script.src = "app.js";
    document.body.appendChild(script);
}

protectCRM();
