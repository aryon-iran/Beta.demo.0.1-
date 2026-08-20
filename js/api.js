// ============================================
// API MODULE - Complete System
// ============================================

// ============================================
// API CONFIG
// ============================================
const API_CONFIG = {
    baseURL: '/api/v1',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
};

// ============================================
// MOCK DATA STORE
// ============================================
const MOCK_DB = {
    students: [
        { id: '1', name: 'سارا رضایی', class: 'سوم', school: 'دبستان پسرانه شماره ۱', service: 'سرویس ۱', status: 'active', parent: 'علی رضایی', phone: '09123456789' },
        { id: '2', name: 'محمد رضایی', class: 'اول', school: 'دبیرستان پسرانه شماره ۲', service: 'سرویس ۲', status: 'pending', parent: 'علی رضایی', phone: '09123456789' },
        { id: '3', name: 'زهرا احمدی', class: 'چهارم', school: 'دبستان دخترانه شماره ۳', service: 'سرویس ۳', status: 'inactive', parent: 'مریم احمدی', phone: '09128765432' }
    ],
    drivers: [
        { id: '1', name: 'علی رضایی', vehicle: 'سمند - ۱۲۳۴۵ ایران ۱۱', service: 'سرویس ۱', status: 'active', rating: 4.8, trips: 156 },
        { id: '2', name: 'محمد کریمی', vehicle: 'پژو ۴۰۵ - ۵۴۳۲۱ ایران ۲۲', service: 'سرویس ۲', status: 'active', rating: 4.5, trips: 89 }
    ],
    schools: [
        { id: '1', name: 'دبستان پسرانه شماره ۱', code: 'SCH-۰۰۱', students: 250, services: 8, status: 'active', address: 'تهران، خیابان ولیعصر' },
        { id: '2', name: 'دبیرستان دخترانه شماره ۲', code: 'SCH-۰۰۲', students: 180, services: 6, status: 'active', address: 'تهران، خیابان انقلاب' }
    ],
    services: [
        { id: '1', name: 'سرویس ۱', driver: 'علی رضایی', students: 12, status: 'active', route: 'مسیر شمال', startTime: '07:30', endTime: '08:30' },
        { id: '2', name: 'سرویس ۲', driver: 'محمد کریمی', students: 10, status: 'active', route: 'مسیر جنوب', startTime: '07:45', endTime: '08:45' }
    ],
    parents: [
        { id: '1', name: 'علی رضایی', phone: '09123456789', children: ['سارا رضایی', 'محمد رضایی'], school: 'دبستان پسرانه شماره ۱' },
        { id: '2', name: 'مریم احمدی', phone: '09128765432', children: ['زهرا احمدی'], school: 'دبستان دخترانه شماره ۳' }
    ],
    notifications: [
        { id: '1', message: 'سرویس سارا وارد محدوده مدرسه شد.', time: '۵ دقیقه پیش', read: false, type: 'info' },
        { id: '2', message: 'راننده سرویس شما سرویس را آغاز کرد.', time: '۱۵ دقیقه پیش', read: false, type: 'success' },
        { id: '3', message: 'سرویس شما ۵ دقیقه دیگر می‌رسد.', time: '۲ ساعت پیش', read: true, type: 'warning' }
    ],
    routes: [
        { id: '1', name: 'مسیر شمال', stops: ['خانه سارا', 'میدان آزادی', 'خیابان ولیعصر', 'مدرسه'], distance: '۱۲ کیلومتر', duration: '۴۵ دقیقه' },
        { id: '2', name: 'مسیر جنوب', stops: ['خانه محمد', 'پارک شهر', 'خیابان انقلاب', 'مدرسه'], distance: '۱۵ کیلومتر', duration: '۵۰ دقیقه' }
    ]
};

// ============================================
// API CLASS
// ============================================
class API {
    constructor() {
        this.baseURL = API_CONFIG.baseURL;
        this.headers = API_CONFIG.headers;
        this.mockDB = MOCK_DB;
        this.isMock = true; // Set to false for real API
    }

    // ============================================
    // REQUEST METHOD
    // ============================================
    async request(endpoint, method = 'GET', data = null, options = {}) {
        if (this.isMock) {
            return this.mockRequest(endpoint, method, data);
        }
        
        return this.realRequest(endpoint, method, data, options);
    }

    // ============================================
    // REAL API REQUEST
    // ============================================
    async realRequest(endpoint, method, data, options) {
        const url = `${this.baseURL}${endpoint}`;
        const headers = { ...this.headers, ...options.headers };
        
        const token = localStorage.getItem('auth_token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        const config = {
            method,
            headers,
            ...options
        };
        
        if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            config.body = JSON.stringify(data);
        }
        
        try {
            const response = await fetch(url, config);
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'درخواست با خطا مواجه شد');
            }
            
            return result;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // ============================================
    // MOCK REQUEST
    // ============================================
    async mockRequest(endpoint, method, data) {
        await this.delay(300 + Math.random() * 400);
        
        try {
            // ====================================
            // AUTH ENDPOINTS
            // ====================================
            if (endpoint === '/auth/login') {
                return this.mockLogin(data);
            }
            
            if (endpoint === '/auth/register') {
                return this.mockRegister(data);
            }
            
            if (endpoint === '/auth/logout') {
                return { success: true };
            }
            
            if (endpoint === '/auth/refresh') {
                return { token: 'mock-refresh-token-' + Date.now() };
            }
            
            // ====================================
            // USER ENDPOINTS
            // ====================================
            if (endpoint === '/users/profile') {
                return this.mockGetProfile();
            }
            
            if (endpoint === '/users/update') {
                return this.mockUpdateProfile(data);
            }
            
            // ====================================
            // STUDENT ENDPOINTS
            // ====================================
            if (endpoint === '/students') {
                return method === 'GET' ? this.mockGetStudents() : this.mockCreateStudent(data);
            }
            
            if (endpoint.match(/\/students\/\w+/)) {
                const id = endpoint.split('/').pop();
                if (method === 'PUT') return this.mockUpdateStudent(id, data);
                if (method === 'DELETE') return this.mockDeleteStudent(id);
                return this.mockGetStudent(id);
            }
            
            // ====================================
            // DRIVER ENDPOINTS
            // ====================================
            if (endpoint === '/drivers') {
                return method === 'GET' ? this.mockGetDrivers() : this.mockCreateDriver(data);
            }
            
            if (endpoint.match(/\/drivers\/\w+/)) {
                const id = endpoint.split('/').pop();
                if (method === 'PUT') return this.mockUpdateDriver(id, data);
                if (method === 'DELETE') return this.mockDeleteDriver(id);
                return this.mockGetDriver(id);
            }
            
            // ====================================
            // SCHOOL ENDPOINTS
            // ====================================
            if (endpoint === '/schools') {
                return method === 'GET' ? this.mockGetSchools() : this.mockCreateSchool(data);
            }
            
            if (endpoint.match(/\/schools\/\w+/)) {
                const id = endpoint.split('/').pop();
                if (method === 'PUT') return this.mockUpdateSchool(id, data);
                if (method === 'DELETE') return this.mockDeleteSchool(id);
                return this.mockGetSchool(id);
            }
            
            // ====================================
            // SERVICE ENDPOINTS
            // ====================================
            if (endpoint === '/services') {
                return method === 'GET' ? this.mockGetServices() : this.mockCreateService(data);
            }
            
            if (endpoint.match(/\/services\/\w+/)) {
                const id = endpoint.split('/').pop();
                if (method === 'PUT') return this.mockUpdateService(id, data);
                if (method === 'DELETE') return this.mockDeleteService(id);
                
                if (endpoint.includes('/start')) return this.mockStartService(id);
                if (endpoint.includes('/stop')) return this.mockStopService(id);
                if (endpoint.includes('/status')) return this.mockGetServiceStatus(id);
                return this.mockGetService(id);
            }
            
            // ====================================
            // ROUTE ENDPOINTS
            // ====================================
            if (endpoint === '/routes') {
                return method === 'GET' ? this.mockGetRoutes() : this.mockCreateRoute(data);
            }
            
            if (endpoint.match(/\/routes\/\w+/)) {
                const id = endpoint.split('/').pop();
                if (method === 'PUT') return this.mockUpdateRoute(id, data);
                if (method === 'DELETE') return this.mockDeleteRoute(id);
                return this.mockGetRoute(id);
            }
            
            // ====================================
            // NOTIFICATION ENDPOINTS
            // ====================================
            if (endpoint === '/notifications') {
                return this.mockGetNotifications();
            }
            
            if (endpoint === '/notifications/read') {
                return this.mockMarkNotificationsRead();
            }
            
            if (endpoint === '/notifications/unread') {
                return this.mockGetUnreadCount();
            }
            
            // ====================================
            // DASHBOARD ENDPOINTS
            // ====================================
            if (endpoint === '/dashboard/stats') {
                return this.mockGetStats();
            }
            
            if (endpoint === '/dashboard/charts') {
                return this.mockGetCharts();
            }
            
            // ====================================
            // DEFAULT
            // ====================================
            return { success: true, data: 'Mock response for ' + endpoint };
            
        } catch (error) {
            throw new Error(error.message || 'خطا در ارتباط با سرور');
        }
    }

    // ============================================
    // MOCK HANDLERS
    // ============================================
    
    // Auth
    mockLogin(data) {
        if (data.phone && data.password && data.password.length >= 6) {
            const user = {
                id: '1',
                name: 'علی رضایی',
                phone: data.phone,
                role: data.phone.endsWith('1') ? 'admin' : 
                       data.phone.endsWith('2') ? 'driver' : 
                       data.phone.endsWith('3') ? 'school' : 'parent',
                school: 'دبستان پسرانه شماره ۱',
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent('علی رضایی')}&background=4F46E5&color=fff`
            };
            return {
                success: true,
                token: 'mock-jwt-token-' + Date.now(),
                user: user
            };
        }
        throw new Error('اطلاعات ورود نامعتبر است');
    }

    mockRegister(data) {
        const user = {
            id: Date.now().toString(),
            name: data.fullname,
            phone: data.phone,
            role: data.role,
            school: data.school || 'دبستان پسرانه شماره ۱',
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.fullname)}&background=4F46E5&color=fff`
        };
        return {
            success: true,
            token: 'mock-jwt-token-' + Date.now(),
            user: user
        };
    }

    // Users
    mockGetProfile() {
        return {
            success: true,
            user: {
                id: '1',
                name: 'علی رضایی',
                phone: '09123456789',
                role: 'parent',
                school: 'دبستان پسرانه شماره ۱',
                email: 'ali@myservice.ir',
                avatar: 'https://ui-avatars.com/api/?name=علی+رضایی&background=4F46E5&color=fff'
            }
        };
    }

    mockUpdateProfile(data) {
        return {
            success: true,
            message: 'پروفایل با موفقیت به‌روزرسانی شد',
            user: { ...this.mockGetProfile().user, ...data }
        };
    }

    // Students
    mockGetStudents() {
        return { success: true, students: this.mockDB.students };
    }

    mockGetStudent(id) {
        const student = this.mockDB.students.find(s => s.id === id);
        if (!student) throw new Error('دانش‌آموز یافت نشد');
        return { success: true, student };
    }

    mockCreateStudent(data) {
        const student = {
            id: Date.now().toString(),
            ...data,
            status: 'active'
        };
        this.mockDB.students.push(student);
        return { success: true, student };
    }

    mockUpdateStudent(id, data) {
        const index = this.mockDB.students.findIndex(s => s.id === id);
        if (index === -1) throw new Error('دانش‌آموز یافت نشد');
        this.mockDB.students[index] = { ...this.mockDB.students[index], ...data };
        return { success: true, student: this.mockDB.students[index] };
    }

    mockDeleteStudent(id) {
        const index = this.mockDB.students.findIndex(s => s.id === id);
        if (index === -1) throw new Error('دانش‌آموز یافت نشد');
        this.mockDB.students.splice(index, 1);
        return { success: true };
    }

    // Drivers
    mockGetDrivers() {
        return { success: true, drivers: this.mockDB.drivers };
    }

    mockGetDriver(id) {
        const driver = this.mockDB.drivers.find(d => d.id === id);
        if (!driver) throw new Error('راننده یافت نشد');
        return { success: true, driver };
    }

    mockCreateDriver(data) {
        const driver = {
            id: Date.now().toString(),
            ...data,
            status: 'active',
            rating: 0,
            trips: 0
        };
        this.mockDB.drivers.push(driver);
        return { success: true, driver };
    }

    mockUpdateDriver(id, data) {
        const index = this.mockDB.drivers.findIndex(d => d.id === id);
        if (index === -1) throw new Error('راننده یافت نشد');
        this.mockDB.drivers[index] = { ...this.mockDB.drivers[index], ...data };
        return { success: true, driver: this.mockDB.drivers[index] };
    }

    mockDeleteDriver(id) {
        const index = this.mockDB.drivers.findIndex(d => d.id === id);
        if (index === -1) throw new Error('راننده یافت نشد');
        this.mockDB.drivers.splice(index, 1);
        return { success: true };
    }

    // Schools
    mockGetSchools() {
        return { success: true, schools: this.mockDB.schools };
    }

    mockGetSchool(id) {
        const school = this.mockDB.schools.find(s => s.id === id);
        if (!school) throw new Error('مدرسه یافت نشد');
        return { success: true, school };
    }

    mockCreateSchool(data) {
        const school = {
            id: Date.now().toString(),
            ...data,
            status: 'active'
        };
        this.mockDB.schools.push(school);
        return { success: true, school };
    }

    mockUpdateSchool(id, data) {
        const index = this.mockDB.schools.findIndex(s => s.id === id);
        if (index === -1) throw new Error('مدرسه یافت نشد');
        this.mockDB.schools[index] = { ...this.mockDB.schools[index], ...data };
        return { success: true, school: this.mockDB.schools[index] };
    }

    mockDeleteSchool(id) {
        const index = this.mockDB.schools.findIndex(s => s.id === id);
        if (index === -1) throw new Error('مدرسه یافت نشد');
        this.mockDB.schools.splice(index, 1);
        return { success: true };
    }

    // Services
    mockGetServices() {
        return { success: true, services: this.mockDB.services };
    }

    mockGetService(id) {
        const service = this.mockDB.services.find(s => s.id === id);
        if (!service) throw new Error('سرویس یافت نشد');
        return { success: true, service };
    }

    mockCreateService(data) {
        const service = {
            id: Date.now().toString(),
            ...data,
            status: 'pending'
        };
        this.mockDB.services.push(service);
        return { success: true, service };
    }

    mockUpdateService(id, data) {
        const index = this.mockDB.services.findIndex(s => s.id === id);
        if (index === -1) throw new Error('سرویس یافت نشد');
        this.mockDB.services[index] = { ...this.mockDB.services[index], ...data };
        return { success: true, service: this.mockDB.services[index] };
    }

    mockDeleteService(id) {
        const index = this.mockDB.services.findIndex(s => s.id === id);
        if (index === -1) throw new Error('سرویس یافت نشد');
        this.mockDB.services.splice(index, 1);
        return { success: true };
    }

    mockStartService(id) {
        const service = this.mockDB.services.find(s => s.id === id);
        if (!service) throw new Error('سرویس یافت نشد');
        service.status = 'active';
        return { success: true, service };
    }

    mockStopService(id) {
        const service = this.mockDB.services.find(s => s.id === id);
        if (!service) throw new Error('سرویس یافت نشد');
        service.status = 'completed';
        return { success: true, service };
    }

    mockGetServiceStatus(id) {
        const service = this.mockDB.services.find(s => s.id === id);
        if (!service) throw new Error('سرویس یافت نشد');
        return { success: true, status: service.status };
    }

    // Routes
    mockGetRoutes() {
        return { success: true, routes: this.mockDB.routes };
    }

    mockGetRoute(id) {
        const route = this.mockDB.routes.find(r => r.id === id);
        if (!route) throw new Error('مسیر یافت نشد');
        return { success: true, route };
    }

    mockCreateRoute(data) {
        const route = {
            id: Date.now().toString(),
            ...data
        };
        this.mockDB.routes.push(route);
        return { success: true, route };
    }

    mockUpdateRoute(id, data) {
        const index = this.mockDB.routes.findIndex(r => r.id === id);
        if (index === -1) throw new Error('مسیر یافت نشد');
        this.mockDB.routes[index] = { ...this.mockDB.routes[index], ...data };
        return { success: true, route: this.mockDB.routes[index] };
    }

    mockDeleteRoute(id) {
        const index = this.mockDB.routes.findIndex(r => r.id === id);
        if (index === -1) throw new Error('مسیر یافت نشد');
        this.mockDB.routes.splice(index, 1);
        return { success: true };
    }

    // Notifications
    mockGetNotifications() {
        return { success: true, notifications: this.mockDB.notifications };
    }

    mockMarkNotificationsRead() {
        this.mockDB.notifications.forEach(n => n.read = true);
        return { success: true };
    }

    mockGetUnreadCount() {
        const count = this.mockDB.notifications.filter(n => !n.read).length;
        return { success: true, count };
    }

    // Dashboard
    mockGetStats() {
        return {
            success: true,
            stats: {
                schools: this.mockDB.schools.length,
                students: this.mockDB.students.length,
                services: this.mockDB.services.filter(s => s.status === 'active').length,
                drivers: this.mockDB.drivers.filter(d => d.status === 'active').length,
                parents: this.mockDB.parents.length,
                activeRoutes: this.mockDB.routes.length,
                completedServices: this.mockDB.services.filter(s => s.status === 'completed').length,
                pendingRequests: 5
            }
        };
    }

    mockGetCharts() {
        return {
            success: true,
            data: {
                userGrowth: {
                    labels: ['هفته ۱', 'هفته ۲', 'هفته ۳', 'هفته ۴', 'هفته ۵', 'هفته ۶'],
                    values: [150, 230, 310, 380, 450, 520]
                },
                serviceStatus: {
                    active: 8,
                    pending: 3,
                    completed: 15
                },
                dailyServices: {
                    labels: ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه'],
                    values: [8, 7, 9, 6, 8, 5]
                }
            }
        };
    }

    // ============================================
    // UTILITY
    // ============================================
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ============================================
    // GETTERS FOR EASY ACCESS
    // ============================================
    get students() { return this.mockDB.students; }
    get drivers() { return this.mockDB.drivers; }
    get schools() { return this.mockDB.schools; }
    get services() { return this.mockDB.services; }
    get parents() { return this.mockDB.parents; }
    get notifications() { return this.mockDB.notifications; }
    get routes() { return this.mockDB.routes; }
}

// ============================================
// EXPORT INSTANCE
// ============================================
const api = new API();

// ============================================
// EXPOSE GLOBALLY
// ============================================
window.api = api;
window.API = API;

// ============================================
// CONSOLE HELPERS (for debugging)
// ============================================
console.log('📡 API Module loaded');
console.log('📊 Mock Data:', MOCK_DB);
console.log('🔧 API instance:', api);