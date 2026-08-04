/**
 * js/home.js - Dashboard / Home Page Logic for AeroBLOX
 */

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

let currentUserData = null;

async function loadHomeDashboard() {
    const loggedInUser = localStorage.getItem("aeroUser");
    if (!loggedInUser) {
        window.location.href = "login.html";
        return;
    }

    try {
        const { data: user, error } = await _supabase
            .from('users')
            .select('*')
            .eq('username', loggedInUser)
            .single();

        if (error || !user) {
            console.error("Failed to load user data:", error);
            return;
        }

        currentUserData = user;

        const dashGreeting = document.getElementById("dash-greeting");
        if (dashGreeting) dashGreeting.innerText = `Hi, ${user.username}`;

        const homeUsername = document.getElementById("home-username");
        if (homeUsername) homeUsername.innerText = `Hi, ${user.username}`;

        const topRobux = document.getElementById("top-robux-count");
        const dashRobux = document.getElementById("dash-robux-count");
        if (topRobux) topRobux.innerText = user.robux ?? 0;
        if (dashRobux) dashRobux.innerText = user.robux ?? 0;

        const topTickets = document.getElementById("top-tickets-count");
        const dashTickets = document.getElementById("dash-tickets-count");
        if (topTickets) topTickets.innerText = user.tickets ?? 0;
        if (dashTickets) dashTickets.innerText = user.tickets ?? 0;

        const feedDisplay = document.getElementById("feed-display");
        const statusInput = document.getElementById("status-input");
        if (user.status && user.status.trim() !== "") {
            if (feedDisplay) feedDisplay.innerText = `"${user.status}"`;
            if (statusInput) statusInput.value = user.status;
        } else {
            if (feedDisplay) feedDisplay.innerText = '"No status set"';
        }

        const joinDateEl = document.getElementById("dash-join-date");
        if (joinDateEl) {
            joinDateEl.innerText = user.created_at ? new Date(user.created_at).toLocaleDateString() : "8/2/2026";
        }

        const lastOnlineEl = document.getElementById("dash-last-online");
        if (lastOnlineEl) {
            lastOnlineEl.innerText = user.last_online ? new Date(user.last_online).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now";
        }

        const placeVisitsEl = document.getElementById("dash-place-visits");
        if (placeVisitsEl) {
            placeVisitsEl.innerText = user.place_visits ?? 0;
        }

        renderHomeFriends(user);

        // Render Badges Split with Guaranteed Welcome Badge
        renderHomeBadges(user.badges || [], user.created_at);

        renderHomeGamePasses(user.gamepasses || []);

    } catch (err) {
        console.error("Home dashboard load error:", err);
    }
}

/**
 * Ensures "Welcome to AeroBLOX" is always present and renders the lists
 */
function renderHomeBadges(rawBadges, createdAt) {
    const aeroContainer = document.getElementById("dash-aeroblox-badges-container");
    const playerContainer = document.getElementById("dash-player-badges-container");

    const badgeList = [...rawBadges];

    // Check if Welcome badge is present
    const hasWelcome = badgeList.some(b => {
        const name = (typeof b === 'object' && b !== null) ? b.name : b;
        return name === "Welcome to AeroBLOX";
    });

    // If missing, auto-grant in UI
    if (!hasWelcome) {
        badgeList.unshift({
            name: "Welcome to AeroBLOX",
            acquired_at: createdAt || new Date().toISOString()
        });
    }

    const aerobloxBadges = [];
    const playerBadges = [];

    badgeList.forEach(b => {
        const isObj = typeof b === 'object' && b !== null;
        const name = isObj ? (b.name || "Badge") : b;
        
        if (AEROBLOX_SITE_BADGES.includes(name)) {
            aerobloxBadges.push(b);
        } else {
            playerBadges.push(b);
        }
    });

    if (aeroContainer) {
        if (aerobloxBadges.length === 0) {
            aeroContainer.innerHTML = `<p style="font-size: 11px; color: #666; margin: 0;">No AeroBLOX badges earned.</p>`;
        } else {
            aeroContainer.innerHTML = aerobloxBadges.map(b => buildBadgeCardHtml(b, "#fff8c4", "#b88600", "★", createdAt)).join('');
        }
    }

    if (playerContainer) {
        if (playerBadges.length === 0) {
            playerContainer.innerHTML = `<p style="font-size: 11px; color: #666; margin: 0;">No player badges earned yet.</p>`;
        } else {
            playerContainer.innerHTML = playerBadges.map(b => buildBadgeCardHtml(b, "#e1f5fe", "#0288d1", "🏆", createdAt)).join('');
        }
    }
}

function buildBadgeCardHtml(badge, bgColor, textColor, icon, defaultDate) {
    const isObj = typeof badge === 'object' && badge !== null;
    const badgeName = isObj ? (badge.name || "Badge") : badge;
    const dateAcquired = isObj && badge.acquired_at 
        ? new Date(badge.acquired_at).toLocaleDateString() 
        : (defaultDate ? new Date(defaultDate).toLocaleDateString() : "8/2/2026");

    return `
        <div class="item-card">
            <div class="item-thumb" style="background:${bgColor}; font-weight:bold; color:${textColor}; font-size:16px;">${icon}</div>
            <strong style="font-size: 10px; color: #003366; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-top: 2px;" title="${badgeName}">${badgeName}</strong>
            <div style="font-size: 9px; color: #666; margin-top: 4px; border-top: 1px dashed #ccc; padding-top: 3px;">
                Got: <strong>${dateAcquired}</strong>
            </div>
        </div>
    `;
}

function renderHomeGamePasses(passList) {
    const gpContainer = document.getElementById("dash-gamepasses-container");
    if (!gpContainer) return;

    if (passList.length > 0) {
        gpContainer.innerHTML = passList.map(gp => {
            const isObj = typeof gp === 'object' && gp !== null;
            const passName = isObj ? (gp.name || "Game Pass") : gp;
            return `
                <div class="item-card" style="width: 100px;">
                    <div class="item-thumb" style="background:#e8f4f8; font-weight:bold; color:#003366;">PASS</div>
                    <strong style="font-size:10px; color:#003366; display:block; margin-top:2px;">${passName}</strong>
                </div>
            `;
        }).join('');
    } else {
        gpContainer.innerHTML = `<p style="font-size: 11px; color: #666; margin: 0;">No game passes found.</p>`;
    }
}

function renderHomeFriends(user) {
    const bestFriends = user.best_friends || [];
    const friends = user.friends || [];

    // Limit display to max 5 items
    const displayBestFriends = bestFriends.slice(0, 5);
    const displayFriends = friends.slice(0, 5);

    const bfContainer = document.getElementById("dash-best-friends-container");
    if (bfContainer) {
        if (displayBestFriends.length > 0) {
            bfContainer.innerHTML = displayBestFriends.map(bf => `
                <a href="profile.html?user=${encodeURIComponent(bf)}" style="text-decoration:none; color:inherit;">
                    <div style="border:1px solid #e9a838; background:#fffdf5; padding:4px 8px; font-size:11px; font-weight:bold; border-radius:3px; color:#b88600; margin-bottom:4px;">
                        ★ ${bf}
                    </div>
                </a>
            `).join('');
        } else {
            bfContainer.innerHTML = `<p style="font-size: 11px; color: #666; margin: 0;">No best friends listed.</p>`;
        }
    }

    const fTitle = document.getElementById("dash-friends-title");
    if (fTitle) {
        const titleSpan = fTitle.querySelector("span") || fTitle;
        titleSpan.innerText = `Friends (${friends.length})`;
    }

    const fContainer = document.getElementById("dash-friends-container");
    if (fContainer) {
        if (displayFriends.length > 0) {
            fContainer.innerHTML = displayFriends.map(f => `
                <a href="profile.html?user=${encodeURIComponent(f)}" style="text-decoration:none; color:inherit;">
                    <div style="border:1px solid #ccc; background:#f9f9f9; padding:4px 8px; font-size:11px; border-radius:3px; margin-bottom:4px;">
                        👤 ${f}
                    </div>
                </a>
            `).join('');
        } else {
            fContainer.innerHTML = `<p style="font-size: 11px; color: #666; margin: 0;">No friends added yet.</p>`;
        }
    }
}

async function updateStatus() {
    const statusInput = document.getElementById("status-input");
    if (!statusInput) return;

    const newStatus = statusInput.value.trim();
    const loggedInUser = localStorage.getItem("aeroUser");
    if (!loggedInUser) return;

    try {
        const { error } = await _supabase
            .from('users')
            .update({ status: newStatus })
            .eq('username', loggedInUser);

        if (error) {
            alert("Could not update status.");
            return;
        }

        const feedDisplay = document.getElementById("feed-display");
        if (feedDisplay) {
            feedDisplay.innerText = newStatus !== "" ? `"${newStatus}"` : '"No status set"';
        }
        alert("Status updated!");
    } catch (err) {
        console.error("Status update error:", err);
    }
}

window.updateStatus = updateStatus;
document.addEventListener("DOMContentLoaded", loadHomeDashboard);
