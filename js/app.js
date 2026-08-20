// ============================================
// APP CORE - Version 3.0
// ============================================

const APP = {
    name: 'سرویس من',
    version: '3.0.0',
    theme: localStorage.getItem('theme') || 'light',
    user: null,
    currentPage: 'dashboard',
    isLoaded: false,
    notifications: [],
    settings: {
        notifications: true,
        sound: true,
        language: 'fa',
        privacy: 'public'
    }
};

// ============================================
// DOM READY
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // Initialize preloader
    initPreloader();
    
    // Initialize theme
    initTheme();
    
    // Initialize AOS
    initAOS();
    
    // Initialize Typed.js
    initTyped();
    
    // Initialize Particles
    initParticles();
    
    // Initialize Swiper
    initSwiper();
    
    // Initialize navbar scroll
    initNavbarScroll();
    
    // Initialize mobile menu
    initMobileMenu();
    
    // Initialize stats counter
    initStatsCounter();
    
    // Initialize theme toggle
    initThemeToggle();
    
    // Initialize scroll animations
    initScrollAnimations();
    
    // Initialize service worker (PWA)
    initServiceWorker();
    
    // Mark app as loaded
    APP.isLoaded = true;
});

// ============================================
// PRELOADER
// ============================================
function initPreloader() {
    const preloader = document.getElementById('preloader');
    if (!preloader) return;
    
    window.addEventListener('load', function() {
        setTimeout(() => {
            preloader.classList.add('hidden');
        }, 800);
    });
    
    // Fallback - hide after 3 seconds
    setTimeout(() => {
        if (!preloader.classList.contains('hidden')) {
            preloader.classList.add('hidden');
        }
    }, 3000);
}

// ============================================
// THEME
// ============================================
function initTheme() {
    const theme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);
    APP.theme = theme;
    
    // Update theme toggle icon
    updateThemeIcon(theme);
}

function toggleTheme() {
    const themes = ['light', 'dark', 'night-blue', 'amber'];
    const currentIndex = themes.indexOf(APP.theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    const newTheme = themes[nextIndex];
    
    APP.theme = newTheme;
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    updateThemeIcon(newTheme);
    showToast(`تم "${getThemeName(newTheme)}" فعال شد`, 'success');
}

function getThemeName(theme) {
    const names = {
        'light': 'روشن',
        'dark': 'تاریک',
        'night-blue': 'آبی شب',
        'amber': 'کهربایی'
    };
    return names[theme] || theme;
}

function updateThemeIcon(theme) {
    const icons = {
        'light': 'fa-sun',
        'dark': 'fa-moon',
        'night-blue': 'fa-star',
        'amber': 'fa-fire'
    };
    
    document.querySelectorAll('.theme-toggle-btn .theme-icon').forEach(el => {
        el.className = `theme-icon fas ${icons[theme] || 'fa-sun'}`;
    });
}

// ============================================
// AOS - Animate On Scroll
// ============================================
function initAOS() {
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            once: true,
            offset: 100,
            easing: 'ease-out-cubic',
            delay: 50
        });
    }
}

// ============================================
// TYPED.JS
// ============================================
function initTyped() {
    const element = document.getElementById('hero-typed');
    if (!element || typeof Typed === 'undefined') return;
    
    new Typed(element, {
        strings: [
            'هوشمندتر از همیشه',
            'مدیریت هوشمند',
            'امن و قابل اعتماد',
            'ساده و کارآمد'
        ],
        typeSpeed: 50,
        backSpeed: 30,
        backDelay: 2000,
        loop: true,
        cursorChar: '|',
        smartBackspace: true
    });
}

// ============================================
// PARTICLES.JS
// ============================================
function initParticles() {
    const container = document.getElementById('particles-js');
    if (!container || typeof particlesJS === 'undefined') return;
    
    particlesJS('particles-js', {
        particles: {
            number: {
                value: 60,
                density: {
                    enable: true,
                    value_area: 800
                }
            },
            color: {
                value: ['#4F46E5', '#7C3AED', '#06B6D4']
            },
            shape: {
                type: 'circle',
                stroke: {
                    width: 0,
                    color: '#000000'
                }
            },
            opacity: {
                value: 0.3,
                random: true,
                anim: {
                    enable: true,
                    speed: 1,
                    opacity_min: 0.1,
                    sync: false
                }
            },
            size: {
                value: 3,
                random: true,
                anim: {
                    enable: true,
                    speed: 2,
                    size_min: 0.1,
                    sync: false
                }
            },
            line_linked: {
                enable: true,
                distance: 150,
                color: '#4F46E5',
                opacity: 0.2,
                width: 1
            },
            move: {
                enable: true,
                speed: 2,
                direction: 'none',
                random: false,
                straight: false,
                straight: false,
                out_mode: 'out',
                bounce: false,
                attract: {
                    enable: false,
                    rotateX: 600,
                    rotateY: 1200
                }
            }
        },
        interactivity: {
            detect_on: 'canvas',
            events: {
                onhover: {
                    enable: true,
                    mode: 'grab'
                },
                onclick: {
                    enable: true,
                    mode: 'push'
                },
                resize: true
            },
            modes: {
                grab: {
                    distance: 140,
                    line_linked: {
                        opacity: 0.5
                    }
                },
                push: {
                    particles_nb: 4
                }
            }
        },
        retina_detect: true
    });
}

// ============================================
// SWIPER
// ============================================
function initSwiper() {
    const container = document.querySelector('.testimonials-slider');
    if (!container || typeof Swiper === 'undefined') return;
    
    new Swiper(container, {
        slidesPerView: 1,
        spaceBetween: 24,
        loop: true,
        autoplay: {
            delay: 4000,
            disableOnInteraction: false
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true
        },
        breakpoints: {
            768: {
                slidesPerView: 2
            },
            1024: {
                slidesPerView: 3
            }
        }
    });
}

// ============================================
// NAVBAR SCROLL
// ============================================
function initNavbarScroll() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    
    let lastScroll = 0;
    
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        
        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    }, { passive: true });
}

// ============================================
// MOBILE MENU
// ============================================
function initMobileMenu() {
    const toggle = document.getElementById('navToggle');
    const menu = document.getElementById('navMenu');
    if (!toggle || !menu) return;
    
    toggle.addEventListener('click', function() {
        this.classList.toggle('active');
        menu.classList.toggle('open');
    });
    
    // Close menu on link click
    menu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function() {
            toggle.classList.remove('active');
            menu.classList.remove('open');
        });
    });
    
    // Close menu on outside click
    document.addEventListener('click', function(e) {
        if (!menu.contains(e.target) && !toggle.contains(e.target)) {
            toggle.classList.remove('active');
            menu.classList.remove('open');
        }
    });
}

// ============================================
// STATS COUNTER
// ============================================
function initStatsCounter() {
    const counters = document.querySelectorAll('.stat-number[data-count]');
    if (!counters.length) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.count);
                animateCounter(el, target);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.3 });
    
    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element, target) {
    const duration = 2000;
    const start = performance.now();
    const startValue = 0;
    
    function update(currentTime) {
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(eased * target);
        
        element.textContent = current.toLocaleString('fa-IR');
        
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = target.toLocaleString('fa-IR');
        }
    }
    
    requestAnimationFrame(update);
}

// ============================================
// THEME TOGGLE DROPDOWN
// ============================================
function initThemeToggle() {
    const toggleBtn = document.querySelector('.theme-toggle-btn');
    const dropdown = document.querySelector('.theme-dropdown');
    if (!toggleBtn || !dropdown) return;
    
    toggleBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        dropdown.classList.toggle('open');
    });
    
    // Theme options
    dropdown.querySelectorAll('.theme-option').forEach(option => {
        option.addEventListener('click', function() {
            const theme = this.dataset.theme;
            if (theme) {
                APP.theme = theme;
                document.documentElement.setAttribute('data-theme', theme);
                localStorage.setItem('theme', theme);
                updateThemeIcon(theme);
                dropdown.classList.remove('open');
                showToast(`تم "${getThemeName(theme)}" فعال شد`, 'success');
            }
        });
    });
    
    // Close dropdown on outside click
    document.addEventListener('click', function(e) {
        if (!dropdown.contains(e.target) && !toggleBtn.contains(e.target)) {
            dropdown.classList.remove('open');
        }
    });
}

// ============================================
// SCROLL ANIMATIONS
// ============================================
function initScrollAnimations() {
    const elements = document.querySelectorAll('.scroll-animate');
    if (!elements.length) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });
    
    elements.forEach(el => observer.observe(el));
}

// ============================================
// SERVICE WORKER (PWA)
// ============================================
function initServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('Service Worker registered successfully');
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    }
}

// ============================================
// TOAST SYSTEM
// ============================================
function showToast(message, type = 'info', duration = 3000) {
    const container = document.querySelector('.toast-container') || (() => {
        const div = document.createElement('div');
        div.className = 'toast-container';
        document.body.appendChild(div);
        return div;
    })();
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    toast.innerHTML = `
        <i class="fas ${icons[type] || icons.info}"></i>
        <span>${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('hide');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, duration);
}

// ============================================
// NAVIGATION
// ============================================
function navigateTo(page) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    
    // Show target page
    const targetPage = document.getElementById(`page-${page}`);
    if (targetPage) {
        targetPage.classList.add('active');
        APP.currentPage = page;
    }
    
    // Update nav links
    document.querySelectorAll('.sidebar-nav a, .bottom-nav a').forEach(link => {
        link.classList.toggle('active', link.dataset.page === page);
    });
    
    // Close sidebar on mobile
    const sidebar = document.getElementById('sidebar');
    if (sidebar && window.innerWidth <= 768) {
        sidebar.classList.remove('open');
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================
// SIDEBAR TOGGLE
// ============================================
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('open');
    }
}

// ============================================
// LOGOUT
// ============================================
function logout() {
    localStorage.removeItem('user');
    APP.user = null;
    showToast('با موفقیت خارج شدید', 'success');
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 500);
}

// ============================================
// MODAL
// ============================================
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// ============================================
// FAQ TOGGLE
// ============================================
function toggleFaq(element) {
    const item = element.closest('.faq-item');
    if (item) {
        item.classList.toggle('active');
        
        // Close other items
        const siblings = item.parentElement.querySelectorAll('.faq-item');
        siblings.forEach(sibling => {
            if (sibling !== item && sibling.classList.contains('active')) {
                sibling.classList.remove('active');
            }
        });
    }
}

// ============================================
// PASSWORD VISIBILITY
// ============================================
function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    
    const button = input.closest('.password-input')?.querySelector('.toggle-password');
    if (button) {
        button.querySelector('i').className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
    }
}

// ============================================
// EXPOSE GLOBALS
// ============================================
window.APP = APP;
window.showToast = showToast;
window.navigateTo = navigateTo;
window.toggleSidebar = toggleSidebar;
window.logout = logout;
window.openModal = openModal;
window.closeModal = closeModal;
window.toggleFaq = toggleFaq;
window.toggleTheme = toggleTheme;
window.togglePasswordVisibility = togglePasswordVisibility;