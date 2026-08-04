/**
 * js/messages.js - Friend-Only Direct Messaging System using 'friend_messages' table
 */

let userFriendsList = [];

// Initialize Page Data
async function initMessaging() {
    const currentUser = localStorage.getItem("aeroUser");
    if (!currentUser || typeof _supabase === 'undefined') return;

    try {
        // Fetch current user's friends list to enforce lock
        const { data: user, error } = await _supabase
            .from('users')
            .select('friends')
            .eq('username', currentUser)
            .single();

        if (error) throw error;
        userFriendsList = user.friends || [];

        populateRecipientDropdown();
        loadUserMessages();

    } catch (err) {
        console.error("Error initializing messaging system:", err);
    }
}

// Populate recipient menu with friends list ONLY
function populateRecipientDropdown() {
    const selectEl = document.getElementById("msg-recipient-select");
    if (!selectEl) return;

    selectEl.innerHTML = "";

    if (userFriendsList.length === 0) {
        selectEl.innerHTML = `<option value="">No friends found (Add friends first)</option>`;
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const preselectedFriend = urlParams.get('to');

    userFriendsList.forEach(friend => {
        const opt = document.createElement("option");
        opt.value = friend;
        opt.innerText = friend;
        if (preselectedFriend && preselectedFriend === friend) {
            opt.selected = true;
        }
        selectEl.appendChild(opt);
    });
}

// Handle sending direct friend message
async function handleSendMessage(event) {
    if (event) event.preventDefault();

    const sender = localStorage.getItem("aeroUser");
    const recipient = document.getElementById("msg-recipient-select").value.trim();
    const subject = document.getElementById("msg-subject").value.trim();
    const body = document.getElementById("msg-body").value.trim();

    if (!recipient) {
        alert("Select a recipient from your friends list.");
        return;
    }

    // STRICT FRIEND-ONLY CHECK
    if (!userFriendsList.includes(recipient)) {
        alert("Friend-Only Lock: You can only message users on your friends list.");
        return;
    }

    try {
        const { error } = await _supabase
            .from('friend_messages')
            .insert([{
                sender: sender,
                recipient: recipient,
                subject: subject || "No Subject",
                body: body,
                created_at: new Date().toISOString()
            }]);

        if (error) throw error;

        alert(`Message successfully sent to ${recipient}!`);
        document.getElementById("send-msg-form").reset();
        populateRecipientDropdown();
        loadUserMessages();

    } catch (err) {
        console.error("Error sending message:", err);
        alert("Failed to send message.");
    }
}

// Fetch friend conversations involving current user
async function loadUserMessages() {
    const currentUser = localStorage.getItem("aeroUser");
    const container = document.getElementById("messages-list-container");
    if (!container) return;

    try {
        const { data: messages, error } = await _supabase
            .from('friend_messages')
            .select('*')
            .or(`sender.eq.${currentUser},recipient.eq.${currentUser}`)
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (!messages || messages.length === 0) {
            container.innerHTML = `<p style="font-size: 11px; color: #666; margin: 0;">No friend messages found.</p>`;
            return;
        }

        let html = "";
        messages.forEach(msg => {
            const isSender = msg.sender === currentUser;
            const formattedDate = new Date(msg.created_at).toLocaleString();

            html += `
                <div class="msg-item" style="background: ${isSender ? '#f9f9f9' : '#fff'};">
                    <span class="msg-date">${formattedDate}</span>
                    <div class="msg-sender">
                        ${isSender ? `To: <strong>${msg.recipient}</strong>` : `From: <strong>${msg.sender}</strong>`}
                    </div>
                    <div style="font-weight: bold; margin: 2px 0;">${msg.subject}</div>
                    <div style="color: #333; white-space: pre-wrap;">${msg.body}</div>
                </div>
            `;
        });

        container.innerHTML = html;

    } catch (err) {
        console.error("Error loading messages:", err);
        container.innerHTML = `<p style="font-size: 11px; color: red; margin: 0;">Could not load messages.</p>`;
    }
}

window.handleSendMessage = handleSendMessage;

document.addEventListener("DOMContentLoaded", () => {
    initMessaging();
});
