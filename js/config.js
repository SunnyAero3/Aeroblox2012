// js/config.js

const SUPABASE_URL = 'https://hvxezfwdgskwldclvlprm.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_bVf9JahB15fNjLlIGIlzeA_FGsRJ6jT';

// Initialize Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
