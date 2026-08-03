let currentAvatarColors = { head: "#F5CD2F", torso: "#0D69AC", left_arm: "#F5CD2F", right_arm: "#F5CD2F", left_leg: "#A2A8A8", right_leg: "#A2A8A8" };

async function loadProfile() {
    const urlParams = new URLSearchParams(window.location.search);
    let targetUsername = urlParams.get('user');
    const loggedInUser = localStorage.getItem("aeroUser");

    if (!targetUsername) {
        targetUsername = loggedInUser;
    }

    if (!targetUsername) {
        document.getElementById("profile-username-header").innerText = "No User Specified";
        return;
    }

    // Fetch Target Profile from Supabase
    const { data: user, error } = await _supabase
        .from('users')
        .select('*')
        .eq('username', targetUsername)
        .single();

    if (error || !user) {
        document.getElementById("profile-username-header").innerText = "User Not Found";
        return;
    }

    // 1. Show Action Buttons when viewing someone else's profile
    const actionsBox = document.getElementById("profile-actions-box");
    if (loggedInUser && loggedInUser !== targetUsername) {
        if (actionsBox) actionsBox.style.display = "block";
    } else {
        if (actionsBox) actionsBox.style.display = "none";
    }

    // 2. Online/Offline Status Calculation (Active within 5 minutes)
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

    // Titles & Text
    document.title = `AeroBLOX - ${user.username}'s Profile`;
    document.getElementById("profile-username-header").innerText = user.username;
    document.getElementById("profile-blurb-title").innerText = `${user.username}'s Status`;
    document.getElementById("profile-places-title").innerText = `${user.username}'s Places`;
    document.getElementById("profile-place-name").innerText = `${user.username}'s Place`;
    document.getElementById("profile-place-visits").innerText = user.place_visits ?? 0;
    document.getElementById("friends-title").innerText = `Friends (${user.friends ? user.friends.length : 0})`;
    document.getElementById("profile-status-text").innerText = user.status ? `"${user.status}"` : "No status provided yet.";

    // Dates
    document.getElementById("profile-join-date").innerText = user.created_at ? new Date(user.created_at).toLocaleDateString() : "8/2/2026";
    document.getElementById("profile-last-online").innerText = user.last_online ? new Date(user.last_online).toLocaleString() : "Recently";

    // 3. Render Avatar Colors
    currentAvatarColors = user.avatar || currentAvatarColors;
    applyAvatarColors("av", currentAvatarColors);

    // 4. Best Friends List
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

    // 5. Render Badges
    const badgeContainer = document.getElementById("badges-container");
    const badges = user.badges && user.badges.length > 0 ? user.badges : ["Welcome to AeroBLOX"];
    if (badgeContainer) {
        badgeContainer.innerHTML = badges.map(b => `
            <div class="item-card">
                <div class="item-thumb" style="background: #fff8c4; font-weight: bold; color: #b88600;">★</div>
                <div style="font-weight: bold; overflow: hidden; text-overflow: ellipsis;">${b}</div>
            </div>
        `).join('');
    }

    // 6. Render Game Passes (with "Welcome to AeroBLOX" Default & Created/Updated Dates)
    const gpContainer = document.getElementById("gamepasses-container");
    
    const defaultPass = {
        name: "Welcome to AeroBLOX",
        created_at: user.created_at || new Date().toISOString(),
        updated_at: user.created_at || new Date().toISOString(),
        acquired_at: user.created_at || new Date().toISOString()
    };

    const passList = (user.gamepasses && user.gamepasses.length > 0) 
        ? user.gamepasses 
        : [defaultPass];

    if (gpContainer) {
        gpContainer.innerHTML = passList.map(gp => {
            const isObj = typeof gp === 'object' && gp !== null;
            const passName = isObj ? (gp.name || "Game Pass") : gp;
            
            const dateCreated = isObj && gp.created_at 
                ? new Date(gp.created_at).toLocaleDateString() 
                : (user.created_at ? new Date(user.created_at).toLocaleDateString() : "8/2/2026");

            const dateUpdated = isObj && gp.updated_at 
                ? new Date(gp.updated_at).toLocaleDateString() 
                : (user.created_at ? new Date(user.created_at).toLocaleDateString() : "8/2/2026");

            const dateAcquired = isObj && gp.acquired_at 
                ? new Date(gp.acquired_at).toLocaleDateString() 
                : (user.created_at ? new Date(user.created_at).toLocaleDateString() : "8/2/2026");

            return `
                <div class="gamepass-card">
                    <div class="item-thumb" style="background:#e8f4f8; font-weight:bold; color:#003366;">PASS</div>
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

    // 7. Render Inventory
    const invContainer = document.getElementById("inventory-container");
    if (user.inventory && user.inventory.length > 0 && invContainer) {
        invContainer.innerHTML = user.inventory.map(item => `
            <div class="item-card">
                <div class="item-thumb">Item</div>
                <div>${item}</div>
            </div>
        `).join('');
    }
}

// Avatar Helper
function applyAvatarColors(prefix, colors) {
    document.getElementById(`${prefix}-head`).style.backgroundColor = colors.head;
    document.getElementById(`${prefix}-torso`).style.backgroundColor = colors.torso;
    document.getElementById(`${prefix}-l-arm`).style.backgroundColor = colors.left_arm;
    document.getElementById(`${prefix}-r-arm`).style.backgroundColor = colors.right_arm;
    document.getElementById(`${prefix}-l-leg`).style.backgroundColor = colors.left_leg;
    document.getElementById(`${prefix}-r-leg`).style.backgroundColor = colors.right_leg;
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

// Action Handlers
function sendFriendRequest() {
    alert("Friend request feature initialized!");
}

function sendMessage() {
    alert("Private messaging feature initialized!");
}

document.addEventListener("DOMContentLoaded", loadProfile);
