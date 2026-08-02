// js/auth.js

document.addEventListener('DOMContentLoaded', () => {
    
    // Sign Up Elements
    const signupUsernameInput = document.getElementById('signup-username');
    const signupPasswordInput = document.getElementById('signup-password');
    const signupBtn = document.getElementById('signup-btn');

    // Login Elements
    const loginUsernameInput = document.getElementById('login-username');
    const loginPasswordInput = document.getElementById('login-password');
    const loginBtn = document.getElementById('login-btn');

    // --- SIGN UP LOGIC ---
    if (signupBtn) {
        signupBtn.addEventListener('click', async () => {
            const username = signupUsernameInput.value.trim();
            const password = signupPasswordInput.value;

            if (!username || !password) {
                alert('Please enter a username and password!');
                return;
            }

            // 1. Check if username is already taken
            const { data: existingUser, error: searchError } = await supabase
                .from('users')
                .select('*')
                .eq('username', username);

            if (existingUser && existingUser.length > 0) {
                alert('That username is already taken. Try another one!');
                return;
            }

            // 2. Create the account (Tickets and Robux default to 100 and 10 automatically)
            const { error } = await supabase
                .from('users')
                .insert([{ username: username, password: password }]);

            if (error) {
                console.error(error);
                alert('Error creating account: ' + error.message);
            } else {
                alert('Account created successfully! You can now log in.');
                signupUsernameInput.value = '';
                signupPasswordInput.value = '';
            }
        });
    }

    // --- LOGIN LOGIC ---
    if (loginBtn) {
        loginBtn.addEventListener('click', async () => {
            const username = loginUsernameInput.value.trim();
            const password = loginPasswordInput.value;

            if (!username || !password) {
                alert('Please enter your username and password!');
                return;
            }

            // Search database for matching username AND password
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('username', username)
                .eq('password', password);

            if (error) {
                console.error(error);
                alert('Database error during login.');
                return;
            }

            if (data && data.length > 0) {
                // Success! Save user data to browser storage
                const loggedInUser = data[0];
                localStorage.setItem('aeroblox_user', JSON.stringify(loggedInUser));
                
                // Send them to the My Character page
                window.location.href = 'my-roblox.html';
            } else {
                alert('Invalid username or password.');
            }
        });
    }
});
