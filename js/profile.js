let currentAvatarColors = { head: "#F5CD2F", torso: "#0D69AC", left_arm: "#F5CD2F", right_arm: "#F5CD2F", left_leg: "#A2A8A8", right_leg: "#A2A8A8" };

async function loadUserProfile() {
    const urlParams = new URLSearchParams(window.location.search);
    const targetUsername = urlParams.get("user") || localStorage.getItem("aeroUser");

    if (!targetUsername) {
        alert("No user specified!");
        window.location.href = "people.html";
        return;
    }

    const { data: user, error } = await _supabase
        .from('users')
        .select('*')
        .eq('username', targetUsername)
        .single();

    if (error || !user) {
        alert("User profile not found!");
        return;
    }

    // Set User Titles
    document.getElementById("profile-username").innerText = user.username;
    document.title = `AeroBLOX - ${user.username}'s Profile`;
    document.getElementById("places-title").innerText = `${user.username}'s Places`;
    document.getElementById("profile-place-name").innerText = `${user.username}'s Place`;

    // 🟢/🔴 Online Status Calculation (Within 5 minutes = Online)
    const statusDot = document.getElementById("status-dot");
    const statusText = document.getElementById("status-text");
    const lastOnlineTime = user.last_online ? new Date(user.last_online) : null;
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    if (lastOnlineTime && lastOnlineTime > fiveMinutesAgo) {
        if (statusDot) statusDot.className = "status-dot dot-online";
        if (statusText) { statusText.innerText = "Online"; statusText.style.color = "#2ecc71"; }
    } else {
        if (statusDot) statusDot.className = "status-dot dot-offline";
        if (statusText) { statusText.innerText = "Offline"; statusText.style.color = "#777"; }
    }

    // Dates & Place Visits
    document.getElementById("profile-join-date").innerText = user.created_at ? new Date(user.created_at).toLocaleDateString() : "8/2/2026";
    document.getElementById("profile-last-online").innerText = user.last_online ? new Date(user.last_online).toLocaleString() : "Unknown";
    document.getElementById("profile-place-visits").innerText = user.place_visits ?? 0;

    // Show or Hide "Add Friend" & "Send Message" Buttons
    const loggedInUser = localStorage.getItem("aeroUser");
    const actionsBox = document.getElementById("profile-actions-box");
    if (loggedInUser && loggedInUser.toLowerCase() !== targetUsername.toLowerCase()) {
        if (actionsBox) actionsBox.style.display = "block";
    } else {
        if (actionsBox) actionsBox.style.display = "none";
    }

    // Apply Avatar Colors
    currentAvatarColors = user.avatar || currentAvatarColors;
    applyAvatarColors("profile-av", currentAvatarColors);

    // Best Friends List
    const bestFriendsContainer = document.getElementById("best-friends-container");
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
    const friendsContainer = document.getElementById("friends-container");
    const friends = user.friends || [];
    document.getElementById("friends-title").innerText = `Friends (${friends.length})`;
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
            friendsContainer.innerHTML = `<p style="font-size: 11px; color: #666; margin: 0;">No friends added yet.</p>`;
        }
    }

    // Badges (with Acquired Date)
    const badgeContainer = document.getElementById("badges-container");
    const defaultBadge = {
        name: "Welcome to AeroBLOX",
        acquired_at: user.created_at || new Date().toISOString()
    };
    const badgeList = (user.badges && user.badges.length > 0) ? user.badges : [defaultBadge];

    if (badgeContainer) {
        badgeContainer.innerHTML = badgeList.map(b => {
            const isObj = typeof b === 'object' && b !== null;
            const badgeName = isObj ? (b.name || "Badge") : b;
            const dateAcquired = isObj && b.acquired_at 
                ? new Date(b.acquired_at).toLocaleDateString() 
                : (user.created_at ? new Date(user.created_at).toLocaleDateString() : "8/2/2026");

            return `
                <div class="item-card">
                    <div class="item-thumb" style="background:#fff8c4; font-weight:bold; color:#b88600; font-size: 16px;">★</div>
                    <strong style="font-size: 11px; color: #003366; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-top: 2px;" title="${badgeName}">${badgeName}</strong>
                    <div style="font-size: 9px; color: #666; margin-top: 4px; border-top: 1px dashed #ccc; padding-top: 3px;">
                        Got: <strong>${dateAcquired}</strong>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Game Passes with Timestamps
    const gpContainer = document.getElementById("gamepasses-container");
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
    const invContainer = document.getElementById("inventory-container");
    if (invContainer && user.inventory && user.inventory.length > 0) {
        invContainer.innerHTML = user.inventory.map(item => `
            <div class="item-card">
                <div class="item-thumb">Item</div>
                <div>${item}</div>
            </div>
        `).join('');
    }
}

// Interactive Button Placeholders
function sendFriendRequest() {
    alert("Friend request feature coming soon!");
}

function sendMessage() {
    alert("Messaging feature coming soon!");
}

// Avatar Color Helper
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

// Modal Functions
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

document.addEventListener("DOMContentLoaded", loadUserProfile);
