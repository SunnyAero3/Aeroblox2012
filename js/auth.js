// --- 1. INITIALIZE SUPABASE ---
// REPLACE THESE WITH YOUR ACTUAL SUPABASE URL AND ANON KEY
const supabaseUrl = 'YOUR_SUPABASE_URL_HERE';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY_HERE';
const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

// --- 2. DYNAMIC UI & CONSOLE LOGGING (RUNS ON EVERY PAGE LOAD) ---
document.addEventListener("DOMContentLoaded", () => {
    const loggedInUser = localStorage.getItem("aeroUser");

    const authForms = document.getElementById("auth-forms");
    const logoutBtn = document.getElementById("logout-btn");
    const statusMessage = document.getElementById("status-message");

    if (loggedInUser) {
        // Print active login to console in bright green
        console.log(`%c[AeroBLOX Auth] Logged in as: ${loggedInUser}`, "color: #7ccf3b; font-weight: bold;");
        
        // Hide inputs, show logout button
        if (authForms) authForms.style.display = "none";
        if (logoutBtn) logoutBtn.style.display = "inline-block";
        if (statusMessage) {
            statusMessage.style.color = "green";
            statusMessage.innerText = `Welcome back, ${loggedInUser}!`;
        }
    } else {
        // Print offline status to console in red
        console.log("%c[AeroBLOX Auth] Currently not logged in.", "color: #ff4444; font-weight: bold;");
        
        // Show inputs, hide logout button
        if (authForms) authForms.style.display = "block";
        if (logoutBtn) logoutBtn.style.display = "none";
    }
});

// --- 3. LOGIN FUNCTION ---
async function loginUser() {
    const username = document.getElementById('username-input').value;
    const password = document.getElementById('password-input').value;
    const statusMsg = document.getElementById('status-message');

    // Query Supabase for the user
    const { data, error } = await _supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .single();

    if (data) {
        // Save session locally
        localStorage.setItem("aeroUser", username);
        console.log("Login successful!");
        window.location.reload(); // Refresh to update buttons
    } else {
        statusMsg.style.color = "red";
        statusMsg.innerText = "Invalid username or password!";
        console.error("Login failed.");
    }
}

// --- 4. REGISTER FUNCTION ---
async function registerUser() {
    const username = document.getElementById('username-input').value;
    const password = document.getElementById('password-input').value;
    const statusMsg = document.getElementById('status-message');

    if (!username || !password) {
        statusMsg.innerText = "Please enter both username and password.";
        return;
    }

    // Insert new user into database with 10 Robux and 100 Tickets
    const { data, error } = await _supabase
        .from('users')
        .insert([{ username: username, password: password, robux: 10, tickets: 100 }]);

    if (error) {
        statusMsg.style.color = "red";
        statusMsg.innerText = "Error creating account!";
        console.error(error);
    } else {
        // Log them in immediately after registering
        localStorage.setItem("aeroUser", username);
        window.location.reload();
    }
}

// --- 5. LOGOUT FUNCTION ---
function logoutUser() {
    localStorage.removeItem("aeroUser");
    console.log("Logged out successfully.");
    window.location.reload(); // Refresh page to bring back login boxes
}
