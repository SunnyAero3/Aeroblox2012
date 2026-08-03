async function loadProfile() {
    // 1. Get user parameter from URL (e.g. profile.html?user=SunnyAero)
    const urlParams = new URLSearchParams(window.location.search);
    const targetUsername = urlParams.get('user');

    // Element bindings
    const usernameHeader = document.getElementById("profile-username-header");
    const joinDateEl = document.getElementById("profile-join-date");
    const blurbTitle = document.getElementById("profile-blurb-title");
    const statusText = document.getElementById("profile-status-text");
    const placesTitle = document.getElementById("profile-places-title");
    const placeName = document.getElementById("profile-place-name");

    // Header bar elements for logged-in user viewing the profile
    const loggedInUser = localStorage.getItem("aeroUser");
    const topUsername = document.getElementById("top-username-display");
    const logoutBtn = document.getElementById("logout-btn");
    const topRobux = document.getElementById("top-robux-count");
    const topTickets = document.getElementById("top-tickets-count");

    // Set header bar state if viewer is logged in
    if (loggedInUser) {
        if (topUsername) topUsername.innerText = `Hi, ${loggedInUser}`;
        if (logoutBtn) logoutBtn.style.display = "inline-block";

        // Query logged in viewer currency stats
        const { data: viewerData } = await _supabase
            .from('users')
            .select('robux, tickets')
            .eq('username', loggedInUser)
            .single();

        if (viewerData) {
            if (topRobux) topRobux.innerText = viewerData.robux ?? 10;
            if (topTickets) topTickets.innerText = viewerData.tickets ?? 100;
        }
    }

    // 2. If no user parameter in URL, handle fallback
    if (!targetUsername) {
        if (usernameHeader) usernameHeader.innerText = "User Not Found";
        if (statusText) statusText.innerText = "No user was specified in the URL!";
        return;
    }

    // 3. Query Supabase for target user's profile data
    const { data: user, error } = await _supabase
        .from('users')
        .select('username, status, created_at')
        .eq('username', targetUsername)
        .single();

    if (error || !user) {
        console.error("Profile load error:", error);
        if (usernameHeader) usernameHeader.innerText = "User Not Found";
        if (statusText) statusText.innerText = `The user "${targetUsername}" does not exist.`;
        return;
    }

    // 4. Update Profile Page DOM with user data
    document.title = `AeroBLOX - ${user.username}'s Profile`;
    if (usernameHeader) usernameHeader.innerText = user.username;
    if (blurbTitle) blurbTitle.innerText = `${user.username}'s Status`;
    if (placesTitle) placesTitle.innerText = `${user.username}'s Places`;
    if (placeName) placeName.innerText = `${user.username}'s Place`;

    // Format Join Date
    if (joinDateEl) {
        const joinDate = user.created_at ? new Date(user.created_at).toLocaleDateString() : "Classic";
        joinDateEl.innerText = joinDate;
    }

    // Format Status
    if (statusText) {
        if (user.status && user.status.trim() !== "") {
            statusText.innerText = `"${user.status}"`;
        } else {
            statusText.innerText = "This user hasn't set a status update yet.";
        }
    }
}

document.addEventListener("DOMContentLoaded", loadProfile);
