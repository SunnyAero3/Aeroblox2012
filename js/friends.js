/**
 * js/friends.js - Friends, Best Friends, Friend Requests & Friend Removal
 */

let currentViewTab = "friends";
let cachedFriends = [];
let cachedBestFriends = [];
let cachedRequests = [];

// Fetch user data & update counts
async function loadFriendsData() {
    const currentUser = localStorage.getItem("aeroUser");
    if (!currentUser || typeof _supabase === 'undefined') return;

    try {
        const { data: user, error } = await _supabase
            .from('users')
            .select('friends, best_friends, friend_requests')
            .eq('username', currentUser)
            .single();

        if (error) throw error;

        cachedFriends = user.friends || [];
        cachedBestFriends = user.best_friends || [];
        cachedRequests = user.friend_requests || [];

        // Update tab buttons on friends.html
        const tabFriends = document.getElementById("tab-friends");
        const tabBest = document.getElementById("tab-best-friends");
        const tabReq = document.getElementById("tab-requests");

        if (tabFriends) tabFriends.innerText = `My Friends (${cachedFriends.length})`;
        if (tabBest) tabBest.innerText = `My Best Friends (${cachedBestFriends.length})`;
        if (tabReq) tabReq.innerText = `Friend Requests (${cachedRequests.length})`;

        // Dashboard preview rendering (index.html)
        if (window.location.pathname.endsWith("index.html") || window.location.pathname === "/") {
            renderFriendsPreview(cachedFriends, "dash-friends-container", `Friends (${cachedFriends.length})`, "dash-friends-title");
            renderFriendsPreview(cachedBestFriends, "dash-best-friends-container", `Best Friends (${cachedBestFriends.length})`);
        }

        // Render current active tab if on friends.html
        if (window.location.pathname.endsWith("friends.html")) {
            const urlParams = new URLSearchParams(window.location.search);
            const viewParam = urlParams.get('view');
            if (viewParam === 'best') {
                switchFriendsTab('best');
            } else if (viewParam === 'requests') {
                switchFriendsTab('requests');
            } else {
                switchFriendsTab(currentViewTab);
            }
        }

    } catch (err) {
        console.error("Error loading friends data:", err);
    }
}

// Render Dashboard Preview Cards
function renderFriendsPreview(friendArray, containerId, headerText, titleId) {
    const container = document.getElementById(containerId);
    if (titleId && document.getElementById(titleId)) {
        const titleSpan = document.getElementById(titleId).querySelector("span");
        if (titleSpan) titleSpan.innerText = headerText;
    }

    if (!container) return;

    if (!friendArray || friendArray.length === 0) {
        container.innerHTML = `<p style="font-size: 11px; color: #666; margin: 0;">None found.</p>`;
        return;
    }

    let html = '<div class="friends-grid">';
    friendArray.slice(0, 6).forEach(friend => {
        html += `
            <div class="item-card">
                <div class="item-thumb" style="height: 45px;">
                    <img src="images/default_avatar.png" alt="Avatar" style="width: 30px; height: 30px;" onerror="this.src='https://via.placeholder.com/30';">
                </div>
                <strong style="color: #003366; font-size: 10px;">${friend}</strong>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

// Switch Tabs on friends.html
function switchFriendsTab(tabType) {
    currentViewTab = tabType;

    document.getElementById("tab-friends")?.classList.toggle("active", tabType === 'friends');
    document.getElementById("tab-best-friends")?.classList.toggle("active", tabType === 'best');
    document.getElementById("tab-requests")?.classList.toggle("active", tabType === 'requests');

    const titleEl = document.getElementById("friends-page-title");

    if (tabType === 'friends') {
        if (titleEl) titleEl.innerText = `My Friends (${cachedFriends.length})`;
        renderFriendsGrid(cachedFriends);
    } else if (tabType === 'best') {
        if (titleEl) titleEl.innerText = `My Best Friends (${cachedBestFriends.length})`;
        renderFriendsGrid(cachedBestFriends);
    } else if (tabType === 'requests') {
        if (titleEl) titleEl.innerText = `Friend Requests (${cachedRequests.length})`;
        renderRequestsGrid(cachedRequests);
    }
}

// Render Friends and Best Friends grid with "Remove Friend" option
function renderFriendsGrid(list) {
    const container = document.getElementById("friends-page-container");
    if (!container) return;

    if (!list || list.length === 0) {
        container.innerHTML = `<p style="font-size: 11px; color: #666; margin: 0;">No users in this list.</p>`;
        return;
    }

    let html = '<div class="friends-grid">';
    list.forEach(friend => {
        const isBest = cachedBestFriends.includes(friend);
        html += `
            <div class="friend-card">
                <div class="friend-thumb">
                    <img src="images/default_avatar.png" alt="Avatar" style="width: 40px; height: 40px;" onerror="this.src='https://via.placeholder.com/40';">
                </div>
                <strong style="color: #003366; display: block; overflow: hidden; text-overflow: ellipsis; font-size: 11px; width: 100%; white-space: nowrap;">${friend}</strong>
                <a href="messages.html?to=${encodeURIComponent(friend)}" class="btn-action btn-green">Message</a>
                <button onclick="toggleBestFriend('${friend}')" class="btn-action ${isBest ? 'btn-gold' : 'btn-blue'}">
                    ${isBest ? '★ Best Friend' : '+ Best Friend'}
                </button>
                <button onclick="removeFriend('${friend}')" class="btn-action btn-red">Remove</button>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

// Render Pending Friend Requests
function renderRequestsGrid(requests) {
    const container = document.getElementById("friends-page-container");
    if (!container) return;

    if (!requests || requests.length === 0) {
        container.innerHTML = `<p style="font-size: 11px; color: #666; margin: 0;">No pending friend requests.</p>`;
        return;
    }

    let html = '<div class="friends-grid">';
    requests.forEach(requester => {
        html += `
            <div class="friend-card">
                <div class="friend-thumb">
                    <img src="images/default_avatar.png" alt="Avatar" style="width: 40px; height: 40px;" onerror="this.src='https://via.placeholder.com/40';">
                </div>
                <strong style="color: #003366; display: block; overflow: hidden; text-overflow: ellipsis; font-size: 11px; width: 100%; white-space: nowrap;">${requester}</strong>
                <button onclick="acceptFriendRequest('${requester}')" class="btn-action btn-green">Accept</button>
                <button onclick="rejectFriendRequest('${requester}')" class="btn-action btn-red">Reject</button>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

// Send Friend Request from people.html
async function sendFriendRequest(targetUsername) {
    const currentUser = localStorage.getItem("aeroUser");
    if (!currentUser) {
        alert("Please log in first.");
        return;
    }
    if (currentUser === targetUsername) {
        alert("You cannot add yourself as a friend.");
        return;
    }

    try {
        const { data: targetUser, error: fetchErr } = await _supabase
            .from('users')
            .select('friends, friend_requests')
            .eq('username', targetUsername)
            .single();

        if (fetchErr || !targetUser) {
            alert("User not found.");
            return;
        }

        let targetFriends = targetUser.friends || [];
        let targetRequests = targetUser.friend_requests || [];

        if (targetFriends.includes(currentUser)) {
            alert(`You are already friends with ${targetUsername}!`);
            return;
        }

        if (targetRequests.includes(currentUser)) {
            alert(`Friend request already pending for ${targetUsername}.`);
            return;
        }

        targetRequests.push(currentUser);

        const { error: updateErr } = await _supabase
            .from('users')
            .update({ friend_requests: targetRequests })
            .eq('username', targetUsername);

        if (updateErr) throw updateErr;
        alert(`Friend request sent to ${targetUsername}!`);

    } catch (err) {
        console.error("Error sending friend request:", err);
        alert("Could not send friend request.");
    }
}

// Accept Friend Request
async function acceptFriendRequest(requester) {
    const currentUser = localStorage.getItem("aeroUser");
    if (!currentUser) return;

    try {
        let updatedRequests = cachedRequests.filter(name => name !== requester);
        let updatedFriends = [...cachedFriends];
        if (!updatedFriends.includes(requester)) updatedFriends.push(requester);

        const { error: selfErr } = await _supabase
            .from('users')
            .update({ friends: updatedFriends, friend_requests: updatedRequests })
            .eq('username', currentUser);

        if (selfErr) throw selfErr;

        const { data: reqData } = await _supabase
            .from('users')
            .select('friends')
            .eq('username', requester)
            .single();

        let reqFriends = reqData ? (reqData.friends || []) : [];
        if (!reqFriends.includes(currentUser)) reqFriends.push(currentUser);

        await _supabase
            .from('users')
            .update({ friends: reqFriends })
            .eq('username', requester);

        alert(`You are now friends with ${requester}!`);
        loadFriendsData();

    } catch (err) {
        console.error("Error accepting request:", err);
        alert("Failed to accept friend request.");
    }
}

// Reject Friend Request
async function rejectFriendRequest(requester) {
    const currentUser = localStorage.getItem("aeroUser");
    if (!currentUser) return;

    try {
        let updatedRequests = cachedRequests.filter(name => name !== requester);

        const { error } = await _supabase
            .from('users')
            .update({ friend_requests: updatedRequests })
            .eq('username', currentUser);

        if (error) throw error;

        alert(`Friend request from ${requester} rejected.`);
        loadFriendsData();

    } catch (err) {
        console.error("Error rejecting request:", err);
        alert("Failed to reject friend request.");
    }
}

// Toggle Best Friend Status
async function toggleBestFriend(targetUsername) {
    const currentUser = localStorage.getItem("aeroUser");
    if (!currentUser) return;

    try {
        let updatedBest = [...cachedBestFriends];
        if (updatedBest.includes(targetUsername)) {
            updatedBest = updatedBest.filter(name => name !== targetUsername);
        } else {
            updatedBest.push(targetUsername);
        }

        const { error } = await _supabase
            .from('users')
            .update({ best_friends: updatedBest })
            .eq('username', currentUser);

        if (error) throw error;

        loadFriendsData();

    } catch (err) {
        console.error("Error toggling best friend:", err);
        alert("Could not update best friends status.");
    }
}

// Remove Friend (From both current user and target user)
async function removeFriend(targetUsername) {
    const currentUser = localStorage.getItem("aeroUser");
    if (!currentUser) return;

    if (!confirm(`Are you sure you want to remove ${targetUsername} from your friends list?`)) {
        return;
    }

    try {
        // 1. Remove target from current user's friends and best_friends
        let updatedFriends = cachedFriends.filter(name => name !== targetUsername);
        let updatedBest = cachedBestFriends.filter(name => name !== targetUsername);

        const { error: selfErr } = await _supabase
            .from('users')
            .update({ friends: updatedFriends, best_friends: updatedBest })
            .eq('username', currentUser);

        if (selfErr) throw selfErr;

        // 2. Remove current user from target user's friends and best_friends
        const { data: targetData } = await _supabase
            .from('users')
            .select('friends, best_friends')
            .eq('username', targetUsername)
            .single();

        if (targetData) {
            let tFriends = (targetData.friends || []).filter(name => name !== currentUser);
            let tBest = (targetData.best_friends || []).filter(name => name !== currentUser);

            await _supabase
                .from('users')
                .update({ friends: tFriends, best_friends: tBest })
                .eq('username', targetUsername);
        }

        alert(`Removed ${targetUsername} from your friends list.`);
        loadFriendsData();

    } catch (err) {
        console.error("Error removing friend:", err);
        alert("Could not remove friend.");
    }
}

// Expose functions globally for HTML triggers
window.switchFriendsTab = switchFriendsTab;
window.sendFriendRequest = sendFriendRequest;
window.acceptFriendRequest = acceptFriendRequest;
window.rejectFriendRequest = rejectFriendRequest;
window.toggleBestFriend = toggleBestFriend;
window.removeFriend = removeFriend;

document.addEventListener("DOMContentLoaded", () => {
    loadFriendsData();
});
