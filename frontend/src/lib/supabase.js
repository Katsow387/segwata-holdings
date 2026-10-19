import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Without keys the site still runs in demo mode (no login, mock data).
export const supabaseReady = Boolean(url && key);
export const supabase = supabaseReady ? createClient(url, key) : null;
