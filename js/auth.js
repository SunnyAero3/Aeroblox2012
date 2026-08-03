/**
 * js/auth.js - Authentication & Session Handling for AeroBLOX
 */

// Initialize Supabase Client
const SUPABASE_URL = "YOUR_SUPABASE_URL"; // Replace with your actual Supabase URL
const SUPABASE_KEY = "YOUR_SUPABASE_ANON_KEY"; // Replace with your actual Anon Key

if (typeof _supabase === 'undefined' && typeof supabase !== 'undefined') {
    window._supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

// 1. LOGIN HANDLER
async function handleAuth(event) {
    if (event) event.preventDefault();
    
    const usernameInput = document.getElementById("auth-username").value.trim();
    const passwordInput = document.getElementById("auth-password").value.trim();

    if (!usernameInput || !passwordInput) {
        showAuthError("Please fill in both fields.");
        return;
    }

    try {
        // Query user from Supabase 'users' table
        const { data: user, error } = await _supabase
            .from('users')
            .select('*')
            .eq('username', usernameInput)
            .single();

        if (error || !user) {
            showAuthError("Username not found!");
            return;
        }

        // Check password
        if (user.password !== passwordInput) {
            showAuthError("Incorrect password!");
            return;
        }

        // Update last_online timestamp
        await _supabase
            .from('users')
            .update({ last_online: new Date().toISOString() })
            .eq('username', user.username);

        // Store session in localStorage
        localStorage.setItem("aeroUser", user.username);

        // Redirect to index page
        window.location.href = "index.html";
    } catch (err) {
        console.error("Auth error:", err);
        showAuthError("An error occurred during login.");
    }
}

// 2. REGISTER HANDLER
async function handleRegister() {
    const usernameInput = document.getElementById("auth-username").value.trim();
    const passwordInput = document.getElementById("auth-password").value.trim();

    if (!usernameInput || !passwordInput) {
        showAuthError("Please enter a username and password to register.");
        return;
    }

    try {
        // Check if user already exists
        const { data: existingUser } = await _supabase
            .from('users')
            .select('username')
            .eq('username', usernameInput)
            .single();

        if (existingUser) {
            showAuthError("Username is already taken!");
            return;
        }

        // Create new account entry in Supabase
        const newUser = {
            username: usernameInput,
            password: passwordInput,
            created_at: new Date().toISOString(),
            last_online: new Date().toISOString(),
            status: "Hello AeroBLOX!",
            place_visits: 0,
            friends: [],
            best_friends: [],
            badges: [{ name: "Welcome to AeroBLOX", acquired_at: new Date().toISOString() }],
            gamepasses: [],
            inventory: []
        };

        const { error: insertError } = await _supabase
            .from('users')
            .insert([newUser]);

        if (insertError) {
            showAuthError("Could not create account.");
            return;
        }

        // Save session & redirect
        localStorage.setItem("aeroUser", usernameInput);
        window.location.href = "index.html";
    } catch (err) {
        console.error("Register error:", err);
        showAuthError("An error occurred during registration.");
    }
}

// 3. LOGOUT HANDLER
function logoutUser() {
    localStorage.removeItem("aeroUser");
    window.location.href = "login.html";
}

// Helper: Show Error Message on Page
function showAuthError(msg) {
    const errorMsg = document.getElementById("auth-error-msg");
    if (errorMsg) {
        errorMsg.innerText = msg;
        errorMsg.style.display = "block";
    } else {
        alert(msg);
    }
}

// Global scope attachment for inline HTML event attributes (onsubmit/onclick)
window.handleAuth = handleAuth;
window.handleRegister = handleRegister;
window.logoutUser = logoutUser;

// Check Session Guard on Page Load
document.addEventListener("DOMContentLoaded", () => {
    const loggedInUser = localStorage.getItem("aeroUser");
    const isLoginPage = window.location.pathname.endsWith("login.html");

    if (!loggedInUser && !isLoginPage) {
        window.location.href = "login.html";
    } else if (loggedInUser && isLoginPage) {
        window.location.href = "index.html";
    }

    // Update Header Display Name if logged in
    const topUsernameDisplay = document.getElementById("top-username-display");
    if (topUsernameDisplay && loggedInUser) {
        topUsernameDisplay.innerText = `Hi, ${loggedInUser}`;
    }

    const homeUsername = document.getElementById("home-username");
    if (homeUsername && loggedInUser) {
        homeUsername.innerText = `Hi, ${loggedInUser}`;
    }
});
