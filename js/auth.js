// Initialize Supabase Client (Ensure credentials match your project setup)
const SUPABASE_URL = "https://YOUR_SUPABASE_ID.supabase.co";
const SUPABASE_KEY = "YOUR_SUPABASE_ANON_KEY";

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

function getLoggedInUser() {
    return localStorage.getItem("aeroUser");
}

function logoutUser() {
    localStorage.removeItem("aeroUser");
    window.location.href = "login.html";
}

// Global initialization helper
document.addEventListener("DOMContentLoaded", async () => {
    const currentUser = getLoggedInUser();
    const topGreeting = document.getElementById("top-username-display");
    const logoutBtn = document.getElementById("logout-btn");
    const myProfileSubnav = document.getElementById("subnav-my-profile");

    if (currentUser) {
        if (topGreeting) topGreeting.innerText = `Hi, ${currentUser}`;
        if (logoutBtn) logoutBtn.style.display = "inline-block";
        if (myProfileSubnav) myProfileSubnav.href = `profile.html?user=${encodeURIComponent(currentUser)}`;

        // Update 'last_online' timestamp in Supabase
        await _supabase
            .from('users')
            .update({ last_online: new Date().toISOString() })
            .eq('username', currentUser);
    } else {
        if (topGreeting) topGreeting.innerText = "Guest";
        if (logoutBtn) logoutBtn.style.display = "none";
    }
});
