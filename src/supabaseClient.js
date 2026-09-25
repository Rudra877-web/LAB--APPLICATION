import { createClient } from "@supabase/supabase-js";

// ============================================================
// Connect to your Supabase project - use ONE of these two ways:
//
// A) Recommended: copy .env.example to a new file named .env in the
//    project root, and fill in the two values there. Then RESTART
//    the dev server (Ctrl+C, then `npm run dev` again) - Vite only
//    reads .env when it starts, not while it's already running.
// B) Or paste them directly into the two constants below instead.
//
// Get both from: Supabase Dashboard > Project Settings > API
//   - Project URL       -> a link like https://xxxxxxxx.supabase.co
//   - anon / public key -> a long string starting with "eyJ..."
// Never use the "service_role" secret key here.
//
// Common mistake that causes "No API key found in request" / 401:
// pasting the key wrapped in quotes in .env, e.g. VITE_SUPABASE_ANON_KEY="eyJ..."
// Don't add quotes - just VITE_SUPABASE_ANON_KEY=eyJ...
// ============================================================
const RAW_URL = import.meta.env.VITE_SUPABASE_URL || "https://YOUR-PROJECT-REF.supabase.co";
const RAW_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "YOUR-ANON-PUBLIC-KEY";

// strip accidental quotes/whitespace around pasted values
function clean(v) {
  return (v || "").trim().replace(/^["']|["']$/g, "");
}

export const SUPABASE_URL = clean(RAW_URL);
export const SUPABASE_ANON_KEY = clean(RAW_KEY);

const urlLooksReal = /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(SUPABASE_URL);
// Supabase has two valid anon/public key formats:
//  - legacy JWT anon key: three dot-separated base64 chunks, starts with "eyJ"
//  - new-style publishable key: starts with "sb_publishable_"
const keyLooksReal =
  /^eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+$/.test(SUPABASE_ANON_KEY) ||
  /^sb_publishable_[a-zA-Z0-9_-]+$/.test(SUPABASE_ANON_KEY);

export const isSupabaseConfigured = urlLooksReal && keyLooksReal;

export const configProblem = !urlLooksReal
  ? "Supabase Project URL galat lag rahi hai. Format aisa hona chahiye: https://xxxxxxxx.supabase.co (extra spaces/quotes hata do)."
  : !keyLooksReal
  ? "Supabase anon key galat ya khaali lag rahi hai. Yeh \"eyJ...\" (purana JWT format) ya \"sb_publishable_...\" (naya format) se shuru honi chahiye, bina quotes ke. .env edit karne ke baad dev server restart (Ctrl+C, phir npm run dev) karna zaroori hai."
  : "";

// If config looks broken, use harmless placeholder values so the client
// doesn't send empty/garbage headers to Supabase (which causes the
// "No API key found" 401 error) - the app will show the setup banner
// instead of firing real requests, since every page checks isSupabaseConfigured
// before querying.
export const supabase = createClient(
  urlLooksReal ? SUPABASE_URL : "https://placeholder.supabase.co",
  keyLooksReal ? SUPABASE_ANON_KEY : "placeholder-key"
);

// Turns raw Supabase/Postgres errors into a message that actually
// tells you what to do next, instead of a cryptic code.
export function friendlyError(error) {
  if (!error) return "";
  const msg = error.message || "";
  const code = error.code || "";

  if (msg.includes("No API key found") || code === "401" || msg.includes("Invalid API key")) {
    return "Supabase apikey request mein sahi se nahi pahunch rahi. .env file mein VITE_SUPABASE_ANON_KEY check karo (quotes mat lagao), phir dev server restart (Ctrl+C, npm run dev) karo.";
  }
  if (code === "42P01" || msg.includes("does not exist") || msg.includes("schema cache") || code === "PGRST205") {
    return "Table database mein nahi mili (\"" + msg + "\"). Supabase SQL Editor mein sql/schema.sql (poora file) run karo - yehi table banayega, phir Table Editor mein check karo ki companies/employee_records dikh rahe hain.";
  }
  if (msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
    return "Supabase se connect nahi ho paya. URL sahi hai ya nahi aur internet connection check karo.";
  }
  if (code === "PGRST301" || msg.toLowerCase().includes("jwt")) {
    return "Supabase key galat lag rahi hai. Project Settings > API se anon public key dobara copy karke paste karo.";
  }
  if (msg.includes("duplicate key")) {
    return "Yeh naam pehle se maujood hai - alag naam try karo.";
  }
  return msg || "Kuch galat ho gaya. Dobara try karein.";
}
