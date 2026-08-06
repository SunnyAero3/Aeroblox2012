/**
 * js/profile.js - Profile Page Logic for AeroBLOX
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

let currentProfileUser = null;

async function loadUserProfile() {
    const urlParams = new URLSearchParams(window.location.search);
    const loggedInUser = localStorage.getItem("aeroUser");
    const targetUsername = urlParams.get('user') || loggedInUser;

    if (!targetUsername) {
        window.location.href = "login.html";
        return;
    }

    try {
        const { data: user, error } = await _supabase
            .from('users')
            .select('*')
            .eq('username', targetUsername)
            .single();

        if (error || !user) {
            console.error("Failed to load profile user:", error);
            return;
        }

        currentProfileUser = user;

        const profileUsername = document.getElementById("profile-username");
        if (profileUsername) profileUsername.innerText = `${user.username}'s Profile`;

        const profileStatus = document.getElementById("profile-status-text");
        if (profileStatus) {
            profileStatus.innerText = user.status && user.status.trim() !== "" 
                ? `"${user.status}"` 
                : '"No status set"';
        }

        const joinDateEl = document.getElementById("profile-join-date");
        if (joinDateEl) {
            joinDateEl.innerText = user.created_at ? new Date(user.created_at).toLocaleDateString() : "8/2/2026";
        }

        const lastOnlineEl = document.getElementById("profile-last-online");
        if (lastOnlineEl) {
            lastOnlineEl.innerText = user.last_online ? new Date(user.last_online).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Offline";
        }

        const placeVisitsEl = document.getElementById("profile-place-visits");
        if (placeVisitsEl) {
            placeVisitsEl.innerText = user.place_visits ?? 0;
        }

        renderOnlineStatus(user.last_online);
        renderProfileFriends(user);
        renderProfileBadges(user.badges || [], user.created_at);
        renderProfileGamePasses(user.gamepasses || []);

        // Show/Hide action buttons based on logged-in user
        const actionsBox = document.getElementById("profile-actions-box");
        if (actionsBox) {
            actionsBox.style.display = (loggedInUser && loggedInUser !== user.username) ? "block" : "none";
        }

    } catch (err) {
        console.error("Profile load error:", err);
    }
}

function renderOnlineStatus(lastOnline) {
    const dot = document.getElementById("status-dot");
    const text = document.getElementById("status-text");
    if (!dot || !text) return;

    const isOnline = lastOnline && (new Date() - new Date(lastOnline)) < 5 * 60 * 1000;
    if (isOnline) {
        dot.className = "status-dot dot-online";
        text.innerText = "Online";
        text.style.color = "#2ecc71";
    } else {
        dot.className = "status-dot dot-offline";
        text.innerText = "Offline";
        text.style.color = "#ff3b30";
    }
}

function renderProfileFriends(user) {
    const bestFriends = user.best_friends || [];
    const friends = user.friends || [];

    // Capped at 5 visible friends to match index.html
    const displayBestFriends = bestFriends.slice(0, 5);
    const displayFriends = friends.slice(0, 5);

    const bfContainer = document.getElementById("best-friends-container");
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

    const fTitle = document.getElementById("friends-title");
    if (fTitle) {
        fTitle.innerHTML = `<span>Friends (${friends.length})</span> <a href="friends.html?user=${encodeURIComponent(user.username)}" style="color:#fff; font-size:10px; font-weight:normal; text-decoration:underline;">See All</a>`;
    }

    const fContainer = document.getElementById("friends-container");
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

function renderProfileBadges(rawBadges, createdAt) {
    const aeroContainer = document.getElementById("aeroblox-badges-container");
    const playerContainer = document.getElementById("player-badges-container");

    const badgeList = [...rawBadges];
    const hasWelcome = badgeList.some(b => ((typeof b === 'object' && b !== null) ? b.name : b) === "Welcome to AeroBLOX");
    if (!hasWelcome) {
        badgeList.unshift({ name: "Welcome to AeroBLOX", acquired_at: createdAt || new Date().toISOString() });
    }

    const aerobloxBadges = [];
    const playerBadges = [];

    badgeList.forEach(b => {
        const name = (typeof b === 'object' && b !== null) ? (b.name || "Badge") : b;
        if (AEROBLOX_SITE_BADGES.includes(name)) aerobloxBadges.push(b);
        else playerBadges.push(b);
    });

    if (aeroContainer) {
        aeroContainer.innerHTML = aerobloxBadges.length === 0 
            ? `<p style="font-size: 11px; color: #666; margin: 0;">No AeroBLOX badges earned.</p>`
            : aerobloxBadges.map(b => buildBadgeCardHtml(b, "#fff8c4", "#b88600", "★", createdAt)).join('');
    }

    if (playerContainer) {
        playerContainer.innerHTML = playerBadges.length === 0 
            ? `<p style="font-size: 11px; color: #666; margin: 0;">No player badges earned yet.</p>`
            : playerBadges.map(b => buildBadgeCardHtml(b, "#e1f5fe", "#0288d1", "🏆", createdAt)).join('');
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

function renderProfileGamePasses(passList) {
    const gpContainer = document.getElementById("gamepasses-container");
    if (!gpContainer) return;

    if (passList.length > 0) {
        gpContainer.innerHTML = passList.map(gp => `
            <div class="item-card" style="width: 100px;">
                <div class="item-thumb" style="background:#e8f4f8; font-weight:bold; color:#003366;">PASS</div>
                <strong style="font-size:10px; color:#003366; display:block; margin-top:2px;">${typeof gp === 'object' ? gp.name : gp}</strong>
            </div>
        `).join('');
    } else {
        gpContainer.innerHTML = `<p style="font-size: 11px; color: #666; margin: 0;">No game passes found.</p>`;
    }
}

function openAvatarModal() {
    const modal = document.getElementById("avatar-modal");
    if (modal) modal.style.display = "flex";
}

function closeAvatarModal() {
    const modal = document.getElementById("avatar-modal");
    if (modal) modal.style.display = "none";
}

window.openAvatarModal = openAvatarModal;
window.closeAvatarModal = closeAvatarModal;
document.addEventListener("DOMContentLoaded", loadUserProfile);
