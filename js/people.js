async function loadPeople() {
    const peopleList = document.getElementById('people-list');

    // Load Logged-In viewer data for header
    const loggedInUser = localStorage.getItem("aeroUser");
    const topUsername = document.getElementById("top-username-display");
    const topRobux = document.getElementById("top-robux-count");
    const topTickets = document.getElementById("top-tickets-count");
    const logoutBtn = document.getElementById("logout-btn");

    if (loggedInUser) {
        if (topUsername) topUsername.innerText = `Hi, ${loggedInUser}`;
        if (logoutBtn) logoutBtn.style.display = "inline-block";

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

    // Fetch user list from database
    const { data, error } = await _supabase
        .from('users')
        .select('username, created_at')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error loading people:", error);
        if (peopleList) {
            peopleList.innerHTML = "<p style='color: red; text-align: center;'>Failed to load users from database.</p>";
        }
        return;
    }

    if (peopleList) {
        peopleList.innerHTML = '';

        data.forEach(user => {
            const joinDate = user.created_at ? new Date(user.created_at).toLocaleDateString() : "Classic";

            // Clickable Anchor Wrapping the User Card
            const userLink = document.createElement('a');
            userLink.href = `profile.html?user=${encodeURIComponent(user.username)}`;
            userLink.style = 'text-decoration: none; color: inherit;';

            const userCard = document.createElement('div');
            userCard.className = 'module-box';
            userCard.style = 'display: inline-block; width: 140px; margin: 10px; text-align: center; padding: 10px; vertical-align: top; background: #fff; cursor: pointer; transition: transform 0.1s ease;';
            
            userCard.innerHTML = `
                <div style="background: #e9e9e9; width: 100px; height: 100px; margin: 0 auto; border: 1px solid #ccc; display: flex; align-items: center; justify-content: center;">
                    <p style="font-size: 10px; color: #888; margin: 0;">Avatar<br>Coming Soon</p>
                </div>
                <h4 style="margin: 8px 0 2px 0; font-size: 14px; color: #003366; overflow: hidden; text-overflow: ellipsis;">${user.username}</h4>
                <p style="font-size: 10px; color: #555; margin: 0;">Joined: ${joinDate}</p>
            `;
            
            userLink.appendChild(userCard);
            peopleList.appendChild(userLink);
        });
    }
}

document.addEventListener("DOMContentLoaded", loadPeople);
