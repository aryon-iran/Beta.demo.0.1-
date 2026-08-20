// ============================================
// AUTHENTICATION MODULE - Premium
// ============================================

// ============================================
// AUTH STATE
// ============================================
const AUTH = {
    user: null,
    token: null,
    isAuthenticated: false,
    rememberMe: false
};

// ============================================
// INIT AUTH
// ============================================
function initAuth() {
    // Check for saved session
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('auth_user');
    
    if (token && user) {
        AUTH.token = token;
        AUTH.user = JSON.parse(user);
        AUTH.isAuthenticated = true;
        AUTH.rememberMe = localStorage.getItem('remember_me') === 'true';
        return true;
    }
    
    // Check for guest session
    const guest = localStorage.getItem('guest_user');
    if (guest) {
        AUTH.user = JSON.parse(guest);
        AUTH.isAuthenticated = false;
        return true;
    }
    
    return false;
}

// ============================================
// LOGIN
// ============================================
async function login(phone, password, rememberMe = false) {
    try {
        // Show loading
        showLoading('در حال ورود...');
        
        // Validate
        if (!phone || !validatePhone(phone)) {
            throw new Error('شماره موبایل نامعتبر است');
        }
        
        if (!password || password.length < 6) {
            throw new Error('رمز عبور باید حداقل ۶ کاراکتر باشد');
        }
        
        // Simulate API call
        await sleep(1500);
        
        // Mock user data based on phone number
        let role = 'parent';
        let name = 'علی رضایی';
        let school = 'دبستان پسرانه شماره ۱';
        
        // Determine role based on phone number (for demo)
        if (phone.endsWith('1')) {
            role = 'admin';
            name = 'مدیر سیستم';
            school = 'سیستم مرکزی';
        } else if (phone.endsWith('2')) {
            role = 'driver';
            name = 'محمد کریمی';
            school = 'دبستان پسرانه شماره ۱';
        } else if (phone.endsWith('3')) {
            role = 'school';
            name = 'مدیر مدرسه';
            school = 'دبستان پسرانه شماره ۱';
        }
        
        const user = {
            id: Date.now().toString(),
            name: name,
            phone: phone,
            role: role,
            school: school,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4F46E5&color=fff&size=128`,
            email: `${phone}@myservice.ir`,
            createdAt: new Date().toISOString()
        };
        
        // Save auth data
        AUTH.user = user;
        AUTH.isAuthenticated = true;
        AUTH.rememberMe = rememberMe;
        
        localStorage.setItem('auth_user', JSON.stringify(user));
        localStorage.setItem('auth_token', 'mock-jwt-token-' + Date.now());
        
        if (rememberMe) {
            localStorage.setItem('remember_me', 'true');
        } else {
            localStorage.removeItem('remember_me');
        }
        
        hideLoading();
        showToast(`خوش آمدید ${user.name}! 🎉`, 'success');
        
        // Redirect based on role
        const roleMap = {
            'parent': 'parent.html',
            'driver': 'driver.html',
            'school': 'school.html',
            'admin': 'admin.html'
        };
        
        setTimeout(() => {
            window.location.href = roleMap[role] || 'parent.html';
        }, 500);
        
        return { success: true, user };
        
    } catch (error) {
        hideLoading();
        showToast(error.message, 'error');
        return { success: false, error: error.message };
    }
}

// ============================================
// REGISTER
// ============================================
async function register(userData) {
    try {
        showLoading('در حال ثبت‌نام...');
        
        // Validate
        if (!userData.fullname || userData.fullname.length < 3) {
            throw new Error('نام و نام خانوادگی معتبر نیست');
        }
        
        if (!validatePhone(userData.phone)) {
            throw new Error('شماره موبایل نامعتبر است');
        }
        
        if (userData.password.length < 6) {
            throw new Error('رمز عبور باید حداقل ۶ کاراکتر باشد');
        }
        
        if (userData.password !== userData.confirmPassword) {
            throw new Error('رمز عبور و تکرار آن مطابقت ندارد');
        }
        
        if (!userData.role) {
            throw new Error('نقش خود را انتخاب کنید');
        }
        
        // Check if user exists (mock)
        const existing = localStorage.getItem(`user_${userData.phone}`);
        if (existing) {
            throw new Error('این شماره موبایل قبلاً ثبت شده است');
        }
        
        await sleep(1500);
        
        // Create user
        const user = {
            id: Date.now().toString(),
            name: userData.fullname,
            phone: userData.phone,
            role: userData.role,
            school: userData.school || 'دبستان پسرانه شماره ۱',
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.fullname)}&background=4F46E5&color=fff&size=128`,
            email: `${userData.phone}@myservice.ir`,
            createdAt: new Date().toISOString()
        };
        
        // Save user
        localStorage.setItem(`user_${userData.phone}`, JSON.stringify(user));
        localStorage.setItem('auth_user', JSON.stringify(user));
        localStorage.setItem('auth_token', 'mock-jwt-token-' + Date.now());
        
        AUTH.user = user;
        AUTH.isAuthenticated = true;
        
        hideLoading();
        showToast(`ثبت‌نام با موفقیت انجام شد! 🎉`, 'success');
        
        // Redirect based on role
        const roleMap = {
            'parent': 'parent.html',
            'driver': 'driver.html',
            'school': 'school.html'
        };
        
        setTimeout(() => {
            window.location.href = roleMap[user.role] || 'parent.html';
        }, 500);
        
        return { success: true, user };
        
    } catch (error) {
        hideLoading();
        showToast(error.message, 'error');
        return { success: false, error: error.message };
    }
}

// ============================================
// LOGOUT
// ============================================
function logout() {
    AUTH.user = null;
    AUTH.token = null;
    AUTH.isAuthenticated = false;
    
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
    
    if (!AUTH.rememberMe) {
        localStorage.removeItem('remember_me');
    }
    
    showToast('با موفقیت خارج شدید', 'info');
    
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 500);
}

// ============================================
// GUEST LOGIN
// ============================================
function guestLogin() {
    const guest = {
        id: 'guest',
        name: 'کاربر مهمان',
        role: 'parent',
        avatar: 'https://ui-avatars.com/api/?name=مهمان&background=6B7280&color=fff&size=128',
        isGuest: true
    };
    
    localStorage.setItem('guest_user', JSON.stringify(guest));
    AUTH.user = guest;
    AUTH.isAuthenticated = false;
    
    showToast('ورود به عنوان مهمان', 'info');
    window.location.href = 'parent.html';
}

// ============================================
// VALIDATION HELPERS
// ============================================
function validatePhone(phone) {
    return /^09[0-9]{9}$/.test(phone);
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password) {
    return password.length >= 6;
}

// ============================================
// UTILITY
// ============================================
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function showLoading(message = 'در حال بارگذاری...') {
    let overlay = document.querySelector('.loading-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div class="loading-spinner"></div>
            <p class="loading-text">${message}</p>
        `;
        document.body.appendChild(overlay);
    } else {
        overlay.querySelector('.loading-text').textContent = message;
        overlay.classList.remove('hidden');
    }
}

function hideLoading() {
    const overlay = document.querySelector('.loading-overlay');
    if (overlay) {
        overlay.classList.add('hidden');
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        }, 300);
    }
}

// ============================================
// AUTO INIT
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    initAuth();
    
    // Check if on login page
    if (window.location.pathname.includes('login.html') && AUTH.isAuthenticated) {
        // Redirect if already logged in
        const roleMap = {
            'parent': 'parent.html',
            'driver': 'driver.html',
            'school': 'school.html',
            'admin': 'admin.html'
        };
        window.location.href = roleMap[AUTH.user?.role] || 'parent.html';
    }
});

// ============================================
// EXPOSE
// ============================================
window.AUTH = AUTH;
window.login = login;
window.register = register;
window.logout = logout;
window.guestLogin = guestLogin;
window.validatePhone = validatePhone;
window.validateEmail = validateEmail;
window.validatePassword = validatePassword;