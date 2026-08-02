// js/config.js

const SUPABASE_URL = 'https://hvxezfwdgskwldcfvtpm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2eGV6ZndkZ3Nrd2xkY2Z2dHBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2NjgzOTMsImV4cCI6MjEwMTI0NDM5M30.YOq9nvgmEszFvfVfYUetSdfcrJGofFuozHSmH57rmXY';

// Initialize Supabase client with a unique name
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
