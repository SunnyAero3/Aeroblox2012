/**
 * js/friends.js - Friends & Best Friends System
 */

let currentViewTab = "friends";

// Load friends data for both index.html dashboard and friends.html
async function loadFriendsData() {
    const currentUser = localStorage.getItem("aeroUser");
    if (!currentUser || typeof _supabase === 'undefined') return;

    try {
        const { data: user, error } = await _supabase
            .from('users')
            .select('friends, best_friends')
            .eq('username', currentUser)
            .single();

        if (error) throw error;

        const friends = user.friends || [];
        const bestFriends = user.best_friends || [];

        // Dashboard rendering (index.html)
        if (window.location.pathname.endsWith("index.html") || window.location.pathname === "/") {
            renderFriendsPreview(friends, "dash-friends-container");
            renderFriendsPreview(bestFriends, "dash-best-friends-container");
        }

        // Friends page rendering (friends.html)
        if (window.location.pathname.endsWith("friends.html")) {
            const urlParams = new URLSearchParams(window.location.search);
            const viewParam = urlParams.get('view');
            if (viewParam === 'best') {
                switchFriendsTab('best');
            } else {
                renderFullFriendsList(friends, "My Friends");
            }
        }

    } catch (err) {
        console.error("Error loading friends data:", err);
    }
}

// Render small dashboard preview cards
function renderFriendsPreview(friendArray, containerId) {
    const container = document.getElementById(containerId);
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

// Switch between Friends and Best Friends views on friends.html
async function switchFriendsTab(tabType) {
    currentViewTab = tabType;
    const currentUser = localStorage.getItem("aeroUser");
    
    document.getElementById("tab-friends")?.classList.toggle("active", tabType === 'friends');
    document.getElementById("tab-best-friends")?.classList.toggle("active", tabType === 'best');

    const titleEl = document.getElementById("friends-page-title");
    if (titleEl) titleEl.innerText = tabType === 'best' ? "My Best Friends" : "My Friends";

    try {
        const { data: user } = await _supabase
            .from('users')
            .select('friends, best_friends')
            .eq('username', currentUser)
            .single();

        const list = tabType === 'best' ? (user.best_friends || []) : (user.friends || []);
        renderFullFriendsList(list, titleEl.innerText);
    } catch (err) {
        console.error("Error switching tabs:", err);
    }
}

// Render full grid with messaging shortcut
function renderFullFriendsList(friendArray, title) {
    const container = document.getElementById("friends-page-container");
    if (!container) return;

    if (!friendArray || friendArray.length === 0) {
        container.innerHTML = `<p style="font-size: 11px; color: #666; margin: 0;">No users in this list.</p>`;
        return;
    }

    let html = '<div class="friends-grid">';
    friendArray.forEach(friend => {
        html += `
            <div class="friend-card">
                <div class="friend-thumb">
                    <img src="images/default_avatar.png" alt="Avatar" style="width: 40px; height: 40px;" onerror="this.src='https://via.placeholder.com/40';">
                </div>
                <strong style="color: #003366; display: block; overflow: hidden; text-overflow: ellipsis;">${friend}</strong>
                <a href="messages.html?to=${encodeURIComponent(friend)}" class="btn-msg">Send Message</a>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

// Functional Friend Request handler for people.html
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
        const { data: user } = await _supabase
            .from('users')
            .select('friends')
            .eq('username', currentUser)
            .single();

        let currentFriends = user.friends || [];
        
        if (currentFriends.includes(targetUsername)) {
            alert(`${targetUsername} is already on your friends list!`);
            return;
        }

        currentFriends.push(targetUsername);

        const { error } = await _supabase
            .from('users')
            .update({ friends: currentFriends })
            .eq('username', currentUser);

        if (error) throw error;
        alert(`Successfully added ${targetUsername} as a friend!`);
        
    } catch (err) {
        console.error("Error adding friend:", err);
        alert("Could not add friend.");
    }
}

window.switchFriendsTab = switchFriendsTab;
window.sendFriendRequest = sendFriendRequest;

document.addEventListener("DOMContentLoaded", () => {
    loadFriendsData();
});
