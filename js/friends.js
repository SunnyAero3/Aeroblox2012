/**
 * js/friends.js - Friends & Best Friends System
 */

// Load friends for the dashboard
async function loadFriends() {
    const currentUser = localStorage.getItem("aeroUser");
    if (!currentUser) return;

    try {
        const { data: user, error } = await _supabase
            .from('users')
            .select('friends, best_friends')
            .eq('username', currentUser)
            .single();

        if (error) throw error;

        renderFriendsList(user.friends, "friends-container");
        renderFriendsList(user.best_friends, "best-friends-container");

    } catch (err) {
        console.error("Error loading friends:", err);
    }
}

// Render HTML for the friends grid
function renderFriendsList(friendArray, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!friendArray || friendArray.length === 0) {
        container.innerHTML = `<p style="font-size: 11px; color: #666; margin: 0;">No friends found.</p>`;
        return;
    }

    let html = '<div class="friends-grid">';
    friendArray.forEach(friend => {
        html += `
            <div class="item-card">
                <div class="item-thumb" style="height: 60px;">
                    <img src="images/default_avatar.png" alt="Avatar" style="width: 40px; height: 40px;">
                </div>
                <strong style="color: #003366;">${friend}</strong>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

// Add a friend (used on people.html)
async function sendFriendRequest(targetUsername) {
    const currentUser = localStorage.getItem("aeroUser");
    if (!currentUser) return;

    try {
        // 1. Fetch current user's friends list
        const { data: user } = await _supabase
            .from('users')
            .select('friends')
            .eq('username', currentUser)
            .single();

        let currentFriends = user.friends || [];
        
        if (currentFriends.includes(targetUsername)) {
            alert(`${targetUsername} is already your friend!`);
            return;
        }

        currentFriends.push(targetUsername);

        // 2. Update Supabase
        const { error } = await _supabase
            .from('users')
            .update({ friends: currentFriends })
            .eq('username', currentUser);

        if (error) throw error;
        alert(`You are now friends with ${targetUsername}!`);
        
    } catch (err) {
        console.error("Error adding friend:", err);
    }
}

// Initialize if on dashboard
document.addEventListener("DOMContentLoaded", () => {
    if (window.location.pathname.endsWith("index.html")) {
        // NOTE: Make sure your index.html has <div id="friends-container"></div> inside the Friends box
        loadFriends();
    }
});
