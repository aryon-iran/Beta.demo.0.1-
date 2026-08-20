// ============================================
// CHAT SYSTEM - Premium
// ============================================

class ChatSystem {
    constructor() {
        this.chats = [];
        this.currentChat = null;
        this.messages = [];
        this.isConnected = false;
        this.unreadCount = 0;
        this.typingTimeout = null;
        
        this.loadChats();
        this.initSocket();
    }

    // ============================================
    // LOAD CHATS FROM STORAGE
    // ============================================
    loadChats() {
        const saved = localStorage.getItem('chat_data');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.chats = data.chats || [];
                this.messages = data.messages || [];
                this.unreadCount = data.unreadCount || 0;
            } catch (e) {
                this.initMockChats();
            }
        } else {
            this.initMockChats();
        }
    }

    // ============================================
    // INIT MOCK CHATS
    // ============================================
    initMockChats() {
        this.chats = [
            {
                id: '1',
                name: 'علی رضایی',
                role: 'driver',
                avatar: 'https://ui-avatars.com/api/?name=علی+رضایی&background=7C3AED&color=fff',
                lastMessage: 'سرویس ۱۰ دقیقه دیگه می‌رسه',
                lastTime: '۰۸:۳۰',
                unread: 2,
                online: true,
                typing: false
            },
            {
                id: '2',
                name: 'مدیر مدرسه',
                role: 'school',
                avatar: 'https://ui-avatars.com/api/?name=مدیر+مدرسه&background=10B981&color=fff',
                lastMessage: 'برنامه امروز تغییر کرد',
                lastTime: '۰۷:۴۵',
                unread: 1,
                online: false,
                typing: false
            },
            {
                id: '3',
                name: 'مریم احمدی',
                role: 'parent',
                avatar: 'https://ui-avatars.com/api/?name=مریم+احمدی&background=EF4444&color=fff',
                lastMessage: 'ممنون از پیگیری شما',
                lastTime: 'دیروز',
                unread: 0,
                online: false,
                typing: false
            }
        ];

        this.messages = {
            '1': [
                {
                    id: '1-1',
                    sender: 'driver',
                    text: 'سلام علی جان',
                    time: '۰۸:۲۰',
                    read: true
                },
                {
                    id: '1-2',
                    sender: 'me',
                    text: 'سلام، سرویس چند می‌رسه؟',
                    time: '۰۸:۲۵',
                    read: true
                },
                {
                    id: '1-3',
                    sender: 'driver',
                    text: 'سرویس ۱۰ دقیقه دیگه می‌رسه',
                    time: '۰۸:۳۰',
                    read: false
                }
            ],
            '2': [
                {
                    id: '2-1',
                    sender: 'school',
                    text: 'سلام، برنامه امروز تغییر کرد',
                    time: '۰۷:۴۵',
                    read: false
                }
            ],
            '3': [
                {
                    id: '3-1',
                    sender: 'parent',
                    text: 'سلام، ببخشید وضعیت سرویس چطوره؟',
                    time: 'دیروز',
                    read: true
                },
                {
                    id: '3-2',
                    sender: 'me',
                    text: 'سلام، سرویس در مسیر هستش',
                    time: 'دیروز',
                    read: true
                },
                {
                    id: '3-3',
                    sender: 'parent',
                    text: 'ممنون از پیگیری شما',
                    time: 'دیروز',
                    read: true
                }
            ]
        };

        this.saveChats();
    }

    // ============================================
    // SAVE CHATS
    // ============================================
    saveChats() {
        localStorage.setItem('chat_data', JSON.stringify({
            chats: this.chats,
            messages: this.messages,
            unreadCount: this.unreadCount
        }));
    }

    // ============================================
    // SOCKET SIMULATION
    // ============================================
    initSocket() {
        // Simulate real-time connection
        this.isConnected = true;
        console.log('💬 Chat system connected');

        // Simulate incoming messages
        setInterval(() => {
            if (Math.random() > 0.7) {
                this.simulateIncomingMessage();
            }
        }, 30000);
    }

    simulateIncomingMessage() {
        const chatId = this.chats[Math.floor(Math.random() * this.chats.length)].id;
        const messages = [
            'سلام، چطور هستید؟',
            'سرویس به زودی می‌رسد',
            'لطفاً پاسخ دهید',
            'وضعیت سرویس خوب است',
            'امروز دیر می‌شوم'
        ];
        
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        
        this.receiveMessage(chatId, {
            id: Date.now().toString(),
            sender: 'other',
            text: randomMessage,
            time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
            read: false
        });
    }

    // ============================================
    // SEND MESSAGE
    // ============================================
    sendMessage(chatId, text) {
        if (!text.trim()) return;

        const message = {
            id: Date.now().toString(),
            sender: 'me',
            text: text.trim(),
            time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
            read: true
        };

        this.receiveMessage(chatId, message);
        
        // Simulate typing and response
        this.setTyping(chatId, true);
        setTimeout(() => {
            this.setTyping(chatId, false);
            const responses = [
                'دریافت کردم ✅',
                'ممنون از پیام شما',
                'حتماً انجام می‌دم',
                'به موقع می‌رسیم',
                'عالی است'
            ];
            const response = responses[Math.floor(Math.random() * responses.length)];
            this.receiveMessage(chatId, {
                id: Date.now().toString(),
                sender: 'other',
                text: response,
                time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
                read: false
            });
        }, 2000 + Math.random() * 3000);

        return message;
    }

    // ============================================
    // RECEIVE MESSAGE
    // ============================================
    receiveMessage(chatId, message) {
        if (!this.messages[chatId]) {
            this.messages[chatId] = [];
        }
        
        this.messages[chatId].push(message);
        
        // Update chat preview
        const chat = this.chats.find(c => c.id === chatId);
        if (chat) {
            chat.lastMessage = message.text;
            chat.lastTime = message.time;
            if (message.sender !== 'me') {
                chat.unread = (chat.unread || 0) + 1;
                this.unreadCount++;
            }
        }
        
        this.saveChats();
        this.notifyListeners(chatId);
    }

    // ============================================
    // GET CHAT MESSAGES
    // ============================================
    getMessages(chatId) {
        const messages = this.messages[chatId] || [];
        
        // Mark as read
        const chat = this.chats.find(c => c.id === chatId);
        if (chat) {
            const unreadCount = messages.filter(m => !m.read && m.sender !== 'me').length;
            if (unreadCount > 0) {
                messages.forEach(m => {
                    if (!m.read && m.sender !== 'me') {
                        m.read = true;
                    }
                });
                chat.unread = 0;
                this.unreadCount -= unreadCount;
                this.saveChats();
                this.notifyListeners(chatId);
            }
        }
        
        return messages;
    }

    // ============================================
    // SET TYPING STATUS
    // ============================================
    setTyping(chatId, isTyping) {
        const chat = this.chats.find(c => c.id === chatId);
        if (chat) {
            chat.typing = isTyping;
            this.notifyListeners(chatId);
        }
    }

    // ============================================
    // GET CHAT
    // ============================================
    getChat(chatId) {
        return this.chats.find(c => c.id === chatId);
    }

    // ============================================
    // CREATE CHAT
    // ============================================
    createChat(user) {
        const chat = {
            id: Date.now().toString(),
            name: user.name,
            role: user.role || 'parent',
            avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4F46E5&color=fff`,
            lastMessage: '',
            lastTime: '',
            unread: 0,
            online: false,
            typing: false
        };
        
        this.chats.push(chat);
        this.messages[chat.id] = [];
        this.saveChats();
        this.notifyListeners();
        
        return chat;
    }

    // ============================================
    // DELETE CHAT
    // ============================================
    deleteChat(chatId) {
        const index = this.chats.findIndex(c => c.id === chatId);
        if (index !== -1) {
            this.chats.splice(index, 1);
            delete this.messages[chatId];
            this.saveChats();
            this.notifyListeners();
            return true;
        }
        return false;
    }

    // ============================================
    // GET UNREAD COUNT
    // ============================================
    getUnreadCount() {
        return this.unreadCount;
    }

    // ============================================
    // NOTIFY LISTENERS
    // ============================================
    listeners = [];

    addListener(callback) {
        this.listeners.push(callback);
    }

    notifyListeners(chatId) {
        this.listeners.forEach(callback => {
            callback({
                chats: this.chats,
                messages: chatId ? this.messages[chatId] : null,
                unreadCount: this.unreadCount,
                chatId: chatId
            });
        });
    }

    // ============================================
    // CLEANUP
    // ============================================
    destroy() {
        this.isConnected = false;
        this.listeners = [];
    }
}

// ============================================
// CHAT UI COMPONENT
// ============================================
class ChatUI {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.chatSystem = new ChatSystem();
        this.currentChatId = null;
        this.isOpen = false;
        
        this.initUI();
        this.initEvents();
        this.chatSystem.addListener((data) => this.updateUI(data));
    }

    initUI() {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div class="chat-toggle" onclick="window.chatUI.toggle()">
                <i class="fas fa-comment-dots"></i>
                <span class="chat-badge" id="chatBadge">0</span>
            </div>
            
            <div class="chat-window glass-premium" id="chatWindow">
                <div class="chat-header">
                    <div class="chat-header-info">
                        <i class="fas fa-comment"></i>
                        <span>پیام‌ها</span>
                    </div>
                    <div class="chat-header-actions">
                        <button onclick="window.chatUI.close()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                
                <div class="chat-list" id="chatList">
                    <!-- Chats will be rendered here -->
                </div>
                
                <div class="chat-messages-container" id="chatMessagesContainer">
                    <div class="chat-messages-header">
                        <button class="back-btn" onclick="window.chatUI.showList()">
                            <i class="fas fa-arrow-right"></i>
                        </button>
                        <span id="chatPartnerName">مکالمه</span>
                        <span class="online-status" id="chatOnlineStatus"></span>
                    </div>
                    <div class="chat-messages" id="chatMessages">
                        <!-- Messages will be rendered here -->
                    </div>
                    <div class="chat-input-container">
                        <div class="typing-indicator" id="typingIndicator">
                            <span></span>
                            <span></span>
                            <span></span>
                            <span style="margin-right: 8px;">در حال تایپ...</span>
                        </div>
                        <div class="chat-input-wrapper">
                            <input 
                                type="text" 
                                id="chatInput" 
                                placeholder="پیام خود را بنویسید..."
                                onkeydown="if(event.key === 'Enter') window.chatUI.sendMessage()"
                            >
                            <button onclick="window.chatUI.sendMessage()">
                                <i class="fas fa-paper-plane"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.updateUI({
            chats: this.chatSystem.chats,
            unreadCount: this.chatSystem.getUnreadCount()
        });
    }

    initEvents() {
        // Close chat on outside click
        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.container.contains(e.target)) {
                this.close();
            }
        });
    }

    toggle() {
        this.isOpen ? this.close() : this.open();
    }

    open() {
        this.isOpen = true;
        const window = document.getElementById('chatWindow');
        if (window) window.classList.add('open');
        this.updateUI({
            chats: this.chatSystem.chats,
            unreadCount: this.chatSystem.getUnreadCount()
        });
    }

    close() {
        this.isOpen = false;
        const window = document.getElementById('chatWindow');
        if (window) window.classList.remove('open');
        this.showList();
    }

    showList() {
        document.getElementById('chatList').style.display = 'block';
        document.getElementById('chatMessagesContainer').style.display = 'none';
        this.currentChatId = null;
    }

    showChat(chatId) {
        this.currentChatId = chatId;
        document.getElementById('chatList').style.display = 'none';
        document.getElementById('chatMessagesContainer').style.display = 'flex';
        
        const chat = this.chatSystem.getChat(chatId);
        if (chat) {
            document.getElementById('chatPartnerName').textContent = chat.name;
            document.getElementById('chatOnlineStatus').textContent = chat.online ? '🟢 آنلاین' : '⚪ آفلاین';
            document.getElementById('chatOnlineStatus').style.color = chat.online ? 'var(--success)' : 'var(--text-light)';
        }
        
        this.renderMessages(chatId);
        
        // Focus input
        setTimeout(() => {
            document.getElementById('chatInput').focus();
        }, 300);
    }

    sendMessage() {
        const input = document.getElementById('chatInput');
        const text = input.value.trim();
        if (!text || !this.currentChatId) return;
        
        this.chatSystem.sendMessage(this.currentChatId, text);
        input.value = '';
        this.renderMessages(this.currentChatId);
    }

    renderMessages(chatId) {
        const container = document.getElementById('chatMessages');
        const messages = this.chatSystem.getMessages(chatId);
        
        container.innerHTML = '';
        
        messages.forEach(msg => {
            const div = document.createElement('div');
            div.className = `chat-message ${msg.sender === 'me' ? 'sent' : 'received'}`;
            div.innerHTML = `
                <div class="message-content">
                    <p>${msg.text}</p>
                    <span class="message-time">${msg.time}</span>
                    ${msg.sender === 'me' ? `<span class="message-status"><i class="fas fa-check-double"></i></span>` : ''}
                </div>
            `;
            container.appendChild(div);
        });
        
        // Scroll to bottom
        container.scrollTop = container.scrollHeight;
    }

    updateUI(data) {
        // Update badge
        const badge = document.getElementById('chatBadge');
        if (badge) {
            const count = data.unreadCount || 0;
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        }
        
        // Update list
        const list = document.getElementById('chatList');
        if (list && data.chats) {
            list.innerHTML = '';
            
            if (data.chats.length === 0) {
                list.innerHTML = `
                    <div class="empty-state" style="padding: 40px 20px; text-align: center;">
                        <i class="fas fa-comment" style="font-size: 48px; color: var(--text-light);"></i>
                        <p style="margin-top: 12px; color: var(--text-secondary);">هیچ مکالمه‌ای وجود ندارد</p>
                    </div>
                `;
                return;
            }
            
            data.chats.forEach(chat => {
                const div = document.createElement('div');
                div.className = 'chat-list-item' + (chat.unread > 0 ? ' unread' : '');
                div.innerHTML = `
                    <img src="${chat.avatar}" alt="${chat.name}" class="chat-avatar">
                    <div class="chat-info">
                        <div class="chat-name">
                            <span>${chat.name}</span>
                            <span class="chat-role">${chat.role === 'driver' ? '🚌' : chat.role === 'school' ? '🏫' : '👨‍👩‍👧'}</span>
                        </div>
                        <div class="chat-preview">
                            <span class="chat-last-message">${chat.lastMessage || 'شروع مکالمه'}</span>
                            <span class="chat-time">${chat.lastTime || ''}</span>
                        </div>
                    </div>
                    ${chat.unread > 0 ? `<span class="chat-unread-badge">${chat.unread}</span>` : ''}
                    ${chat.online ? `<span class="chat-online-dot"></span>` : ''}
                `;
                div.onclick = () => this.showChat(chat.id);
                list.appendChild(div);
            });
        }
        
        // Update current chat if open
        if (this.currentChatId) {
            this.renderMessages(this.currentChatId);
            
            // Update typing indicator
            const chat = this.chatSystem.getChat(this.currentChatId);
            const indicator = document.getElementById('typingIndicator');
            if (indicator) {
                indicator.style.display = chat?.typing ? 'flex' : 'none';
            }
        }
    }

    destroy() {
        this.chatSystem.destroy();
        this.container.innerHTML = '';
    }
}

// ============================================
// INITIALIZE CHAT
// ============================================
let chatUI = null;

document.addEventListener('DOMContentLoaded', function() {
    const chatContainer = document.getElementById('chatContainer');
    if (chatContainer) {
        chatUI = new ChatUI('chatContainer');
        window.chatUI = chatUI;
    }
});

// ============================================
// CHAT STYLES
// ============================================
const chatStyles = document.createElement('style');
chatStyles.textContent = `
    .chat-container {
        position: fixed;
        bottom: 80px;
        left: 20px;
        z-index: 1000;
    }
    
    .chat-toggle {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: var(--primary-gradient);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        cursor: pointer;
        box-shadow: 0 4px 20px rgba(79, 70, 229, 0.4);
        transition: all 0.3s ease;
        position: relative;
    }
    
    .chat-toggle:hover {
        transform: scale(1.1);
        box-shadow: 0 8px 30px rgba(79, 70, 229, 0.5);
    }
    
    .chat-badge {
        position: absolute;
        top: -4px;
        right: -4px;
        background: var(--danger);
        color: white;
        font-size: 11px;
        font-weight: 700;
        min-width: 20px;
        height: 20px;
        border-radius: 10px;
        display: none;
        align-items: center;
        justify-content: center;
        border: 2px solid var(--bg-primary);
    }
    
    .chat-window {
        position: absolute;
        bottom: 70px;
        left: 0;
        width: 360px;
        height: 480px;
        border-radius: 16px;
        display: none;
        flex-direction: column;
        overflow: hidden;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
    }
    
    .chat-window.open {
        display: flex;
        animation: fadeInUp 0.3s ease;
    }
    
    .chat-header {
        padding: 16px 20px;
        background: var(--bg-secondary);
        border-bottom: 1px solid var(--border-color);
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-shrink: 0;
    }
    
    .chat-header-info {
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 600;
        font-size: 16px;
    }
    
    .chat-header-info i {
        color: var(--primary);
    }
    
    .chat-header-actions button {
        background: none;
        border: none;
        color: var(--text-secondary);
        cursor: pointer;
        font-size: 18px;
        padding: 4px;
        transition: color 0.3s ease;
    }
    
    .chat-header-actions button:hover {
        color: var(--text-primary);
    }
    
    .chat-list {
        flex: 1;
        overflow-y: auto;
        padding: 8px;
    }
    
    .chat-list-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.3s ease;
        position: relative;
    }
    
    .chat-list-item:hover {
        background: var(--hover-bg);
    }
    
    .chat-list-item.unread {
        background: rgba(79, 70, 229, 0.05);
    }
    
    .chat-avatar {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        flex-shrink: 0;
        border: 2px solid var(--border-color);
    }
    
    .chat-info {
        flex: 1;
        min-width: 0;
    }
    
    .chat-name {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
        font-size: 14px;
    }
    
    .chat-role {
        font-size: 12px;
        opacity: 0.6;
    }
    
    .chat-preview {
        display: flex;
        justify-content: space-between;
        gap: 8px;
        font-size: 13px;
        color: var(--text-secondary);
    }
    
    .chat-last-message {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    
    .chat-time {
        font-size: 11px;
        flex-shrink: 0;
    }
    
    .chat-unread-badge {
        background: var(--primary);
        color: white;
        font-size: 11px;
        font-weight: 700;
        min-width: 20px;
        height: 20px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 6px;
    }
    
    .chat-online-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: var(--success);
        border: 2px solid var(--bg-primary);
        position: absolute;
        bottom: 12px;
        right: 12px;
    }
    
    .chat-messages-container {
        flex: 1;
        display: none;
        flex-direction: column;
        overflow: hidden;
    }
    
    .chat-messages-header {
        padding: 12px 16px;
        background: var(--bg-secondary);
        border-bottom: 1px solid var(--border-color);
        display: flex;
        align-items: center;
        gap: 12px;
        flex-shrink: 0;
    }
    
    .back-btn {
        background: none;
        border: none;
        color: var(--text-secondary);
        cursor: pointer;
        font-size: 18px;
        padding: 4px;
        transition: color 0.3s ease;
    }
    
    .back-btn:hover {
        color: var(--text-primary);
    }
    
    .online-status {
        font-size: 12px;
        margin-right: auto;
    }
    
    .chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        background: var(--bg-primary);
    }
    
    .chat-message {
        max-width: 80%;
        animation: fadeInUp 0.3s ease;
    }
    
    .chat-message.sent {
        align-self: flex-end;
    }
    
    .chat-message.received {
        align-self: flex-start;
    }
    
    .message-content {
        padding: 10px 14px;
        border-radius: 12px;
        position: relative;
    }
    
    .chat-message.sent .message-content {
        background: var(--primary);
        color: white;
        border-bottom-right-radius: 4px;
    }
    
    .chat-message.received .message-content {
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        border-bottom-left-radius: 4px;
    }
    
    .message-content p {
        margin: 0;
        font-size: 14px;
        line-height: 1.5;
        word-wrap: break-word;
    }
    
    .message-time {
        font-size: 10px;
        opacity: 0.7;
        margin-top: 4px;
        display: block;
    }
    
    .message-status {
        font-size: 12px;
        margin-left: 4px;
        color: rgba(255, 255, 255, 0.7);
    }
    
    .chat-message.received .message-status {
        color: var(--text-light);
    }
    
    .chat-input-container {
        padding: 12px 16px;
        background: var(--bg-secondary);
        border-top: 1px solid var(--border-color);
        flex-shrink: 0;
    }
    
    .typing-indicator {
        display: none;
        align-items: center;
        gap: 4px;
        padding: 4px 0;
        font-size: 12px;
        color: var(--text-secondary);
    }
    
    .typing-indicator span {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--text-light);
        animation: typing-bounce 1.4s infinite;
    }
    
    .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
    .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
    
    @keyframes typing-bounce {
        0%, 60%, 100% { transform: translateY(0); }
        30% { transform: translateY(-6px); }
    }
    
    .chat-input-wrapper {
        display: flex;
        gap: 8px;
    }
    
    .chat-input-wrapper input {
        flex: 1;
        padding: 10px 16px;
        border: 2px solid var(--border-color);
        border-radius: 12px;
        font-family: var(--font-family);
        font-size: 14px;
        background: var(--bg-primary);
        color: var(--text-primary);
        transition: border-color 0.3s ease;
    }
    
    .chat-input-wrapper input:focus {
        outline: none;
        border-color: var(--primary);
    }
    
    .chat-input-wrapper button {
        padding: 10px 16px;
        background: var(--primary-gradient);
        color: white;
        border: none;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .chat-input-wrapper button:hover {
        transform: scale(1.05);
    }
    
    @media (max-width: 480px) {
        .chat-window {
            width: calc(100vw - 40px);
            height: 60vh;
            bottom: 70px;
            left: 20px;
        }
    }
`;
document.head.appendChild(chatStyles);