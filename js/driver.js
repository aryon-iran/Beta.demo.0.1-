// ============================================
// DRIVER DASHBOARD - Version 3.0
// ============================================

let driverData = null;
let studentsList = [];
let isServiceActive = false;
let serviceTimer = null;
let remainingTime = 45;

// ============================================
// INITIALIZE
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    if (!AUTH.isAuthenticated) {
        window.location.href = 'login.html';
        return;
    }
    
    if (AUTH.user?.role !== 'driver') {
        window.location.href = 'login.html';
        return;
    }
    
    initDriverDashboard();
});

// ============================================
// INIT DRIVER DASHBOARD
// ============================================
async function initDriverDashboard() {
    try {
        showLoading('در حال بارگذاری داشبورد راننده...');
        
        await loadDriverData();
        updateDriverUI();
        
        // Initialize map
        if (document.getElementById('driverRouteMap')) {
            setTimeout(() => {
                initMap('driverRouteMap', 'north');
            }, 500);
        }
        
        hideLoading();
        
        setTimeout(() => {
            showToast(`سلام ${AUTH.user?.name}! 🚌`, 'success');
        }, 500);
        
    } catch (error) {
        hideLoading();
        showToast('خطا در بارگذاری داشبورد', 'error');
        console.error('Driver dashboard error:', error);
    }
}

// ============================================
// LOAD DRIVER DATA
// ============================================
async function loadDriverData() {
    try {
        // Get students
        const response = await api.request('/students');
        if (response.success) {
            studentsList = response.students || [];
        }
        
        // Get services
        const serviceResponse = await api.request('/services');
        if (serviceResponse.success) {
            driverData = serviceResponse.services;
        }
        
        // Fallback data
        if (studentsList.length === 0) {
            studentsList = [
                { id: '1', name: 'سارا رضایی', school: 'دبستان پسرانه شماره ۱', class: 'سوم', status: 'active' },
                { id: '2', name: 'محمد رضایی', school: 'دبیرستان پسرانه شماره ۲', class: 'اول', status: 'pending' },
                { id: '3', name: 'زهرا احمدی', school: 'دبستان دخترانه شماره ۳', class: 'چهارم', status: 'inactive' },
                { id: '4', name: 'امیر حسینی', school: 'دبستان پسرانه شماره ۴', class: 'دوم', status: 'active' },
                { id: '5', name: 'نازنین کریمی', school: 'دبیرستان دخترانه شماره ۵', class: 'اول', status: 'pending' }
            ];
        }
        
    } catch (error) {
        console.error('Load driver data error:', error);
        studentsList = getFallbackStudents();
    }
}

// ============================================
// GET FALLBACK DATA
// ============================================
function getFallbackStudents() {
    return [
        { id: '1', name: 'سارا رضایی', school: 'دبستان پسرانه شماره ۱', class: 'سوم', status: 'active' },
        { id: '2', name: 'محمد رضایی', school: 'دبیرستان پسرانه شماره ۲', class: 'اول', status: 'pending' },
        { id: '3', name: 'زهرا احمدی', school: 'دبستان دخترانه شماره ۳', class: 'چهارم', status: 'inactive' }
    ];
}

// ============================================
// UPDATE DRIVER UI
// ============================================
function updateDriverUI() {
    updateDriverInfo();
    updateStudentsList();
    updateRouteStops();
    updateStats();
}

// ============================================
// UPDATE DRIVER INFO
// ============================================
function updateDriverInfo() {
    const user = AUTH.user;
    if (!user) return;
    
    const avatar = document.querySelector('.user-avatar img');
    if (avatar) {
        avatar.src = user.avatar || 'https://ui-avatars.com/api/?name=علی+رضایی&background=7C3AED&color=fff';
    }
    
    const profileName = document.querySelector('.profile-card h2');
    if (profileName) {
        profileName.textContent = user.name || 'علی رضایی';
    }
    
    const profilePhone = document.querySelector('.profile-details .detail-row:first-child span');
    if (profilePhone) {
        profilePhone.textContent = user.phone || '۰۹۱۲۳۴۵۶۷۸۹';
    }
    
    const profileVehicle = document.querySelector('.profile-details .detail-row:nth-child(2) span');
    if (profileVehicle) {
        profileVehicle.textContent = 'سمند — ۱۲۳۴۵ ایران ۱۱';
    }
}

// ============================================
// UPDATE STUDENTS LIST
// ============================================
function updateStudentsList() {
    const list = document.querySelector('.students-list');
    if (!list) return;
    
    list.innerHTML = '';
    
    const statusMap = {
        'active': { class: 'success', icon: 'fa-check-circle', text: 'سوار شد' },
        'pending': { class: 'warning', icon: 'fa-clock', text: 'منتظر' },
        'inactive': { class: 'danger', icon: 'fa-times-circle', text: 'غایب' },
        'onway': { class: 'info', icon: 'fa-bus', text: 'در مسیر' }
    };
    
    studentsList.forEach((student, index) => {
        const status = statusMap[student.status] || statusMap.pending;
        
        const item = document.createElement('div');
        item.className = 'student-item glass-premium';
        item.style.animationDelay = `${index * 0.05}s`;
        item.innerHTML = `
            <div class="student-info">
                <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=${Math.floor(Math.random()*16777215).toString(16)}&color=fff&size=40" alt="${student.name}">
                <div>
                    <h4>${student.name}</h4>
                    <p>${student.school} - کلاس ${student.class}</p>
                </div>
            </div>
            <div class="student-status">
                <span class="status-badge ${status.class}">
                    <i class="fas ${status.icon}"></i>
                    ${status.text}
                </span>
                <div class="student-actions">
                    <button class="btn btn-sm btn-outline" onclick="changeStudentStatus('${student.id}', 'active')" title="سوار شد">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn btn-sm btn-outline" onclick="changeStudentStatus('${student.id}', 'pending')" title="منتظر">
                        <i class="fas fa-clock"></i>
                    </button>
                    <button class="btn btn-sm btn-outline" onclick="changeStudentStatus('${student.id}', 'inactive')" title="غایب">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
        list.appendChild(item);
    });
    
    // Add stats
    const activeCount = studentsList.filter(s => s.status === 'active').length;
    const totalCount = studentsList.length;
    const statsEl = document.querySelector('.students-stats');
    if (statsEl) {
        statsEl.innerHTML = `
            <span><i class="fas fa-users"></i> ${totalCount} دانش‌آموز</span>
            <span><i class="fas fa-check-circle" style="color: var(--success);"></i> ${activeCount} سوار شدند</span>
        `;
    }
}

// ============================================
// UPDATE ROUTE STOPS
// ============================================
function updateRouteStops() {
    const stopList = document.querySelector('.stop-list');
    if (!stopList) return;
    
    const stops = [
        { name: 'خانه سارا', status: 'completed', time: '۰۷:۳۰' },
        { name: 'میدان آزادی', status: 'active', time: '۰۷:۴۵' },
        { name: 'خیابان ولیعصر', status: 'pending', time: '۰۸:۰۰' },
        { name: 'مدرسه', status: 'pending', time: '۰۸:۳۰' }
    ];
    
    stopList.innerHTML = '';
    
    stops.forEach((stop, index) => {
        const item = document.createElement('div');
        item.className = `stop-item ${stop.status}`;
        
        const statusIcons = {
            'completed': '<i class="fas fa-check-circle" style="color: var(--success);"></i>',
            'active': '<i class="fas fa-spinner fa-spin" style="color: var(--warning);"></i>',
            'pending': '<i class="fas fa-clock" style="color: var(--text-light);"></i>'
        };
        
        item.innerHTML = `
            <span class="stop-number">${index + 1}</span>
            <span class="stop-name">${stop.name}</span>
            <span class="stop-time">${stop.time}</span>
            <span class="stop-status">${statusIcons[stop.status] || statusIcons.pending}</span>
        `;
        stopList.appendChild(item);
    });
}

// ============================================
// UPDATE STATS
// ============================================
function updateStats() {
    const total = studentsList.length;
    const active = studentsList.filter(s => s.status === 'active').length;
    const pending = studentsList.filter(s => s.status === 'pending').length;
    
    document.querySelectorAll('.driver-stats .stat-number').forEach((el, index) => {
        if (index === 0) el.textContent = total;
        else if (index === 1) el.textContent = active;
        else if (index === 2) el.textContent = pending;
    });
}

// ============================================
// CHANGE STUDENT STATUS
// ============================================
function changeStudentStatus(studentId, newStatus) {
    const student = studentsList.find(s => s.id === studentId);
    if (!student) {
        showToast('دانش‌آموز یافت نشد', 'error');
        return;
    }
    
    student.status = newStatus;
    updateStudentsList();
    updateStats();
    
    const statusText = {
        'active': 'سوار شد ✅',
        'pending': 'منتظر ⏳',
        'inactive': 'غایب ❌'
    };
    
    showToast(`وضعیت ${student.name} به "${statusText[newStatus]}" تغییر کرد`, 'info');
}

// ============================================
// TOGGLE SERVICE
// ============================================
function toggleService() {
    isServiceActive = !isServiceActive;
    
    const btn = document.getElementById('startServiceBtn');
    const statusBadge = document.querySelector('.driver-status .status-badge');
    const statusIndicator = document.querySelector('.driver-status .status-indicator');
    
    if (isServiceActive) {
        btn.innerHTML = '<i class="fas fa-stop"></i> پایان سرویس';
        btn.className = 'btn btn-danger btn-lg btn-glow';
        if (statusBadge) {
            statusBadge.className = 'status-badge success';
            statusBadge.innerHTML = '<i class="fas fa-circle"></i> در حال حرکت';
        }
        if (statusIndicator) {
            statusIndicator.innerHTML = `
                <div class="status-pulse active"></div>
                <span style="font-weight: 600; color: var(--success);">سرویس فعال</span>
            `;
        }
        showToast('سرویس شروع شد! 🚌', 'success');
        startServiceTimer();
    } else {
        btn.innerHTML = '<i class="fas fa-play"></i> شروع سرویس';
        btn.className = 'btn btn-primary btn-lg btn-glow';
        if (statusBadge) {
            statusBadge.className = 'status-badge active';
            statusBadge.innerHTML = '<i class="fas fa-circle"></i> آماده سرویس';
        }
        if (statusIndicator) {
            statusIndicator.innerHTML = `
                <div class="status-pulse"></div>
                <span style="font-weight: 600; color: var(--warning);">آماده سرویس</span>
            `;
        }
        showToast('سرویس به پایان رسید ✅', 'info');
        stopServiceTimer();
    }
}

// ============================================
// SERVICE TIMER
// ============================================
function startServiceTimer() {
    if (serviceTimer) clearInterval(serviceTimer);
    
    remainingTime = 45;
    updateRemainingTime();
    
    serviceTimer = setInterval(() => {
        remainingTime--;
        updateRemainingTime();
        
        if (remainingTime <= 0) {
            clearInterval(serviceTimer);
            serviceTimer = null;
            showToast('سرویس به مقصد رسید! 🏁', 'success');
            toggleService();
        }
    }, 1000);
}

function stopServiceTimer() {
    if (serviceTimer) {
        clearInterval(serviceTimer);
        serviceTimer = null;
    }
    remainingTime = 45;
    updateRemainingTime();
}

function updateRemainingTime() {
    const el = document.getElementById('remainingTime');
    if (el) {
        const minutes = Math.floor(remainingTime / 60);
        const seconds = remainingTime % 60;
        el.textContent = `${minutes}:${String(seconds).padStart(2, '0')}`;
        
        // Change color based on time
        if (remainingTime < 10) {
            el.style.color = 'var(--danger)';
        } else if (remainingTime < 20) {
            el.style.color = 'var(--warning)';
        } else {
            el.style.color = 'var(--success)';
        }
    }
}

// ============================================
// EXPOSE GLOBALS
// ============================================
window.toggleService = toggleService;
window.changeStudentStatus = changeStudentStatus;