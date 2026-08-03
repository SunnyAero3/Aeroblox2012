// Load User Data (Currency, Status, etc.) on Dashboard
async function loadDashboardData() {
    const loggedInUser = localStorage.getItem("aeroUser");

    const topUsername = document.getElementById("top-username-display");
    const greetingHeader = document.getElementById("greeting-header");
    const topRobux = document.getElementById("top-robux-count");
    const topTickets = document.getElementById("top-tickets-count");
    const dashRobux = document.getElementById("dash-robux");
    const dashTickets = document.getElementById("dash-tickets");
    const statusInput = document.getElementById("status-input");
    const feedContainer = document.getElementById("feed-container");

    if (!loggedInUser) return;

    // Update Header Display
    if (topUsername) topUsername.innerText = `Hi, ${loggedInUser}`;
    if (greetingHeader) greetingHeader.innerText = `Hi, ${loggedInUser}`;

    // Query user profile data from Supabase
    const { data: user, error } = await _supabase
        .from('users')
        .select('robux, tickets, status')
        .eq('username', loggedInUser)
        .single();

    if (error) {
        console.error("Error loading dashboard data:", error);
        return;
    }

    if (user) {
        const robuxVal = user.robux !== undefined ? user.robux : 10;
        const ticketsVal = user.tickets !== undefined ? user.tickets : 100;

        if (topRobux) topRobux.innerText = robuxVal;
        if (topTickets) topTickets.innerText = ticketsVal;
        if (dashRobux) dashRobux.innerText = robuxVal;
        if (dashTickets) dashTickets.innerText = ticketsVal;

        if (user.status) {
            if (statusInput) statusInput.value = user.status;
            if (feedContainer) {
                feedContainer.innerHTML = `
                    <div style="border-left: 3px solid #003366; padding-left: 10px; margin-bottom: 10px;">
                        <strong style="color: #003366; font-size: 13px;">${loggedInUser}</strong> 
                        <span style="font-size: 12px; color: #333;">"${user.status}"</span>
                    </div>
                `;
            }
        }
    }
}

// Update User Status in Supabase
async function updateStatus() {
    const loggedInUser = localStorage.getItem("aeroUser");
    const statusInput = document.getElementById("status-input");
    const msg = document.getElementById("status-update-msg");

    if (!loggedInUser) {
        alert("You must be logged in to update your status!");
        return;
    }

    const newStatus = statusInput.value.trim();

    const { error } = await _supabase
        .from('users')
        .update({ status: newStatus })
        .eq('username', loggedInUser);

    if (error) {
        console.error("Error updating status:", error);
        if (msg) {
            msg.style.color = "red";
            msg.innerText = "Failed to update status.";
            msg.style.display = "block";
        }
    } else {
        if (msg) {
            msg.style.color = "green";
            msg.innerText = "Status updated!";
            msg.style.display = "block";
            setTimeout(() => { msg.style.display = "none"; }, 3000);
        }
        loadDashboardData();
    }
}

document.addEventListener("DOMContentLoaded", loadDashboardData);
