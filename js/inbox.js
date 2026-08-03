/**
 * js/inbox.js - Messaging System for AeroBLOX
 */

// Load messages based on tab (inbox or sent)
async function loadMessages(type = 'inbox') {
    const currentUser = localStorage.getItem("aeroUser");
    if (!currentUser) return;

    document.getElementById("inbox-view").style.display = "block";
    document.getElementById("compose-view").style.display = "none";
    document.getElementById("inbox-title").innerText = type === 'inbox' ? "My Inbox" : "Sent Messages";

    try {
        let query = _supabase.from('messages').select('*').order('created_at', { ascending: false });
        
        if (type === 'inbox') {
            query = query.eq('receiver', currentUser);
        } else {
            query = query.eq('sender', currentUser);
        }

        const { data: messages, error } = await query;
        if (error) throw error;

        const tbody = document.getElementById("message-list");
        tbody.innerHTML = "";

        if (messages.length === 0) {
            tbody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: #666;">No messages found.</td></tr>`;
            return;
        }

        messages.forEach(msg => {
            const date = new Date(msg.created_at).toLocaleDateString();
            const contact = type === 'inbox' ? msg.sender : msg.receiver;
            const weightClass = (!msg.is_read && type === 'inbox') ? 'unread' : '';

            tbody.innerHTML += `
                <tr class="${weightClass}" onclick="readMessage('${msg.id}')">
                    <td>${contact}</td>
                    <td>${msg.subject}</td>
                    <td>${date}</td>
                </tr>
            `;
        });
    } catch (err) {
        console.error("Error loading messages:", err);
    }
}

// Show Compose UI
function showCompose() {
    document.getElementById("inbox-view").style.display = "none";
    document.getElementById("compose-view").style.display = "block";
}

// Send a Message
async function sendMessage() {
    const sender = localStorage.getItem("aeroUser");
    const receiver = document.getElementById("msg-to").value.trim();
    const subject = document.getElementById("msg-subject").value.trim();
    const body = document.getElementById("msg-body").value.trim();

    if (!receiver || !subject || !body) {
        alert("Please fill out all fields.");
        return;
    }

    try {
        const { error } = await _supabase
            .from('messages')
            .insert([{ sender, receiver, subject, body }]);

        if (error) throw error;
        
        alert("Message sent successfully!");
        document.getElementById("msg-to").value = "";
        document.getElementById("msg-subject").value = "";
        document.getElementById("msg-body").value = "";
        loadMessages('inbox');
        
    } catch (err) {
        console.error("Error sending message:", err);
        alert("Failed to send message.");
    }
}

// Initialize Inbox on load
document.addEventListener("DOMContentLoaded", () => {
    if (window.location.pathname.endsWith("inbox.html")) {
        loadMessages('inbox');
    }
});
