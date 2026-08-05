/**
 * js/money.js - Money Page Balance Loader
 */

document.addEventListener("DOMContentLoaded", () => {
    loadMoneyPageData();
});

async function loadMoneyPageData() {
    const loggedInUser = localStorage.getItem("aeroUser");

    // 1. Update display name in sidebar
    const navUsernameEl = document.getElementById("nav-username");
    if (navUsernameEl) {
        navUsernameEl.innerText = loggedInUser || "Guest";
    }

    if (!loggedInUser || typeof _supabase === 'undefined') return;

    try {
        // 2. Fetch balance using your 'users' table structure
        const { data: userData, error } = await _supabase
            .from('users')
            .select('robux, tickets')
            .eq('username', loggedInUser)
            .maybeSingle();

        if (error) {
            console.error("Error loading currency balance:", error);
            return;
        }

        if (userData) {
            const robuxEl = document.getElementById("balance-robux");
            const ticketsEl = document.getElementById("balance-tickets");

            if (robuxEl) robuxEl.innerText = userData.robux ?? 0;
            if (ticketsEl) ticketsEl.innerText = userData.tickets ?? 0;
        }
    } catch (err) {
        console.error("Failed to load user money data:", err);
    }
}
