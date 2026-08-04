/**
 * js/inbox.js - Messaging System for AeroBLOX
 */

let currentTab = 'inbox';
let cachedMessages = [];

/**
 * Switch tabs (Inbox vs Sent)
 */
function switchTab(type) {
    currentTab = type;

    // Update Sidebar Active Styles
    const tabInbox = document.getElementById("tab-inbox");
    const tabSent = document.getElementById("tab-sent");
    const tabCompose = document.getElementById("tab-compose");

    if (tabInbox) tabInbox.classList.toggle("active", type === 'inbox');
    if (tabSent) tabSent.classList.toggle("active", type === 'sent');
    if (tabCompose) tabCompose.classList.remove("active");

    loadMessages(type);
}

/**
 * Load messages based on active tab ('inbox' or 'sent')
 */
async function loadMessages(type = 'inbox') {
    const currentUser = localStorage.getItem("aeroUser");
    if (!currentUser) return;

    // Hide other views, show inbox list
    document.getElementById("inbox-view").style.display = "block";
    document.getElementById("read-view").style.display = "none";
    document.getElementById("compose-view").style.display = "none";

    document.getElementById("inbox-title").innerText = type === 'inbox' ? "My Inbox" : "Sent Messages";
    document.getElementById("col-contact-header").innerText = type === 'inbox' ? "From" : "To";

    try {
        let query = _supabase.from('messages').select('*').order('created_at', { ascending: false });
        
        if (type === 'inbox') {
            query = query.eq('receiver', currentUser);
        } else {
            query = query.eq('sender', currentUser);
        }

        const { data: messages, error } = await query;
        if (error) throw error;

        cachedMessages = messages || [];
        const tbody = document.getElementById("message-list");
        tbody.innerHTML = "";

        if (cachedMessages.length === 0) {
            tbody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: #666; padding: 15px;">No messages found.</td></tr>`;
            return;
        }

        cachedMessages.forEach(msg => {
            const date = msg.created_at ? new Date(msg.created_at).toLocaleDateString() : 'N/A';
            const contact = type === 'inbox' ? msg.sender : msg.receiver;
            const isUnread = (!msg.is_read && type === 'inbox');
            const weightClass = isUnread ? 'unread' : '';

            tbody.innerHTML += `
                <tr class="${weightClass}" onclick="readMessage('${msg.id}')">
                    <td style="font-weight: ${isUnread ? 'bold' : 'normal'};">${contact}</td>
                    <td style="font-weight: ${isUnread ? 'bold' : 'normal'};">${escapeHtml(msg.subject || 'No Subject')}</td>
                    <td style="color: #666;">${date}</td>
                </tr>
            `;
        });
    } catch (err) {
        console.error("Error loading messages:", err);
        const tbody = document.getElementById("message-list");
        if (tbody) tbody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: red;">Failed to load messages.</td></tr>`;
    }
}

/**
 * Display a selected message & mark as read
 */
async function readMessage(messageId) {
    const msg = cachedMessages.find(m => String(m.id) === String(messageId));
    if (!msg) return;

    document.getElementById("inbox-view").style.display = "none";
    document.getElementById("compose-view").style.display = "none";
    document.getElementById("read-view").style.display = "block";

    document.getElementById("read-subject").innerText = msg.subject || "No Subject";
    document.getElementById("read-sender").innerText = msg.sender || "Unknown";
    document.getElementById("read-receiver").innerText = msg.receiver || "Unknown";
    document.getElementById("read-date").innerText = msg.created_at ? new Date(msg.created_at).toLocaleString() : "N/A";
    document.getElementById("read-body").innerText = msg.body || "";

    // Set up Reply button handler
    const replyBtn = document.getElementById("reply-btn");
    if (replyBtn) {
        replyBtn.onclick = () => {
            const replySubject = msg.subject.startsWith("Re:") ? msg.subject : `Re: ${msg.subject}`;
            showCompose(msg.sender, replySubject);
        };
    }

    // Mark as read in Supabase if current user is receiver and msg is unread
    const currentUser = localStorage.getItem("aeroUser");
    if (msg.receiver === currentUser && !msg.is_read) {
        msg.is_read = true;
        try {
            await _supabase
                .from('messages')
                .update({ is_read: true })
                .eq('id', msg.id);
        } catch (err) {
            console.error("Error updating message read status:", err);
        }
    }
}

/**
 * Show Compose UI (Optionally with prefilled recipient and subject)
 */
function showCompose(recipient = '', subject = '') {
    document.getElementById("inbox-view").style.display = "none";
    document.getElementById("read-view").style.display = "none";
    document.getElementById("compose-view").style.display = "block";

    const tabInbox = document.getElementById("tab-inbox");
    const tabSent = document.getElementById("tab-sent");
    const tabCompose = document.getElementById("tab-compose");

    if (tabInbox) tabInbox.classList.remove("active");
    if (tabSent) tabSent.classList.remove("active");
    if (tabCompose) tabCompose.classList.add("active");

    if (recipient) document.getElementById("msg-to").value = recipient;
    if (subject) document.getElementById("msg-subject").value = subject;
}

/**
 * Send a Message
 */
async function sendMessage() {
    const sender = localStorage.getItem("aeroUser");
    const receiver = document.getElementById("msg-to").value.trim();
    const subject = document.getElementById("msg-subject").value.trim();
    const body = document.getElementById("msg-body").value.trim();

    if (!receiver || !subject || !body) {
        alert("Please fill out all fields.");
        return;
    }

    if (sender === receiver) {
        alert("You cannot send a message to yourself.");
        return;
    }

    try {
        // Verify receiver exists in Supabase
        const { data: recipientUser, error: userError } = await _supabase
            .from('users')
            .select('username')
            .eq('username', receiver)
            .single();

        if (userError || !recipientUser) {
            alert(`User '${receiver}' does not exist.`);
            return;
        }

        const { error } = await _supabase
            .from('messages')
            .insert([{ sender, receiver, subject, body, is_read: false }]);

        if (error) throw error;
        
        alert("Message sent successfully!");
        document.getElementById("msg-to").value = "";
        document.getElementById("msg-subject").value = "";
        document.getElementById("msg-body").value = "";
        
        switchTab('sent');
        
    } catch (err) {
        console.error("Error sending message:", err);
        alert("Failed to send message.");
    }
}

/**
 * Simple HTML Escaper
 */
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Global Exports
window.switchTab = switchTab;
window.loadMessages = loadMessages;
window.readMessage = readMessage;
window.showCompose = showCompose;
window.sendMessage = sendMessage;

// Page Initialization
document.addEventListener("DOMContentLoaded", async () => {
    // Force auth check / top-bar update if defined in auth.js
    if (typeof checkAuth === "function") {
        await checkAuth();
    } else if (typeof updateTopBar === "function") {
        await updateTopBar();
    }

    if (window.location.pathname.endsWith("inbox.html")) {
        const urlParams = new URLSearchParams(window.location.search);
        const toUser = urlParams.get('to');
        
        if (toUser) {
            showCompose(toUser);
        } else {
            switchTab('inbox');
        }
    }
});
