/**
 * js/auth.js - Authentication & Session Handling for AeroBLOX
 */

// Supabase Configuration & Initialization
const SUPABASE_URL = "https://hvxezfwdgskwldcfvtpm.supabase.co"; 
const SUPABASE_KEY = "sb_publishable_bVf9JahB15fNjLlIGIlzeA_FGsRJ6jT"; 

if (typeof _supabase === 'undefined' && typeof supabase !== 'undefined') {
    window._supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

/**
 * Updates the user's last_online timestamp in Supabase every interval
 */
async function sendOnlineHeartbeat() {
    const loggedInUser = localStorage.getItem("aeroUser");
    if (!loggedInUser || typeof _supabase === 'undefined') return;

    try {
        await _supabase
            .from('users')
            .update({ last_online: new Date().toISOString() })
            .eq('username', loggedInUser);
    } catch (err) {
        console.error("Failed to update online status heartbeat:", err);
    }
}

/**
 * Checks session and updates top bar header elements (Username, Robux, Tickets)
 */
async function checkAuth() {
    const loggedInUser = localStorage.getItem("aeroUser");
    const isLoginPage = window.location.pathname.endsWith("login.html");

    if (!loggedInUser && !isLoginPage) {
        window.location.href = "login.html";
        return;
    } else if (loggedInUser && isLoginPage) {
        window.location.href = "index.html";
        return;
    }

    if (!loggedInUser) return;

    // 1. Update Username Greeting across all element ID variations
    const dashGreeting = document.getElementById("dash-greeting");
    const topUsernameDisplay = document.getElementById("top-username-display");
    const homeUsername = document.getElementById("home-username");

    if (dashGreeting) dashGreeting.innerText = `Hi, ${loggedInUser}`;
    if (topUsernameDisplay) topUsernameDisplay.innerText = `Hi, ${loggedInUser}`;
    if (homeUsername) homeUsername.innerText = `Hi, ${loggedInUser}`;

    // 2. Fetch Robux & Tickets from Supabase
    if (typeof _supabase !== 'undefined') {
        try {
            const { data: userData, error } = await _supabase
                .from('users')
                .select('*')
                .eq('username', loggedInUser)
                .maybeSingle();

            if (error) {
                console.error("Supabase error loading user data:", error);
                return;
            }

            if (userData) {
                const robuxEl = document.getElementById("top-robux-count");
                const tixEl = document.getElementById("top-tickets-count");

                // Strictly use the database column names 'robux' and 'tickets'
                const robuxVal = userData.robux ?? 10;
                const ticketsVal = userData.tickets ?? 100;

                if (robuxEl) robuxEl.innerText = robuxVal;
                if (tixEl) tixEl.innerText = ticketsVal;
            }
        } catch (err) {
            console.error("Error fetching user currency:", err);
        }
    }
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
        const { data: user, error } = await _supabase
            .from('users')
            .select('*')
            .eq('username', usernameInput)
            .maybeSingle();

        if (error || !user) {
            showAuthError("Username not found!");
            return;
        }

        if (user.password !== passwordInput) {
            showAuthError("Incorrect password!");
            return;
        }

        await _supabase
            .from('users')
            .update({ last_online: new Date().toISOString() })
            .eq('username', user.username);

        localStorage.setItem("aeroUser", user.username);
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
        const { data: existingUser } = await _supabase
            .from('users')
            .select('username')
            .eq('username', usernameInput)
            .maybeSingle();

        if (existingUser) {
            showAuthError("Username is already taken!");
            return;
        }

        const now = new Date().toISOString();

        // Standardized new account object strictly using 'tickets'
        const newUser = {
            username: usernameInput,
            password: passwordInput,
            robux: 10,
            tickets: 100, // Matching the Supabase column directly
            created_at: now,
            last_online: now,
            status: "Hello AeroBLOX!",
            place_visits: 0,
            friends: [],
            best_friends: [],
            badges: [
                { name: "Welcome to AeroBLOX", acquired_at: now }
            ],
            gamepasses: [],
            inventory: []
        };

        const { error: insertError } = await _supabase
            .from('users')
            .insert([newUser]);

        if (insertError) {
            console.error("Supabase Insert Error:", insertError);
            showAuthError(`Could not create account: ${insertError.message}`);
            return;
        }

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

// Global scope attachment
window.handleAuth = handleAuth;
window.handleRegister = handleRegister;
window.logoutUser = logoutUser;
window.checkAuth = checkAuth;
window.updateTopBar = checkAuth;

// Check Session Guard on Page Load
document.addEventListener("DOMContentLoaded", () => {
    checkAuth();

    const loggedInUser = localStorage.getItem("aeroUser");
    if (loggedInUser) {
        sendOnlineHeartbeat();
        setInterval(sendOnlineHeartbeat, 2 * 60 * 1000);
    }
});
