// src/lib/supabase.js
// Compatibility layer: gunakan ini bila masih ada modul lama yang mengimpor "./supabase".
// Sumber utama tetap: ./supabaseClient (default export).
import supabase from "./supabaseClient";

export { supabase };
export default supabase;
