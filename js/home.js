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

    // Header & Dashboard Greetings
    const greetingElem = document.getElementById("dash-greeting");
    if (greetingElem) greetingElem.innerText = `Hi, ${user.username}`;
    
    const homeUserElem = document.getElementById("home-username");
    if (homeUserElem) homeUserElem.innerText = `Hi, ${user.username}`;

    // Dynamic Currency Counts (Header & Balance Box)
    const robuxVal = user.robux !== undefined && user.robux !== null ? user.robux : 0;
    const ticketsVal = user.tickets !== undefined && user.tickets !== null ? user.tickets : 0;

    const dashRobux = document.getElementById("dash-robux-count");
    if (dashRobux) dashRobux.innerText = robuxVal;

    const dashTickets = document.getElementById("dash-tickets-count");
    if (dashTickets) dashTickets.innerText = ticketsVal;

    const topRobux = document.getElementById("top-robux-count");
    if (topRobux) topRobux.innerText = robuxVal;

    const topTickets = document.getElementById("top-tickets-count");
    if (topTickets) topTickets.innerText = ticketsVal;

    // Dates & Account Details
    const joinDateElem = document.getElementById("dash-join-date");
    if (joinDateElem) {
        joinDateElem.innerText = user.created_at ? new Date(user.created_at).toLocaleDateString() : "8/2/2026";
    }

    const lastOnlineElem = document.getElementById("dash-last-online");
    if (lastOnlineElem) {
        lastOnlineElem.innerText = user.last_online ? new Date(user.last_online).toLocaleString() : "Just now";
    }

    // My Feed Status Display Fix
    const feedDisplay = document.getElementById("feed-display");
    if (feedDisplay) {
        feedDisplay.innerText = (user.status && user.status.trim() !== "") ? `"${user.status}"` : `"No status set"`;
    }

    const visitsElem = document.getElementById("dash-place-visits");
    if (visitsElem) {
        visitsElem.innerText = user.place_visits ?? 0;
    }

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
                    <div style="border:1px solid #e9a838; background:#fffdf5; padding:4px 8px; font-size:11px; font-weight:bold; border-radius:3px; color:#b88600; margin-bottom:4px;">
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
    const friendsTitle = document.getElementById("dash-friends-title");
    if (friendsTitle) friendsTitle.innerText = `Friends (${friends.length})`;

    if (friendsContainer) {
        if (friends.length > 0) {
            friendsContainer.innerHTML = friends.map(f => `
                <a href="profile.html?user=${encodeURIComponent(f)}" style="text-decoration:none; color:inherit;">
                    <div style="border:1px solid #ccc; background:#f9f9f9; padding:4px 8px; font-size:11px; border-radius:3px; margin-bottom:4px;">
                        👤 ${f}
                    </div>
                </a>
            `).join('');
        } else {
            friendsContainer.innerHTML = `<p style="font-size: 11px; color: #666; margin: 0;">No friends added.</p>`;
        }
    }

    // Badges Container
    const badgeContainer = document.getElementById("dash-badges-container");
    if (badgeContainer) {
        const defaultBadge = {
            name: "Welcome to AeroBLOX",
            acquired_at: user.created_at || new Date().toISOString()
        };
        const badgeList = (user.badges && user.badges.length > 0) ? user.badges : [defaultBadge];

        badgeContainer.innerHTML = badgeList.map(b => {
            const isObj = typeof b === 'object' && b !== null;
            const badgeName = isObj ? (b.name || "Badge") : b;
            const dateAcquired = isObj && b.acquired_at 
                ? new Date(b.acquired_at).toLocaleDateString() 
                : (user.created_at ? new Date(user.created_at).toLocaleDateString() : "8/2/2026");

            return `
                <div class="item-card">
                    <div class="item-thumb" style="background:#fff8c4; font-weight:bold; color:#b88600; font-size: 16px;">★</div>
                    <strong style="font-size: 10px; color: #003366; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${badgeName}">${badgeName}</strong>
                    <div style="font-size: 9px; color: #666; margin-top: 4px; border-top: 1px dashed #ccc; padding-top: 3px;">
                        Got: <strong>${dateAcquired}</strong>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Game Passes Container
    const gpContainer = document.getElementById("dash-gamepasses-container");
    if (gpContainer) {
        const passList = user.gamepasses || [];
        if (passList.length > 0) {
            gpContainer.innerHTML = passList.map(gp => {
                const isObj = typeof gp === 'object' && gp !== null;
                const passName = isObj ? (gp.name || "Game Pass") : gp;
                return `
                    <div class="item-card">
                        <div class="item-thumb" style="background:#e8f4f8; font-weight:bold; color:#003366;">PASS</div>
                        <strong style="font-size:10px; color:#003366; display:block;">${passName}</strong>
                    </div>
                `;
            }).join('');
        } else {
            gpContainer.innerHTML = `<p style="font-size: 11px; color: #666; margin: 0;">No game passes found.</p>`;
        }
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
        const feedDisplay = document.getElementById("feed-display");
        if (feedDisplay) feedDisplay.innerText = `"${newStatus}"`;
        statusInput.value = "";
        alert("Status updated!");
    } else {
        alert("Error updating status.");
    }
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

document.addEventListener("DOMContentLoaded", loadDashboard);
