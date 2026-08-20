// ============================================
// ADMIN DASHBOARD - Version 3.0
// ============================================

let adminStats = null;
let adminSchools = [];
let adminUsers = [];

// ============================================
// INITIALIZE
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    if (!AUTH.isAuthenticated) {
        window.location.href = 'login.html';
        return;
    }
    
    if (AUTH.user?.role !== 'admin') {
        window.location.href = 'login.html';
        return;
    }
    
    initAdminDashboard();
});

// ============================================
// INIT ADMIN DASHBOARD
// ============================================
async function initAdminDashboard() {
    try {
        showLoading('در حال بارگذاری داشبورد مدیریت...');
        
        await loadAdminData();
        updateAdminUI();
        initAdminCharts();
        
        hideLoading();
        
        setTimeout(() => {
            showToast(`سلام ${AUTH.user?.name}! 👑`, 'success');
        }, 500);
        
    } catch (error) {
        hideLoading();
        showToast('خطا در بارگذاری داشبورد', 'error');
        console.error('Admin dashboard error:', error);
    }
}

// ============================================
// LOAD ADMIN DATA
// ============================================
async function loadAdminData() {
    try {
        // Get stats
        const statsResponse = await api.request('/dashboard/stats');
        if (statsResponse.success) {
            adminStats = statsResponse.stats;
        }
        
        // Get schools
        const schoolResponse = await api.request('/schools');
        if (schoolResponse.success) {
            adminSchools = schoolResponse.schools || [];
        }
        
        // Fallback
        if (!adminStats) {
            adminStats = {
                schools: 150,
                students: 2500,
                services: 120,
                drivers: 85,
                parents: 1200,
                pendingRequests: 5
            };
        }
        
        if (adminSchools.length === 0) {
            adminSchools = [
                { id: '1', name: 'دبستان پسرانه شماره ۱', code: 'SCH-۰۰۱', students: 250, services: 8, status: 'active' },
                { id: '2', name: 'دبیرستان دخترانه شماره ۲', code: 'SCH-۰۰۲', students: 180, services: 6, status: 'active' },
                { id: '3', name: 'دبستان پسرانه شماره ۳', code: 'SCH-۰۰۳', students: 200, services: 7, status: 'inactive' }
            ];
        }
        
    } catch (error) {
        console.error('Load admin data error:', error);
    }
}

// ============================================
// UPDATE ADMIN UI
// ============================================
function updateAdminUI() {
    updateAdminStats();
    updateAdminTables();
    updateRecentActivities();
}

// ============================================
// UPDATE ADMIN STATS
// ============================================
function updateAdminStats() {
    const statNumbers = document.querySelectorAll('.stat-card .stat-number');
    if (statNumbers.length >= 4) {
        statNumbers[0].textContent = adminStats.schools.toLocaleString('fa-IR');
        statNumbers[1].textContent = adminStats.parents.toLocaleString('fa-IR');
        statNumbers[2].textContent = adminStats.students.toLocaleString('fa-IR');
        statNumbers[3].textContent = adminStats.drivers;
    }
}

// ============================================
// UPDATE ADMIN TABLES
// ============================================
function updateAdminTables() {
    // Schools table
    const schoolTable = document.querySelector('#page-schools .data-table tbody');
    if (schoolTable) {
        schoolTable.innerHTML = '';
        adminSchools.forEach(school => {
            const row = document.createElement('tr');
            const statusMap = {
                'active': { class: 'success', text: 'فعال' },
                'inactive': { class: 'danger', text: 'غیرفعال' }
            };
            const status = statusMap[school.status] || statusMap.inactive;
            row.innerHTML = `
                <td>${school.name}</td>
                <td>${school.code || '---'}</td>
                <td>${school.students || 0}</td>
                <td>${school.services || 0}</td>
                <td><span class="status-badge ${status.class}">${status.text}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline" onclick="editSchool('${school.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteSchool('${school.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            schoolTable.appendChild(row);
        });
    }
}

// ============================================
// UPDATE RECENT ACTIVITIES
// ============================================
function updateRecentActivities() {
    const tableBody = document.querySelector('#page-dashboard .data-table tbody');
    if (!tableBody) return;
    
    const activities = [
        { user: 'علی رضایی', action: 'ورود به سیستم', time: '۰۸:۳۰', status: 'success' },
        { user: 'مدیر مدرسه شماره ۱', action: 'افزودن دانش‌آموز', time: '۰۸:۱۵', status: 'success' },
        { user: 'زهرا احمدی', action: 'ثبت‌نام', time: '۰۸:۰۰', status: 'pending' },
        { user: 'محمد کریمی', action: 'شروع سرویس', time: '۰۷:۵۰', status: 'success' },
        { user: 'مدیر مدرسه شماره ۲', action: 'بروزرسانی مسیر', time: '۰۷:۳۰', status: 'error' }
    ];
    
    tableBody.innerHTML = '';
    activities.forEach(activity => {
        const statusMap = {
            'success': { class: 'success', text: 'موفق' },
            'pending': { class: 'warning', text: 'در انتظار' },
            'error': { class: 'danger', text: 'خطا' }
        };
        const status = statusMap[activity.status] || statusMap.success;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${activity.user}</td>
            <td>${activity.action}</td>
            <td>${activity.time}</td>
            <td><span class="status-badge ${status.class}">${status.text}</span></td>
        `;
        tableBody.appendChild(row);
    });
}

// ============================================
// INIT ADMIN CHARTS
// ============================================
function initAdminCharts() {
    // User Growth Chart
    const growthCtx = document.getElementById('userGrowthChart');
    if (growthCtx) {
        new Chart(growthCtx, {
            type: 'line',
            data: {
                labels: ['هفته ۱', 'هفته ۲', 'هفته ۳', 'هفته ۴', 'هفته ۵', 'هفته ۶'],
                datasets: [{
                    label: 'تعداد کاربران جدید',
                    data: [150, 230, 310, 380, 450, 520],
                    borderColor: '#4F46E5',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#4F46E5',
                    pointBorderColor: 'white',
                    pointBorderWidth: 2,
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { font: { family: 'Vazirmatn' } }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { font: { family: 'Vazirmatn' } }
                    }
                }
            }
        });
    }
    
    // Service Status Chart
    const serviceCtx = document.getElementById('adminServiceStatusChart');
    if (serviceCtx) {
        new Chart(serviceCtx, {
            type: 'doughnut',
            data: {
                labels: ['در حال حرکت', 'منتظر', 'تکمیل شده'],
                datasets: [{
                    data: [65, 30, 105],
                    backgroundColor: ['#06B6D4', '#F59E0B', '#10B981'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: { family: 'Vazirmatn', size: 12 },
                            padding: 12
                        }
                    }
                },
                cutout: '70%'
            }
        });
    }
}

// ============================================
// SCHOOL MANAGEMENT
// ============================================
function openAddSchoolModal() {
    openModal('addSchoolModal');
}

function editSchool(id) {
    showToast('در حال ویرایش مدرسه...', 'info');
}

function deleteSchool(id) {
    if (confirm('آیا از حذف این مدرسه اطمینان دارید؟')) {
        const index = adminSchools.findIndex(s => s.id === id);
        if (index !== -1) {
            adminSchools.splice(index, 1);
            updateAdminTables();
            updateAdminStats();
            showToast('مدرسه با موفقیت حذف شد', 'success');
        }
    }
}

// ============================================
// EXPOSE GLOBALS
// ============================================
window.openAddSchoolModal = openAddSchoolModal;
window.editSchool = editSchool;
window.deleteSchool = deleteSchool;