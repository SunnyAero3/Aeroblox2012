// --- 1. INITIALIZE SUPABASE ---
const supabaseUrl = 'https://hvxezfwdgskwldcfvtpm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2eGV6ZndkZ3Nrd2xkY2Z2dHBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2NjgzOTMsImV4cCI6MjEwMTI0NDM5M30.YOq9nvgmEszFvfVfYUetSdfcrJGofFuozHSmH57rmXY';
const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

// --- 2. LOGIN FUNCTION ---
async function loginUser() {
    const usernameInput = document.getElementById('username-input');
    const passwordInput = document.getElementById('password-input');
    const statusMsg = document.getElementById('status-message');

    if (!usernameInput || !passwordInput) return;

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
        if (statusMsg) {
            statusMsg.style.color = "red";
            statusMsg.innerText = "Please enter both username and password.";
        }
        return;
    }

    const { data, error } = await _supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .single();

    if (data) {
        localStorage.setItem("aeroUser", username);
        console.log("Login successful!");
        window.location.href = "index.html"; // Send straight to My AeroBLOX dashboard
    } else {
        if (statusMsg) {
            statusMsg.style.color = "red";
            statusMsg.innerText = "Invalid username or password!";
        }
        console.error("Login failed:", error);
    }
}

// --- 3. REGISTER FUNCTION ---
async function registerUser() {
    const usernameInput = document.getElementById('username-input');
    const passwordInput = document.getElementById('password-input');
    const statusMsg = document.getElementById('status-message');

    if (!usernameInput || !passwordInput) return;

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
        if (statusMsg) {
            statusMsg.style.color = "red";
            statusMsg.innerText = "Please enter both username and password.";
        }
        return;
    }

    const { data, error } = await _supabase
        .from('users')
        .insert([{ username: username, password: password, robux: 10, tickets: 100 }]);

    if (error) {
        if (statusMsg) {
            statusMsg.style.color = "red";
            statusMsg.innerText = "Error creating account!";
        }
        console.error("Registration error:", error);
    } else {
        localStorage.setItem("aeroUser", username);
        window.location.href = "index.html"; // Send straight to My AeroBLOX dashboard
    }
}

// --- 4. LOGOUT FUNCTION ---
function logoutUser() {
    localStorage.removeItem("aeroUser");
    console.log("Logged out successfully.");
    window.location.href = "login.html"; // Redirect to login page on logout
}
