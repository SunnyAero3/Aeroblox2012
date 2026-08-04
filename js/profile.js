/**
 * js/profile.js - Profile Page Logic for AeroBLOX
 */

let currentAvatarColors = { 
    head: "#F5CD2F", 
    torso: "#0D69AC", 
    left_arm: "#F5CD2F", 
    right_arm: "#F5CD2F", 
    left_leg: "#A2A8A8", 
    right_leg: "#A2A8A8" 
};

// Known AeroBLOX site-wide milestone badges
const AEROBLOX_SITE_BADGES = [
    "Welcome to AeroBLOX",
    "Administrator",
    "Veteran",
    "1 Year",
    "2 Years",
    "3 Years",
    "Builders Club",
    "Turbo Builders Club",
    "Outrageous Builders Club"
];

let statusInterval = null;

/**
 * Updates the Online/Offline status UI elements based on last_online timestamp
 */
function updateStatusDisplay(lastOnlineTimestamp) {
    const statusDot = document.getElementById("status-dot");
    const statusText = document.getElementById("status-text");
    
    const lastOnlineTime = lastOnlineTimestamp ? new Date(lastOnlineTimestamp) : null;
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    if (lastOnlineTime && lastOnlineTime > fiveMinutesAgo) {
        if (statusDot) statusDot.className = "status-dot dot-online";
        if (statusText) { 
            statusText.innerText = "Online"; 
            statusText.style.color = "#2ecc71"; 
        }
    } else {
        if (statusDot) statusDot.className = "status-dot dot-offline";
        if (statusText) { 
            statusText.innerText = "Offline"; 
            statusText.style.color = "#ff3b30"; 
        }
    }
}

async function loadUserProfile() {
    const urlParams = new URLSearchParams(window.location.search);
    const targetUsername = urlParams.get("user") || localStorage.getItem("aeroUser");
    const loggedInUser = localStorage.getItem("aeroUser");

    // Display Logged-In User Greeting
    if (loggedInUser) {
        const topGreeting = document.getElementById("top-username-display");
        if (topGreeting) topGreeting.innerText = `Hi, ${loggedInUser}`;
    }

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

    // Set Titles
    document.getElementById("profile-username").innerText = user.username;
    document.title = `AeroBLOX - ${user.username}'s Profile`;
    
    const placesTitle = document.getElementById("places-title");
    if (placesTitle) placesTitle.innerText = `${user.username}'s Places`;

    const profilePlaceName = document.getElementById("profile-place-name");
    if (profilePlaceName) profilePlaceName.innerText = `${user.username}'s Place`;

    // Initial Status Render
    updateStatusDisplay(user.last_online);

    // Live auto-refresh status check every 30 seconds
    if (statusInterval) clearInterval(statusInterval);
    statusInterval = setInterval(async () => {
        const { data: freshUser } = await _supabase
            .from('users')
            .select('last_online')
            .eq('username', targetUsername)
            .single();

        if (freshUser) {
            updateStatusDisplay(freshUser.last_online);
        }
    }, 30 * 1000);

    // Populate Status Text Message Box
    const profileStatusText = document.getElementById("profile-status-text");
    if (profileStatusText) {
        profileStatusText.innerText = user.status && user.status.trim() !== "" 
            ? `"${user.status}"` 
            : '"No status set"';
    }

    // Dates & Place Visits
    const joinDateEl = document.getElementById("profile-join-date");
    if (joinDateEl) {
        joinDateEl.innerText = user.created_at ? new Date(user.created_at).toLocaleDateString() : "8/2/2026";
    }

    const lastOnlineEl = document.getElementById("profile-last-online");
    if (lastOnlineEl) {
        lastOnlineEl.innerText = user.last_online ? new Date(user.last_online).toLocaleString() : "Unknown";
    }

    const placeVisitsEl = document.getElementById("profile-place-visits");
    if (placeVisitsEl) {
        placeVisitsEl.innerText = user.place_visits ?? 0;
    }

    // Profile Interactive Action Buttons Setup
    const actionsBox = document.getElementById("profile-actions-box");
    if (loggedInUser && loggedInUser.toLowerCase() !== targetUsername.toLowerCase()) {
        if (actionsBox) actionsBox.style.display = "block";
        
        const { data: loggedInUserData } = await _supabase
            .from('users')
            .select('friends, best_friends')
            .eq('username', loggedInUser)
            .single();

        const isFriend = (loggedInUserData?.friends || []).includes(user.username);
        const isBestFriend = (loggedInUserData?.best_friends || []).includes(user.username);
        const isPending = (user.friend_requests || []).includes(loggedInUser);

        const actionsContainer = actionsBox?.querySelector(".module-content");
        if (actionsContainer) {
            let friendBtnHtml = `<button id="btn-send-friend" class="btn-classic" style="width: 100%; font-weight: bold;" onclick="sendFriendRequest('${user.username}')">➕ Add Friend</button>`;
            
            if (isFriend) {
                const bfStar = isBestFriend ? "★ Remove Best Friend" : "☆ Make Best Friend";
                friendBtnHtml = `
                    <button class="btn-classic" style="width: 100%; font-weight: bold;" disabled>✔ Friends</button>
                    <button class="btn-classic" style="width: 100%; margin-top: 4px; color: #b88600;" onclick="toggleBestFriend('${user.username}')">${bfStar}</button>
                `;
            } else if (isPending) {
                friendBtnHtml = `<button class="btn-classic" style="width: 100%; font-weight: bold;" disabled>⏳ Pending Request</button>`;
            }

            actionsContainer.innerHTML = `
                ${friendBtnHtml}
                <button class="btn-classic" style="width: 100%; margin-top: 4px;" onclick="sendMessage()">✉️ Send Message</button>
            `;
        }
    } else {
        if (actionsBox) actionsBox.style.display = "none";
    }

    // Avatar Colors
    currentAvatarColors = user.avatar || currentAvatarColors;
    applyAvatarColors("profile-av", currentAvatarColors);

    // Best Friends List Rendering
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

    // Friends List Rendering
    const friendsContainer = document.getElementById("friends-container");
    const friends = user.friends || [];
    const friendsTitle = document.getElementById("friends-title");
    if (friendsTitle) friendsTitle.innerText = `Friends (${friends.length})`;

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

    // Badge Categorization & Rendering
    const defaultBadge = { name: "Welcome to AeroBLOX", acquired_at: user.created_at || new Date().toISOString() };
    const rawBadges = (user.badges && user.badges.length > 0) ? user.badges : [defaultBadge];

    const aerobloxBadges = [];
    const playerBadges = [];

    rawBadges.forEach(b => {
        const isObj = typeof b === 'object' && b !== null;
        const name = isObj ? (b.name || "Badge") : b;
        
        if (AEROBLOX_SITE_BADGES.includes(name)) {
            aerobloxBadges.push(b);
        } else {
            playerBadges.push(b);
        }
    });

    renderBadgeList("aeroblox-badges-container", aerobloxBadges, user, "No AeroBLOX badges earned.");
    renderBadgeList("player-badges-container", playerBadges, user, "No player badges earned yet.");

    // Game Passes Isolation
    const gpContainer = document.getElementById("gamepasses-container");
    const passList = (user.gamepasses && user.gamepasses.length > 0) ? user.gamepasses : [];

    if (gpContainer) {
        if (passList.length > 0) {
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
        } else {
            gpContainer.innerHTML = `<p style="font-size: 11px; color: #666; margin: 0;">No game passes created or owned.</p>`;
        }
    }

    // Inventory Rendering
    const invContainer = document.getElementById("inventory-container");
    if (invContainer) {
        if (user.inventory && user.inventory.length > 0) {
            invContainer.innerHTML = user.inventory.map(item => `
                <div class="item-card">
                    <div class="item-thumb">Item</div>
                    <div>${item}</div>
                </div>
            `).join('');
        } else {
            invContainer.innerHTML = `<p style="font-size: 11px; color: #666; margin: 0;">Inventory is empty.</p>`;
        }
    }
}

function renderBadgeList(containerId, list, user, emptyMessage) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (list.length === 0) {
        container.innerHTML = `<p style="font-size: 11px; color: #666; margin: 0;">${emptyMessage}</p>`;
        return;
    }

    container.innerHTML = list.map(b => {
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

function sendMessage() {
    alert("Messaging feature coming soon!");
}

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
