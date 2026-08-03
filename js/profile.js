async function loadProfile() {
    const urlParams = new URLSearchParams(window.location.search);
    const targetUsername = urlParams.get('user');

    if (!targetUsername) return;

    // Supabase Query
    const { data: user, error } = await _supabase
        .from('users')
        .select('*')
        .eq('username', targetUsername)
        .single();

    if (error || !user) {
        document.getElementById("profile-username-header").innerText = "User Not Found";
        return;
    }

    // Basic Text
    document.title = `AeroBLOX - ${user.username}'s Profile`;
    document.getElementById("profile-username-header").innerText = user.username;
    document.getElementById("profile-blurb-title").innerText = `${user.username}'s Status`;
    document.getElementById("profile-places-title").innerText = `${user.username}'s Places`;
    document.getElementById("profile-place-name").innerText = `${user.username}'s Place`;
    document.getElementById("friends-title").innerText = `Friends (${user.friends ? user.friends.length : 0})`;

    // Status
    document.getElementById("profile-status-text").innerText = user.status ? `"${user.status}"` : "No status updates yet.";

    // Dates
    document.getElementById("profile-join-date").innerText = user.created_at ? new Date(user.created_at).toLocaleDateString() : "Classic";
    document.getElementById("profile-last-online").innerText = user.last_online ? new Date(user.last_online).toLocaleString() : "Recently";

    // 1. Render Avatar Colors
    const av = user.avatar || { head: "#F5CD2F", torso: "#0D69AC", left_arm: "#F5CD2F", right_arm: "#F5CD2F", left_leg: "#A2A8A8", right_leg: "#A2A8A8" };
    document.getElementById("av-head").style.backgroundColor = av.head;
    document.getElementById("av-torso").style.backgroundColor = av.torso;
    document.getElementById("av-l-arm").style.backgroundColor = av.left_arm;
    document.getElementById("av-r-arm").style.backgroundColor = av.right_arm;
    document.getElementById("av-l-leg").style.backgroundColor = av.left_leg;
    document.getElementById("av-r-leg").style.backgroundColor = av.right_leg;

    // 2. Render Badges
    const badgeContainer = document.getElementById("badges-container");
    const badges = user.badges && user.badges.length > 0 ? user.badges : ["Welcome to AeroBLOX"];
    badgeContainer.innerHTML = badges.map(b => `
        <div class="item-card">
            <div class="item-thumb" style="background: #fff8c4; font-weight: bold; color: #b88600;">★</div>
            <div style="font-weight: bold; overflow: hidden; text-overflow: ellipsis;">${b}</div>
        </div>
    `).join('');

    // 3. Render Inventory
    const invContainer = document.getElementById("inventory-container");
    if (user.inventory && user.inventory.length > 0) {
        invContainer.innerHTML = user.inventory.map(item => `
            <div class="item-card">
                <div class="item-thumb">Item</div>
                <div>${item}</div>
            </div>
        `).join('');
    }

    // 4. Render Gamepasses
    const gpContainer = document.getElementById("gamepasses-container");
    if (user.gamepasses && user.gamepasses.length > 0) {
        gpContainer.innerHTML = user.gamepasses.map(gp => `
            <div class="item-card">
                <div class="item-thumb" style="background:#e8f4f8;">Pass</div>
                <div>${gp}</div>
            </div>
        `).join('');
    }
}

document.addEventListener("DOMContentLoaded", loadProfile);
