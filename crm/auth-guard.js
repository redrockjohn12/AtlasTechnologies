"use strict";

document.addEventListener("DOMContentLoaded", async () => {
  const client = window.atlasSupabase;
  if (!client) {
    window.location.replace("login.html");
    return;
  }

  const { data, error } = await client.auth.getSession();
  if (error || !data.session) {
    window.location.replace("login.html");
    return;
  }

  window.ATLAS_SESSION = data.session;
  const emailElement = document.getElementById("user-email");
  if (emailElement) emailElement.textContent = data.session.user.email || "Signed in";

  const logout = document.getElementById("logout-button");
  if (logout) {
    logout.addEventListener("click", async () => {
      logout.disabled = true;
      await client.auth.signOut();
      window.location.replace("login.html");
    });
  }

  client.auth.onAuthStateChange((_event, session) => {
    if (!session) window.location.replace("login.html");
    else window.ATLAS_SESSION = session;
  });
});
