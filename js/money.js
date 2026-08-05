/**
 * money.js - User Currency Balance & Summary Loader
 */

document.addEventListener("DOMContentLoaded", () => {
    loadUserBalance();
});

async function loadUserBalance() {
    const user = await window.getAuthenticatedUser();
    const userId = user ? user.id : localStorage.getItem("aeroUserId");

    if (!userId) return;

    try {
        const { data, error } = await _supabase
            .from("profiles")
            .select("robux, tickets")
            .eq("id", userId)
            .single();

        if (error) throw error;

        if (data) {
            const robuxEl = document.getElementById("balance-robux");
            const ticketsEl = document.getElementById("balance-tickets");

            if (robuxEl) robuxEl.innerText = data.robux || 0;
            if (ticketsEl) ticketsEl.innerText = data.tickets || 0;
        }
    } catch (err) {
        console.error("Error loading profile currency balance:", err);
    }
}
