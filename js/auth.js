// Supabase Project Credentials
const SUPABASE_URL = "https://hvxezfwdgskwldcfvtpm.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2eGV6ZndkZ3Nrd2xkY2Z2dHBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2NjgzOTMsImV4cCI6MjEwMTI0NDM5M30.YOq9nvgmEszFvfVfYUetSdfcrJGofFuozHSmH57rmXY";

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

function getLoggedInUser() {
    return localStorage.getItem("aeroUser");
}

function logoutUser() {
    localStorage.removeItem("aeroUser");
    window.location.href = "login.html";
}

// Login Function
async function loginUser() {
    const usernameInput = document.getElementById("username-input");
    const username = usernameInput ? usernameInput.value.trim() : "";

    if (!username) {
        alert("Please enter a username.");
        return;
    }

    const { data: user, error } = await _supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

    if (error || !user) {
        alert("User not found! Click 'Register' if you need to create an account.");
        return;
    }

    // Save user session & redirect
    localStorage.setItem("aeroUser", user.username);
    window.location.href = "index.html";
}

// Register Function
async function registerUser() {
    const usernameInput = document.getElementById("username-input");
    const username = usernameInput ? usernameInput.value.trim() : "";

    if (!username) {
        alert("Please enter a username to register.");
        return;
    }

    // Insert new user row into Supabase
    const { data, error } = await _supabase
        .from('users')
        .insert([{ username: username }])
        .select();

    if (error) {
        alert("Registration failed: " + error.message);
        return;
    }

    localStorage.setItem("aeroUser", username);
    alert("Account created successfully!");
    window.location.href = "index.html";
}

// Global Header & Online Timestamp Tracker
document.addEventListener("DOMContentLoaded", async () => {
    const currentUser = getLoggedInUser();
    const topGreeting = document.getElementById("top-username-display");
    const logoutBtn = document.getElementById("logout-btn");
    const myProfileSubnav = document.getElementById("subnav-my-profile");

    if (currentUser) {
        if (topGreeting) topGreeting.innerText = `Hi, ${currentUser}`;
        if (logoutBtn) logoutBtn.style.display = "inline-block";
        if (myProfileSubnav) myProfileSubnav.href = `profile.html?user=${encodeURIComponent(currentUser)}`;

        // Update last active status
        await _supabase
            .from('users')
            .update({ last_online: new Date().toISOString() })
            .eq('username', currentUser);
    } else {
        if (topGreeting) topGreeting.innerText = "Guest";
        if (logoutBtn) logoutBtn.style.display = "none";
    }
});
