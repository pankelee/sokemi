/**
 * SOKEMI Pet Shop - Interactive Scripts
 */
 

document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu Toggle
    initMobileMenu();
    
    // Smooth Scroll
    initSmoothScroll();
    
    // Header Scroll Effect
    initHeaderScroll();
    
    // Card Hover Effects
    initCardEffects();
    
    // Search Focus Effect
    initSearchFocus();
    
    // Newsletter Form
    initNewsletterForm();
});

/**
 * Mobile Menu Functionality
 */
function initMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const menuClose = document.querySelector('.mobile-menu-close');
    const mobileMenu = document.querySelector('.mobile-menu');
    const overlay = document.querySelector('.mobile-overlay');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');
    
    if (!menuBtn || !mobileMenu) return;
    
    function openMenu() {
        mobileMenu.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Animate hamburger to X
        const spans = menuBtn.querySelectorAll('span');
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    }
    
    function closeMenu() {
        mobileMenu.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
        
        // Reset hamburger
        const spans = menuBtn.querySelectorAll('span');
        spans[0].style.transform = '';
        spans[1].style.opacity = '1';
        spans[2].style.transform = '';
    }
    
    menuBtn.addEventListener('click', openMenu);
    menuClose.addEventListener('click', closeMenu);
    overlay.addEventListener('click', closeMenu);
    
    // Close menu when clicking on links
    mobileLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });
    
    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
            closeMenu();
        }
    });
}

/**
 * Smooth Scroll for Anchor Links
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/**
 * Header Scroll Effect
 */
function initHeaderScroll() {
    const header = document.querySelector('.header');
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        // Add shadow on scroll
        if (currentScroll > 10) {
            header.style.boxShadow = '0 4px 20px rgba(5, 98, 164, 0.15)';
        } else {
            header.style.boxShadow = '0 2px 8px rgba(5, 98, 164, 0.1)';
        }
        
        lastScroll = currentScroll;
    });
}

/**
 * Card Hover Effects
 */
function initCardEffects() {
    const cards = document.querySelectorAll('.card, .popular-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.zIndex = '10';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.zIndex = '';
        });
    });
}

/**
 * Search Focus Effect
 */
function initSearchFocus() {
    const searchInput = document.querySelector('.search-input');
    const searchWrapper = document.querySelector('.search-wrapper');
    
    if (!searchInput || !searchWrapper) return;
    
    searchInput.addEventListener('focus', () => {
        searchWrapper.style.transform = 'scale(1.02)';
    });
    
    searchInput.addEventListener('blur', () => {
        searchWrapper.style.transform = 'scale(1)';
    });
}

/**
 * Newsletter Form
 */
function initNewsletterForm() {
    const form = document.querySelector('.newsletter-form');
    const input = document.querySelector('.newsletter-input');
    
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = input.value.trim();
        
        if (!email) {
            showNotification('Пожалуйста, введите email', 'error');
            return;
        }
        
        if (!isValidEmail(email)) {
            showNotification('Пожалуйста, введите корректный email', 'error');
            return;
        }
        
        // Simulate form submission
        showNotification('Спасибо за подписку!', 'success');
        input.value = '';
    });
}

/**
 * Email Validation
 */
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Show Notification
 */
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span class="notification-message">${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    // Styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#5fa8d3'};
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        gap: 16px;
        z-index: 10000;
        font-family: 'Inter', sans-serif;
        font-size: 14px;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Close button
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
    });
    
    // Auto remove
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// Add notification animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        opacity: 0.8;
        transition: opacity 0.2s;
    }
    
    .notification-close:hover {
        opacity: 1;
    }
`;
document.head.appendChild(style);

/**
 * Intersection Observer for Scroll Animations
 */
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe sections
document.querySelectorAll('.catalog, .popular').forEach(section => {
    section.style.opacity = '0.9';
    section.style.transform = 'translateY(10px)';
    section.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(section);
});

/**
 * Cart Button Click
 */
document.querySelectorAll('.cart-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        showNotification('Корзина пока пуста', 'info');
    });
});

/**
 * Lazy Loading for Images
 */
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src || img.src;
                img.classList.add('loaded');
                imageObserver.unobserve(img);
            }
        });
    });
    
    document.querySelectorAll('img').forEach(img => {
        imageObserver.observe(img);
    });
    
}
/* ===== UNIVERSAL CART BADGE ===== */

document.addEventListener("DOMContentLoaded", () => {
    updateCartBadge();
});

function updateCartBadge() {
    const badge = document.getElementById("cart-count-badge");
    if (!badge) return;

    const cart = readCartSafe();
    const uniqueCount = cart.reduce((sum, item) => {
        const qty = Number(item?.quantity) || 0;
        return qty > 0 ? sum + 1 : sum;
    }, 0);

    badge.textContent = uniqueCount > 0 ? String(uniqueCount) : "";
}

/* автообновление если localStorage меняется */
window.addEventListener("storage", updateCartBadge);

initCartBadgeAutoUpdate();

function readCartSafe() {
    try {
        const raw = localStorage.getItem("cart");
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function initCartBadgeAutoUpdate() {
    if (window.__sokemiCartBadgeHooked) return;
    window.__sokemiCartBadgeHooked = true;

    const originalSetItem = localStorage.setItem.bind(localStorage);
    const originalRemoveItem = localStorage.removeItem.bind(localStorage);
    const originalClear = localStorage.clear.bind(localStorage);

    localStorage.setItem = (key, value) => {
        originalSetItem(key, value);
        if (key === "cart") updateCartBadge();
    };

    localStorage.removeItem = (key) => {
        originalRemoveItem(key);
        if (key === "cart") updateCartBadge();
    };

    localStorage.clear = () => {
        originalClear();
        updateCartBadge();
    };

    document.addEventListener("cart:updated", updateCartBadge);
}

console.log('🐾 SOKEMI Pet Shop loaded successfully!');
