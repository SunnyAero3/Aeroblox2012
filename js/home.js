async function loadDashboardData() {
    const username = localStorage.getItem("aeroUser");
    if (!username) {
        window.location.href = "login.html";
        return;
    }

    // Set greeting
    const topUsername = document.getElementById("top-username-display");
    const dashGreeting = document.getElementById("dash-greeting");
    if (topUsername) topUsername.innerText = `Hi, ${username}`;
    if (dashGreeting) dashGreeting.innerText = `Hi, ${username}`;

    // Update Last Online in database on home load
    await _supabase
        .from('users')
        .update({ last_online: new Date().toISOString() })
        .eq('username', username);

    // Get User Data
    const { data: user, error } = await _supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

    if (error || !user) return;

    // Currency
    const robuxVal = user.robux ?? 10;
    const ticketsVal = user.tickets ?? 100;
    if (document.getElementById("top-robux-count")) document.getElementById("top-robux-count").innerText = robuxVal;
    if (document.getElementById("top-tickets-count")) document.getElementById("top-tickets-count").innerText = ticketsVal;
    if (document.getElementById("dash-robux-count")) document.getElementById("dash-robux-count").innerText = robuxVal;
    if (document.getElementById("dash-tickets-count")) document.getElementById("dash-tickets-count").innerText = ticketsVal;

    // Dates
    if (document.getElementById("dash-join-date")) {
        document.getElementById("dash-join-date").innerText = user.created_at ? new Date(user.created_at).toLocaleDateString() : "Classic";
    }

    // Feed
    if (user.status && user.status.trim() !== "") {
        document.getElementById("feed-display").innerText = `"${user.status}"`;
    }

    // Render Avatar Colors
    const av = user.avatar || { head: "#F5CD2F", torso: "#0D69AC", left_arm: "#F5CD2F", right_arm: "#F5CD2F", left_leg: "#A2A8A8", right_leg: "#A2A8A8" };
    document.getElementById("dash-av-head").style.backgroundColor = av.head;
    document.getElementById("dash-av-torso").style.backgroundColor = av.torso;
    document.getElementById("dash-av-l-arm").style.backgroundColor = av.left_arm;
    document.getElementById("dash-av-r-arm").style.backgroundColor = av.right_arm;
    document.getElementById("dash-av-l-leg").style.backgroundColor = av.left_leg;
    document.getElementById("dash-av-r-leg").style.backgroundColor = av.right_leg;

    // Render Badges
    const badgeContainer = document.getElementById("dash-badges-container");
    const badges = user.badges && user.badges.length > 0 ? user.badges : ["Welcome to AeroBLOX"];
    if (badgeContainer) {
        badgeContainer.innerHTML = badges.map(b => `
            <div class="item-card">
                <div class="item-thumb" style="background: #fff8c4; font-weight: bold; color: #b88600;">★</div>
                <div style="font-weight: bold; overflow: hidden; text-overflow: ellipsis;">${b}</div>
            </div>
        `).join('');
    }
}

async function updateStatus() {
    const username = localStorage.getItem("aeroUser");
    const input = document.getElementById("status-input");
    if (!input || !input.value.trim() || !username) return;

    const newStatus = input.value.trim();

    const { error } = await _supabase
        .from('users')
        .update({ status: newStatus })
        .eq('username', username);

    if (!error) {
        document.getElementById("feed-display").innerText = `"${newStatus}"`;
        input.value = "";
    }
}

document.addEventListener("DOMContentLoaded", loadDashboardData);
