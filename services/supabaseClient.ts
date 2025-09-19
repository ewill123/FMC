import { createClient } from "@supabase/supabase-js";

// replace with your actual Supabase URL and anon key
const SUPABASE_URL = "https://hhlehnfuvzldclhpxaci.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhobGVobmZ1dnpsZGNsaHB4YWNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyNDAzNDgsImV4cCI6MjA3MzgxNjM0OH0.kgZduMIsVxJi32MTEmUUveZnMOiTYyZ_oXrA2Gzjr4o";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
