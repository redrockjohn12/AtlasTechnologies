"use strict";

(function () {
  const config = window.ATLAS_SUPABASE_CONFIG || {};
  const valid = Boolean(
    window.supabase?.createClient &&
    typeof config.url === "string" && config.url.startsWith("https://") &&
    typeof config.key === "string" && config.key.length > 20 &&
    !config.key.includes("YOUR_")
  );

  if (!valid) {
    window.atlasSupabase = null;
    return;
  }

  window.atlasSupabase = window.supabase.createClient(config.url, config.key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });
})();
