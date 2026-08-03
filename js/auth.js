// --- 1. INITIALIZE SUPABASE ---
// REPLACE THESE WITH YOUR ACTUAL SUPABASE URL AND ANON KEY
const supabaseUrl = 'YOUR_SUPABASE_URL_HERE';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY_HERE';
const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

// --- 2. LOGIN FUNCTION ---
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
        // BRICK 1: Save session locally so the browser remembers you
        localStorage.setItem("aeroUser", username);
        
        console.log("Login successful!");
        statusMsg.style.color = "green";
        statusMsg.innerText = "Login successful!";
    } else {
        statusMsg.style.color = "red";
        statusMsg.innerText = "Invalid username or password!";
        console.error("Login failed.");
    }
}

// --- 3. REGISTER FUNCTION ---
async function registerUser() {
    const username = document.getElementById('username-input').value;
    const password = document.getElementById('password-input').value;
    const statusMsg = document.getElementById('status-message');

    if (!username || !password) {
        statusMsg.innerText = "Please enter both username and password.";
        return;
    }

    // Insert new user into database with starting currency
    const { data, error } = await _supabase
        .from('users')
        .insert([{ username: username, password: password, robux: 10, tickets: 100 }]);

    if (error) {
        statusMsg.style.color = "red";
        statusMsg.innerText = "Error creating account!";
        console.error(error);
    } else {
        // Automatically save their session so they don't have to log in manually right after registering
        localStorage.setItem("aeroUser", username);
        statusMsg.style.color = "green";
        statusMsg.innerText = "Account created and logged in!";
    }
}
