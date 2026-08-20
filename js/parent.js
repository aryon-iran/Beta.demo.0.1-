// ============================================
// PARENT DASHBOARD - Version 3.0
// ============================================

let parentData = null;
let childrenList = [];
let activeChildId = null;
let notificationInterval = null;

// ============================================
// INITIALIZE
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!AUTH.isAuthenticated) {
        window.location.href = 'login.html';
        return;
    }
    
    if (AUTH.user?.role !== 'parent' && !AUTH.user?.isGuest) {
        window.location.href = 'login.html';
        return;
    }
    
    // Initialize parent dashboard
    initParentDashboard();
});

// ============================================
// INIT PARENT DASHBOARD
// ============================================
async function initParentDashboard() {
    try {
        showLoading('در حال بارگذاری داشبورد...');
        
        // Load parent data
        await loadParentData();
        
        // Update UI
        updateParentUI();
        
        // Initialize map if on map page
        if (document.getElementById('liveMap')) {
            setTimeout(() => {
                initMap('liveMap', 'north');
            }, 500);
        }
        
        // Initialize notifications
        initNotifications();
        
        // Start real-time updates
        startRealtimeUpdates();
        
        hideLoading();
        
        // Show welcome toast
        setTimeout(() => {
            showToast(`سلام ${AUTH.user?.name || 'کاربر عزیز'}! 👋`, 'success');
        }, 600);
        
    } catch (error) {
        hideLoading();
        showToast('خطا در بارگذاری داشبورد', 'error');
        console.error('Parent dashboard error:', error);
    }
}

// ============================================
// LOAD PARENT DATA
// ============================================
async function loadParentData() {
    try {
        // Get from API
        const response = await api.request('/students');
        if (response.success) {
            childrenList = response.students || [];
        }
        
        // Get notifications
        const notifResponse = await api.request('/notifications');
        if (notifResponse.success) {
            APP.notifications = notifResponse.notifications || [];
        }
        
        // Get stats
        const statsResponse = await api.request('/dashboard/stats');
        if (statsResponse.success) {
            parentData = statsResponse.stats;
        }
        
        // Mock data if needed
        if (childrenList.length === 0) {
            childrenList = [
                {
                    id: '1',
                    name: 'سارا رضایی',
                    school: 'دبستان پسرانه شماره ۱',
                    class: 'سوم',
                    status: 'active',
                    driver: 'علی رضایی',
                    route: 'مسیر شمال',
                    avatar: 'https://ui-avatars.com/api/?name=سارا+رضایی&background=06B6D4&color=fff'
                },
                {
                    id: '2',
                    name: 'محمد رضایی',
                    school: 'دبیرستان پسرانه شماره ۲',
                    class: 'اول',
                    status: 'pending',
                    driver: 'محمد کریمی',
                    route: 'مسیر جنوب',
                    avatar: 'https://ui-avatars.com/api/?name=محمد+رضایی&background=F59E0B&color=fff'
                }
            ];
        }
        
    } catch (error) {
        console.error('Load parent data error:', error);
        // Use fallback data
        childrenList = getFallbackChildren();
    }
}

// ============================================
// GET FALLBACK DATA
// ============================================
function getFallbackChildren() {
    return [
        {
            id: '1',
            name: 'سارا رضایی',
            school: 'دبستان پسرانه شماره ۱',
            class: 'سوم',
            status: 'active',
            driver: 'علی رضایی',
            route: 'مسیر شمال',
            avatar: 'https://ui-avatars.com/api/?name=سارا+رضایی&background=06B6D4&color=fff'
        },
        {
            id: '2',
            name: 'محمد رضایی',
            school: 'دبیرستان پسرانه شماره ۲',
            class: 'اول',
            status: 'pending',
            driver: 'محمد کریمی',
            route: 'مسیر جنوب',
            avatar: 'https://ui-avatars.com/api/?name=محمد+رضایی&background=F59E0B&color=fff'
        }
    ];
}

// ============================================
// UPDATE PARENT UI
// ============================================
function updateParentUI() {
    // Update user info
    updateUserInfo();
    
    // Update children
    updateChildrenUI();
    
    // Update status card
    updateStatusCard();
    
    // Update notifications
    updateNotificationsUI();
    
    // Update profile
    updateProfileUI();
}

// ============================================
// UPDATE USER INFO
// ============================================
function updateUserInfo() {
    const user = AUTH.user;
    if (!user) return;
    
    // Welcome message
    const welcomeEl = document.querySelector('.welcome-section h2');
    if (welcomeEl) {
        welcomeEl.textContent = `سلام، ${user.name} 👋`;
    }
    
    // Avatar
    const avatarEl = document.querySelector('.user-avatar img');
    if (avatarEl && user.avatar) {
        avatarEl.src = user.avatar;
    }
    
    // Profile page
    const profileName = document.querySelector('.profile-card h2');
    if (profileName) {
        profileName.textContent = user.name;
    }
    
    const profilePhone = document.querySelector('.profile-details .detail-row:first-child span');
    if (profilePhone) {
        profilePhone.textContent = user.phone || '۰۹۱۲۳۴۵۶۷۸۹';
    }
    
    const profileSchool = document.querySelector('.profile-details .detail-row:last-child span');
    if (profileSchool) {
        profileSchool.textContent = user.school || 'دبستان پسرانه شماره ۱';
    }
}

// ============================================
// UPDATE CHILDREN UI
// ============================================
function updateChildrenUI() {
    const grid = document.querySelector('.children-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    childrenList.forEach((child, index) => {
        const statusMap = {
            'active': { class: 'success', icon: 'fa-check-circle', text: 'سوار شد' },
            'pending': { class: 'warning', icon: 'fa-clock', text: 'منتظر' },
            'inactive': { class: 'danger', icon: 'fa-times-circle', text: 'غایب' },
            'onway': { class: 'info', icon: 'fa-bus', text: 'در مسیر' }
        };
        
        const status = statusMap[child.status] || statusMap.pending;
        
        const card = document.createElement('div');
        card.className = 'child-card glass-premium';
        card.style.animationDelay = `${index * 0.1}s`;
        card.innerHTML = `
            <div class="child-avatar">
                <img src="${child.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(child.name)}&background=4F46E5&color=fff`}" alt="${child.name}">
                <div class="child-status-dot ${child.status}"></div>
            </div>
            <div class="child-info">
                <h3>${child.name}</h3>
                <p class="child-school"><i class="fas fa-school"></i> ${child.school}</p>
                <p class="child-class"><i class="fas fa-graduation-cap"></i> کلاس ${child.class}</p>
                <p class="child-driver"><i class="fas fa-user"></i> ${child.driver || 'نامشخص'}</p>
                <div class="child-status">
                    <span class="status-badge ${status.class}">
                        <i class="fas ${status.icon}"></i>
                        ${status.text}
                    </span>
                </div>
                <div class="child-actions">
                    <button class="btn btn-sm btn-primary" onclick="viewChildDetails('${child.id}')">
                        <i class="fas fa-eye"></i>
                        جزئیات
                    </button>
                    <button class="btn btn-sm btn-outline" onclick="trackChild('${child.id}')">
                        <i class="fas fa-map-marker-alt"></i>
                        مسیریابی
                    </button>
                    <button class="btn btn-sm btn-outline" onclick="manageService('${child.id}')">
                        <i class="fas fa-bus"></i>
                    </button>
                </div>
            </div>
        `;
        
        grid.appendChild(card);
    });
    
    // Add "Add Child" card
    const addCard = document.createElement('div');
    addCard.className = 'child-card glass-premium add-child';
    addCard.style.cssText = 'display: flex; align-items: center; justify-content: center; min-height: 200px; cursor: pointer; border: 2px dashed var(--border-color);';
    addCard.innerHTML = `
        <div style="text-align: center;" onclick="openAddChildModal()">
            <i class="fas fa-plus-circle" style="font-size: 48px; color: var(--primary);"></i>
            <p style="margin-top: 12px; font-weight: 600; color: var(--text-secondary);">افزودن دانش‌آموز جدید</p>
            <span style="font-size: 13px; color: var(--text-light);">حداکثر ۵ دانش‌آموز</span>
        </div>
    `;
    grid.appendChild(addCard);
}

// ============================================
// UPDATE STATUS CARD
// ============================================
function updateStatusCard() {
    const statusBadge = document.querySelector('.status-badge');
    const statusTime = document.querySelector('.status-time');
    
    if (statusBadge) {
        const statuses = [
            { class: 'success', icon: 'fa-check-circle', text: 'سرویس در حال حرکت است' },
            { class: 'warning', icon: 'fa-clock', text: 'سرویس در راه است' },
            { class: 'info', icon: 'fa-bus', text: 'سرویس نزدیک می‌شود' }
        ];
        
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        statusBadge.className = `status-badge ${randomStatus.class}`;
        statusBadge.innerHTML = `<i class="fas ${randomStatus.icon}"></i> ${randomStatus.text}`;
    }
    
    if (statusTime) {
        const now = new Date();
        statusTime.textContent = now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
    }
    
    // Update timeline
    updateTimeline();
}

// ============================================
// UPDATE TIMELINE
// ============================================
function updateTimeline() {
    const items = document.querySelectorAll('.timeline-item');
    if (items.length === 0) return;
    
    const now = new Date();
    
    items.forEach((item, index) => {
        item.className = 'timeline-item';
        const timeSpan = item.querySelector('.timeline-time');
        const icon = item.querySelector('.timeline-icon i');
        
        if (index === 0) {
            item.classList.add('completed');
            if (timeSpan) {
                const time = new Date(now.getTime() - 45 * 60000);
                timeSpan.textContent = time.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
            }
            if (icon) {
                icon.className = 'fas fa-check-circle';
            }
        } else if (index === 1) {
            item.classList.add('active');
            if (timeSpan) {
                timeSpan.textContent = 'در حال حرکت';
                timeSpan.style.color = 'var(--primary)';
                timeSpan.style.fontWeight = '600';
            }
            if (icon) {
                icon.className = 'fas fa-spinner fa-spin';
            }
        } else {
            if (timeSpan) {
                const time = new Date(now.getTime() + (index - 1) * 15 * 60000);
                timeSpan.textContent = time.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
                timeSpan.style.color = '';
                timeSpan.style.fontWeight = '';
            }
            if (icon) {
                icon.className = 'fas fa-clock';
            }
        }
    });
}

// ============================================
// UPDATE NOTIFICATIONS UI
// ============================================
function updateNotificationsUI() {
    const list = document.querySelector('.notifications-list');
    if (!list) return;
    
    list.innerHTML = '';
    
    const notifications = APP.notifications.length > 0 ? APP.notifications : [
        { id: '1', message: 'سرویس سارا وارد محدوده مدرسه شد.', time: '۵ دقیقه پیش', read: false, type: 'info' },
        { id: '2', message: 'راننده سرویس شما سرویس را آغاز کرد.', time: '۱۵ دقیقه پیش', read: false, type: 'success' },
        { id: '3', message: 'سرویس شما ۵ دقیقه دیگر می‌رسد.', time: '۲ ساعت پیش', read: true, type: 'warning' },
        { id: '4', message: 'وضعیت سرویس محمد تغییر کرد.', time: '۳ ساعت پیش', read: true, type: 'info' }
    ];
    
    const icons = {
        'success': 'fa-check-circle',
        'warning': 'fa-exclamation-triangle',
        'error': 'fa-times-circle',
        'info': 'fa-info-circle'
    };
    
    const colors = {
        'success': '#10B981',
        'warning': '#F59E0B',
        'error': '#EF4444',
        'info': '#4F46E5'
    };
    
    notifications.forEach(notif => {
        const item = document.createElement('div');
        item.className = `notification-item glass-premium${notif.read ? '' : ' unread'}`;
        item.innerHTML = `
            <div class="notif-icon" style="background: ${colors[notif.type] || colors.info}20;">
                <i class="fas ${icons[notif.type] || icons.info}" style="color: ${colors[notif.type] || colors.info};"></i>
            </div>
            <div class="notif-content">
                <p>${notif.message}</p>
                <span class="notif-time"><i class="far fa-clock"></i> ${notif.time}</span>
            </div>
            ${!notif.read ? '<span class="notif-unread-dot"></span>' : ''}
        `;
        
        item.addEventListener('click', function() {
            this.classList.remove('unread');
            markNotificationRead(notif.id);
        });
        
        list.appendChild(item);
    });
    
    // Update badge count
    const unreadCount = notifications.filter(n => !n.read).length;
    updateBadgeCount(unreadCount);
}

// ============================================
// UPDATE PROFILE UI
// ============================================
function updateProfileUI() {
    const user = AUTH.user;
    if (!user) return;
    
    // Settings
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.checked = APP.theme === 'dark';
    }
    
    // Notification settings
    const notifToggle = document.querySelector('.settings-item:nth-child(2) input');
    if (notifToggle) {
        notifToggle.checked = APP.settings.notifications !== false;
    }
    
    // Language
    const langSelect = document.querySelector('.settings-item:last-child select');
    if (langSelect) {
        langSelect.value = APP.settings.language || 'fa';
    }
}

// ============================================
// NOTIFICATIONS
// ============================================
function initNotifications() {
    // Check for new notifications periodically
    if (notificationInterval) {
        clearInterval(notificationInterval);
    }
    
    notificationInterval = setInterval(() => {
        checkNewNotifications();
    }, 30000);
}

async function checkNewNotifications() {
    try {
        const response = await api.request('/notifications');
        if (response.success) {
            const newNotifs = response.notifications.filter(n => !n.read);
            if (newNotifs.length > 0) {
                APP.notifications = response.notifications;
                updateNotificationsUI();
                showToast(`${newNotifs.length} اعلان جدید دارید`, 'info');
            }
        }
    } catch (error) {
        // Silently fail
    }
}

function markNotificationRead(notifId) {
    const notif = APP.notifications.find(n => n.id === notifId);
    if (notif) {
        notif.read = true;
        const unreadCount = APP.notifications.filter(n => !n.read).length;
        updateBadgeCount(unreadCount);
    }
}

function markAllRead() {
    APP.notifications.forEach(n => n.read = true);
    updateNotificationsUI();
    updateBadgeCount(0);
    showToast('همه اعلان‌ها خوانده شدند', 'success');
}

function updateBadgeCount(count) {
    document.querySelectorAll('.notif-btn .badge, .sidebar-nav .badge, .bottom-nav .badge').forEach(badge => {
        if (count > 0) {
            badge.textContent = count;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
    });
}

// ============================================
// REAL-TIME UPDATES
// ============================================
function startRealtimeUpdates() {
    // Update status every 5 seconds
    setInterval(() => {
        updateStatusCard();
    }, 5000);
    
    // Update map info every 3 seconds
    setInterval(() => {
        updateMapInfo();
    }, 3000);
}

function updateMapInfo() {
    const etaElement = document.getElementById('etaTime');
    const speedElement = document.getElementById('speedDisplay');
    
    if (etaElement) {
        const times = ['۳ دقیقه تا رسیدن', '۵ دقیقه تا رسیدن', '۷ دقیقه تا رسیدن', '۹ دقیقه تا رسیدن'];
        etaElement.textContent = times[Math.floor(Math.random() * times.length)];
    }
    
    if (speedElement) {
        const speeds = ['۳۵ km/h', '۴۲ km/h', '۲۸ km/h', '۴۸ km/h'];
        speedElement.textContent = speeds[Math.floor(Math.random() * speeds.length)];
    }
}

// ============================================
// CHILD ACTIONS
// ============================================
function viewChildDetails(childId) {
    const child = childrenList.find(c => c.id === childId);
    if (!child) {
        showToast('دانش‌آموز یافت نشد', 'error');
        return;
    }
    
    // Show child details in modal
    const modal = document.getElementById('childDetailsModal');
    if (modal) {
        document.getElementById('childDetailName').textContent = child.name;
        document.getElementById('childDetailSchool').textContent = child.school;
        document.getElementById('childDetailClass').textContent = `کلاس ${child.class}`;
        document.getElementById('childDetailDriver').textContent = child.driver || 'نامشخص';
        document.getElementById('childDetailStatus').textContent = child.status === 'active' ? 'فعال' : 'در انتظار';
        document.getElementById('childDetailStatus').className = `status-badge ${child.status === 'active' ? 'success' : 'warning'}`;
        document.getElementById('childDetailRoute').textContent = child.route || 'نامشخص';
        openModal('childDetailsModal');
    } else {
        showToast(`جزئیات ${child.name}`, 'info');
    }
}

function trackChild(childId) {
    const child = childrenList.find(c => c.id === childId);
    if (!child) {
        showToast('دانش‌آموز یافت نشد', 'error');
        return;
    }
    
    navigateTo('map');
    showToast(`ردیابی ${child.name} روی نقشه`, 'info');
    
    // Switch route based on child
    if (child.route === 'مسیر جنوب') {
        switchRoute('south');
    } else {
        switchRoute('north');
    }
}

function manageService(childId) {
    const child = childrenList.find(c => c.id === childId);
    if (!child) {
        showToast('دانش‌آموز یافت نشد', 'error');
        return;
    }
    
    showToast(`مدیریت سرویس ${child.name}`, 'info');
}

// ============================================
// ADD CHILD MODAL
// ============================================
function openAddChildModal() {
    openModal('addChildModal');
}

function submitAddChild(e) {
    e.preventDefault();
    
    const name = document.getElementById('childName').value.trim();
    const school = document.getElementById('childSchool').value;
    const className = document.getElementById('childClass').value.trim();
    
    if (!name || !school || !className) {
        showToast('لطفاً تمام فیلدها را پر کنید', 'error');
        return;
    }
    
    // Create new child
    const newChild = {
        id: Date.now().toString(),
        name: name,
        school: school,
        class: className,
        status: 'pending',
        driver: 'در انتظار اختصاص',
        route: 'نامشخص',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4F46E5&color=fff`
    };
    
    childrenList.push(newChild);
    updateChildrenUI();
    closeModal('addChildModal');
    showToast(`${name} با موفقیت اضافه شد! 🎉`, 'success');
    
    // Reset form
    document.getElementById('addChildForm').reset();
}

// ============================================
// NOTIFICATION NAVIGATION
// ============================================
function showNotifications() {
    navigateTo('notifications');
}

// ============================================
// EXPOSE GLOBALS
// ============================================
window.viewChildDetails = viewChildDetails;
window.trackChild = trackChild;
window.manageService = manageService;
window.openAddChildModal = openAddChildModal;
window.submitAddChild = submitAddChild;
window.showNotifications = showNotifications;
window.markAllRead = markAllRead;
window.updateBadgeCount = updateBadgeCount;