async function loadPeople() {
    const peopleList = document.getElementById('people-list');

    // Fetch all users from your Supabase 'users' table, newest accounts first
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
        peopleList.innerHTML = ''; // Clear loading text

        // Loop through every user and generate their retro card
        data.forEach(user => {
            const joinDate = user.created_at ? new Date(user.created_at).toLocaleDateString() : "Classic";

            const userCard = document.createElement('div');
            userCard.className = 'module-box';
            userCard.style = 'display: inline-block; width: 140px; margin: 10px; text-align: center; padding: 10px; vertical-align: top; background: #fff;';
            
            userCard.innerHTML = `
                <div style="background: #e9e9e9; width: 100px; height: 100px; margin: 0 auto; border: 1px solid #ccc; display: flex; align-items: center; justify-content: center;">
                    <p style="font-size: 10px; color: #888; margin: 0;">Avatar<br>Coming Soon</p>
                </div>
                <h4 style="margin: 8px 0 2px 0; font-size: 14px; color: #003366; overflow: hidden; text-overflow: ellipsis;">${user.username}</h4>
                <p style="font-size: 10px; color: #555; margin: 0;">Joined: ${joinDate}</p>
            `;
            
            peopleList.appendChild(userCard);
        });
    }
}

// Run as soon as the page loads
document.addEventListener("DOMContentLoaded", loadPeople);
