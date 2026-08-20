// ============================================
// NOTIFICATION SYSTEM - Premium
// ============================================

class NotificationSystem {
    constructor() {
        this.notifications = [];
        this.unreadCount = 0;
        this.isSupported = 'Notification' in window;
        this.isPermissionGranted = false;
        
        this.loadNotifications();
        this.initPushNotifications();
        this.startPolling();
    }

    // ============================================
    // LOAD NOTIFICATIONS
    // ============================================
    loadNotifications() {
        const saved = localStorage.getItem('notifications_data');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.notifications = data.notifications || [];
                this.unreadCount = data.unreadCount || 0;
            } catch (e) {
                this.initMockNotifications();
            }
        } else {
            this.initMockNotifications();
        }
    }

    // ============================================
    // INIT MOCK NOTIFICATIONS
    // ============================================
    initMockNotifications() {
        this.notifications = [
            {
                id: '1',
                title: 'سرویس در راه است',
                message: 'سرویس سارا وارد محدوده مدرسه شد.',
                type: 'info',
                time: new Date(Date.now() - 5 * 60000).toISOString(),
                read: false,
                link: '/parent.html?page=map',
                icon: 'fa-bus'
            },
            {
                id: '2',
                title: 'شروع سرویس',
                message: 'راننده سرویس شما سرویس را آغاز کرد.',
                type: 'success',
                time: new Date(Date.now() - 15 * 60000).toISOString(),
                read: false,
                link: '/parent.html',
                icon: 'fa-check-circle'
            },
            {
                id: '3',
                title: 'نزدیک شدن سرویس',
                message: 'سرویس شما ۵ دقیقه دیگر می‌رسد.',
                type: 'warning',
                time: new Date(Date.now() - 2 * 3600000).toISOString(),
                read: true,
                link: '/parent.html?page=map',
                icon: 'fa-clock'
            },
            {
                id: '4',
                title: 'تغییر وضعیت',
                message: 'وضعیت سرویس محمد تغییر کرد.',
                type: 'info',
                time: new Date(Date.now() - 3 * 3600000).toISOString(),
                read: true,
                link: '/parent.html',
                icon: 'fa-info-circle'
            }
        ];
        this.unreadCount = this.notifications.filter(n => !n.read).length;
        this.saveNotifications();
    }

    // ============================================
    // SAVE NOTIFICATIONS
    // ============================================
    saveNotifications() {
        localStorage.setItem('notifications_data', JSON.stringify({
            notifications: this.notifications,
            unreadCount: this.unreadCount
        }));
    }

    // ============================================
    // PUSH NOTIFICATIONS
    // ============================================
    async initPushNotifications() {
        if (!this.isSupported) {
            console.log('🔔 Push notifications not supported');
            return;
        }

        // Request permission
        if (Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            this.isPermissionGranted = permission === 'granted';
        } else {
            this.isPermissionGranted = Notification.permission === 'granted';
        }

        if (this.isPermissionGranted) {
            console.log('🔔 Push notifications enabled');
            this.showBrowserNotification('🔔 سرویس من', 'اعلان‌ها فعال شدند!');
        }
    }

    // ============================================
    // SHOW BROWSER NOTIFICATION
    // ============================================
    showBrowserNotification(title, body, data = {}) {
        if (!this.isSupported || !this.isPermissionGranted) return;

        try {
            const notification = new Notification(title, {
                body: body,
                icon: '/assets/icons/icon-192.png',
                badge: '/assets/icons/icon-72.png',
                tag: data.tag || Date.now().toString(),
                data: data,
                vibrate: [200, 100, 200],
                requireInteraction: false
            });

            notification.onclick = function() {
                window.focus();
                if (data.link) {
                    window.location.href = data.link;
                }
                notification.close();
            };

            setTimeout(() => {
                notification.close();
            }, 10000);

        } catch (error) {
            console.error('Error showing notification:', error);
        }
    }

    // ============================================
    // ADD NOTIFICATION
    // ============================================
    addNotification(title, message, type = 'info', link = null) {
        const notification = {
            id: Date.now().toString(),
            title: title,
            message: message,
            type: type,
            time: new Date().toISOString(),
            read: false,
            link: link,
            icon: this.getIconByType(type)
        };

        this.notifications.unshift(notification);
        this.unreadCount++;
        this.saveNotifications();

        // Show browser notification
        this.showBrowserNotification(title, message, { link: link });

        // Emit event
        this.emit('newNotification', notification);

        // Update UI
        this.updateBadge();

        return notification;
    }

    // ============================================
    // GET ICON BY TYPE
    // ============================================
    getIconByType(type) {
        const icons = {
            'success': 'fa-check-circle',
            'warning': 'fa-exclamation-triangle',
            'error': 'fa-times-circle',
            'info': 'fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    // ============================================
    // GET NOTIFICATIONS
    // ============================================
    getNotifications(limit = null) {
        let result = [...this.notifications];
        if (limit) {
            result = result.slice(0, limit);
        }
        return result;
    }

    // ============================================
    // MARK AS READ
    // ============================================
    markAsRead(id) {
        const notif = this.notifications.find(n => n.id === id);
        if (notif && !notif.read) {
            notif.read = true;
            this.unreadCount--;
            this.saveNotifications();
            this.updateBadge();
            this.emit('notificationRead', notif);
            return true;
        }
        return false;
    }

    // ============================================
    // MARK ALL AS READ
    // ============================================
    markAllAsRead() {
        let count = 0;
        this.notifications.forEach(n => {
            if (!n.read) {
                n.read = true;
                count++;
            }
        });
        this.unreadCount = 0;
        this.saveNotifications();
        this.updateBadge();
        this.emit('allRead', count);
        return count;
    }

    // ============================================
    // DELETE NOTIFICATION
    // ============================================
    deleteNotification(id) {
        const index = this.notifications.findIndex(n => n.id === id);
        if (index !== -1) {
            const notif = this.notifications[index];
            if (!notif.read) {
                this.unreadCount--;
            }
            this.notifications.splice(index, 1);
            this.saveNotifications();
            this.updateBadge();
            this.emit('notificationDeleted', id);
            return true;
        }
        return false;
    }

    // ============================================
    // CLEAR ALL
    // ============================================
    clearAll() {
        this.notifications = [];
        this.unreadCount = 0;
        this.saveNotifications();
        this.updateBadge();
        this.emit('allCleared');
    }

    // ============================================
    // GET UNREAD COUNT
    // ============================================
    getUnreadCount() {
        return this.unreadCount;
    }

    // ============================================
    // UPDATE BADGE
    // ============================================
    updateBadge() {
        document.querySelectorAll('.notif-btn .badge, .sidebar-nav .badge, .bottom-nav .badge').forEach(badge => {
            if (this.unreadCount > 0) {
                badge.textContent = this.unreadCount;
                badge.style.display = 'inline-block';
            } else {
                badge.style.display = 'none';
            }
        });
        
        // Update document title
        if (this.unreadCount > 0) {
            document.title = `(${this.unreadCount}) سرویس من`;
        } else {
            document.title = 'سرویس من';
        }
    }

    // ============================================
    // POLLING FOR NEW NOTIFICATIONS
    // ============================================
    startPolling() {
        this.pollingInterval = setInterval(() => {
            this.checkForNewNotifications();
        }, 30000);
    }

    checkForNewNotifications() {
        // Simulate new notifications
        if (Math.random() > 0.9) {
            const messages = [
                'سرویس جدیدی به مدرسه اضافه شد',
                'راننده جدید ثبت‌نام کرد',
                'درخواست جدید سرویس ثبت شد',
                'یک دانش‌آموز جدید اضافه شد'
            ];
            const randomMessage = messages[Math.floor(Math.random() * messages.length)];
            this.addNotification(
                'اطلاعیه جدید',
                randomMessage,
                'info',
                '/'
            );
        }
    }

    // ============================================
    // EVENT SYSTEM
    // ============================================
    events = {};

    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }

    emit(event, data) {
        if (this.events[event]) {
            this.events[event].forEach(callback => {
                try {
                    callback(data);
                } catch (e) {
                    console.error('Event handler error:', e);
                }
            });
        }
    }

    // ============================================
    // CLEANUP
    // ============================================
    destroy() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
        }
        this.events = {};
    }
}

// ============================================
// NOTIFICATION UI COMPONENT
// ============================================
class NotificationUI {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.notificationSystem = new NotificationSystem();
        this.isOpen = false;
        
        this.initUI();
        this.initEvents();
        this.notificationSystem.updateBadge();
    }

    initUI() {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div class="notif-toggle" onclick="window.notifUI.toggle()">
                <i class="fas fa-bell"></i>
                <span class="notif-badge" id="notifBadge">0</span>
            </div>
            
            <div class="notif-dropdown glass-premium" id="notifDropdown">
                <div class="notif-dropdown-header">
                    <span>اعلان‌ها</span>
                    <button onclick="window.notifUI.markAllRead()">
                        <i class="fas fa-check-double"></i>
                        همه را خوانده‌ام
                    </button>
                </div>
                
                <div class="notif-dropdown-list" id="notifList">
                    <!-- Notifications will be rendered here -->
                </div>
                
                <div class="notif-dropdown-footer">
                    <button onclick="window.notifUI.clearAll()">
                        <i class="fas fa-trash"></i>
                        پاک کردن همه
                    </button>
                </div>
            </div>
        `;
        
        this.renderNotifications();
    }

    initEvents() {
        // Close dropdown on outside click
        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.container.contains(e.target)) {
                this.close();
            }
        });
        
        // Listen for new notifications
        this.notificationSystem.on('newNotification', () => {
            this.renderNotifications();
            this.notificationSystem.updateBadge();
        });
        
        this.notificationSystem.on('notificationRead', () => {
            this.renderNotifications();
            this.notificationSystem.updateBadge();
        });
        
        this.notificationSystem.on('allRead', () => {
            this.renderNotifications();
            this.notificationSystem.updateBadge();
        });
        
        this.notificationSystem.on('allCleared', () => {
            this.renderNotifications();
            this.notificationSystem.updateBadge();
        });
    }

    toggle() {
        this.isOpen ? this.close() : this.open();
    }

    open() {
        this.isOpen = true;
        const dropdown = document.getElementById('notifDropdown');
        if (dropdown) dropdown.classList.add('open');
        this.renderNotifications();
    }

    close() {
        this.isOpen = false;
        const dropdown = document.getElementById('notifDropdown');
        if (dropdown) dropdown.classList.remove('open');
    }

    renderNotifications() {
        const list = document.getElementById('notifList');
        if (!list) return;
        
        const notifications = this.notificationSystem.getNotifications(20);
        
        if (notifications.length === 0) {
            list.innerHTML = `
                <div class="empty-state" style="padding: 30px 20px; text-align: center;">
                    <i class="fas fa-bell-slash" style="font-size: 40px; color: var(--text-light);"></i>
                    <p style="margin-top: 8px; color: var(--text-secondary);">هیچ اعلانی وجود ندارد</p>
                </div>
            `;
            return;
        }
        
        list.innerHTML = '';
        
        notifications.forEach(notif => {
            const div = document.createElement('div');
            div.className = `notif-item${notif.read ? '' : ' unread'}`;
            
            const colors = {
                'success': '#10B981',
                'warning': '#F59E0B',
                'error': '#EF4444',
                'info': '#4F46E5'
            };
            
            div.innerHTML = `
                <div class="notif-item-icon" style="background: ${colors[notif.type] || colors.info}20;">
                    <i class="fas ${notif.icon}" style="color: ${colors[notif.type] || colors.info};"></i>
                </div>
                <div class="notif-item-content">
                    <div class="notif-item-title">${notif.title}</div>
                    <div class="notif-item-message">${notif.message}</div>
                    <div class="notif-item-time">
                        <i class="far fa-clock"></i>
                        ${this.formatTime(notif.time)}
                    </div>
                </div>
                <div class="notif-item-actions">
                    ${!notif.read ? `<button onclick="window.notifUI.markRead('${notif.id}')" title="خوانده شد"><i class="fas fa-check"></i></button>` : ''}
                    <button onclick="window.notifUI.deleteNotif('${notif.id}')" title="حذف"><i class="fas fa-times"></i></button>
                </div>
            `;
            
            if (notif.link) {
                div.style.cursor = 'pointer';
                div.addEventListener('click', () => {
                    window.location.href = notif.link;
                });
            }
            
            list.appendChild(div);
        });
        
        // Update badge
        document.getElementById('notifBadge').textContent = this.notificationSystem.getUnreadCount();
    }

    formatTime(timestamp) {
        const now = new Date();
        const date = new Date(timestamp);
        const diff = Math.floor((now - date) / 60000);
        
        if (diff < 1) return 'همین الان';
        if (diff < 60) return `${diff} دقیقه پیش`;
        if (diff < 1440) return `${Math.floor(diff / 60)} ساعت پیش`;
        return date.toLocaleDateString('fa-IR');
    }

    markRead(id) {
        this.notificationSystem.markAsRead(id);
    }

    markAllRead() {
        this.notificationSystem.markAllAsRead();
    }

    deleteNotif(id) {
        this.notificationSystem.deleteNotification(id);
    }

    clearAll() {
        if (confirm('آیا از پاک کردن همه اعلان‌ها اطمینان دارید؟')) {
            this.notificationSystem.clearAll();
        }
    }
}

// ============================================
// INITIALIZE NOTIFICATIONS
// ============================================
let notifUI = null;

document.addEventListener('DOMContentLoaded', function() {
    const notifContainer = document.getElementById('notificationContainer');
    if (notifContainer) {
        notifUI = new NotificationUI('notificationContainer');
        window.notifUI = notifUI;
    }
});

// ============================================
// NOTIFICATION STYLES
// ============================================
const notifStyles = document.createElement('style');
notifStyles.textContent = `
    .notif-container {
        position: fixed;
        top: 80px;
        left: 20px;
        z-index: 1000;
    }
    
    .notif-toggle {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: var(--glass-bg);
        backdrop-filter: blur(10px);
        color: var(--text-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        cursor: pointer;
        border: 1px solid var(--border-color);
        transition: all 0.3s ease;
        position: relative;
        box-shadow: var(--shadow-md);
    }
    
    .notif-toggle:hover {
        transform: scale(1.05);
        box-shadow: var(--shadow-lg);
    }
    
    .notif-badge {
        position: absolute;
        top: -4px;
        right: -4px;
        background: var(--danger);
        color: white;
        font-size: 10px;
        font-weight: 700;
        min-width: 18px;
        height: 18px;
        border-radius: 9px;
        display: none;
        align-items: center;
        justify-content: center;
        border: 2px solid var(--bg-primary);
    }
    
    .notif-dropdown {
        position: absolute;
        top: 50px;
        left: 0;
        width: 380px;
        max-height: 500px;
        border-radius: 12px;
        display: none;
        flex-direction: column;
        overflow: hidden;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
    }
    
    .notif-dropdown.open {
        display: flex;
        animation: fadeInUp 0.3s ease;
    }
    
    .notif-dropdown-header {
        padding: 16px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid var(--border-color);
        flex-shrink: 0;
    }
    
    .notif-dropdown-header span {
        font-weight: 700;
        font-size: 16px;
    }
    
    .notif-dropdown-header button {
        background: none;
        border: none;
        color: var(--primary);
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
        transition: color 0.3s ease;
    }
    
    .notif-dropdown-header button:hover {
        color: var(--primary-dark);
    }
    
    .notif-dropdown-list {
        flex: 1;
        overflow-y: auto;
        padding: 8px;
    }
    
    .notif-item {
        display: flex;
        gap: 12px;
        padding: 12px;
        border-radius: 10px;
        transition: all 0.3s ease;
        align-items: flex-start;
    }
    
    .notif-item:hover {
        background: var(--hover-bg);
    }
    
    .notif-item.unread {
        background: rgba(79, 70, 229, 0.05);
        border-right: 3px solid var(--primary);
    }
    
    .notif-item-icon {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        font-size: 16px;
    }
    
    .notif-item-content {
        flex: 1;
        min-width: 0;
    }
    
    .notif-item-title {
        font-weight: 600;
        font-size: 14px;
        margin-bottom: 2px;
    }
    
    .notif-item-message {
        font-size: 13px;
        color: var(--text-secondary);
        word-wrap: break-word;
    }
    
    .notif-item-time {
        font-size: 11px;
        color: var(--text-light);
        margin-top: 4px;
        display: flex;
        align-items: center;
        gap: 4px;
    }
    
    .notif-item-actions {
        display: flex;
        gap: 4px;
        flex-shrink: 0;
    }
    
    .notif-item-actions button {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: none;
        background: var(--hover-bg);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        font-size: 12px;
    }
    
    .notif-item-actions button:hover {
        background: var(--primary);
        color: white;
    }
    
    .notif-dropdown-footer {
        padding: 12px 20px;
        border-top: 1px solid var(--border-color);
        flex-shrink: 0;
        text-align: center;
    }
    
    .notif-dropdown-footer button {
        background: none;
        border: none;
        color: var(--text-secondary);
        font-size: 13px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        transition: color 0.3s ease;
    }
    
    .notif-dropdown-footer button:hover {
        color: var(--danger);
    }
    
    @media (max-width: 480px) {
        .notif-dropdown {
            width: calc(100vw - 40px);
            left: -20px;
        }
    }
`;
document.head.appendChild(notifStyles);