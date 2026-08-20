// ============================================
// SCHOOL DASHBOARD - Version 3.0
// ============================================

let schoolData = null;
let schoolStudents = [];
let schoolDrivers = [];
let schoolServices = [];
let schoolRequests = [];

// ============================================
// INITIALIZE
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    if (!AUTH.isAuthenticated) {
        window.location.href = 'login.html';
        return;
    }
    
    if (AUTH.user?.role !== 'school') {
        window.location.href = 'login.html';
        return;
    }
    
    initSchoolDashboard();
});

// ============================================
// INIT SCHOOL DASHBOARD
// ============================================
async function initSchoolDashboard() {
    try {
        showLoading('در حال بارگذاری داشبورد مدرسه...');
        
        await loadSchoolData();
        updateSchoolUI();
        initSchoolCharts();
        
        hideLoading();
        
        setTimeout(() => {
            showToast(`سلام ${AUTH.user?.name}! 🏫`, 'success');
        }, 500);
        
    } catch (error) {
        hideLoading();
        showToast('خطا در بارگذاری داشبورد', 'error');
        console.error('School dashboard error:', error);
    }
}

// ============================================
// LOAD SCHOOL DATA
// ============================================
async function loadSchoolData() {
    try {
        // Get students
        const studentResponse = await api.request('/students');
        if (studentResponse.success) {
            schoolStudents = studentResponse.students || [];
        }
        
        // Get drivers
        const driverResponse = await api.request('/drivers');
        if (driverResponse.success) {
            schoolDrivers = driverResponse.drivers || [];
        }
        
        // Get services
        const serviceResponse = await api.request('/services');
        if (serviceResponse.success) {
            schoolServices = serviceResponse.services || [];
        }
        
        // Mock requests
        schoolRequests = [
            { id: '1', student: 'زهرا احمدی', class: 'چهارم', route: 'خیابان ولیعصر تا مدرسه', status: 'pending', time: '۰۸:۳۰' },
            { id: '2', student: 'امیر حسینی', class: 'دوم', route: 'میدان آزادی تا مدرسه', status: 'pending', time: '۰۹:۰۰' },
            { id: '3', student: 'نازنین کریمی', class: 'اول', route: 'پارک شهر تا مدرسه', status: 'approved', time: '۰۷:۴۵' }
        ];
        
        // Fallback
        if (schoolStudents.length === 0) {
            schoolStudents = [
                { id: '1', name: 'سارا رضایی', class: 'سوم', status: 'active' },
                { id: '2', name: 'محمد رضایی', class: 'اول', status: 'pending' },
                { id: '3', name: 'زهرا احمدی', class: 'چهارم', status: 'inactive' }
            ];
        }
        
        if (schoolDrivers.length === 0) {
            schoolDrivers = [
                { id: '1', name: 'علی رضایی', vehicle: 'سمند', service: 'سرویس ۱', status: 'active' },
                { id: '2', name: 'محمد کریمی', vehicle: 'پژو ۴۰۵', service: 'سرویس ۲', status: 'active' }
            ];
        }
        
        if (schoolServices.length === 0) {
            schoolServices = [
                { id: '1', name: 'سرویس ۱', driver: 'علی رضایی', students: 12, status: 'active' },
                { id: '2', name: 'سرویس ۲', driver: 'محمد کریمی', students: 10, status: 'active' }
            ];
        }
        
    } catch (error) {
        console.error('Load school data error:', error);
    }
}

// ============================================
// UPDATE SCHOOL UI
// ============================================
function updateSchoolUI() {
    updateSchoolStats();
    updateSchoolTables();
    updateRequests();
    updateActivities();
}

// ============================================
// UPDATE SCHOOL STATS
// ============================================
function updateSchoolStats() {
    const totalStudents = schoolStudents.length;
    const activeStudents = schoolStudents.filter(s => s.status === 'active').length;
    const activeDrivers = schoolDrivers.filter(d => d.status === 'active').length;
    const activeServices = schoolServices.filter(s => s.status === 'active').length;
    const pendingRequests = schoolRequests.filter(r => r.status === 'pending').length;
    
    const statNumbers = document.querySelectorAll('.stat-card .stat-number');
    if (statNumbers.length >= 5) {
        statNumbers[0].textContent = totalStudents;
        statNumbers[1].textContent = activeDrivers;
        statNumbers[2].textContent = activeServices;
        statNumbers[3].textContent = pendingRequests;
        statNumbers[4].textContent = activeStudents;
    }
}

// ============================================
// UPDATE SCHOOL TABLES
// ============================================
function updateSchoolTables() {
    // Students table
    const studentTable = document.querySelector('#page-students .data-table tbody');
    if (studentTable) {
        studentTable.innerHTML = '';
        schoolStudents.forEach(student => {
            const row = document.createElement('tr');
            const statusMap = {
                'active': { class: 'success', text: 'فعال' },
                'pending': { class: 'warning', text: 'در انتظار' },
                'inactive': { class: 'danger', text: 'غیرفعال' }
            };
            const status = statusMap[student.status] || statusMap.pending;
            row.innerHTML = `
                <td>${student.name}</td>
                <td>کلاس ${student.class}</td>
                <td>${student.service || 'نامشخص'}</td>
                <td><span class="status-badge ${status.class}">${status.text}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline" onclick="editStudent('${student.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteStudent('${student.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            studentTable.appendChild(row);
        });
    }
    
    // Drivers table
    const driverTable = document.querySelector('#page-drivers .data-table tbody');
    if (driverTable) {
        driverTable.innerHTML = '';
        schoolDrivers.forEach(driver => {
            const row = document.createElement('tr');
            const statusMap = {
                'active': { class: 'success', text: 'فعال' },
                'inactive': { class: 'danger', text: 'غیرفعال' }
            };
            const status = statusMap[driver.status] || statusMap.inactive;
            row.innerHTML = `
                <td>${driver.name}</td>
                <td>${driver.vehicle}</td>
                <td>${driver.service || 'نامشخص'}</td>
                <td><span class="status-badge ${status.class}">${status.text}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline" onclick="editDriver('${driver.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteDriver('${driver.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            driverTable.appendChild(row);
        });
    }
}

// ============================================
// UPDATE REQUESTS
// ============================================
function updateRequests() {
    const list = document.querySelector('.requests-list');
    if (!list) return;
    
    list.innerHTML = '';
    const pendingRequests = schoolRequests.filter(r => r.status === 'pending');
    
    if (pendingRequests.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-check-circle" style="font-size: 48px; color: var(--success);"></i>
                <h4>همه درخواست‌ها بررسی شده‌اند</h4>
                <p style="color: var(--text-secondary);">درخواست جدیدی برای بررسی وجود ندارد</p>
            </div>
        `;
        return;
    }
    
    pendingRequests.forEach(request => {
        const item = document.createElement('div');
        item.className = 'request-item glass-premium';
        item.dataset.id = request.id;
        item.innerHTML = `
            <div class="request-info">
                <h4>${request.student}</h4>
                <p><i class="fas fa-graduation-cap"></i> کلاس ${request.class}</p>
                <p><i class="fas fa-route"></i> ${request.route}</p>
                <p><i class="fas fa-clock"></i> ${request.time}</p>
            </div>
            <div class="request-actions">
                <button class="btn btn-success btn-sm" onclick="approveRequest('${request.id}')">
                    <i class="fas fa-check"></i> تایید
                </button>
                <button class="btn btn-danger btn-sm" onclick="rejectRequest('${request.id}')">
                    <i class="fas fa-times"></i> رد
                </button>
            </div>
        `;
        list.appendChild(item);
    });
}

// ============================================
// UPDATE ACTIVITIES
// ============================================
function updateActivities() {
    const list = document.querySelector('.activity-list');
    if (!list) return;
    
    const activities = [
        { time: '۰۸:۳۰', action: 'سرویس شماره ۳ حرکت خود را آغاز کرد' },
        { time: '۰۸:۱۵', action: 'دانش‌آموز جدید به کلاس سوم اضافه شد' },
        { time: '۰۸:۰۰', action: 'درخواست جدید سرویس ثبت شد' },
        { time: '۰۷:۴۵', action: 'سرویس شماره ۱ به مدرسه رسید' },
        { time: '۰۷:۳۰', action: 'راننده علی رضایی وارد سیستم شد' }
    ];
    
    list.innerHTML = '';
    activities.forEach(activity => {
        const item = document.createElement('div');
        item.className = 'activity-item';
        item.innerHTML = `
            <span class="activity-time">${activity.time}</span>
            <span>${activity.action}</span>
        `;
        list.appendChild(item);
    });
}

// ============================================
// INIT SCHOOL CHARTS
// ============================================
function initSchoolCharts() {
    // Active Services Chart
    const servicesCtx = document.getElementById('activeServicesChart');
    if (servicesCtx) {
        new Chart(servicesCtx, {
            type: 'bar',
            data: {
                labels: ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه'],
                datasets: [{
                    label: 'سرویس‌های فعال',
                    data: [8, 7, 9, 6, 8, 5],
                    backgroundColor: 'rgba(79, 70, 229, 0.6)',
                    borderColor: '#4F46E5',
                    borderWidth: 2,
                    borderRadius: 6
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
                        ticks: {
                            stepSize: 2,
                            font: { family: 'Vazirmatn' }
                        }
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
    const statusCtx = document.getElementById('serviceStatusChart');
    if (statusCtx) {
        new Chart(statusCtx, {
            type: 'doughnut',
            data: {
                labels: ['در حال حرکت', 'منتظر', 'تکمیل شده'],
                datasets: [{
                    data: [8, 3, 15],
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
// STUDENT ACTIONS
// ============================================
function openAddStudentModal() {
    openModal('addStudentModal');
}

function editStudent(id) {
    showToast('در حال ویرایش دانش‌آموز...', 'info');
}

function deleteStudent(id) {
    if (confirm('آیا از حذف این دانش‌آموز اطمینان دارید؟')) {
        const index = schoolStudents.findIndex(s => s.id === id);
        if (index !== -1) {
            schoolStudents.splice(index, 1);
            updateSchoolTables();
            updateSchoolStats();
            showToast('دانش‌آموز با موفقیت حذف شد', 'success');
        }
    }
}

// ============================================
// DRIVER ACTIONS
// ============================================
function openAddDriverModal() {
    openModal('addDriverModal');
}

function editDriver(id) {
    showToast('در حال ویرایش راننده...', 'info');
}

function deleteDriver(id) {
    if (confirm('آیا از حذف این راننده اطمینان دارید؟')) {
        const index = schoolDrivers.findIndex(d => d.id === id);
        if (index !== -1) {
            schoolDrivers.splice(index, 1);
            updateSchoolTables();
            updateSchoolStats();
            showToast('راننده با موفقیت حذف شد', 'success');
        }
    }
}

// ============================================
// SERVICE ACTIONS
// ============================================
function openAddServiceModal() {
    openModal('addServiceModal');
}

// ============================================
// REQUEST ACTIONS
// ============================================
function approveRequest(id) {
    const request = schoolRequests.find(r => r.id === id);
    if (request) {
        request.status = 'approved';
        updateRequests();
        updateSchoolStats();
        showToast('درخواست با موفقیت تایید شد ✅', 'success');
    }
}

function rejectRequest(id) {
    const request = schoolRequests.find(r => r.id === id);
    if (request) {
        request.status = 'rejected';
        updateRequests();
        updateSchoolStats();
        showToast('درخواست رد شد ❌', 'error');
    }
}

// ============================================
// EXPOSE GLOBALS
// ============================================
window.openAddStudentModal = openAddStudentModal;
window.openAddDriverModal = openAddDriverModal;
window.openAddServiceModal = openAddServiceModal;
window.editStudent = editStudent;
window.deleteStudent = deleteStudent;
window.editDriver = editDriver;
window.deleteDriver = deleteDriver;
window.approveRequest = approveRequest;
window.rejectRequest = rejectRequest;