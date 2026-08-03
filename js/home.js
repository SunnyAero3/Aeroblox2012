let currentAvatarColors = { head: "#F5CD2F", torso: "#0D69AC", left_arm: "#F5CD2F", right_arm: "#F5CD2F", left_leg: "#A2A8A8", right_leg: "#A2A8A8" };

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

    // Header & Dashboard Greetings & Currency
    document.getElementById("dash-greeting").innerText = `Hi, ${user.username}`;
    document.getElementById("dash-robux-count").innerText = user.robux ?? 10;
    document.getElementById("dash-tickets-count").innerText = user.tickets ?? 100;
    document.getElementById("top-robux-count").innerText = user.robux ?? 10;
    document.getElementById("top-tickets-count").innerText = user.tickets ?? 100;

    // Dates & Status
    document.getElementById("dash-join-date").innerText = user.created_at ? new Date(user.created_at).toLocaleDateString() : "8/2/2026";
    document.getElementById("dash-last-online").innerText = user.last_online ? new Date(user.last_online).toLocaleString() : "Just now";
    document.getElementById("feed-display").innerText = user.status ? `"${user.status}"` : "No status updates yet!";
    document.getElementById("dash-place-visits").innerText = user.place_visits ?? 0;

    // Apply Avatar Colors
    currentAvatarColors = user.avatar || currentAvatarColors;
    applyAvatarColors("dash-av", currentAvatarColors);

    // Best Friends List
    const bestFriendsContainer = document.getElementById("dash-best-friends-container");
    const bestFriends = user.best_friends || [];
    if (bestFriendsContainer) {
        if (bestFriends.length > 0) {
            bestFriendsContainer.innerHTML = bestFriends.map(bf => `
                <a href="profile.html?user=${encodeURIComponent(bf)}" style="text-decoration:none; color:inherit;">
                    <div style="border:1px solid #e9a838; background:#fffdf5; padding:4px 8px; font-size:11px; font-weight:bold; border-radius:3px; color:#b88600;">
                        ★ ${bf}
                    </div>
                </a>
            `).join('');
        } else {
            bestFriendsContainer.innerHTML = `<p style="font-size: 11px; color: #666; margin: 0;">No best friends listed.</p>`;
        }
    }

    // Friends List
    const friendsContainer = document.getElementById("dash-friends-container");
    const friends = user.friends || [];
    document.getElementById("dash-friends-title").innerText = `Friends (${friends.length})`;
    if (friendsContainer) {
        if (friends.length > 0) {
            friendsContainer.innerHTML = friends.map(f => `
                <a href="profile.html?user=${encodeURIComponent(f)}" style="text-decoration:none; color:inherit;">
                    <div style="border:1px solid #ccc; background:#f9f9f9; padding:4px 8px; font-size:11px; border-radius:3px;">
                        👤 ${f}
                    </div>
                </a>
            `).join('');
        } else {
            friendsContainer.innerHTML = `<p style="font-size: 11px; color: #666; margin: 0;">No friends added.</p>`;
        }
    }

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

    // Game Passes with Timestamps
    const gpContainer = document.getElementById("dash-gamepasses-container");
    const defaultPass = {
        name: "Welcome to AeroBLOX",
        created_at: user.created_at || new Date().toISOString(),
        updated_at: user.created_at || new Date().toISOString(),
        acquired_at: user.created_at || new Date().toISOString()
    };
    const passList = (user.gamepasses && user.gamepasses.length > 0) ? user.gamepasses : [defaultPass];

    if (gpContainer) {
        gpContainer.innerHTML = passList.map(gp => {
            const isObj = typeof gp === 'object' && gp !== null;
            const passName = isObj ? (gp.name || "Game Pass") : gp;
            const dateCreated = isObj && gp.created_at ? new Date(gp.created_at).toLocaleDateString() : "8/2/2026";
            const dateUpdated = isObj && gp.updated_at ? new Date(gp.updated_at).toLocaleDateString() : "8/2/2026";
            const dateAcquired = isObj && gp.acquired_at ? new Date(gp.acquired_at).toLocaleDateString() : "8/2/2026";

            return `
                <div class="gamepass-card">
                    <div class="item-thumb" style="background:#e8f4f8; font-weight:bold; color:#003366; height:50px;">PASS</div>
                    <strong style="font-size:12px; color:#003366; display:block; margin-bottom:4px;">${passName}</strong>
                    <div style="font-size:10px; color:#555; border-top:1px solid #eee; padding-top:4px; line-height:1.5;">
                        <div><strong>Created:</strong> ${dateCreated}</div>
                        <div><strong>Updated:</strong> ${dateUpdated}</div>
                        <div><strong>Acquired:</strong> ${dateAcquired}</div>
                    </div>
                </div>
            `;
        }).join('');
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

// Avatar Helper
function applyAvatarColors(prefix, colors) {
    const head = document.getElementById(`${prefix}-head`);
    const torso = document.getElementById(`${prefix}-torso`);
    const lArm = document.getElementById(`${prefix}-l-arm`);
    const rArm = document.getElementById(`${prefix}-r-arm`);
    const lLeg = document.getElementById(`${prefix}-l-leg`);
    const rLeg = document.getElementById(`${prefix}-r-leg`);

    if (head) head.style.backgroundColor = colors.head;
    if (torso) torso.style.backgroundColor = colors.torso;
    if (lArm) lArm.style.backgroundColor = colors.left_arm;
    if (rArm) rArm.style.backgroundColor = colors.right_arm;
    if (lLeg) lLeg.style.backgroundColor = colors.left_leg;
    if (rLeg) rLeg.style.backgroundColor = colors.right_leg;
}

// Modal Enlargement Functions
function openAvatarModal() {
    const modal = document.getElementById("avatar-modal");
    if (modal) {
        applyAvatarColors("modal-av", currentAvatarColors);
        modal.style.display = "flex";
    }
}

function closeAvatarModal() {
    const modal = document.getElementById("avatar-modal");
    if (modal) modal.style.display = "none";
}

document.addEventListener("DOMContentLoaded", loadDashboard);
