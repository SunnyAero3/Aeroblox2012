async function loadDashboard() {
    const username = localStorage.getItem("aeroUser");

    if (!username) {
        window.location.href = "login.html";
        return;
    }

    const { data: user, error } = await _supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

    if (error || !user) {
        console.error("Failed to fetch user data:", error);
        return;
    }

    // Header & Dashboard Greetings
    document.getElementById("dash-greeting").innerText = `Hi, ${user.username}`;
    document.getElementById("dash-robux-count").innerText = user.robux ?? 10;
    document.getElementById("dash-tickets-count").innerText = user.tickets ?? 100;
    document.getElementById("top-robux-count").innerText = user.robux ?? 10;
    document.getElementById("top-tickets-count").innerText = user.tickets ?? 100;

    // Dates & Status
    document.getElementById("dash-join-date").innerText = user.created_at ? new Date(user.created_at).toLocaleDateString() : "8/2/2026";
    document.getElementById("feed-display").innerText = user.status ? `"${user.status}"` : "No status updates yet!";

    // Apply Avatar Colors
    const colors = user.avatar || { head: "#F5CD2F", torso: "#0D69AC", left_arm: "#F5CD2F", right_arm: "#F5CD2F", left_leg: "#A2A8A8", right_leg: "#A2A8A8" };
    document.getElementById("dash-av-head").style.backgroundColor = colors.head;
    document.getElementById("dash-av-torso").style.backgroundColor = colors.torso;
    document.getElementById("dash-av-l-arm").style.backgroundColor = colors.left_arm;
    document.getElementById("dash-av-r-arm").style.backgroundColor = colors.right_arm;
    document.getElementById("dash-av-l-leg").style.backgroundColor = colors.left_leg;
    document.getElementById("dash-av-r-leg").style.backgroundColor = colors.right_leg;

    // Badges
    const badgeContainer = document.getElementById("dash-badges-container");
    const badges = user.badges && user.badges.length > 0 ? user.badges : ["Welcome to AeroBLOX"];
    if (badgeContainer) {
        badgeContainer.innerHTML = badges.map(b => `
            <div class="item-card">
                <div class="item-thumb" style="background:#fff8c4; font-weight:bold; color:#b88600;">★</div>
                <div style="font-weight:bold; overflow:hidden; text-overflow:ellipsis;">${b}</div>
            </div>
        `).join('');
    }

    // Inventory
    const invContainer = document.getElementById("dash-inventory-container");
    if (invContainer && user.inventory && user.inventory.length > 0) {
        invContainer.innerHTML = user.inventory.map(item => `
            <div class="item-card">
                <div class="item-thumb">Item</div>
                <div>${item}</div>
            </div>
        `).join('');
    }
}

async function updateStatus() {
    const statusInput = document.getElementById("status-input");
    const newStatus = statusInput.value.trim();
    const username = localStorage.getItem("aeroUser");

    if (!newStatus || !username) return;

    const { error } = await _supabase
        .from('users')
        .update({ status: newStatus })
        .eq('username', username);

    if (!error) {
        document.getElementById("feed-display").innerText = `"${newStatus}"`;
        statusInput.value = "";
        alert("Status updated!");
    } else {
        alert("Error updating status.");
    }
}

function goToMyProfile() {
    const username = localStorage.getItem("aeroUser");
    if (username) {
        window.location.href = `profile.html?user=${encodeURIComponent(username)}`;
    }
}

document.addEventListener("DOMContentLoaded", loadDashboard);
